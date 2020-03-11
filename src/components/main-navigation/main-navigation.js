import {
  getFocusableElement, trapTabKey, whichTransitionEvent, getFocusableElementImmediate,
} from '../../global/scripts/helpers/utilities'

class Navigation {
  constructor() {
    this.openNavButton = document.querySelector('.js-open-navigation')
    this.closeNavButtons = document.querySelectorAll('.js-close-navigation')
    this.openSubnavButtons = document.querySelectorAll('.js-open-subnav')
    this.closeSubnavButtons = document.querySelectorAll('.js-close-subnav')
    this.mainNavElement = document.getElementById('main-navigation')
    this.isMegaMenuElement = !!document.querySelector('.js-mega-menu')
    this.transitionEvent = whichTransitionEvent()
    this.mobileToggleMainNavEvent = (e) => this.mobileToggleMainNav(e)
    this.mobileToggleSubnavEvent = () => this.closeSubnav()
    this.mobileShowMainTransitionEndEvent = (e) => this.mobileShowMainNav(e)
    this.mobileHideMainTransitionEndEvent = (e) => this.mobileHideMainNav(e)
    this.showSubNavTransitionEndEvent = (e) => this.showSubNav(e)
    this.mobileTrapTabKeyEvent = (e) => trapTabKey(e, this.mainNavElement)
    this.mobileSubNavTrapTabKeyEvent = (e) => this.trapkeyEventStuff(e)
    this.desktopButtonClickEvent = (e) => this.buttonClickDesktop(e)
    this.desktopButtonKeydownEvent = (e) => this.buttonKeydownDesktop(e)
    this.checkFocusEvent = (e) => this.checkIfContainsFocus(e)
    this.escapeCloseEvent = (e) => this.escapeClose(e)
    this.openSubNavElements = []
    this.breakpoint = window.matchMedia('(min-width: 48em)')
  }

  init() {
    if (this.mainNavElement) {
      this.setUpNavControls()
      this.setUpMobileControls()
      // this.responsiveCheck(this.breakpoint)
      // this.breakpoint.addListener((e) => this.responsiveCheck(e))
    }
  }

  // responsiveCheck({ matches }) {
  //   if (matches) {
  //     // this.teardownMobileNav()
  //     // this.setUpDesktopNav()
  //   } else {
  //     this.setUpMobileNav()
  //     // this.teardownDesktopNav()
  //   }
  // }

  setUpMobileControls() {
    this.openNavButton.addEventListener('click', this.mobileToggleMainNavEvent, false)

    this.closeNavButtons.forEach((element) => {
      element.addEventListener('click', this.mobileToggleMainNavEvent, false)
    })

    this.mainNavElement.addEventListener('keydown', this.mobileTrapTabKeyEvent, false)

    this.closeSubnavButtons.forEach((element) => {
      element.addEventListener('click', this.mobileToggleSubnavEvent, false)
    })
  }

  setUpNavControls() {
    if (this.isMegaMenuElement) {
      const tempListItems = this.mainNavElement.querySelectorAll('li')
      const megaMenuListItems = Array.prototype.slice.call(tempListItems)

      megaMenuListItems.forEach((item) => {
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

  mobileShowMainNav({ propertyName }) {
    if (!propertyName === 'transform') return
    console.log(getFocusableElementImmediate(this.mainNavElement))
    getFocusableElement(this.mainNavElement).all[1].focus()
    this.mainNavElement.classList.add('is-open')
    this.mainNavElement.classList.remove('is-opening')
    this.mainNavElement.removeEventListener(this.transitionEvent, this.mobileShowMainTransitionEndEvent, false)
  }

  mobileHideMainNav({ propertyName }) {
    if (!propertyName === 'transform') return

    this.mainNavElement.classList.remove('is-open')
    this.mainNavElement.classList.remove('is-closing')
    while (this.openSubNavElements.length > 0) {
      const { submenu } = this.whichSubNavLatest()
      submenu.removeEventListener('keydown', this.mobileSubNavTrapTabKeyEvent, false)
      submenu.classList.remove('is-open')
      submenu.classList.remove('is-closing')
      this.openSubNavElements.pop()
    }
    this.mainNavElement.removeEventListener(this.transitionEvent, this.mobileHideMainTransitionEndEvent, false)
  }

  mobileToggleMainNav(e) {
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

  buttonClickDesktop(e) {
    this.saveElements(e)
    this.toggleSubnavDesktop()
    e.preventDefault()
  }

  buttonKeydownDesktop(e) {
    this.saveElements(e)
    if (e.key === ' ' || e.key === 'Enter' || e.key === 'Spacebar') {
      this.toggleSubnavDesktop()
      e.preventDefault()
    }
  }

  escapeClose(e) {
    const { isExpanded, link } = this.whichSubNavLatest()
    if (e.key === 'Escape' && isExpanded) {
      this.toggleSubnavDesktop(true)
      e.preventDefault()
      link.focus()
    }
  }

  saveElements(e) {
    const { currentTarget } = e
    const temp = {
      submenu: document.getElementById(currentTarget.getAttribute('aria-controls')),
      link: currentTarget,
      isExpanded: currentTarget.getAttribute('aria-expanded') === 'true',
      linkParent: currentTarget.parentNode,
    }

    this.openSubNavElements.push(temp)
  }

  showSubNav({ propertyName }) {
    const { submenu } = this.whichSubNavLatest()
    if (!propertyName === 'transform') return
    getFocusableElement(submenu).all[2].focus()
    submenu.removeEventListener(this.transitionEvent, this.showSubNavTransitionEndEvent, false)
  }

  closeSubnav() {
    const { submenu, link } = this.whichSubNavLatest()
    if (this.breakpoint.matches) {
      link.setAttribute('aria-expanded', false)
      link.classList.remove('is-open')
      this.mainNavElement.removeEventListener('focus', this.checkFocusEvent, true)
    } else {
      link.focus()
      submenu.removeEventListener('keydown', this.mobileSubNavTrapTabKeyEvent, false)
    }
    submenu.classList.remove('is-open')
    this.openSubNavElements.pop()
  }

  opensubnav() {
    const { submenu, link } = this.whichSubNavLatest()
    if (this.breakpoint.matches) {
      link.setAttribute('aria-expanded', true)
      link.classList.add('is-open')
      this.mainNavElement.addEventListener('focus', this.checkFocusEvent, true)
    } else {
      submenu.addEventListener('keydown', this.mobileSubNavTrapTabKeyEvent, false)
      submenu.addEventListener(this.transitionEvent, this.showSubNavTransitionEndEvent, false)
    }
    submenu.classList.add('is-open')
  }

  toggleSubnavDesktop() {
    const { isExpanded } = this.whichSubNavLatest()
    if (isExpanded) {
      this.closeSubnav()
    } else {
      this.opensubnav()
    }
  }

  checkIfContainsFocus() {
    const { linkParent } = this.whichSubNavLatest()
    const focusWithin = linkParent.contains(document.activeElement)
    if (!focusWithin) {
      this.toggleSubnavDesktop(true)
    }
  }

  whichSubNavLatest() {
    const lastSubNav = this.openSubNavElements.length - 1
    return this.openSubNavElements[lastSubNav]
  }

  trapkeyEventStuff(e) {
    const { submenu } = this.whichSubNavLatest()
    trapTabKey(e, submenu)
  }
}

export default Navigation
