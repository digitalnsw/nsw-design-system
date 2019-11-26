import SiteSearch from './patterns/header/header'
import Navigation from './components/main-navigation/main-navigation'

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

  openSearchButton.forEach((element) => {
    new SiteSearch(element).init()
  })

  closeSearchButton.forEach((element) => {
    new SiteSearch(element).init()
  })

  // Navigation
  new Navigation().init()
}

export { initSite, SiteSearch, Navigation }
