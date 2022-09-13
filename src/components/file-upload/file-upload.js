/* eslint-disable max-len */
class FileUpload {
  constructor(element) {
    this.element = element
    this.input = this.element.querySelector('.nsw-file-upload__input')
    this.label = this.element.querySelector('.nsw-file-upload__label')
    this.accept = this.input.getAttribute('accept')
    this.multipleUpload = this.input.hasAttribute('multiple') // allow for multiple files selection
    // when user selects a file, it will be changed from the default value to the name of the file
    this.labelText = this.element.querySelector('.nsw-file-upload__text')
    this.initialLabel = this.labelText.textContent
    //
    this.uploadedFiles = []
    this.lastUploadedFiles = []
    this.acceptFile = []
    //
    this.filesList = false
    this.fileItems = false
    // options
    this.showFiles = true
    this.replaceFiles = this.element.hasAttribute('data-replace-files')
    this.maxSize = ''
    this.maxFiles = ''
  }

  init() {
    this.initInputFileEvents()
    this.initshowFiles()
    this.initFileAccept()
    this.initFileInput()
  }

  initshowFiles() {
    this.filesList = this.element.querySelector('.js-file-upload__list')
    if (this.filesList.length === 0) return
    this.fileItems = this.filesList.querySelectorAll('.js-file-upload__item')

    if (this.fileItems.length > 0) this.constructor.addClass(this.fileItems[0], 'hidden')
    // listen for click on remove file action
    this.initRemoveFile()
  }

  initFileAccept() {
    if (!this.accept) return
    if (this.input) {
      // store accepted file format
      this.acceptFile = this.accept.split(',').map((element) => element.trim())
    }
  }

  initFileInput() {
    // listen to changes in the input file element
    if (!this.input) return
    this.input.addEventListener('change', () => {
      if (this.input.value === '') return
      this.storeUploadedFiles(this.input.files)
      this.input.value = ''
      this.updateFileInput()
    })
  }

  storeUploadedFiles(fileData) {
    // check files size/format/number
    this.lastUploadedFiles = []
    if (this.replaceFiles) this.uploadedFiles = []
    Array.prototype.push.apply(this.lastUploadedFiles, fileData)
    this.filterUploadedFiles() // remove files that do not respect format/size
    this.uploadedFiles = this.uploadedFiles.concat(this.lastUploadedFiles)
    if (this.maxFiles) this.filterMaxFiles() // check max number of files
  }

  updateFileInput() {
    // update UI + emit events
    this.updateFileList()
    this.emitCustomEvents('filesUploaded', false)
  }

  filterUploadedFiles() {
    // check max weight
    if (this.maxSize) this.filterMaxSize()
    // check file format
    if (this.acceptFile.length > 0) this.filterAcceptFile()
  }

  filterMaxSize() {
    // filter files by size
    const rejected = []
    for (let i = this.lastUploadedFiles.length - 1; i >= 0; i -= 1) {
      if (this.lastUploadedFiles[i].size > this.maxSize * 1000) {
        const rejectedFile = this.lastUploadedFiles.splice(i, 1)
        rejected.push(rejectedFile[0].name)
      }
    }
    if (rejected.length > 0) {
      this.emitCustomEvents('rejectedWeight', rejected)
    }
  }

  filterAcceptFile() {
    // filter files by format
    const rejected = []
    for (let i = this.lastUploadedFiles.length - 1; i >= 0; i -= 1) {
      if (!this.formatInList(i)) {
        const rejectedFile = this.lastUploadedFiles.splice(i, 1)
        rejected.push(rejectedFile[0].name)
      }
    }

    if (rejected.length > 0) {
      this.emitCustomEvents('rejectedFormat', rejected)
    }
  }

  formatInList(index) {
    const { name, type } = this.lastUploadedFiles[index]
    const typeStr = type.split('/')
    const typeSpec = `${typeStr[0]}/*`
    const lastDot = name.lastIndexOf('.')
    const extension = name.substring(lastDot + 1)

    let accepted = false
    for (let i = 0; i < this.acceptFile.length; i += 1) {
      const file = this.acceptFile[i]

      if ((type === file) || (typeSpec === file || (extension && extension === file))) {
        accepted = true
        break
      }

      if (extension && this.constructor.extensionInList(extension, file)) {
        // extension could be list of format; e.g. for the svg it is svg+xml
        accepted = true
        break
      }
    }
    return accepted
  }

  static extensionInList(extensionList, extension) {
    // extension could be .svg, .pdf, ..
    // extensionList could be png, svg+xml, ...
    if (`.${extensionList}` === extension) return true
    let accepted = false
    const extensionListArray = extensionList.split('+')
    for (let i = 0; i < extensionListArray.length; i += 1) {
      if (`.${extensionListArray[i]}` === extension) {
        accepted = true
        break
      }
    }
    return accepted
  }

  filterMaxFiles() {
    // check number of uploaded files
    if (this.maxFiles >= this.uploadedFiles.length) return
    const rejected = []
    while (this.uploadedFiles.length > this.maxFiles) {
      const rejectedFile = this.uploadedFiles.pop()
      this.lastUploadedFiles.pop()
      rejected.push(rejectedFile.name)
    }

    if (rejected.length > 0) {
      this.emitCustomEvents('rejectedNumber', rejected)
    }
  }

  updateFileList() {
    // create new list of files to be appended
    if (!this.fileItems || this.fileItems.length === 0) return
    const clone = this.fileItems[0].cloneNode(true)
    let string = ''
    this.constructor.removeClass(clone, 'hidden')
    for (let i = 0; i < this.lastUploadedFiles.length; i += 1) {
      clone.querySelectorAll('.js-file-upload__file-name')[0].textContent = this.lastUploadedFiles[i].name
      string = clone.outerHTML + string
    }

    if (this.replaceFiles) {
      // replace all files in list with new files
      string = this.fileItems[0].outerHTML + string
      this.filesList.innerHTML = string
    } else {
      this.fileItems[0].insertAdjacentHTML('afterend', string)
    }

    this.constructor.toggleClass(this.filesList, 'hidden', this.uploadedFiles.length === 0)
  }

  initRemoveFile() {
    // if list of files is visible - option to remove file from list
    this.filesList.addEventListener('click', (event) => {
      if (!event.target.closest('.js-file-upload__remove-btn')) return
      event.preventDefault()
      const item = event.target.closest('.js-file-upload__item')
      const index = this.constructor.getIndexInArray(this.filesList.querySelectorAll('.js-file-upload__item'), item)

      const removedFile = this.uploadedFiles.splice(this.uploadedFiles.length - index, 1)

      // check if we need to remove items form the lastUploadedFiles array
      const lastUploadedIndex = this.lastUploadedFiles.length - index
      if (lastUploadedIndex >= 0 && lastUploadedIndex < this.lastUploadedFiles.length - 1) {
        this.lastUploadedFiles.splice(this.lastUploadedFiles.length - index, 1)
      }
      item.remove()
      this.emitCustomEvents('fileRemoved', removedFile)
      this.updateInputLabelText()
    })
  }

  emitCustomEvents(eventName, detail) {
    const event = new CustomEvent(eventName, { detail })
    this.element.dispatchEvent(event)
  }

  initInputFileEvents() {
    // make label focusable
    this.label.setAttribute('tabindex', '0')
    this.input.setAttribute('tabindex', '-1')

    // move focus from input to label -> this is triggered when a file is selected or the file picker modal is closed
    this.input.addEventListener('focusin', () => {
      this.label.focus()
    })

    // press 'Enter' key on label element -> trigger file selection
    this.label.addEventListener('keydown', (event) => {
      if ((event.keyCode && event.keyCode === 13) || (event.key && event.key.toLowerCase() === 'enter')) { this.input.click() }
    })

    // file(s) has been selected -> update label text
    this.input.addEventListener('change', () => {
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
  // End Original Function

  static getIndexInArray(array, el) {
    return Array.prototype.indexOf.call(array, el)
  }

  static hasClass(el, className) {
    return el.classList.contains(className)
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

  static setAttributes(el, attrs) {
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value))
  }

  static preventDefaults(event) {
    event.preventDefault()
    event.stopPropagation()
  }
}

export default FileUpload
