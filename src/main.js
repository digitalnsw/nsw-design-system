import SiteSearch from './patterns/header/header'

function initSite() {
  const searchButton = document.querySelectorAll('.js-open-search')
  const closeButton = document.querySelectorAll('.js-close-search')

  searchButton.forEach((element) => {
    new SiteSearch(element).init()
  })

  closeButton.forEach((element) => {
    new SiteSearch(element).init()
  })
}

export { initSite, SiteSearch }
