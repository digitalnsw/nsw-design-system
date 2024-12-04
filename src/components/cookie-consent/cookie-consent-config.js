function waitForCookieConsent(callback) {
  if (window.NSW && window.NSW.CookieConsent) {
    callback()
  } else {
    setTimeout(() => waitForCookieConsent(callback), 100)
  }
}

waitForCookieConsent(() => {
  const config = {
    categories: {
      necessary: {
        enabled: true,
        readOnly: true,
      },
      analytics: {},
      foo: {},
    },
    onFirstConsent: (preferences) => console.log('Accepted:', preferences),
    onModalReady: () => console.log(''),
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
                title: 'Foo',
                description: 'These cookies collect information about how you use our website. All of the data is anonymized and cannot be used to identify you.',
                linkedCategory: 'foo',
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
  }

  const cookieConsent = document.querySelector('.js-cookie-consent')
  new window.NSW.CookieConsent(config, cookieConsent)
})
