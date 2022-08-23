import { uniqueId } from '../../global/scripts/helpers/utilities'

class Filters {
  constructor(element) {
    this.filters = element
    this.filtersWrapper = element.querySelector('.nsw-filters__wrapper')
    this.openButton = element.querySelector('.nsw-filters__controls button')
    this.selectedCount = element.querySelector('.js-filters--count')
    this.isSingleCount = element.querySelectorAll('.js-filters--single-count')
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
    this.focusableEls = this.filtersWrapper.querySelectorAll('a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled])')
    this.checkIcon = '<span class="material-icons nsw-material-icons" focusable="false" aria-hidden="true">check_circle</span>'
    this.eventType = ''
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
      this.trapFocus(this.filtersWrapper)
      this.filters.classList.add('active')
      this.body.classList.add('filters-open')
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

      if (!isTabPressed) { return }

      if (e.shiftKey) {
        if (document.activeElement === firstFocusableEl) {
          e.preventDefault()
          lastFocusableEl.focus()
        }
      } else if (document.activeElement === lastFocusableEl) {
        e.preventDefault()
        firstFocusableEl.focus()
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

  getEventType(type) {
    if (type === 'text') {
      this.eventType = 'input'
    } else {
      this.eventType = 'change'
    }
    return this.eventType
  }

  getCondition(element) {
    this.body = document.body
    if (element.type === 'text' || element.type === 'select-one') {
      return element.value !== ''
    }
    return element.checked
  }

  singleCount(element, index, id) {
    this.body = document.body
    const isSingleCount = element.closest('.js-filters--single-count')
    if (!isSingleCount) {
      return { uniqueID: `${id}-${index}`, singleID: `${id}-${index}`, isSingleCount }
    }
    return { uniqueID: `${id}`, singleID: `${id}-${index}`, isSingleCount }
  }

  updateCount(options) {
    const id = uniqueId()
    const GroupArray = []
    if (options.array.length > 0) {
      options.array.forEach((element, index) => {
        const getEventType = this.getEventType(element.type)
        const { uniqueID, singleID, isSingleCount } = this.singleCount(element, index, id)
        if (this.getCondition(element)) {
          this.selected.push(uniqueID)
          if (isSingleCount) {
            GroupArray.push(singleID)
          }
          this.updateDom()
        }
        element.addEventListener(getEventType, () => {
          if (this.getCondition(element)) {
            if (!this.selected.includes(uniqueID)) {
              this.selected.push(uniqueID)
              this.updateDom()
            }
            if (isSingleCount && !GroupArray.includes(singleID)) {
              GroupArray.push(singleID)
            }
          } else {
            if (isSingleCount && GroupArray.indexOf(singleID) !== -1) {
              GroupArray.splice(GroupArray.indexOf(singleID), 1)
            }
            if (!isSingleCount && this.selected.indexOf(uniqueID) !== -1) {
              this.selected.splice(this.selected.indexOf(uniqueID), 1)
            } else if (GroupArray.length <= 0) {
              this.selected.splice(this.selected.indexOf(uniqueID), 1)
            }
            this.updateDom()
          }
        })
      })
    }
  }

  updateStatus(options) {
    const id = uniqueId()
    const text = options.title
    const GroupArray = []
    if (options.array.length > 0) {
      const labelText = (text) ? text.textContent : null
      options.array.forEach((element, index) => {
        const getEventType = this.getEventType(element.type)
        const { singleID } = this.singleCount(element, index, id)
        if (this.getCondition(element)) {
          if (text) {
            text.textContent = labelText
            text.innerHTML = `${text.textContent} ${this.checkIcon}`
          }
        }
        element.addEventListener(getEventType, () => {
          if (this.getCondition(element)) {
            if (!GroupArray.includes(singleID)) {
              GroupArray.push(singleID)
            }
          } else if (GroupArray.indexOf(singleID) !== -1) {
            GroupArray.splice(GroupArray.indexOf(singleID), 1)
          }
          if (text) {
            if (GroupArray.length > 0) {
              text.textContent = labelText
              text.innerHTML = `${text.textContent} ${this.checkIcon}`
            } else {
              text.textContent = labelText
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
      const text = content ? content.querySelectorAll('input[type="text"]') : null
      const selects = content ? content.querySelectorAll('select') : null
      const checkboxes = content ? content.querySelectorAll('input[type="checkbox"]') : null

      if (content) {
        this.updateCount({ array: text, title: button })
        this.updateCount({ array: selects, title: button })
        this.updateCount({ array: checkboxes, title: button })
        this.updateStatus({ array: text, title: button })
        this.updateStatus({ array: selects, title: button })
        this.updateStatus({ array: checkboxes, title: button })
      }
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
