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
    this.selectedOptCounter = 0
    this.optionIndex = 0
    // label options
    this.noSelectText = this.element.getAttribute('data-no-select-text') || 'Select'
    this.allText = this.element.getAttribute('data-all-text')
    this.allTextSelected = this.element.getAttribute('data-all-text-selected')
    this.multiSelectText = this.element.getAttribute('data-multi-select-text') || '{n} items selected'
    this.nMultiSelect = this.element.getAttribute('data-n-multi-select') || 1
    this.noUpdateLabel = this.element.getAttribute('data-update-text') && this.element.getAttribute('data-update-text') === 'off'
    this.insetLabel = this.element.getAttribute('data-inset-label') && this.element.getAttribute('data-inset-label') === 'on'
  }

  init() {
    this.initCustomSelect()
    this.initCustomSelectEvents()
  }

  initCustomSelect() {
    // create the HTML for the custom dropdown element
    this.element.insertAdjacentHTML('beforeend', this.initButtonSelect() + this.initListSelect())

    // save custom elements
    this.dropdown = this.element.querySelector('.nsw-multi-select__dropdown')
    this.trigger = this.element.querySelector('.nsw-multi-select__button')
    this.multiSelectList = this.dropdown.querySelector('.nsw-multi-select__list')
    this.customOptions = this.multiSelectList.querySelectorAll('.nsw-multi-select__option')

    // create the HTML for the all button element
    this.multiSelectList.insertAdjacentHTML('afterbegin', this.initAllButton())

    // save custom elements
    this.allButton = this.multiSelectList.querySelector('.js-multi-select__all')
    this.allButtonInput = this.allButton.querySelector('.nsw-form__checkbox-input')
  }

  initCustomSelectEvents() {
    // option selection in dropdown
    this.initSelection()

    // click events
    this.trigger.addEventListener('click', (event) => {
      event.preventDefault()
      this.toggleCustomSelect(false)
    })

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

      this.constructor.trapFocus(this.dropdown)

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
    let index = Array.prototype.indexOf.call(this.customOptions, document.activeElement.closest('.nsw-multi-select__option'))
    index = (direction === 'next') ? index + 1 : index - 1
    if (index < 0) index = this.customOptions.length - 1
    if (index >= this.customOptions.length) index = 0
    this.constructor.moveFocus(this.customOptions[index].querySelector('.nsw-form__checkbox-input'))
  }

  initSelection() {
    // option selection
    if (!this.dropdown) return

    this.customOptions.forEach((opt) => {
      opt.addEventListener('change', (event) => {
        const option = event.currentTarget.closest('.nsw-multi-select__option')
        if (!option) return
        this.selectOption(option)
      })

      opt.addEventListener('click', (event) => {
        const option = event.currentTarget.closest('.nsw-multi-select__option')
        if (!option || !event.target.classList.contains('nsw-multi-select__option')) return
        this.selectOption(option)
      })
    })

    if (this.allText) {
      this.allButton.addEventListener('change', (event) => {
        event.preventDefault()
        this.toggleAllOptions()
      })
    }
  }

  toggleAllOptions() {
    const totalOptions = this.options.length
    const allCompleted = Array.from(this.customOptions).filter((option) => option.ariaSelected === 'true').length === totalOptions

    this.customOptions.forEach((check) => {
      const input = check.querySelector('.nsw-form__checkbox-input')
      if (allCompleted) {
        // deselecting that option
        input.checked = false
        input.removeAttribute('checked')
        check.setAttribute('aria-selected', 'false')
        // update native select element
        this.updateNativeSelect(check.getAttribute('data-index'), false)
      } else {
        input.checked = true
        input.setAttribute('checked', '')
        check.setAttribute('aria-selected', 'true')
        // update native select element
        this.updateNativeSelect(check.getAttribute('data-index'), true)
      }
    })
    const [label, ariaLabel] = this.getSelectedOptionText()
    this.trigger.querySelector('.nsw-multi-select__label').innerHTML = label // update trigger label
    this.constructor.toggleClass(this.trigger, 'active', this.selectedOptCounter > 0)
    this.updateTriggerAria(ariaLabel) // update trigger aria-label
  }

  selectOption(option) {
    const input = option.querySelector('.nsw-form__checkbox-input')
    if (option.hasAttribute('aria-selected') && option.getAttribute('aria-selected') === 'true') {
      // deselecting that option
      input.checked = false
      input.removeAttribute('checked')
      option.setAttribute('aria-selected', 'false')
      // update native select element
      this.updateNativeSelect(option.getAttribute('data-index'), false)
    } else {
      input.checked = true
      input.setAttribute('checked', '')
      option.setAttribute('aria-selected', 'true')
      // update native select element
      this.updateNativeSelect(option.getAttribute('data-index'), true)
    }
    const [label, ariaLabel] = this.getSelectedOptionText()
    this.trigger.querySelector('.nsw-multi-select__label').innerHTML = label // update trigger label
    this.constructor.toggleClass(this.trigger, 'active', this.selectedOptCounter > 0)
    this.updateTriggerAria(ariaLabel) // update trigger aria-label
  }

  initButtonSelect() {
    // create the button element -> custom select trigger
    const triggerLabel = this.getSelectedOptionText(this.element)

    const button = `<button class="nsw-button nsw-multi-select__button" aria-label="${triggerLabel[1]}" aria-expanded="false" aria-controls="${this.selectId}-dropdown">
      <span aria-hidden="true" class="nsw-multi-select__label">${triggerLabel[0]}</span>
      <span class="material-icons nsw-material-icons" focusable="false" aria-hidden="true">keyboard_arrow_down</span>
      </button>`
    return button
  }

  initAllButton() {
    const allButton = `
      <li class="js-multi-select__all nsw-multi-select__option" role="option" data-value="${this.allText}" aria-selected="false" data-label="${this.allText}" data-all-text="${this.allTextSelected}">
        <input aria-hidden="true" class="nsw-form__checkbox-input" type="checkbox" id="${this.selectId}-${this.allText}" name="${this.selectId}-${this.allText}">
        <label class="nsw-form__checkbox-label multi-select__item multi-select__item--option" aria-hidden="true" for="${this.selectId}-${this.allText}">
          <span>${this.allText}</span>
        </label>
      </li>`

    return allButton
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
    let list = `<div class="nsw-multi-select__dropdown" aria-describedby=${this.selectId}-description" id="${this.selectId}-dropdown">`

    if (this.optGroups.length > 0) {
      this.optGroups.forEach((optionGroup) => {
        const optGroupList = optionGroup.querySelectorAll('option')
        const optGroupLabel = `<li><span>${optionGroup.getAttribute('label')}</span></li>`
        list += `<ul class="nsw-multi-select__list" role="listbox" aria-multiselectable="true">
          ${optGroupLabel + this.getOptionsList(optGroupList)}
        </ul>`
      })
    } else {
      list += `<ul class="nsw-multi-select__list" role="listbox" aria-multiselectable="true">${this.getOptionsList(this.options)}</ul>`
    }
    return list
  }

  getOptionsList(options) {
    let list = ''

    options.forEach((option) => {
      const selected = option.hasAttribute('selected') ? ' aria-selected="true"' : ' aria-selected="false"'
      const checked = option.hasAttribute('selected') ? 'checked' : ''

      list += `
      <li class="nsw-multi-select__option" role="option" data-value="${option.value}" ${selected} data-label="${option.text}" data-index="${this.optionIndex}">
        <input aria-hidden="true" class="nsw-form__checkbox-input" type="checkbox" id="${this.selectId}-${option.value}-${this.optionIndex}" name="${this.selectId}-${option.value}-${this.optionIndex}" ${checked}>
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
      return option.querySelector('.nsw-form__checkbox-input')
    }

    return this.dropdown.querySelector('.nsw-multi-select__option').querySelector('.nsw-form__checkbox-input')
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

  static trapFocus(element) {
    /* eslint-disable max-len */
    const focusableEls = element.querySelectorAll('a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled])')
    const firstFocusableEl = focusableEls[0]
    const lastFocusableEl = focusableEls[focusableEls.length - 1]
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

  static moveFocus(element) {
    if (document.activeElement !== element) {
      element.focus()
    }
  }

  static toggleClass(el, className, bool) {
    if (bool) el.classList.add(className)
    else el.classList.remove(className)
  }
}

export default Select
