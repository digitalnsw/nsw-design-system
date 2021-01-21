class SiteSearch {
  constructor(element) {
    this.triggerButton = element
    this.originalButton = document.querySelector('.js-open-search')
    this.targetElement = document.getElementById(this.triggerButton.getAttribute('aria-controls'))
    this.searchInput = this.targetElement.querySelector('.js-search-input')
    this.pressed = this.triggerButton.getAttribute('aria-expanded') === 'true'
  }

  init() {
    this.controls()
  }

  controls() {
    this.triggerButton.addEventListener('click', this.showHide.bind(this), false)
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
