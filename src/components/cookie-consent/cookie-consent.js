import * as CookieConsentAPI from 'vanilla-cookieconsent'

class CookieConsent {
  constructor(config, element) {
    this.config = config
    this.bannerElement = element
    this.isInitialized = false

    if (element) {
      this.initElements()
    }

    if (this.config) {
      this.initAPI()
    }
  }

  initElements() {
    this.cookieInputContainer = this.bannerElement.querySelector('.nsw-cookie-dialog__list')
    this.allCookieInputs = this.cookieInputContainer.querySelectorAll('input[type="checkbox"]')
    this.acceptSelectionButton = this.bannerElement.querySelector('[data-role="accept-selection"]')
    this.acceptAllButton = this.bannerElement.querySelector('[data-role="accept-all"]')
    this.rejectAllButton = this.bannerElement.querySelector('[data-role="reject-all"]')
  }

  initAPI() {
    CookieConsentAPI.run(this.config).then(() => {
      this.isInitialized = true
      this.loadUserPreferences()
    })
  }

  init() {
    this.attachEventListeners()
  }

  attachEventListeners() {
    // ACCEPT SELECTION BUTTON
    if (this.acceptSelectionButton) {
      this.acceptSelectionButton.addEventListener('click', () => {
        this.sortSelection('accept-selection')
      })
    }

    // ACCEPT ALL BUTTON
    if (this.acceptAllButton) {
      this.acceptAllButton.addEventListener('click', () => {
        this.sortSelection('accept-all')
      })
    }

    // REJECTION BUTTON
    if (this.rejectAllButton) {
      this.rejectAllButton.addEventListener('click', () => {
        this.sortSelection('reject-all')
      })
    }
  }

  loadUserPreferences() {
    const preferences = CookieConsentAPI.getUserPreferences()
    console.log('preferences', preferences)
    console.log('this', this)

    this.allCookieInputs.forEach((input) => {
      console.log('input', input)
      const checkbox = input
      const category = checkbox.value
      if (preferences.acceptedCategories.includes(category)) {
        checkbox.checked = true
      } else {
        checkbox.checked = false
      }
    })
  }

  sortSelection(criteria) {
    if (!this.cookieInputContainer) {
      return console.error('Container with class "nsw-cookie-dialog__list" not found')
    }

    const checked = []
    const unchecked = []

    this.allCookieInputs.forEach((checkbox) => {
      if (criteria === 'accept-selection') {
        console.log('accept-selection')
        if (checkbox.checked) {
          checked.push(checkbox.value)
        } else {
          unchecked.push(checkbox.value)
        }
      }
      if (criteria === 'accept-all') {
        checked.push(checkbox.value)
      }
      if (criteria === 'reject-all') {
        unchecked.push(checkbox.value)
      }
    })

    return CookieConsentAPI.acceptCategory(checked, unchecked)
  }
}

export default CookieConsent
