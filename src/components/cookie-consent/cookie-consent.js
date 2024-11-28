import * as CookieConsentAPI from 'vanilla-cookieconsent'

class CookieConsent {
  constructor(config = null, element = null) {
    if (CookieConsent.instance) {
      throw new Error('Use CookieConsent.getInstance() to get the Singleton instance')
    }

    // this.config = config
    // this.bannerElement = element
    this.isInit = false

    if (config || element) {
      this.init(config, element)
    }

    CookieConsent.instance = this
  }

  static getInstance() {
    if (!CookieConsent.instance) {
      CookieConsent.instance = new CookieConsent()
    }
    return CookieConsent.instance
  }

  init(config, element) {
    this.config = {
      ...config,
      autoShow: false,
    }
    this.bannerElement = element

    if (element) {
      this.initElements()
    }

    if (this.config) {
      this.initAPI()
    }

    this.attachEventListeners()
  }

  initElements() {
    if (!this.bannerElement) {
      console.error('Banner element not provided')
      return
    }
    this.cookieInputContainer = this.bannerElement.querySelector('.nsw-cookie-dialog__list')
    this.allCookieInputs = this.cookieInputContainer.querySelectorAll('input[type="checkbox"]')
    this.acceptSelectionButton = this.bannerElement.querySelector('[data-role="accept-selection"]')
    this.acceptAllButton = this.bannerElement.querySelector('[data-role="accept-all"]')
    this.rejectAllButton = this.bannerElement.querySelector('[data-role="reject-all"]')
  }

  initAPI() {
    if (!this.config) {
      console.error('Configuration not provided')
      return
    }
    CookieConsentAPI.run(this.config).then(() => {
      this.isInit = true
      this.loadUserPreferences()
    })
  }

  attachEventListeners() {
    if (!this.bannerElement) return

    if (this.acceptSelectionButton) {
      this.acceptSelectionButton.addEventListener('click', () => {
        this.sortSelection('accept-selection')
      })
    }

    if (this.acceptAllButton) {
      this.acceptAllButton.addEventListener('click', () => {
        this.sortSelection('accept-all')
      })
    }

    if (this.rejectAllButton) {
      this.rejectAllButton.addEventListener('click', () => {
        this.sortSelection('reject-all')
      })
    }
  }

  loadUserPreferences() {
    const preferences = CookieConsentAPI.getUserPreferences()
    if (!preferences) return

    this.allCookieInputs.forEach((input) => {
      const checkbox = input
      const category = checkbox.value
      checkbox.checked = preferences.acceptedCategories.includes(category)
    })
  }

  sortSelection(criteria) {
    if (!this.cookieInputContainer) {
      console.error('Container with class "nsw-cookie-dialog__list" not found')
      return
    }

    const checked = []
    const unchecked = []

    this.allCookieInputs.forEach((checkbox) => {
      if (criteria === 'accept-selection') {
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

    CookieConsentAPI.acceptCategory(checked, unchecked)
  }
}

export default CookieConsent
