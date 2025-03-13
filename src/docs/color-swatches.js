class ColorSwatches {
  constructor(element, config) {
    this.element = element;
    this.variables = config.variables;
    this.palettes = config.palettes;
    this.dataTable = document.querySelector('.js-color-swatches__content');

    // Determine target scope (full-page vs content-only)
    this.targetSelector = this.element.dataset.target || ':root';
    this.targetElement = document.querySelector(this.targetSelector);

    this.currentPalette = Object.keys(this.palettes)[0]; // Default: first palette
    this.currentColor = Object.keys(this.palettes[this.currentPalette])[0]; // Default: first color

    this.legend = this.element.querySelector('.js-color-swatches__color'); // Title element
    this.swatchList = null; // Swatch list container

    this.init();
  }

  // Initialise the color swatches
  init() {
    this.createColorSwatches(); // Creates the color swatch list first
    this.paletteSelect = this.createPaletteSelector(); // Creates the palette select dropdown

    // Move the select after the swatches
    this.swatchList.insertAdjacentElement('afterend', this.paletteSelect);

    this.addEventListeners();
    this.updateCSSVariables();
    this.updateColorData();
    this.updateLegend();
  }

  // Creates palette selector (dropdown)
  createPaletteSelector() {
    let existingPaletteSelect = this.element.querySelector('.js-palette-selector');
    if (existingPaletteSelect) return existingPaletteSelect;

    const paletteSelect = document.createElement('select');
    paletteSelect.classList.add('js-palette-selector', 'nsw-form__select', 'nsw-color-swatches__palette-selector');

    Object.keys(this.palettes).forEach((palette) => {
      const option = document.createElement('option');
      option.value = palette;
      option.textContent = this.formatLabel(palette);
      paletteSelect.appendChild(option);
    });

    return paletteSelect;
  }

  // Creates color swatches (clickable circles)
  createColorSwatches() {
    if (!this.swatchList) {
      this.swatchList = document.createElement('ul');
      this.swatchList.classList.add('nsw-color-swatches__list', 'js-color-swatches__list');
      this.swatchList.setAttribute('role', 'radiogroup');
      this.swatchList.setAttribute('aria-labelledby', this.legend?.id || 'color-swatches-title');
      this.element.appendChild(this.swatchList);
    } else {
      this.swatchList.innerHTML = ''; // Clear previous colors
    }

    Object.entries(this.palettes[this.currentPalette]).forEach(([colorKey, colorData], index) => {
      const swatchItem = document.createElement('li');
      swatchItem.classList.add('nsw-color-swatches__item', 'js-color-swatches__item');
      if (index === 0) swatchItem.classList.add('nsw-color-swatches__item--selected'); // First one selected
      swatchItem.setAttribute('data-color', colorKey);
      swatchItem.setAttribute('role', 'radio');
      swatchItem.setAttribute('aria-checked', index === 0 ? 'true' : 'false');
      swatchItem.setAttribute('tabindex', index === 0 ? '0' : '-1');

      swatchItem.innerHTML = `
        <span class="nsw-color-swatches__option" tabindex="0">
          <span class="sr-only js-color-swatch__label">${this.formatLabel(colorKey)}</span>
          <span aria-hidden="true" style="background-color: ${colorData.val};" class="nsw-color-swatches__swatch"></span>
        </span>
      `;

      this.swatchList.appendChild(swatchItem);
    });

    return this.swatchList;
  }

  // Adds event listeners
  addEventListeners() {
    // Palette selection event
    this.paletteSelect.addEventListener('change', (e) => {
      this.currentPalette = e.target.value;
      this.currentColor = Object.keys(this.palettes[this.currentPalette])[0]; // Reset to first color
      this.createColorSwatches();
      this.updateCSSVariables();
      this.updateColorData();
      this.updateLegend();
    });

    // Color swatches event
    this.element.addEventListener('click', (e) => {
      const swatch = e.target.closest('.js-color-swatches__item');
      if (!swatch) return;

      this.currentColor = swatch.getAttribute('data-color');
      this.updateSelectedSwatch(swatch);
      this.updateCSSVariables();
      this.updateColorData();
      this.updateLegend();
    });

    // Keyboard interaction
    this.element.addEventListener('keydown', (e) => {
      const swatch = document.activeElement.closest('.js-color-swatches__item');
      if (!swatch) return;
  
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault(); // Prevent scrolling when pressing the space key
        this.currentColor = swatch.getAttribute('data-color');
        this.updateSelectedSwatch(swatch);
        this.updateCSSVariables();
        this.updateColorData();
        this.updateLegend();
      }
    });

    this.element.addEventListener('focusin', (e) => {
      const swatch = e.target.closest('.js-color-swatches__item');
      if (!swatch) return;
      
      // Ensure the swatch receives a visual focus style when navigated to
      this.updateSelectedSwatch(swatch);
    });
  }

  // Updates swatch selection
  updateSelectedSwatch(selectedSwatch) {
    this.swatchList.querySelectorAll('.js-color-swatches__item').forEach((swatch) => {
      swatch.classList.remove('nsw-color-swatches__item--selected');
      swatch.setAttribute('aria-checked', 'false');
    });

    selectedSwatch.classList.add('nsw-color-swatches__item--selected');
    selectedSwatch.setAttribute('aria-checked', 'true');
  }

  // Updates CSS variables
  updateCSSVariables() {
    const selectedColors = this.palettes[this.currentPalette][this.currentColor];

    // Apply changes to correct scope (content-only or full-page)
    Object.keys(this.variables).forEach((key) => {
      this.targetElement.style.setProperty(this.variables[key], selectedColors[key]);
    });
  }

  // Updates color data table
  updateColorData() {
    if (!this.dataTable) return;

    const selectedColors = this.palettes[this.currentPalette][this.currentColor];

    this.dataTable.innerHTML = Object.keys(this.variables)
      .map((key) => 
        `<tr class="nsw-color-swatches__data">
          <td><div class="nsw-docs__swatch" style="background-color: var(${this.variables[key]})"></div></td>
          <td><p>${this.formatLabel(key)}</p></td>
          <td><p>${selectedColors[key]}</p></td>
          <td><p><code>${this.variables[key]}</code></p></td>
        </tr>`
      )
      .join('');
  }

  // Updates legend (title)
  updateLegend() {
    if (this.legend) {
      this.legend.textContent = this.formatLabel(this.currentColor);
      this.legend.setAttribute('aria-live', 'polite');
    }
  }

  // Formats labels
  formatLabel(text) {
    return text.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  }
}

export default ColorSwatches;