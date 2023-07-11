import SiteSearch from './components/header/header'
import Navigation from './components/main-nav/main-nav'
import Accordion from './components/accordion/accordion'
import Dialog from './components/dialog/dialog'
import Filters from './components/filters/filters'
import FileUpload from './components/file-upload/file-upload'
import Tabs from './components/tabs/tabs'
import GlobalAlert from './components/global-alert/global-alert'
import Select from './components/select/select'
import Tooltip from './components/tooltip/tooltip'
import Toggletip from './components/tooltip/toggletip'
import ExternalLink from './components/link/link'

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
  const dialogs = document.querySelectorAll('.js-dialog')
  const fileUpload = document.querySelectorAll('.js-file-upload')
  const filters = document.querySelectorAll('.js-filters')
  const tabs = document.querySelectorAll('.js-tabs')
  const globalAlert = document.querySelectorAll('.js-global-alert')
  const multiSelect = document.querySelectorAll('.js-multi-select')
  const tooltip = document.querySelectorAll('.js-tooltip')
  const toggletip = document.querySelectorAll('.js-toggletip')
  const link = document.querySelectorAll('.js-link')

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

  dialogs.forEach((element) => {
    new Dialog(element).init()
  })

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

  if (tabs) {
    tabs.forEach((element) => {
      new Tabs(element).init()
    })
  }

  if (globalAlert) {
    globalAlert.forEach((element) => {
      new GlobalAlert(element).init()
    })
  }

  if (multiSelect) {
    multiSelect.forEach((element) => {
      new Select(element).init()
    })
  }

  if (tooltip) {
    tooltip.forEach((element) => {
      new Tooltip(element).init()
    })
  }

  if (toggletip) {
    toggletip.forEach((element) => {
      new Toggletip(element).init()
    })
  }

  if (link) {
    link.forEach((element) => {
      new ExternalLink(element).init()
    })
  }
}

export {
  initSite, SiteSearch, Navigation, Accordion, Tabs, GlobalAlert, Dialog, Filters, FileUpload, Select, Tooltip, Toggletip, ExternalLink,
}
