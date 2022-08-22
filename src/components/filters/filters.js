import { uniqueId } from '../../global/scripts/helpers/utilities'

class Filters {
  constructor(element) {
    this.filters = element
    this.openButton = element.querySelector('.nsw-filters__controls button')
    this.selectedCount = element.querySelector('.js-filters--count')
    this.openButtonText = this.selectedCount ? this.selectedCount.querySelector('span:not(.nsw-material-icons)') : null
    this.buttonLabel = this.openButtonText ? this.openButtonText.innerText : null
    this.closeButton = element.querySelector('.nsw-filters__back button')
    this.acceptButton = element.querySelector('.nsw-filters__accept button')
    this.clearButton = element.querySelector('.nsw-filters__cancel button')
    this.showMoreButtons = Array.prototype.slice.call(element.querySelectorAll('.nsw-filters__more'))
    this.accordionButtons = element.querySelectorAll('.nsw-filters__item-button')
    this.showEvent = (e) => this.showFilters(e)
    this.hideEvent = (e) => this.hideFilters(e)
    this.showMoreEvent = (e) => this.showMore(e)
    this.toggleEvent = (e) => this.toggle(e)
    this.resetEvent = (e) => this.clearAllFilters(e)
    this.all = element.querySelectorAll('.nsw-filters__all')
    this.allBlocks = Array.prototype.slice.call(this.all)
    this.filtersItems = element.querySelectorAll('.nsw-filters__item')
    this.body = document.body
    this.buttons = []
    this.content = []
    this.selected = []
    // eslint-disable-next-line max-len
    this.focusableEls = element.querySelectorAll('a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled])')
    this.checkIcon = '<span class="material-icons nsw-material-icons" focusable="false" aria-hidden="true">check_circle</span>'
  }

  init() {
    this.setUpDom()
    this.controls()
    this.selectedItems()
  }

  setUpDom() {
    this.filters.classList.add('ready')

    this.accordionButtons.forEach((button) => {
      const buttonElem = button
      const uID = uniqueId('collapsed')
      buttonElem.setAttribute('type', 'button')
      buttonElem.setAttribute('aria-expanded', 'false')
      buttonElem.setAttribute('aria-controls', uID)

      const contentElem = buttonElem.nextElementSibling
      contentElem.id = buttonElem.getAttribute('aria-controls')
      contentElem.hidden = true

      this.content.push(contentElem)
      this.buttons.push(buttonElem)
    })
  }

  controls() {
    if (this.openButton) {
      this.openButton.addEventListener('click', this.showEvent, false)
    }

    if (this.acceptButton) {
      this.acceptButton.disabled = true
    }

    if (this.closeButton) {
      this.closeButton.addEventListener('click', this.hideEvent, false)
    }

    this.all.forEach((element) => {
      const showMoreButton = element.nextElementSibling
      showMoreButton.addEventListener('click', this.showMoreEvent, false)
    })

    if (this.buttons) {
      this.buttons.forEach((element) => {
        element.addEventListener('click', this.toggleEvent, false)
      })
    }

    if (this.clearButton) {
      this.clearButton.addEventListener('click', this.resetEvent, false)
    }
  }

  showFilters(e) {
    e.preventDefault()
    if (this.filters.classList.contains('nsw-filters--down')) {
      this.filters.classList.toggle('active')
    } else {
      this.filters.classList.add('active')
      this.body.classList.add('filters-open')
      this.trapFocus(this.filters)
    }
  }

  hideFilters(e) {
    e.preventDefault()
    this.filters.classList.remove('active')
    this.body.classList.remove('filters-open')
  }

  showMore(e) {
    e.preventDefault()
    const currentShowMore = e.target
    const currentIndex = this.showMoreButtons.indexOf(currentShowMore)
    const currentAll = this.allBlocks[currentIndex]
    currentAll.classList.remove('hidden')
    currentShowMore.classList.add('hidden')
  }

  getTargetContent(element) {
    const currentIndex = this.buttons.indexOf(element)
    return this.content[currentIndex]
  }

  setAccordionState(element, state) {
    const targetContent = this.getTargetContent(element)

    if (state === 'open') {
      element.classList.add('active')
      element.setAttribute('aria-expanded', 'true')
      targetContent.hidden = false
    } else if (state === 'close') {
      element.classList.remove('active')
      element.setAttribute('aria-expanded', 'false')
      targetContent.hidden = true
    }
  }

  toggle(e) {
    const { currentTarget } = e
    const targetContent = this.getTargetContent(currentTarget)
    const isHidden = targetContent.hidden

    if ((isHidden)) {
      this.setAccordionState(currentTarget, 'open')
    } else {
      this.setAccordionState(currentTarget, 'close')
    }
  }

  trapFocus(element) {
    const firstFocusableEl = this.focusableEls[0]
    const lastFocusableEl = this.focusableEls[this.focusableEls.length - 1]
    const KEYCODE_TAB = 9

    element.addEventListener('keydown', (e) => {
      const isTabPressed = (e.key === 'Tab' || e.keyCode === KEYCODE_TAB)

      if (!isTabPressed) {
        return
      }

      if (e.shiftKey) {
        if (document.activeElement === firstFocusableEl) {
          lastFocusableEl.focus()
          e.preventDefault()
        }
      } else if (document.activeElement === lastFocusableEl) {
        firstFocusableEl.focus()
        e.preventDefault()
      }
    })
  }

  toggleAccept(array) {
    if (this.acceptButton) {
      if (array.length > 0) {
        this.acceptButton.disabled = false
      } else {
        this.acceptButton.disabled = true
      }
    }
  }

  toggleSelectedState(array) {
    if (array.length > 0) {
      this.openButton.parentElement.classList.add('active')
    } else {
      this.openButton.parentElement.classList.remove('active')
    }
  }

  resultsCount(array, buttonText) {
    if (this.openButtonText) {
      if (array.length > 0) {
        this.openButtonText.innerText = `${buttonText} (${array.length})`
      } else {
        this.openButtonText.innerText = `${buttonText}`
      }
    }
  }

  updateDom() {
    this.resultsCount(this.selected, this.buttonLabel)
    this.toggleAccept(this.selected)
    this.toggleSelectedState(this.selected)
  }

  updateCount(options) {
    const text = options.title
    if (options.array.length > 0) {
      const groupedElements = []
      options.array.forEach((element, index) => {
        const labelText = (text) ? text.innerText : null
        const singleElement = `input-${labelText}`
        const multipleElements = `input-${labelText}-${index}`
        // Get field type
        let getEventType
        if (element.type === 'text') {
          getEventType = 'keyup'
        } else {
          getEventType = 'change'
        }
        // update count on load
        if (element.type === 'text' || element.type === 'select-one') {
          if (element.value !== '') {
            this.selected.push(singleElement)
            groupedElements.push(multipleElements)
            this.updateDom()
          }
        } else if (element.type === 'checkbox' || element.type === 'radio') {
          if (element.checked) {
            this.selected.push(multipleElements)
            groupedElements.push(multipleElements)
            this.updateDom()
          }
        }
        // update count on eventType
        element.addEventListener(getEventType, () => {
          if (element.type === 'text' || element.type === 'select-one') {
            if (element.value !== '') {
              if (!this.selected.includes(singleElement)) {
                this.selected.push(singleElement)
              }
              if (!groupedElements.includes(multipleElements)) {
                groupedElements.push(multipleElements)
              }
              this.updateDom()
            } else {
              if ((this.selected.indexOf(singleElement) !== -1) && groupedElements.length === 1) {
                this.selected.splice(this.selected.indexOf(singleElement), 1)
              }
              groupedElements.splice(groupedElements.indexOf(multipleElements), 1)
              this.updateDom()
            }
          } else if (element.type === 'checkbox' || element.type === 'radio') {
            if (element.checked) {
              if (!this.selected.includes(multipleElements)) {
                this.selected.push(multipleElements)
              }
              if (!groupedElements.includes(multipleElements)) {
                groupedElements.push(multipleElements)
              }
              this.updateDom()
            } else {
              if (this.selected.indexOf(multipleElements) !== -1) {
                this.selected.splice(this.selected.indexOf(multipleElements), 1)
              }
              groupedElements.splice(groupedElements.indexOf(multipleElements), 1)
              this.updateDom()
            }
          }
        })
      })
    }
  }

  updateLabel(options) {
    const text = options.title
    const elementsArray = []
    if (options.array.length > 0) {
      const labelText = (text) ? text.innerText : null
      options.array.forEach((element, index) => {
        const arrayItems = `input-${labelText}-${index}`
        // Get field type
        let getEventType
        if (element.type === 'text') {
          getEventType = 'keyup'
        } else {
          getEventType = 'change'
        }
        // update label on load
        if (element.type === 'text' || element.type === 'select-one') {
          if (element.value !== '') {
            elementsArray.push(arrayItems)
            if (text) {
              text.innerText = labelText
              text.innerHTML = `${text.innerText} ${this.checkIcon}`
            }
          }
        } else if (element.type === 'checkbox' || element.type === 'radio') {
          if (element.checked) {
            elementsArray.push(arrayItems)
            if (text) {
              text.innerText = labelText
              text.innerHTML = `${text.innerText} ${this.checkIcon}`
            }
          }
        }
        // update label on eventType
        element.addEventListener(getEventType, () => {
          if (element.type === 'text' || element.type === 'select-one') {
            if (element.value !== '') {
              if (!elementsArray.includes(arrayItems)) {
                elementsArray.push(arrayItems)
              }
            } else {
              elementsArray.splice(elementsArray.indexOf(arrayItems), 1)
            }
          } else if (element.type === 'checkbox' || element.type === 'radio') {
            if (element.checked) {
              if (!elementsArray.includes(arrayItems)) {
                elementsArray.push(arrayItems)
              }
            } else {
              elementsArray.splice(elementsArray.indexOf(arrayItems), 1)
            }
          }
          if (text) {
            if (elementsArray.length > 0) {
              text.innerText = labelText
              text.innerHTML = `${text.innerText} ${this.checkIcon}`
            } else {
              text.innerText = labelText
            }
          }
        })
      })
    }
  }

  selectedItems() {
    this.filtersItems.forEach((filter) => {
      const button = filter.querySelector('.nsw-filters__item-name')
      const content = filter.querySelector('.nsw-filters__item-content')
      const text = content.querySelectorAll('input[type="text"]')
      const selects = content.querySelectorAll('select')
      const checkboxes = content.querySelectorAll('input[type="checkbox"]')

      this.updateCount({ array: text, title: button })
      this.updateCount({ array: selects, title: button })
      this.updateCount({ array: checkboxes, title: button })

      this.updateLabel({ array: text, title: button })
      this.updateLabel({ array: selects, title: button })
      this.updateLabel({ array: checkboxes, title: button })
    })
  }

  clearAllFilters(e) {
    e.preventDefault()
    this.filtersItems.forEach((filter) => {
      const button = filter.querySelector('.nsw-filters__item-name')
      const content = filter.querySelector('.nsw-filters__item-content')
      const text = content.querySelectorAll('input[type="text"]')
      const selects = content.querySelectorAll('select')
      const checkboxes = content.querySelectorAll('input[type="checkbox"]')

      if (text.length > 0) {
        text.forEach((input) => {
          const field = input
          if (input.value.length > 0) {
            field.value = ''
          }
        })
      }

      if (selects.length > 0) {
        selects.forEach((select) => {
          const option = select
          if (option.value !== '') {
            option.value = ''
          }
        })
      }

      if (checkboxes.length > 0) {
        checkboxes.forEach((input) => {
          const checkbox = input
          if (checkbox.checked) {
            checkbox.checked = false
          }
        })
      }

      if (button) {
        const buttonCheck = button.querySelector('span.nsw-material-icons')
        if (buttonCheck) {
          buttonCheck.remove()
        }
      }

      this.selected = []
      this.updateDom()
    })
  }
}

export default Filters
