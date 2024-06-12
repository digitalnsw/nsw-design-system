/* eslint-disable max-len */
import {
  computePosition,
  flip,
  shift,
  offset,
  arrow,
} from '@floating-ui/dom'
import { uniqueId } from '../../global/scripts/helpers/utilities'

class Tooltip {
  constructor(element) {
    this.tooltip = element
    this.uID = uniqueId('tooltip')
    this.tooltipElement = false
    this.arrowElement = false
    this.tooltipContent = false
    this.tooltipDelay = 400
    this.screenSize = false
    this.tooltipTheme = this.tooltip.getAttribute('data-theme') || 'dark'
  }

  init() {
    this.tooltipContent = this.tooltip.getAttribute('title')
    if (!this.tooltipContent) return
    this.constructor.setAttributes(this.tooltip, {
      'data-tooltip-content': this.tooltipContent,
      'aria-describedby': this.uID,
      tabindex: '0',
    })
    this.tooltip.removeAttribute('title')

    const eventArray = ['mouseenter', 'mouseleave', 'focus', 'blur']

    eventArray.forEach((event, { listener = this.handleEvent.bind(this) }) => {
      this.tooltip.addEventListener(event, listener)
    })
  }

  handleEvent(event) {
    switch (event.type) {
      case 'mouseenter':
      case 'focus':
        this.showTooltip(this, event)
        break
      case 'mouseleave':
      case 'blur':
        this.hideTooltip(this, event)
        break
      default:
        console.log(`Unexpected event type: ${event.type}`)
        break
    }
  }

  createTooltipElement() {
    if (!this.tooltipElement) {
      this.tooltipElement = document.createElement('div')
      document.body.appendChild(this.tooltipElement)
    }

    this.constructor.setAttributes(this.tooltipElement, {
      id: this.uID,
      class: `nsw-tooltip__element nsw-tooltip__element--${this.tooltipTheme}`,
      role: 'tooltip',
    })

    if (this.tooltip) {
      this.arrowElement = document.createElement('div')
      this.arrowElement.className = 'nsw-tooltip__arrow'
    }

    this.tooltipContent = this.tooltip.getAttribute('data-tooltip-content')

    this.tooltipElement.innerHTML = this.tooltipContent
    this.tooltipElement.insertAdjacentElement('beforeend', this.arrowElement)
  }

  showTooltip() {
    setTimeout(() => {
      this.createTooltipElement()

      this.tooltipElement.classList.add('active')

      const range = document.createRange()
      const text = this.tooltipElement.childNodes[0]
      range.setStartBefore(text)
      range.setEndAfter(text)
      const clientRect = range.getBoundingClientRect()
      this.matchMedia()
      this.tooltipElement.style.width = `${clientRect.width + this.screenSize}px`

      this.updateTooltip(this.tooltipElement, this.arrowElement)
    }, this.tooltipDelay)
  }

  hideTooltip() {
    setTimeout(() => {
      this.tooltipElement.classList.remove('active')

      this.tooltipElement.style.width = ''
    }, this.tooltipDelay)
  }

  matchMedia() {
    if (window.matchMedia('(min-width: 576px)').matches) {
      this.screenSize = 32
    } else {
      this.screenSize = 16
    }
  }

  updateTooltip(tooltip, arrowElement, anchor = this.tooltip) {
    computePosition(anchor, tooltip, {
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
      Object.assign(tooltip.style, {
        left: `${x}px`,
        top: `${y}px`,
      })

      // Accessing the data
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

  static setAttributes(el, attrs) {
    Object.keys(attrs).forEach((key) => el.setAttribute(key, attrs[key]))
  }
}

export default Tooltip
