class GlobalAlert {
  constructor(element) {
    this.element = element
    this.closeButton = this.element.querySelector('button.js-close-alert')
    this.cookieName = this.element.getAttribute('data-cookie-name') || false
  }

  init() {
    if (this.cookieName && this.constructor.getCookie(this.cookieName)) {
      this.element.hidden = true
      return
    }
    if (this.closeButton) {
      this.controls()
    }
  }

  controls() {
    this.closeButton.addEventListener('click', () => {
      this.closeMessage()
    })
  }

  closeMessage() {
    this.element.hidden = true
    if (this.cookieName) {
      this.constructor.setCookie(this.cookieName, 'dismissed', 7)
    }
  }

  static setCookie(name, value, days) {
    const date = new Date()
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000))
    const expires = `expires=${date.toUTCString()}`
    document.cookie = `${name}=${value};${expires};path=/`
  }

  static getCookie(name) {
    const nameEQ = `${name}=`
    const ca = document.cookie.split(';')
    for (let i = 0; i < ca.length; i += 1) {
      let c = ca[i]
      while (c.charAt(0) === ' ') c = c.substring(1, c.length)
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
    }
    return null
  }
}

export default GlobalAlert
