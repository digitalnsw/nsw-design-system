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

    this.showTooltip = () => {
      this.createTooltipElement()
      this.tooltipElement.style.display = 'inline-block'
      // Set dynamic width
      const range = document.createRange()
      const text = this.tooltipElement.childNodes[0]
      range.setStartBefore(text)
      range.setEndAfter(text)
      const clientRect = range.getBoundingClientRect()
      this.tooltipElement.style.width = `${clientRect.width + 32}px`

      this.updateTooltip(this.tooltip, this.tooltipElement, this.arrowElement)
    }

    this.hideTooltip = () => {
      this.tooltipElement.style.display = ''
      this.tooltipElement.style.width = ''
    }
  }

  init() {
    this.tooltip.setAttribute('aria-labelledby', this.uID)

    const eventArray = [['mouseenter', this.showTooltip], ['mouseleave', this.hideTooltip], ['focus', this.showTooltip], ['blur', this.hideTooltip]]

    eventArray.forEach(([event, listener]) => {
      this.tooltip.addEventListener(event, listener)
    })
  }

  createTooltipElement() {
    if (!this.tooltipElement) {
      this.tooltipElement = document.createElement('div')
      document.body.appendChild(this.tooltipElement)
    }

    this.constructor.setAttributes(this.tooltipElement, { id: this.uID, class: 'nsw-tooltip__element nsw-section--invert', role: 'tooltip' })

    if (this.tooltip) {
      this.arrowElement = document.createElement('div')
      this.arrowElement.className = 'nsw-tooltip__arrow'
    }

    this.tooltipContent = this.tooltip.getAttribute('title')
    this.tooltipElement.innerHTML = this.tooltipContent
    this.tooltipElement.insertAdjacentElement('beforeend', this.arrowElement)
  }

  updateTooltip(anchor, tooltip, arrowElement) {
    console.log(this)
    computePosition(anchor, tooltip, {
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
        [staticSide]: '-4px',
      })
    })
  }

  static setAttributes(el, attrs) {
    Object.keys(attrs).forEach((key) => el.setAttribute(key, attrs[key]))
  }
}

export default Tooltip
