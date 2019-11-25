import { getFocusableElement, trapTabKey, whichTransitionEvent } from '../../global/scripts/helpers/utilities'

function Navigation() {
  this.openNavButton = document.querySelector('.js-open-navigation')
  this.closeNavButtons = document.querySelectorAll('.js-close-navigation')
  this.openSubnavButtons = document.querySelectorAll('.js-open-subnav')
  this.closeSubnavButtons = document.querySelectorAll('.js-close-subnav')
  this.mainNavElement = document.getElementById('main-navigation')
  this.isMegaMenuElement = !!document.querySelector('.js-mega-menu')
  this.transitionEvent = whichTransitionEvent()
  this.mobileToggleMainNavEvent = (e) => this.mobileToggleMainNav(e)
  this.mobileToggleSubnavEvent = (e) => this.mobileToggleSubnav(e)
  this.mobileShowMainTransitionEndEvent = (e) => this.mobileShowMainNav(e)
  this.mobileHideMainTransitionEndEvent = (e) => this.mobileHideMainNav(e)
  this.mobileShowSubNavTransitionEndEvent = (e) => this.mobileShowSubNav(e)
  this.mobileTrapTabKeyEvent = (e) => trapTabKey(e, this.mainNavElement)
  this.mobileSubNavTrapTabKeyEvent = (e) => trapTabKey(e, this.subNavControls.subNavElement)
  this.desktopButtonClickEvent = (e) => this.buttonClickDesktop(e)
  this.desktopButtonKeydownEvent = (e) => this.buttonKeydownDesktop(e)
  this.checkFocusEvent = (e) => this.checkIfContainsFocus(e)
  this.escapeCloseEvent = (e) => this.escapeClose(e)
  this.subNavControls = {}
  this.openSubNavElements = {}
  this.megaMenuListItems = []
  this.breakpoint = window.matchMedia('(min-width: 48em)')
}

Navigation.prototype.init = function init() {
  this.responsiveCheck(this.breakpoint)
  this.breakpoint.addListener((e) => this.responsiveCheck(e))
}

Navigation.prototype.responsiveCheck = function responsiveCheck(e) {
  if (e.matches) {
    this.teardownMobileNav()
    this.setUpDesktopNav()
  } else {
    this.setUpMobileNav()
    this.teardownDesktopNav()
  }
}

Navigation.prototype.setUpMobileNav = function setUpMobileNav() {
  this.openNavButton.addEventListener('click', this.mobileToggleMainNavEvent, false)

  this.closeNavButtons.forEach((element) => {
    element.addEventListener('click', this.mobileToggleMainNavEvent, false)
  })

  this.mainNavElement.addEventListener('keydown', this.mobileTrapTabKeyEvent, false)

  this.openSubnavButtons.forEach((element) => {
    element.addEventListener('click', this.mobileToggleSubnavEvent, false)
  })

  this.closeSubnavButtons.forEach((element) => {
    element.addEventListener('click', this.mobileToggleSubnavEvent, false)
  })
}

Navigation.prototype.teardownMobileNav = function teardownMobileNav() {
  this.openNavButton.removeEventListener('click', this.mobileToggleMainNavEvent, false)

  this.closeNavButtons.forEach((element) => {
    element.removeEventListener('click', this.mobileToggleMainNavEvent, false)
  })

  this.mainNavElement.removeEventListener('keydown', this.mobileTrapTabKeyEvent, false)

  this.openSubnavButtons.forEach((element) => {
    element.removeEventListener('click', this.mobileToggleSubnavEvent, false)
  })

  this.closeSubnavButtons.forEach((element) => {
    element.removeEventListener('click', this.mobileToggleSubnavEvent, false)
  })
}

Navigation.prototype.setUpDesktopNav = function setUpDesktopNav() {
  if (this.isMegaMenuElement) {
    const tempListItems = this.mainNavElement.getElementsByTagName('ul')[0].children
    this.megaMenuListItems = Array.prototype.slice.call(tempListItems)

    this.megaMenuListItems.forEach((item) => {
      const submenu = item.querySelector('[id$=-subnav]')
      const link = item.querySelector('a')
      if (submenu) {
        link.setAttribute('role', 'button')
        link.setAttribute('aria-expanded', 'false')
        link.setAttribute('aria-controls', submenu.id)
        link.addEventListener('click', this.desktopButtonClickEvent, false)
        link.addEventListener('keydown', this.desktopButtonKeydownEvent, false)
        document.addEventListener('keydown', this.escapeCloseEvent, false)
      }
    })
  }
}

Navigation.prototype.teardownDesktopNav = function teardownDesktopNav() {
  if (this.isMegaMenuElement) {
    this.megaMenuListItems.forEach((item) => {
      const submenu = item.querySelector('[id$=-subnav]')
      const link = item.querySelector('a')
      if (submenu) {
        link.removeAttribute('role')
        link.removeAttribute('aria-expanded')
        link.removeAttribute('aria-controls')
        link.removeEventListener('click', this.desktopButtonClickEvent, false)
        link.removeEventListener('keydown', this.desktopButtonKeydownEvent, false)
        document.removeEventListener('keydown', this.escapeCloseEvent, false)
      }
    })
  }
}

Navigation.prototype.mobileShowMainNav = function mobileShowMainNav(e) {
  if (!e.propertyName === 'transform') return
  getFocusableElement(this.mainNavElement).all[1].focus()
  this.mainNavElement.classList.add('is-open')
  this.mainNavElement.classList.remove('is-opening')
  this.mainNavElement.removeEventListener(this.transitionEvent, this.mobileShowMainTransitionEndEvent, false)
}

Navigation.prototype.mobileHideMainNav = function mobileHideMainNav(e) {
  if (!e.propertyName === 'transform') return
  const { subNavElement } = this.subNavControls
  this.mainNavElement.classList.remove('is-open')
  this.mainNavElement.classList.remove('is-closing')
  if (subNavElement) {
    subNavElement.removeEventListener('keydown', this.mobileSubNavTrapTabKeyEvent, false)
    subNavElement.classList.remove('is-open')
    subNavElement.classList.remove('is-closing')
  }
  this.mainNavElement.removeEventListener(this.transitionEvent, this.mobileHideMainTransitionEndEvent, false)
}

Navigation.prototype.mobileToggleMainNav = function mobileToggleMainNav(e) {
  const { currentTarget } = e
  const isExpanded = currentTarget.getAttribute('aria-expanded') === 'true'
  if (isExpanded) {
    this.openNavButton.focus()
    this.mainNavElement.classList.add('is-closing')
    this.mainNavElement.addEventListener(this.transitionEvent, this.mobileHideMainTransitionEndEvent, false)
  } else {
    this.mainNavElement.classList.add('is-opening')
    this.mainNavElement.addEventListener(this.transitionEvent, this.mobileShowMainTransitionEndEvent, false)
  }
}

Navigation.prototype.mobileToggleSubnav = function mobileToggleSubnav(e) {
  const { currentTarget } = e
  const isExpanded = currentTarget.getAttribute('aria-expanded') === 'true'
  this.mobileSaveSubnavElements(currentTarget)
  const { subNavElement, openButton } = this.subNavControls

  if (isExpanded) {
    subNavElement.classList.remove('is-open')
    openButton.focus()
    subNavElement.removeEventListener('keydown', this.mobileSubNavTrapTabKeyEvent, false)
  } else {
    subNavElement.classList.add('is-open')
    subNavElement.addEventListener('keydown', this.mobileSubNavTrapTabKeyEvent, false)
    subNavElement.addEventListener(this.transitionEvent, this.mobileShowSubNavTransitionEndEvent, false)
  }
}

Navigation.prototype.mobileSaveSubnavElements = function mobileSaveSubnavElements(element) {
  const parentElement = element.closest('li')

  this.subNavControls = {
    subNavElement: document.getElementById(element.getAttribute('aria-controls')),
    openButton: parentElement.querySelector('.js-open-subnav'),
  }
}

Navigation.prototype.mobileShowSubNav = function mobileShowSubNav(e) {
  const { subNavElement } = this.subNavControls
  if (!e.propertyName === 'transform') return
  getFocusableElement(subNavElement).all[2].focus()
  subNavElement.removeEventListener(this.transitionEvent, this.mobileShowSubNavTransitionEndEvent, false)
}

Navigation.prototype.buttonClickDesktop = function buttonClickDesktop(e) {
  this.saveElements(e)
  this.toggleSubnavDesktop()
  e.preventDefault()
}

Navigation.prototype.buttonKeydownDesktop = function buttonKeydownDesktop(e) {
  this.saveElements(e)
  if (e.key === ' ' || e.key === 'Enter' || e.key === 'Spacebar') {
    this.toggleSubnavDesktop()
    e.preventDefault()
  }
}

Navigation.prototype.escapeClose = function escapeClose(e) {
  const { isExpanded } = this.openSubNavElements

  if (e.key === 'Escape' && isExpanded) {
    this.toggleSubnavDesktop(true)
    e.preventDefault()
  }
}

Navigation.prototype.saveElements = function saveElements(e) {
  const { currentTarget } = e
  this.openSubNavElements = {
    submenu: document.getElementById(currentTarget.getAttribute('aria-controls')),
    link: currentTarget,
    isExpanded: currentTarget.getAttribute('aria-expanded') === 'true',
    linkParent: currentTarget.parentNode,
  }
}

Navigation.prototype.toggleSubnavDesktop = function toggleSubnavDesktop(close) {
  const { submenu, link, isExpanded } = this.openSubNavElements

  if (isExpanded || close) {
    link.setAttribute('aria-expanded', false)
    link.classList.remove('is-open')
    submenu.classList.remove('is-open')
    this.mainNavElement.removeEventListener('focus', this.checkFocusEvent, true)
  } else {
    link.setAttribute('aria-expanded', true)
    link.classList.add('is-open')
    submenu.classList.add('is-open')
    this.mainNavElement.addEventListener('focus', this.checkFocusEvent, true)
  }
}

Navigation.prototype.checkIfContainsFocus = function checkIfContainsFocus() {
  const { linkParent } = this.openSubNavElements
  const focusWithin = linkParent.contains(document.activeElement)
  if (!focusWithin) {
    this.toggleSubnavDesktop(true)
  }
}

export default Navigation
