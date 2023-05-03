/* eslint-disable max-len */
class Tooltip {
  constructor(element) {
    this.element = element
    this.tooltip = false
    this.tooltipIntervalId = false
    this.tooltipContent = this.element.getAttribute('title')
    this.tooltipPosition = (this.element.getAttribute('data-tooltip-position')) ? this.element.getAttribute('data-tooltip-position') : 'top'
    this.tooltipClasses = (this.element.getAttribute('data-tooltip-class')) ? this.element.getAttribute('data-tooltip-class') : false
    this.tooltipId = 'js-tooltip-element'

    this.tooltipDescription = (this.element.getAttribute('data-tooltip-describedby'))

    this.tooltipDelay = 400
    this.tooltipDelta = 10
    this.tooltipTriggerHover = false
    this.tooltipSticky = (this.tooltipClasses && this.tooltipClasses.indexOf('tooltip--sticky') > -1)
    this.tooltipHover = false
    if (this.tooltipSticky) {
      this.tooltipHoverInterval = false
    }
  }

  init() {
    this.resetTooltipContent()
    this.element.removeAttribute('title')
    this.element.setAttribute('tabindex', '0')
    // add event listeners
    this.element.addEventListener('mouseenter', this.handleEvent.bind(this))
    this.element.addEventListener('focus', this.handleEvent.bind(this))
  }

  resetTooltipContent() {
    const htmlContent = this.element.getAttribute('data-tooltip-title')
    if (htmlContent) {
      this.tooltip.tooltipContent = htmlContent
    }
  }

  removeTooltipEvents() {
    // remove event listeners
    this.element.removeEventListener('mouseleave', this.handleEvent.bind(this))
    this.element.removeEventListener('blur', this.handleEvent.bind(this))
  }

  handleEvent(event) {
    switch (event.type) {
      case 'mouseenter':
      case 'focus':
        this.showTooltip(this, event)
        break
      case 'mouseleave':
      case 'blur':
        this.checkTooltip(this)
        break
      case 'newContent':
        this.changeTooltipContent(this, event)
        break
      default:
        console.log(`Unexpected event type: ${event.type}`)
        break
    }
  }

  showTooltip() {
    // tooltip has already been triggered
    if (this.tooltipIntervalId) return

    this.tooltipTriggerHover = true
    // listen to close events
    this.element.addEventListener('mouseleave', this.handleEvent.bind(this))
    this.element.addEventListener('blur', this.handleEvent.bind(this))
    // custom event to reset tooltip content
    this.element.addEventListener('newContent', this.handleEvent.bind(this))

    // show tooltip with a delay
    this.tooltipIntervalId = setTimeout(() => {
      this.createTooltip()
    }, this.tooltipDelay)
  }

  createTooltip() {
    this.tooltip = document.getElementById(this.tooltipId)

    if (!this.tooltip) {
      this.tooltip = document.createElement('div')
      document.body.appendChild(this.tooltip)
    }

    this.tooltip.removeAttribute('data-reset')

    this.constructor.setAttributes(this.tooltip, { id: this.tooltipId, class: 'nsw-tooltip-element nsw-hide js-tooltip-element', role: 'tooltip' })

    this.tooltip.innerHTML = this.tooltipContent

    if (!this.tooltipDescription) {
      this.element.setAttribute('aria-describedby', this.tooltipId)
    } else {
      this.element.setAttribute('aria-describedby', this.tooltipDescription)
    }
    if (this.tooltipClasses) this.constructor.addClass(this.tooltip, this.tooltipClasses)
    if (this.tooltipSticky) this.constructor.addClass(this.tooltip, 'tooltip--sticky')
    this.placeTooltip()
    this.constructor.removeClass(this.tooltip, 'nsw-hide')

    if (!this.tooltipSticky) return
    this.tooltip.addEventListener('mouseenter', function cb() {
      this.tooltipHover = true
      if (this.tooltipHoverInterval) {
        clearInterval(this.tooltipHoverInterval)
        this.tooltipHoverInterval = false
      }
      this.tooltip.removeEventListener('mouseenter', cb)
      this.tooltipLeaveEvent()
    })
  }

  tooltipLeaveEvent() {
    console.log(this)
    this.tooltip.addEventListener('mouseleave', function cb() {
      this.tooltipHover = false
      this.tooltip.removeEventListener('mouseleave', cb)
      this.hideTooltip()
    })
  }

  placeTooltip() {
    // set top and left position of the tooltip according to the data-tooltip-position attr of the trigger
    const dimention = [this.tooltip.offsetHeight, this.tooltip.offsetWidth]
    const positionTrigger = this.element.getBoundingClientRect()
    const position = []
    const scrollY = window.scrollY || window.pageYOffset

    position.top = [(positionTrigger.top - dimention[0] - this.tooltipDelta + scrollY), (positionTrigger.right / 2 + positionTrigger.left / 2 - dimention[1] / 2)]
    position.bottom = [(positionTrigger.bottom + this.tooltipDelta + scrollY), (positionTrigger.right / 2 + positionTrigger.left / 2 - dimention[1] / 2)]
    position.left = [(positionTrigger.top / 2 + positionTrigger.bottom / 2 - dimention[0] / 2 + scrollY), positionTrigger.left - dimention[1] - this.tooltipDelta]
    position.right = [(positionTrigger.top / 2 + positionTrigger.bottom / 2 - dimention[0] / 2 + scrollY), positionTrigger.right + this.tooltipDelta]

    let direction = this.tooltipPosition
    if (direction === 'top' && position.top[0] < scrollY) direction = 'bottom'
    else if (direction === 'bottom' && position.bottom[0] + this.tooltipDelta + dimention[0] > scrollY + window.innerHeight) direction = 'top'
    else if (direction === 'left' && position.left[1] < 0) direction = 'right'
    else if (direction === 'right' && position.right[1] + dimention[1] > window.innerWidth) direction = 'left'

    // reset tooltip triangle translate value
    this.tooltip.style.setProperty(this.tooltipTriangleVar, '0px')

    if (direction === 'top' || direction === 'bottom') {
      const deltaMarg = 3
      if (position[direction][1] < 0) {
        position[direction][1] = deltaMarg
        // make sure triangle is at the center of the tooltip trigger
        this.tooltip.style.setProperty(this.tooltipTriangleVar, `${positionTrigger.left + 0.5 * positionTrigger.width - 0.5 * dimention[1] - deltaMarg}px`)
      }
      if (position[direction][1] + dimention[1] > window.innerWidth) {
        position[direction][1] = window.innerWidth - dimention[1] - deltaMarg
        // make sure triangle is at the center of the tooltip trigger
        this.tooltip.style.setProperty(this.tooltipTriangleVar, `${0.5 * dimention[1] - (window.innerWidth - positionTrigger.right) - 0.5 * positionTrigger.width + deltaMarg}px`)
      }
    }
    this.tooltip.style.top = `${position[direction][0]}px`
    this.tooltip.style.left = `${position[direction][1]}px`
    this.constructor.addClass(this.tooltip, `nsw-tooltip-element--${direction}`)
  }

  checkTooltip() {
    this.tooltipTriggerHover = false
    if (!this.tooltipSticky) this.hideTooltip()
    else {
      if (this.tooltipHover) return
      if (this.tooltipHoverInterval) return
      this.tooltipHoverInterval = setTimeout(() => {
        this.hideTooltip()
        this.tooltipHoverInterval = false
      }, 300)
    }
  }

  hideTooltip() {
    if (this.tooltipHover || this.tooltipTriggerHover) return
    clearInterval(this.tooltipIntervalId)
    if (this.tooltipHoverInterval) {
      clearInterval(this.tooltipHoverInterval)
      this.tooltipHoverInterval = false
    }
    this.tooltipIntervalId = false
    if (!this.tooltip) return
    // hide tooltip
    this.removeTooltip()
    // remove events
    this.removeTooltipEvents()
  }

  removeTooltip() {
    if (this.tooltipContent === this.tooltip.innerHTML || this.tooltip.getAttribute('data-reset') === 'on') {
      this.constructor.addClass(this.tooltip, 'nsw-hide')
      this.tooltip.removeAttribute('data-reset')
    }
    if (this.tooltipDescription) this.element.removeAttribute('aria-describedby')
  }

  changeTooltipContent(tooltip, event) {
    const tooltipObj = tooltip
    if (this.tooltip && this.tooltipTriggerHover && event.detail) {
      this.tooltip.innerHTML = event.detail
      this.tooltip.setAttribute('data-reset', 'on')
      this.placeTooltip(tooltipObj)
    }
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
