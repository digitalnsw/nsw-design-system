/* eslint-disable max-len */
import Accordion from './components/accordion/accordion'
import BackTop from './components/back-to-top/back-to-top'
import Carousel from './components/carousel/carousel'
import Dialog from './components/dialog/dialog'
import ExternalLink from './components/link/link'
import FileUpload from './components/file-upload/file-upload'
import Filters from './components/filters/filters'
import GlobalAlert from './components/global-alert/global-alert'
import Navigation from './components/main-nav/main-nav'
import Popover from './components/popover/popover'
import Select from './components/select/select'
import SiteSearch from './components/header/header'
import Tabs from './components/tabs/tabs'
import Toggletip from './components/tooltip/toggletip'
import Tooltip from './components/tooltip/tooltip'

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
  const accordions = document.querySelectorAll('.js-accordion')
  const backTop = document.querySelectorAll('.js-back-to-top')
  const carousel = document.querySelectorAll('.js-carousel')
  const closeSearchButton = document.querySelectorAll('.js-close-search')
  const dialogs = document.querySelectorAll('.js-dialog')
  const fileUpload = document.querySelectorAll('.js-file-upload')
  const filters = document.querySelectorAll('.js-filters')
  const globalAlert = document.querySelectorAll('.js-global-alert')
  const link = document.querySelectorAll('.js-link')
  const multiSelect = document.querySelectorAll('.js-multi-select')
  const navigation = document.getElementById('main-nav')
  const openSearchButton = document.querySelectorAll('.js-open-search')
  const popover = document.querySelectorAll('.js-popover')
  const tabs = document.querySelectorAll('.js-tabs')
  const toggletip = document.querySelectorAll('.js-toggletip')
  const tooltip = document.querySelectorAll('.js-tooltip')

  if (accordions) {
    accordions.forEach((element) => {
      new Accordion(element).init()
    })
  }

  if (backTop) {
    backTop.forEach((element) => {
      new BackTop(element).init()
    })
  }

  if (carousel) {
    carousel.forEach((element) => {
      const autoplay = !!((element.getAttribute('data-autoplay') && element.getAttribute('data-autoplay') === 'on'))
      const autoplayInterval = (element.getAttribute('data-autoplay-interval')) ? element.getAttribute('data-autoplay-interval') : 5000
      const autoplayOnHover = !!((element.getAttribute('data-autoplay-hover') && element.getAttribute('data-autoplay-hover') === 'on'))
      const autoplayOnFocus = !!((element.getAttribute('data-autoplay-focus') && element.getAttribute('data-autoplay-focus') === 'on'))
      const drag = !!((element.getAttribute('data-drag') && element.getAttribute('data-drag') === 'on'))
      const loop = !((element.getAttribute('data-loop') && element.getAttribute('data-loop') === 'off'))
      const nav = !!((element.getAttribute('data-navigation') && element.getAttribute('data-navigation') === 'on'))
      const navigationItemClass = element.getAttribute('data-navigation-item-class') ? element.getAttribute('data-navigation-item-class') : 'nsw-carousel__nav-item'
      const navigationClass = element.getAttribute('data-navigation-class') ? element.getAttribute('data-navigation-class') : 'nsw-carousel__navigation'
      const navigationPagination = !!((element.getAttribute('data-navigation-pagination') && element.getAttribute('data-navigation-pagination') === 'on'))
      const overflowItems = !!((element.getAttribute('data-overflow-items') && element.getAttribute('data-overflow-items') === 'off'))
      const alignControls = element.getAttribute('data-align-controls') ? element.getAttribute('data-align-controls') : false
      const justifyContent = !!((element.getAttribute('data-justify-content') && element.getAttribute('data-justify-content') === 'on'))

      new Carousel({
        element, autoplay, autoplayOnHover, autoplayOnFocus, autoplayInterval, drag, ariaLive: true, loop, nav, navigationItemClass, navigationPagination, navigationClass, overflowItems, justifyContent, alignControls,
      }).init()
    })
  }

  if (closeSearchButton) {
    closeSearchButton.forEach((element) => {
      new SiteSearch(element).init()
    })
  }

  if (dialogs) {
    dialogs.forEach((element) => {
      new Dialog(element).init()
    })
  }

  if (fileUpload) {
    fileUpload.forEach((element) => {
      new FileUpload(element).init()
    })
  }

  if (filters) {
    filters.forEach((element) => {
      new Filters(element).init()
    })
  }

  if (globalAlert) {
    globalAlert.forEach((element) => {
      new GlobalAlert(element).init()
    })
  }

  if (link) {
    link.forEach((element) => {
      new ExternalLink(element).init()
    })
  }

  if (multiSelect) {
    multiSelect.forEach((element) => {
      new Select(element).init()
    })
  }

  if (navigation) {
    new Navigation(navigation).init()
  }

  if (openSearchButton) {
    openSearchButton.forEach((element) => {
      new SiteSearch(element).init()
    })
  }

  if (popover) {
    popover.forEach((element) => {
      new Popover(element).init()
    })
  }

  if (tabs) {
    tabs.forEach((element) => {
      new Tabs(element).init()
    })
  }

  if (toggletip) {
    toggletip.forEach((element) => {
      new Toggletip(element).init()
    })
  }

  if (tooltip) {
    tooltip.forEach((element) => {
      new Tooltip(element).init()
    })
  }
}

export {
  initSite, Accordion, BackTop, Carousel, Dialog, ExternalLink, FileUpload, Filters, GlobalAlert, Navigation, Popover, Select, SiteSearch, Tabs, Toggletip, Tooltip,
}
