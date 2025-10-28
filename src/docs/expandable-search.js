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

    // Mouse: navigate through to each suggestion on click
    this.buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (this.searchInput.classList.contains(this.hasContentClass)) {
          this.searchArea.hidden = false
          this.searchInput.focus()
        }
      })
    })

    // Keyboard: submit on Enter by navigating to the active suggestion (or first link)
    if (this.searchInput && this.searchArea) {
      this.searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          const activeLink = this.searchArea.querySelector('[aria-selected="true"] a[href], .is-active a[href], [data-selected="true"] a[href]')
          const firstLink = this.searchArea.querySelector('a[href]')
          const target = activeLink || firstLink
          if (target && target.href) {
            e.preventDefault()
            window.location.assign(target.href)
          }
        }
      })
    }
  }
}

export default ExpandableSearch
