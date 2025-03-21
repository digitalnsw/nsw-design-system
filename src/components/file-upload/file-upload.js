/* eslint-disable max-len */
class FileUpload {
  constructor(element) {
    this.element = element
    this.input = this.element.querySelector('input.nsw-file-upload__input')
    this.label = this.element.querySelector('label.nsw-file-upload__label')
    this.multipleUpload = this.input && this.input.hasAttribute('multiple')
    this.replaceFiles = this.element.hasAttribute('data-replace-files')
    this.filesList = null
  }

  init() {
    if (!this.input) return

    if (!this.label) {
      const label = document.createElement('label')
      label.htmlFor = this.input.id
      label.classList.add('nsw-file-upload__label', 'nsw-button', 'nsw-button--dark-outline-solid')
      label.textContent = 'Select file'
      this.element.insertAdjacentElement('beforeend', label)
      this.label = this.element.querySelector('label.nsw-file-upload__label')
    }

    this.input.addEventListener('change', this.handleInputChange.bind(this))
    this.element.addEventListener('click', this.handleFileRemove.bind(this))
  }

  handleInputChange() {
    this.updateFileList()
  }

  createFileList() {
    const ul = document.createElement('ul')
    ul.classList.add('nsw-file-upload__list')

    this.label.insertAdjacentElement('afterend', ul)
    this.filesList = this.element.querySelector('.nsw-file-upload__list')
  }

  createFileItem(file) {
    const li = document.createElement('li')
    li.classList.add('nsw-file-upload__item')
    const html = `
      <span class="nsw-file-upload__item-filename"></span>
      <button type="button" class="nsw-icon-button">
        <span class="sr-only">Remove file</span>
        <span class="material-icons nsw-material-icons" focusable="false" aria-hidden="true">cancel</span>
      </button>`

    li.insertAdjacentHTML('afterbegin', html)
    li.querySelector('.nsw-file-upload__item-filename').textContent = this.constructor.truncateString(file.name, 50)
    li.querySelector('.nsw-file-upload__item-filename').dataset.filename = file.name
    return li.outerHTML
  }

  updateFileList() {
    if (this.input.files.length === 0) {
      // If there are previously stored files, re-sync the input and exit.
      if (this.currentFiles && this.currentFiles.files && this.currentFiles.files.length > 0) {
        this.input.files = this.currentFiles.files
        return
      }
      // Clear list if otherwise
      if (this.filesList) {
        this.filesList.innerHTML = ''
        this.filesList.classList.remove('active')
      }
      return
    }

    if (!this.filesList) {
      this.createFileList()
    }

    this.filesList.classList.add('active')

    const dataTransfer = new DataTransfer()
    const existingFiles = new Set()

    if (this.replaceFiles) {
      this.filesList.innerHTML = ''
      this.currentFiles = new DataTransfer()
    }

    // Collect existing files to maintain them in the list (if multiple is allowed)
    if (this.multipleUpload && this.currentFiles && this.currentFiles.files) {
      for (let i = 0; i < this.currentFiles.files.length; i += 1) {
        const file = this.currentFiles.files[i]
        dataTransfer.items.add(file)
        existingFiles.add(file.name)
      }
    }

    let fileListHTML = ''

    // Add only new files
    for (let i = 0; i < this.input.files.length; i += 1) {
      const file = this.input.files[i]
      if (!existingFiles.has(file.name)) {
        dataTransfer.items.add(file)
        fileListHTML += this.createFileItem(file)
      }
    }

    this.currentFiles = dataTransfer

    if (fileListHTML) {
      this.filesList.insertAdjacentHTML('beforeend', fileListHTML)
    }

    this.input.files = this.currentFiles.files
  }

  handleFileRemove(event) {
    if (!event.target.closest('.nsw-icon-button')) return
    event.preventDefault()
    const item = event.target.closest('.nsw-file-upload__item')
    const { filename } = item.querySelector('.nsw-file-upload__item-filename').dataset

    const dataTransfer = new DataTransfer()
    for (let i = 0; i < this.currentFiles.files.length; i += 1) {
      const file = this.currentFiles.files[i]
      if (file.name !== filename) {
        dataTransfer.items.add(file)
      }
    }

    this.currentFiles = dataTransfer
    this.input.files = this.currentFiles.files

    item.remove()

    if (this.filesList.children.length === 0) {
      this.filesList.classList.remove('active')
    }
  }

  static truncateString(str, num) {
    return str.length <= num ? str : `${str.slice(0, num)}...`
  }
}

export default FileUpload
