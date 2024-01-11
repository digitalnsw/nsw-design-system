class DateInput {
  constructor(element) {
    this.element = element
    this.class = 'nsw-form__select'
    this.selectors = {
      year: '.js-date-year',
      month: '.js-date-month',
      day: '.js-date-day',
    }
    this.previousDay = false
  }

  init() {
    this.initSelectElement('year')
    this.initSelectElement('month')
    this.initSelectElement('day')
    this.initEvents()
    this.populateYears()
    this.populateMonths()
    this.populateDays(this.monthSelect.value)
  }

  initSelectElement(type) {
    const input = this.element.querySelector(this.selectors[type])
    const parent = input.parentElement

    parent.removeAttribute('class')
    const selectElement = this.createSelectElement(input)
    this[`${type}Select`] = selectElement
  }

  createSelectElement(input) {
    const selectElement = document.createElement('select')
    const { id, name, ariaInvalid } = input

    selectElement.classList.add(this.class)
    selectElement.setAttribute('id', id)
    selectElement.setAttribute('name', name)
    if (ariaInvalid) {
      selectElement.setAttribute('aria-invalid', 'true')
    }
    input.replaceWith(selectElement)
    return selectElement
  }

  initEvents() {
    this.yearSelect.addEventListener('change', () => {
      this.populateDays(this.monthSelect.value)
    })

    this.monthSelect.addEventListener('change', () => {
      this.populateDays(this.monthSelect.value)
    })

    this.daySelect.addEventListener('change', () => {
      this.previousDay = this.daySelect.value
    })
  }

  populateMonths() {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ]

    this.constructor.populateOptions(this.monthSelect, months)
  }

  populateDays(month) {
    const daysInMonth = this.getDaysInMonth(month)
    this.constructor.populateOptions(this.daySelect, Array.from({ length: daysInMonth }, (_, i) => i + 1))

    this.setPreviousDay()
  }

  getDaysInMonth(month) {
    const days31 = ['January', 'March', 'May', 'July', 'August', 'October', 'December']
    const days30 = ['April', 'June', 'September', 'November']

    if (days31.includes(month)) {
      return 31
    } if (days30.includes(month)) {
      return 30
    }
    return this.isLeapYear() ? 29 : 28
  }

  isLeapYear() {
    const year = parseInt(this.yearSelect.value, 10)
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)
  }

  populateYears() {
    const currentYear = new Date().getFullYear()
    const years = Array.from({ length: 101 }, (_, i) => currentYear - i)

    this.constructor.populateOptions(this.yearSelect, years)
  }

  setPreviousDay() {
    if (this.previousDay) {
      this.daySelect.value = this.previousDay
      for (let i = 1; i <= 3; i += 1) {
        if (this.daySelect.value === '') {
          this.daySelect.value = this.previousDay - i
        }
      }
    }
  }

  static populateOptions(selectElement, options) {
    while (selectElement.firstChild) {
      selectElement.removeChild(selectElement.firstChild)
    }

    options.forEach((option) => {
      const optionElement = document.createElement('option')
      optionElement.textContent = option
      selectElement.appendChild(optionElement)
    })
  }
}

export default DateInput
