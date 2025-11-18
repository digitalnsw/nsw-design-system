import stickyContainer, { updateStickyBodyPadding } from '../../global/scripts/sticky-container'
import { cleanHTMLStrict } from '../../global/scripts/helpers/sanitize'
import { validateUrl } from '../../global/scripts/helpers/utilities'

/* eslint-disable max-len */
/**
 * Quick Exit (lean)
 * - Looks for a manually-authored element inside the sticky container and enhances it.
 * - If initialised programmatically and no element exists, creates one and appends it to the sticky container.
 * - Primary action is an <a> so it works without JS; JS enhances to open safe URL in a new tab and replace current tab.
 * - Optional progressive features: double-Esc, auto-focus first, URL sanitisation.
 */
/** internal no-op to satisfy lint when intentionally swallowing errors */

function ignoreError() {}

// Track first-Tab behaviour so we can move focus to Quick Exit
let firstTabTarget = null
let firstTabHandlerBound = false
let firstTabHandled = false

export default class QuickExit {
  /**
   * Enhance or create a Quick Exit inside the sticky container
   */
  static init(
    {
      safeUrl = 'https://www.google.com/webhp',
      safePageTitle = 'NSW Government',
      description = 'Select <strong>Exit now</strong> or press the <kbd>Esc</kbd> key 2 times. This won\'t clear your internet history.',
      theme = 'light', // 'light' | 'dark'
      enableEsc = true,
      enableCloak = true,
      focusFirst = true,
    } = {},
  ) {
    const container = stickyContainer()
    if (!container) return

    let root = container.querySelector('.nsw-quick-exit')
    if (!root) {
      // Create fresh markup using the simple contract: <a> + description + exit label
      root = QuickExit.buildMarkup({
        description,
        safeUrl,
        theme,
      })
      container.appendChild(root)
    } else {
      // Update existing markup so the latest init wins
      root.href = safeUrl
      root.rel = 'nofollow noopener'

      let descEl = root.querySelector('.nsw-quick-exit__description-text')
      if (!descEl) {
        descEl = document.createElement('span')
        descEl.className = 'nsw-quick-exit__description-text'
        root.insertBefore(descEl, root.firstChild)
      }
      if (!descEl.id) descEl.id = 'nsw-quick-exit__desc'
      root.setAttribute('aria-describedby', descEl.id)

      try {
        while (descEl.firstChild) descEl.removeChild(descEl.firstChild)
        const frag = cleanHTMLStrict(description, true, { allowedTags: ['span', 'kbd', 'strong', 'em', 'br'] })
        descEl.appendChild(frag)
      } catch (err) {
        ignoreError(err)
      }
    }

    QuickExit.enhance(root, {
      safeUrl,
      safePageTitle,
      theme,
      enableEsc,
      enableCloak,
      focusFirst,
    })

    // Adjust body padding for sticky shell
    updateStickyBodyPadding()
  }

  /**
   * Build minimal, no‑JS friendly markup
   */
  static buildMarkup({
    description,
    safeUrl,
    theme,
  }) {
    const root = document.createElement('a')
    root.className = `nsw-quick-exit nsw-quick-exit__${theme === 'dark' ? 'dark' : 'light'}`
    root.href = safeUrl
    root.rel = 'nofollow noopener'

    const desc = document.createElement('span')
    desc.className = 'nsw-quick-exit__description-text'
    desc.id = 'nsw-quick-exit__desc'
    const frag = cleanHTMLStrict(description, true, { allowedTags: ['span', 'kbd', 'strong', 'em', 'br'] })
    desc.appendChild(frag)

    const exit = document.createElement('span')
    exit.className = 'nsw-quick-exit__exit-text'
    exit.textContent = 'Exit now'

    root.appendChild(desc)
    root.appendChild(exit)
    root.setAttribute('aria-describedby', desc.id)
    return root
  }

  /**
   * Progressive enhancement (click logic, keyboard, cloak, focus)
   */
  static enhance(
    root,
    {
      safeUrl,
      theme,
      enableEsc,
      enableCloak,
      focusFirst,
      safePageTitle,
    },
  ) {
    const node = root
    // theme toggle (normalise classes)
    node.classList.remove('nsw-quick-exit__dark', 'nsw-quick-exit__light')
    node.classList.add(theme === 'dark' ? 'nsw-quick-exit__dark' : 'nsw-quick-exit__light')
    node.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light')

    const cta = node

    let desc = node.querySelector('.nsw-quick-exit__description-text')
    if (!desc) {
      desc = document.createElement('span')
      desc.className = 'nsw-quick-exit__description-text'
      node.insertBefore(desc, node.firstChild)
    }
    if (!desc.id) desc.id = 'nsw-quick-exit__desc'
    node.setAttribute('aria-describedby', desc.id)

    // Progressive behaviour: open safe URL in a new tab *and* change current tab
    const SAFE = validateUrl(safeUrl)
    cta.addEventListener('click', (ev) => {
      try {
        ev.preventDefault()
      } catch (errA) {
        ignoreError(errA)
      }
      if (enableCloak) QuickExit.applyCloak()
      try {
        document.title = safePageTitle || document.title
      } catch (errT) {
        ignoreError(errT)
      }

      try {
        window.open(SAFE, '_blank', 'noopener,noreferrer')
      } catch (errB) {
        ignoreError(errB)
      }
    })

    // Optional keyboard: double ESC (bind once per component)
    if (enableEsc && node.getAttribute('data-esc-bound') !== 'true') {
      QuickExit.bindDoubleEsc(() => cta.click())
      node.setAttribute('data-esc-bound', 'true')
    }

    // Optional focus-first
    if (focusFirst) QuickExit.focusFirst(cta)

    // Mark ready (singleton) and ensure visibility
    node.setAttribute('data-ready', 'true')
    node.style.display = 'block'
  }

  static bindDoubleEsc(callback) {
    let pressCount = 0
    let timerId = null
    const TIME_WINDOW = 1000

    const isEscapeKey = ({ key, keyCode }) => (
      key === 'Escape' || key === 'Esc' || keyCode === 27
    )

    // Helpers to decide if QE should defer to other UI
    const isEditable = (el) => {
      if (!el) return false
      const tag = el.tagName && el.tagName.toLowerCase()
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return true
      if (el.isContentEditable) return true
      // Common ARIA widgets that own Esc (e.g., autocomplete/combobox/popups)
      const role = el.getAttribute && el.getAttribute('role')
      if (role === 'combobox' || role === 'dialog' || role === 'menu' || role === 'listbox') return true
      return false
    }

    const modalOpen = () => {
      try {
        if (document.querySelector('dialog[open]')) return true
        if (document.querySelector('[role="dialog"][aria-modal="true"]')) return true
        return false
      } catch (err) {
        ignoreError(err)
        return false
      }
    }

    const handleKeydown = (event) => {
      const {
        key, keyCode, defaultPrevented, target,
      } = event
      if (!isEscapeKey({ key, keyCode })) return

      // If another component has already claimed Esc, or focus is in an editable/modal context, defer.
      if (defaultPrevented) return
      if (isEditable(target) || modalOpen()) return

      pressCount += 1
      if (timerId) clearTimeout(timerId)

      if (pressCount >= 2) {
        try {
          event.preventDefault()
        } catch (err) {
          ignoreError(err)
        }
        // Do NOT call stopImmediatePropagation here; allow other listeners to continue.
        callback()
        pressCount = 0
        timerId = null
      } else {
        timerId = setTimeout(() => {
          pressCount = 0
          timerId = null
        }, TIME_WINDOW)
      }
    }

    // Capture phase so we still receive ESC even if other components stop propagation,
    // but we won't suppress them unless we actually trigger QE (and even then we don't stop propagation).
    document.addEventListener('keydown', handleKeydown, true)
  }

  static applyCloak() {
    try {
      document.documentElement.style.setProperty('display', 'none', 'important')
    } catch (errC) {
      ignoreError(errC)
    }
  }

  static focusFirst(node) {
    if (typeof document === 'undefined') return

    // Always let the latest initialised Quick Exit win as the first-Tab target
    firstTabTarget = node

    if (firstTabHandlerBound) return

    const isEditable = (el) => {
      if (!el) return false
      const tag = el.tagName && el.tagName.toLowerCase()
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return true
      if (el.isContentEditable) return true
      const role = el.getAttribute && el.getAttribute('role')
      if (role === 'combobox' || role === 'dialog' || role === 'menu' || role === 'listbox') return true
      return false
    }

    const modalOpen = () => {
      try {
        if (document.querySelector('dialog[open]')) return true
        if (document.querySelector('[role="dialog"][aria-modal="true"]')) return true
        return false
      } catch (err) {
        ignoreError(err)
        return false
      }
    }

    const handleKeydown = (event) => {
      const {
        key, keyCode, defaultPrevented, target,
      } = event

      const isTab = key === 'Tab' || keyCode === 9
      if (!isTab) return
      if (firstTabHandled) return
      if (defaultPrevented) return
      if (!firstTabTarget) return
      if (isEditable(target) || modalOpen()) return

      firstTabHandled = true

      try {
        event.preventDefault()
      } catch (errP) {
        ignoreError(errP)
      }

      try {
        firstTabTarget.focus({ preventScroll: true })
      } catch (errD) {
        try {
          firstTabTarget.focus()
        } catch (errE) {
          ignoreError(errE)
        }
      }
    }

    document.addEventListener('keydown', handleKeydown, true)
    firstTabHandlerBound = true
  }

  /**
   * Enhance any existing QE in the container (no declarative parsing).
   */
  static autoInit() {
    const container = stickyContainer()
    if (!container) return
    if (container.querySelector('.nsw-quick-exit[data-ready="true"]')) return

    const existingRoot = container.querySelector('.nsw-quick-exit')
    if (existingRoot) {
      // Parse data-options if present
      const optAttr = existingRoot.getAttribute('data-options')
      let opts = {}
      if (optAttr && optAttr.trim()) {
        try {
          opts = JSON.parse(optAttr)
        } catch (parseErr) {
          ignoreError(parseErr)
        }
      }
      // Derive theme from existing attributes/classes; default to light only if nothing is set
      let theme = existingRoot.getAttribute('data-theme')
      if (!theme) {
        if (existingRoot.classList.contains('nsw-quick-exit__dark')) theme = 'dark'
        else if (existingRoot.classList.contains('nsw-quick-exit__light')) theme = 'light'
        else theme = 'light'
      }
      // Use current content and attributes; just wire behaviour with sensible defaults
      const href = existingRoot.getAttribute('href') || 'https://www.google.com/webhp'
      QuickExit.enhance(existingRoot, {
        safeUrl: href,
        safePageTitle: (
          (opts && opts.safePageTitle)
          || existingRoot.getAttribute('data-safe-page-title')
          || 'NSW Government'
        ),
        theme,
        enableEsc: (typeof opts.enableEsc === 'boolean') ? opts.enableEsc : true,
        enableCloak: (() => {
          if (typeof opts.enableCloak === 'boolean') return opts.enableCloak
          if (typeof opts.cloakMode === 'string') return opts.cloakMode !== 'none'
          return true
        })(),
        focusFirst: true,
      })
      updateStickyBodyPadding()
    }
  }

  /**
   * Initialise from an element with a `data-options` JSON attribute.
   * Used by docs/kitchen-sink demo buttons.
   */
  static fromElement(el) {
    try {
      if (!el) return
      const attr = el.getAttribute('data-options')
      let opts = {}
      if (attr && attr.trim()) {
        try {
          opts = JSON.parse(attr)
        } catch (parseErr) {
          ignoreError(parseErr)
        }
      }

      // Map legacy cloakMode to enableCloak (anything except 'none' = true)
      let enableCloak = true
      if (typeof opts.enableCloak === 'boolean') enableCloak = opts.enableCloak
      else if (typeof opts.cloakMode === 'string') enableCloak = opts.cloakMode !== 'none'

      const attrSafeTitle = el.getAttribute('data-safe-page-title')

      QuickExit.init({
        safeUrl: opts.safeUrl || 'https://www.google.com/webhp',
        safePageTitle: attrSafeTitle || opts.safePageTitle || 'NSW Government',
        description: opts.description || 'Select <strong>Exit now</strong> or press the <kbd>Esc</kbd> key 2 times. This won\'t clear your internet history.',
        theme: opts.theme || 'light',
        enableEsc: (typeof opts.enableEsc === 'boolean') ? opts.enableEsc : true,
        enableCloak,
        focusFirst: (typeof opts.focusFirst === 'boolean') ? opts.focusFirst : true,
      })
    } catch (err) {
      ignoreError(err)
      // Swallow errors to avoid breaking demo pages
    }
  }
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => QuickExit.autoInit())
  } else {
    QuickExit.autoInit()
  }
}
