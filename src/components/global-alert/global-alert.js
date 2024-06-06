class GlobalAlert {
  constructor(element) {
    this.element = element
    this.closeButton = this.element.querySelector('button.js-close-alert')
  }

  init() {
    if (!this.closeButton) return
    this.controls()
  }

  controls() {
    this.closeButton.addEventListener('click', (event) => {
      this.closeMessage(event)
    }, false)
  }

  closeMessage() {
    this.element.hidden = true
  }
}

export default GlobalAlert
