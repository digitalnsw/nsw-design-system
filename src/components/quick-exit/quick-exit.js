import { cleanHTMLStrict } from '../../global/scripts/helpers/sanitize'
import stickyContainer, { updateStickyBodyPadding } from '../../global/scripts/sticky-container'
import { safeUrl } from '../../global/scripts/helpers/utilities'

export default class QuickExit {
  static init({
    exitUrl = 'https://www.google.com/webhp',
    exitLabel = 'Exit now',
    title = 'Leave this site quickly',
    description = "Select <strong>Exit now</strong> or press the <kbd>Esc</kbd> key 2 times. This won't clear your internet history.", // eslint-disable-line max-len
    theme = 'light',
    enableEsc = false,
    backGuard = true,
    cloakMode = 'display',
  } = {}) {
    // Use the shared sticky container (owned by sticky-container.js)
    const containerEl = stickyContainer()
    if (!containerEl) {
      // eslint-disable-next-line no-console
      console.warn('QuickExit: sticky container unavailable in this environment')
      return
    }

    // Support declarative opt-in via class (preferred) or data attribute
    const domWantsEsc = (containerEl && containerEl.getAttribute('data-quick-exit-esc') === 'true')
    const domWantsBackGuard = (containerEl && containerEl.getAttribute('data-quick-exit-back-guard') === 'true')
    const useBackGuard = backGuard || domWantsBackGuard

    // Remove existing Quick Exit instance to allow re-initialisation
    const existingQuickExit = containerEl.querySelector('.nsw-quick-exit')
    if (existingQuickExit) {
      containerEl.removeChild(existingQuickExit)
    }

    // Theme (light | dark); default to light
    const isDarkTheme = String(theme)
      .trim()
      .toLowerCase() === 'dark'

    // Wrapper with a single, explicit theme class + data-theme attribute
    const quickExitWrapper = document.createElement('div')
    quickExitWrapper.className = 'nsw-quick-exit'
    quickExitWrapper.classList.add(isDarkTheme ? 'nsw-quick-exit__dark' : 'nsw-quick-exit__light')
    quickExitWrapper.setAttribute('data-theme', isDarkTheme ? 'dark' : 'light')
    // Stack as a block within the shared sticky container
    quickExitWrapper.style.display = 'block'
    if (isDarkTheme) {
      quickExitWrapper.classList.add('nsw-section--invert')
    }

    // Internal wrapper for button and links
    const internalWrapper = document.createElement('div')
    internalWrapper.className = 'nsw-quick-exit__wrapper'

    const contentWrapper = document.createElement('div')
    contentWrapper.className = 'nsw-quick-exit__content'

    const headingEl = document.createElement('h3')
    headingEl.className = 'nsw-quick-exit__title'
    headingEl.textContent = title

    const descEl = document.createElement('p')
    descEl.className = 'nsw-quick-exit__description'
    if (description) {
      let html = String(description)
      // Avoid generic entity decoding to prevent reinterpreting HTML.
      // If we need to support encoded <kbd> tokens, decode ONLY those, then sanitise.
      // Supports both &lt; and &#60; forms (case-insensitive).
      html = html
        .replace(/(&lt;|&#60;)(kbd)(>)/gi, '<kbd>')
        .replace(/(&lt;|&#60;)(\/kbd)(>)/gi, '</kbd>')

      const frag = cleanHTMLStrict(html, true, { allowedTags: ['span', 'kbd', 'strong', 'em', 'br', 'code'] })
      if (frag && frag.childNodes && frag.childNodes.length > 0) {
        descEl.appendChild(frag)
      } else {
        descEl.textContent = html
      }
    }

    contentWrapper.appendChild(headingEl)
    contentWrapper.appendChild(descEl)

    // Main Quick Exit button with click behaviour
    const quickExitBtn = document.createElement('button')
    quickExitBtn.type = 'button'
    quickExitBtn.className = 'js-quick-exit nsw-quick-exit__cta'
    quickExitBtn.textContent = exitLabel
    // Add east arrow icon after text content
    const iconEl = document.createElement('div')
    iconEl.className = 'material-icons nsw-material-icons'
    iconEl.textContent = 'east'
    quickExitBtn.appendChild(iconEl)
    quickExitBtn.setAttribute('aria-label', exitLabel)

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
      window.location.replace(safeUrl(exitUrl))
    }

    quickExitBtn.addEventListener('click', (evt) => {
      evt.preventDefault()
      navigate()
    })
    internalWrapper.appendChild(contentWrapper)
    internalWrapper.appendChild(quickExitBtn)

    quickExitWrapper.appendChild(internalWrapper)

    // Append Quick Exit component to sticky container
    containerEl.appendChild(quickExitWrapper)

    // Optional: intercept first Back press and route to safe URL
    if (useBackGuard) {
      try {
        const SAFE_URL = safeUrl(exitUrl)
        // Push a throwaway entry so the next Back triggers a popstate we can intercept
        window.history.pushState({ qe: 'guard' }, '')
        const backHandler = () => {
          applyCloak()
          window.location.replace(SAFE_URL)
        }
        window.addEventListener('popstate', backHandler, { once: true })
        // Provide cleanup hook in case sticky container re-inits
        quickExitWrapper.backGuardCleanup = () => {
          window.removeEventListener('popstate', backHandler)
        }
        // If this document was reached via a history traversal (Back/Forward), immediately cloak and route away.
        const arrivedFromHistory = () => {
          try {
            const nav = performance.getEntriesByType && performance.getEntriesByType('navigation')[0]
            return !!(nav && nav.type === 'back_forward')
          } catch (e) { return false }
        }
        if (arrivedFromHistory()) {
          applyCloak()
          window.location.replace(SAFE_URL)
        }
        // Also handle BFCache restores (some browsers restore from memory and won't reflect nav.type)
        window.addEventListener('pageshow', (e) => {
          if (e && e.persisted) {
            applyCloak()
            window.location.replace(SAFE_URL)
          }
        })
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('QuickExit: back-guard not available in this environment', e)
      }
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
