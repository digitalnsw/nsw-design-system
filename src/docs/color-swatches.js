class ColorSwatches {
  constructor(element, opts) {
    this.element = element
    this.options = opts
    this.target = document.querySelectorAll(this.element.getAttribute('data-target') || 'body')
    this.selectedClass = 'nsw-color-swatches__item--selected'
    this.select = false
    this.list = false
    this.swatches = false
    this.labels = false
    this.selectedLabel = false
    this.focusOutId = false
    const [color] = Object.keys(this.options)
    this.color = color
    this.dataTable = document.querySelector('.js-color-swatches__content')
    this.customAttrArray = false
  }

  init() {
    this.target.forEach((element) => {
      element.classList.add(this.color)
    })
    this.initOptions()
    this.initCustomSelect()
    this.createColorData()
    this.initEvents()
  }

  createColorData() {
    if (this.dataTable) {
      const data = this.options[this.color].content
      let customContent = ''

      Object.keys(data).forEach((element) => {
        customContent = `${customContent}
        <tr class="nsw-color-swatches__data"><td><div class="nsw-docs__swatch" style="background-color: var(${data[element].var})"></div></td>
        <td><p>${element}</p></td>               
        <td><p>${data[element].hex}</p></td>
        <td><p><code>${data[element].var}</code></p></td></tr>`
      })

      this.dataTable.innerHTML = customContent
    }
  }

  initOptions() {
    const select = this.element.querySelector('.js-color-swatches__select')
    if (!select) return
    this.select = select

    let customContent = ''

    Object.keys(this.options).forEach((element) => {
      customContent = `${customContent}<option value="${this.options[element].val}" data-color="${element}" data-style="background-color: ${this.options[element].hex};">${this.options[element].val}</option>`
    })

    this.select.innerHTML = customContent
  }

  initCustomSelect() {
    if (this.select === false) return

    let customContent = ''

    for (let i = 0; i < this.select.options.length; i += 1) {
      const ariaChecked = i === this.select.selectedIndex ? 'true' : 'false'
      const customClass = i === this.select.selectedIndex ? ` ${this.selectedClass}` : ''
      const customAttributes = this.getSwatchCustomAttr(this.select.options[i])
      customContent = `${customContent}<li class="nsw-color-swatches__item js-color-swatches__item${customClass}" role="radio" aria-checked="${ariaChecked}" data-color="${this.select.options[i].getAttribute('data-color')}" data-value="${this.select.options[i].value}"><span class="js-color-swatches__option" tabindex="0"${customAttributes}><span class="sr-only js-color-swatch__label">${this.select.options[i].text}</span><span aria-hidden="true" style="${this.select.options[i].getAttribute('data-style')}" class="nsw-color-swatches__swatch"></span></span></li>`
    }

    const list = document.createElement('ul')
    list.setAttribute('class', 'nsw-color-swatches__list js-color-swatches__list')
    list.setAttribute('role', 'radiogroup')

    list.innerHTML = customContent
    this.element.insertBefore(list, this.select)
    this.select.classList.add('nsw-hide-xs')

    this.list = this.element.querySelector('.js-color-swatches__list')
    this.swatches = this.list.getElementsByClassName('js-color-swatches__option')
    this.labels = this.list.getElementsByClassName('js-color-swatch__label')
    this.selectedLabel = this.element.getElementsByClassName('js-color-swatches__color')
  }

  initEvents() {
    // detect focusin/focusout event - update selected color label
    if (this.list) {
      this.list.addEventListener('focusin', () => {
        if (this.focusOutId) clearTimeout(this.focusOutId)
        this.updateSelectedLabel(document.activeElement)
      })
      this.list.addEventListener('focusout', () => {
        this.focusOutId = setTimeout(() => {
          this.resetSelectedLabel()
        }, 200)
      })
    }

    // mouse move events
    for (let i = 0; i < this.swatches.length; i += 1) {
      this.handleHoverEvents(i)
    }

    // --select variation only
    if (this.select) {
      // click event - select new option
      this.list.addEventListener('click', (event) => {
        // update selected option
        this.resetSelectedOption(event.target)
      })

      // space key - select new option
      this.list.addEventListener('keydown', (event) => {
        if (((event.keyCode && event.keyCode === 32) || (event.key && event.key === ' ')) || ((event.keyCode && event.keyCode === 13) || (event.key && event.key.toLowerCase() === 'enter'))) {
          // update selected option
          this.resetSelectedOption(event.target)
        }
      })
    }
  }

  handleHoverEvents(index) {
    this.swatches[index].addEventListener('mouseenter', () => {
      this.updateSelectedLabel(this.swatches[index])
    })
    this.swatches[index].addEventListener('mouseleave', () => {
      this.resetSelectedLabel()
    })
  }

  resetSelectedOption(target) {
    if (this.color) {
      this.target.forEach((element) => {
        element.classList.remove(this.color)
      })
    }

    const option = target.closest('.js-color-swatches__item')
    this.color = option.getAttribute('data-color')

    if (!option) return

    const selectedSwatch = this.list.querySelector(`.${this.selectedClass}`)

    if (selectedSwatch) {
      selectedSwatch.classList.remove(this.selectedClass)
      selectedSwatch.setAttribute('aria-checked', 'false')
    }

    option.classList.add(this.selectedClass)
    option.setAttribute('aria-checked', 'true')
    this.target.forEach((element) => {
      element.classList.add(this.color)
    })
    // update select element
    this.updateNativeSelect(option.getAttribute('data-value'))
    this.createColorData()
  }

  resetSelectedLabel() {
    const selectedSwatch = this.list.getElementsByClassName(this.selectedClass)
    if (selectedSwatch.length > 0) this.updateSelectedLabel(selectedSwatch[0])
  }

  updateSelectedLabel(swatch) {
    const newLabel = swatch.getElementsByClassName('js-color-swatch__label')
    if (newLabel.length === 0) return
    this.selectedLabel[0].textContent = newLabel[0].textContent
  }

  updateNativeSelect(value) {
    for (let i = 0; i < this.select.options.length; i += 1) {
      if (this.select.options[i].value === value) {
        this.select.selectedIndex = i // set new value
        this.select.dispatchEvent(new CustomEvent('change')) // trigger change event
        break
      }
    }
  }

  getSwatchCustomAttr(swatch) {
    this.customAttrArray = swatch.getAttribute('data-custom-attr')
    if (!this.customAttrArray) return ''
    let customAttr = ' '
    const list = this.customAttrArray.split(',')
    for (let i = 0; i < list.length; i += 1) {
      const attr = list[i].split(':')
      customAttr = `${customAttr + attr[0].trim()}="${attr[1].trim()}" `
    }
    return customAttr
  }
}

export default ColorSwatches
