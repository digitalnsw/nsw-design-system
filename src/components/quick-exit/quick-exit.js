import stickyContainer, { updateStickyBodyPadding } from '../../global/scripts/sticky-container'
import { cleanHTMLStrict } from '../../global/scripts/helpers/sanitize'
import { validateUrl } from '../../global/scripts/helpers/utilities'

/* eslint-disable max-len */
/**
 * Quick Exit (lean)
 * - Looks for a manually-authored element inside the sticky container and enhances it.
 * - If initialised programmatically and no element exists, creates one and appends it to the sticky container.
 * - Primary action is an <a> so it works without JS; JS enhances to open the safe URL in a new tab (falling back to the current tab if pop-ups are blocked).
 * - Optional progressive features: double-Esc, auto-focus first, URL sanitisation.
 */
/** internal no-op to satisfy lint when intentionally swallowing errors */

function ignoreError() {}

// Helpers shared by QuickExit keyboard behaviour
function quickExitIsEditable(el) {
  if (!el) return false
  const tag = el.tagName && el.tagName.toLowerCase()
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return true
  if (el.isContentEditable) return true
  // Common ARIA widgets that own Esc / focus behaviour (e.g., autocomplete/combobox/popups)
  const role = el.getAttribute && el.getAttribute('role')
  if (role === 'combobox' || role === 'dialog' || role === 'menu' || role === 'listbox') return true
  return false
}

function quickExitModalOpen() {
  try {
    if (document.querySelector('dialog[open]')) return true
    if (document.querySelector('[role="dialog"][aria-modal="true"]')) return true
    return false
  } catch (err) {
    ignoreError(err)
    return false
  }
}

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
      description = 'Leave quickly using this banner or press <kbd>Esc</kbd> 2 times.',
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
      })
      container.appendChild(root)
    } else {
      // Update existing markup so the latest init wins
      root.href = safeUrl
      root.rel = 'nofollow noopener'
      root.setAttribute('aria-label', 'Quick exit')

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
        const frag = cleanHTMLStrict(description, true, {
          allowedTags: ['span', 'kbd', 'strong', 'em', 'br'],
          allowedAttributes: { kbd: ['aria-label'] },
        })
        descEl.appendChild(frag)
        // Ensure keyboard instructions remain accessible even if aria-label was omitted
        descEl.querySelectorAll('kbd').forEach((k) => {
          if (!k.hasAttribute('aria-label')) {
            k.setAttribute('aria-label', 'Escape key')
          }
        })
      } catch (err) {
        ignoreError(err)
      }
    }

    QuickExit.enhance(root, {
      safeUrl,
      safePageTitle,
      enableEsc,
      enableCloak,
      focusFirst,
    })

    // Adjust body padding for sticky shell
    updateStickyBodyPadding()
  }

  /**
   * Build minimal, no-JS friendly markup
   */
  static buildMarkup({
    description,
    safeUrl,
  }) {
    const root = document.createElement('a')
    root.className = 'nsw-quick-exit nsw-quick-exit__dark'
    root.href = safeUrl
    root.rel = 'nofollow noopener'
    root.setAttribute('aria-label', 'Quick exit')

    const desc = document.createElement('span')
    desc.className = 'nsw-quick-exit__description-text'
    desc.id = 'nsw-quick-exit__desc'
    const frag = cleanHTMLStrict(description, true, {
      allowedTags: ['span', 'kbd', 'strong', 'em', 'br'],
      allowedAttributes: { kbd: ['aria-label'] },
    })
    desc.appendChild(frag)
    // Ensure keyboard instructions are accessible by default
    desc.querySelectorAll('kbd').forEach((k) => {
      if (!k.hasAttribute('aria-label')) {
        k.setAttribute('aria-label', 'Escape key')
      }
    })

    const exit = document.createElement('span')
    exit.className = 'nsw-quick-exit__exit-text'
    exit.textContent = 'Exit now'

    const content = document.createElement('div')
    content.className = 'nsw-quick-exit__content'
    content.appendChild(desc)
    content.appendChild(exit)

    root.appendChild(content)
    root.setAttribute('aria-describedby', desc.id)
    if (!root.id) root.id = 'nsw-quick-exit'
    return root
  }

  /**
   * Progressive enhancement (click logic, keyboard, cloak, focus)
   */
  static enhance(
    root,
    {
      safeUrl,
      enableEsc,
      enableCloak,
      focusFirst,
      safePageTitle,
    },
  ) {
    const node = root
    // always use dark theme
    node.classList.remove('nsw-quick-exit__dark', 'nsw-quick-exit__light')
    node.classList.add('nsw-quick-exit__dark')
    node.setAttribute('data-theme', 'dark')

    const cta = node

    const content = node.querySelector('.nsw-quick-exit__content')
    let desc = null
    if (content) {
      desc = content.querySelector('.nsw-quick-exit__description-text')
    }
    if (!desc) {
      desc = document.createElement('span')
      desc.className = 'nsw-quick-exit__description-text'
      if (content) {
        content.insertBefore(desc, content.firstChild)
      } else {
        node.insertBefore(desc, node.firstChild)
      }
    }
    if (!desc.id) desc.id = 'nsw-quick-exit__desc'
    node.setAttribute('aria-describedby', desc.id)

    // Ensure exit-text is inside content div
    let exit = null
    if (content) {
      exit = content.querySelector('.nsw-quick-exit__exit-text')
      if (!exit) {
        exit = document.createElement('span')
        exit.className = 'nsw-quick-exit__exit-text'
        exit.textContent = 'Exit now'
        content.appendChild(exit)
      }
    } else {
      // No content div, fallback: create content div and move desc and exit inside
      const newContent = document.createElement('div')
      newContent.className = 'nsw-quick-exit__content'

      // Move desc inside newContent
      if (desc.parentNode === node) {
        newContent.appendChild(desc)
      }
      // Create exit if missing
      exit = node.querySelector('.nsw-quick-exit__exit-text')
      if (!exit) {
        exit = document.createElement('span')
        exit.className = 'nsw-quick-exit__exit-text'
        exit.textContent = 'Exit now'
      }
      newContent.appendChild(exit)

      node.appendChild(newContent)
    }

    // Progressive behaviour: always open safe URL in the current tab
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
        window.location.assign(SAFE)
      } catch (errC) {
        ignoreError(errC)
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
    QuickExit.ensureSkipLink(node)
  }

  static bindDoubleEsc(callback) {
    let pressCount = 0
    let timerId = null
    const TIME_WINDOW = 1000

    const isEscapeKey = ({ key, keyCode }) => (
      key === 'Escape' || key === 'Esc' || keyCode === 27
    )

    // Helpers to decide if QE should defer to other UI

    const handleKeydown = (event) => {
      const {
        key, keyCode, defaultPrevented, target,
      } = event
      if (!isEscapeKey({ key, keyCode })) return

      // If another component has already claimed Esc, or focus is in an editable/modal context, defer.
      if (defaultPrevented) return
      if (quickExitIsEditable(target) || quickExitModalOpen()) return

      pressCount += 1
      if (timerId) clearTimeout(timerId)

      if (pressCount >= 2) {
        try {
          event.preventDefault()
        } catch (err) {
          ignoreError(err)
        }
        // When Quick Exit triggers (two Esc presses), prevent the default Esc behaviour
        // but do NOT call stopImmediatePropagation; other listeners will still receive the event.
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

  static ensureSkipLink(rootEl) {
    try {
      if (!rootEl) return
      const root = rootEl
      const qeId = root.id || 'nsw-quick-exit'
      if (!root.id) root.id = qeId

      const skip = document.querySelector('.nsw-skip')
      if (!skip) return

      // If a skip link to this Quick Exit already exists, do nothing
      const existing = skip.querySelector(`a[href="#${qeId}"]`)
      if (existing) return

      const link = document.createElement('a')
      link.href = `#${qeId}`
      link.setAttribute('aria-label', 'Quick exit is available on this page. You can leave at any time by pressing the Escape key two times.')
      const span = document.createElement('span')
      span.textContent = 'Skip to quick exit'
      link.appendChild(span)

      // Insert as the first link in the skip nav
      if (skip.firstChild) {
        skip.insertBefore(link, skip.firstChild)
      } else {
        skip.appendChild(link)
      }
    } catch (err) {
      ignoreError(err)
    }
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

    // Latest initialised Quick Exit becomes the first-Tab target.
    // firstTabHandled is global so we only hijack the very first Tab press per page load.
    firstTabTarget = node

    if (firstTabHandlerBound) return

    // Removed duplicated isEditable and modalOpen, use shared helpers instead

    const handleKeydown = (event) => {
      const {
        key, keyCode, defaultPrevented, target,
      } = event

      const isTab = key === 'Tab' || keyCode === 9
      if (!isTab) return
      if (firstTabHandled) return
      if (defaultPrevented) return
      if (!firstTabTarget) return
      if (quickExitIsEditable(target) || quickExitModalOpen()) return

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
      // Use current content and attributes; just wire behaviour with sensible defaults
      const href = existingRoot.getAttribute('href') || 'https://www.google.com/webhp'
      QuickExit.enhance(existingRoot, {
        safeUrl: href,
        safePageTitle: (
          (opts && opts.safePageTitle)
          || existingRoot.getAttribute('data-safe-page-title')
          || 'NSW Government'
        ),
        enableEsc: (typeof opts.enableEsc === 'boolean') ? opts.enableEsc : true,
        enableCloak: (typeof opts.enableCloak === 'boolean') ? opts.enableCloak : true,
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

      const enableCloak = (typeof opts.enableCloak === 'boolean') ? opts.enableCloak : true
      const attrSafeTitle = el.getAttribute('data-safe-page-title')

      QuickExit.init({
        safeUrl: opts.safeUrl || 'https://www.google.com/webhp',
        safePageTitle: attrSafeTitle || opts.safePageTitle || 'NSW Government',
        description: opts.description || 'Leave quickly using this banner or press <kbd>Esc</kbd> 2 times.',
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
