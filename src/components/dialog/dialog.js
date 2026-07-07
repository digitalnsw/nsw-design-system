/* eslint-disable max-len */
class Dialog {
  constructor(element) {
    this.element = element
    this.elementWrapper = this.element.querySelector('.nsw-dialog__wrapper')
    this.openBtn = document.querySelectorAll(`.js-open-dialog-${this.element.getAttribute('id')}`)
    this.closeBtn = this.element.querySelectorAll('.js-close-dialog')
    this.focusableEls = this.element.querySelectorAll('a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled])')
    this.body = document.body
    this.previouslyFocusedElement = null
    this.openEvent = this.openDialog.bind(this)
    this.closeEvent = this.closeDialog.bind(this)
    this.clickEvent = this.clickDialog.bind(this)
    this.keydownEvent = this.keydownDialog.bind(this)
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

    this.element.addEventListener('keydown', this.keydownEvent, false)
  }

  openDialog() {
    this.saveFocus()
    this.element.setAttribute('aria-hidden', 'false')
    this.element.classList.add('active')
    this.body.classList.add('dialog-active')
    if (this.focusableEls.length > 0) {
      this.focusableEls[0].focus()
    }
  }

  closeDialog() {
    this.restoreFocus()
    this.element.setAttribute('aria-hidden', 'true')
    this.element.classList.remove('active')
    this.body.classList.remove('dialog-active')
  }

  clickDialog(event) {
    if (!this.elementWrapper.contains(event.target)) {
      this.closeDialog()
    }
  }

  keydownDialog(event) {
    if (!this.element.classList.contains('active')) return

    if (event.key === 'Escape') {
      event.preventDefault()
      this.closeDialog()
      return
    }

    if (event.key === 'Tab') {
      this.trapFocus(event)
    }
  }

  saveFocus() {
    const { activeElement } = document
    if (activeElement && activeElement !== this.body && !this.element.contains(activeElement)) {
      this.previouslyFocusedElement = activeElement
    }
  }

  restoreFocus() {
    if (this.previouslyFocusedElement && document.contains(this.previouslyFocusedElement)) {
      this.previouslyFocusedElement.focus()
    } else if (this.element.contains(document.activeElement) && typeof document.activeElement.blur === 'function') {
      document.activeElement.blur()
    }
    this.previouslyFocusedElement = null
  }

  trapFocus(event) {
    if (this.focusableEls.length === 0) return

    const firstFocusableElement = this.focusableEls[0]
    const lastFocusableElement = this.focusableEls[this.focusableEls.length - 1]

    if (!this.element.contains(document.activeElement)) {
      event.preventDefault()
      firstFocusableElement.focus()
      return
    }

    if (document.activeElement === firstFocusableElement && event.shiftKey) {
      event.preventDefault()
      lastFocusableElement.focus()
    }

    if (document.activeElement === lastFocusableElement && !event.shiftKey) {
      event.preventDefault()
      firstFocusableElement.focus()
    }
  }
}

export default Dialog
