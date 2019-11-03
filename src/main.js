import SiteSearch from './components/header/header.js'

function initSite () {

  const searchButton = document.querySelectorAll(".js-open-search");
  const closeButton = document.querySelectorAll(".js-close-search");

  searchButton.forEach(function(element) {
    new SiteSearch(element).init()
  });

  closeButton.forEach(function(element) {
    new SiteSearch(element).init()
  });
}

export {
  initSite,
  SiteSearch
}
