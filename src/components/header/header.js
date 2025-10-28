class SiteSearch {
  constructor(element) {
    this.element = element
    this.originalButton = document.querySelector('.js-open-search')
    this.targetElement = document.getElementById(this.element.getAttribute('aria-controls'))
    this.searchInput = this.targetElement.querySelector('input.js-search-input')
    this.pressed = this.element.getAttribute('aria-expanded') === 'true'
  }

  init() {
    if (!this.originalButton) return
    this.controls()
  }

  controls() {
    this.element.addEventListener('click', this.showHide.bind(this), false)
  }

  showHide() {
    if (this.pressed) {
      this.targetElement.hidden = true
      this.originalButton.hidden = false
      this.originalButton.focus()
    } else {
      this.targetElement.hidden = false
      this.originalButton.hidden = true
      this.searchInput.focus()
    }
  }
}

export default SiteSearch
