class Dialog {
  constructor(element) {
    this.dialog = element
    this.dialogContainerClass = '.nsw-dialog__container'
    this.dialogs = element.querySelectorAll(this.dialogContainerClass)
    this.openBtn = element.querySelectorAll('.nsw-dialog__open')
    this.closeBtn = element.querySelectorAll('.nsw-dialog__close')
    this.openEvent = (e) => this.openDialog(e)
    this.closeEvent = (e) => this.closeDialog(e)
  }

  init() {
    this.controls()
    this.closeAll()
  }

  controls() {
    this.openBtn.forEach((btn) => {
      btn.addEventListener('click', this.openEvent, false)
    })
    this.closeBtn.forEach((btn) => {
      btn.addEventListener('click', this.closeEvent, false)
    })
  }

  // eslint-disable-next-line class-methods-use-this
  setDialogState(dialogRef, state) {
    if (state === 'open') {
      dialogRef.setAttribute('aria-expanded', 'true')
      dialogRef.removeAttribute('hidden')
    } else if (state === 'close') {
      dialogRef.setAttribute('aria-expanded', 'false')
      dialogRef.setAttribute('hidden', 'true')
    }
  }

  openDialog(e) {
    const { currentTarget } = e
    const dialogRef = currentTarget.parentNode.previousElementSibling
    this.setDialogState(dialogRef, 'open')
  }

  closeDialog(e) {
    const { currentTarget } = e
    const dialogRef = currentTarget.parentNode
    this.setDialogState(dialogRef, 'close')
  }

  closeAll() {
    this.dialogs.forEach((element) => {
      this.setDialogState(element, 'close')
    })
  }
}

export default Dialog
