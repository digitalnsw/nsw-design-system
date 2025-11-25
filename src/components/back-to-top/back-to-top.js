const STICKY_SELECTOR = '.js-sticky-container'
function getStickyHeight() {
  if (typeof document === 'undefined') return 0
  const el = document.querySelector(STICKY_SELECTOR)
  if (!el) return 0
  const rect = el.getBoundingClientRect()
  return Math.max(0, rect.height || 0)
}

class BackTop {
  constructor(element) {
    this.element = element
    this.dataElement = this.element.getAttribute('data-element')
    this.scrollOffset = this.element.getAttribute('data-offset')
    this.text = false
    this.icon = false
    this.scrollElement = this.dataElement ? document.querySelector(this.dataElement) : window
    this.scrollPosition = 0
    this.width = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
    this.height = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
    this.condition = false
    this.stickyObserver = null
    this.bottomGap = 16 // px gap between sticky stack and back-to-top
  }

  init() {
    this.createButton()

    // Ensure button clears the sticky container stack
    this.updateBottomOffset()

    this.element.addEventListener('click', (event) => {
      event.preventDefault()

      if (!window.requestAnimationFrame) {
        this.scrollElement.scrollTo(0, 0)
      } else if (this.dataElement) {
        this.scrollElement.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    })

    this.checkBackToTop()

    const debounceEvent = this.debounce(this.checkBackToTop)
    this.scrollElement.addEventListener('scroll', () => { debounceEvent() })

    const debounceResize = this.debounce(this.resizeHandler)
    window.addEventListener('resize', () => { debounceResize() })

    // Keep offset synced with sticky container and viewport changes
    const debounceOffset = this.debounce(this.updateBottomOffset)
    window.addEventListener('resize', () => { debounceOffset() })

    const stickyEl = typeof document !== 'undefined' ? document.querySelector(STICKY_SELECTOR) : null
    if (stickyEl && 'ResizeObserver' in window) {
      this.stickyObserver = new ResizeObserver(() => this.updateBottomOffset())
      this.stickyObserver.observe(stickyEl)
    }
  }

  createButton() {
    const textSpan = this.constructor.createElement('span')
    const iconSpan = this.constructor.createElement('span', ['material-icons', 'nsw-material-icons'], {
      title: 'Back to top',
      focusable: 'false',
      'aria-hidden': 'true',
    })

    this.element.append(textSpan, iconSpan)

    this.text = this.element.querySelector('span:not(.material-icons)')
    this.icon = this.element.querySelector('span.material-icons')

    this.createButtonContent()
  }

  createButtonContent() {
    if (this.width < 768) {
      this.text.innerText = 'Top'
      this.icon.innerText = 'keyboard_arrow_up'
    } else {
      this.text.innerText = 'Back to top'
      this.icon.innerText = 'north'
    }
  }

  updateBottomOffset() {
    const stickyH = getStickyHeight()
    // Apply inline bottom so it clears the sticky stack plus a small gap
    try {
      this.element.style.bottom = `${stickyH + this.bottomGap}px`
    } catch (_) {
      // no-op
    }
  }

  checkBackToTop() {
    let windowTop = this.scrollElement.scrollTop || document.documentElement.scrollTop
    if (!this.dataElement) windowTop = window.scrollY || document.documentElement.scrollTop

    const scroll = this.scrollPosition
    this.scrollPosition = window.scrollY

    if (this.scrollOffset && this.scrollOffset > 0) {
      this.condition = windowTop >= this.scrollOffset
      this.element.classList.toggle('active', this.condition)
    } else {
      this.condition = scroll > this.scrollPosition && this.scrollPosition > 200
      this.element.classList.toggle('active', this.condition)
    }
  }

  resizeHandler() {
    const oldWidth = this.width
    const oldHeight = this.height

    this.width = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
    this.height = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)

    if (oldWidth !== this.width && oldHeight === this.height) {
      this.createButtonContent()
    }
  }

  debounce(fn, wait = 250) {
    let timeout

    return (...args) => {
      const context = this

      if (!window.requestAnimationFrame) {
        clearTimeout(timeout)
        timeout = setTimeout(() => fn.apply(context, args), wait)
      } else {
        if (timeout) {
          window.cancelAnimationFrame(timeout)
        }

        timeout = window.requestAnimationFrame(() => {
          fn.apply(context, args)
        })
      }
    }
  }

  static createElement(tag, classes = [], attributes = {}) {
    const element = document.createElement(tag)
    if (classes.length > 0) {
      element.classList.add(...classes)
    }

    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value)
    })

    return element
  }
}

export default BackTop
