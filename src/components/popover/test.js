/* eslint-disable max-len */
import {
  computePosition,
  flip,
  shift,
  limitShift,
  offset,
} from '@floating-ui/dom'

class Popover {
  constructor(element) {
    this.element = element
    this.popoverId = this.element.getAttribute('aria-controls')
    this.popoverPosition = this.element.dataset.popoverPosition ?? 'bottom'
    this.popoverClassList = this.element.dataset.popoverClass
    this.popoverGap = parseInt(this.element.dataset.popoverGap, 10) ?? 5
    this.popoverAnchor = this.element.querySelector('[data-anchor]') || this.element
    this.popoverElement = this.popoverId && document.querySelector(`#${this.popoverId}`)
    this.popoverVisibleClass = 'active'
    this.popoverContent = false
    this.popoverIsOpen = false
    this.firstFocusable = null
    this.lastFocusable = null
  }

  init() {
    if (!this.popoverElement) return

    Popover.setAttributes(this.element, {
      tabindex: '0',
      'aria-haspopup': 'dialog',
    })
    this.initEvents()
  }

  initEvents() {
    this.element.addEventListener('click', () => this.togglePopover())

    this.element.addEventListener('keyup', (event) => {
      if ((event.code && event.code.toLowerCase() === 'enter') || (event.key && event.key.toLowerCase() === 'enter')) {
        this.togglePopover()
      }
    })

    window.addEventListener('DOMContentLoaded', () => {
      this.popoverContent = this.popoverElement.innerHTML
    })

    this.popoverElement.addEventListener('keydown', (event) => this.trapFocus(event))

    window.addEventListener('click', (event) => {
      this.checkPopoverClick(event.target)
    })

    window.addEventListener('keyup', (event) => {
      if ((event.code && event.code.toLowerCase() === 'escape') || (event.key && event.key.toLowerCase() === 'escape')) {
        this.checkPopoverFocus()
      }
    })

    this.debouncedTogglePopover = this.debounce(this.togglePopover.bind(this), 300)
    window.addEventListener('resize', this.debouncedTogglePopover)
    window.addEventListener('scroll', this.debouncedTogglePopover)
  }

  debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }

  togglePopover() {
    if (this.popoverElement.classList.contains(this.popoverVisibleClass)) {
      this.hidePopover()
    } else {
      this.popoverElement.focus()
      this.showPopover()
    }
  }

  showPopover() {
    Popover.setAttributes(this.popoverElement, {
      tabindex: '0',
      role: 'dialog',
    })

    this.popoverElement.setAttribute('aria-expanded', 'true')
    this.popoverElement.classList.add(this.popoverVisibleClass)
    this.popoverIsOpen = true

    this.getFocusableElements()
    this.popoverElement.focus({ preventScroll: true })
    this.element.addEventListener('transitionend', () => { this.focusPopover() }, { once: true })

    this.updatePopover(this.popoverElement, this.popoverPosition)
  }

  hidePopover() {
    this.popoverElement.setAttribute('aria-expanded', 'false')
    this.popoverElement.classList.remove(this.popoverVisibleClass)
    this.popoverIsOpen = false
  }

  async updatePopover(popover, placement, anchor = this.popoverAnchor) {
    try {
      const { x, y } = await computePosition(anchor, popover, {
        placement,
        middleware: [
          offset(this.popoverGap),
          flip({
            fallbackAxisSideDirection: 'start',
            crossAxis: false,
          }),
          shift({
            limiter: limitShift(),
          }),
        ],
      })
      Object.assign(popover.style, {
        left: `${x}px`,
        top: `${y}px`,
      })
    } catch (error) {
      console.error('Error updating popover position:', error)
    }
  }

  checkPopoverClick(target) {
    if (!this.popoverIsOpen) return
    if (!this.popoverElement.contains(target) && !target.closest(`[aria-controls="${this.popoverId}"]`)) this.togglePopover()
  }

  checkPopoverFocus() {
    if (!this.popoverIsOpen) return
    Popover.moveFocus(this.element)
    this.togglePopover()
  }

  focusPopover() {
    if (this.firstFocusable) {
      this.firstFocusable.focus({ preventScroll: true })
    } else {
      Popover.moveFocus(this.popoverElement)
    }
  }

  getFocusableElements() {
    const focusableElString = '[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary'
    const allFocusable = this.popoverElement.querySelectorAll(focusableElString)
    this.getFirstVisible(allFocusable)
    this.getLastVisible(allFocusable)
  }

  getFirstVisible(elements) {
    for (let i = 0; i < elements.length; i += 1) {
      if (Popover.isVisible(elements[i])) {
        this.firstFocusable = elements[i]
        break
      }
    }
  }

  getLastVisible(elements) {
    for (let i = elements.length - 1; i >= 0; i -= 1) {
      if (Popover.isVisible(elements[i])) {
        this.lastFocusable = elements[i]
        break
      }
    }
  }

  trapFocus(event) {
    if (this.firstFocusable === document.activeElement && event.shiftKey) {
      event.preventDefault()
      this.lastFocusable.focus()
    }
    if (this.lastFocusable === document.activeElement && !event.shiftKey) {
      event.preventDefault()
      this.firstFocusable.focus()
    }
  }

  static isVisible(element) {
    return element.offsetWidth || element.offsetHeight || element.getClientRects().length
  }

  static moveFocus(element) {
    element.focus({ preventScroll: true })
    if (document.activeElement !== element) {
      element.setAttribute('tabindex', '-1')
      element.focus()
    }
  }

  static setAttributes(el, attrs) {
    Object.keys(attrs).forEach((key) => el.setAttribute(key, attrs[key]))
  }
}

export default Popover
