class GlobalAlert {
  constructor(element) {
    this.messageElement = element
    this.closeButton = element.querySelector('.js-close-alert')
    this.closeMessageEvent = (e) => this.closeMessage(e)
  }

  init() {
    this.controls()
  }

  controls() {
    this.closeButton.addEventListener('click', this.closeMessageEvent, false)
  }

  closeMessage() {
    this.messageElement.hidden = true
  }
}

export default GlobalAlert
