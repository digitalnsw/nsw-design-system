class SitewideMessage {
  constructor(element) {
    this.messageElement = element
    this.closeButton = element.querySelector('.nsw-sitewide-message__close')
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

export default SitewideMessage
