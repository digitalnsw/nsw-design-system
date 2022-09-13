/* eslint-disable max-len */
class FileUpload {
  constructor(element) {
    this.element = element
    this.input = this.element.querySelector('.nsw-file-upload__input')
    this.label = this.element.querySelector('.nsw-file-upload__label')
    this.multipleUpload = this.input.hasAttribute('multiple') // allow for multiple files selection

    // when user selects a file, it will be changed from the default value to the name of the file
    this.labelText = this.element.querySelector('.nsw-file-upload__text')
    this.initialLabel = this.labelText.textContent
  }

  init() {
    this.initInputFileEvents()
  }

  initInputFileEvents() {
    // make label focusable
    this.label.setAttribute('tabindex', '0')
    this.input.setAttribute('tabindex', '-1')

    // move focus from input to label -> this is triggered when a file is selected or the file picker modal is closed
    this.input.addEventListener('focusin', (event) => {
      console.log(event)
      this.label.focus()
    })

    // press 'Enter' key on label element -> trigger file selection
    this.label.addEventListener('keydown', (event) => {
      if ((event.keyCode && event.keyCode === 13) || (event.key && event.key.toLowerCase() === 'enter')) { this.input.click() }
    })

    // file has been selected -> update label text
    this.input.addEventListener('change', (event) => {
      console.log(event)
      this.updateInputLabelText()
    })
  }

  updateInputLabelText() {
    let label = ''
    if (this.input.files && this.input.files.length < 1) {
      label = this.initialLabel // no selection -> revert to initial label
    } else if (this.multipleUpload && this.input.files && this.input.files.length > 1) {
      label = `${this.input.files.length} files` // multiple selection -> show number of files
    } else {
      label = this.input.value.split('\\').pop() // single file selection -> show name of the file
    }
    this.labelText.textContent = label
  }
}

export default FileUpload
