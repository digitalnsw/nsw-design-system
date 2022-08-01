import { uniqueId } from '../../global/scripts/helpers/utilities'

class Filters {
  constructor(element) {
    this.filters = element
    this.openButtons = element.querySelectorAll('.nsw-filters__controls button')
    this.closeButtons = element.querySelectorAll('.nsw-filters__back button')
    this.all = element.querySelectorAll('.nsw-filters__all')
    this.allBlocks = Array.prototype.slice.call(this.all)
    this.showMoreButtons = Array.prototype.slice.call(element.querySelectorAll('.nsw-filters__more'))
    this.showEvent = (e) => this.showFilters(e)
    this.hideEvent = (e) => this.hideFilters(e)
    this.showMoreEvent = (e) => this.showMore(e)
    this.body = document.body
    this.accordionButtons = element.querySelectorAll('.nsw-filters__item-button')
    this.buttons = []
    this.content = []
    this.toggleEvent = (e) => this.toggle(e)
    // Selected
    this.filtersList = element.querySelector('.nsw-filters__list')
    this.filtersItems = element.querySelectorAll('.nsw-filters__item')
    this.openButtonText = element.querySelector('.nsw-filters__controls-name')
    this.selected = []
  }

  init() {
    this.setUpDom()
    this.controls()
    this.selectedItems()
  }

  setUpDom() {
    this.filters.classList.add('ready')

    this.accordionButtons.forEach((button) => {
      const buttonElem = button
      const uID = uniqueId('accordion')
      buttonElem.setAttribute('type', 'button')
      buttonElem.setAttribute('aria-expanded', 'false')
      buttonElem.setAttribute('aria-controls', uID)

      const contentElem = buttonElem.nextElementSibling
      contentElem.id = buttonElem.getAttribute('aria-controls')
      contentElem.hidden = true

      this.content.push(contentElem)
      this.buttons.push(buttonElem)
    })
  }

  controls() {
    if (this.openButtons) {
      this.openButtons.forEach((element) => {
        element.addEventListener('click', this.showEvent, false)
      })
    }
    if (this.closeButtons) {
      this.closeButtons.forEach((element) => {
        element.addEventListener('click', this.hideEvent, false)
      })
    }

    this.all.forEach((element) => {
      const showMoreButton = element.nextElementSibling
      showMoreButton.addEventListener('click', this.showMoreEvent, false)
    })

    if (this.buttons) {
      this.buttons.forEach((element) => {
        element.addEventListener('click', this.toggleEvent, false)
      })
    }
  }

  showFilters(e) {
    e.preventDefault()
    if (this.filters.classList.contains('nsw-filters--down')) {
      this.filters.classList.toggle('active')
    } else {
      this.filters.classList.add('active')
      this.body.classList.add('filters-open')
    }
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

  getTargetContent(element) {
    const currentIndex = this.buttons.indexOf(element)
    return this.content[currentIndex]
  }

  setAccordionState(element, state) {
    const targetContent = this.getTargetContent(element)

    if (state === 'open') {
      element.classList.add('active')
      element.setAttribute('aria-expanded', 'true')
      targetContent.hidden = false
    } else if (state === 'close') {
      element.classList.remove('active')
      element.setAttribute('aria-expanded', 'false')
      targetContent.hidden = true
    }
  }

  toggle(e) {
    const { currentTarget } = e
    const targetContent = this.getTargetContent(currentTarget)
    const isHidden = targetContent.hidden

    if ((isHidden)) {
      this.setAccordionState(currentTarget, 'open')
    } else {
      this.setAccordionState(currentTarget, 'close')
    }
  }

  selectedItems() {
    const checkIcon = '<span class="material-icons nsw-material-icons" focusable="false" aria-hidden="true">check_circle</span>'
    this.filtersItems.forEach((filter) => {
      const button = filter.querySelector('.nsw-filters__item-name')
      const content = filter.querySelector('.nsw-filters__item-content')
      const openButtonTextname = this.openButtonText.innerText
      // Text Inputs
      const text = content.querySelectorAll('input[type="text"]')
      if (text.length >= 0 && button) {
        const buttonText = button.innerText
        text.forEach((input) => {
          if (input.value !== '') {
            this.selected.push(input.value)
            button.innerText = buttonText
            button.innerHTML = `${button.innerText} ${checkIcon}`
          }
          let timer
          input.addEventListener('keyup', () => {
            if (input.value !== '') {
              button.innerText = buttonText
              button.innerHTML = `${button.innerText} ${checkIcon}`
              clearTimeout(timer)
              timer = setTimeout(() => {
                this.selected.push(input.value)
              }, 1000)
              if (this.openButtonText && this.selected.length > 0) {
                this.openButtonText.innerText = `${openButtonTextname} (${this.selected.length})`
              } else {
                this.openButtonText.innerText = `${openButtonTextname}`
              }
            } else {
              this.selected.splice(this.selected.indexOf(input.value), 1)
              button.innerText = buttonText
              if (this.openButtonText && this.selected.length > 0) {
                this.openButtonText.innerText = `${openButtonTextname} (${this.selected.length})`
              } else {
                this.openButtonText.innerText = `${openButtonTextname}`
              }
            }
          })
        })
      }
      // Select Options
      const selects = content.querySelectorAll('select')
      if (selects.length > 0 && button) {
        const buttonText = button.innerText
        selects.forEach((select) => {
          if (select.value !== '') {
            this.selected.push(select)
            button.innerText = buttonText
            button.innerHTML = `${button.innerText} ${checkIcon}`
          }
          select.addEventListener('change', () => {
            if (select.value !== '') {
              this.selected.push(select)
              button.innerText = buttonText
              button.innerHTML = `${button.innerText} ${checkIcon}`
              if (this.openButtonText && this.selected.length > 0) {
                this.openButtonText.innerText = `${openButtonTextname} (${this.selected.length})`
              } else {
                this.openButtonText.innerText = `${openButtonTextname}`
              }
            } else {
              this.selected.splice(this.selected.indexOf(select.value), 1)
              button.innerText = buttonText
              if (this.openButtonText && this.selected.length > 0) {
                this.openButtonText.innerText = `${openButtonTextname} (${this.selected.length})`
              } else {
                this.openButtonText.innerText = `${openButtonTextname}`
              }
            }
          })
        })
      }
      // Checkboxes
      const checkboxes = content.querySelectorAll('input[type="checkbox"]')
      if (checkboxes.length > 0 && button) {
        const buttonText = button.innerText
        const checks = []
        checkboxes.forEach((input) => {
          if (input.checked) {
            this.selected.push(input.value)
            checks.push(input.value)
            button.innerText = buttonText
            button.innerHTML = `${button.innerText} ${checkIcon}`
            if (this.openButtonText && this.selected.length > 0) {
              this.openButtonText.innerText = `${openButtonTextname} (${this.selected.length})`
            } else {
              this.openButtonText.innerText = `${openButtonTextname}`
            }
          }
          input.addEventListener('change', () => {
            if (input.checked) {
              this.selected.push(input.value)
              checks.push(input.value)
              if (this.openButtonText && this.selected.length > 0) {
                this.openButtonText.innerText = `${openButtonTextname} (${this.selected.length})`
              } else {
                this.openButtonText.innerText = `${openButtonTextname}`
              }
            } else {
              this.selected.splice(this.selected.indexOf(input.value), 1)
              checks.splice(checks.indexOf(input.value), 1)
              if (this.openButtonText && this.selected.length > 0) {
                this.openButtonText.innerText = `${openButtonTextname} (${this.selected.length})`
              } else {
                this.openButtonText.innerText = `${openButtonTextname}`
              }
            }
            if (checks.length > 0) {
              button.innerText = buttonText
              button.innerHTML = `${button.innerText} ${checkIcon}`
            } else {
              button.innerText = buttonText
            }
          })
        })
      }
    })
  }
}

export default Filters
