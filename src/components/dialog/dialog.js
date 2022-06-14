class Dialog {
  constructor(element) {
    this.dialog = element
    this.dialogWrapper = element.querySelector('.nsw-dialog__wrapper')
    this.openBtn = document.querySelectorAll('.js-open-dialog-'.concat(element.getAttribute('id')))
    this.closeBtn = element.querySelectorAll('.js-close-dialog')
    // eslint-disable-next-line max-len
    this.focusableEls = element.querySelectorAll('a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled])')
    this.body = document.body
    this.openEvent = (e) => this.openDialog(e)
    this.closeEvent = (e) => this.closeDialog(e)
    this.clickEvent = (e) => this.clickDialog(e)
    this.trapEvent = (e) => this.trapFocus(e)
  }

  init() {
    this.controls()
  }

  controls() {
    this.openBtn.forEach((btn) => {
      btn.addEventListener('click', this.openEvent, false)
    })
    this.closeBtn.forEach((btn) => {
      btn.addEventListener('click', this.closeEvent, false)
    })

    if (this.dialog.classList.contains('js-dialog-dismiss')) {
      this.dialog.addEventListener('click', this.clickEvent, false)
    }

    this.focusableEls[this.focusableEls.length - 1].addEventListener('blur', this.trapEvent, false)
  }

  openDialog() {
    this.dialog.setAttribute('aria-expanded', 'true')
    this.dialog.classList.add('active')
    this.body.classList.add('dialog-active')
    this.focusableEls[0].focus()
  }

  closeDialog() {
    this.dialog.setAttribute('aria-expanded', 'false')
    this.dialog.classList.remove('active')
    this.body.classList.remove('dialog-active')
  }

  clickDialog(e) {
    if (!this.dialogWrapper.contains(e.target)) {
      this.closeDialog()
    }
  }

  trapFocus(e) {
    e.preventDefault()
    this.focusableEls[0].focus()
  }
}

export default Dialog
