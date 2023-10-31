class ExpandableSearch {
  constructor(element) {
    this.element = element
    this.searchInput = this.element.querySelector('.js-search-input')
    this.buttons = this.element.querySelectorAll('.js-open-search')
    this.searchArea = this.element.querySelector('.js-search-area')
    this.hasContentClass = 'active'
  }

  init() {
    this.searchInput.addEventListener('input', (event) => {
      const input = event.target
      if (input.value.length > 0) {
        input.classList.add(this.hasContentClass)
        input.setAttribute('aria-expanded', true)
      } else {
        input.classList.remove(this.hasContentClass)
        input.setAttribute('aria-expanded', false)
      }
    })

    this.buttons.forEach((element) => {
      element.addEventListener('click', () => {
        if (this.searchInput.classList.contains(this.hasContentClass)) {
          this.searchArea.hidden = false
          this.searchInput.focus()
        }
      })
    })
  }
}

export default ExpandableSearch
