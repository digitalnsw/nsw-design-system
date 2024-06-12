/* eslint-disable max-len */
class Dialog {
  constructor(element) {
    this.element = element
    this.elementWrapper = this.element.querySelector('.nsw-dialog__wrapper')
    this.openBtn = document.querySelectorAll(`.js-open-dialog-${this.element.getAttribute('id')}`)
    this.closeBtn = this.element.querySelectorAll('.js-close-dialog')
    this.focusableEls = this.element.querySelectorAll('a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled])')
    this.body = document.body
    this.openEvent = this.openDialog.bind(this)
    this.closeEvent = this.closeDialog.bind(this)
    this.clickEvent = this.clickDialog.bind(this)
    this.trapEvent = this.trapFocus.bind(this)
  }

  init() {
    this.controls()
  }

  controls() {
    if (!this.elementWrapper) return

    this.openBtn.forEach((btn) => {
      btn.addEventListener('click', this.openEvent, false)
    })
    this.closeBtn.forEach((btn) => {
      btn.addEventListener('click', this.closeEvent, false)
    })

    if (this.element.classList.contains('js-dialog-dismiss')) {
      this.element.addEventListener('click', this.clickEvent, false)
    }

    if (this.focusableEls.length > 0) {
      this.focusableEls[this.focusableEls.length - 1].addEventListener('blur', this.trapEvent, false)
    }
  }

  openDialog() {
    this.element.setAttribute('aria-expanded', 'true')
    this.element.classList.add('active')
    this.body.classList.add('dialog-active')
    if (this.focusableEls.length > 0) {
      this.focusableEls[0].focus()
    }
  }

  closeDialog() {
    this.element.setAttribute('aria-expanded', 'false')
    this.element.classList.remove('active')
    this.body.classList.remove('dialog-active')
  }

  clickDialog(event) {
    if (!this.elementWrapper.contains(event.target)) {
      this.closeDialog()
    }
  }

  trapFocus(event) {
    event.preventDefault()
    if (this.focusableEls.length > 0) {
      this.focusableEls[0].focus()
    }
  }
}

export default Dialog
