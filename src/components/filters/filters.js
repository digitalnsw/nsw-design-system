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
    this.closeButton = this.wrapper.querySelector(`.${this.prefix}${this.closeClass} button`)
    this.submitButton = this.wrapper.querySelector(`.${this.prefix}${this.submitClass} button`)
    this.resetButton = this.wrapper.querySelector(`.${this.prefix}${this.resetClass} button`)
    this.items = this.wrapper.querySelectorAll(`.${this.prefix}${this.itemClass}`)
    this.accordionButtons = this.wrapper.querySelectorAll(`.${this.prefix}${this.itemClass}-button`)
    this.showMoreContent = this.element.querySelectorAll(`.${this.prefix}${this.allClass}`)
    this.showMoreButtons = this.element.querySelectorAll(`.${this.prefix}${this.moreClass}`)
    this.focusableElements = 'a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled])'
    // Accordion arrays
    this.buttons = []
    this.content = []
    this.options = []
    this.selected = []
  }

  init() {
    this.element.classList.add('ready')

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

    this.getOptions()

    if (this.options.length > 0) {
      this.options.forEach((input) => {
        const option = input
        if (option.type === 'text' || option.type === 'select-one') {
          option.value = ''
        } else if (!option.parentElement.classList.contains('js-multi-select__option')) {
          option.value = false
          option.checked = false
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
    this.items.forEach((element) => {
      const content = element.querySelector(`.${this.prefix}${this.itemClass}-content`)
      const text = content.querySelectorAll('input[type="text"]')
      const selects = content.querySelectorAll('select:not(.nsw-display-none)')
      const checkboxes = content.querySelectorAll('input[type="checkbox"]')
      this.options.push(...text, ...selects, ...checkboxes)
    })
  }

  getSelected() {
    if (this.options.length > 0) {
      this.selected = []
      const multiSelect = this.options.filter((option) => option.parentElement.getAttribute('aria-selected') === 'true')
      const select = this.options.filter((option) => option.selected)
      const checkboxes = this.options.filter((option) => option.checked)
      const text = this.options.filter((option) => option.type === 'text' && option.value !== '')
      this.selected = [...multiSelect, ...select, ...checkboxes, ...text]
    }
  }

  selectedCount(array) {
    if (this.count) {
      if (array.length > 0) {
        this.controlsButtonText.innerText = `${this.controlsButtonTextContent} (${array.length})`
      } else {
        this.controlsButtonText.innerText = `${this.controlsButtonTextContent}`
      }
    }
  }

  updateDom() {
    this.getOptions()
    this.getSelected()
    this.toggleSubmit(this.selected)
    this.selectedCount(this.selected)
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

  static moveFocusFn(element) {
    element.focus()
    if (document.activeElement !== element) {
      element.setAttribute('tabindex', '-1')
      element.focus()
    }
  }
}

export default Filters
