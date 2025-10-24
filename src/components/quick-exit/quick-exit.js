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
export default class QuickExit {
  /**
   * Enhance or create a Quick Exit inside the sticky container
   */
  static init(
    {
      safeUrl = 'https://www.google.com/webhp',
      secondarySafeUrl = 'https://www.bom.gov.au/',
      title = 'Leave this site quickly',
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

    // Singleton guard
    if (container.querySelector('.nsw-quick-exit[data-ready="true"]')) return

    // Find existing QE (manual, no-JS) or create
    let root = container.querySelector('.nsw-quick-exit')
    if (!root) {
      root = QuickExit.buildMarkup({
        title, description, exitLabel, safeUrl, theme,
      })
      container.appendChild(root)
    }

    QuickExit.enhance(root, {
      safeUrl,
      secondarySafeUrl,
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
    title, description, exitLabel, safeUrl, theme,
  }) {
    const root = document.createElement('section')
    root.className = `nsw-quick-exit nsw-quick-exit__${theme === 'dark' ? 'dark' : 'light'}`

    const wrapper = document.createElement('div')
    wrapper.className = 'nsw-quick-exit__wrapper'

    const content = document.createElement('div')
    content.className = 'nsw-quick-exit__content'

    const h = document.createElement('h3')
    h.className = 'nsw-quick-exit__title'
    h.textContent = title

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

    content.appendChild(h)
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
      secondarySafeUrl,
      theme,
      enableEsc,
      enableCloak,
      focusFirst,
      exitLabel,
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
    const SECONDARY = validateUrl(secondarySafeUrl || safeUrl)
    cta.addEventListener('click', (ev) => {
      try { ev.preventDefault() } catch (errA) { /* ignore */ }
      // Cloak immediately for perceived privacy (if enabled)
      if (enableCloak) QuickExit.applyCloak()
      try { window.open(SAFE, '_blank', 'noopener,noreferrer') } catch (errB) { /* popup blocked is fine */ }
      try { window.location.replace(SECONDARY) } catch (errB) { window.location.href = SECONDARY }
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

    const isEscapeKey = (event) => (
      event.key === 'Escape' || event.key === 'Esc' || event.keyCode === 27
    )

    const handleKeydown = (event) => {
      if (!isEscapeKey(event)) return

      pressCount += 1
      if (timerId) clearTimeout(timerId)

      if (pressCount >= 2) {
        try { event.preventDefault() } catch (err) { /* ignore */ }
        try { event.stopImmediatePropagation() } catch (err) { /* ignore */ }
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

    // Capture phase so we still receive ESC even if other components stop propagation
    document.addEventListener('keydown', handleKeydown, true)
  }

  static applyCloak() {
    try {
      document.documentElement.style.setProperty('display', 'none', 'important')
    } catch (errC) { /* ignore */ }
  }

  static focusFirst(node) {
    const focus = () => {
      try { node.focus({ preventScroll: true }) } catch (errD) { try { node.focus() } catch (errE) { /* ignore */ } }
    }
    const arrivedBF = (() => {
      try { const nav = performance.getEntriesByType('navigation')[0]; return nav && nav.type === 'back_forward' } catch (_) { return false }
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
        secondarySafeUrl: 'https://www.bom.gov.au/',
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
        try { opts = JSON.parse(attr) } catch (parseErr) { /* ignore bad JSON */ }
      }

      // Map legacy cloakMode to enableCloak (anything except 'none' = true)
      let enableCloak = true
      if (typeof opts.enableCloak === 'boolean') enableCloak = opts.enableCloak
      else if (typeof opts.cloakMode === 'string') enableCloak = opts.cloakMode !== 'none'

      QuickExit.init({
        safeUrl: opts.safeUrl || 'https://www.google.com/webhp',
        secondarySafeUrl: opts.secondarySafeUrl || 'https://www.bom.gov.au/',
        title: opts.title || 'Leave this site quickly',
        description: opts.description || 'Select <strong>Exit now</strong> or press the <kbd>Esc</kbd> key 2 times. This won\'t clear your internet history.',
        exitLabel: opts.exitLabel || 'Exit now',
        theme: opts.theme || 'light',
        enableEsc: (typeof opts.enableEsc === 'boolean') ? opts.enableEsc : true,
        enableCloak,
        focusFirst: (typeof opts.focusFirst === 'boolean') ? opts.focusFirst : true,
      })
    } catch (err) {
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
