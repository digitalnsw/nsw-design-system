class DirectionControl {
  constructor(element) {
    this.element = element
    this.directionRoot = document.documentElement
    this.currentDirection = this.normaliseDirection(this.directionRoot.getAttribute('dir'))
    this.directionSelect = null
  }

  init() {
    this.directionSelect = this.createDirectionSelector()
    this.setDirectionFromURL()
    this.addEventListeners()
  }

  ensureUtilityContainer() {
    const existingUtility = this.element.querySelector('.js-color-swatches__utility')
    if (existingUtility) return existingUtility

    const utility = document.createElement('div')
    utility.classList.add('nsw-color-swatches__utility', 'js-color-swatches__utility')
    this.element.insertAdjacentElement('afterbegin', utility)
    return utility
  }

  createDirectionSelector() {
    const utility = this.ensureUtilityContainer()
    const existingDirectionSelect = this.element.querySelector('.js-direction-selector')

    if (existingDirectionSelect) {
      if (!existingDirectionSelect.id) {
        existingDirectionSelect.id = `${this.element.id || 'color-swatches'}-direction`
      }
      if (!existingDirectionSelect.getAttribute('name')) {
        existingDirectionSelect.setAttribute('name', 'direction')
      }
      if (!utility.contains(existingDirectionSelect)) {
        utility.appendChild(existingDirectionSelect)
      }
      return existingDirectionSelect
    }

    const directionSelect = document.createElement('select')
    directionSelect.classList.add('js-direction-selector', 'nsw-form__select', 'nsw-color-swatches__direction-selector')
    directionSelect.id = `${this.element.id || 'color-swatches'}-direction`
    directionSelect.setAttribute('name', 'direction')

    const directionLabel = document.createElement('label')
    directionLabel.classList.add('nsw-form__label', 'sr-only')
    directionLabel.setAttribute('for', directionSelect.id)
    directionLabel.textContent = this.element.dataset.directionLabel || 'Select reading direction'

    const directionOptions = [
      { value: 'ltr', label: this.element.dataset.ltrLabel || 'LTR' },
      { value: 'rtl', label: this.element.dataset.rtlLabel || 'RTL' },
    ]

    directionOptions.forEach(({ value, label }) => {
      const option = document.createElement('option')
      option.value = value
      option.textContent = label
      directionSelect.appendChild(option)
    })

    utility.appendChild(directionLabel)
    utility.appendChild(directionSelect)
    return directionSelect
  }

  addEventListeners() {
    if (!this.directionSelect) return

    this.directionSelect.addEventListener('change', (e) => {
      this.currentDirection = this.normaliseDirection(e.target.value)
      this.applyDirection()
      this.updateURL()
    })
  }

  normaliseDirection(direction) {
    return direction === 'rtl' ? 'rtl' : 'ltr'
  }

  applyDirection() {
    this.directionRoot.setAttribute('dir', this.currentDirection)
  }

  setDirectionFromURL() {
    const params = new URLSearchParams(window.location.search)
    const directionFromURL = params.get('dir')
    this.currentDirection = this.normaliseDirection(directionFromURL || this.currentDirection)
    this.applyDirection()

    if (this.directionSelect) {
      this.directionSelect.value = this.currentDirection
    }
  }

  updateURL() {
    const params = new URLSearchParams(window.location.search)
    params.set('dir', this.currentDirection)

    const search = params.toString()
    const hash = window.location.hash || ''
    const newUrl = `${window.location.pathname}${search ? `?${search}` : ''}${hash}`
    window.history.replaceState({}, '', newUrl)
  }
}

export default DirectionControl
