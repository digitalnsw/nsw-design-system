/* eslint-disable max-len */
class ColorSwatches {
  constructor(element, config) {
    if (element.dataset.initialised) {
      return;
    }
    element.dataset.initialised = 'true';
    this.element = element
    this.variables = config.variables
    this.palettes = config.palettes
    this.dataTable = document.querySelector('.js-color-swatches__content')

    this.targetSelector = this.element.dataset.target || ':root'
    this.targetElement = document.querySelector(this.targetSelector)

    const [firstPalette] = Object.keys(this.palettes)
    const [firstColor] = Object.keys(this.palettes[firstPalette]).filter((key) => key !== 'label')
    this.currentPalette = firstPalette
    this.currentColor = firstColor

    this.legend = this.element.querySelector('.js-color-swatches__color') // Title element
    this.swatchList = null // Swatch list container

    this.init()
  }

  // Initialise the color swatches
  init() {
    this.createColorSwatches() // Creates the color swatch list first
    // Create the palette select dropdown (and its label) before reading URL param
    this.paletteSelect = this.createPaletteSelector()
    if (this.paletteLabel) {
      // Insert the label immediately after the swatches
      this.swatchList.insertAdjacentElement('afterend', this.paletteLabel)
      // Insert the select immediately after the label
      this.paletteLabel.insertAdjacentElement('afterend', this.paletteSelect)
    } else {
      // Fallback: insert the select after the swatches
      this.swatchList.insertAdjacentElement('afterend', this.paletteSelect)
    }
    // Now apply any palette from URL
    this.setPaletteFromURL()
    this.addEventListeners()
    this.updateCSSVariables()
    this.updateColorData()
    this.updateLegend()
  }

  // Creates palette selector (dropdown)
  createPaletteSelector() {
    const existingPaletteSelect = this.element.querySelector('.js-palette-selector')
    const legendId = (this.legend && this.legend.id) ? this.legend.id : null

    if (existingPaletteSelect) {
      // Ensure existing select has an accessible name and useful attributes
      if (!existingPaletteSelect.id) {
        existingPaletteSelect.id = `${this.element.id || 'color-swatches'}-palette`
      }
      if (!existingPaletteSelect.getAttribute('name')) {
        existingPaletteSelect.setAttribute('name', 'palette')
      }
      // Prefer an explicit label, but if none is present in the DOM, fall back to aria-labelledby
      const hasAriaName = existingPaletteSelect.hasAttribute('aria-label') || existingPaletteSelect.hasAttribute('aria-labelledby')
      if (!hasAriaName && legendId) {
        existingPaletteSelect.setAttribute('aria-labelledby', legendId)
      }
      return existingPaletteSelect
    }

    // Build a new select + visible label
    const paletteSelect = document.createElement('select')
    paletteSelect.classList.add('js-palette-selector', 'nsw-form__select', 'nsw-color-swatches__palette-selector')
    paletteSelect.id = `${this.element.id || 'color-swatches'}-palette`
    paletteSelect.setAttribute('name', 'palette')

    // Visible label (preferred over aria-label). Allow custom text via data attribute
    const label = document.createElement('label')
    label.classList.add('nsw-form__label', 'sr-only')
    label.setAttribute('for', paletteSelect.id)
    label.textContent = this.element.dataset.paletteLabel || 'Select colour palette'
    this.paletteLabel = label

    Object.keys(this.palettes).forEach((palette) => {
      const option = document.createElement('option')
      option.value = palette
      // Use label from palette data if available
      const paletteMeta = this.palettes[palette]
      option.textContent = paletteMeta.label || this.constructor.formatLabel(palette)
      paletteSelect.appendChild(option)
    })

    return paletteSelect
  }

  // Creates color swatches (clickable circles)
  createColorSwatches() {
    if (!this.swatchList) {
      this.swatchList = document.createElement('ul')
      this.swatchList.classList.add('nsw-color-swatches__list', 'js-color-swatches__list')
      this.swatchList.setAttribute('role', 'radiogroup')
      this.swatchList.setAttribute(
        'aria-labelledby',
        (this.legend && this.legend.id) ? this.legend.id : 'color-swatches-title',
      )
      this.element.appendChild(this.swatchList)
    } else {
      this.swatchList.innerHTML = '' // Clear previous colors
    }

    Object.entries(this.palettes[this.currentPalette]).filter(([colorKey]) => colorKey !== 'label')
      .forEach(([colorKey, colorData], index) => {
        const swatchItem = document.createElement('li')
        swatchItem.classList.add('nsw-color-swatches__item', 'js-color-swatches__item')
        if (index === 0) swatchItem.classList.add('nsw-color-swatches__item--selected') // First one selected
        swatchItem.setAttribute('data-color', colorKey)
        swatchItem.setAttribute('role', 'radio')
        swatchItem.setAttribute('aria-checked', index === 0 ? 'true' : 'false')
        swatchItem.setAttribute('tabindex', index === 0 ? '0' : '-1')

        swatchItem.innerHTML = `
        <span class="nsw-color-swatches__option" tabindex="0">
          <span class="sr-only js-color-swatch__label">${this.constructor.formatLabel(colorKey)}</span>
          <span aria-hidden="true" style="background-color: ${colorData.val};" class="nsw-color-swatches__swatch"></span>
        </span>
      `

        this.swatchList.appendChild(swatchItem)
      })

    return this.swatchList
  }

  // Adds event listeners
  addEventListeners() {
    // Palette selection event
    this.paletteSelect.addEventListener('change', (e) => {
      this.currentPalette = e.target.value
      const [firstColor] = Object.keys(this.palettes[this.currentPalette]).filter((key) => key !== 'label')
      this.currentColor = firstColor // Reset to first color
      this.createColorSwatches()
      this.updateURL()
      this.updateCSSVariables()
      this.updateColorData()
      this.updateLegend()
    })

    // Color swatches event
    this.element.addEventListener('click', (e) => {
      const swatch = e.target.closest('.js-color-swatches__item')
      if (!swatch) return

      this.currentColor = swatch.getAttribute('data-color')
      this.updateSelectedSwatch(swatch)
      this.updateURL()
      this.updateCSSVariables()
      this.updateColorData()
      this.updateLegend()
    })

    // Keyboard interaction
    this.element.addEventListener('keydown', (e) => {
      const swatch = document.activeElement.closest('.js-color-swatches__item')
      if (!swatch) return

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault() // Prevent scrolling when pressing the space key
        this.currentColor = swatch.getAttribute('data-color')
        this.updateSelectedSwatch(swatch)
        this.updateCSSVariables()
        this.updateColorData()
        this.updateLegend()
      }
    })

    this.element.addEventListener('focusin', (e) => {
      const swatch = e.target.closest('.js-color-swatches__item')
      if (!swatch) return

      // Ensure the swatch receives a visual focus style when navigated to
      this.updateSelectedSwatch(swatch)
    })
  }

  // Updates swatch selection
  updateSelectedSwatch(selectedSwatch) {
    this.swatchList.querySelectorAll('.js-color-swatches__item').forEach((swatch) => {
      swatch.classList.remove('nsw-color-swatches__item--selected')
      swatch.setAttribute('aria-checked', 'false')
    })

    selectedSwatch.classList.add('nsw-color-swatches__item--selected')
    selectedSwatch.setAttribute('aria-checked', 'true')
  }

  // Updates CSS variables
  updateCSSVariables() {
    const selectedColors = this.palettes[this.currentPalette][this.currentColor]

    // Apply changes to correct scope (content-only or full-page)
    Object.keys(this.variables).forEach((key) => {
      // unwrap label/value objects if present
      const entry = selectedColors[key]
      const colorValue = entry && typeof entry === 'object' && entry.value
        ? entry.value
        : entry
      this.targetElement.style.setProperty(this.variables[key], colorValue)
    })
  }

  // Updates color data table
  updateColorData() {
    if (!this.dataTable) return

    const selectedColors = this.palettes[this.currentPalette][this.currentColor]

    this.dataTable.innerHTML = Object.keys(this.variables)
      .map((key) => {
        // unwrap label/value objects if present
        const entry = selectedColors[key]
        const colorValue = entry && typeof entry === 'object' && entry.value ? entry.value : entry
        const colorLabel = entry && typeof entry === 'object' && entry.label ? entry.label : ''
        return `
          <tr class="nsw-color-swatches__data">
            <td><div class="nsw-docs__swatch" style="background-color: var(${this.variables[key]})"></div></td>
            <td><p>${this.constructor.formatLabel(key)}</p></td>
            <td><p><code>${colorValue}</code>${colorLabel && `<br><p class='nsw-small nsw-m-top-xs nsw-m-bottom-xxs'>${colorLabel}`}</p></td>
            <td><p><code>${this.variables[key]}</code></p></td>
          </tr>`
      })
      .join('')
  }

  // Updates legend (title)
  updateLegend() {
    if (this.legend) {
      this.legend.textContent = this.constructor.formatLabel(this.currentColor)
      this.legend.setAttribute('aria-live', 'polite')
    }
  }

  // Formats labels
  static formatLabel(text) {
    return text.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
  }

  // Sets palette and color from URL query parameters if provided
  setPaletteFromURL() {
    const params = new URLSearchParams(window.location.search)
    const paletteFromURL = params.get('palette')
    const colorFromURL = params.get('color')

    if (!paletteFromURL || !this.palettes[paletteFromURL]) return

    this.currentPalette = paletteFromURL

    const colors = Object.keys(this.palettes[this.currentPalette]).filter((key) => key !== 'label')
    this.currentColor = (colorFromURL && colors.includes(colorFromURL)) ? colorFromURL : colors[0]

    if (this.paletteSelect) {
      this.paletteSelect.value = this.currentPalette
    }

    this.createColorSwatches()

    const selectedSwatch = this.swatchList.querySelector(`[data-color="${this.currentColor}"]`)
    if (selectedSwatch) this.updateSelectedSwatch(selectedSwatch)

    this.updateCSSVariables()
    this.updateColorData()
    this.updateLegend()
  }

  // Updates the URL query string without reloading
  updateURL() {
    const params = new URLSearchParams(window.location.search)
    params.set('palette', this.currentPalette)
    params.set('color', this.currentColor)

    const newUrl = `${window.location.pathname}?${params.toString()}`
    window.history.replaceState({}, '', newUrl)
  }
}

export default ColorSwatches
