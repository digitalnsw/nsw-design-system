import ScreenSizeDetector from '../../global/scripts/helpers/screen-size-detector'

class BackTop {
  constructor(element) {
    this.element = element
    this.dataElement = this.element.getAttribute('data-element')
    this.scrollOffset = this.element.getAttribute('data-offset')
    this.text = this.element.querySelector('span:not(.material-icons)')
    this.icon = this.element.querySelector('span.material-icons')
    this.scrollElement = this.dataElement ? document.querySelector(this.dataElement) : window
    this.scrolling = false
    this.screen = new ScreenSizeDetector()
    this.scrollPosition = 0
  }

  init() {
    this.createButtonContent()
    this.screen.setMainCallback('widthchange', () => this.createButtonContent())

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
    })

    // listen to the window scroll and update back-to-top visibility
    this.checkBackToTop()

    if (this.scrollOffset > 0) {
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

  createButtonContent() {
    if (this.screen.is.tablet) {
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

      this.scrolling = false
    } else {
      this.scrollEventThrottle((scrollPos, previousScrollPos) => {
        if (previousScrollPos > scrollPos && scrollPos > 200) {
          this.element.classList.add('active')
        } else {
          this.element.classList.remove('active')
        }
      })
    }
  }

  scrollEventThrottle(fn) {
    let ticking = false
    window.addEventListener('scroll', () => {
      const scroll = this.scrollPosition
      this.scrollPosition = window.scrollY
      if (!ticking) {
        window.requestAnimationFrame(() => {
          fn(this.scrollPosition, scroll)
          ticking = false
        })
        ticking = true
      }
    })
  }
}

export default BackTop
