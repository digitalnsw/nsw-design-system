/* eslint-disable max-len */
class FileUpload {
  constructor(element) {
    this.element = element
    this.input = this.element.querySelector('.nsw-file-upload__input')
    this.label = this.element.querySelector('.nsw-file-upload__label')
    this.labelText = this.element.querySelector('.nsw-file-upload__label-content')
    this.initialLabel = this.labelText.textContent
    this.multipleUpload = this.input.hasAttribute('multiple')
    this.replaceFiles = this.element.hasAttribute('data-replace-files')
    this.filesList = this.element.querySelector('.nsw-file-upload__list')
    this.fileItems = false
    this.uploadedFiles = []
    this.lastUploadedFiles = []
  }

  init() {
    this.initshowFiles()
    this.initFileInput()
  }

  initshowFiles() {
    if (this.filesList) {
      this.fileItems = this.filesList.querySelectorAll('.nsw-file-upload__item')
      this.initRemoveFile()
    }
  }

  initFileInput() {
    if (!this.input) return

    this.label.setAttribute('tabindex', '0')
    this.input.setAttribute('tabindex', '-1')

    this.input.addEventListener('focusin', () => {
      this.label.focus()
    })

    this.label.addEventListener('keydown', (event) => {
      if ((event.keyCode && event.keyCode === 13) || (event.key && event.key.toLowerCase() === 'enter')) { this.input.click() }
    })

    this.input.addEventListener('change', () => {
      if (this.input.value === '') return
      this.storeUploadedFiles(this.input.files)
      this.updateFileInput()
    })
  }

  storeUploadedFiles(fileData) {
    this.lastUploadedFiles = []
    if (this.replaceFiles) this.uploadedFiles = []
    Array.prototype.push.apply(this.lastUploadedFiles, fileData)
    this.uploadedFiles = this.uploadedFiles.concat(this.lastUploadedFiles)
    this.updateInputLabelText(this.uploadedFiles)
  }

  updateFileInput() {
    this.updateFileList()
    this.emitCustomEvents('filesUploaded', false)
  }

  updateInputLabelText(uploadedFiles) {
    let label = ''
    if (uploadedFiles && uploadedFiles.length < 1) {
      label = this.initialLabel
    } else if (this.multipleUpload && uploadedFiles && uploadedFiles.length > 1) {
      label = `${uploadedFiles.length} files`
    } else {
      for (let i = 0; i < uploadedFiles.length; i += 1) {
        const { name } = uploadedFiles[i]
        label = this.constructor.truncateString(name, 35)
      }
    }
    this.labelText.textContent = label
  }

  updateFileList() {
    if (!this.fileItems || this.fileItems.length === 0) return
    const clone = this.fileItems[0].cloneNode(true)
    let string = ''
    this.constructor.addClass(clone, 'active')
    for (let i = 0; i < this.lastUploadedFiles.length; i += 1) {
      const { name } = this.lastUploadedFiles[i]
      clone.querySelectorAll('.nsw-file-upload__item-filename')[0].textContent = this.constructor.truncateString(name, 50)
      string = clone.outerHTML + string
    }

    if (this.replaceFiles) {
      string = this.fileItems[0].outerHTML + string
      this.filesList.innerHTML = string
    } else {
      this.fileItems[0].insertAdjacentHTML('afterend', string)
    }
    this.constructor.toggleClass(this.filesList, 'active', this.uploadedFiles.length === 0)
  }

  initRemoveFile() {
    this.filesList.addEventListener('click', (event) => {
      if (!event.target.closest('.nsw-file-upload__item-button')) return
      event.preventDefault()
      const item = event.target.closest('.nsw-file-upload__item')
      const index = this.constructor.getIndexInArray(this.filesList.querySelectorAll('.nsw-file-upload__item'), item)

      const removedFile = this.uploadedFiles.splice(this.uploadedFiles.length - index, 1)

      const lastUploadedIndex = this.lastUploadedFiles.length - index
      if (lastUploadedIndex >= 0 && lastUploadedIndex < this.lastUploadedFiles.length - 1) {
        this.lastUploadedFiles.splice(this.lastUploadedFiles.length - index, 1)
      }
      item.remove()
      this.emitCustomEvents('fileRemoved', removedFile)
      this.updateInputLabelText(this.uploadedFiles)
    })
  }

  emitCustomEvents(eventName, detail) {
    const event = new CustomEvent(eventName, { detail })
    this.element.dispatchEvent(event)
  }

  static getIndexInArray(array, el) {
    return Array.prototype.indexOf.call(array, el)
  }

  static addClass(el, className) {
    el.classList.add(className)
  }

  static removeClass(el, className) {
    el.classList.remove(className)
  }

  static toggleClass(el, className, bool) {
    if (bool) this.addClass(el, className)
    else this.removeClass(el, className)
  }

  static truncateString(str, num) {
    if (str.length <= num) {
      return str
    }
    return `${str.slice(0, num)}...`
  }
}

export default FileUpload
