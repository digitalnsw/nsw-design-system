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
    onConsent: () => console.log('Cookies preferences accepted'),
    language: {
      default: 'en',
      translations: {
        en: {
          consentModal: {
            title: 'Cookies on the NSW Design System website',
            description: "We've added essential and additional cookies to ensure this service works effectively, track how it's being used, and make necessary improvements. You can <a href='#'>manage your cookie settings</a> by visiting the 'Cookies' page, found at the bottom of this page.",
            acceptAllBtn: 'Accept all',
            acceptNecessaryBtn: 'Reject all',
            showPreferencesBtn: 'Manage your preferences',
            confirmationMessage: 'Thanks for making your selection. View and update your cookie preferences <a href="#cookie-consent" class="js-open-dialog-cookie-consent-preferences" aria-haspopup="dialog">here</a>.',
          },
          preferencesModal: {
            title: 'Manage cookie preferences',
            acceptAllBtn: 'Accept all',
            acceptNecessaryBtn: 'Reject all',
            savePreferencesBtn: 'Accept current selection',
            closeIconLabel: 'Close dialog',
            sections: [
              {
                title: 'Necessary',
                description: 'These cookies collect information about how you use our website. All of the data is anonymised and cannot be used to identify you.',
                linkedCategory: 'necessary',
              },
              {
                title: 'Performance and Analytics',
                description: 'These cookies collect information about how you use our website. All of the data is anonymised and cannot be used to identify you.',
                linkedCategory: 'analytics',
              },
              {
                title: 'Foo',
                description: 'These cookies collect information about how you use our website. All of the data is anonymised and cannot be used to identify you.',
                linkedCategory: 'foo',
              },
            ],
            tabTitle1: 'Cookie preferences',
            tabTitle2: 'What are cookies?',
            cookiesInformation: `
              <p>Cookies are files saved on your phone, tablet or computer when you visit a website.</p>
              <p>They store information about how you use the website, such as the pages you visit.</p>
              <p>Cookies are not viruses or computer programs. They are very small so do not take up much space.</p>
              <h2>How we use cookies</h2>
              <p>We use cookies to:</p>
              <ul>
                <li>make our website work, for example by keeping it secure</li>
                <li>remember which pop-ups you've seen</li>
                <li>understand how you interact with our website, including tracking the links you click (analytics cookies).</li>
                <li>allow you to share pages with social networks like LinkedIn</li>
                <li>continuously improve our website for you</li>
              </ul>
              <p>Also mention if your NSW Government website does or does not collect personal information.</p>
              <p>For more information on what cookies are, how they work and how to delete them from your computer, you can visit <a href="https://www.allaboutcookies.org">www.allaboutcookies.org</a>.</p>`,
          },
        },
      },
    },
  }

  const cookieConsent = document.querySelector('.js-cookie-consent')
  new window.NSW.CookieConsent(config, cookieConsent)
})
