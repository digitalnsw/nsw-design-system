import { cleanHTMLStrict } from '../../global/scripts/helpers/sanitize'
import stickyContainer, { updateStickyBodyPadding } from '../../global/scripts/sticky-container'
import { validateUrl } from '../../global/scripts/helpers/utilities'

export default class QuickExit {
  static init({
    safeUrl = 'https://www.google.com/webhp',
    secondarySafeUrl = 'https://www.bom.gov.au/',
    title = 'Leave this site quickly',
    description = "Select <strong>Exit now</strong> or press the <kbd>Esc</kbd> key 2 times. This won't clear your internet history.", // eslint-disable-line max-len
    theme = 'light',
    enableEsc = false,
    cloakMode = 'display',
    focusFirst = true,
  } = {}) {
    const EXIT_LABEL = 'Exit now'
    // Use the shared sticky container (owned by sticky-container.js)
    const containerEl = stickyContainer()
    if (!containerEl) {
      // eslint-disable-next-line no-console
      console.warn('QuickExit: sticky container unavailable in this environment')
      return
    }

    // Support declarative opt-in via class (preferred) or data attribute
    const domWantsEsc = (containerEl && containerEl.getAttribute('data-quick-exit-esc') === 'true')

    // Prefer progressive enhancement: reuse existing markup if present
    const existingQuickExit = containerEl.querySelector('.nsw-quick-exit')

    // Build or enhance the wrapper
    const isDarkTheme = String(theme)
      .trim()
      .toLowerCase() === 'dark'
    const quickExitWrapper = existingQuickExit || document.createElement('section')
    if (!existingQuickExit) {
      quickExitWrapper.className = 'nsw-quick-exit'
    } else {
      // Ensure base class exists in case of custom markup
      quickExitWrapper.classList.add('nsw-quick-exit')
    }

    // Theme handling (light | dark)
    quickExitWrapper.classList.remove('nsw-quick-exit__dark', 'nsw-quick-exit__light')
    quickExitWrapper.classList.add(isDarkTheme ? 'nsw-quick-exit__dark' : 'nsw-quick-exit__light')
    quickExitWrapper.setAttribute('data-theme', isDarkTheme ? 'dark' : 'light')
    quickExitWrapper.style.display = 'block'
    if (isDarkTheme) {
      quickExitWrapper.classList.add('nsw-section--invert')
    } else {
      quickExitWrapper.classList.remove('nsw-section--invert')
    }

    // Grab or create internal wrapper
    let internalWrapper = quickExitWrapper.querySelector('.nsw-quick-exit__wrapper')
    if (!internalWrapper) {
      internalWrapper = document.createElement('div')
      internalWrapper.className = 'nsw-quick-exit__wrapper'
      quickExitWrapper.appendChild(internalWrapper)
    }

    // Grab or create content wrapper
    let contentWrapper = quickExitWrapper.querySelector('.nsw-quick-exit__content')
    if (!contentWrapper) {
      contentWrapper = document.createElement('div')
      contentWrapper.className = 'nsw-quick-exit__content'
      internalWrapper.appendChild(contentWrapper)
    }

    // Heading
    let headingEl = quickExitWrapper.querySelector('.nsw-quick-exit__title')
    if (!headingEl) {
      headingEl = document.createElement('h3')
      headingEl.className = 'nsw-quick-exit__title'
      contentWrapper.appendChild(headingEl)
    }
    headingEl.textContent = title

    // Description
    let descEl = quickExitWrapper.querySelector('.nsw-quick-exit__description')
    if (!descEl) {
      descEl = document.createElement('p')
      descEl.className = 'nsw-quick-exit__description'
      descEl.id = 'nsw-quick-exit__desc'
      contentWrapper.appendChild(descEl)
    }
    if (description) {
      let html = String(description)
      html = html
        .replace(/(&lt;|&#60;)(kbd)(>)/gi, '<kbd>')
        .replace(/(&lt;|&#60;)(\/kbd)(>)/gi, '</kbd>')
      const frag = cleanHTMLStrict(html, true, { allowedTags: ['span', 'kbd', 'strong', 'em', 'br', 'code'] })
      // Reset description contents before appending
      descEl.textContent = ''
      if (frag && frag.childNodes && frag.childNodes.length > 0) {
        descEl.appendChild(frag)
      } else {
        descEl.textContent = html
      }
    }

    // Hide any no-JS fallback links (keep in DOM for true no-JS environments)
    const fallbackLinks = quickExitWrapper.querySelectorAll('.nsw-quick-exit__cta--fallback')
    fallbackLinks.forEach((el) => {
      const target = el
      target.textContent = EXIT_LABEL
      target.setAttribute('aria-label', EXIT_LABEL)
      target.setAttribute('aria-hidden', 'true')
      target.setAttribute('hidden', '')
      target.classList.add('nsw-quick-exit__cta--fallback-hidden')
    })

    // Main Quick Exit button (inject only if not already present)
    let quickExitBtn = quickExitWrapper.querySelector('button.js-quick-exit.nsw-quick-exit__cta')
    if (!quickExitBtn) {
      quickExitBtn = document.createElement('button')
      quickExitBtn.type = 'button'
      quickExitBtn.className = 'js-quick-exit nsw-quick-exit__cta'
      internalWrapper.appendChild(quickExitBtn)
    }
    quickExitBtn.textContent = EXIT_LABEL
    quickExitBtn.id = 'nsw-quick-exit__cta'
    quickExitBtn.setAttribute('aria-describedby', 'nsw-quick-exit__desc')
    quickExitBtn.setAttribute('aria-label', EXIT_LABEL)

    // Append Quick Exit component to sticky container only if newly created
    if (!existingQuickExit) {
      containerEl.appendChild(quickExitWrapper)
    }

    // Apply an immediate, global "cloak" to hide document content.
    const applyCloak = () => {
      if (!cloakMode || cloakMode === 'none') return
      const root = document.documentElement // <html>
      try {
        switch (cloakMode) {
          case 'display':
            root.style.setProperty('display', 'none', 'important')
            break
          case 'opacity':
            root.style.setProperty('opacity', '0', 'important')
            root.style.setProperty('pointer-events', 'none', 'important')
            break
          case 'visibility':
          default:
            root.style.setProperty('visibility', 'hidden', 'important')
            break
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('QuickExit: failed to apply cloak', e)
      }
    }

    const navigate = () => {
      // Hide content immediately for users on slow devices/connections (if cloakMode is set)
      applyCloak()
      const SAFE_URL = validateUrl(safeUrl)
      const CURRENT_URL = validateUrl(secondarySafeUrl || safeUrl)
      try {
        // Attempt to open safe URL in a new tab; should be allowed as this runs in a user click handler
        window.open(SAFE_URL, '_blank', 'noopener,noreferrer')
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('QuickExit: opening new tab was blocked, falling back to single-tab redirect')
      }
      window.location.replace(CURRENT_URL)
    }

    quickExitBtn.addEventListener('click', (evt) => {
      evt.preventDefault()
      navigate()
    })

    // Make Quick Exit the first focus target for keyboard/SR users without moving DOM order.
    if (focusFirst) {
      const focusCTA = () => {
        try {
          document.getElementById('nsw-quick-exit__cta').focus({ preventScroll: true })
        } catch (e) {
          const btn = document.getElementById('nsw-quick-exit__cta')
          if (btn) btn.focus()
        }
      }

      const arrivedViaBackForward = (() => {
        try {
          const nav = performance.getEntriesByType && performance.getEntriesByType('navigation')[0]
          return !!(nav && nav.type === 'back_forward')
        } catch (e) { return false }
      })()

      // Only auto-focus on fresh loads where no element has focus, no hash target is intended,
      // and we aren't returning from BFCache (which may have its own prior focus).
      const shouldAutoFocusOnLoad = !arrivedViaBackForward
        && !window.location.hash
        && (!document.activeElement || document.activeElement === document.body)

      if (shouldAutoFocusOnLoad) {
        // Defer to allow layout/AT trees to stabilise.
        setTimeout(focusCTA, 0)
      }

      // Ensure Quick Exit is the first tab stop: on the *first* Tab press, move focus to the CTA, once.
      let firstTabHandled = false
      const handleFirstTab = (ev) => {
        if (firstTabHandled) return
        if (ev.key !== 'Tab') return
        // If focus isn't already on the CTA, hijack the first Tab to land there.
        const cta = document.getElementById('nsw-quick-exit__cta')
        if (cta && document.activeElement !== cta) {
          ev.preventDefault()
          firstTabHandled = true
          focusCTA()
          // Remove listener after we have redirected focus once.
          document.removeEventListener('keydown', handleFirstTab, true)
        }
      }
      document.addEventListener('keydown', handleFirstTab, true)

      // Do not steal focus on BFCache restores; if users come back, respect their previous focus.
      window.addEventListener('pageshow', (e) => {
        if (e && e.persisted) {
          document.removeEventListener('keydown', handleFirstTab, true)
        }
      }, { once: true })
    }

    // Add keyboard functionality for double ESC key press (opt-in)
    const useEsc = enableEsc || domWantsEsc
    if (useEsc) {
      let escPressCount = 0
      let escPressTimer = null
      const ESC_PRESS_WINDOW = 1000 // 1 second window for double press

      const handleKeydown = (event) => {
        if (event.key !== 'Escape') return
        escPressCount += 1
        if (escPressTimer) {
          clearTimeout(escPressTimer)
        }
        if (escPressCount >= 2) {
          event.preventDefault()
          navigate()
          escPressCount = 0
        } else {
          escPressTimer = setTimeout(() => {
            escPressCount = 0
          }, ESC_PRESS_WINDOW)
        }
      }

      document.addEventListener('keydown', handleKeydown)
      quickExitWrapper.keyboardCleanup = () => {
        document.removeEventListener('keydown', handleKeydown)
      }
    }

    // Adjust body padding to the full sticky container height (accounts for stacked items)
    updateStickyBodyPadding()
  }

  static fromElement(el) {
    let opts = {}
    try {
      const raw = el.getAttribute('data-options') || '{}'
      opts = JSON.parse(raw)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('QuickExit: invalid JSON in data-options')
    }
    QuickExit.init(opts)
  }

  static autoInit() {
    const nodes = document.querySelectorAll('[data-module="quick-exit"]')
    nodes.forEach((el) => {
      if (el.tagName && el.tagName.toLowerCase() === 'button') return
      QuickExit.fromElement(el)
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
