/* eslint-disable prefer-template */
/* eslint-disable max-len */
class Select {
  constructor(element) {
    this.element = element
    this.select = this.element.querySelector('select')
    this.options = this.select.querySelectorAll('option')
    this.optGroups = this.select.querySelectorAll('optgroup')
    this.selectId = this.select.getAttribute('id')
    this.trigger = false
    this.dropdown = false
    this.customOptions = false
    this.label = this.element.closest('.nsw-form__label')
    this.selectedOptCounter = 0
    this.optionIndex = 0
    // label options
    this.noSelectText = this.element.getAttribute('data-no-select-text') || 'Select'
    this.multiSelectText = this.element.getAttribute('data-multi-select-text') || '{n} items selected'
    this.nMultiSelect = this.element.getAttribute('data-n-multi-select') || 1
    this.noUpdateLabel = this.element.getAttribute('data-update-text') && this.element.getAttribute('data-update-text') === 'off'
    this.insetLabel = this.element.getAttribute('data-inset-label') && this.element.getAttribute('data-inset-label') === 'on'

    this.dropdown = this.element.querySelector('js-multi-select__dropdown')
    this.trigger = this.element.querySelector('js-multi-select__button')
    this.customOptions = this.dropdown ? this.dropdown.querySelectorAll('js-multi-select__option') : null
  }

  init() {
    this.initCustomSelect()
    this.initCustomSelectEvents()
  }

  initCustomSelect() {
    // create the HTML for the custom dropdown element
    this.element.insertAdjacentHTML('beforeend', this.initButtonSelect() + this.initListSelect())

    // save custom elements
    this.dropdown = this.element.querySelector('.js-multi-select__dropdown')
    this.trigger = this.element.querySelector('.js-multi-select__button')
    this.customOptions = this.dropdown ? this.dropdown.querySelectorAll('js-multi-select__option') : null

    // hide default select
    this.constructor.addClass(this.select, 'hidden')
  }

  initCustomSelectEvents() {
    // option selection in dropdown
    this.initSelection()

    // click events
    this.trigger.addEventListener('click', (event) => {
      event.preventDefault()
      this.toggleCustomSelect(false)
    })

    if (this.label) {
      // move focus to custom trigger when clicking on <select> label
      this.label.addEventListener('click', () => {
        this.constructor.moveFocus(this.trigger)
      })
    }
    // keyboard navigation
    this.dropdown.addEventListener('keydown', (event) => {
      if ((event.keyCode && event.keyCode === 38) || (event.key && event.key.toLowerCase() === 'arrowup')) {
        this.keyboardCustomSelect('prev', event)
      } else if ((event.keyCode && event.keyCode === 40) || (event.key && event.key.toLowerCase() === 'arrowdown')) {
        this.keyboardCustomSelect('next', event)
      }
    })

    window.addEventListener('keyup', (event) => {
      if (event.key && event.key.toLowerCase() === 'escape') {
        // close custom select on 'Esc'
        this.moveFocusToSelectTrigger() // if focus is within dropdown, move it to dropdown trigger
        this.toggleCustomSelect('false') // close dropdown
      }
    })
    // close custom select when clicking outside it
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

    if (ariaExpanded === 'true') {
      const selectedOption = this.getSelectedOption()

      this.constructor.moveFocus(selectedOption) // fallback if transition is not supported

      this.dropdown.addEventListener('transitionend', function cb() {
        this.constructor.moveFocus(selectedOption)

        this.dropdown.removeEventListener('transitionend', cb)
      })

      this.placeDropdown() // place dropdown based on available space
    }
  }

  placeDropdown() {
    const triggerBoundingRect = this.trigger.getBoundingClientRect()
    this.constructor.toggleClass(this.dropdown, 'nsw-multi-select__dropdown--right', (window.innerWidth < triggerBoundingRect.left + this.dropdown.offsetWidth))

    // check if there's enough space up or down
    const moveUp = (window.innerHeight - triggerBoundingRect.bottom) < triggerBoundingRect.top
    this.constructor.toggleClass(this.dropdown, 'nsw-multi-select__dropdown--up', moveUp)
    // check if we need to set a max height
    const maxHeight = moveUp ? triggerBoundingRect.top - 20 : window.innerHeight - triggerBoundingRect.bottom - 20
    // set max-height (based on available space) and width
    this.dropdown.setAttribute('style', `max-height: ${maxHeight}px; width: ${triggerBoundingRect.width}px;`)
  }

  keyboardCustomSelect(direction, event) {
    // navigate custom dropdown with keyboard
    event.preventDefault()
    let index = this.constructor.getIndexInArray(this.customOptions, document.activeElement.closest('.js-multi-select__option'))
    index = (direction === 'next') ? index + 1 : index - 1
    if (index < 0) index = this.customOptions.length - 1
    if (index >= this.customOptions.length) index = 0
    this.constructor.moveFocus(this.customOptions[index].querySelector('.js-multi-select__checkbox'))
  }

  initSelection() {
    // option selection
    if (!this.dropdown) return

    this.dropdown.addEventListener('change', (event) => {
      const option = event.target.closest('.js-multi-select__option')

      if (!option) return

      this.selectOption(option)
    })

    this.dropdown.addEventListener('click', (event) => {
      const option = event.target.closest('.js-multi-select__option')
      if (!option || !this.constructor.hasClass(event.target, 'js-multi-select__option')) return

      this.selectOption(option)
    })
  }

  selectOption(option) {
    if (option.hasAttribute('aria-selected') && option.getAttribute('aria-selected') === 'true') {
      // deselecting that option
      option.setAttribute('aria-selected', 'false')
      // update native select element
      this.updateNativeSelect(option.getAttribute('data-index'), false)
    } else {
      option.setAttribute('aria-selected', 'true')
      // update native select element
      this.updateNativeSelect(option.getAttribute('data-index'), true)
    }
    const [label, ariaLabel] = this.getSelectedOptionText()
    this.trigger.querySelector('.js-multi-select__label').innerHTML = label // update trigger label
    this.constructor.toggleClass(this.trigger, 'active', this.selectedOptCounter > 0)
    this.updateTriggerAria(ariaLabel) // update trigger aria-label
  }

  initButtonSelect() {
    // create the button element -> custom select trigger
    const triggerLabel = this.getSelectedOptionText(this.element)

    const button = `<button class="nsw-button js-multi-select__button nsw-multi-select__button" aria-label="${triggerLabel[1]}" aria-expanded="false" aria-controls="${this.selectId}-dropdown">
      <span aria-hidden="true" class="js-multi-select__label nsw-multi-select__label">${triggerLabel[0]}</span>
      <span class="material-icons nsw-material-icons" focusable="false" aria-hidden="true">keyboard_arrow_down</span>
      </button>`
    return button
  }

  getSelectedOptionText() {
    // used to initialize the label of the custom select button
    const noSelectionText = `<span class="multi-select__term">${this.noSelectText}</span>`
    if (this.noUpdateLabel) return [noSelectionText, this.noSelectText]
    let label = ''
    let ariaLabel = ''
    this.selectedOptCounter = 0

    for (let i = 0; i < this.options.length; i += 1) {
      if (this.options[i].selected) {
        if (this.selectedOptCounter !== 0) label += ', '
        label += this.options[i].text
        this.selectedOptCounter += 1
      }
    }

    if (this.selectedOptCounter > this.nMultiSelect) {
      label = `<span class="multi-select__details">${this.multiSelectText.replace('{n}', this.selectedOptCounter)}</span>`
      ariaLabel = `${this.multiSelectText.replace('{n}', this.selectedOptCounter)}, ${this.noSelectText}`
    } else if (this.selectedOptCounter > 0) {
      ariaLabel += `${label}, ${this.noSelectText}`
      label = `<span class="multi-select__details">${label}</span>`
    } else {
      label = noSelectionText
      ariaLabel = this.noSelectText
    }

    if (this.insetLabel && this.selectedOptCounter > 0) label = noSelectionText + label
    return [label, ariaLabel]
  }

  initListSelect() {
    // create custom select dropdown
    let list = `<div class="js-multi-select__dropdown nsw-multi-select__dropdown" aria-describedby=${this.selectId}-description" id="${this.selectId}-dropdown">`
    list += this.getSelectLabelSR()

    if (this.optGroups.length > 0) {
      this.optGroups.forEach((optionGroup) => {
        const optGroupList = optionGroup.querySelectorAll('option')
        const optGroupLabel = `<li><span class="nsw-multi-select__item nsw-multi-select__item--optgroup">${optionGroup.getAttribute('label')}</span></li>`
        list += `<ul class="nsw-multi-select__list" role="listbox" aria-multiselectable="true">
          ${optGroupLabel + this.getOptionsList(optGroupList)}
        </ul>`
      })
    } else {
      list += `<ul class="nsw-multi-select__list" role="listbox" aria-multiselectable="true">${this.getOptionsList(this.options)}</ul>`
    }
    return list
  }

  getSelectLabelSR() {
    if (this.label) {
      return `<p class="sr-only" id="${this.selectId}-description">${this.label.textContent}</p>`
    }
    return ''
  }

  getOptionsList(options) {
    let list = ''

    options.forEach((option) => {
      const selected = option.hasAttribute('selected') ? ' aria-selected="true"' : ' aria-selected="false"'
      const checked = option.hasAttribute('selected') ? 'checked' : ''

      list += `
      <li class="js-multi-select__option nsw-multi-select__option" role="option" data-value="${option.value}" ${selected} data-label="${option.text}" data-index="${this.optionIndex}">
        <input aria-hidden="true" class="nsw-form__checkbox-input js-multi-select__checkbox" type="checkbox" id="${this.selectId}-${option.value}-${this.optionIndex}" name="${this.selectId}-${option.value}-${this.optionIndex}" ${checked}>
        <label class="nsw-form__checkbox-label multi-select__item multi-select__item--option" aria-hidden="true" for="${this.selectId}-${option.value}-${this.optionIndex}">
          <span>${option.text}</span>
        </label>
      </li>`

      this.optionIndex += 1
    })

    return list
  }

  getSelectedOption() {
    // return first selected option
    const option = this.dropdown.querySelector('[aria-selected="true"]')

    if (option) {
      return option.querySelector('.js-multi-select__checkbox')
    }

    return this.dropdown.querySelector('.js-multi-select__option').querySelector('.js-multi-select__checkbox')
  }

  moveFocusToSelectTrigger() {
    if (!document.activeElement.closest('.js-multi-select')) return
    this.trigger.focus()
  }

  checkCustomSelectClick(target) {
    // close select when clicking outside it
    if (!this.element.contains(target)) this.toggleCustomSelect('false')
  }

  updateNativeSelect(index, bool) {
    this.options[index].selected = bool
    this.select.dispatchEvent(new CustomEvent('change', {
      bubbles: true,
    })) // trigger change event
  }

  updateTriggerAria(ariaLabel) {
    // new label for custom trigger
    this.trigger.setAttribute('aria-label', ariaLabel)
  }

  static moveFocus(element) {
    element.focus()
    if (document.activeElement !== element) {
      element.setAttribute('tabindex', '-1')
      element.focus()
    }
  }

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
}

export default Select
