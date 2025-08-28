/* eslint-disable max-len */
import Accordion from './components/accordion/accordion'
import BackTop from './components/back-to-top/back-to-top'
import Carousel from './components/card-carousel/carousel'
import CookieConsent from './components/cookie-consent/cookie-consent'
import Breadcrumbs from './components/breadcrumbs/breadcrumbs'
import DatePicker from './components/date-picker/date-picker'
import Dialog from './components/dialog/dialog'
import ExternalLink from './components/link/link'
import FileUpload from './components/file-upload/file-upload'
import Filters from './components/filters/filters'
import GlobalAlert from './components/global-alert/global-alert'
import Navigation from './components/main-nav/main-nav'
import Popover from './components/popover/popover'
import Select from './components/select/select'
import SiteSearch from './components/header/header'
import SideNav from './components/side-nav/side-nav'
import Tabs from './components/tabs/tabs'
import Toggletip from './components/tooltip/toggletip'
import Tooltip from './components/tooltip/tooltip'
import UtilityList from './components/utility-list/utility-list'

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
  const backTop = document.querySelectorAll('button.js-back-to-top')
  const breadcrumbs = document.querySelectorAll('.js-breadcrumbs')
  const carousel = document.querySelectorAll('.js-carousel')
  const closeSearchButton = document.querySelectorAll('button.js-close-search')
  const datePicker = document.querySelectorAll('.js-date-input')
  const dialogs = document.querySelectorAll('.js-dialog')
  const fileUpload = document.querySelectorAll('.js-file-upload')
  const filters = document.querySelectorAll('.js-filters')
  const globalAlert = document.querySelectorAll('.js-global-alert')
  const link = document.querySelectorAll('a.js-link')
  const multiSelect = document.querySelectorAll('.js-multi-select')
  const navigation = document.getElementById('main-nav')
  const openSearchButton = document.querySelectorAll('button.js-open-search')
  const popover = document.querySelectorAll('.js-popover')
  const sideNav = document.querySelectorAll('.js-side-nav')
  const tabs = document.querySelectorAll('.js-tabs')
  const toggletip = document.querySelectorAll('.js-toggletip')
  const tooltip = document.querySelectorAll('.js-tooltip')
  const utilityList = document.querySelectorAll('.js-utility-list')

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

  if (breadcrumbs) {
    breadcrumbs.forEach((element) => {
      new Breadcrumbs(element).init()
    })
  }

  if (carousel) {
    carousel.forEach((element) => {
      new Carousel(element).init()
    })
  }

  if (closeSearchButton) {
    closeSearchButton.forEach((element) => {
      new SiteSearch(element).init()
    })
  }

  if (datePicker) {
    datePicker.forEach((element) => {
      new DatePicker(element).init()
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

  if (sideNav) {
    sideNav.forEach((element, index) => {
      new SideNav(element, index).init()
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

  if (utilityList) {
    utilityList.forEach((element) => {
      new UtilityList(element).init()
    })
  }
}

export {
  initSite, Accordion, BackTop, Carousel, CookieConsent, DatePicker, Dialog, ExternalLink, FileUpload, Filters, GlobalAlert, Navigation, Popover, Select, SideNav, SiteSearch, Tabs, Toggletip, Tooltip, UtilityList,
}
