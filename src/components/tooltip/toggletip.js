/* eslint-disable max-len */
import {
  computePosition,
  flip,
  shift,
  offset,
  arrow,
} from '@floating-ui/dom'

class Toggletip {
  constructor(element) {
    this.toggletip = element
    this.toggletipId = this.toggletip.getAttribute('aria-controls')
    this.toggletipElement = document.querySelector(`#${this.toggletipId}`)
    this.toggletipContent = this.toggletipElement.innerHTML
    this.toggletipHeading = this.toggletip.getAttribute('data-title')
    this.toggletipText = this.toggletip.innerText
    this.arrowElement = false
    this.closeButton = false
    this.toggletipIsOpen = false
    this.toggletipVisibleClass = 'active'
    this.firstFocusable = false
    this.lastFocusable = false
  }

  init() {
    this.toggletip.setAttribute('tabindex', '0')
    this.initEvents()
  }

  initEvents() {
    window.addEventListener('keyup', (event) => {
      if ((event.code && event.code.toLowerCase() === 'escape') || (event.key && event.key.toLowerCase() === 'escape')) {
        if (!this.toggletipIsOpen) return
        this.toggleToggletip()
      }
    })

    this.toggletipElement.addEventListener('keydown', (event) => {
      if ((event.code && event.code.toLowerCase() === 'tab') || (event.key && event.key.toLowerCase() === 'tab')) {
        this.trapFocus(event)
      }
    })

    this.toggletip.addEventListener('click', this.toggleToggletip.bind(this))

    window.addEventListener('click', (event) => {
      this.checkToggletipClick(event.target)
    })

    this.toggletip.addEventListener('keyup', (event) => {
      if ((event.code && event.code.toLowerCase() === 'enter') || (event.key && event.key.toLowerCase() === 'enter')) {
        this.toggleToggletip()
      }
    })

    window.addEventListener('resize', () => {
      if (this.toggletipIsOpen) this.toggleToggletip()
    })

    window.addEventListener('scroll', () => {
      if (this.toggletipIsOpen) this.toggleToggletip()
    })
  }

  toggleToggletip() {
    if (this.toggletipElement.classList.contains('active')) {
      this.hideToggletip()
    } else {
      this.showToggletip()
    }
  }

  createToggletipElement() {
    if (this.toggletipElement) {
      this.toggletipElement.innerHTML = ''
      const createToggletip = `
      <div class="nsw-toggletip__header">
        <div class="nsw-text-truncate nsw-h6">${this.toggletipHeading ? this.toggletipHeading : this.toggletipText}</div>
        <button type="button" class="nsw-icon-button">
          <span class="sr-only">Remove file</span>
          <span class="material-icons nsw-material-icons" focusable="false" aria-hidden="true">close</span>
        </button>
      </div>
      <div class="nsw-toggletip__content">
        ${this.toggletipContent}
      </div>
      <div class="nsw-toggletip__arrow"></div>`
      this.toggletipElement.insertAdjacentHTML('afterbegin', createToggletip)
    }

    this.constructor.setAttributes(this.toggletipElement, {
      'aria-expanded': 'false',
      'aria-haspopup': 'true',
      role: 'dialog',
    })
  }

  showToggletip() {
    this.toggletip.focus()
    this.createToggletipElement()
    this.arrowElement = this.toggletipElement.querySelector('.nsw-toggletip__arrow')
    this.closeButton = this.toggletipElement.querySelector('.nsw-icon-button')

    this.toggletipElement.classList.add('active')
    this.toggletipIsOpen = true

    this.getFocusableElements()
    this.focusToggletip()

    this.toggletip.addEventListener('transitionend', () => {
      this.focusToggletip()
    }, { once: true })

    this.updateToggletip(this.toggletipElement, this.arrowElement)
    this.closeButton.addEventListener('click', this.toggleToggletip.bind(this))
  }

  hideToggletip() {
    this.toggletipElement.classList.remove('active')

    this.toggletipIsOpen = false
  }

  updateToggletip(toggletip, arrowElement, anchor = this.toggletip) {
    computePosition(anchor, toggletip, {
      placement: 'top',
      middleware: [
        offset(6),
        flip(),
        shift({ padding: 5 }),
        arrow({ element: arrowElement }),
      ],
    }).then(({
      x, y, placement, middlewareData,
    }) => {
      Object.assign(toggletip.style, {
        left: `${x}px`,
        top: `${y}px`,
      })

      const { x: arrowX, y: arrowY } = middlewareData.arrow

      const staticSide = {
        top: 'bottom',
        right: 'left',
        bottom: 'top',
        left: 'right',
      }[placement.split('-')[0]]

      Object.assign(arrowElement.style, {
        left: arrowX != null ? `${arrowX}px` : '',
        top: arrowY != null ? `${arrowY}px` : '',
        right: '',
        bottom: '',
        [staticSide]: '-4px',
      })
    })
  }

  checkToggletipClick(target) {
    if (!this.toggletipIsOpen) return
    if (!this.toggletip.contains(target) && !target.closest(`[aria-controls="${this.toggletipId}"]`)) this.toggleToggletip()
  }

  focusToggletip() {
    if (this.firstFocusable) {
      this.firstFocusable.focus()
    } else {
      this.constructor.moveFocus(this.toggletip)
    }
  }

  getFocusableElements() {
    // get all focusable elements inside the toggletip
    const focusableElString = '[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary'
    const allFocusable = this.toggletipElement.querySelectorAll(focusableElString)
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
}

export default Toggletip
