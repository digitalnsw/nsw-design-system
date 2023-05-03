/* eslint-disable max-len */
class Toggletip {
  constructor(element) {
    this.element = element
    this.toggletip = this.element.querySelector('.nsw-toggletip-element')
    this.elementId = this.element.getAttribute('id')
    this.trigger = document.querySelectorAll(`[aria-controls="${this.elementId}"]`)
    this.selectedTrigger = false
    this.toggletipVisibleClass = 'active'
    this.selectedTriggerClass = 'active'
    this.toggletipIsOpen = false
    this.focusableElString = '[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary'
    this.firstFocusable = false
    this.lastFocusable = false
    // position target - position tooltip relative to a specified element
    this.positionTarget = this.getPositionTarget()
    // gap between element and viewport - if there's max-height
    this.viewportGap = 20
  }

  init() {
    // reset toggletip position
    this.initToggletipPosition()
    // init aria-labels
    for (let i = 0; i < this.trigger.length; i += 1) {
      this.constructor.setAttributes(this.trigger[i], { 'aria-expanded': 'false', 'aria-haspopup': 'true' })
    }
    this.initEvents()
  }

  initEvents() {
    for (let i = 0; i < this.trigger.length; i += 1) {
      this.trigger[i].addEventListener('click', (event) => {
        event.preventDefault()

        if (this.constructor.hasClass(this.element, this.toggletipVisibleClass) && this.selectedTrigger !== this.trigger[i]) {
          this.toggleToggletip(false, false)
        }

        this.selectedTrigger = this.trigger[i]
        this.toggleToggletip(!this.constructor.hasClass(this.element, this.toggletipVisibleClass), true)
      })
    }

    // listen for key events
    window.addEventListener('keyup', (event) => {
      if ((event.code && event.code.toLowerCase() === 'escape') || (event.key && event.key.toLowerCase() === 'escape')) {
        this.checkToggletipFocus()
      }
    })
    // close toggletip when clicking outside it
    window.addEventListener('click', (event) => {
      this.checkToggletipClick(event.target)
    })
    // on resize -> close all toggletip elements
    window.addEventListener('resize', () => {
      this.toggleToggletip(false, false)
    })
    // on scroll -> close all toggletip elements
    window.addEventListener('scroll', () => {
      if (this.toggletipIsOpen) this.toggleToggletip(false, false)
    })
  }

  getPositionTarget() {
    // position tooltip relative to a specified element - if provided
    const positionTargetSelector = this.element.getAttribute('data-position-target')
    if (!positionTargetSelector) return false
    const positionTarget = document.querySelector(positionTargetSelector)
    console.log(positionTarget)
    return positionTarget
  }

  toggleToggletip(bool, moveFocus) {
    // toggle toggletip visibility
    this.constructor.toggleClass(this.element, this.toggletipVisibleClass, bool)
    this.toggletipIsOpen = bool

    if (bool) {
      this.selectedTrigger.setAttribute('aria-expanded', 'true')
      this.getFocusableElements()

      // move focus
      this.focusToggletip()

      this.element.addEventListener('transitionend', () => {
        this.focusToggletip()
      }, { once: true })

      // position the toggletip element
      this.positionToggletip()

      // add class to toggletip trigger
      this.constructor.addClass(this.selectedTrigger, this.selectedTriggerClass)
    } else if (this.selectedTrigger) {
      this.selectedTrigger.setAttribute('aria-expanded', 'false')

      if (moveFocus) this.constructor.moveFocus(this.selectedTrigger)

      // remove class from menu trigger
      this.constructor.removeClass(this.selectedTrigger, this.selectedTriggerClass)
      this.selectedTrigger = false
    }
  }

  focusToggletip() {
    if (this.firstFocusable) {
      // this.firstFocusable.focus()
    } else {
      this.constructor.moveFocus(this.element)
    }
  }

  positionToggletip() {
    // reset toggletip position
    this.resetToggletipStyle()
    const selectedTriggerPosition = (this.positionTarget) ? this.positionTarget.getBoundingClientRect() : this.selectedTrigger.getBoundingClientRect()

    const menuOnTop = (window.innerHeight - selectedTriggerPosition.bottom) < selectedTriggerPosition.top
    console.log(menuOnTop)
    const { left } = selectedTriggerPosition
    const right = (window.innerWidth - selectedTriggerPosition.right)
    const isRight = (window.innerWidth < selectedTriggerPosition.left + this.element.offsetWidth)

    let horizontal = isRight ? `right: ${right}px;` : `left: ${left}px;`

    let vertical

    if (menuOnTop) {
      vertical = `bottom: ${window.innerHeight - selectedTriggerPosition.top}px;`
      this.constructor.addClass(this.element, 'nsw-toggletip--top')
    } else {
      vertical = `top: ${selectedTriggerPosition.bottom}px;`
      this.constructor.addClass(this.element, 'nsw-toggletip--bottom')
    }
    // check right position is correct -> otherwise set left to 0
    if (isRight && (right + this.element.offsetWidth) > window.innerWidth) horizontal = `left: ${parseInt((window.innerWidth - this.element.offsetWidth) / 2, 10)}px;`
    // check if toggletip needs a max-height (user will scroll inside the toggletip)
    const maxHeight = menuOnTop ? selectedTriggerPosition.top - this.viewportGap : window.innerHeight - selectedTriggerPosition.bottom - this.viewportGap

    let initialStyle = this.element.getAttribute('style')
    if (!initialStyle) initialStyle = ''
    this.element.setAttribute('style', `${initialStyle + horizontal + vertical}max-height:${Math.floor(maxHeight)}px;`)
  }

  resetToggletipStyle() {
    // remove toggletip inline style before appling new style
    this.element.style.maxHeight = ''
    this.element.style.top = ''
    this.element.style.bottom = ''
    this.element.style.left = ''
    this.element.style.right = ''
  }

  initToggletipPosition() {
    // make sure the toggletip does not create any scrollbar
    this.element.style.top = '0px'
    this.element.style.left = '0px'
  }

  checkToggletipClick(target) {
    // close toggletip when clicking outside it
    if (!this.toggletipIsOpen) return
    if (!this.element.contains(target) && !target.closest(`[aria-controls="${this.elementId}"]`)) this.toggleToggletip(false)
  }

  checkToggletipFocus() {
    // on Esc key -> close toggletip if open and move focus (if focus was inside toggletip)
    if (!this.toggletipIsOpen) return
    const toggletipParent = document.activeElement.closest('.js-toggletip')
    this.toggleToggletip(false, toggletipParent)
  }

  getFocusableElements() {
    // get all focusable elements inside the toggletip
    const allFocusable = this.element.querySelectorAll(this.focusableElString)
    this.getFirstVisible(allFocusable)
    this.getLastVisible(allFocusable)
  }

  getFirstVisible(elements) {
    // get first visible focusable element inside the toggletip
    for (let i = 0; i < elements.length; i += 1) {
      if (this.constructor.isVisible(elements[i])) {
        this.firstFocusable = elements[i]
        break
      }
    }
  }

  getLastVisible(elements) {
    // get last visible focusable element inside the toggletip
    for (let i = elements.length - 1; i >= 0; i -= 1) {
      if (this.constructor.isVisible(elements[i])) {
        this.lastFocusable = elements[i]
        break
      }
    }
  }

  trapFocus(event) {
    if (this.firstFocusable === document.activeElement && event.shiftKey) {
      // on Shift+Tab -> focus last focusable element when focus moves out of toggletip
      event.preventDefault()
      this.lastFocusable.focus()
    }
    if (this.lastFocusable === document.activeElement && !event.shiftKey) {
      // on Tab -> focus first focusable element when focus moves out of toggletip
      event.preventDefault()
      this.firstFocusable.focus()
    }
  }

  static isVisible(element) {
    // check if element is visible
    return element.offsetWidth || element.offsetHeight || element.getClientRects().length
  }

  static toggleToggletip(bool, moveFocus) {
    this.toggleToggletip(this, bool, moveFocus)
  }

  static checkToggletipClick(target) {
    this.checkToggletipClick(this, target)
  }

  static checkToggletipFocus() {
    this.checkToggletipFocus(this)
  }

  static moveFocus(element = document.getElementsByTagName('body')[0]) {
    element.focus()
    if (document.activeElement !== element) {
      element.setAttribute('tabindex', '-1')
      element.focus()
    }
  }

  static setAttributes(el, attrs) {
    Object.keys(attrs).forEach((key) => el.setAttribute(key, attrs[key]))
  }

  static hasClass(el, className) {
    return el.classList.contains(className)
  }

  static addClass(el, className) {
    const classList = className.split(' ')
    el.classList.add(classList[0])
    if (classList.length > 1) this.constructor.addClass(el, classList.slice(1).join(' '))
  }

  static removeClass(el, className) {
    const classList = className.split(' ')
    el.classList.remove(classList[0])
    if (classList.length > 1) this.constructor.removeClass(el, classList.slice(1).join(' '))
  }

  static toggleClass(el, className, bool) {
    if (bool) this.addClass(el, className)
    else this.removeClass(el, className)
  }
}

export default Toggletip
