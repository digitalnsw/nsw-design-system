/* eslint-disable max-len */
class FileUpload {
  constructor(element) {
    this.element = element
    this.input = this.element.querySelector('.nsw-file-upload__input')
    this.label = this.element.querySelector('.nsw-file-upload__label')
    this.multipleUpload = this.input && this.input.hasAttribute('multiple')
    this.replaceFiles = this.element.hasAttribute('data-replace-files')
    this.filesList = false
  }

  init() {
    if (!this.input) return

    this.input.addEventListener('change', () => {
      if (this.input.value === '') return
      this.updateFileList()
    })
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
    return li.outerHTML
  }

  updateFileList() {
    if (!this.filesList) {
      this.createFileList()
    }

    this.filesList.classList.add('active')

    let string = ''
    for (let i = 0; i < this.input.files.length; i += 1) {
      const file = this.input.files[i]
      string = this.createFileItem(file) + string
    }

    if (this.replaceFiles) {
      this.filesList.innerHTML = string
    } else {
      this.filesList.insertAdjacentHTML('beforeend', string)
    }

    this.removeFile()
  }

  removeFile() {
    this.filesList.addEventListener('click', (event) => {
      if (!event.target.closest('.nsw-icon-button')) return
      event.preventDefault()
      const item = event.target.closest('.nsw-file-upload__item')

      item.remove()

      if (event.currentTarget.children.length === 0) {
        this.filesList.classList.remove('active')
      }
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
