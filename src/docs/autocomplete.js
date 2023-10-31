import searchValues from './data'

const defaults = {
  debounce: 200,
  characters: 1,
  populate: true,
  searchData(query, cb, eventType) {
    let data = searchValues.filter((item) => item.label.toLowerCase().includes(query.toLowerCase())
    || item.keywords.toLowerCase().includes(query.toLowerCase()))

    if (data.length === 0) { // fallback for no results found
      data = [{
        label: 'No results',
        template: 'no-results',
      }]
    }

    cb(data)
  },
  onClick(option, obj, event, cb) {
    // const { value } = input
    // const base = window.location.origin
    // const append = '/design-system'
    // window.location.href = `${baseURL}${searchUrl}/example`
    // window.location.replace()

    // console.log(value)
    // console.log(option)
    // console.log(event)

    // update input value
    const input = obj.querySelector('input')
    const linkElement = option.querySelector('a')
    input.value = linkElement.textContent

    // close dropdown
    cb()
  },
}

class Autocomplete {
  constructor(element) {
    this.element = element
    this.options = defaults
    this.input = this.element.querySelector('.js-autocomplete__input')
    this.results = this.element.querySelector('.js-autocomplete__results')
    this.resultsList = this.results.querySelector('.js-autocomplete__list')
    this.ariaResult = this.element.querySelectorAll('.js-autocomplete__aria-results')
    this.resultClassName = this.element.querySelectorAll('.js-autocomplete__item').length > 0 ? 'js-autocomplete__item' : 'js-autocomplete__result'
    this.inputVal = ''
    this.typeId = false
    this.searching = false
    this.searchingClass = 'searching'
    this.dropdownActiveClass = 'active'
    // truncate dropdown
    this.truncateDropdown = !!(this.element.getAttribute('data-autocomplete-dropdown-truncate') && this.element.getAttribute('data-autocomplete-dropdown-truncate') === 'on')
    this.autocompleteClosed = false // fix issue when selecting an option from the list
    this.clone = false
    this.selectedLabelElement = false
  }

  init() {
    this.initAutocompleteAria() // set aria attributes for SR and keyboard users
    this.initAutocompleteTemplates()
    this.initAutocompleteEvents()
  }

  initAutocompleteAria() {
    // set aria attributes for input element
    this.input.setAttribute('role', 'combobox')
    this.input.setAttribute('aria-autocomplete', 'list')
    const listId = this.resultsList.getAttribute('id')
    if (listId) this.input.setAttribute('aria-owns', listId)
    // set aria attributes for autocomplete list
    this.resultsList.setAttribute('role', 'list')
  }

  initAutocompleteTemplates() {
    this.templateItems = this.resultsList.querySelectorAll(`.${this.resultClassName}[data-autocomplete-template]`)

    if (this.templateItems.length < 1) this.templateItems = this.resultsList.querySelectorAll(`.${this.resultClassName}`)

    this.templates = []

    this.templateItems.forEach((item, i) => {
      this.templates[i] = item.getAttribute('data-autocomplete-template')
    })
  }

  initAutocompleteEvents() {
    // input - keyboard navigation
    this.input.addEventListener('keyup', (event) => {
      this.handleInputTyped(event)
    })

    // if input type="search" -> detect when clicking on 'x' to clear input
    this.input.addEventListener('search', () => {
      this.updateSearch()
    })

    // make sure dropdown is open on click
    this.input.addEventListener('click', () => {
      this.updateSearch(true)
    })

    this.input.addEventListener('focus', () => {
      if (this.autocompleteClosed) {
        this.autocompleteClosed = false
        return
      }
      this.updateSearch(true)
    })

    // input loses focus -> close menu
    this.input.addEventListener('blur', (event) => {
      this.checkFocusLost(event)
    })

    // results list - keyboard navigation
    this.resultsList.addEventListener('keydown', (event) => {
      this.navigateList(event)
    })

    // results list loses focus -> close menu
    this.resultsList.addEventListener('focusout', (event) => {
      this.checkFocusLost(event)
    })

    // close on esc
    window.addEventListener('keyup', (event) => {
      if (event.key && event.key.toLowerCase() === 'escape') {
        this.toggleOptionsList(false)
      } else if (event.key && event.key.toLowerCase() === 'enter') {
        this.selectResult(document.activeElement.closest(`.${this.resultClassName}`), event)
      }
    })

    // select element from list
    this.resultsList.addEventListener('click', (event) => {
      this.selectResult(event.target.closest(`.${this.resultClassName}`), event)
    })
  }

  checkFocusLost(event) {
    if (this.element.contains(event.relatedTarget)) return
    this.toggleOptionsList(false)
  }

  handleInputTyped(event) {
    if (event.key.toLowerCase() === 'arrowdown') {
      this.moveFocusToList()
    } else {
      this.updateSearch()
    }
  }

  moveFocusToList() {
    if (!this.element.classList.contains(this.dropdownActiveClass)) return
    this.resetSearch() // clearTimeout
    // make sure first element is focusable
    let index = 0
    if (!this.elementListIsFocusable(index)) {
      index = this.getElementFocusbleIndex(index, true)
    }
    this.getListFocusableEl(index).focus()
  }

  updateSearch(bool) {
    const inputValue = this.input.value
    if (inputValue === this.inputVal && !bool) return // input value did not change
    this.inputVal = inputValue
    if (this.typeId) clearInterval(this.typeId) // clearTimeout
    if (this.inputVal.length < this.options.characters) { // not enough characters to start searching
      this.toggleOptionsList(false)
      return
    }
    if (bool) { // on focus -> update result list without waiting for the debounce
      this.updateResultsList('focus')
      return
    }
    this.typeId = setTimeout(() => {
      this.updateResultsList('type')
    }, this.options.debounce)
  }

  toggleOptionsList(bool) {
    // toggle visibility of options list
    if (bool) {
      if (this.element.classList.contains(this.dropdownActiveClass)) return
      this.element.classList.add(this.dropdownActiveClass)
      this.input.setAttribute('aria-expanded', true)
      this.truncateAutocompleteList()
    } else {
      if (!this.element.classList.contains(this.dropdownActiveClass)) return
      if (this.resultsList.contains(document.activeElement)) {
        this.autocompleteClosed = true
        this.input.focus()
      }
      this.element.classList.remove(this.dropdownActiveClass)
      this.input.removeAttribute('aria-expanded')
      this.resetSearch() // clearTimeout
    }
  }

  truncateAutocompleteList() {
    if (!this.truncateDropdown) return
    // reset max height
    this.resultsList.style.maxHeight = ''
    // check available space
    const spaceBelow = (window.innerHeight - this.input.getBoundingClientRect().bottom - 10)
    const maxHeight = parseInt(this.getComputedStyle(this.resultsList).maxHeight, 10)

    if (maxHeight > spaceBelow) {
      this.resultsList.style.maxHeight = `${spaceBelow}px`
    } else {
      this.resultsList.style.maxHeight = ''
    }
  }

  updateResultsList(eventType) {
    if (this.searching) return
    this.searching = true
    this.element.classList.add(this.searchingClass) // show loader
    this.options.searchData(this.inputVal, (data, cb) => {
      // data = custom results
      this.populateResults(data, cb)
      this.element.classList.remove(this.searchingClass)
      this.toggleOptionsList(true)
      this.updateAriaRegion()
      this.searching = false
    }, eventType)
  }

  updateAriaRegion() {
    this.resultsItems = this.resultsList.querySelectorAll(`.${this.resultClassName}[tabindex="-1"]`)
    if (this.ariaResult.length === 0) return
    this.ariaResult[0].textContent = this.resultsItems.length
  }

  resetSearch() {
    if (this.typeId) clearInterval(this.typeId)
    this.typeId = false
  }

  navigateList(event) {
    const downArrow = (event.key.toLowerCase() === 'arrowdown')
    const upArrow = (event.key.toLowerCase() === 'arrowup')
    if (!downArrow && !upArrow) return
    event.preventDefault()
    const selectedElement = document.activeElement.closest(`.${this.resultClassName}`) || document.activeElement
    const index = Array.prototype.indexOf.call(this.resultsItems, selectedElement)
    const newIndex = this.getElementFocusbleIndex(index, downArrow)
    this.getListFocusableEl(newIndex).focus()
  }

  getElementFocusbleIndex(index, nextItem) {
    let newIndex = nextItem ? index + 1 : index - 1
    if (newIndex < 0) newIndex = this.resultsItems.length - 1
    if (newIndex >= this.resultsItems.length) newIndex = 0
    if (!this.elementListIsFocusable(newIndex)) {
      return this.getElementFocusbleIndex(newIndex, nextItem)
    }
    return newIndex
  }

  elementListIsFocusable(index) {
    const item = this.resultsItems[index]
    const role = item.getAttribute('role')
    if (role && role === 'presentation') {
      return false
    }
    return true
  }

  getListFocusableEl(index) {
    let newFocus = this.resultsItems[index]
    const focusable = newFocus.querySelector('button:not([disabled]), [href]')
    if (focusable.length > 0) {
      newFocus = focusable
    }
    return newFocus
  }

  selectResult(result, event) {
    if (!result) return
    if (this.options.onClick) {
      this.options.onClick(result, this.element, event, () => {
        this.toggleOptionsList(false)
      })
    } else {
      this.input.value = this.getResultContent(result)
      this.toggleOptionsList(false)
    }
    this.inputVal = this.input.value
  }

  getResultContent(result) {
    this.selectedLabelElement = result.querySelector('[data-autocomplete-label]')
    return this.selectedLabelElement ? this.selectedLabelElement.textContent : result.textContent
  }

  populateResults(data, cb) {
    let innerHtml = ''

    data.forEach((item) => {
      innerHtml += this.getItemHtml(item)
    })

    if (this.options.populate) this.resultsList.innerHTML = innerHtml
    else if (cb) cb(innerHtml)
  }

  getItemHtml(data) {
    this.clone = this.getClone(data)
    this.clone.setAttribute('tabindex', '-1')

    Object.keys(data).forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        if (key === 'label') this.setLabel(data[key])
        else if (key === 'class') this.setClass(data[key])
        else if (key === 'url') this.setUrl(data[key])
        else if (key === 'src') this.setSrc(data[key])
        else this.setKey(key, data[key])
      }
    })

    return this.clone.outerHTML
  }

  getClone(data) {
    let item = false

    if (this.templateItems.length === 1 || !data.template) {
      [item] = this.templateItems
    } else {
      this.templateItems.forEach((templateItem, i) => {
        if (data.template === this.templates[i]) {
          item = templateItem
        }
      })

      if (!item) [item] = this.templateItems
    }
    return item.cloneNode(true)
  }

  setLabel(label) {
    const labelElement = this.clone.querySelector('[data-autocomplete-label]')

    if (labelElement) {
      labelElement.textContent = label
    } else {
      this.clone.textContent = label
    }
  }

  setClass(classList) {
    const classesArray = classList.split(' ')
    this.clone.classList.add(classesArray[0])
    if (classesArray.length > 1) this.setClass(classesArray.slice(1).join(' '))
  }

  setUrl(url) {
    const linkElement = this.clone.querySelector('[data-autocomplete-url]')
    if (linkElement) linkElement.setAttribute('href', url)
  }

  setSrc(src) {
    const imgElement = this.clone.querySelector('[data-autocomplete-src]')
    if (imgElement) imgElement.setAttribute('src', src)
  }

  setKey(key, value) {
    const subElement = this.clone.querySelector(`[data-autocomplete-${key}]`)
    if (subElement) {
      if (subElement.hasAttribute('data-autocomplete-html')) subElement.innerHTML = value
      else subElement.textContent = value
    }
  }
}

export default Autocomplete
