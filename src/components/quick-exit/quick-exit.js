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

export default class QuickExit {
  /**
   * Enhance or create a Quick Exit inside the sticky container
   */
  static init(
    {
      safeUrl = 'https://www.google.com/webhp',
      safeTitle = 'NSW Government',
      description = 'Select <strong>Exit now</strong> or press the <kbd>Esc</kbd> key 2 times. This won\'t clear your internet history.', /* ignore */
      exitLabel = 'Exit now',
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
      // Create fresh markup
      root = QuickExit.buildMarkup({
        description, exitLabel, safeUrl, theme,
      })
      container.appendChild(root)
    } else {
      // Update existing markup so the latest init wins
      const descEl = root.querySelector('.nsw-quick-exit__description') || document.createElement('p')
      if (!descEl.id) descEl.id = 'nsw-quick-exit__desc'
      if (!descEl.classList.contains('nsw-quick-exit__description')) descEl.classList.add('nsw-quick-exit__description')
      // Replace description content
      try {
        while (descEl.firstChild) descEl.removeChild(descEl.firstChild)
        const frag = cleanHTMLStrict(description, true, { allowedTags: ['span', 'kbd', 'strong', 'em', 'br'] })
        descEl.appendChild(frag)
      } catch (err) { /* ignore error */ }
      // Ensure description is mounted
      const contentEl = root.querySelector('.nsw-quick-exit__content') || document.createElement('div')
      if (!contentEl.classList.contains('nsw-quick-exit__content')) contentEl.classList.add('nsw-quick-exit__content')
      if (!contentEl.contains(descEl)) contentEl.appendChild(descEl)
      const wrapperEl = root.querySelector('.nsw-quick-exit__wrapper') || document.createElement('div')
      if (!wrapperEl.classList.contains('nsw-quick-exit__wrapper')) wrapperEl.classList.add('nsw-quick-exit__wrapper')
      if (!root.contains(wrapperEl)) root.appendChild(wrapperEl)
      if (!wrapperEl.contains(contentEl)) wrapperEl.appendChild(contentEl)
      // Update CTA
      let link = root.querySelector('.nsw-quick-exit__cta')
      if (!link) {
        link = document.createElement('a')
        link.className = 'nsw-quick-exit__cta'
        wrapperEl.appendChild(link)
      }
      link.href = safeUrl
      link.rel = 'nofollow noopener'
      link.textContent = exitLabel
      link.setAttribute('aria-describedby', 'nsw-quick-exit__desc')
    }

    QuickExit.enhance(root, {
      safeUrl,
      safeTitle,
      theme,
      enableEsc,
      enableCloak,
      focusFirst,
      exitLabel,
    })

    // Adjust body padding for sticky shell
    updateStickyBodyPadding()
  }

  /**
   * Build minimal, no‑JS friendly markup
   */
  static buildMarkup({
    description, exitLabel, safeUrl, theme,
  }) {
    const root = document.createElement('section')
    root.className = `nsw-quick-exit nsw-quick-exit__${theme === 'dark' ? 'dark' : 'light'}`

    const wrapper = document.createElement('div')
    wrapper.className = 'nsw-quick-exit__wrapper'

    const content = document.createElement('div')
    content.className = 'nsw-quick-exit__content'

    const p = document.createElement('p')
    p.className = 'nsw-quick-exit__description'
    p.id = 'nsw-quick-exit__desc'
    const frag = cleanHTMLStrict(description, true, { allowedTags: ['span', 'kbd', 'strong', 'em', 'br'] })
    p.appendChild(frag)

    const a = document.createElement('a')
    a.className = 'nsw-quick-exit__cta'
    a.href = safeUrl
    a.rel = 'nofollow noopener'
    a.textContent = exitLabel
    a.setAttribute('aria-describedby', 'nsw-quick-exit__desc')

    content.appendChild(p)
    wrapper.appendChild(content)
    wrapper.appendChild(a)
    root.appendChild(wrapper)
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
      exitLabel,
      safeTitle,
    },
  ) {
    const node = root
    // theme toggle (normalise classes)
    node.classList.remove('nsw-quick-exit__dark', 'nsw-quick-exit__light')
    node.classList.add(theme === 'dark' ? 'nsw-quick-exit__dark' : 'nsw-quick-exit__light')
    node.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light')

    // Ensure markup pieces exist
    const wrapper = node.querySelector('.nsw-quick-exit__wrapper') || document.createElement('div')
    if (!wrapper.classList.contains('nsw-quick-exit__wrapper')) wrapper.classList.add('nsw-quick-exit__wrapper')
    if (!node.contains(wrapper)) node.appendChild(wrapper)

    const desc = node.querySelector('.nsw-quick-exit__description') || document.createElement('p')
    if (!desc.id) desc.id = 'nsw-quick-exit__desc'
    if (!desc.classList.contains('nsw-quick-exit__description')) desc.classList.add('nsw-quick-exit__description')
    if (!wrapper.contains(desc)) wrapper.appendChild(desc)

    let cta = node.querySelector('.nsw-quick-exit__cta')
    if (!cta) {
      const link = document.createElement('a')
      link.className = 'nsw-quick-exit__cta'
      link.href = safeUrl
      link.rel = 'nofollow noopener'
      link.textContent = exitLabel
      link.setAttribute('aria-describedby', 'nsw-quick-exit__desc')
      cta = link
      wrapper.appendChild(cta)
    }

    // Progressive behaviour: open safe URL in a new tab *and* change current tab
    const SAFE = validateUrl(safeUrl)
    cta.addEventListener('click', (ev) => {
      try {
        ev.preventDefault()
      } catch (errA) {
        ignoreError(errA)
      }
      // Cloak immediately for perceived privacy (if enabled)
      if (enableCloak) QuickExit.applyCloak()
      try {
        document.title = safeTitle || document.title
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
    const focus = () => {
      try {
        node.focus({ preventScroll: true })
      } catch (errD) {
        try {
          node.focus()
        } catch (errE) {
          ignoreError(errE)
        }
      }
    }
    const arrivedBF = (() => {
      try {
        const nav = performance.getEntriesByType('navigation')[0]; return nav && nav.type === 'back_forward'
      } catch (errT) {
        ignoreError(errT)
        return false
      }
    })()
    const should = !arrivedBF && !window.location.hash && (!document.activeElement || document.activeElement === document.body)
    if (should) setTimeout(focus, 0)
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
      // Use current content and attributes; just wire behaviour with sensible defaults
      const link = existingRoot.querySelector('.nsw-quick-exit__cta')
      const href = (link && link.getAttribute('href')) || 'https://www.google.com/webhp'
      QuickExit.enhance(existingRoot, {
        safeUrl: href,
        safeTitle: 'NSW Government',
        theme: (existingRoot.getAttribute('data-theme') || 'light'),
        enableEsc: true,
        enableCloak: true,
        focusFirst: true,
        exitLabel: (link && link.textContent) || 'Exit now',
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

      QuickExit.init({
        safeUrl: opts.safeUrl || 'https://www.google.com/webhp',
        safeTitle: opts.safeTitle || 'NSW Government',
        description: opts.description || 'Select <strong>Exit now</strong> or press the <kbd>Esc</kbd> key 2 times. This won\'t clear your internet history.',
        exitLabel: opts.exitLabel || 'Exit now',
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
