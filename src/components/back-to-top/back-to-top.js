class BackTop {
  constructor(element) {
    this.element = element
    this.dataElement = this.element.getAttribute('data-element')
    this.scrollOffset = this.element.getAttribute('data-offset')
    this.text = this.element.querySelector('span:not(.material-icons)')
    this.icon = this.element.querySelector('span.material-icons')
    this.scrollElement = this.dataElement ? document.querySelector(this.dataElement) : window
    this.scrollPosition = 0
    this.width = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
    this.height = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
  }

  init() {
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

    this.createButtonContent()
    this.checkBackToTop()
    this.scrollUp()

    const debounceOffset = this.debounce(this.checkBackToTop)
    const debounceScroll = this.debounce(this.scrollUp)
    const debounceResize = this.debounce(this.resizeHandler)

    window.addEventListener('resize', () => { debounceResize() }, false)

    if (this.scrollOffset > 0) {
      this.scrollElement.addEventListener('scroll', () => {
        debounceOffset()
      })
    } else {
      this.scrollElement.addEventListener('scroll', () => {
        debounceScroll()
      })
    }
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

  checkBackToTop() {
    let windowTop = this.scrollElement.scrollTop || document.documentElement.scrollTop
    if (!this.dataElement) windowTop = window.scrollY || document.documentElement.scrollTop

    if (this.scrollOffset) {
      const condition = windowTop >= this.scrollOffset

      this.element.classList.toggle('active', condition)
    }
  }

  scrollUp() {
    const scroll = this.scrollPosition
    this.scrollPosition = window.scrollY

    if (scroll > this.scrollPosition && this.scrollPosition > 200) {
      this.element.classList.add('active')
    } else {
      this.element.classList.remove('active')
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
}

export default BackTop
