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
    this.optionIndex = 0
    this.textSelected = this.element.getAttribute('data-selection-text')
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
    this.allButton = this.multiSelectList.querySelector('.js-multi-select-all')
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

    this.trigger.addEventListener('keydown', (event) => {
      if (((event.code && event.code === 38) || (event.key && event.key.toLowerCase() === 'arrowup')) || ((event.code && event.code === 40) || (event.key && event.key.toLowerCase() === 'arrowdown'))) {
        event.preventDefault()
        this.toggleCustomSelect(false)
      }
    })

    // keyboard navigation
    this.dropdown.addEventListener('keydown', (event) => {
      if ((event.code && event.code === 38) || (event.key && event.key.toLowerCase() === 'arrowup')) {
        this.keyboardCustomSelect('prev', event)
      } else if ((event.code && event.code === 40) || (event.key && event.key.toLowerCase() === 'arrowdown')) {
        this.keyboardCustomSelect('next', event)
      }
    })

    window.addEventListener('keyup', (event) => {
      if (event.key && event.key.toLowerCase() === 'escape') {
        this.constructor.moveFocusToSelectTrigger(event.target)
        this.toggleCustomSelect('false')
      }
    })
    // close custom select when clicking outside it
    window.addEventListener('click', (event) => {
      this.checkCustomSelectClick(event.target)
    })

    window.addEventListener('resize', this.placeDropdown)

    this.allButton.addEventListener('change', () => {
      this.toggleAllOptions()
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
    const { top, bottom } = this.trigger.getBoundingClientRect()

    // check if there's enough space up or down
    const moveUp = (window.innerHeight - bottom) < top
    // check if we need to set a max height
    const maxHeight = moveUp ? top - 20 : window.innerHeight - bottom - 20
    // set max-height (based on available space) and width

    this.dropdown.setAttribute('style', `max-height: ${(100 * maxHeight) / window.innerHeight}vh;`)
  }

  keyboardCustomSelect(direction, event) {
    // navigate custom dropdown with keyboard
    event.preventDefault()
    const allOptions = [...this.customOptions, this.allButton]
    let index = Array.prototype.indexOf.call(allOptions, document.activeElement.closest('.nsw-multi-select__option'))
    index = (direction === 'next') ? index + 1 : index - 1
    if (index < 0) index = allOptions.length - 1
    if (index >= allOptions.length) index = 0
    this.constructor.moveFocus(allOptions[index].querySelector('.nsw-form__checkbox-input'))
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
  }

  getSelectedOptionCount() {
    let selectedOptCounter = 0

    for (let i = 0; i < this.options.length; i += 1) {
      if (this.options[i].selected) {
        selectedOptCounter += 1
      }
    }

    return selectedOptCounter
  }

  toggleAllOptions() {
    const count = this.getSelectedOptionCount()

    this.customOptions.forEach((check) => {
      const input = check.querySelector('.nsw-form__checkbox-input')

      if (count === this.options.length) {
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
      //
    })
    const [label, ariaLabel] = this.getSelectedOptionText()
    this.trigger.querySelector('.nsw-multi-select__label').innerHTML = label // update trigger label
    this.constructor.toggleClass(this.trigger, 'active', count > 0)
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
      input.value = true
      input.setAttribute('checked', '')
      option.setAttribute('aria-selected', 'true')
      // update native select element
      this.updateNativeSelect(option.getAttribute('data-index'), true)
    }

    const [label, ariaLabel] = this.getSelectedOptionText()
    const count = this.getSelectedOptionCount()
    if (count === this.options.length) {
      this.allButtonInput.checked = true
      this.allButtonInput.setAttribute('checked', '')
      this.allButton.setAttribute('aria-selected', 'true')
    } else {
      this.allButtonInput.checked = false
      this.allButtonInput.removeAttribute('checked')
      this.allButton.setAttribute('aria-selected', 'false')
    }
    this.trigger.querySelector('.nsw-multi-select__label').innerHTML = label // update trigger label
    this.constructor.toggleClass(this.trigger, 'active', count > 0)
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
    const all = this.getSelectedOptionCount() === this.options.length
    const selected = all ? ' aria-selected="true"' : ' aria-selected="false"'
    const checked = all ? 'checked' : ''

    const allButton = `
      <li class="js-multi-select-all nsw-multi-select__option" role="option" data-value="Select all" aria-selected="false" ${selected} data-label="Select all">
        <input aria-hidden="true" class="nsw-form__checkbox-input" type="checkbox" id="${this.selectId}-all" ${checked}>
        <label class="nsw-form__checkbox-label" aria-hidden="true" for="${this.selectId}-all">
          <span>Select all</span>
        </label>
      </li>`

    return allButton
  }

  getSelectedOptionText() {
    // used to initialize the label of the custom select button
    const noSelectionText = '<span class="multi-select__term">Please select</span>'
    let label = ''
    let ariaLabel = ''
    const count = this.getSelectedOptionCount()

    if (count === this.options.length) {
      label = `All ${this.textSelected}`
      ariaLabel = `All ${this.textSelected}`
    } else if (count > 1) {
      label = `${count} ${this.textSelected} selected`
      ariaLabel = `${count} ${this.textSelected} selected, Please select`
    } else if (count > 0) {
      ariaLabel += `${this.options[0].text}, Please select`
      label = this.options[0].text
    } else {
      label = noSelectionText
      ariaLabel = 'Please select'
    }

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
      const uniqueName = this.constructor.createSafeCssClassname(`${this.selectId}-${option.value}-${this.optionIndex.toString()}`)

      list += `
      <li class="nsw-multi-select__option" role="option" data-value="${option.value}" ${selected} data-label="${option.text}" data-index="${this.optionIndex}">
        <input aria-hidden="true" class="nsw-form__checkbox-input" type="checkbox" id="${uniqueName}" ${checked}>
        <label class="nsw-form__checkbox-label" aria-hidden="true" for="${uniqueName}">
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

  checkCustomSelectClick(target) {
    if (!this.element.contains(target)) this.toggleCustomSelect('false')
  }

  updateNativeSelect(index, bool) {
    this.options[index].selected = bool
    this.select.dispatchEvent(new CustomEvent('update', { bubbles: true })) // trigger change event
  }

  updateTriggerAria(ariaLabel) {
    // new label for custom trigger
    this.trigger.setAttribute('aria-label', ariaLabel)
  }

  static createSafeCssClassname(str) {
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

  static moveFocusToSelectTrigger(target) {
    const multiSelect = target.closest('.js-multi-select')
    if (!multiSelect) return
    multiSelect.querySelector('.nsw-multi-select__button').focus()
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
