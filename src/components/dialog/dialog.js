class Dialog {
  constructor(element) {
    this.dialogContainerClass = '.nsw-dialog__container'
    this.dialogContainer = element.querySelectorAll(this.dialogContainerClass)
    this.dialogHeadingClass = '.nsw-dialog__title'
    this.headings = element.querySelectorAll(this.dialogHeadingClass)
    this.dialogContentClass = '.nsw-dialog__content'
    this.content = element.querySelectorAll(this.dialogContentClass)
    this.dialogCtaClass = '.nsw-dialog__cta'
    this.dialogCta = element.querySelectorAll(this.dialogCtaClass)
    this.openBtn = element.querySelectorAll('.nsw-dialog__open')
    this.closeBtn = element.querySelectorAll('.nsw-dialog__close')
  }

  init() {
    this.controls()
    this.setDialogState('close')
  }

  controls() {
    this.openBtn.forEach((btn) => {
      btn.addEventListener('click', this.openDialog(this), false)
    })
    this.closeBtn.forEach((btn) => {
      btn.addEventListener('click', this.closeDialog(this), false)
    })
  }

  setDialogState(state) {
    if (state === 'open') {
      this.dialogContainer[0].setAttribute('aria-expanded', 'true')
      this.dialogContainer[0].hidden = false
    } else if (state === 'close') {
      this.dialogContainer[0].setAttribute('aria-expanded', 'false')
      this.dialogContainer[0].hidden = true
    }
  }

  openDialog() {
    this.setDialogState('open')
  }

  closeDialog() {
    this.setDialogState('close')
  }
}

export default Dialog
