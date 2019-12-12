import SiteSearch from './patterns/header/header'
import Navigation from './components/main-navigation/main-navigation'
import ResponsiveTables from './styles/tables/tables'
import Accordion from './components/accordion/accordion'
import ShareThis from './components/social-bar/social-bar'

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
  const responsiveTables = document.querySelectorAll('.js-responsive-table')
  const accordions = document.querySelectorAll('.js-accordion')

  openSearchButton.forEach((element) => {
    new SiteSearch(element).init()
  })

  closeSearchButton.forEach((element) => {
    new SiteSearch(element).init()
  })

  // Navigation
  new Navigation().init()


  responsiveTables.forEach((element) => {
    new ResponsiveTables(element).init()
  })

  accordions.forEach((element) => {
    new Accordion(element).init()
  })

  new ShareThis().init()
}

export {
  initSite, SiteSearch, Navigation, ResponsiveTables, Accordion,
}
