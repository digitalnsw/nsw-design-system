/* eslint-disable max-len */

import * as CookieConsentAPI from 'vanilla-cookieconsent'

/* eslint-disable max-len */
class CookieConsent {
  constructor(config = null) {
    this.isInit = false

    if (!window.NSW || !window.NSW.CookieConsent) {
      console.error('NSW CookieConsent is not available.')
      return
    }

    if (!config) {
      console.error('Cookie consent configuration not provided')
      return
    }

    CookieConsent.cleanupDefaultCookieUI()

    this.config = CookieConsent.mapToVanillaCookieConsentConfig(config)

    this.consentBannerElement = null
    this.preferencesDialogElement = null
    this.consentBannerConfirmationMessage = ''
    this.consentSelectionMade = false

    this.createConsentBanner()
    this.createPreferencesDialog()
    this.init()
  }

  static cleanupDefaultCookieUI() {
    // Remove unwanted stylesheet
    const unwantedStylesheet = Array.from(document.querySelectorAll('link')).find(
      (link) => link.href.includes('cookieconsent.css'),
    )
    if (unwantedStylesheet) {
      unwantedStylesheet.remove()
    }

    // Monitor for and remove the default cookie consent element
    const observer = new MutationObserver(() => {
      const defaultCookieConsentElement = document.getElementById('cc-main')
      if (defaultCookieConsentElement) {
        defaultCookieConsentElement.remove()
        observer.disconnect() // Stop observing
      }
    })

    observer.observe(document.documentElement, { childList: true, subtree: true })

    // Remove if it already exists in the DOM
    const existingElement = document.getElementById('cc-main')
    if (existingElement) {
      existingElement.remove()
    }
  }

  static mapToVanillaCookieConsentConfig(config) {
    return {
      ...config,
      autoShow: false,
      language: {
        default: 'en',
        translations: {
          en: {
            consentModal: config.consentBanner,
            preferencesModal: config.preferencesDialog,
          },
        },
      },
    }
  }

  createPreferencesDialog() {
    const { language: { translations: { en } }, categories = {} } = this.config
    const { preferencesModal } = en

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
      <div class="nsw-cookie-dialog nsw-dialog nsw-dialog--single-action js-dialog js-dialog-dismiss" id="cookie-consent-preferences" role="dialog" aria-labelledby="cookie-consent-dialog">
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
                  <li><a href="#cookie-settings" class="js-tabs-fixed">${preferencesModal.tab1 ? preferencesModal.tab1.tabTitle : 'Cookie preferences'}</a></li>
                  ${preferencesModal.tab2 ? `<li><a href="#cookie-use" class="js-tabs-fixed">${preferencesModal.tab2.tabTitle ? preferencesModal.tab2.tabTitle : 'How we use cookies'}</a></li>` : ''}
                  <li><a href="#cookie-information" class="js-tabs-fixed">What are cookies?</a></li>
                </ul>
                <section id="cookie-settings" class="nsw-tabs__content nsw-tabs__content--side-flush">
                  <div class="nsw-cookie-dialog__content-wrapper">
                    ${preferencesModal.tab1.content ? preferencesModal.tab1.content : ''}
                    ${cookiesListHtml}
                  </div>
                </section>
                ${preferencesModal.tab2 ? `
                    <section id="cookie-use" class="nsw-tabs__content nsw-tabs__content--side-flush">
                      <div class="nsw-cookie-dialog__content-wrapper">
                        ${preferencesModal.tab2.content}
                      </div>
                    </section>
                  ` : ''}
                <section id="cookie-information" class="nsw-tabs__content nsw-tabs__content--side-flush">
                  <div class="nsw-cookie-dialog__content-wrapper">
                    <p>Cookies are small files stored on your phone, tablet, or computer when you visit a website. They help us understand how you use our website and improve your experience.</p>
                    
                    <p>Some cookies collect information about how you interact with our website, such as the pages you visit and links you click. Others may store personal information, depending on their purpose and configuration.</p>

                    <p>Personal information that may be collected by cookies includes:</p>
                    <ul>
                      <li>Email address</li>
                      <li>Username</li>
                      <li>IP address</li>
                      <li>Geographic location</li>
                      <li>Session screen recordings</li>
                    </ul>

                    <p>We use cookies to:</p>
                    <ul>
                      <li>Make our website work efficiently and securely</li>
                      <li>Remember your preferences, such as which pop-ups you’ve seen</li>
                      <li>Understand how you use our website (analytics cookies)</li>
                      <li>Enable social sharing, such as LinkedIn</li>
                      <li>Continuously improve our website for you</li>
                    </ul>

                    <p>Privacy and compliance:</p>
                    <p>If cookies collect personal information, we are required to comply with Information Privacy Principle (IPP) 3, ensuring openness in data collection. This means you should be informed when your personal information is collected.</p>

                    <p>We provide this information through:</p>
                    <ul>
                      <li>A Privacy Collection Notice (PCN) within the "How we use cookies" tab</li>
                      <li>A link to our Privacy Policy and/or Cookie Policy</li>
                    </ul>

                    <p>As tracking technologies evolve, we periodically review our cookie practices to maintain privacy compliance and control over tracking technologies.</p>

                    <p>For more information on cookies, including how to manage or delete them, visit <a href="https://www.allaboutcookies.org">www.allaboutcookies.org</a>.</p>

                    <p>For privacy advice, please contact your agency’s privacy or information governance team. Additional guidance is available at <a href="mailto:digitalnswprivacy@customerservice.nsw.gov.au">digitalnswprivacy@customerservice.nsw.gov.au</a>.</p>
                  </div>
                </section>
              </div>
            </div>
          </div>
          <div class="nsw-cookie-dialog__bottom">
            <div class="nsw-cookie-dialog__cta-group">
              ${preferencesModal.acceptAllBtn ? `<button class="nsw-button nsw-button--dark-outline-solid js-close-dialog" data-role="accept-all">${preferencesModal.acceptAllBtn ? preferencesModal.acceptAllBtn : 'Accept all cookies'}</button>` : ''}
              ${preferencesModal.acceptNecessaryBtn ? `<button class="nsw-button nsw-button--dark-outline-solid js-close-dialog" data-role="reject-all">${preferencesModal.acceptNecessaryBtn ? preferencesModal.acceptNecessaryBtn : 'Reject all cookies'}</button>` : ''}
            </div>
            <div class="nsw-cookie-dialog__cta-group">
              <button class="nsw-button nsw-button--dark js-close-dialog" data-role="accept-selection">${preferencesModal.savePreferencesBtn ? preferencesModal.savePreferencesBtn : 'Accept current selection'}</button>
            </div>
          </div>
        </div>
      </div>
    `

    // Append to the body
    const dialogContainer = document.querySelector('.js-open-dialog-cookie-consent-preferences')

    // Initialise dialog
    if (dialogContainer) {
      // Dynamically create the dialog HTML
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = preferencesDialogHtml
      this.preferencesDialogElement = tempDiv.firstElementChild

      // Append the dialog directly to the body
      document.body.appendChild(this.preferencesDialogElement)

      // Initialise the NSW Design System Dialog
      this.dialogInstance = new window.NSW.Dialog(this.preferencesDialogElement)
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

  createConsentBanner() {
    const { language: { translations: { en } } } = this.config
    const { consentModal } = en
    const bannerOffset = consentModal.bannerOffset ? consentModal.bannerOffset : '0'
    this.consentBannerConfirmationMessage = consentModal.confirmationMessage || ''

    const consentBannerHtml = `
      <div class="nsw-cookie-banner" role="alert" tabindex="-1" aria-labelledby="cookie-banner-title" aria-live="assertive" style="bottom: ${bannerOffset};">
        <div class="nsw-cookie-banner__wrapper">
          <div id="cookie-banner-title" class="nsw-cookie-banner__title">${consentModal.title || 'Cookie use on our website'}</div>
          <span class="nsw-cookie-banner__description">
            <div class="nsw-cookie-banner__content">
              ${consentModal.description ? `<p>${consentModal.description}</p>` : ''}
            </div>
            <div class="nsw-cookie-banner__buttons-container">
              ${consentModal.acceptAllBtn || consentModal.acceptNecessaryBtn ? '<div class="nsw-cookie-banner__cta-group">' : ''}
                ${consentModal.acceptAllBtn ? `<button class="nsw-button nsw-button--dark js-close-dialog ${!consentModal.confirmationMessage ? 'js-dismiss-cookie-banner' : ''}" data-role="accept-all">${consentModal.acceptAllBtn}</button>` : ''}
                ${consentModal.acceptNecessaryBtn ? `<button class="nsw-button nsw-button--dark ${!consentModal.confirmationMessage ? 'js-dismiss-cookie-banner' : ''}" data-role="reject-all">${consentModal.acceptNecessaryBtn}</button>` : ''}
              ${consentModal.acceptAllBtn || consentModal.acceptNecessaryBtn ? '</div>' : ''}
              <a href="#cookie-consent" class="nsw-button nsw-button--dark-outline js-open-dialog-cookie-consent-preferences" aria-haspopup="dialog">${consentModal.showPreferencesBtn || 'Manage your cookies'}</a>
            </div>
          </span>
          <span class="nsw-cookie-banner__confirmation-message" hidden="true">
            <div class="nsw-cookie-banner__content">
              <p>${consentModal.confirmationMessage}</p>
            </div>
            <div class="nsw-cookie-banner__buttons-container">
              <button class="nsw-button nsw-button--dark js-dismiss-cookie-banner">Close this message</button>
            </div>
          </span>
        </div>
      </div>
    `

    // Append the banner to the body
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = consentBannerHtml
    this.consentBannerElement = tempDiv.firstElementChild
    document.body.appendChild(this.consentBannerElement)

    this.consentBannerElement.focus()
  }

  init() {
    if (this.preferencesDialogElement) {
      this.initElements()
      this.initAPI()
      this.attachEventListeners()

      // Immediately hide the banner if user has preferences set
      const preferences = CookieConsentAPI.getUserPreferences()
      if (preferences && preferences.acceptedCategories.length > 0) {
        this.consentBannerElement.setAttribute('hidden', 'true')
      }
    } else {
      console.error('Banner element not created')
    }
  }

  initElements() {
    this.cookieInputContainer = document.querySelector('.nsw-cookie-dialog__list')
    this.allCookieInputs = this.cookieInputContainer
      ? this.cookieInputContainer.querySelectorAll('input[type="checkbox"]')
      : []

    this.acceptSelectionButton = document.querySelector('[data-role="accept-selection"]')
    this.acceptAllButton = document.querySelector('[data-role="accept-all"]')
    this.rejectAllButton = document.querySelector('[data-role="reject-all"]')
  }

  initAPI() {
    if (!this.isInit) {
      CookieConsentAPI.run(this.config).then(() => {
        this.isInit = true
        this.loadUserPreferences()
      })
    }
  }

  attachEventListeners() {
    // Delegate events from the document to handle all relevant elements dynamically
    document.addEventListener('click', (event) => {
      const { target } = event

      if (target.matches('[data-role="accept-all"]')) {
        this.handleConsentAction('accept-all')
      } else if (target.matches('[data-role="reject-all"]')) {
        this.handleConsentAction('reject-all')
      } else if (target.matches('[data-role="accept-selection"]')) {
        this.handleConsentAction('accept-selection')
      }

      // If target is dismissable
      if (target.matches('.js-dismiss-cookie-banner')) {
        this.hideConsentBanner()
      }

      // Manual trigger of cookie consent banner
      if (target.matches('.js-open-banner-cookie-consent')) {
        event.preventDefault()
        this.showConsentBanner()
      }

      // Manual trigger of cookie consent preferences dialog
      if (target.matches('.js-open-dialog-cookie-consent-preferences')) {
        event.preventDefault()
        this.hideConsentBanner()
        if (this.dialogInstance) {
          this.dialogInstance.open()
        }
      }
    })
  }

  loadUserPreferences() {
    const preferences = CookieConsentAPI.getUserPreferences() || { acceptedCategories: [] }
    const inputs = Array.from(this.allCookieInputs)
    for (let i = 0; i < inputs.length; i += 1) {
      const checkbox = inputs[i]
      const category = checkbox.value
      let isChecked
      if (preferences.acceptedCategories.length > 0) {
        isChecked = preferences.acceptedCategories.includes(category)
      } else {
        isChecked = Boolean(
          this.config.categories[category]
          && this.config.categories[category].readOnly, // Ensure read-only categories are checked by default
        )
      }
      checkbox.checked = isChecked
    }
  }

  handleConsentAction(action) {
    const updatePreferencesDialog = () => {
      const preferences = CookieConsentAPI.getUserPreferences()
      if (preferences && this.allCookieInputs) {
        this.allCookieInputs.forEach((checkboxElement) => {
          const checkbox = checkboxElement // Local reference
          checkbox.checked = preferences.acceptedCategories.includes(checkbox.value)
        })
      }
    }

    switch (action) {
      case 'accept-all': {
        console.log('User accepted all cookies')
        CookieConsentAPI.acceptCategory('all')
        updatePreferencesDialog()
        break
      }
      case 'reject-all': {
        console.log('User rejected all cookies')
        CookieConsentAPI.acceptCategory([])
        updatePreferencesDialog()
        break
      }
      case 'accept-selection': {
        console.log('User accepted selected cookies')
        const checked = []
        const unchecked = []

        this.allCookieInputs.forEach((checkboxElement) => {
          if (checkboxElement.checked) {
            checked.push(checkboxElement.value)
          } else {
            unchecked.push(checkboxElement.value)
          }
        })

        CookieConsentAPI.acceptCategory(checked, unchecked)
        updatePreferencesDialog()
        break
      }
      default: {
        console.warn(`Unhandled action: ${action}`)
      }
    }

    this.consentSelectionMade = true

    this.showConfirmationMessage()

    // Hide banner if present or confirmation is present
    if (!this.consentBannerConfirmationMessage) {
      this.hideConsentBanner()
    }
  }

  showConfirmationMessage() {
    // Select the confirmation message element
    const confirmationMessage = this.consentBannerElement.querySelector('.nsw-cookie-banner__confirmation-message')

    // Select the description element
    const description = this.consentBannerElement.querySelector('.nsw-cookie-banner__description')

    if (confirmationMessage) {
      // Change the hidden attribute to false for the confirmation message
      confirmationMessage.removeAttribute('hidden')
    }

    if (description) {
      // Change the hidden attribute to true for the description
      description.setAttribute('hidden', 'true')
    }
  }

  showConsentBanner() {
    if (this.consentBannerElement) {
      const description = this.consentBannerElement.querySelector('.nsw-cookie-banner__description')
      const confirmationMessage = this.consentBannerElement.querySelector('.nsw-cookie-banner__confirmation-message')

      if (this.consentBannerConfirmationMessage && confirmationMessage) {
        // Hide the confirmation message if it's present
        confirmationMessage.setAttribute('hidden', 'true')
      }

      if (description) {
        // Show the main description
        description.removeAttribute('hidden')
      }

      this.consentBannerElement.removeAttribute('hidden')
    } else {
      console.warn('Consent banner element not found.')
    }
  }

  hideConsentBanner() {
    if (this.consentBannerElement) {
      this.consentBannerElement.setAttribute('hidden', 'true')
    }
  }
}

export default CookieConsent
