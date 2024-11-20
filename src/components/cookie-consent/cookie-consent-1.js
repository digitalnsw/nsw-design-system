import * as CookieConsentAPI from 'vanilla-cookieconsent'

function deleteAllCookies() {
  document.cookie.split(';').forEach((cookie) => {
    const cookieName = cookie.trim().split('=')[0]
    document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`
  })
}

function blockCookies() {
  deleteAllCookies()

  // Continuously delete cookies to prevent setting new ones - not sure this is needed
  // setInterval(() => {
  //   deleteAllCookies()
  // }, 1000)

  // Optionally override document.cookie to prevent setting cookies
  Object.defineProperty(document, 'cookie', {
    get: () => '',
    set: (value) => {
      console.warn('Cookies are blocked. Attempted to set:', value)
    },
  })
}

console.log('CookieConsent', CookieConsentAPI)

class CookieConsent {
  constructor(element) {
    this.bannerElement = element
    this.bannerMainMessage = element.querySelector('.nsw-cookie-banner__main-message')
    this.bannerConfirmation = element.querySelector('.nsw-cookie-banner__confirmation-message')

    // USER PREFERENCES
    this.cookiePreferencesRetrieved = document.cookie && JSON.parse(document.cookie.split(';').find((cookie) => cookie.includes('cookies_policy'))
      .split('=')[1])
    this.cookiePreferencesObj = {}

    // OPT IN TYPE
    this.autoOptIn = element.querySelector('.js-cookie-banner-auto-opt-in')
    this.optIn = element.querySelector('.js-cookie-banner-opt-in')

    // CORE BUTTONS
    this.cookieAcceptButton = element.querySelector('.js-cookie-banner-accept')
    this.cookieAcceptEvent = (e) => this.cookieAccept(e)
    this.cookieRejectButton = element.querySelector('.js-cookie-banner-reject')
    this.cookieRejectEvent = (e) => this.cookieReject(e)

    // CONFIRMATION MESSAGE
    this.cookieBannerDismissButton = element.querySelector('.js-cookie-banner-dismiss')
    this.cookieDismissEvent = (e) => this.cookieBannerDismiss(e)
  }

  init() {
    this.controls()

    console.alert('asd')

    CookieConsentAPI.run({
      categories: {
        necessary: {
          enabled: true,
          readOnly: true,
        },
        analytics: {},
      },

      onFirstConsent: () => {
        console.alert('First consent')
      },

      onModalReady: ({ modal }) => {
        console.log('modal', modal)
      },

      language: {
        default: 'en',
        translations: {
          en: {
            consentModal: {
              title: 'We use cookies',
              description: 'Cookie modal description',
              acceptAllBtn: 'Accept all',
              acceptNecessaryBtn: 'Reject all',
              showPreferencesBtn: 'Manage Individual preferences',
            },
            preferencesModal: {
              title: 'Manage cookie preferences',
              acceptAllBtn: 'Accept all',
              acceptNecessaryBtn: 'Reject all',
              savePreferencesBtn: 'Accept current selection',
              closeIconLabel: 'Close modal',
              sections: [
                {
                  title: 'Somebody said ... cookies?',
                  description: 'I want one!',
                },
                {
                  title: 'Strictly Necessary cookies',
                  description: 'These cookies are essential for the proper functioning of the website and cannot be disabled.',
                  linkedCategory: 'necessary',
                },
                {
                  title: 'Performance and Analytics',
                  description: 'These cookies collect information about how you use our website. All of the data is anonymized and cannot be used to identify you.',
                  linkedCategory: 'analytics',
                },
                {
                  title: 'More information',
                  description: 'For any queries in relation to my policy on cookies and your choices, please <a href="#contact-page">contact us</a>',
                },
              ],
            },
          },
        },
      },
    })

    // CHECK EXISTING PREFERENCES
    if (this.cookiePreferencesRetrieved && this.cookiePreferencesRetrieved.preferences_set) {
      this.cookiePreferencesObj = this.cookiePreferencesRetrieved
    }

    // APPLY AUTO OPT IN - comment back in when ready to ship
    // if (this.autoOptIn) {
    //   document.cookie = 'cookies_policy=accepted;max-age=31536000'
    // }
  }

  controls() {
    // HIDE BANNER IF COOKIE IS ACCEPTED - comment back in when ready to ship
    // if (document.cookie.includes('cookies_policy=accepted')) {
    //   this.bannerElement.hidden = true
    // }
    // EVENT LISTENER FOR ACCEPTANCE BUTTON
    if (this.cookieAcceptButton !== null) {
      this.cookieAcceptButton.addEventListener('click', this.cookieAcceptEvent, false)
    }
    // EVENT LISTENER FOR REJECTION BUTTON
    if (this.cookieRejectButton !== null) {
      this.cookieRejectButton.addEventListener('click', this.cookieRejectEvent, false)
    }
    // EVENT LISTENER DISMISS BUTTON
    if (this.cookieBannerDismissButton !== null) {
      this.cookieBannerDismissButton.addEventListener('click', this.cookieDismissEvent, false)
    }
  }

  cookieAccept() {
    if (this.bannerConfirmation) {
      this.bannerConfirmation.hidden = false
      this.bannerMainMessage.hidden = true
    } else {
      this.bannerElement.hidden = true
    }
    document.cookie = `cookies_policy=${JSON.stringify({ ...this.cookiePreferencesObj, preferences_set: true, analytics: true })};max-age=31536000`
  }

  cookieReject() {
    if (this.bannerConfirmation) {
      this.bannerConfirmation.hidden = false
      this.bannerMainMessage.hidden = true
    } else {
      this.bannerElement.hidden = true
    }
    document.cookie = `cookies_policy=${JSON.stringify({ ...this.cookiePreferencesObj, preferences_set: true, analytics: false })};max-age=31536000`
    blockCookies()
  }

  cookieBannerDismiss() {
    this.bannerElement.hidden = true
  }
}

export default CookieConsent
