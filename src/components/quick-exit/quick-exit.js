/* eslint-disable no-extra-semi */
import { cleanHTMLStrict } from '../../global/scripts/helpers/sanitize'
import stickyContainer, { updateStickyBodyPadding } from '../../global/scripts/sticky-container'
import { safeUrl } from '../../global/scripts/helpers/utilities'

export default class QuickExit {
  static init({
    exitUrl = 'https://www.google.com/',
    exitLabel = 'Exit this site',
    title = 'Quickly leave this site',
    description = 'Use the button or press the <kbd>Esc</kbd> key 2 times.',
    theme = 'light',
    newTab = false,
    eraseCurrentPage = false,
    enableEsc = false,
    placement = 'top',
    cloakMode = 'none',
  } = {}) {
    // Use the shared sticky container (owned by sticky-container.js)
    const containerEl = stickyContainer()
    const isTopPlacement = String(placement).trim()
      .toLowerCase() === 'top'
    if (!containerEl && !isTopPlacement) {
      // eslint-disable-next-line no-console
      console.warn('QuickExit: sticky container unavailable in this environment')
      return
    }

    // Support declarative opt-in via class (preferred) or data attribute
    const domWantsNewTab = (containerEl && containerEl.getAttribute('data-quick-exit-newtab') === 'true')
      || document.body.classList.contains('quick-exit-newtab')

    // Declarative opt-in/out for erasing current page history entry:
    // Accept either data-quick-exit-erasecurrentpage="true" or data-quick-exit-erase-current-page="true"
    // Or a body class "quick-exit-erase-current"
    const domWantsErase = (containerEl
      && (
        containerEl.getAttribute('data-quick-exit-erasecurrentpage') === 'true'
        || containerEl.getAttribute('data-quick-exit-erase-current-page') === 'true'
      ))
      || document.body.classList.contains('quick-exit-erase-current')

    const domWantsEsc = (containerEl && containerEl.getAttribute('data-quick-exit-esc') === 'true')

    // Remove existing Quick Exit instance to allow re-initialisation
    const existingQuickExit = (isTopPlacement ? document.body : containerEl).querySelector(isTopPlacement ? '.nsw-quick-exit--top' : '.nsw-quick-exit')
    if (existingQuickExit) {
      existingQuickExit.parentElement.removeChild(existingQuickExit)
    }

    // Theme (light | dark); default to light
    const isDarkTheme = String(theme)
      .trim()
      .toLowerCase() === 'dark'

    // Wrapper with a single, explicit theme class + data-theme attribute
    const quickExitWrapper = document.createElement('div')
    quickExitWrapper.className = 'nsw-quick-exit'
    if (isTopPlacement) {
      quickExitWrapper.classList.add('nsw-quick-exit--top')
    }
    quickExitWrapper.classList.add(isDarkTheme ? 'nsw-quick-exit__dark' : 'nsw-quick-exit__light')
    quickExitWrapper.setAttribute('data-theme', isDarkTheme ? 'dark' : 'light')
    quickExitWrapper.style.display = 'block'
    if (isDarkTheme) {
      quickExitWrapper.classList.add('nsw-section--invert')
    }
    if (newTab || domWantsNewTab) quickExitWrapper.classList.add('nsw-quick-exit--newtab')

    // Main Quick Exit button with click behaviour for new tab or erase history
    const quickExitBtn = document.createElement('button')
    quickExitBtn.type = 'button'
    quickExitBtn.className = 'js-quick-exit nsw-quick-exit__cta'
    quickExitBtn.setAttribute('aria-label', exitLabel)

    // Inner container
    const innerContainer = document.createElement('div')
    innerContainer.className = 'nsw-quick-exit__inner'

    // Icon
    const iconEl = document.createElement('span')
    iconEl.className = 'nsw-quick-exit__icon'
    iconEl.setAttribute('aria-hidden', 'true')
    iconEl.innerHTML = '<svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" focusable="false" role="img"><g clip-path="url(#clip0_2059_19572)"><path d="M4 11.6V5C4 4.2 4.3 3.5 4.9 2.9C5.5 2.3 6.2 2 7 2H13.6V5H7V11.6H4ZM13.6 42H7C6.2 42 5.5 41.7 4.9 41.1C4.3 40.5 4 39.8 4 39V32.4H7V39H13.6V42ZM41 11.6V5H34.4V2H41C41.8 2 42.5 2.3 43.1 2.9C43.7 3.5 44 4.2 44 5V11.6H41ZM27.004 16.3C26.0013 16.3 25.1417 15.943 24.425 15.229C23.7083 14.515 23.35 13.6567 23.35 12.654C23.35 11.6513 23.707 10.7917 24.421 10.075C25.135 9.35833 25.9933 9 26.996 9C27.9987 9 28.8583 9.357 29.575 10.071C30.2917 10.785 30.65 11.6433 30.65 12.646C30.65 13.6487 30.293 14.5083 29.579 15.225C28.865 15.9417 28.0067 16.3 27.004 16.3ZM17.85 34.25L20.15 22.5L15.15 24.85V31.55H12.15V22.8L20.35 19.35C21.4167 18.8833 22.175 18.5917 22.625 18.475C23.075 18.3583 23.5267 18.3 23.98 18.3C24.66 18.3 25.2583 18.4417 25.775 18.725C26.2917 19.0083 26.7333 19.4333 27.1 20L29.2 23.35C29.7667 24.2167 30.4417 25.025 31.225 25.775C32.0083 26.525 32.8833 27.1333 33.85 27.6L32.35 30.15C31.3833 29.6167 30.475 28.9583 29.625 28.175C28.775 27.3917 27.95 26.45 27.15 25.35L25 34.25H17.85ZM30.5 44C29.9333 44 29.5083 43.7333 29.225 43.2C28.9417 42.6667 28.9333 42.1667 29.2 41.7L37.2 27.75C37.4667 27.1833 37.8917 26.9167 38.475 26.95C39.0583 26.9833 39.5167 27.2333 39.85 27.7L47.85 41.7C48.15 42.2 48.1375 42.7083 47.8125 43.225C47.4875 43.7417 47.05 44 46.5 44H30.5ZM38.5 42C38.7 42 38.875 41.925 39.025 41.775C39.175 41.625 39.25 41.45 39.25 41.25C39.25 41.05 39.175 40.875 39.025 40.725C38.875 40.575 38.7 40.5 38.5 40.5C38.3 40.5 38.125 40.575 37.975 40.725C37.825 40.875 37.75 41.05 37.75 41.25C37.75 41.45 37.825 41.625 37.975 41.775C38.125 41.925 38.3 42 38.5 42ZM37.75 38.75H39.25V30.5H37.75V38.75Z" fill="currentColor"/></g><defs><clipPath id="clip0_2059_19572"><rect width="48" height="48" fill="white"/></clipPath></defs></svg>'

    // Heading
    const headingEl = document.createElement('h3')
    headingEl.className = 'nsw-quick-exit__title'
    headingEl.textContent = title

    // Description
    const descEl = document.createElement('p')
    descEl.className = 'nsw-quick-exit__description'
    if (description) {
      let html = String(description)
      html = html.replace(/(&lt;|&#60;)(kbd)(>)/gi, '<kbd>').replace(/(&lt;|&#60;)(\/kbd)(>)/gi, '</kbd>')
      const frag = cleanHTMLStrict(html, true, { allowedTags: ['span', 'kbd', 'strong', 'em', 'br', 'code'] })
      if (frag && frag.childNodes.length > 0) descEl.appendChild(frag)
      else descEl.textContent = html
    }

    innerContainer.prepend(iconEl)
    innerContainer.appendChild(headingEl)
    innerContainer.appendChild(descEl)
    quickExitBtn.appendChild(innerContainer)
    quickExitWrapper.appendChild(quickExitBtn)

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
      // Hide content immediately for users on slow devices/connections
      applyCloak()
      const openInNewTab = newTab || quickExitWrapper.classList.contains('nsw-quick-exit--newtab') || domWantsNewTab
      const shouldErase = eraseCurrentPage || domWantsErase
      if (openInNewTab) {
        window.open(safeUrl(exitUrl), '_blank', 'noopener,noreferrer')
        if (shouldErase && window.history && window.history.replaceState) {
          window.history.replaceState(null, '', '/')
        }
        // If erase is requested, blank the current tab so previous content isn't visible or trivially recoverable.
        if (shouldErase) {
          try {
            window.location.replace('about:blank')
          } catch (err) { /* ignore */ }
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

    // Append Quick Exit component based on placement
    if (isTopPlacement) {
      // Place as the first element in <body> so it sits above the masthead
      if (document.body.firstChild) {
        document.body.insertBefore(quickExitWrapper, document.body.firstChild)
      } else {
        document.body.appendChild(quickExitWrapper)
      }
    } else {
      containerEl.appendChild(quickExitWrapper)
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

    // Adjust body padding only when using the shared sticky container
    if (!isTopPlacement) {
      updateStickyBodyPadding()
    }
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
