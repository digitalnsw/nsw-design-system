/* eslint-disable max-len */
class DatePicker {
  constructor(element) {
    this.element = element
    this.months = this.element.getAttribute('data-months') ? this.element.getAttribute('data-months') : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    this.dateFormat = this.element.getAttribute('data-date-format') ? this.element.getAttribute('data-date-format') : 'd-m-y'
    this.dateSeparator = this.element.getAttribute('data-date-separator') ? this.element.getAttribute('data-date-separator') : '/'
    this.input = this.element.querySelector('.js-date-input__text')
    this.trigger = this.element.querySelector('.js-date-input__trigger')
    this.triggerLabel = this.trigger.getAttribute('aria-label')
    this.datePicker = this.element.querySelector('.js-date-picker')
    this.body = this.datePicker.querySelector('.js-date-picker__dates')
    this.navigation = this.datePicker.querySelector('.js-date-picker__title-nav')
    this.heading = this.datePicker.querySelector('.js-date-picker__title-label')
    this.pickerVisible = false
    // date format
    this.dateIndexes = this.getDateIndexes() // store indexes of date parts (d, m, y)
    // selected date
    this.dateSelected = false
    this.selectedDay = false
    this.selectedMonth = false
    this.selectedYear = false
    // focus trap
    this.firstFocusable = false
    this.lastFocusable = false
    // date value - for custom control variation
    this.dateValueEl = this.element.getElementsByClassName('js-date-input__value')
    if (this.dateValueEl.length > 0) {
      this.dateValueLabelInit = this.dateValueEl[0].textContent // initial input value
    }
  }

  init() {
    // set initial date
    this.resetCalendar()
    this.initCalendarAria()
    this.initCalendarEvents()
    this.placeCalendar()
  }

  initCalendarAria() {
    // reset calendar button label
    this.resetLabelCalendarTrigger()
    if (this.dateValueEl.length > 0) {
      this.resetCalendar()
      this.resetLabelCalendarValue()
    }
    // create a live region used to announce new month selection to SR
    const srLiveReagion = document.createElement('div')
    srLiveReagion.setAttribute('aria-live', 'polite')
    srLiveReagion.classList.add('sr-only', 'js-date-input__sr-live')
    this.element.appendChild(srLiveReagion)
    this.srLiveReagion = this.element.querySelector('.js-date-input__sr-live')
  }

  initCalendarEvents() {
    this.input.addEventListener('focus', () => {
      this.toggleCalendar(true) // toggle calendar when focus is on input
    })
    if (this.trigger) {
      this.trigger.addEventListener('click', (event) => { // open calendar when clicking on calendar button
        event.preventDefault()
        this.pickerVisible = false
        this.toggleCalendar()
        this.trigger.setAttribute('aria-expanded', 'true')
      })
    }

    // select a date inside the date picker
    this.body.addEventListener('click', (event) => {
      event.preventDefault()
      const day = event.target.closest('button')
      if (day) {
        this.dateSelected = true
        this.selectedDay = day.innerText
        this.selectedMonth = this.currentMonth
        this.selectedYear = this.currentYear
        this.setInputValue()
        this.input.focus() // focus on the input element and close picker
        this.resetLabelCalendarTrigger()
        this.resetLabelCalendarValue()
      }
    })

    // navigate using title nav
    this.navigation.addEventListener('click', (event) => {
      event.preventDefault()
      const monthBtn = event.target.closest('.js-date-picker__month-nav-btn')
      const yearBtn = event.target.closest('.js-date-picker__year-nav-btn')

      if (monthBtn && monthBtn.classList.contains('js-date-picker__month-nav-btn--prev')) {
        this.showPrevMonth(true)
      } else if (monthBtn && monthBtn.classList.contains('js-date-picker__month-nav-btn--next')) {
        this.showNextMonth(true)
      } else if (yearBtn && yearBtn.classList.contains('js-date-picker__year-nav-btn--prev')) {
        this.showPrevYear(true)
      } else if (yearBtn && yearBtn.classList.contains('js-date-picker__year-nav-btn--next')) {
        this.showNextYear(true)
      }
    })

    // hide calendar
    window.addEventListener('keydown', (event) => { // close calendar on esc
      if ((event.code && event.code === 27) || (event.key && event.key.toLowerCase() === 'escape')) {
        if (document.activeElement.closest('.js-date-picker')) {
          this.input.focus() // if focus is inside the calendar -> move the focus to the input element
        } else { // do not move focus -> only close calendar
          this.hideCalendar()
        }
      }
    })
    window.addEventListener('click', (event) => {
      if (!event.target.closest('.js-date-picker') && !event.target.closest('.js-date-input') && this.pickerVisible) {
        this.hideCalendar()
      }
    })

    // navigate through days of calendar
    this.body.addEventListener('keydown', (event) => {
      let day = this.currentDay
      if ((event.code && event.code === 40) || (event.key && event.key.toLowerCase() === 'arrowdown')) {
        day += 7
        this.resetDayValue(day)
      } else if ((event.code && event.code === 39) || (event.key && event.key.toLowerCase() === 'arrowright')) {
        day += 1
        this.resetDayValue(day)
      } else if ((event.code && event.code === 37) || (event.key && event.key.toLowerCase() === 'arrowleft')) {
        day -= 1
        this.resetDayValue(day)
      } else if ((event.code && event.code === 38) || (event.key && event.key.toLowerCase() === 'arrowup')) {
        day -= 7
        this.resetDayValue(day)
      } else if ((event.code && event.code === 35) || (event.key && event.key.toLowerCase() === 'end')) { // move focus to last day of week
        event.preventDefault()
        day = day + 6 - this.getDayOfWeek(this.currentYear, this.currentMonth, day)
        this.resetDayValue(day)
      } else if ((event.code && event.code === 36) || (event.key && event.key.toLowerCase() === 'home')) { // move focus to first day of week
        event.preventDefault()
        day -= this.getDayOfWeek(this.currentYear, this.currentMonth, day)
        this.resetDayValue(day)
      } else if ((event.code && event.code === 34) || (event.key && event.key.toLowerCase() === 'pagedown')) {
        event.preventDefault()
        this.showNextMonth() // show next month
      } else if ((event.code && event.code === 33) || (event.key && event.key.toLowerCase() === 'pageup')) {
        event.preventDefault()
        this.showPrevMonth() // show prev month
      }
    })

    // trap focus inside calendar
    this.datePicker.addEventListener('keydown', (event) => {
      if ((event.code && event.code === 9) || (event.key && event.key === 'Tab')) {
        // trap focus inside modal
        this.trapFocus(event)
      }
    })

    this.input.addEventListener('keydown', (event) => {
      if ((event.code && event.code === 13) || (event.key && event.key.toLowerCase() === 'enter')) {
        // update calendar on input enter
        this.resetCalendar()
        this.resetLabelCalendarTrigger()
        this.resetLabelCalendarValue()
        this.hideCalendar()
      } else if ((event.code && event.code === 40) || (event.key && event.key.toLowerCase() === 'arrowdown' && this.pickerVisible)) { // move focus to calendar using arrow down
        this.body.querySelector('button[tabindex="0"]').focus()
      }
    })
  }

  getCurrentDay(date) {
    return (date)
      ? this.getDayFromDate(date)
      : new Date().getDate()
  }

  getCurrentMonth(date) {
    return (date)
      ? this.getMonthFromDate(date)
      : new Date().getMonth()
  }

  getCurrentYear(date) {
    return (date)
      ? this.getYearFromDate(date)
      : new Date().getFullYear()
  }

  getDayFromDate(date) {
    const day = parseInt(date.split('-')[2], 10)
    return Number.isNaN(day) ? this.getCurrentDay(false) : day
  }

  getMonthFromDate(date) {
    const month = parseInt(date.split('-')[1], 10) - 1
    return Number.isNaN(month) ? this.getCurrentMonth(false) : month
  }

  getYearFromDate(date) {
    const year = parseInt(date.split('-')[0], 10)
    return Number.isNaN(year) ? this.getCurrentYear(false) : year
  }

  showNextMonth(bool) {
    // show next month
    this.currentYear = (this.currentMonth === 11) ? this.currentYear + 1 : this.currentYear
    this.currentMonth = (this.currentMonth + 1) % 12
    this.currentDay = this.checkDayInMonth()
    this.showCalendar(bool)
    this.srLiveReagion.textContent = `${this.months[this.currentMonth]} ${this.currentYear}`
  }

  showPrevMonth(bool) {
    // show prev month
    this.currentYear = (this.currentMonth === 0) ? this.currentYear - 1 : this.currentYear
    this.currentMonth = (this.currentMonth === 0) ? 11 : this.currentMonth - 1
    this.currentDay = this.checkDayInMonth()
    this.showCalendar(bool)
    this.srLiveReagion.textContent = `${this.months[this.currentMonth]} ${this.currentYear}`
  }

  showNextYear(bool) {
    // show next year
    this.currentYear += 1
    this.currentMonth %= 12
    this.currentDay = this.checkDayInMonth()
    this.showCalendar(bool)
    this.srLiveReagion.textContent = `${this.months[this.currentMonth]} ${this.currentYear}`
  }

  showPrevYear(bool) {
    // show prev year
    this.currentYear -= 1
    this.currentMonth %= 12
    this.currentDay = this.checkDayInMonth()
    this.showCalendar(bool)
    this.srLiveReagion.textContent = `${this.months[this.currentMonth]} ${this.currentYear}`
  }

  checkDayInMonth() {
    return (this.currentDay > this.constructor.daysInMonth(this.currentYear, this.currentMonth)) ? 1 : this.currentDay
  }

  static daysInMonth(year, month) {
    return 32 - new Date(year, month, 32).getDate()
  }

  resetCalendar() {
    let currentDate = false
    const selectedDate = this.input.value

    this.dateSelected = false
    if (selectedDate !== '') {
      const date = this.getDateFromInput()
      this.dateSelected = true
      currentDate = date
    }
    this.currentDay = this.getCurrentDay(currentDate)
    this.currentMonth = this.getCurrentMonth(currentDate)
    this.currentYear = this.getCurrentYear(currentDate)

    this.selectedDay = this.dateSelected ? this.currentDay : false
    this.selectedMonth = this.dateSelected ? this.currentMonth : false
    this.selectedYear = this.dateSelected ? this.currentYear : false
  }

  showCalendar(bool) {
    // show calendar element
    const firstDay = this.constructor.getDayOfWeek(this.currentYear, this.currentMonth, '01')
    this.body.innerHTML = ''
    this.heading.innerHTML = `${this.months[this.currentMonth]} ${this.currentYear}`

    // creating all cells
    let date = 1
    let calendar = ''
    for (let i = 0; i < 6; i += 1) {
      for (let j = 0; j < 7; j += 1) {
        if (i === 0 && j < firstDay) {
          calendar += '<li></li>'
        } else if (date > this.constructor.daysInMonth(this.currentYear, this.currentMonth)) {
          break
        } else {
          let classListDate = ''
          let tabindexValue = '-1'
          if (date === this.currentDay) {
            tabindexValue = '0'
          }
          if (!this.dateSelected && this.getCurrentMonth() === this.currentMonth && this.getCurrentYear() === this.currentYear && date === this.getCurrentDay()) {
            classListDate += ' nsw-date-picker__date--today'
          }
          if (this.dateSelected && date === this.selectedDay && this.currentYear === this.selectedYear && this.currentMonth === this.selectedMonth) {
            classListDate += '  date-picker__date--selected'
          }
          calendar = `${calendar}<li><button class="nsw-date-picker__date${classListDate}" tabindex="${tabindexValue}" type="button">${date}</button></li>`
          date += 1
        }
      }
    }
    this.body.innerHTML = calendar // appending days into calendar body

    // show calendar
    if (!this.pickerVisible) this.datePicker.classList.add('nsw-date-picker--is-visible')
    this.pickerVisible = true

    //  if bool is false, move focus to calendar day
    if (!bool) this.body.querySelector('button[tabindex="0"]').focus()

    // store first/last focusable elements
    this.getFocusableElements()

    // place calendar
    this.placeCalendar()
  }

  hideCalendar() {
    this.datePicker.classList.remove('nsw-date-picker--is-visible')
    this.pickerVisible = false

    // reset first/last focusable
    this.firstFocusable = false
    this.lastFocusable = false

    // reset trigger aria-expanded attribute
    if (this.trigger) this.trigger.setAttribute('aria-expanded', 'false')
  }

  toggleCalendar(bool) {
    if (!this.pickerVisible) {
      this.resetCalendar()
      this.showCalendar(bool)
    } else {
      this.hideCalendar()
    }
  }

  static getDayOfWeek(year, month, day) {
    let weekDay = (new Date(year, month, day)).getDay() - 1
    if (weekDay < 0) weekDay = 6
    return weekDay
  }

  getDateIndexes() {
    const dateFormat = this.dateFormat.toLowerCase().replace(/-/g, '')
    return [dateFormat.indexOf('d'), dateFormat.indexOf('m'), dateFormat.indexOf('y')]
  }

  setInputValue() {
    this.input.value = this.getDateForInput()
  }

  getDateForInput() {
    const dateArray = []
    dateArray[this.dateIndexes[0]] = this.constructor.getReadableDate(this.selectedDay)
    dateArray[this.dateIndexes[1]] = this.constructor.getReadableDate(this.selectedMonth + 1)
    dateArray[this.dateIndexes[2]] = this.selectedYear
    return dateArray[0] + this.dateSeparator + dateArray[1] + this.dateSeparator + dateArray[2]
  }

  getDateFromInput() {
    const dateArray = this.input.value.split(this.dateSeparator)
    return `${dateArray[this.dateIndexes[2]]}-${dateArray[this.dateIndexes[1]]}-${dateArray[this.dateIndexes[0]]}`
  }

  static getReadableDate(date) {
    return (date < 10) ? `0${date}` : date
  }

  resetDayValue(day) {
    const totDays = this.constructor.daysInMonth(this.currentYear, this.currentMonth)
    if (day > totDays) {
      this.currentDay = day - totDays
      this.showNextMonth(false)
    } else if (day < 1) {
      const newMonth = this.currentMonth === 0 ? 11 : this.currentMonth - 1
      this.currentDay = this.constructor.daysInMonth(this.currentYear, newMonth) + day
      this.showPrevMonth(false)
    } else {
      this.currentDay = day
      this.body.querySelector('button[tabindex="0"]').setAttribute('tabindex', '-1')
      // set new tabindex to selected item
      const buttons = this.body.getElementsByTagName('button')
      for (let i = 0; i < buttons.length; i += 1) {
        if (parseInt(buttons[i].textContent, 10) === this.currentDay) {
          buttons[i].setAttribute('tabindex', '0')
          buttons[i].focus()
          break
        }
      }
      this.getFocusableElements() // update first focusable/last focusable element
    }
  }

  resetLabelCalendarTrigger() {
    if (!this.trigger) return
    // reset accessible label of the calendar trigger
    if (this.selectedYear && this.selectedMonth !== false && this.selectedDay) {
      this.trigger.setAttribute('aria-label', `${this.triggerLabel}, selected date is ${new Date(this.selectedYear, this.selectedMonth, this.selectedDay).toDateString()}`)
    } else {
      this.trigger.setAttribute('aria-label', this.triggerLabel)
    }
  }

  resetLabelCalendarValue() {
    // this is used for the --custom-control variation -> there's a label that should be updated with the selected date
    if (this.dateValueEl.length < 1) return

    if (this.selectedYear && this.selectedMonth !== false && this.selectedDay) {
      this.dateValueEl[0].textContent = this.getDateForInput()
    } else {
      this.dateValueEl[0].textContent = this.dateValueLabelInit
    }
  }

  getFocusableElements() {
    const allFocusable = this.datePicker.querySelectorAll('[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary')
    this.getFirstFocusable(allFocusable)
    this.getLastFocusable(allFocusable)
  }

  getFirstFocusable(elements) {
    for (let i = 0; i < elements.length; i += 1) {
      if ((elements[i].offsetWidth || elements[i].offsetHeight || elements[i].getClientRects().length) && elements[i].getAttribute('tabindex') !== '-1') {
        this.firstFocusable = elements[i]
        return true
      }
    }

    return false
  }

  getLastFocusable(elements) {
    // get last visible focusable element inside the modal
    for (let i = elements.length - 1; i >= 0; i -= 1) {
      if ((elements[i].offsetWidth || elements[i].offsetHeight || elements[i].getClientRects().length) && elements[i].getAttribute('tabindex') !== '-1') {
        this.lastFocusable = elements[i]
        return true
      }
    }

    return false
  }

  trapFocus(event) {
    if (this.firstFocusable === document.activeElement && event.shiftKey) {
      // on Shift+Tab -> focus last focusable element when focus moves out of calendar
      event.preventDefault()
      this.lastFocusable.focus()
    }
    if (this.lastFocusable === document.activeElement && !event.shiftKey) {
      // on Tab -> focus first focusable element when focus moves out of calendar
      event.preventDefault()
      this.firstFocusable.focus()
    }
  }

  placeCalendar() {
    // reset position
    this.datePicker.style.left = '0px'
    this.datePicker.style.right = 'auto'

    // check if you need to modify the calendar postion
    const pickerBoundingRect = this.datePicker.getBoundingClientRect()

    if (pickerBoundingRect.right > window.innerWidth) {
      this.datePicker.style.left = 'auto'
      this.datePicker.style.right = '0px'
    }
  }
}

export default DatePicker
