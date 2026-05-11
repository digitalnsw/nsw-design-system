class SiteSearch {
  constructor(element) {
    this.element = element
    this.originalButton = document.querySelector('.js-open-search')
    this.targetElement = document.getElementById(this.element.getAttribute('aria-controls'))
    this.searchInput = this.targetElement ? this.targetElement.querySelector('input.js-search-input') : null
    this.pressed = this.element.getAttribute('aria-expanded') === 'true'
  }

  init() {
    if (!this.originalButton || !this.targetElement) return
    this.controls()
  }

  controls() {
    this.element.addEventListener('click', this.showHide.bind(this), false)
  }

  showHide() {
    if (!this.targetElement) return

    if (this.pressed) {
      this.targetElement.hidden = true
      this.originalButton.hidden = false
      this.originalButton.focus()
    } else {
      this.targetElement.hidden = false
      this.originalButton.hidden = true
      if (this.searchInput) this.searchInput.focus()
    }
  }
}

export default SiteSearch
