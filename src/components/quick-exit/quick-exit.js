export default class QuickExit {
  static init({
    exitUrl = 'https://www.nsw.gov.au/',
    exitLabel = 'Quick exit',
    popover = '',
    moreInfoUrl = '',
    moreInfoLabel = 'More Information',
    theme = 'light',
  } = {}) {
    const containerEl = document.querySelector('.js-sticky-container')

    // Accessibility: Ensure that a landmark or region (e.g. a banner) is used for the sticky container.
    if (!containerEl) {
      console.warn('Sticky container not found')
      return
    }

    // Remove any existing Quick Exit instance to allow dynamic replacement.
    const existingQuickExit = containerEl.querySelector('.nsw-quick-exit')
    if (existingQuickExit) {
      containerEl.removeChild(existingQuickExit)
    }

    // Normalise the theme value for reliable comparison.
    const normalisedTheme = theme.trim().toLowerCase()

    // Create an outer wrapper element for the Quick Exit component.
    // Accessibility: Consider assigning a role (e.g. "complementary") if appropriate.
    const quickExitWrapper = document.createElement('div')
    quickExitWrapper.className = `nsw-quick-exit ${
      (normalisedTheme === 'dark' || normalisedTheme === 'inverted')
        ? 'nsw-quick-exit__dark'
        : 'nsw-quick-exit__light'
    }`

    // Create an internal wrapper element with the specified class.
    const internalWrapper = document.createElement('div')
    internalWrapper.className = 'nsw-quick-exit__wrapper'

    // Create the Quick Exit button (main CTA).
    const quickExitBtn = document.createElement('button')
    quickExitBtn.className = 'js-quick-exit nsw-button nsw-button--danger'
    quickExitBtn.textContent = exitLabel
    // Accessibility: Add an aria-label for clarity.
    quickExitBtn.setAttribute('aria-label', exitLabel)
    quickExitBtn.addEventListener('click', (e) => {
      e.preventDefault()
      window.location.href = exitUrl
    })
    internalWrapper.appendChild(quickExitBtn)

    // Add a "What's this?" popover element (if popover text is provided).
    if (popover) {
      // Create a popover trigger element as an anchor for underlined link styling.
      const whatsThisLink = document.createElement('a')
      whatsThisLink.className = 'nsw-quick-exit__popover js-popover'
      whatsThisLink.href = '#'
      whatsThisLink.textContent = "What's this?"
      // Accessibility: Provide an explicit aria-label to describe the purpose of the link.
      whatsThisLink.setAttribute('aria-label', 'More information about quick exit')
      // Generate a unique ID for the popover content.
      const popoverId = `popover-${Date.now()}`
      whatsThisLink.setAttribute('aria-controls', popoverId)
      whatsThisLink.setAttribute('aria-expanded', 'false')
      // Set required data attributes per the NSW Design System popover.
      whatsThisLink.setAttribute('data-popover-position', 'top')
      whatsThisLink.setAttribute('data-popover-gap', '24')
      // Prevent default link behaviour on click.
      whatsThisLink.addEventListener('click', (e) => {
        e.preventDefault()
      })

      // Create the popover content element.
      const popoverContent = document.createElement('div')
      popoverContent.id = popoverId
      popoverContent.className = 'nsw-popover'
      // Accessibility: Ensure that the popover content is announced by screen readers.
      popoverContent.innerHTML = `<div class="nsw-p-sm"><p>${popover}</p></div>`

      // Append the popover trigger and content to the internal wrapper.
      internalWrapper.appendChild(whatsThisLink)
      internalWrapper.appendChild(popoverContent)
    }

    // Optionally add the More Information link.
    if (moreInfoUrl) {
      const moreInfoLink = document.createElement('a')
      moreInfoLink.className = 'js-more-info nsw-link'
      moreInfoLink.textContent = moreInfoLabel
      moreInfoLink.href = moreInfoUrl
      // Accessibility: Provide an aria-label if necessary.
      moreInfoLink.setAttribute('aria-label', moreInfoLabel)
      internalWrapper.appendChild(moreInfoLink)
    }

    // Append the internal wrapper to the outer wrapper.
    quickExitWrapper.appendChild(internalWrapper)

    // Append the entire Quick Exit component to the sticky container.
    containerEl.appendChild(quickExitWrapper)

    // Ensure page content is not overlapped by the sticky container.
    const stickyHeight = quickExitWrapper.getBoundingClientRect().height
    document.body.style.paddingBottom = `${stickyHeight}px`

    // Initialise any popovers on the Quick Exit component (e.g. the "What's this?" element).
    if (window.NSW && window.NSW.Popover) {
      const popoverTriggers = quickExitWrapper.querySelectorAll('.js-popover')
      popoverTriggers.forEach((el) => {
        new window.NSW.Popover(el).init()
      })
    } else {
      console.warn('Popover module not available on window.NSW')
    }
  }
}
