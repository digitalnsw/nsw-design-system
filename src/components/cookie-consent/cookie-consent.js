import * as CookieConsentAPI from 'vanilla-cookieconsent'

class CookieConsent {
  constructor(config = null) {
    this.isInit = false
    this.config = config ? { ...config, autoShow: false } : null
    this.dialogElement = null

    if (this.config) {
      this.createDialog()
      this.init()
    } else {
      console.error('Cookie consent configuration not provided')
    }
  }

  createDialog() {
    const { language: { translations: { en } }, categories = {} } = this.config
    const { consentModal, preferencesModal } = en
    console.log('consentModal', consentModal)

    const cookiesListHtml = `
    <ul class="nsw-cookie-dialog__list">
    ${preferencesModal.sections.map(
    (section, index) => `
          <li class="nsw-cookie-dialog__list-item">
            <input 
              class="nsw-form__checkbox-input" 
              value="${section.linkedCategory}" 
              type="checkbox" 
              name="form-checkbox-multi-${index + 1}" 
              id="cookie-settings-${index + 1}"
              ${categories[section.linkedCategory].readOnly ? 'disabled' : ''}
            >
            <label 
              class="nsw-form__checkbox-label" 
              for="cookie-settings-${index + 1}"
            >
              ${section.title}
            </label>
            <div class="nsw-cookie-dialog__cookie-details">
              <p>${section.description}</p>
            </div>
          </li>
          `,
  )
    .join('')}
  </ul>
  `

    // Create the dialog dynamically
    const preferencesDialogHtml = `
      <div class="js-cookie-consent nsw-cookie-dialog nsw-dialog nsw-dialog--single-action js-dialog js-dialog-dismiss" id="cookie-consent" role="dialog" aria-labelledby="cookie-consent-dialog">
        <div class="nsw-dialog__wrapper">
          <div class="nsw-dialog__container">
            <div class="nsw-dialog__top">
              <div class="nsw-dialog__title">
                <h2 id="cookie-dialog-title">${preferencesModal.title ? preferencesModal.title : 'Cookie preferences'}</h2>
              </div>
              <div class="nsw-dialog__close">
                <button class="nsw-icon-button js-close-dialog">
                  <span class="material-icons nsw-material-icons" focusable="false" aria-hidden="true">close</span>
                  <span class="sr-only">${preferencesModal.closeIconLabel ? preferencesModal.closeIconLabel : 'Close dialog'}</span>
                </button>
              </div>
            </div>
            <div class="nsw-dialog__content">
              <div class="nsw-tabs js-cookie-consent-tabs">
                <ul class="nsw-tabs__list">
                  <li><a href="#cookie-settings" class="js-tabs-fixed">${preferencesModal.tabTitle1 ? preferencesModal.tabTitle1 : 'Cookie preferences'}</a></li>
                  <li><a href="#cookie-information" class="js-tabs-fixed">${preferencesModal.tabTitle2 ? preferencesModal.tabTitle2 : 'What are cookies?'}</a></li>
                </ul>
                <section id="cookie-settings" class="nsw-tabs__content nsw-tabs__content--side-flush">
                  ${cookiesListHtml}
                </section>
                <section id="cookie-information" class="nsw-tabs__content nsw-tabs__content--side-flush">
                  ${preferencesModal.cookiesInformation}
                </section>
              </div>
            </div>
          </div>
          <div class="nsw-cookie-dialog__bottom">
            <div class="nsw-cookie-dialog__cta-group">
              <button class="nsw-button nsw-button--dark js-close-dialog" data-role="accept-selection">${preferencesModal.savePreferencesBtn ? preferencesModal.savePreferencesBtn : 'Accept current selection'}</button>
            </div>
            <div class="nsw-cookie-dialog__cta-group">
              ${preferencesModal.acceptAllBtn ? `<button class="nsw-button nsw-button--dark-outline-solid js-close-dialog" data-role="accept-all">${preferencesModal.acceptAllBtn ? preferencesModal.acceptAllBtn : 'Accept all cookies'}</button>` : ''}
              ${preferencesModal.acceptNecessaryBtn ? `<button class="nsw-button nsw-button--dark-outline-solid js-close-dialog" data-role="reject-all">${preferencesModal.acceptNecessaryBtn ? preferencesModal.acceptNecessaryBtn : 'Reject all cookies'}</button>` : ''}
            </div>
          </div>
        </div>
      </div>
    `

    // Append to the body
    const dialogContainer = document.querySelector('.js-open-dialog-cookie-consent')

    // Initialise dialog
    if (dialogContainer) {
      // Dynamically create the dialog HTML
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = preferencesDialogHtml
      this.dialogElement = tempDiv.firstElementChild

      // Append the dialog directly to the body
      document.body.appendChild(this.dialogElement)

      // Initialize the NSW Design System Dialog
      this.dialogInstance = new window.NSW.Dialog(this.dialogElement)
      this.dialogInstance.init()
    } else {
      console.warn('Dialog trigger element not found')
    }

    // Initialise tabs
    if (window.NSW && window.NSW.Tabs) {
      const tabs = document.querySelector('.js-cookie-consent-tabs')
      new window.NSW.Tabs(tabs).init()
    } else {
      console.warn('NSW Tabs library not found')
    }
  }

  init() {
    if (this.dialogElement) {
      this.initElements()
      this.initAPI()
      this.attachEventListeners()
    } else {
      console.error('Banner element not created')
    }
  }

  initElements() {
    if (!this.dialogElement) {
      console.error('Banner element not provided')
      return
    }
    this.cookieInputContainer = this.dialogElement.querySelector('.nsw-cookie-dialog__list')
    this.allCookieInputs = this.cookieInputContainer.querySelectorAll('input[type="checkbox"]')
    this.acceptSelectionButton = this.dialogElement.querySelector('[data-role="accept-selection"]')
    this.acceptAllButton = this.dialogElement.querySelector('[data-role="accept-all"]')
    this.rejectAllButton = this.dialogElement.querySelector('[data-role="reject-all"]')
  }

  initAPI() {
    CookieConsentAPI.run(this.config).then(() => {
      this.isInit = true
      this.loadUserPreferences()
    })
  }

  attachEventListeners() {
    if (!this.dialogElement) return

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
