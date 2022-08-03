import { uniqueId } from '../../global/scripts/helpers/utilities'

class Filters {
  constructor(element) {
    this.filters = element
    this.openButton = element.querySelector('.nsw-filters__controls button')
    this.closeButton = element.querySelector('.nsw-filters__back button')
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
    this.resetEvent = (e) => this.clearAllFilters(e)
    this.clearButton = element.querySelector('.nsw-filters__cancel')
    this.filtersItems = element.querySelectorAll('.nsw-filters__item')
    this.openButtonText = element.querySelector('.nsw-filters__controls-name')
    this.buttonLabel = (this.openButtonText) ? this.openButtonText.innerText : ''
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
    if (this.openButton) {
      this.openButton.addEventListener('click', this.showEvent, false)
    }

    if (this.closeButton) {
      this.closeButton.addEventListener('click', this.hideEvent, false)
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

    if (this.clearButton) {
      this.clearButton.addEventListener('click', this.resetEvent, false)
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
      const label = filter.querySelector('.nsw-form__label')
      const legend = filter.querySelector('.nsw-form__legend')
      const content = filter.querySelector('.nsw-filters__item-content')
      const text = content.querySelectorAll('input[type="text"]')
      const selects = content.querySelectorAll('select')
      const checkboxes = content.querySelectorAll('input[type="checkbox"]')
      if (button) {
        this.getInputLabel(text, button, checkIcon, this.buttonLabel)
        this.getSelectLabel(selects, button, checkIcon, this.buttonLabel)
        this.getCheckboxLabel(checkboxes, button, checkIcon, this.buttonLabel)
      } else {
        this.getInputLabel(text, label, checkIcon, this.buttonLabel)
        this.getSelectLabel(selects, label, checkIcon, this.buttonLabel)
        this.getCheckboxLabel(checkboxes, legend, checkIcon, this.buttonLabel)
      }
    })
  }

  clearAllFilters(e) {
    e.preventDefault()
    this.filtersItems.forEach((filter) => {
      const content = filter.querySelector('.nsw-filters__item-content')
      const text = content.querySelectorAll('input[type="text"]')
      const selects = content.querySelectorAll('select')
      const checkboxes = content.querySelectorAll('input[type="checkbox"]')
      const button = filter.querySelector('.nsw-filters__item-name')
      const label = filter.querySelector('.nsw-form__label')
      const legend = filter.querySelector('.nsw-form__legend')

      if (text.length > 0) {
        text.forEach((input) => {
          const field = input
          if (input.value.length > 0) {
            field.value = ''
          }
        })
      }

      if (selects.length > 0) {
        selects.forEach((select) => {
          const option = select
          if (option.value !== '') {
            option.value = ''
          }
        })
      }

      if (checkboxes.length > 0) {
        checkboxes.forEach((input) => {
          const checkbox = input
          if (checkbox.checked) {
            checkbox.checked = false
          }
        })
      }

      this.selected = []
      this.resultsCount(this.selected, this.buttonLabel)
      if (button) {
        const buttonCheck = button.querySelector('span.nsw-material-icons')
        if (buttonCheck) {
          buttonCheck.remove()
        }
      } else if (label) {
        const lableCheck = label.querySelector('span.nsw-material-icons')
        if (lableCheck) {
          lableCheck.remove()
        }
      } else {
        const legendCheck = legend.querySelector('span.nsw-material-icons')
        if (legendCheck) {
          legendCheck.remove()
        }
      }
    })
  }

  resultsCount(array, buttonText) {
    if (this.openButtonText) {
      if (array.length > 0) {
        this.openButtonText.innerText = `${buttonText} (${array.length})`
      } else {
        this.openButtonText.innerText = `${buttonText}`
      }
    }
  }

  getCheckboxLabel(array, title, icon, name) {
    const text = title
    if (array.length > 0 && text) {
      const labelText = text.innerText
      const checks = []
      array.forEach((input) => {
        if (input.checked) {
          this.selected.push(input.value)
          checks.push(input.value)
          text.innerText = labelText
          text.innerHTML = `${text.innerText} ${icon}`
          this.resultsCount(this.selected, name)
        }
        input.addEventListener('change', () => {
          if (input.checked) {
            this.selected.push(input.value)
            checks.push(input.value)
            this.resultsCount(this.selected, name)
          } else {
            this.selected.splice(this.selected.indexOf(input.value), 1)
            checks.splice(checks.indexOf(input.value), 1)
            this.resultsCount(this.selected, name)
          }
          if (checks.length > 0) {
            text.innerText = labelText
            text.innerHTML = `${text.innerText} ${icon}`
          } else {
            text.innerText = labelText
          }
        })
      })
    }
  }

  getSelectLabel(array, title, icon, name) {
    const text = title
    if (array.length > 0 && title) {
      const labelText = text.innerText
      array.forEach((select) => {
        if (select.value !== '') {
          this.selected.push(select)
          text.innerText = labelText
          text.innerHTML = `${text.innerText} ${icon}`
        }
        select.addEventListener('change', () => {
          if (select.value !== '') {
            if (!this.selected.includes('select')) {
              this.selected.push('select')
            }
            text.innerText = labelText
            text.innerHTML = `${text.innerText} ${icon}`
            this.resultsCount(this.selected, name)
          } else {
            this.selected.splice(this.selected.indexOf('select'), 1)
            text.innerText = labelText
            this.resultsCount(this.selected, name)
          }
        })
      })
    }
  }

  getInputLabel(array, title, icon, name) {
    const text = title
    if (array.length >= 0 && text) {
      const labelText = text.innerText
      array.forEach((input) => {
        if (input.value !== '') {
          this.selected.push(input.value)
          text.innerText = labelText
          text.innerHTML = `${text.innerText} ${icon}`
        }
        input.addEventListener('keyup', () => {
          if (input.value !== '') {
            if (!this.selected.includes(`input-${labelText}`)) {
              this.selected.push(`input-${labelText}`)
            }
            text.innerText = labelText
            text.innerHTML = `${text.innerText} ${icon}`
            this.resultsCount(this.selected, name)
          } else {
            this.selected.splice(this.selected.indexOf(`input-${labelText}`), 1)
            text.innerText = labelText
            this.resultsCount(this.selected, name)
          }
        })
      })
    }
  }
}

export default Filters
