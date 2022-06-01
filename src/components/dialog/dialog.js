class Dialog {
  constructor(element) {
    this.dialog = element
    this.dialogWrapper = element.querySelector('.nsw-dialog__wrapper')
    this.openBtn = document.querySelectorAll('.js-open-dialog-'.concat(element.getAttribute('id')))
    this.closeBtn = element.querySelectorAll('.js-close-dialog')
    this.openEvent = (e) => this.openDialog(e)
    this.closeEvent = (e) => this.closeDialog(e)
    this.clickEvent = (e) => this.clickDialog(e)
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
  }

  openDialog() {
    this.dialog.setAttribute('aria-expanded', 'true')
    this.dialog.classList.add('active')
  }

  closeDialog() {
    this.dialog.setAttribute('aria-expanded', 'false')
    this.dialog.classList.remove('active')
  }

  clickDialog(e) {
    if (!this.dialogWrapper.contains(e.target)) {
      this.closeDialog()
    }
  }
}

export default Dialog
