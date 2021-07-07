class Filters {
  constructor(element) {
    this.filters = element
    this.openButton = element.querySelector('.nsw-filters__controls button')
    this.closeButtons = element.querySelectorAll('.nsw-filters__back button')
    this.all = element.querySelectorAll('.nsw-filters__all')
    this.allBlocks = Array.prototype.slice.call(this.all)
    this.showMoreButtons = Array.prototype.slice.call(element.querySelectorAll('.nsw-filters__more'))
    this.showEvent = (e) => this.showFilters(e)
    this.hideEvent = (e) => this.hideFilters(e)
    this.showMoreEvent = (e) => this.showMore(e)
    this.body = document.body
  }

  init() {
    this.setUpDom()
    this.controls()
  }

  setUpDom() {
    this.filters.classList.add('is-ready')
  }

  controls() {
    this.openButton.addEventListener('click', this.showEvent, false)

    this.closeButtons.forEach((element) => {
      element.addEventListener('click', this.hideEvent, false)
    })

    this.all.forEach((element) => {
      const showMoreButton = element.nextElementSibling
      showMoreButton.addEventListener('click', this.showMoreEvent, false)
    })
  }

  showFilters(e) {
    e.preventDefault()
    this.filters.classList.add('active')
    this.body.classList.add('filters-open')
  }

  hideFilters(e) {
    e.preventDefault()
    this.filters.classList.remove('active')
    this.body.classList.remove('filters-open')
  }

  showMore(e) {
    e.preventDefault()
    const currentShowMore = e.target
    const currentIndex = this.showMoreButtons.indexOf(currentShowMore)
    const currentAll = this.allBlocks[currentIndex]
    currentAll.classList.remove('hidden')
    currentShowMore.classList.add('hidden')
  }
}

export default Filters
