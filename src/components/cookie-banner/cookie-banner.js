class CookieBanner {
  constructor(element) {
    this.messageElement = element
    this.cookieAcceptButton = element.querySelector('.js-cookie-banner-accept')
    this.cookieAcceptEvent = (e) => this.cookieAccept(e)
    this.cookieRejectButton = element.querySelector('.js-cookie-banner-reject')
    this.cookieRejectEvent = (e) => this.cookieReject(e)
  }

  init() {
    this.controls()
  }

  controls() {
    this.cookieAcceptButton.addEventListener('click', this.cookieAcceptEvent, false)
    this.cookieRejectButton.addEventListener('click', this.cookieRejectEvent, false)
  }

  cookieAccept() {
    this.messageElement.hidden = true
    document.cookie = 'cookie-banner=accepted;max-age=31536000'
  }

  cookieReject() {
    this.messageElement.hidden = true
    document.cookie = 'cookie-banner=rejected;max-age=31536000'
  }
}

export default CookieBanner
