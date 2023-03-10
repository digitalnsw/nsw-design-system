/* eslint-disable max-len */
class FileUpload {
  constructor(element) {
    this.element = element
    this.input = this.element.querySelector('.nsw-file-upload__input')
    this.label = this.element.querySelector('.nsw-file-upload__label')
    this.multipleUpload = this.input.hasAttribute('multiple')
    this.replaceFiles = this.element.hasAttribute('data-replace-files')
    this.filesList = this.element.querySelector('ul')
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
      this.removeFile()
    }
  }

  initFileInput() {
    if (!this.input) return

    this.input.addEventListener('change', () => {
      if (this.input.value === '') return
      this.storeUploadedFiles(this.input.files)
      this.updateFileList()
    })
  }

  storeUploadedFiles(fileData) {
    this.lastUploadedFiles = []
    if (this.replaceFiles) this.uploadedFiles = []
    Array.prototype.push.apply(this.lastUploadedFiles, fileData)
    this.uploadedFiles = this.uploadedFiles.concat(this.lastUploadedFiles)
  }

  updateFileList() {
    if (!this.fileItems || this.fileItems.length === 0) return
    const clone = this.fileItems[0].cloneNode(true)
    let string = ''
    clone.classList.add('active')
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

    if (this.uploadedFiles.length === 0) {
      this.filesList.classList.toggle('active')
    }
  }

  removeFile() {
    this.filesList.addEventListener('click', (event) => {
      if (!event.target.closest('.nsw-icon-button')) return
      event.preventDefault()
      const item = event.target.closest('.nsw-file-upload__item')
      const index = Array.prototype.indexOf.call(this.filesList.querySelectorAll('.nsw-file-upload__item'), item)
      const lastUploadedIndex = this.lastUploadedFiles.length - index
      if (lastUploadedIndex >= 0 && lastUploadedIndex < this.lastUploadedFiles.length - 1) {
        this.lastUploadedFiles.splice(this.lastUploadedFiles.length - index, 1)
      }
      item.remove()
    })
  }

  static truncateString(str, num) {
    if (str.length <= num) {
      return str
    }
    return `${str.slice(0, num)}...`
  }
}

export default FileUpload
