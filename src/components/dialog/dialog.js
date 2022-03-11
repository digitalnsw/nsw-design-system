class Dialog {
  constructor(element) {
    this.dialog = element
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
    this.setUpDom()
    this.controls()
    console.log('init finished')
  }

  setUpDom() {
    this.dialog.classList.add('ready')
  }

  controls() {
    this.openBtn.forEach((element) => {
      element.addEventListener('click', this.openDialog, false)
    })
    this.closeBtn.forEach((element) => {
      element.addEventListener('click', this.closeDialog, false)
    })
  }

  setDialogState(state) {
    if (state === 'open') {
      this.closeBtn[0].classList.add('active')
      this.openBtn[0].disabled = true
      this.closeBtn[0].disabled = false
      this.closeBtn[0].setAttribute('aria-expanded', 'true')
      this.dialogContainer.style.display = ''
      this.dialogCta.style.display = 'none'
    } else if (state === 'close') {
      this.openBtn[0].classList.add('active')
      this.closeBtn[0].disabled = true
      this.openBtn[0].disabled = false
      this.closeBtn[0].setAttribute('aria-expanded', 'false')
      this.dialogContainer.style.display = 'none'
      this.dialogCta.style.display = ''
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
