class Select {
  constructor(element) {
    this.element = element
    this.select = this.element.querySelectorAll('select')
    this.optGroups = this.select.querySelectorAll('optgroup')
    this.options = this.select.querySelectorAll('option')
    this.selectId = this.select.getAttribute('id')
    this.selectedOptCounter = 0
  }

  init() {
    this.controls()
  }

  controls() {
    this.controls()
  }
}

export default Select
