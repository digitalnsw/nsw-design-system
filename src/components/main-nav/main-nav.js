import {
  trapTabKey, whichTransitionEvent, getFocusableElementBySelector,
} from '../../global/scripts/helpers/utilities'

class Navigation {
  constructor() {
    this.openNavButton = document.querySelector('.js-open-nav')
    this.closeNavButtons = document.querySelectorAll('.js-close-nav')
    this.openSubNavButtons = document.querySelectorAll('.js-open-sub-nav')
    this.closeSubNavButtons = document.querySelectorAll('.js-close-sub-nav')
    this.mainNavElement = document.getElementById('main-nav')
    this.isMegaMenuElement = !!document.querySelector('.js-mega-menu')
    this.transitionEvent = whichTransitionEvent()
    this.mobileToggleMainNavEvent = (e) => this.mobileToggleMainNav(e)
    this.mobileToggleSubNavEvent = () => this.closeSubNav()
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
      megaMenuListItems = [].slice.call(this.mainNavElement.querySelectorAll('ul > li'))
      this.body.classList.remove('main-nav-active')
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
        const submenu = item.querySelector('[id^=sub-nav-]')
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

    this.closeSubNavButtons.forEach((element) => {
      element.addEventListener('click', this.mobileToggleSubNavEvent, false)
    })
  }

  mobileMainNavTrapTabs(e) {
    const elemObj = getFocusableElementBySelector(this.mainNavElement.id, ['> div button', '> ul > li > a'])
    trapTabKey(e, elemObj)
  }

  setUpNavControls(listItems) {
    if (this.isMegaMenuElement) {
      listItems.forEach((item) => {
        const submenu = item.querySelector('[id^=sub-nav-]')
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
    this.mainNavElement.classList.add('active')
    this.mainNavElement.classList.remove('activating')
    this.mainNavElement.removeEventListener(this.transitionEvent, this.mobileShowMainTransitionEndEvent, false)
    this.mainNavElement.addEventListener('keydown', this.mobileTrapTabKeyEvent, false)
  }

  mobileHideMainNav({ propertyName }) {
    if (!propertyName === 'transform') return

    this.mainNavElement.classList.remove('active')
    this.mainNavElement.classList.remove('closing')
    while (this.openSubNavElements.length > 0) {
      const { submenu } = this.whichSubNavLatest()
      submenu.removeEventListener('keydown', this.mobileSubNavTrapTabKeyEvent, false)
      submenu.classList.remove('active')
      submenu.classList.remove('closing')
      this.openSubNavElements.pop()
    }
    this.mainNavElement.removeEventListener(this.transitionEvent, this.mobileHideMainTransitionEndEvent, false)
    this.mainNavElement.removeEventListener('keydown', this.mobileTrapTabKeyEvent, false)
  }

  mobileToggleMainNav(e) {
    const { currentTarget } = e
    const isExpanded = currentTarget.getAttribute('aria-expanded') === 'true'
    if (isExpanded) {
      this.body.classList.remove('main-nav-active')
      this.openNavButton.focus()
      this.mainNavElement.classList.add('closing')
      this.mainNavElement.addEventListener(this.transitionEvent, this.mobileHideMainTransitionEndEvent, false)
    } else {
      this.body.classList.add('main-nav-active')
      this.mainNavElement.classList.add('activating')
      this.mainNavElement.addEventListener(this.transitionEvent, this.mobileShowMainTransitionEndEvent, false)
    }
  }

  buttonClickDesktop(e) {
    this.saveElements(e)
    this.toggleSubNavDesktop()
    e.preventDefault()
  }

  buttonKeydownDesktop(e) {
    if (e.key === ' ' || e.key === 'Enter' || e.key === 'Spacebar') {
      this.saveElements(e)
      this.toggleSubNavDesktop()
      e.preventDefault()
    }
  }

  escapeClose(e) {
    if (e.key === 'Escape') {
      const { link } = this.whichSubNavLatest()
      const isExpanded = link.getAttribute('aria-expanded') === 'true'
      if (isExpanded) {
        this.toggleSubNavDesktop(true)
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
    getFocusableElementBySelector(submenu.id, ['> div button', '> .nsw-main-nav__title a', '> ul > li > a']).all[2].focus()
    submenu.removeEventListener(this.transitionEvent, this.showSubNavTransitionEndEvent, false)
  }

  closeSubNav() {
    const { submenu, link } = this.whichSubNavLatest()
    if (this.breakpoint.matches) {
      link.setAttribute('aria-expanded', false)
      link.classList.remove('active')
      this.mainNavElement.removeEventListener('focus', this.checkFocusEvent, true)
      // fix: workaround for safari because it doesn't support focus event
      this.mainNavElement.removeEventListener('click', this.checkFocusEvent, true)
    } else {
      link.focus()
      submenu.removeEventListener('keydown', this.mobileSubNavTrapTabKeyEvent, false)
    }
    submenu.classList.remove('active')
    this.openSubNavElements.pop()
  }

  openSubNav() {
    const { submenu, link } = this.whichSubNavLatest()
    if (this.breakpoint.matches) {
      link.setAttribute('aria-expanded', true)
      link.classList.add('active')
      this.mainNavElement.addEventListener('focus', this.checkFocusEvent, true)
      // fix: workaround for safari because it doesn't support focus event
      this.mainNavElement.addEventListener('click', this.checkFocusEvent, true)
    } else {
      submenu.addEventListener('keydown', this.mobileSubNavTrapTabKeyEvent, false)
      submenu.addEventListener(this.transitionEvent, this.showSubNavTransitionEndEvent, false)
    }
    submenu.classList.add('active')
  }

  toggleSubNavDesktop() {
    const { link } = this.whichSubNavLatest()
    const isExpanded = link.getAttribute('aria-expanded') === 'true'
    if (isExpanded) {
      this.closeSubNav()
    } else {
      this.openSubNav()
    }
  }

  checkIfContainsFocus(e) {
    const { linkParent } = this.whichSubNavLatest()
    const focusWithin = linkParent.contains(e.target)
    if (!focusWithin) {
      this.toggleSubNavDesktop()
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
