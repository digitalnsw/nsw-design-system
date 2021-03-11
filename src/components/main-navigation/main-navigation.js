import {
  trapTabKey, whichTransitionEvent, getFocusableElementBySelector,
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
    this.mobileTrapTabKeyEvent = (e) => this.mobileMainNavTrapTabs(e)
    this.mobileSubNavTrapTabKeyEvent = (e) => this.trapkeyEventStuff(e)
    this.desktopButtonClickEvent = (e) => this.buttonClickDesktop(e)
    this.desktopButtonKeydownEvent = (e) => this.buttonKeydownDesktop(e)
    this.checkFocusEvent = (e) => this.checkIfContainsFocus(e)
    this.escapeCloseEvent = (e) => this.escapeClose(e)
    this.openSubNavElements = []
    this.breakpoint = window.matchMedia('(min-width: 62em)')
    this.body = document.body
  }

  init() {
    if (this.mainNavElement) {
      this.setUpMobileControls()
      this.responsiveCheck(this.breakpoint)
      this.breakpoint.addListener((e) => this.responsiveCheck(e))
    }
  }

  responsiveCheck(e) {
    let megaMenuListItems = []
    if (e.matches) {
      megaMenuListItems = [].slice.call(this.mainNavElement.querySelectorAll('.nsw-navigation__list > li'))
      this.body.classList.remove('navigation-open')
    } else {
      megaMenuListItems = [].slice.call(this.mainNavElement.querySelectorAll('li'))
    }
    this.tearDownNavControls()
    this.setUpNavControls(megaMenuListItems)
  }

  tearDownNavControls() {
    if (this.isMegaMenuElement) {
      const listItems = [].slice.call(this.mainNavElement.querySelectorAll('li'))
      listItems.forEach((item) => {
        const submenu = item.querySelector('[id^=subnav-]')
        const link = item.querySelector('a')
        if (submenu) {
          link.removeAttribute('role')
          link.removeAttribute('aria-expanded')
          link.removeAttribute('aria-controls')
          link.removeEventListener('click', this.desktopButtonClickEvent, false)
          link.removeEventListener('keydown', this.desktopButtonKeydownEvent, false)
        }
      })
    }
  }

  setUpMobileControls() {
    this.openNavButton.addEventListener('click', this.mobileToggleMainNavEvent, false)

    this.closeNavButtons.forEach((element) => {
      element.addEventListener('click', this.mobileToggleMainNavEvent, false)
    })

    this.closeSubnavButtons.forEach((element) => {
      element.addEventListener('click', this.mobileToggleSubnavEvent, false)
    })
  }

  mobileMainNavTrapTabs(e) {
    const elemObj = getFocusableElementBySelector(this.mainNavElement.id, ['> div button', '> ul > li > a'])
    trapTabKey(e, elemObj)
  }

  setUpNavControls(listItems) {
    if (this.isMegaMenuElement) {
      listItems.forEach((item) => {
        const submenu = item.querySelector('[id^=subnav-]')
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
    getFocusableElementBySelector(this.mainNavElement.id, ['> div button', '> ul > li > a']).all[1].focus()
    this.mainNavElement.classList.add('is-open')
    this.mainNavElement.classList.remove('is-opening')
    this.mainNavElement.removeEventListener(this.transitionEvent, this.mobileShowMainTransitionEndEvent, false)
    this.mainNavElement.addEventListener('keydown', this.mobileTrapTabKeyEvent, false)
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
    this.mainNavElement.removeEventListener('keydown', this.mobileTrapTabKeyEvent, false)
  }

  mobileToggleMainNav(e) {
    const { currentTarget } = e
    const isExpanded = currentTarget.getAttribute('aria-expanded') === 'true'
    if (isExpanded) {
      this.body.classList.remove('navigation-open')
      this.openNavButton.focus()
      this.mainNavElement.classList.add('is-closing')
      this.mainNavElement.addEventListener(this.transitionEvent, this.mobileHideMainTransitionEndEvent, false)
    } else {
      this.body.classList.add('navigation-open')
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
    if (e.key === ' ' || e.key === 'Enter' || e.key === 'Spacebar') {
      this.saveElements(e)
      this.toggleSubnavDesktop()
      e.preventDefault()
    }
  }

  escapeClose(e) {
    if (e.key === 'Escape') {
      const { link } = this.whichSubNavLatest()
      const isExpanded = link.getAttribute('aria-expanded') === 'true'
      if (isExpanded) {
        this.toggleSubnavDesktop(true)
        e.preventDefault()
        link.focus()
      }
    }
  }

  saveElements(e) {
    const { currentTarget } = e
    const temp = {
      submenu: document.getElementById(currentTarget.getAttribute('aria-controls')),
      link: currentTarget,
      linkParent: currentTarget.parentNode,
    }

    this.openSubNavElements.push(temp)
  }

  showSubNav({ propertyName }) {
    const { submenu } = this.whichSubNavLatest()
    if (!propertyName === 'transform') return
    getFocusableElementBySelector(submenu.id, ['> div button', '> h2 a', '> ul > li > a']).all[2].focus()
    submenu.removeEventListener(this.transitionEvent, this.showSubNavTransitionEndEvent, false)
  }

  closeSubnav() {
    const { submenu, link } = this.whichSubNavLatest()
    if (this.breakpoint.matches) {
      link.setAttribute('aria-expanded', false)
      link.classList.remove('is-open')
      this.mainNavElement.removeEventListener('focus', this.checkFocusEvent, true)
      // fix: workaround for safari because it doesn't support focus event
      this.mainNavElement.removeEventListener('mousedown', this.checkFocusEvent, true)
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
      // fix: workaround for safari because it doesn't support focus event
      this.mainNavElement.addEventListener('mousedown', this.checkFocusEvent, true)
    } else {
      submenu.addEventListener('keydown', this.mobileSubNavTrapTabKeyEvent, false)
      submenu.addEventListener(this.transitionEvent, this.showSubNavTransitionEndEvent, false)
    }
    submenu.classList.add('is-open')
  }

  toggleSubnavDesktop() {
    const { link } = this.whichSubNavLatest()
    const isExpanded = link.getAttribute('aria-expanded') === 'true'
    if (isExpanded) {
      this.closeSubnav()
    } else {
      this.opensubnav()
    }
  }

  checkIfContainsFocus() {
    const { linkParent } = this.whichSubNavLatest()
    const focusWithin = linkParent.contains(document.activeElement)
    const isNavLinkActive = document.activeElement.getAttribute('class').indexOf('nsw-navigation__link') > -1
    if (!focusWithin && isNavLinkActive) {
      this.toggleSubnavDesktop()
    }
  }

  whichSubNavLatest() {
    const lastSubNav = this.openSubNavElements.length - 1
    return this.openSubNavElements[lastSubNav]
  }

  trapkeyEventStuff(e) {
    const { submenu } = this.whichSubNavLatest()
    const elemObj = getFocusableElementBySelector(submenu.id, ['> div button', '> ul > li > a'])
    trapTabKey(e, elemObj)
  }
}

export default Navigation
