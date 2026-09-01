import stickyContainer from '../../global/scripts/sticky-container'
import { cleanHTMLStrict } from '../../global/scripts/helpers/sanitize'
import { validateUrl } from '../../global/scripts/helpers/utilities'

/* eslint-disable max-len */
/**
 * Quick Exit (lean)
 * - Looks for a manually-authored element inside the sticky container and enhances it.
 * - If initialised programmatically and no element exists, creates one and appends it to the sticky container.
 * - Primary action is an <a> so it works without JS; JS enhances to navigate to the safe URL in the current tab.
 * - Optional progressive features: double-Esc, auto-focus first, URL sanitisation, page title update.
 */
/** internal no-op to satisfy lint when intentionally swallowing errors */

function ignoreError() {}

const defaultSafeUrl = 'https://www.google.com/webhp'
const accessibleLabel = 'Exit now (Quick exit)'
const keyboardHint = 'or press <kbd aria-label="Escape key">Esc</kbd> 2 times.'
const srMessage = 'Quick exit is available on this page.'
const srMessageWithEsc = `${srMessage} You can leave at any time by pressing the Escape key two times.`

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

// Track double-Esc behaviour globally; Quick Exit is a singleton in the sticky container.
let doubleEscCallback = null
let doubleEscHandlerBound = false
let doubleEscPressCount = 0
let doubleEscTimerId = null
const doubleEscTimeWindow = 1000
const quickExitClickHandlers = new WeakMap()
const quickExitIdBase = 'nsw-quick-exit'
const keyboardHintIdBase = 'nsw-quick-exit__desc'
let keyboardHintIdCount = 0

function resetDoubleEsc() {
  doubleEscPressCount = 0
  if (doubleEscTimerId) clearTimeout(doubleEscTimerId)
  doubleEscTimerId = null
}

function getKeyboardHintId(node) {
  const existingId = node.getAttribute('data-quick-exit-desc-id')
  if (existingId) return existingId

  keyboardHintIdCount += 1
  let hintId = keyboardHintIdCount === 1
    ? keyboardHintIdBase
    : `${keyboardHintIdBase}-${keyboardHintIdCount}`

  while (document.getElementById(hintId)) {
    keyboardHintIdCount += 1
    hintId = `${keyboardHintIdBase}-${keyboardHintIdCount}`
  }

  node.setAttribute('data-quick-exit-desc-id', hintId)
  return hintId
}

function getQuickExitId() {
  let count = 1
  let id = quickExitIdBase

  while (document.getElementById(id)) {
    count += 1
    id = `${quickExitIdBase}-${count}`
  }

  return id
}

export default class QuickExit {
  /**
   * Enhance or create a Quick Exit inside the sticky container
   */
  static init(
    {
      safeUrl = defaultSafeUrl,
      enableEsc = true,
      enableCloak = true,
      focusFirst = true,
    } = {},
  ) {
    const safeUrlValidated = validateUrl(safeUrl, defaultSafeUrl)
    const container = stickyContainer()
    if (!container) return

    let root = container.querySelector('.nsw-quick-exit')
    if (!root) {
      root = QuickExit.buildMarkup({
        enableEsc,
        safeUrl: safeUrlValidated,
      })
      container.appendChild(root)
    } else {
      // Update existing markup so the latest init wins
      root.href = safeUrlValidated
      root.rel = 'nofollow noopener'
      root.setAttribute('aria-label', accessibleLabel)
    }

    QuickExit.enhance(root, {
      safeUrl: safeUrlValidated,
      enableEsc,
      enableCloak,
      focusFirst,
    })
  }

  /**
   * Build minimal, no-JS friendly markup
   */
  static buildMarkup({
    enableEsc,
    safeUrl,
  }) {
    const root = document.createElement('a')
    root.className = 'nsw-quick-exit'
    root.href = safeUrl
    root.rel = 'nofollow noopener'
    root.setAttribute('aria-label', accessibleLabel)

    const exit = document.createElement('span')
    exit.className = 'nsw-quick-exit__exit-text'
    exit.textContent = 'Exit now'

    const content = document.createElement('div')
    content.className = 'nsw-quick-exit__content'
    content.appendChild(exit)
    if (enableEsc) {
      const desc = QuickExit.buildKeyboardHint(getKeyboardHintId(root))
      content.appendChild(desc)
      root.setAttribute('aria-describedby', desc.id)
    }

    root.appendChild(content)
    if (!root.id) root.id = getQuickExitId()
    return root
  }

  static buildKeyboardHint(id = keyboardHintIdBase) {
    const desc = document.createElement('span')
    desc.className = 'nsw-quick-exit__description-text'
    desc.id = id
    const hintHTML = cleanHTMLStrict(keyboardHint, true, {
      allowedTags: ['kbd'],
      allowedAttributes: { kbd: ['aria-label'] },
    })
    desc.appendChild(hintHTML)
    return desc
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
    },
  ) {
    const node = root
    const cta = node

    // Ensure consistent DOM structure: always have a content div containing the exit action.
    let contentDiv = node.querySelector('.nsw-quick-exit__content')
    if (!contentDiv) {
      contentDiv = document.createElement('div')
      contentDiv.className = 'nsw-quick-exit__content'
      node.appendChild(contentDiv)
    }

    // Find or create exit element, preferring any existing one under node
    let exit = contentDiv.querySelector('.nsw-quick-exit__exit-text')
      || node.querySelector('.nsw-quick-exit__exit-text')

    if (!exit) {
      exit = document.createElement('span')
      exit.className = 'nsw-quick-exit__exit-text'
      exit.textContent = 'Exit now'
    }

    contentDiv.appendChild(exit)

    let desc = contentDiv.querySelector('.nsw-quick-exit__description-text')
      || node.querySelector('.nsw-quick-exit__description-text')
    if (enableEsc) {
      if (desc) desc.remove()
      desc = QuickExit.buildKeyboardHint(getKeyboardHintId(node))
      contentDiv.appendChild(desc)
      node.setAttribute('aria-describedby', desc.id)
    } else {
      if (desc) desc.remove()
      node.removeAttribute('aria-describedby')
    }

    // Progressive behaviour: always navigate to the safe URL in the current tab
    const safeUrlValidated = validateUrl(safeUrl, defaultSafeUrl)
    if (cta.tagName && cta.tagName.toLowerCase() === 'a') {
      cta.href = safeUrlValidated
      cta.rel = 'nofollow noopener'
    }
    node.setAttribute('aria-label', accessibleLabel)
    const previousClickHandler = quickExitClickHandlers.get(cta)
    if (previousClickHandler) cta.removeEventListener('click', previousClickHandler)

    const handleClick = (ev) => {
      try {
        ev.preventDefault()
      } catch (errA) {
        ignoreError(errA)
      }

      if (enableCloak) QuickExit.applyCloak()

      QuickExit.updatePageTitle()

      try {
        window.location.assign(safeUrlValidated)
      } catch (errC) {
        ignoreError(errC)
      }
    }

    cta.addEventListener('click', handleClick)
    quickExitClickHandlers.set(cta, handleClick)

    // Optional keyboard: double ESC
    QuickExit.bindDoubleEsc(enableEsc ? () => cta.click() : null)

    // Optional focus-first
    if (focusFirst) QuickExit.focusFirst(cta)

    QuickExit.ensureSrOnlyMessage(enableEsc)

    // Mark ready (singleton)
    node.setAttribute('data-ready', 'true')
  }

  static bindDoubleEsc(callback) {
    doubleEscCallback = callback || null
    resetDoubleEsc()

    if (!doubleEscCallback || doubleEscHandlerBound) return

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
      if (!doubleEscCallback) return

      doubleEscPressCount += 1
      if (doubleEscTimerId) clearTimeout(doubleEscTimerId)

      if (doubleEscPressCount >= 2) {
        try {
          event.preventDefault()
        } catch (err) {
          ignoreError(err)
        }
        // When Quick Exit triggers (two Esc presses), prevent the default Esc behaviour
        // but do NOT call stopImmediatePropagation; other listeners will still receive the event.
        const runQuickExit = doubleEscCallback
        resetDoubleEsc()
        if (runQuickExit) runQuickExit()
      } else {
        doubleEscTimerId = setTimeout(resetDoubleEsc, doubleEscTimeWindow)
      }
    }

    // Capture phase so we still receive ESC even if other components stop propagation,
    // but we won't suppress them unless we actually trigger QE (and even then we don't stop propagation).
    document.addEventListener('keydown', handleKeydown, true)
    doubleEscHandlerBound = true
  }

  static ensureSrOnlyMessage(enableEsc = true) {
    try {
      if (typeof document === 'undefined') return
      const skip = document.querySelector('.nsw-skip')
      if (!skip || !skip.parentNode) return

      // Reuse existing message if present, otherwise create it
      let sr = document.getElementById('quick-exit-message')
      if (!sr) {
        sr = document.createElement('span')
        sr.id = 'quick-exit-message'
        sr.className = 'sr-only'
      }
      sr.textContent = enableEsc ? srMessageWithEsc : srMessage

      // Ensure it sits immediately before the skip nav
      if (sr.parentNode !== skip.parentNode || sr.nextElementSibling !== skip) {
        skip.parentNode.insertBefore(sr, skip)
      }
    } catch (err) {
      ignoreError(err)
    }
  }

  static updatePageTitle() {
    try {
      if (typeof document === 'undefined') return

      document.title = '\u200B'
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

  static getOptionsFromElement(root) {
    // Parse data-options if present
    const optAttr = root.getAttribute('data-options')
    let opts = {}
    if (optAttr && optAttr.trim()) {
      try {
        opts = JSON.parse(optAttr)
      } catch (parseErr) {
        ignoreError(parseErr)
      }
    }

    const href = root.getAttribute('href') || defaultSafeUrl

    return {
      safeUrl: href,
      enableEsc: (typeof opts.enableEsc === 'boolean') ? opts.enableEsc : true,
      enableCloak: (typeof opts.enableCloak === 'boolean') ? opts.enableCloak : true,
    }
  }

  /**
   * Enhance any existing server-rendered Quick Exit elements.
   */
  static autoInit() {
    if (typeof document === 'undefined') return

    const existingRoots = document.querySelectorAll('.nsw-quick-exit:not([data-ready="true"])')
    const hasStickyQuickExit = document.querySelector(
      '.nsw-sticky-container .nsw-quick-exit, .js-sticky-container .nsw-quick-exit, #sticky-container .nsw-quick-exit',
    )

    if (hasStickyQuickExit) stickyContainer()

    existingRoots.forEach((existingRoot) => {
      const opts = QuickExit.getOptionsFromElement(existingRoot)
      const isStickyQuickExit = !!existingRoot.closest('.nsw-sticky-container, .js-sticky-container, #sticky-container')

      QuickExit.enhance(existingRoot, {
        ...opts,
        focusFirst: isStickyQuickExit,
      })
    })
  }
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => QuickExit.autoInit())
  } else {
    QuickExit.autoInit()
  }
}
