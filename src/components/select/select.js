/* eslint-disable max-len */
class Select {
  constructor(element) {
    this.element = element
    this.select = this.element.querySelector('select')
    this.optGroups = this.select && this.select.getElementsByTagName('optgroup')
    this.options = this.select && this.select.getElementsByTagName('option')
    this.selectId = this.select && this.select.getAttribute('id')
    this.trigger = false
    this.dropdown = false
    this.customOptions = false
    this.list = false
    this.allButton = false
    this.arrowIcon = this.element.getElementsByTagName('svg')
    this.label = document.querySelector(`[for="${this.selectId}"]`)
    this.selectedOptCounter = 0
    this.optionIndex = 0
    this.noSelectText = this.element.getAttribute('data-select-text') || 'Select'
    this.multiSelectText = this.element.getAttribute('data-multi-select-text') || '{n} items selected'
    this.nMultiSelect = this.element.getAttribute('data-n-multi-select') || 1
    this.noUpdateLabel = this.element.getAttribute('data-update-text') && this.element.getAttribute('data-update-text') === 'off'
    this.insetLabel = this.element.getAttribute('data-inset-label') && this.element.getAttribute('data-inset-label') === 'on'
    this.hideClass = 'nsw-display-none'
    this.showClass = 'active'
    this.errorClass = 'has-error'
    this.srClass = 'sr-only'
    this.prefix = 'nsw-'
    this.class = 'multi-select'
    this.buttonClass = `${this.class}__button`
    this.allButtonClass = `${this.class}__all`
    this.listClass = `${this.class}__list`
    this.optionClass = `${this.class}__option`
    this.dropdownClass = `${this.class}__dropdown`
    this.checkboxClass = `${this.class}__checkbox`
    this.itemClass = `${this.class}__item`
    this.labelClass = `${this.class}__label`
    this.termClass = `${this.class}__term`
    this.detailsClass = `${this.class}__details`
    this.selectClass = 'form__select'
    this.checkboxLabelClass = 'form__checkbox-label'
    this.checkboxInputClass = 'form__checkbox-input'
  }

  init() {
    if (!this.select) return
    this.element.insertAdjacentHTML('beforeend', this.initButtonSelect() + this.initListSelect())

    this.dropdown = this.element.querySelector(`.js-${this.dropdownClass}`)
    this.trigger = this.element.querySelector(`.js-${this.buttonClass}`)
    this.customOptions = this.dropdown.querySelectorAll(`.js-${this.optionClass}`)
    this.list = this.dropdown.querySelector(`.js-${this.listClass}`)
    this.list.insertAdjacentHTML('afterbegin', this.initAllButton())
    this.allButton = this.list.querySelector(`.js-${this.allButtonClass}`)

    this.select.classList.add(this.hideClass)
    if (this.arrowIcon.length > 0) this.arrowIcon[0].style.display = 'none'
    this.initCustomSelectEvents()
    this.updateAllButton()
    if (this.select && this.select.hasAttribute('multiple')) {
      this.clearAllButton()
    }
  }

  initCustomSelectEvents() {
    this.initSelection()

    this.trigger.addEventListener('click', (event) => {
      event.preventDefault()
      this.toggleCustomSelect(false)
    })

    if (this.label) {
      this.label.addEventListener('click', () => {
        this.constructor.moveFocusFn(this.trigger)
      })
    }

    this.dropdown.addEventListener('keydown', (event) => {
      if (event.key && event.key.toLowerCase() === 'arrowup') {
        this.keyboardCustomSelect('prev', event)
      } else if (event.key && event.key.toLowerCase() === 'arrowdown') {
        this.keyboardCustomSelect('next', event)
      }
    })

    window.addEventListener('keyup', (event) => {
      if (event.key && event.key.toLowerCase() === 'escape') {
        this.moveFocusToSelectTrigger()
        this.toggleCustomSelect('false')
      }
    })

    window.addEventListener('click', (event) => {
      this.checkCustomSelectClick(event.target)
    })
  }

  toggleCustomSelect(bool) {
    let ariaExpanded
    if (bool) {
      ariaExpanded = bool
    } else {
      ariaExpanded = this.trigger.getAttribute('aria-expanded') === 'true' ? 'false' : 'true'
    }
    this.trigger.setAttribute('aria-expanded', ariaExpanded)

    const options = this.dropdown.querySelectorAll(`.js-${this.optionClass}`)
    options.forEach((option) => {
      const isVisible = ariaExpanded === 'true'
      option.setAttribute('aria-hidden', !isVisible)
    })

    if (ariaExpanded === 'true') {
      const selectedOption = this.getSelectedOption() || this.allButton
      this.constructor.moveFocusFn(selectedOption)

      const cb = () => {
        this.constructor.moveFocusFn(selectedOption)
        this.dropdown.removeEventListener('transitionend', cb)
      }

      this.dropdown.addEventListener('transitionend', cb)
      this.constructor.trapFocus(this.dropdown)
      this.placeDropdown()
    }
  }

  placeDropdown() {
    const {
      top, bottom, left,
    } = this.trigger.getBoundingClientRect()

    this.dropdown.classList.toggle(`${this.prefix}${this.dropdownClass}--right`, (window.innerWidth < left + this.dropdown.offsetWidth))
    const moveUp = (window.innerHeight - bottom) < top
    this.dropdown.classList.toggle(`${this.prefix}${this.dropdownClass}--up`, moveUp)
    const maxHeight = moveUp ? top - 20 : window.innerHeight - bottom - 20
    const vhCalc = Math.ceil((100 * maxHeight) / window.innerHeight)
    this.dropdown.setAttribute('style', `max-height: ${vhCalc}vh;`)
  }

  keyboardCustomSelect(direction, event) {
    event.preventDefault()
    const allOptions = [...this.customOptions, this.allButton]
    let index = allOptions.findIndex((option) => option === document.activeElement.closest(`.js-${this.optionClass}`))
    index = (direction === 'next') ? index + 1 : index - 1
    if (index < 0) index = allOptions.length - 1
    if (index >= allOptions.length) index = 0
    const targetOption = allOptions[index].querySelector(`.js-${this.checkboxClass}`) || this.allButton
    this.constructor.moveFocusFn(targetOption)
  }

  toggleAllButton() {
    const status = !this.allButton.classList.contains(this.showClass)
    this.allButton.classList.toggle(this.showClass, status)

    const [optionsArray, totalOptions, selectedOptions] = this.getOptions()

    optionsArray.forEach((option) => {
      option.setAttribute('aria-selected', 'false')
      this.selectOption(option)
    })

    if (selectedOptions === totalOptions) {
      optionsArray.forEach((option) => this.selectOption(option))
    }
  }

  initSelection() {
    this.allButton.addEventListener('click', (event) => {
      event.preventDefault()
      this.toggleAllButton()
    })
    this.dropdown.addEventListener('change', (event) => {
      const option = event.target.closest(`.js-${this.optionClass}`)
      if (!option) return
      this.selectOption(option)
    })
    this.dropdown.addEventListener('click', (event) => {
      const option = event.target.closest(`.js-${this.optionClass}`)
      if (!option || !event.target.classList.contains(`js-${this.optionClass}`)) return
      this.selectOption(option)
    })
  }

  selectOption(option) {
    const input = option.querySelector(`.js-${this.checkboxClass}`)

    if (option.hasAttribute('aria-selected') && option.getAttribute('aria-selected') === 'true') {
      input.checked = false
      input.removeAttribute('checked')
      option.setAttribute('aria-selected', 'false')
      this.updateNativeSelect(option.getAttribute('data-index'), false)
    } else {
      input.checked = true
      input.value = true
      input.setAttribute('checked', '')
      option.setAttribute('aria-selected', 'true')
      this.updateNativeSelect(option.getAttribute('data-index'), true)
    }

    const triggerLabel = this.getSelectedOptionText()

    const [selectedLabel] = triggerLabel
    this.trigger.querySelector(`.js-${this.labelClass}`).innerHTML = selectedLabel

    this.trigger.classList.toggle(`${this.prefix}${this.buttonClass}--active`, this.selectedOptCounter > 0)
    this.updateTriggerAria(triggerLabel[1])
    this.updateAllButton()
  }

  updateAllButton() {
    const [, totalOptions, selectedOptions] = this.getOptions()

    if (selectedOptions === totalOptions) {
      this.allButton.classList.add(this.showClass)
    } else {
      this.allButton.classList.remove(this.showClass)
    }
  }

  clearAllButton() {
    if (this.dropdown.querySelector('.nsw-multi-select__clear-all-button')) return

    const clearButton = document.createElement('button')
    clearButton.textContent = 'Clear all selections'
    clearButton.className = `${this.prefix}link nsw-multi-select__clear-all-button`
    clearButton.addEventListener('click', (e) => {
      e.preventDefault()
      this.clearAllSelections()
    })
    this.dropdown.appendChild(clearButton)
  }

  clearAllSelections() {
    const [optionsArray] = this.getOptions()
    optionsArray.forEach((option) => {
      if (option.getAttribute('aria-selected') === 'true') {
        this.selectOption(option) // Toggles off
      }
    })
  }

  updateNativeSelect(index, bool) {
    this.options[index].selected = bool
    this.select.dispatchEvent(new CustomEvent('change', { bubbles: true }))
  }

  updateTriggerAria(ariaLabel) {
    this.trigger.setAttribute('aria-label', ariaLabel)
  }

  getSelectedOptionText() {
    const noSelectionText = `<span class="${this.prefix}${this.termClass}">${this.noSelectText}</span>`
    if (this.noUpdateLabel) return [noSelectionText, this.noSelectText]
    let label = ''
    let ariaLabel = ''
    this.selectedOptCounter = 0

    for (let i = 0; i < this.options.length; i += 1) {
      if (this.options[i].selected) {
        if (this.selectedOptCounter !== 0) label += ', '
        label = `${label}${this.options[i].text}`
        this.selectedOptCounter += 1
      }
    }

    if (this.selectedOptCounter > this.nMultiSelect) {
      label = `<span class="${this.prefix}${this.detailsClass}">${this.multiSelectText.replace('{n}', this.selectedOptCounter)}</span>`
      ariaLabel = `${this.multiSelectText.replace('{n}', this.selectedOptCounter)}, ${this.noSelectText}`
    } else if (this.selectedOptCounter > 0) {
      ariaLabel = `${label}, ${this.noSelectText}`
      label = `<span class="${this.prefix}${this.detailsClass}">${label}</span>`
    } else {
      label = noSelectionText
      ariaLabel = this.noSelectText
    }

    if (this.insetLabel && this.selectedOptCounter > 0) label = noSelectionText + label
    return [label, ariaLabel]
  }

  initButtonSelect() {
    const customClasses = this.element.getAttribute('data-trigger-class') ? ` ${this.element.getAttribute('data-trigger-class')}` : ''
    const error = this.select.getAttribute('aria-invalid')

    const triggerLabel = this.getSelectedOptionText()
    const activeSelectionClass = this.selectedOptCounter > 0 ? ` ${this.buttonClass}--active` : ''

    let button = `<button class="js-${this.buttonClass} ${error === 'true' ? this.errorClass : ''} ${this.prefix}${this.selectClass} ${this.prefix}${this.buttonClass}${customClasses}${activeSelectionClass}" aria-label="${triggerLabel[1]}" aria-expanded="false" aria-controls="${this.selectId}-dropdown"><span aria-hidden="true" class="js-${this.labelClass} ${this.prefix}${this.labelClass}">${triggerLabel[0]}</span><span class="material-icons nsw-material-icons" focusable="false" aria-hidden="true">keyboard_arrow_down</span>`

    if (this.arrowIcon.length > 0 && this.arrowIcon[0].outerHTML) {
      button += this.arrowIcon[0].outerHTML
    }

    return `${button}</button>`
  }

  initListSelect() {
    let list = `<div class="js-${this.dropdownClass} ${this.prefix}${this.dropdownClass}" aria-describedby="${this.selectId}-description" id="${this.selectId}-dropdown">`
    list += this.getSelectLabelSR()
    if (this.optGroups.length > 0) {
      for (let i = 0; i < this.optGroups.length; i += 1) {
        const optGroupList = this.optGroups[i].getElementsByTagName('option')
        const optGroupLabel = `<li><span class="${this.prefix}${this.itemClass} ${this.prefix}${this.itemClass}--optgroup">${this.optGroups[i].getAttribute('label')}</span></li>`
        list = `${list}<ul class="${this.prefix}${this.listClass}" role="listbox" aria-multiselectable="true">${optGroupLabel}${this.getOptionsList(optGroupList)}</ul>`
      }
    } else {
      list = `${list}<ul class="${this.prefix}${this.listClass} js-${this.listClass}" role="listbox" aria-multiselectable="true">${this.getOptionsList(this.options)}</ul>`
    }
    return list
  }

  initAllButton() {
    return `<button class="${this.prefix}${this.allButtonClass} js-${this.allButtonClass}"><span>All</span></button>`
  }

  getSelectLabelSR() {
    if (this.label) {
      return `<p class="${this.srClass}" id="${this.selectId}-description">${this.label.textContent}</p>`
    }
    return ''
  }

  getOptionsList(options) {
    let list = ''
    for (let i = 0; i < options.length; i += 1) {
      const selected = options[i].hasAttribute('selected') ? ' aria-selected="true"' : ' aria-selected="false"'
      const disabled = options[i].hasAttribute('disabled') ? 'disabled' : ''
      const checked = options[i].hasAttribute('selected') ? 'checked' : ''
      const uniqueName = this.constructor.createSafeCss(`${this.selectId}-${options[i].value}-${this.optionIndex.toString()}`)
      const ariaHidden = options[i].hasAttribute('hidden') ? 'aria-hidden="true"' : ''
      list = `${list}<li class="js-${this.optionClass}" role="option" data-value="${options[i].value}" ${selected} ${ariaHidden} data-label="${options[i].text}" data-index="${this.optionIndex}"><input class="${this.prefix}${this.checkboxInputClass} js-${this.checkboxClass}" type="checkbox" id="${uniqueName}" ${checked} ${disabled}><label class="${this.prefix}${this.checkboxLabelClass} ${this.prefix}${this.itemClass} ${this.prefix}${this.itemClass}--option" for="${uniqueName}"><span>${options[i].text}</span></label></li>`
      this.optionIndex += 1
    }
    return list
  }

  getSelectedOption() {
    const option = this.dropdown.querySelector('[aria-selected="true"]')
    if (option) return option.querySelector(`.js-${this.checkboxClass}`)
    return this.allButton
  }

  getOptions() {
    const options = Array.from(this.dropdown.querySelectorAll(`.js-${this.optionClass}`))
    const total = options.length
    const selected = options.filter((option) => option.getAttribute('aria-selected') === 'true').length
    return [options, total, selected]
  }

  moveFocusToSelectTrigger() {
    if (!document.activeElement.closest(`.js-${this.class}`)) return
    this.trigger.focus()
  }

  static trapFocus(element) {
    const focusableElements = 'a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled])'

    const firstFocusableElement = element.querySelectorAll(focusableElements)[0]
    const focusableContent = element.querySelectorAll(focusableElements)
    const lastFocusableElement = focusableContent[focusableContent.length - 1]

    document.addEventListener('keydown', (event) => {
      const isTabPressed = event.key === 'Tab' || event.code === 9

      if (!isTabPressed) {
        return
      }

      if (event.shiftKey) {
        if (document.activeElement === firstFocusableElement) {
          lastFocusableElement.focus()
          event.preventDefault()
        }
      } else if (document.activeElement === lastFocusableElement) {
        firstFocusableElement.focus()
        event.preventDefault()
      }
    })

    firstFocusableElement.focus()
  }

  checkCustomSelectClick(target) {
    if (!this.element.contains(target)) this.toggleCustomSelect('false')
  }

  static createSafeCss(str) {
    const invalidBeginningOfClassname = /^([0-9]|--|-[0-9])/

    if (typeof str !== 'string') {
      return ''
    }

    const strippedClassname = str
      .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
      .map((x) => x.toLowerCase())
      .join('-')

    return invalidBeginningOfClassname.test(strippedClassname)
      ? `_${strippedClassname}`
      : strippedClassname
  }

  static moveFocusFn(element) {
    element.focus()
    if (document.activeElement !== element) {
      element.setAttribute('tabindex', '-1')
      element.focus()
    }
  }
}

export default Select
