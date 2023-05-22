/* eslint-disable max-len, import/no-extraneous-dependencies */
import {
  computePosition,
  flip,
  shift,
  offset,
  arrow,
} from '@floating-ui/dom'

class Tooltip {
  constructor(element) {
    this.element = element
    this.tooltip = false
    this.arrowElement = false
    this.tooltipContent = false
    this.tooltipId = 'nsw-tooltip'
    this.tooltipTriggers = document.querySelectorAll('.nsw-tooltip-trigger')

    this.showTooltip = (event) => {
      this.createTooltipElement(event.target)
      this.tooltip.style.display = 'inline-block'
      // Set dynamic width
      const range = document.createRange()
      const text = this.tooltip.childNodes[0]
      range.setStartBefore(text)
      range.setEndAfter(text)
      const clientRect = range.getBoundingClientRect()
      this.tooltip.style.width = `${clientRect.width + 32}px`

      this.updateTooltip(event.target, this.tooltip, this.arrowElement)
    }

    this.hideTooltip = () => {
      this.tooltip.style.display = ''
      this.tooltip.style.width = ''
    }
  }

  init() {
    const eventArray = [['mouseenter', this.showTooltip], ['mouseleave', this.hideTooltip], ['focus', this.showTooltip], ['blur', this.hideTooltip]]

    const triggerArray = [...this.tooltipTriggers]

    triggerArray.forEach((trigger) => {
      eventArray.forEach(([event, listener]) => {
        trigger.addEventListener(event, listener)
      })
    })
  }

  createTooltipElement(trigger) {
    this.tooltip = document.getElementById(this.tooltipId)

    if (!this.tooltip) {
      this.tooltip = document.createElement('div')
      document.body.appendChild(this.tooltip)
    }

    this.constructor.setAttributes(this.tooltip, { id: this.tooltipId, class: 'nsw-tooltip nsw-section--invert', role: 'tooltip' })

    if (this.tooltip) {
      this.arrowElement = document.createElement('div')
      this.arrowElement.className = 'nsw-tooltip__arrow'
    }

    this.tooltipContent = trigger.getAttribute('title')
    this.tooltip.innerHTML = this.tooltipContent
    this.tooltip.insertAdjacentElement('beforeend', this.arrowElement)
  }

  updateTooltip(anchor, tooltip, arrowElement) {
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
      Object.assign(this.tooltip.style, {
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
}

export default Tooltip
