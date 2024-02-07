/* eslint-disable no-param-reassign */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-mixed-operators */
const options = {
  blue: {
    val: 'Blue 01',
    hex: '#002664',
    content: {
      'Brand Dark': {
        hex: 'Blue 01 <code>#002664</code>',
        var: '--nsw-brand-dark',
      },
      'Brand Light': {
        hex: 'Blue 04 <code>#CBEDFD</code>',
        var: '--nsw-brand-light',
      },
      'Brand Supplementary': {
        hex: 'Blue 02 <code>#146CFD</code>',
        var: '--nsw-brand-supplementary',
      },
      'Brand Accent': {
        hex: 'Red 02 <code>#D7153A</code>',
        var: '--nsw-brand-accent',
      },
      'Link colour': {
        hex: '<code>#002664</code>',
        var: '--nsw-link',
      },
      'Visited link colour': {
        hex: '<code>#551A8B</code>',
        var: '--nsw-visited',
      },
      'Hover background colour': {
        hex: '<code>rgba(0, 38, 100, 0.1)</code>',
        var: '--nsw-hover',
      },
      'Active background colour': {
        hex: '<code>rgba(0, 38, 100, 0.2)</code>',
        var: '--nsw-active',
      },
      'Focus outline colour': {
        hex: '<code>#0086B3</code>',
        var: '--nsw-focus',
      },
    },
  },
  purple: {
    val: 'Purple 01',
    hex: '#441170',
    content: {
      'Brand Dark': {
        hex: 'Purple 01 <code>#441170</code>',
        var: '--nsw-brand-dark',
      },
      'Brand Light': {
        hex: 'Purple 04 <code>#E6E1FD</code>',
        var: '--nsw-brand-light',
      },
      'Brand Supplementary': {
        hex: 'Purple 02 <code>#8055F1</code>',
        var: '--nsw-brand-supplementary',
      },
      'Brand Accent': {
        hex: 'Yellow 02 <code>#FAAF05</code>',
        var: '--nsw-brand-accent',
      },
      'Link colour': {
        hex: '<code>#441170</code>',
        var: '--nsw-link',
      },
      'Visited link colour': {
        hex: '<code>#8A3866</code>',
        var: '--nsw-visited',
      },
      'Hover background colour': {
        hex: '<code>rgba(68, 17, 112, 0.1)</code>',
        var: '--nsw-hover',
      },
      'Active background colour': {
        hex: '<code>rgba(68, 17, 112, 0.2)</code>',
        var: '--nsw-active',
      },
      'Focus outline colour': {
        hex: '<code>#351BB5</code>',
        var: '--nsw-focus',
      },
    },
  },
  fuchsia: {
    val: 'Fuchsia 01',
    hex: '#65004D',
    content: {
      'Brand Dark': {
        hex: 'Fuchsia 01 <code>#65004D</code>',
        var: '--nsw-brand-dark',
      },
      'Brand Light': {
        hex: 'Fuchsia 04 <code>#F0E6ED</code>',
        var: '--nsw-brand-light',
      },
      'Brand Supplementary': {
        hex: 'Fuchsia 02 <code>#D912AE</code>',
        var: '--nsw-brand-supplementary',
      },
      'Brand Accent': {
        hex: 'Orange 02 <code>#F3631B</code>',
        var: '--nsw-brand-accent',
      },
      'Link colour': {
        hex: '<code>#65004D</code>',
        var: '--nsw-link',
      },
      'Visited link colour': {
        hex: '<code>#8C2A1A</code>',
        var: '--nsw-visited',
      },
      'Hover background colour': {
        hex: '<code>rgba(101, 0, 77, 0.1)</code>',
        var: '--nsw-hover',
      },
      'Active background colour': {
        hex: '<code>rgba(101, 0, 77, 0.2)</code>',
        var: '--nsw-active',
      },
      'Focus outline colour': {
        hex: '<code>#9D00B4</code>',
        var: '--nsw-focus',
      },
    },
  },
  red: {
    val: 'Red 01',
    hex: '#630019',
    content: {
      'Brand Dark': {
        hex: 'Red 01 <code>#630019</code>',
        var: '--nsw-brand-dark',
      },
      'Brand Light': {
        hex: 'Red 04 <code>#FFE6EA</code>',
        var: '--nsw-brand-light',
      },
      'Brand Supplementary': {
        hex: 'Red 02 <code>#D7153A</code>',
        var: '--nsw-brand-supplementary',
      },
      'Brand Accent': {
        hex: 'Brown 02 <code>#B68D5D</code>',
        var: '--nsw-brand-accent',
      },
      'Link colour': {
        hex: '<code>#630019</code>',
        var: '--nsw-link',
      },
      'Visited link colour': {
        hex: '<code>#70531D</code>',
        var: '--nsw-visited',
      },
      'Hover background colour': {
        hex: '<code>rgba(99, 0, 25, 0.1)</code>',
        var: '--nsw-hover',
      },
      'Active background colour': {
        hex: '<code>rgba(99, 0, 25, 0.2)</code>',
        var: '--nsw-active',
      },
      'Focus outline colour': {
        hex: '<code>#B2006E</code>',
        var: '--nsw-focus',
      },
    },
  },
  orange: {
    val: 'Orange 01',
    hex: '#941B00',
    content: {
      'Brand Dark': {
        hex: 'Orange 01 <code>#941B00</code>',
        var: '--nsw-brand-dark',
      },
      'Brand Light': {
        hex: 'Orange 04 <code>#FDEDDF</code>',
        var: '--nsw-brand-light',
      },
      'Brand Supplementary': {
        hex: 'Orange 02 <code>#F3631B</code>',
        var: '--nsw-brand-supplementary',
      },
      'Brand Accent': {
        hex: 'Purple 02 <code>#8055F1</code>',
        var: '--nsw-brand-accent',
      },
      'Link colour': {
        hex: '<code>#941B00</code>',
        var: '--nsw-link',
      },
      'Visited link colour': {
        hex: '<code>#575B26</code>',
        var: '--nsw-visited',
      },
      'Hover background colour': {
        hex: '<code>rgba(148, 27, 0, 0.1)</code>',
        var: '--nsw-hover',
      },
      'Active background colour': {
        hex: '<code>rgba(148, 27, 0, 0.2)</code>',
        var: '--nsw-active',
      },
      'Focus outline colour': {
        hex: '<code>#E3002A</code>',
        var: '--nsw-focus',
      },
    },
  },
  brown: {
    val: 'Brown 01',
    hex: '#523719',
    content: {
      'Brand Dark': {
        hex: 'Brown 01 <code>#523719</code>',
        var: '--nsw-brand-dark',
      },
      'Brand Light': {
        hex: 'Brown 04 <code>#EDE3D7</code>',
        var: '--nsw-brand-light',
      },
      'Brand Supplementary': {
        hex: 'Brown 02 <code>#B68D5D</code>',
        var: '--nsw-brand-supplementary',
      },
      'Brand Accent': {
        hex: 'Teal 02 <code>#2E808E</code>',
        var: '--nsw-brand-accent',
      },
      'Link colour': {
        hex: '<code>#523719</code>',
        var: '--nsw-link',
      },
      'Visited link colour': {
        hex: '<code>#4F5C3E</code>',
        var: '--nsw-visited',
      },
      'Hover background colour': {
        hex: '<code>rgba(82, 55, 25, 0.1)</code>',
        var: '--nsw-hover',
      },
      'Active background colour': {
        hex: '<code>rgba(82, 55, 25, 0.2)</code>',
        var: '--nsw-active',
      },
      'Focus outline colour': {
        hex: '<code>#8F3B2B</code>',
        var: '--nsw-focus',
      },
    },
  },
  yellow: {
    val: 'Yellow 01',
    hex: '#694800',
    content: {
      'Brand Dark': {
        hex: 'Yellow 01 <code>#694800</code>',
        var: '--nsw-brand-dark',
      },
      'Brand Light': {
        hex: 'Yellow 04 <code>#FFF4CF</code>',
        var: '--nsw-brand-light',
      },
      'Brand Supplementary': {
        hex: 'Yellow 02 <code>#FAAF05</code>',
        var: '--nsw-brand-supplementary',
      },
      'Brand Accent': {
        hex: 'Green 02 <code>#00AA45</code>',
        var: '--nsw-brand-accent',
      },
      'Link colour': {
        hex: '<code>#694800</code>',
        var: '--nsw-link',
      },
      'Visited link colour': {
        hex: '<code>#3A611F</code>',
        var: '--nsw-visited',
      },
      'Hover background colour': {
        hex: '<code>rgba(105, 72, 0, 0.1)</code>',
        var: '--nsw-hover',
      },
      'Active background colour': {
        hex: '<code>rgba(105, 72, 0, 0.2)</code>',
        var: '--nsw-active',
      },
      'Focus outline colour': {
        hex: '<code>#B83B00</code>',
        var: '--nsw-focus',
      },
    },
  },
  green: {
    val: 'Green 01',
    hex: '#004000',
    content: {
      'Brand Dark': {
        hex: 'Green 01 <code>#004000</code>',
        var: '--nsw-brand-dark',
      },
      'Brand Light': {
        hex: 'Green 04 <code>#DBFADF</code>',
        var: '--nsw-brand-light',
      },
      'Brand Supplementary': {
        hex: 'Green 02 <code>#00AA45</code>',
        var: '--nsw-brand-supplementary',
      },
      'Brand Accent': {
        hex: 'Blue 02 <code>#146CFD</code>',
        var: '--nsw-brand-accent',
      },
      'Link colour': {
        hex: '<code>#004000</code>',
        var: '--nsw-link',
      },
      'Visited link colour': {
        hex: '<code>#16635B</code>',
        var: '--nsw-visited',
      },
      'Hover background colour': {
        hex: '<code>rgba(0, 64, 0, 0.1)</code>',
        var: '--nsw-hover',
      },
      'Active background colour': {
        hex: '<code>rgba(0, 64, 0, 0.2)</code>',
        var: '--nsw-active',
      },
      'Focus outline colour': {
        hex: '<code>#348F00</code>',
        var: '--nsw-focus',
      },
    },
  },
  teal: {
    val: 'Teal 01',
    hex: '#0B3F47',
    content: {
      'Brand Dark': {
        hex: 'Teal 01 <code>#0B3F47</code>',
        var: '--nsw-brand-dark',
      },
      'Brand Light': {
        hex: 'Teal 04 <code>#D1EEEA</code>',
        var: '--nsw-brand-light',
      },
      'Brand Supplementary': {
        hex: 'Teal 02 <code>#2E808E</code>',
        var: '--nsw-brand-supplementary',
      },
      'Brand Accent': {
        hex: 'Fuchsia 02 <code>#D912AE</code>',
        var: '--nsw-brand-accent',
      },
      'Link colour': {
        hex: '<code>#0B3F47</code>',
        var: '--nsw-link',
      },
      'Visited link colour': {
        hex: '<code>#2D2B68</code>',
        var: '--nsw-visited',
      },
      'Hover background colour': {
        hex: '<code>rgba(11, 63, 71, 0.1)</code>',
        var: '--nsw-hover',
      },
      'Active background colour': {
        hex: '<code>rgba(11, 63, 71, 0.2)</code>',
        var: '--nsw-active',
      },
      'Focus outline colour': {
        hex: '<code>#168B70</code>',
        var: '--nsw-focus',
      },
    },
  },
}

class ColorSwatches {
  constructor(element) {
    this.element = element
    this.options = options
    this.selectedClass = 'nsw-color-swatches__item--selected'
    this.select = false
    this.list = false
    this.swatches = false
    this.labels = false
    this.selectedLabel = false
    this.focusOutId = false
    this.color = 'blue'
    this.dataTable = document.querySelector('.js-color-swatches__content')
  }

  init() {
    this.initOptions()
    this.initCustomSelect()
    this.createColorData()
    this.initEvents()
  }

  createColorData() {
    if (this.dataTable) {
      const data = options[this.color].content
      let customContent = ''

      Object.keys(data).forEach((element) => {
        console.log(data[element].var)
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

    Object.keys(options).forEach((element) => {
      customContent = `${customContent}<option value="${options[element].val}" data-color="${element}" data-style="background-color: ${options[element].hex};">${options[element].val}</option>`
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
        if ((event.keyCode && event.keyCode === 32 || event.key && event.key === ' ') || (event.keyCode && event.keyCode === 13 || event.key && event.key.toLowerCase() === 'enter')) {
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
      document.body.classList.remove(this.color)
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
    document.body.classList.add(this.color)
    // update select element
    this.updateNativeSelect(this.select, option.getAttribute('data-value'))
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

  updateNativeSelect(select, value) {
    for (let i = 0; i < select.options.length; i += 1) {
      if (select.options[i].value === value) {
        select.selectedIndex = i // set new value
        select.dispatchEvent(new CustomEvent('change')) // trigger change event
        break
      }
    }
  }

  getSwatchCustomAttr(swatch) {
    const customAttrArray = swatch.getAttribute('data-custom-attr')
    if (!customAttrArray) return ''
    let customAttr = ' '
    const list = customAttrArray.split(',')
    for (let i = 0; i < list.length; i += 1) {
      const attr = list[i].split(':')
      customAttr = `${customAttr + attr[0].trim()}="${attr[1].trim()}" `
    }
    return customAttr
  }
}

export default ColorSwatches
