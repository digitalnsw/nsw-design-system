/*! NSW Design System v3.24.1 | MIT License */
(function (factory) {
  typeof define === 'function' && define.amd ? define('NSW', factory) :
  factory();
})((function () { 'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    const config = {
      cookie: {
        name: 'nsw-cookie-consent',
        expiresAfterDays: 90
      },
      categories: {
        necessary: {
          enabled: true,
          readOnly: true
        },
        analytics: {}
      },
      consentBanner: {
        title: 'Cookies on the NSW Design System website',
        description: "We've added essential and additional cookies to ensure this service works effectively, track how it's being used, and make necessary improvements. You can <a href='#'>manage your cookie settings</a> by visiting the 'Cookies' page, found at the bottom of this page.",
        acceptAllBtn: 'Accept all',
        acceptNecessaryBtn: 'Only necessary cookies',
        showPreferencesBtn: 'Manage your preferences',
        confirmationMessage: `Thanks for making your selection. View and update your <a href="#cookie-consent" class="js-open-dialog-cookie-consent-preferences" aria-haspopup="dialog">cookie preferences</a>.`,
        bannerOffset: '0px'
      },
      preferencesDialog: {
        title: 'Manage cookie preferences',
        acceptAllBtn: 'Accept all',
        acceptNecessaryBtn: 'Only necessary cookies',
        savePreferencesBtn: 'Accept current selection',
        closeIconLabel: 'Close dialog',
        sections: [{
          title: 'Necessary',
          description: 'This site requires necessary cookies for privacy protection, accessibility, and secure access to government services. They cannot be turned off.',
          linkedCategory: 'necessary'
        }, {
          title: 'Performance and Analytics',
          description: 'These cookies collect information about how you use our website. All of the data is anonymised and cannot be used to identify you.',
          linkedCategory: 'analytics'
        }],
        tab1: {
          tabTitle: 'Cookie preferences'
        },
        tab2: {
          tabTitle: 'How we use cookies',
          content: `
          <p>We use cookies to enhance your experience when using our website.</p>
          <p>Cookies help us understand how you interact with our site, allowing us to improve functionality and ensure security.</p>
          <p>They do not contain viruses or harmful software and take up minimal space on your device.</p>

          <h2>How we use cookies</h2>
          <p>Our website uses cookies to:</p>
          <ul>
            <li>ensure essential site functionality, such as security and accessibility</li>
            <li>remember your preferences, including dismissed notifications and pop-ups</li>
            <li>analyse website traffic and user interactions to improve content and navigation</li>
            <li>enable sharing of content on social media platforms like LinkedIn</li>
            <li>help us make continuous improvements based on user behaviour</li>
          </ul>
          <p>Some cookies may collect information that is classified as personal data. Please refer to our <a href="[your privacy policy URL]">Privacy Policy</a> to learn more about how we handle personal information.</p>
          <p>For more details on cookies, how they work, and how to manage or delete them, visit <a href="https://www.allaboutcookies.org">www.allaboutcookies.org</a>.</p>

          <h2>Details about cookies on this NSW Government website</h2>
          <table class="nsw-table">
            <caption class="sr-only">Details about cookies on this NSW Government website</caption>
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Purpose</th>
                <th scope="col">Expires</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>analytics_next_page_call</td>
                <td>This lets us know the next page you visit on NSW Government website, so we can make journeys better</td>
                <td>When you close your browser</td>
              </tr>
              <tr>
                <td>_ga</td>
                <td>These help us count how many people visit NSW Government website and other government digital services by tracking if you’ve visited before</td>
                <td>2 years</td>
              </tr>
              <tr>
                <td>_gid</td>
                <td>These help us count how many people visit NSW Government website and other government digital services by tracking if you’ve visited before</td>
                <td>24 hours</td>
              </tr>
              <tr>
                <td>_ga_S5RQ7FTGVR</td>
                <td>Used by Google Analytics to find and track an individual session with your device</td>
                <td>2 years</td>
              </tr>
            </tbody>
          </table>
        `
        }
      }
    };
    new window.NSW.CookieConsent(config);
  });

}));
