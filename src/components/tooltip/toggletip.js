/* eslint-disable max-len, import/no-extraneous-dependencies */
import {
  computePosition,
  flip,
  shift,
  offset,
  arrow,
} from '@floating-ui/dom'
import { cleanHTMLStrict } from '../../global/scripts/helpers/sanitize'

class Toggletip {
  constructor(element) {
    this.toggletip = element
    this.toggletipId = this.toggletip.getAttribute('aria-controls')
    this.toggletipElement = this.toggletipId && document.querySelector(`#${this.toggletipId}`)
    this.toggletipHeaderId = this.toggletipId ? `${this.toggletipId}-header` : ''
    this.toggletipContentId = this.toggletipId ? `${this.toggletipId}-content` : ''
    this.toggletipContent = false
    this.toggletipAnchor = this.toggletip.querySelector('[data-anchor]') || this.toggletip
    this.toggletipText = this.toggletip.innerText
    this.toggletipHeading = this.toggletip.getAttribute('data-title') || this.toggletipText
    this.arrowElement = false
    this.closeButton = false
    this.toggletipIsOpen = false
    this.toggletipVisibleClass = 'active'
    this.ignoreNextTriggerKeyup = false
    this.firstFocusable = false
    this.lastFocusable = false
  }

  init() {
    if (!this.toggletipElement) return

    this.constructor.setAttributes(this.toggletip, {
      tabindex: '0',
      'aria-haspopup': 'dialog',
      'aria-expanded': 'false',
    })
    this.initEvents()
  }

  initEvents() {
    this.toggletip.addEventListener('click', this.toggleToggletip.bind(this))

    this.toggletip.addEventListener('keyup', (event) => {
      if (this.ignoreNextTriggerKeyup) {
        this.ignoreNextTriggerKeyup = false
        return
      }

      const key = event.key && event.key.toLowerCase()
      const code = event.code && event.code.toLowerCase()
      const isEnter = key === 'enter' || code === 'enter'
      const isSpace = key === ' ' || key === 'spacebar' || code === 'space'

      if (isEnter || isSpace) {
        event.preventDefault()
        this.toggleToggletip()
      }
    })

    window.addEventListener('DOMContentLoaded', () => {
      this.toggletipContent = this.toggletipElement.innerHTML
    })

    this.toggletipElement.addEventListener('keydown', this.trapFocus.bind(this))

    window.addEventListener('click', (event) => {
      this.checkToggletipClick(event.target)
    })

    window.addEventListener('keyup', (event) => {
      if ((event.code && event.code.toLowerCase() === 'escape') || (event.key && event.key.toLowerCase() === 'escape')) {
        this.checkToggletipFocus()
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
      this.toggletipElement.focus()
      this.showToggletip()
    }
  }

  createToggletipElement() {
    if (this.toggletipElement) {
      this.toggletipElement.innerHTML = ''
      const createToggletip = `
      <div class="nsw-toggletip__header">
        <div id="${this.toggletipHeaderId}" class="sr-only">${cleanHTMLStrict(this.toggletipHeading)}</div>
        <button type="button" class="nsw-icon-button">
          <span class="sr-only">Close tooltip</span>
          <span class="material-icons nsw-material-icons" focusable="false" aria-hidden="true">close</span>
        </button>
      </div>
      <div id="${this.toggletipContentId}" class="nsw-toggletip__content">
        ${cleanHTMLStrict(this.toggletipContent)}
      </div>
      <div class="nsw-toggletip__arrow"></div>`
      this.toggletipElement.insertAdjacentHTML('afterbegin', createToggletip)
    }

    this.constructor.setAttributes(this.toggletipElement, {
      'aria-labelledby': this.toggletipHeaderId,
      'aria-describedby': this.toggletipContentId,
      tabindex: '0',
      role: 'dialog',
    })
  }

  showToggletip() {
    this.createToggletipElement()
    this.arrowElement = this.toggletipElement.querySelector('.nsw-toggletip__arrow')
    this.closeButton = this.toggletipElement.querySelector('.nsw-icon-button')

    this.toggletip.setAttribute('aria-expanded', 'true')
    this.toggletipElement.classList.add('active')
    this.toggletipIsOpen = true

    this.getFocusableElements()
    this.toggletipElement.focus({ preventScroll: true })
    this.toggletip.addEventListener('transitionend', () => { this.focusToggletip() }, { once: true })

    this.updateToggletip(this.toggletipElement, this.arrowElement)
    this.closeButton.addEventListener('click', this.toggleToggletip.bind(this))
    this.closeButton.addEventListener('keydown', (event) => {
      const key = event.key && event.key.toLowerCase()
      const code = event.code && event.code.toLowerCase()
      const isEnter = key === 'enter' || code === 'enter'
      if (isEnter) {
        this.ignoreNextTriggerKeyup = true
      }
    })
  }

  hideToggletip() {
    this.toggletip.setAttribute('aria-expanded', 'false')
    this.toggletipElement.classList.remove('active')

    this.toggletipIsOpen = false
    this.constructor.moveFocus(this.toggletip)
  }

  updateToggletip(toggletip, arrowElement, anchor = this.toggletipAnchor) {
    computePosition(anchor, toggletip, {
      placement: 'top',
      middleware: [
        offset(8),
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
        [staticSide]: '-6px',
      })
    })
  }

  checkToggletipClick(target) {
    if (!this.toggletipIsOpen) return
    if (!this.toggletipElement.contains(target) && !target.closest(`[aria-controls="${this.toggletipId}"]`)) this.toggleToggletip()
  }

  checkToggletipFocus() {
    if (!this.toggletipIsOpen) return
    this.constructor.moveFocus(this.toggletip)
    this.toggleToggletip()
  }

  focusToggletip() {
    if (this.firstFocusable) {
      this.firstFocusable.focus({ preventScroll: true })
    } else {
      this.constructor.moveFocus(this.toggletipElement)
    }
  }

  getFocusableElements() {
    const focusableElString = '[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary'
    const allFocusable = this.toggletipElement.querySelectorAll(focusableElString)
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
    const isTab = (event.code && event.code.toLowerCase() === 'tab')
      || (event.key && event.key.toLowerCase() === 'tab')
      || event.keyCode === 9
    if (!isTab) return

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

export default Toggletip
