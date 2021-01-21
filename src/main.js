import SiteSearch from './components/header/header'
import Navigation from './components/main-navigation/main-navigation'
import Accordion from './components/accordion/accordion'
import ShareThis from './components/social-bar/social-bar'
import Tabs from './components/tab-navigation/tab-navigation'
import SitewideMessage from './components/site-wide-message/site-wide-message'

if (window.NodeList && !NodeList.prototype.forEach) {
  NodeList.prototype.forEach = Array.prototype.forEach
}

if (!Element.prototype.closest) {
  if (!Element.prototype.matches) {
    Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector
  }
  Element.prototype.closest = function closest(s) {
    const el = this
    let ancestor = this
    if (!document.documentElement.contains(el)) return null
    do {
      if (ancestor.matches(s)) return ancestor
      ancestor = ancestor.parentElement
    } while (ancestor !== null)
    return null
  }
}

function initSite() {
  // Header Search
  const openSearchButton = document.querySelectorAll('.js-open-search')
  const closeSearchButton = document.querySelectorAll('.js-close-search')
  const accordions = document.querySelectorAll('.js-accordion')
  const tabs = document.querySelectorAll('.js-tabs')
  const siteMessages = document.querySelectorAll('.js-sitewide-message')

  openSearchButton.forEach((element) => {
    new SiteSearch(element).init()
  })

  closeSearchButton.forEach((element) => {
    new SiteSearch(element).init()
  })

  // Navigation
  new Navigation().init()

  accordions.forEach((element) => {
    new Accordion(element).init()
  })

  if (tabs) {
    tabs.forEach((element) => {
      new Tabs(element).init()
    })
  }

  new ShareThis().init()

  if (siteMessages) {
    siteMessages.forEach((element) => {
      new SitewideMessage(element).init()
    })
  }
}

export {
  initSite, SiteSearch, Navigation, Accordion, ShareThis, Tabs, SitewideMessage,
}
