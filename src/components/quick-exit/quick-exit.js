export default class QuickExit {
  static init({
    exitUrl = 'https://www.nsw.gov.au/',
    exitLabel = 'Quick exit',
    popover = '',
    moreInfoUrl = '',
    moreInfoLabel = 'More Information',
    theme = 'light',
    newTab = false,
    eraseCurrentPage = false,
  } = {}) {
    // Use the shared sticky container (owned by sticky-container.js)
    const containerEl = document.querySelector('.js-sticky-container')
    if (!containerEl) {
      // Ensure sticky-container.js is loaded before QuickExit
      // eslint-disable-next-line no-console
      console.warn('QuickExit: .js-sticky-container not found. Load sticky-container.js before initialising QuickExit.')
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
    if (newTab || domWantsNewTab) quickExitWrapper.classList.add('nsw-quick-exit--newtab')

    // Internal wrapper for button and links
    const internalWrapper = document.createElement('div')
    internalWrapper.className = 'nsw-quick-exit__wrapper'

    // Main Quick Exit button with click behaviour for new tab or erase history
    const quickExitBtn = document.createElement('button')
    quickExitBtn.className = 'js-quick-exit nsw-button nsw-button--danger'
    quickExitBtn.textContent = exitLabel
    quickExitBtn.setAttribute('aria-label', exitLabel)
    quickExitBtn.addEventListener('click', (evt) => {
      evt.preventDefault()
      const openInNewTab = newTab || quickExitWrapper.classList.contains('nsw-quick-exit--newtab') || domWantsNewTab
      const shouldErase = eraseCurrentPage || domWantsErase
      if (openInNewTab) {
        // Open exit URL in new tab and optionally erase current page history
        window.open(exitUrl, '_blank', 'noopener')
        if (shouldErase && window.history && window.history.replaceState) {
          window.history.replaceState(null, '', '/')
        }
        try {
          window.open('', '_self')
          window.close()
        } catch (err) {
          // ignore
        }
        if (!document.hidden && shouldErase) {
          window.location.replace('/')
        }
      } else if (shouldErase) {
        // Replace current history entry and redirect without adding to history
        if (window.history && window.history.replaceState) {
          window.history.replaceState(null, '', '/')
        }
        window.location.replace(exitUrl)
      } else {
        // Navigate normally, preserving history
        window.location.assign(exitUrl)
      }
    })
    internalWrapper.appendChild(quickExitBtn)

    // Create popover trigger and content if popover text is provided
    if (popover) {
      const whatsThisLink = document.createElement('a')
      whatsThisLink.className = 'nsw-quick-exit__popover js-popover'
      whatsThisLink.href = '#'
      whatsThisLink.textContent = "What's this?"
      whatsThisLink.setAttribute('aria-label', 'More information about quick exit')
      const popoverId = `popover-${Date.now()}`
      whatsThisLink.setAttribute('aria-controls', popoverId)
      whatsThisLink.setAttribute('aria-expanded', 'false')
      whatsThisLink.setAttribute('data-popover-position', 'top')
      whatsThisLink.setAttribute('data-popover-gap', '24')
      whatsThisLink.addEventListener('click', (evt) => {
        evt.preventDefault()
      })

      // Popover content element for additional information
      const popoverContent = document.createElement('div')
      popoverContent.id = popoverId
      popoverContent.className = 'nsw-popover'
      popoverContent.innerHTML = `<div class="nsw-p-sm"><p>${popover}</p></div>`

      internalWrapper.appendChild(whatsThisLink)
      internalWrapper.appendChild(popoverContent)
    }

    // Optional More Information link
    if (moreInfoUrl) {
      const moreInfoLink = document.createElement('a')
      moreInfoLink.className = 'js-more-info nsw-link'
      moreInfoLink.textContent = moreInfoLabel
      moreInfoLink.href = moreInfoUrl
      moreInfoLink.setAttribute('aria-label', moreInfoLabel)
      internalWrapper.appendChild(moreInfoLink)
    }

    quickExitWrapper.appendChild(internalWrapper)

    // Append Quick Exit component to sticky container
    containerEl.appendChild(quickExitWrapper)

    // Adjust body padding to prevent content overlap by sticky container
    const stickyHeight = quickExitWrapper.getBoundingClientRect().height
    document.body.style.paddingBottom = `${stickyHeight}px`

    // Initialise NSW Popover if available
    if (window.NSW && window.NSW.Popover) {
      const popoverTriggers = quickExitWrapper.querySelectorAll('.js-popover')
      popoverTriggers.forEach((el) => {
        new window.NSW.Popover(el).init()
      })
    } else {
      console.warn('Popover module not available on window.NSW')
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
