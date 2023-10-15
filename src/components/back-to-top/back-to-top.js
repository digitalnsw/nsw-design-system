class BackTop {
  constructor(element) {
    this.element = element
    this.dataElement = this.element.getAttribute('data-element')
    this.scrollElement = this.dataElement ? document.querySelector(this.dataElement) : window
    // show back-to-top if scrolling > scrollOffset
    this.scrollOffsetInit = parseInt(this.element.getAttribute('data-offset-in'), 10) || parseInt(this.element.getAttribute('data-offset'), 10) || 0
    this.scrollOffsetOutInit = parseInt(this.element.getAttribute('data-offset-out'), 10) || 0
    this.scrollOffset = 0
    this.scrollOffsetOut = 0
    this.scrolling = false
    // check if target-in/target-out have been set
    this.targetIn = this.element.getAttribute('data-target-in') ? document.querySelector(this.element.getAttribute('data-target-in')) : false
    this.targetOut = this.element.getAttribute('data-target-out') ? document.querySelector(this.element.getAttribute('data-target-out')) : false
  }

  init() {
    this.updateOffsets()

    // detect click on back-to-top link
    this.element.addEventListener('click', (event) => {
      event.preventDefault()

      if (!window.requestAnimationFrame) {
        this.scrollElement.scrollTo(0, 0)
      } else if (this.dataElement) {
        this.scrollElement.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }

      // move the focus to the #top-element - don't break keyboard navigation
      this.constructor.moveFocus(document.getElementById(this.element.getAttribute('href').replace('#', '')))
    })

    // listen to the window scroll and update back-to-top visibility
    this.checkBackToTop()

    if (this.scrollOffset > 0 || this.scrollOffsetOut > 0) {
      this.scrollElement.addEventListener('scroll', () => {
        if (!this.scrolling) {
          this.scrolling = true
          if (!window.requestAnimationFrame) {
            setTimeout(() => { this.checkBackToTop() }, 250)
          } else {
            window.requestAnimationFrame(() => this.checkBackToTop())
          }
        }
      })
    }
  }

  checkBackToTop() {
    this.updateOffsets()
    let windowTop = this.scrollElement.scrollTop || document.documentElement.scrollTop
    if (!this.dataElement) windowTop = window.scrollY || document.documentElement.scrollTop
    let condition = windowTop >= this.scrollOffset
    if (this.scrollOffsetOut > 0) {
      condition = (windowTop >= this.scrollOffset) && (window.innerHeight + windowTop < this.scrollOffsetOut)
    }
    this.element.classList.toggle('active', condition)
    this.scrolling = false
  }

  updateOffsets() {
    this.scrollOffset = this.getOffset(this.targetIn, this.scrollOffsetInit, true)
    this.scrollOffsetOut = this.getOffset(this.targetOut, this.scrollOffsetOutInit)
  }

  getOffset(target, startOffset, bool) {
    let offset = 0
    if (target) {
      let windowTop = this.scrollElement.scrollTop || document.documentElement.scrollTop
      if (!this.dataElement) windowTop = window.scrollY || document.documentElement.scrollTop
      const boundingClientRect = target.getBoundingClientRect()
      offset = bool ? boundingClientRect.bottom : boundingClientRect.top
      offset += windowTop
    }
    if (startOffset && startOffset) {
      offset += parseInt(startOffset, 10)
    }
    return offset
  }

  static moveFocus(element) {
    let e = element
    if (!element) e = document.querySelector('body')
    e.focus()
    if (document.activeElement !== e) {
      e.setAttribute('tabindex', '-1')
      e.focus()
    }
  }
}

export default BackTop
