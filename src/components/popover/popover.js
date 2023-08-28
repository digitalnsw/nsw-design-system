/* eslint-disable radix */
/* eslint-disable max-len, import/no-extraneous-dependencies */
import {
  computePosition,
  // flip,
  autoPlacement,
  shift,
  offset,
} from '@floating-ui/dom'

class Popover {
  constructor(element) {
    this.popover = element
    this.popoverId = this.popover.getAttribute('aria-controls')
    this.popoverPosition = this.popover.dataset.popoverPosition || 'bottom'
    this.popoverClassList = this.popover.dataset.popoverClass
    this.popoverGap = this.popover.dataset.popoverGap || 5
    this.popoverAnchor = this.popover.querySelector('[data-anchor]') || this.popover
    this.popoverElement = document.querySelector(`#${this.popoverId}`)
    this.popoverVisibleClass = 'active'
    this.popoverContent = false
    this.popoverIsOpen = false
    this.firstFocusable = false
    this.lastFocusable = false
  }

  init() {
    this.constructor.setAttributes(this.popover, {
      tabindex: '0',
      'aria-haspopup': 'dialog',
    })
    this.initEvents()
  }

  initEvents() {
    this.popover.addEventListener('click', this.togglePopover.bind(this))

    this.popover.addEventListener('keyup', (event) => {
      if ((event.code && event.code.toLowerCase() === 'enter') || (event.key && event.key.toLowerCase() === 'enter')) {
        this.togglePopover()
      }
    })

    window.addEventListener('DOMContentLoaded', () => {
      this.popoverContent = this.popoverElement.innerHTML
    })

    this.popoverElement.addEventListener('keydown', this.trapFocus.bind(this))

    window.addEventListener('click', (event) => {
      this.checkPopoverClick(event.target)
    })

    window.addEventListener('keyup', (event) => {
      if ((event.code && event.code.toLowerCase() === 'escape') || (event.key && event.key.toLowerCase() === 'escape')) {
        this.checkPopoverFocus()
      }
    })

    window.addEventListener('resize', () => {
      if (this.popoverIsOpen) this.togglePopover()
    })

    window.addEventListener('scroll', () => {
      if (this.popoverIsOpen) this.togglePopover()
    })
  }

  togglePopover() {
    if (this.popoverElement.classList.contains('active')) {
      this.hidePopover()
    } else {
      this.popoverElement.focus()
      this.showPopover()
    }
  }

  showPopover() {
    this.constructor.setAttributes(this.popoverElement, {
      tabindex: '0',
      role: 'dialog',
    })

    this.popoverElement.setAttribute('aria-expanded', 'true')
    this.popoverElement.classList.add('active')
    this.popoverIsOpen = true

    this.getFocusableElements()
    this.popoverElement.focus({ preventScroll: true })
    this.popover.addEventListener('transitionend', () => { this.focusPopover() }, { once: true })

    this.updatePopover(this.popoverElement, this.popoverPosition)
  }

  hidePopover() {
    this.popoverElement.setAttribute('aria-expanded', 'false')
    this.popoverElement.classList.remove('active')

    this.popoverIsOpen = false
  }

  updatePopover(popover, placement, anchor = this.popoverAnchor) {
    computePosition(anchor, popover, {
      placement,
      middleware: [
        offset(parseInt(this.popoverGap)),
        // flip(),
        autoPlacement(),
        shift({ padding: 5 }),
      ],
    }).then(({
      x, y,
    }) => {
      Object.assign(popover.style, {
        left: `${x}px`,
        top: `${y}px`,
      })
    })
  }

  checkPopoverClick(target) {
    if (!this.popoverIsOpen) return
    if (!this.popoverElement.contains(target) && !target.closest(`[aria-controls="${this.popoverId}"]`)) this.togglePopover()
  }

  checkPopoverFocus() {
    if (!this.popoverIsOpen) return
    this.constructor.moveFocus(this.popover)
    this.togglePopover()
  }

  focusPopover() {
    if (this.firstFocusable) {
      this.firstFocusable.focus({ preventScroll: true })
    } else {
      this.constructor.moveFocus(this.popoverElement)
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
      if (this.constructor.isVisible(elements[i])) {
        this.firstFocusable = elements[i]
        break
      }
    }
  }

  getLastVisible(elements) {
    for (let i = elements.length - 1; i >= 0; i -= 1) {
      if (this.constructor.isVisible(elements[i])) {
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
