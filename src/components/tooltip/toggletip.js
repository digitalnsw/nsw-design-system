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
    this.toggletipContentId = this.toggletipId ? `${this.toggletipId}-content` : ''
    this.toggletipContent = false
    this.toggletipAnchor = this.toggletip.querySelector('[data-anchor]') || this.toggletip
    this.toggletipText = this.toggletip.innerText
    this.toggletipHeading = this.toggletip.getAttribute('data-title') || this.toggletipText
    this.arrowElement = false
    this.closeButton = false
    this.toggletipIsOpen = false
    this.toggletipVisibleClass = 'active'
    this.firstFocusable = false
    this.lastFocusable = false
    this.handleDocumentFocusIn = (event) => this.onDocumentFocusIn(event)
  }

  init() {
    if (!this.toggletipElement) return

    const { toggletipElement } = this
    this.toggletipContent = toggletipElement.innerHTML

    const {
      toggletip,
      toggletipHeading,
      toggletipText,
    } = this
    const labelText = (toggletipText || '').trim() || (toggletipHeading || '').trim()
    const hasAriaLabel = toggletip.hasAttribute('aria-label')
    const attributes = {
      tabindex: '0',
      'aria-expanded': 'false',
      role: 'button',
    }
    if (!hasAriaLabel && labelText) {
      attributes['aria-label'] = `${labelText} toggletip`
    }

    this.constructor.setAttributes(toggletip, attributes)
    this.initEvents()
  }

  initEvents() {
    this.toggletip.addEventListener('click', this.toggleToggletip.bind(this))

    this.toggletip.addEventListener('keydown', (event) => {
      const { key, code } = event
      const eventKey = key && key.toLowerCase()
      const eventCode = code && code.toLowerCase()
      const isEnter = eventKey === 'enter' || eventCode === 'enter'
      const isSpace = eventKey === ' ' || eventKey === 'spacebar' || eventCode === 'space'

      if (isEnter || isSpace) {
        event.preventDefault()
        this.toggleToggletip()
      }
    })

    this.toggletipElement.addEventListener('keydown', this.trapFocus.bind(this))

    window.addEventListener('click', (event) => {
      const { target } = event
      this.checkToggletipClick(target)
    })

    window.addEventListener('keyup', (event) => {
      const { key, code } = event
      const eventKey = key && key.toLowerCase()
      const eventCode = code && code.toLowerCase()
      if (eventCode === 'escape' || eventKey === 'escape') {
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
      this.showToggletip()
    }
  }

  createToggletipElement() {
    const { toggletipContentId, toggletipHeading } = this
    if (this.toggletipElement) {
      this.toggletipElement.innerHTML = ''
      const createToggletip = `
      <div class="nsw-toggletip__header">
        <button type="button" class="nsw-icon-button">
          <span class="sr-only">Close tooltip</span>
          <span class="material-icons nsw-material-icons" focusable="false" aria-hidden="true">close</span>
        </button>
      </div>
      <div id="${toggletipContentId}" class="nsw-toggletip__content">
        ${cleanHTMLStrict(this.toggletipContent)}
      </div>
      <div class="nsw-toggletip__arrow"></div>`
      this.toggletipElement.insertAdjacentHTML('afterbegin', createToggletip)
    }

    this.constructor.setAttributes(this.toggletipElement, {
      'aria-label': toggletipHeading,
      'aria-describedby': toggletipContentId,
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

    this.updateToggletip(this.toggletipElement, this.arrowElement)
    this.closeButton.addEventListener('click', this.toggleToggletip.bind(this))
    document.addEventListener('focusin', this.handleDocumentFocusIn)
  }

  hideToggletip({ returnFocus = true } = {}) {
    this.toggletip.setAttribute('aria-expanded', 'false')
    this.toggletipElement.classList.remove('active')

    this.toggletipIsOpen = false
    const { activeElement } = document
    const toggletipContainsFocus = this.toggletipElement
      && activeElement
      && (this.toggletipElement === activeElement || this.toggletipElement.contains(activeElement))
    if (toggletipContainsFocus && returnFocus) {
      this.constructor.moveFocus(this.toggletip)
    }
    document.removeEventListener('focusin', this.handleDocumentFocusIn)
  }

  onDocumentFocusIn(event) {
    if (!this.toggletipIsOpen) return
    const { target } = event
    if (!this.toggletipElement || !target) return
    if (this.toggletipElement.contains(target)) return
    this.hideToggletip({ returnFocus: false })
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
    const {
      key, code, keyCode, shiftKey,
    } = event
    const eventKey = key && key.toLowerCase()
    const eventCode = code && code.toLowerCase()
    const isTab = eventCode === 'tab' || eventKey === 'tab' || keyCode === 9
    if (!isTab) return
    const { firstFocusable, lastFocusable } = this
    const isSingleFocusable = firstFocusable && lastFocusable && firstFocusable === lastFocusable
    if (isSingleFocusable) {
      const { activeElement } = document
      if (activeElement === firstFocusable && !shiftKey) {
        event.preventDefault()
        this.hideToggletip({ returnFocus: true })
      }
      return
    }

    if (firstFocusable === document.activeElement && shiftKey) {
      event.preventDefault()
      lastFocusable.focus()
    }
    if (lastFocusable === document.activeElement && !shiftKey) {
      event.preventDefault()
      firstFocusable.focus()
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
