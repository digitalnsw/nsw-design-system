export default class QuickExit {
  static init({
    exitUrl = 'https://www.nsw.gov.au/',
    exitLabel = 'Quick exit',
    tooltip = '',
    moreInfoUrl = '',
    moreInfoLabel = 'More Information',
    theme = 'light',
  } = {}) {
    const containerEl = document.querySelector('.js-sticky-container')

    // Check if sticky container exists
    if (!containerEl) {
      console.warn('Sticky container not found')
      return
    }

    // Remove any existing Quick Exit instance to allow dynamic replacement
    const existingQuickExit = containerEl.querySelector('.nsw-quick-exit')
    if (existingQuickExit) {
      containerEl.removeChild(existingQuickExit)
    }

    // Normalise the theme value for reliable comparison
    const normalisedTheme = theme.trim().toLowerCase()
    console.log('QuickExit theme:', normalisedTheme)

    // Create an outer wrapper element for the Quick Exit component
    const quickExitWrapper = document.createElement('div')
    quickExitWrapper.className = `nsw-quick-exit ${
      (normalisedTheme === 'dark' || normalisedTheme === 'inverted')
        ? 'nsw-quick-exit__dark'
        : 'nsw-quick-exit__light'
    }`

    // Create an internal wrapper element with the specified class
    const internalWrapper = document.createElement('div')
    internalWrapper.className = 'nsw-quick-exit__wrapper'

    // Create the Quick Exit button
    const quickExitBtn = document.createElement('button')
    quickExitBtn.className = 'js-quick-exit nsw-button nsw-button--danger'
    quickExitBtn.textContent = exitLabel
    quickExitBtn.addEventListener('click', (e) => {
      e.preventDefault()
      window.location.href = exitUrl
    })
    internalWrapper.appendChild(quickExitBtn)

    // Add a "What's this?" text element with tooltip (if tooltip text is provided)
    if (tooltip) {
      const whatsThis = document.createElement('span')
      whatsThis.className = 'nsw-quick-exit__whats-this nsw-tooltip js-tooltip'
      whatsThis.textContent = "What's this?"
      whatsThis.setAttribute('title', tooltip)
      internalWrapper.appendChild(whatsThis)
    }

    // Optionally add the More Information link
    if (moreInfoUrl) {
      const moreInfoLink = document.createElement('a')
      moreInfoLink.className = 'js-more-info nsw-link'
      moreInfoLink.textContent = moreInfoLabel
      moreInfoLink.href = moreInfoUrl
      internalWrapper.appendChild(moreInfoLink)
    }

    // Append the internal wrapper to the outer wrapper
    quickExitWrapper.appendChild(internalWrapper)

    // Append the entire Quick Exit component to the sticky container
    containerEl.appendChild(quickExitWrapper)

    // Ensure page content is not overlapped by the sticky container:
    const stickyHeight = quickExitWrapper.getBoundingClientRect().height
    document.body.style.paddingBottom = `${stickyHeight}px`

    // Initialise any tooltips on the Quick Exit component (e.g. the "What's this?" element)
    if (window.NSW && window.NSW.Tooltip) {
      const tooltipElements = quickExitWrapper.querySelectorAll('[title]')
      tooltipElements.forEach((el) => {
        new window.NSW.Tooltip(el).init()
      })
    }
  }
}
