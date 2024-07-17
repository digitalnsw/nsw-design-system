/* eslint-disable max-len */
import { uniqueId } from '../../global/scripts/helpers/utilities'

class Filters {
  constructor(element) {
    this.element = element
    // Classes
    this.hideClass = 'nsw-display-none'
    this.showClass = 'active'
    this.openClass = 'filters-open'
    this.prefix = 'nsw-'
    this.class = 'filters'
    this.controlsClass = `${this.class}__controls`
    this.wrapperClass = `${this.class}__wrapper`
    this.listClass = `${this.class}__list`
    this.itemClass = `${this.class}__item`
    this.resetClass = `${this.class}__cancel`
    this.submitClass = `${this.class}__accept`
    this.closeClass = `${this.class}__back`
    this.countClass = `${this.class}__count`
    this.allClass = `${this.class}__all`
    this.moreClass = `${this.class}__more`
    // Elements
    this.count = this.element.querySelector(`.js-${this.countClass}`)
    this.controls = this.element.querySelector(`.${this.prefix}${this.controlsClass}`)
    this.controlsButton = this.controls && this.controls.querySelector('button')
    this.controlsButtonIcons = this.controlsButton && this.controlsButton.querySelectorAll('span')
    this.controlsButtonText = this.controlsButton && this.controlsButton.querySelector('span:not(.nsw-material-icons)')
    this.controlsButtonTextContent = this.controlsButton && this.controlsButtonText.innerText
    this.wrapper = this.element.querySelector(`.${this.prefix}${this.wrapperClass}`)
    this.closeButton = this.wrapper && this.wrapper.querySelector(`.${this.prefix}${this.closeClass} button`)
    this.submitButton = this.wrapper && this.wrapper.querySelector(`.${this.prefix}${this.submitClass} button`)
    this.resetButton = this.wrapper && this.wrapper.querySelector(`.${this.prefix}${this.resetClass} button`)
    this.items = this.wrapper && this.wrapper.querySelectorAll(`.${this.prefix}${this.itemClass}`)
    this.accordionButtons = this.wrapper && this.wrapper.querySelectorAll(`.${this.prefix}${this.itemClass}-button`)
    this.showMoreContent = this.element.querySelectorAll(`.${this.prefix}${this.allClass}`)
    this.showMoreButtons = this.element.querySelectorAll(`.${this.prefix}${this.moreClass}`)
    this.focusableElements = 'a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled])'
    // Get default selected option
    this.selectedOption = this.element.querySelector('option[selected]')
    // Accordion arrays
    this.buttons = []
    this.content = []
    this.options = []
    this.selected = []
  }

  init() {
    this.element.classList.add('ready')

    if (this.accordionButtons) {
      this.accordionButtons.forEach((button) => {
        const buttonElem = button
        const uID = uniqueId('collapsed')
        buttonElem.setAttribute('type', 'button')
        buttonElem.setAttribute('aria-expanded', 'false')
        buttonElem.setAttribute('aria-controls', uID)
        const label = buttonElem.querySelector(`.${this.prefix}${this.itemClass}-name`)
        buttonElem.setAttribute('data-label', label.innerText)

        const contentElem = buttonElem.nextElementSibling
        contentElem.id = buttonElem.getAttribute('aria-controls')
        contentElem.hidden = true

        this.content.push(contentElem)
        this.buttons.push(buttonElem)
      })
    }

    this.updateDom()
    this.initEvents()
  }

  initEvents() {
    document.addEventListener('DOMContentLoaded', () => {
      this.updateDom()
    })

    if (this.options) {
      this.options.forEach((element) => {
        element.addEventListener('change', () => {
          this.updateDom()
        })
      })
    }

    if (this.controlsButton) {
      this.controlsButton.addEventListener('click', (event) => {
        this.showFilters(event)
      })
    }

    if (this.submitButton) {
      this.submitButton.disabled = true
    }

    if (this.closeButton) {
      this.closeButton.addEventListener('click', (event) => {
        this.closeFilters(event)
      })
    }

    if (this.buttons) {
      this.buttons.forEach((element) => {
        element.addEventListener('click', (event) => {
          this.toggleAccordion(event)
        })
      })
    }

    if (this.resetButton) {
      this.resetButton.addEventListener('click', (event) => {
        this.clearAll(event)
      })

      this.resetButton.addEventListener('change', (event) => {
        this.clearAll(event)
      })
    }

    if (this.showMoreButtons) {
      this.showMoreButtons.forEach((element, index) => {
        element.addEventListener('click', (event) => {
          this.showMore(event, index)
        })
      })
    }
  }

  setAccordionState(element, state) {
    const targetContent = this.getTargetContent(element)
    const firstfocusable = targetContent.querySelector(this.focusableElements)

    if (state === 'open') {
      element.classList.add(this.showClass)
      element.setAttribute('aria-expanded', 'true')
      targetContent.hidden = false
      this.constructor.moveFocusFn(firstfocusable)
    } else if (state === 'close') {
      element.classList.remove(this.showClass)
      element.setAttribute('aria-expanded', 'false')
      targetContent.hidden = true
    }
  }

  toggleAccordion(event) {
    const { currentTarget } = event
    const targetContent = this.getTargetContent(currentTarget)

    if (targetContent.hidden) {
      this.setAccordionState(currentTarget, 'open')
    } else {
      this.setAccordionState(currentTarget, 'close')
    }
  }

  getTargetContent(element) {
    const currentIndex = this.buttons.indexOf(element)
    return this.content[currentIndex]
  }

  toggleSubmit(array) {
    if (this.submitButton) {
      if (array.length > 0) {
        this.submitButton.disabled = false
      } else {
        this.submitButton.disabled = true
      }
    }
  }

  showMore(event, index) {
    event.preventDefault()
    const firstfocusable = this.showMoreContent[index].querySelector(this.focusableElements)
    this.showMoreContent[index].classList.remove(this.hideClass)
    event.target.classList.add(this.hideClass)
    this.constructor.moveFocusFn(firstfocusable)
  }

  closeFilters(event) {
    event.preventDefault()
    this.element.classList.remove(this.showClass)
    document.body.classList.remove(this.openClass)
  }

  showFilters(event) {
    event.preventDefault()
    if (this.element.classList.contains('nsw-filters--down')) {
      this.element.classList.toggle(this.showClass)
    } else {
      this.trapFocus(this.wrapper)
      this.element.classList.add(this.showClass)
      document.body.classList.add(this.openClass)
    }
  }

  clearAll(event) {
    event.preventDefault()

    const simulateEvent = new MouseEvent('change', {
      view: window,
      bubbles: true,
      cancelable: true,
    })

    const multiSelect = this.element.querySelector('.js-multi-select')
    const multiSelectAll = multiSelect && multiSelect.querySelector('.js-multi-select__all')
    const multiSelectOptions = multiSelect && multiSelect.querySelectorAll('.js-multi-select__option')

    if (this.options.length > 0) {
      this.options.forEach((input) => {
        const option = input
        if (option.type === 'text') {
          option.value = ''
        } else if (option.type === 'select-one') {
          if (this.selectedOption) {
            console.log(Array.from(option.options).indexOf(this.selectedOption))
            option.selectedIndex = Array.from(option.options).indexOf(this.selectedOption)
          } else {
            option.selectedIndex = 0
          }
        } else if (option.type === 'checkbox') {
          if (option.defaultChecked) {
            option.checked = true
          } else {
            option.checked = false
          }
        } else if (!option.parentElement.classList.contains('js-multi-select__option')) {
          option.value = false
        }
      })
    }

    if (multiSelect) {
      multiSelectAll.classList.remove(this.showClass)

      multiSelectOptions.forEach((element) => {
        element.setAttribute('aria-selected', 'true')
        element.dispatchEvent(new Event(simulateEvent))
        element.click()
      })
    }

    this.updateDom()
  }

  getOptions() {
    this.options = []
    if (this.items) {
      this.items.forEach((element) => {
        const content = element.querySelector(`.${this.prefix}${this.itemClass}-content`)
        const textInputs = content.querySelectorAll('input[type="text"]')
        const singleSelects = content.querySelectorAll('select:not([multiple]):not(.nsw-display-none)')
        const multiSelects = content.querySelectorAll('select[multiple]:not(.nsw-display-none)')
        const checkboxes = content.querySelectorAll('input[type="checkbox"]')
        this.options.push(...textInputs, ...singleSelects, ...checkboxes, ...multiSelects)
      })
    }
  }

  getSelected() {
    this.selected = []
    if (this.options.length > 0) {
      const select = this.options.filter((option) => option.type === 'select-one' && option.value !== '')
      const checkboxes = this.options.filter((option) => option.checked)
      const text = this.options.filter((option) => option.type === 'text' && option.value !== '')
      const multiple = this.options.filter((option) => option.type === 'select-multiple' && option.value !== '')
      const selectMultiple = this.constructor.getMultiSelectValues(multiple)
      this.selected = [...select, ...checkboxes, ...text, ...selectMultiple]
    }
  }

  selectedCount(array) {
    if (!this.count) return

    const dateInputs = array.filter((option) => option.closest('.nsw-form__date'))
    const removedDateInputs = array.filter((option) => !option.closest('.nsw-form__date'))

    let buttonText = `${this.controlsButtonTextContent}`

    let countText = ''

    if (dateInputs.length > 0) {
      countText = ` (${removedDateInputs.length + 1})`
    } else {
      countText = ` (${array.length})`
    }

    if (dateInputs.length === 0 && array.length === 0) {
      this.controlsButtonText.innerText = buttonText
    } else {
      buttonText += countText
      this.controlsButtonText.innerText = buttonText
    }
  }

  setSelectedState() {
    const formElements = 'textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled]):not(.nsw-display-none)'
    const checkIcon = '<span class="material-icons nsw-material-icons nsw-material-icons--valid" focusable="false" aria-hidden="true">check_circle</span>'

    this.buttons.forEach((element) => {
      const buttonName = element.querySelector(`.${this.prefix}${this.itemClass}-name`)
      const label = element.getAttribute('data-label')
      const content = element.nextElementSibling
      const values = content.querySelectorAll(formElements)

      const selected = Array.from(values).filter((field) => {
        if (field.type === 'checkbox' || field.type === 'radio') {
          return field.checked
        }
        return field.value !== ''
      })

      if (selected.length > 0) {
        buttonName.innerText = label
        buttonName.innerHTML = `${label} ${checkIcon}`
      } else if (selected.length === 0) {
        buttonName.innerText = label
      }
    })
  }

  updateDom() {
    this.getOptions()
    this.getSelected()
    this.toggleSubmit(this.selected)
    this.selectedCount(this.selected)
    this.setSelectedState()
  }

  trapFocus(element) {
    const focusableContent = element.querySelectorAll(this.focusableElements)
    const firstFocusableElement = focusableContent[0]
    const lastFocusableElement = focusableContent[focusableContent.length - 1]

    document.addEventListener('keydown', (event) => {
      const tab = (event.code && event.code === 9) || (event.key && event.key === 'Tab')
      if (!tab) return

      if (document.activeElement === firstFocusableElement && event.shiftKey) {
        event.preventDefault()
        lastFocusableElement.focus()
      }
      if (document.activeElement === lastFocusableElement && !event.shiftKey) {
        event.preventDefault()
        firstFocusableElement.focus()
      }
    })

    firstFocusableElement.focus()
  }

  static getMultiSelectValues(array) {
    let selectedOptions = []

    if (array.length > 0) {
      array.forEach((element) => {
        selectedOptions = Array.from(element.options).filter((option) => option.selected)
      })
    }

    return selectedOptions
  }

  static moveFocusFn(element) {
    element.focus()
    if (document.activeElement !== element) {
      element.setAttribute('tabindex', '-1')
      element.focus()
    }
  }
}

export default Filters
