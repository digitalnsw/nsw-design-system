import {
  trapTabKey, whichTransitionEvent, getFocusableElementBySelector,
} from '../../global/scripts/helpers/utilities'

class Navigation {
  constructor(element) {
    this.nav = element
    this.navID = this.nav.id
    this.openNavButton = document.querySelector('.js-open-nav')
    this.closeNavButtons = this.nav.querySelectorAll('.js-close-nav')
    this.closeSubNavButtons = this.nav.querySelectorAll('.js-close-sub-nav')
    this.isMegaMenuElement = this.nav.classList.contains('js-mega-menu')
    this.mainNavIsOpen = false
    this.transitionEvent = whichTransitionEvent()
    this.mobileShowMainTransitionEndEvent = (e) => this.mobileShowMainNav(e)
    this.mobileHideMainTransitionEndEvent = (e) => this.mobileHideMainNav(e)
    this.showSubNavTransitionEndEvent = (e) => this.showSubNav(e)
    this.mobileTrapTabKeyEvent = (e) => this.mobileMainNavTrapTabs(e)
    this.mobileSubNavTrapTabKeyEvent = (e) => this.trapkeyEventStuff(e)
    this.desktopButtonClickEvent = (e) => this.buttonClickDesktop(e)
    this.desktopButtonKeydownEvent = (e) => this.buttonKeydownDesktop(e)
    this.checkFocusEvent = (e) => this.checkIfContainsFocus(e)
    this.openSubNavElements = []
    this.breakpoint = window.matchMedia('(min-width: 62em)')
  }

  init() {
    this.initEvents()
    this.responsiveCheck(this.breakpoint)

    if (this.nav) {
      this.breakpoint.addEventListener('change', (event) => this.responsiveCheck(event))
    }
  }

  initEvents() {
    if (this.isMegaMenuElement) {
      document.addEventListener('click', this.handleOutsideClick.bind(this), false)
      document.addEventListener('keydown', this.escapeClose.bind(this), false)
    }

    if (this.openNavButton) {
      this.openNavButton.addEventListener('click', this.mobileToggleMainNav.bind(this), false)
    }

    this.closeNavButtons.forEach((element) => {
      element.addEventListener('click', this.mobileToggleMainNav.bind(this), false)
    })

    this.closeSubNavButtons.forEach((element) => {
      element.addEventListener('click', this.closeSubNav.bind(this), false)
    })
  }

  responsiveCheck(event) {
    let megaMenuListItems = []
    if (event.matches) {
      megaMenuListItems = [].slice.call(this.nav.querySelectorAll('ul > li'))
      document.body.classList.remove('main-nav-active')
    } else {
      megaMenuListItems = [].slice.call(this.nav.querySelectorAll('li'))
    }
    this.tearDownNavControls()
    this.setUpNavControls(megaMenuListItems)
  }

  handleOutsideClick(event) {
    // removes handleOutsideClick functionality from docs site
    if (this.nav.closest('.nsw-docs')) return

    if (!this.mainNavIsOpen) return

    const isOutsideNav = !this.nav.contains(event.target)

    if (isOutsideNav) {
      this.toggleSubNavDesktop(true)
    }
  }

  tearDownNavControls() {
    if (this.isMegaMenuElement) {
      const listItems = [].slice.call(this.nav.querySelectorAll('li'))
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
        }
      })
    }
  }

  mobileMainNavTrapTabs(e) {
    const elemObj = getFocusableElementBySelector(this.navID, ['> div button', '> ul > li > a'])
    trapTabKey(e, elemObj)
  }

  mobileShowMainNav({ propertyName }) {
    if (propertyName !== 'transform') return
    getFocusableElementBySelector(this.navID, ['> div button', '> ul > li > a']).all[1].focus()
    this.nav.classList.add('active')
    this.nav.classList.remove('activating')
    this.nav.removeEventListener(this.transitionEvent, this.mobileShowMainTransitionEndEvent, false)
    this.nav.addEventListener('keydown', this.mobileTrapTabKeyEvent, false)
  }

  mobileHideMainNav({ propertyName }) {
    if (propertyName !== 'transform') return

    this.nav.classList.remove('active')
    this.nav.classList.remove('closing')

    while (this.openSubNavElements.length > 0) {
      const { submenu } = this.whichSubNavLatest()
      submenu.removeEventListener('keydown', this.mobileSubNavTrapTabKeyEvent, false)
      submenu.classList.remove('active')
      submenu.classList.remove('closing')
      this.openSubNavElements.pop()
    }

    this.nav.removeEventListener(this.transitionEvent, this.mobileHideMainTransitionEndEvent, false)
    this.nav.removeEventListener('keydown', this.mobileTrapTabKeyEvent, false)
  }

  mobileToggleMainNav(e) {
    const { currentTarget } = e
    const isExpanded = currentTarget.getAttribute('aria-expanded') === 'true'
    if (isExpanded) {
      document.body.classList.remove('main-nav-active')
      this.openNavButton.focus()
      this.nav.classList.add('closing')
      this.nav.addEventListener(this.transitionEvent, this.mobileHideMainTransitionEndEvent, false)
    } else {
      document.body.classList.add('main-nav-active')
      this.nav.classList.add('activating')
      this.nav.addEventListener(this.transitionEvent, this.mobileShowMainTransitionEndEvent, false)
    }
  }

  buttonClickDesktop(event) {
    const isDesktop = this.breakpoint.matches
    if (!isDesktop || !event.target.closest('.nsw-main-nav__sub-nav')) {
      this.saveElements(event)
      this.toggleSubNavDesktop()
      event.preventDefault()
    }
  }

  buttonKeydownDesktop(event) {
    if (event.key === ' ' || event.key === 'Enter' || event.key === 'Spacebar') {
      this.saveElements(event)
      this.toggleSubNavDesktop()
      event.preventDefault()
    }
  }

  escapeClose(e) {
    if (e.key === 'Escape') {
    // removes handleOutsideClick functionality from docs site
      if (this.nav.closest('.nsw-docs')) return

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
    if (propertyName !== 'transform') return
    getFocusableElementBySelector(submenu.id, ['> div button', '> .nsw-main-nav__title a', '> ul > li > a']).all[2].focus()
    submenu.removeEventListener(this.transitionEvent, this.showSubNavTransitionEndEvent, false)
  }

  closeSubNav() {
    const { submenu, link } = this.whichSubNavLatest()
    if (this.breakpoint.matches) {
      link.setAttribute('aria-expanded', false)
      link.classList.remove('active')
      this.nav.removeEventListener('focus', this.checkFocusEvent, true)
      // fix: workaround for safari because it doesn't support focus event
      this.nav.removeEventListener('click', this.checkFocusEvent, true)
    } else {
      link.focus()
      submenu.removeEventListener('keydown', this.mobileSubNavTrapTabKeyEvent, false)
    }
    submenu.classList.remove('active')
    submenu.closest('ul').parentElement.classList.remove('no-scroll')
    this.openSubNavElements.pop()
  }

  openSubNav() {
    const { submenu, link } = this.whichSubNavLatest()
    if (this.breakpoint.matches) {
      link.setAttribute('aria-expanded', true)
      link.classList.add('active')
      this.nav.addEventListener('focus', this.checkFocusEvent, true)
      // fix: workaround for safari because it doesn't support focus event
      this.nav.addEventListener('click', this.checkFocusEvent, true)
    } else {
      submenu.addEventListener('keydown', this.mobileSubNavTrapTabKeyEvent, false)
      submenu.addEventListener(this.transitionEvent, this.showSubNavTransitionEndEvent, false)
    }
    submenu.closest('ul').parentElement.scrollTop = 0
    submenu.closest('ul').parentElement.classList.add('no-scroll')
    submenu.classList.add('active')
  }

  toggleSubNavDesktop() {
    const { link } = this.whichSubNavLatest()
    const isExpanded = link.getAttribute('aria-expanded') === 'true'
    if (isExpanded) {
      this.mainNavIsOpen = false
      this.closeSubNav()
    } else {
      this.mainNavIsOpen = true
      this.openSubNav()
    }
  }

  checkIfContainsFocus(e) {
    const { linkParent } = this.whichSubNavLatest()
    const focusWithin = linkParent.contains(e.target)
    const isButton = e.target.closest('a').getAttribute('role') === 'button'
    if (!focusWithin && isButton) {
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
