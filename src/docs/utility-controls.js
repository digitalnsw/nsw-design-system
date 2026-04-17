import ColorSwatches from './color-swatches'
import DirectionControl from './direction-control'

class UtilityControls {
  constructor(element, config = {}) {
    this.element = element
    this.config = config
    this.colorSwatches = null
    this.directionControl = null
  }

  init() {
    if (this.element.dataset.utilityControlsInitialised) return
    this.element.dataset.utilityControlsInitialised = 'true'

    if (this.element.classList.contains('js-direction-controls')) {
      this.directionControl = new DirectionControl(this.element)
      this.directionControl.init()
    }

    if (this.element.classList.contains('js-color-swatches')) {
      this.colorSwatches = new ColorSwatches(this.element, this.config.colorSwatches || this.config)
      this.colorSwatches.init()
    }
  }
}

export default UtilityControls
