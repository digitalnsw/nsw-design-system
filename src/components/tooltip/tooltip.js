/* eslint-disable max-len */
import {
  computePosition,
  flip,
  shift,
  offset,
  arrow,
} from '@floating-ui/dom'
import { uniqueId } from '../../global/scripts/helpers/utilities'
import logger from '../../global/scripts/helpers/logger'

class Tooltip {
  constructor(element) {
    this.tooltip = element
    const { tooltip } = this
    this.uID = uniqueId('tooltip')
    this.tooltipElement = false
    this.arrowElement = false
    this.tooltipContent = false
    this.tooltipDelay = 400
    this.screenSize = false
    this.tooltipTheme = this.tooltip.getAttribute('data-theme') || 'dark'
    this.showTimeout = null
    this.hideTimeout = null
    this.initialDescribedBy = tooltip.getAttribute('aria-describedby')
    this.describedByAdded = false
  }

  init() {
    const { tooltip } = this
    this.tooltipContent = tooltip.getAttribute('title')
    if (!this.tooltipContent) return
    const labelText = (tooltip.textContent || '').trim()
    const hasAriaLabel = tooltip.hasAttribute('aria-label')
    const attributes = {
      'data-tooltip-content': this.tooltipContent,
      tabindex: '0',
    }
    if (!hasAriaLabel && labelText) {
      attributes['aria-label'] = `${labelText} tooltip`
    }
    this.constructor.setAttributes(tooltip, attributes)
    tooltip.removeAttribute('title')

    const eventArray = ['mouseenter', 'mouseleave', 'focus', 'blur']

    eventArray.forEach((event, { listener = this.handleEvent.bind(this) }) => {
      this.tooltip.addEventListener(event, listener)
    })

    tooltip.addEventListener('keydown', this.handleKeydown.bind(this))
  }

  handleEvent(event) {
    switch (event.type) {
      case 'mouseenter':
      case 'focus':
        this.showTooltip()
        break
      case 'mouseleave':
      case 'blur':
        this.hideTooltip()
        break
      default:
        logger.log(`Unexpected event type: ${event.type}`)
        break
    }
  }

  handleKeydown(event) {
    const { key, code, keyCode } = event
    const eventKey = key && key.toLowerCase()
    const eventCode = code && code.toLowerCase()
    const isEscape = eventCode === 'escape' || eventKey === 'escape' || keyCode === 27
    if (!isEscape) return
    event.preventDefault()
    this.hideTooltip({ immediate: true })
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
    const {
      initialDescribedBy,
      tooltip,
      tooltipDelay,
      uID,
    } = this
    clearTimeout(this.hideTimeout)
    this.showTimeout = window.setTimeout(() => {
      this.createTooltipElement()

      if (this.tooltipElement) this.tooltipElement.removeAttribute('aria-hidden')
      if (tooltip) {
        const describedByTokens = (initialDescribedBy || '').split(/\s+/).filter(Boolean)
        if (describedByTokens.includes(uID)) {
          tooltip.setAttribute('aria-describedby', describedByTokens.join(' '))
          this.describedByAdded = false
        } else {
          const nextDescribedBy = [...describedByTokens, uID].join(' ')
          tooltip.setAttribute('aria-describedby', nextDescribedBy)
          this.describedByAdded = true
        }
      }
      this.tooltipElement.classList.add('active')

      const range = document.createRange()
      const text = this.tooltipElement.childNodes[0]
      range.setStartBefore(text)
      range.setEndAfter(text)
      const clientRect = range.getBoundingClientRect()
      this.matchMedia()
      this.tooltipElement.style.width = `${clientRect.width + this.screenSize}px`

      this.updateTooltip(this.tooltipElement, this.arrowElement)
    }, tooltipDelay)
  }

  hideTooltip({ immediate = false } = {}) {
    const {
      describedByAdded,
      initialDescribedBy,
      tooltip,
    } = this
    clearTimeout(this.showTimeout)
    const hide = () => {
      if (!this.tooltipElement) return
      this.tooltipElement.classList.remove('active')
      this.tooltipElement.setAttribute('aria-hidden', 'true')
      this.tooltipElement.style.width = ''
      if (tooltip && describedByAdded) {
        if (initialDescribedBy) {
          tooltip.setAttribute('aria-describedby', initialDescribedBy)
        } else {
          tooltip.removeAttribute('aria-describedby')
        }
        this.describedByAdded = false
      }
    }

    if (immediate) {
      hide()
      return
    }

    this.hideTimeout = window.setTimeout(hide, this.tooltipDelay)
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
