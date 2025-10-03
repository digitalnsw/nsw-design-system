import { cleanHTMLStrict } from '../../global/scripts/helpers/sanitize'
import stickyContainer, { updateStickyBodyPadding } from '../../global/scripts/sticky-container'
import { safeUrl } from '../../global/scripts/helpers/utilities'

export default class QuickExit {
  static init({
    exitUrl = 'https://www.google.com/',
    exitLabel = 'Exit this site',
    title = 'Quickly leave this site',
    description = 'Use the button or press the <kbd>Esc</kbd> key 2 times. Quick exit doesn\'t clear your browser history.',
    theme = 'light',
    newTab = false,
    eraseCurrentPage = false,
    enableEsc = false,
  } = {}) {
    // Use the shared sticky container (owned by sticky-container.js)
    const containerEl = stickyContainer()
    if (!containerEl) {
      // eslint-disable-next-line no-console
      console.warn('QuickExit: sticky container unavailable in this environment')
      return
    }

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
    if (newTab) quickExitWrapper.classList.add('nsw-quick-exit--newtab')

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
      // Keep description inline-safe inside <p> (no nested block elements)
      const frag = cleanHTMLStrict(description, true, { allowedTags: ['span', 'kbd', 'strong', 'em', 'br', 'code'] })
      if (frag && frag.childNodes && frag.childNodes.length > 0) {
        descEl.appendChild(frag)
      } else {
        descEl.textContent = String(description)
      }
    }

    contentWrapper.appendChild(headingEl)
    contentWrapper.appendChild(descEl)

    // Main Quick Exit button with click behaviour for new tab or erase history
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

    const navigate = () => {
      const openInNewTab = newTab
      const shouldErase = eraseCurrentPage
      if (openInNewTab) {
        window.open(safeUrl(exitUrl), '_blank', 'noopener,noreferrer')
        if (shouldErase && window.history && window.history.replaceState) {
          window.history.replaceState(null, '', '/')
        }
        try {
          window.open('', '_self')
          window.close()
        } catch (err) { /* ignore */ }
        if (!document.hidden && shouldErase) {
          window.location.replace(safeUrl(exitUrl))
        }
      } else if (shouldErase) {
        if (window.history && window.history.replaceState) {
          window.history.replaceState(null, '', '/')
        }
        window.location.replace(safeUrl(exitUrl))
      } else {
        window.location.assign(safeUrl(exitUrl))
      }
    }

    quickExitBtn.addEventListener('click', (evt) => {
      evt.preventDefault()
      navigate()
    })
    internalWrapper.appendChild(contentWrapper)
    internalWrapper.appendChild(quickExitBtn)

    quickExitWrapper.appendChild(internalWrapper)

    // Add keyboard functionality for double ESC key press (opt-in)
    const useEsc = enableEsc
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
