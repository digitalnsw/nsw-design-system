import * as CookieConsentAPI from 'vanilla-cookieconsent'

class CookieConsent {
  constructor(config, element) {
    if (!config) {
      this.bannerElement = element
      this.allCookieInputs = element.querySelectorAll('.nsw-form__checkbox-input')
    }
    this.config = config
    if (this.config) {
      CookieConsentAPI.run(this.config)
    }
  }

  init() {
    console.log('allCookieInputs', this.allCookieInputs)

    // console.log('CookieConsentAPI', CookieConsentAPI)

    // CookieConsentAPI.run({
    //   categories: {
    //     necessary: {
    //       enabled: true,
    //       readOnly: true,
    //     },
    //     analytics: {},
    //     jim: {},
    //   },

    //   onFirstConsent: () => {
    //     console.alert('First consent')
    //   },

    //   // onModalReady: ({ modal }) => {
    //   //   console.log('modal', modal)
    //   // },

    //   language: {
    //     default: 'en',
    //     translations: {
    //       en: {
    //         consentModal: {
    //           title: 'We use cookies',
    //           description: 'Cookie modal description',
    //           acceptAllBtn: 'Accept all',
    //           acceptNecessaryBtn: 'Reject all',
    //           showPreferencesBtn: 'Manage Individual preferences',
    //         },
    //         preferencesModal: {
    //           title: 'Manage cookie preferences',
    //           acceptAllBtn: 'Accept all',
    //           acceptNecessaryBtn: 'Reject all',
    //           savePreferencesBtn: 'Accept current selection',
    //           closeIconLabel: 'Close modal',
    //           sections: [
    //             {
    //               title: 'Somebody said ... cookies?',
    //               description: 'I want one!',
    //             },
    //             {
    //               title: 'Strictly Necessary cookies',
    //               description: 'These cookies are essential for the proper functioning of the website and cannot be disabled.',
    //               linkedCategory: 'necessary',
    //             },
    //             {
    //               title: 'Performance and Analytics',
    //               description: 'These cookies collect information about how you use our website. All of the data is anonymized and cannot be used to identify you.',
    //               linkedCategory: 'analytics',
    //             },
    //             {
    //               title: 'Jim',
    //               description: 'These cookies collect information about how you use our website. All of the data is anonymized and cannot be used to identify you.',
    //               linkedCategory: 'jim',
    //             },
    //             {
    //               title: 'More information',
    //               description: 'For any queries in relation to my policy on cookies and your choices, please <a href="#contact-page">contact us</a>',
    //             },
    //           ],
    //         },
    //       },
    //     },
    //   },
    // })
  }

  // acceptCurrentSelection() {
  //   console.log('this.acceptCurrentSelection', this.acceptCurrentSelection)
  // }
}

export default CookieConsent
