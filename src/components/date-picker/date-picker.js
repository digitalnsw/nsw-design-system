/* eslint-disable max-len */
class DatePicker {
  constructor(element) {
    this.element = element
    this.months = this.element.getAttribute('data-months') ? this.element.getAttribute('data-months') : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    this.dateFormat = this.element.getAttribute('data-date-format') ? this.element.getAttribute('data-date-format') : 'd-m-y'
    this.dateSeparator = this.element.getAttribute('data-date-separator') ? this.element.getAttribute('data-date-separator') : '/'
    this.datesDisabled = this.element.getAttribute('data-dates-disabled') ? this.element.getAttribute('data-dates-disabled') : ''
    this.input = this.element.querySelector('.js-date-input__text')
    this.trigger = this.element.querySelector('.js-date-input__trigger')
    this.triggerLabel = this.trigger.getAttribute('aria-label')
    this.datePicker = this.element.querySelector('.js-date-picker')
    this.body = this.datePicker.querySelector('.js-date-picker__dates')
    this.navigation = this.datePicker.querySelector('.js-date-picker__title-nav')
    this.heading = this.datePicker.querySelector('.js-date-picker__title-label')
    this.close = this.datePicker.querySelector('.js-date-picker__close')
    this.accept = this.datePicker.querySelector('.js-date-picker__accept')
    this.pickerVisible = false
    // multiple inputs
    this.multipleInput = this.element.querySelector('.js-date-input-multiple')
    this.dateInput = this.multipleInput && this.multipleInput.querySelector('.js-datepicker-date')
    this.monthInput = this.multipleInput && this.multipleInput.querySelector('.js-datepicker-month')
    this.yearInput = this.multipleInput && this.multipleInput.querySelector('.js-datepicker-year')
    this.multiDateArray = [this.dateInput, this.monthInput, this.yearInput]
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
    this.disabledArray = false
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

    // create a live region used to announce new month selection to SR
    const srLiveReagion = document.createElement('div')
    srLiveReagion.setAttribute('aria-live', 'polite')
    srLiveReagion.classList.add('sr-only', 'js-date-input__sr-live')
    this.element.appendChild(srLiveReagion)
    this.srLiveReagion = this.element.querySelector('.js-date-input__sr-live')
  }

  initCalendarEvents() {
    if (this.input) {
      this.input.addEventListener('focus', () => {
        this.toggleCalendar(true) // toggle calendar when focus is on input
      })
    }

    if (this.multipleInput) {
      this.multiDateArray.forEach((element) => {
        element.addEventListener('focus', () => {
          this.hideCalendar()
        })
      })
    }

    if (this.trigger) {
      this.trigger.addEventListener('click', (event) => { // open calendar when clicking on calendar button
        event.preventDefault()
        this.pickerVisible = false
        this.toggleCalendar()
        this.trigger.setAttribute('aria-expanded', 'true')
      })
    }

    if (this.close) {
      this.close.addEventListener('click', (event) => { // open calendar when clicking on calendar button
        event.preventDefault()
        this.hideCalendar()
      })
    }

    if (this.accept) {
      this.accept.addEventListener('click', (event) => { // open calendar when clicking on calendar button
        event.preventDefault()
        const day = this.body.querySelector('button[tabindex="0"]')
        if (day) {
          this.dateSelected = true
          this.selectedDay = day.innerText
          this.selectedMonth = this.currentMonth
          this.selectedYear = this.currentYear
          this.setInputValue()
          if (this.input) {
            this.input.focus() // focus on the input element and close picker
          } else if (this.multipleInput) {
            this.trigger.focus()
            this.hideCalendar()
          }

          this.resetLabelCalendarTrigger()
        }
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
        if (this.input) {
          this.input.focus() // focus on the input element and close picker
        } else if (this.multipleInput) {
          this.trigger.focus()
          this.hideCalendar()
        }

        this.resetLabelCalendarTrigger()
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
          const activeInput = document.activeElement.closest('.js-date-input').querySelector('input')
          activeInput.focus() // focus on the input element and close picker
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

    if (this.input) {
      this.input.addEventListener('keydown', (event) => {
        if ((event.code && event.code === 13) || (event.key && event.key.toLowerCase() === 'enter')) {
          // update calendar on input enter
          this.resetCalendar()
          this.resetLabelCalendarTrigger()
          this.hideCalendar()
        } else if ((event.code && event.code === 40) || (event.key && event.key.toLowerCase() === 'arrowdown' && this.pickerVisible)) { // move focus to calendar using arrow down
          this.body.querySelector('button[tabindex="0"]').focus()
        }
      })
    }

    if (this.multipleInput) {
      this.multiDateArray.forEach((element) => {
        element.addEventListener('keydown', (event) => {
          if ((event.code && event.code === 13) || (event.key && event.key.toLowerCase() === 'enter')) {
            // update calendar on input enter
            this.resetCalendar()
            this.resetLabelCalendarTrigger()
            this.hideCalendar()
          } else if ((event.code && event.code === 40) || (event.key && event.key.toLowerCase() === 'arrowdown' && this.pickerVisible)) { // move focus to calendar using arrow down
            this.body.querySelector('button[tabindex="0"]').focus()
          }
        })
      })
    }
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
    let selectedDate

    if (this.input) {
      selectedDate = this.input.value
    } else if (this.multipleInput) {
      if (this.dateInput.value !== '' && this.monthInput.value !== '' && this.yearInput.value !== '') {
        selectedDate = `${this.dateInput.value}/${this.monthInput.value}/${this.yearInput.value}`
      } else {
        selectedDate = ''
      }
    }

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

  disabledDates() {
    this.disabledArray = []
    if (this.datesDisabled) {
      const disabledDates = this.datesDisabled.split(' ')

      disabledDates.forEach((element) => {
        this.disabledArray.push(element)
      })
    }
  }

  showCalendar(bool) {
    // show calendar element
    const firstDay = this.constructor.getDayOfWeek(this.currentYear, this.currentMonth, '01')
    this.body.innerHTML = ''
    this.heading.innerHTML = `${this.months[this.currentMonth]} ${this.currentYear}`
    this.disabledDates()

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
          let disabled
          if (date === this.currentDay) {
            tabindexValue = '0'
          }
          if (this.getCurrentMonth() === this.currentMonth && this.getCurrentYear() === this.currentYear && date === this.getCurrentDay()) {
            classListDate += ' nsw-date-picker__date--today'
          }
          if (this.disabledArray.includes(this.getDateForInput(date, this.currentMonth, this.currentYear))) {
            disabled = 'aria-disabled="true"'
          }
          if (this.dateSelected && date === this.selectedDay && this.currentYear === this.selectedYear && this.currentMonth === this.selectedMonth) {
            classListDate += ' nsw-date-picker__date--selected'
          }
          calendar = `${calendar}<li><button class="nsw-date-picker__date${classListDate}" tabindex="${tabindexValue}" type="button" ${disabled || ''}>${date}</button></li>`
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
    if (this.input) {
      this.input.value = this.getDateForInput(this.selectedDay, this.selectedMonth, this.selectedYear)
    } else if (this.multipleInput) {
      this.dateInput.value = this.constructor.getReadableDate(this.selectedDay)
      this.monthInput.value = this.constructor.getReadableDate(this.selectedMonth + 1)
      this.yearInput.value = this.selectedYear
    }
  }

  getDateForInput(day, month, year) {
    const dateArray = []
    dateArray[this.dateIndexes[0]] = this.constructor.getReadableDate(day)
    dateArray[this.dateIndexes[1]] = this.constructor.getReadableDate(month + 1)
    dateArray[this.dateIndexes[2]] = year
    return dateArray[0] + this.dateSeparator + dateArray[1] + this.dateSeparator + dateArray[2]
  }

  getDateFromInput() {
    let dateArray

    if (this.input) {
      dateArray = this.input.value.split(this.dateSeparator)
    } else if (this.multipleInput) {
      dateArray = [this.dateInput.value, this.monthInput.value, this.yearInput.value]
    }
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
      const focusItem = this.body.querySelector('button[tabindex="0"]')
      focusItem.setAttribute('tabindex', '-1')
      focusItem.classList.remove('nsw-date-picker__date--keyboard-focus')
      // set new tabindex to selected item
      const buttons = this.body.getElementsByTagName('button')
      for (let i = 0; i < buttons.length; i += 1) {
        if (parseInt(buttons[i].textContent, 10) === this.currentDay) {
          buttons[i].setAttribute('tabindex', '0')
          buttons[i].classList.add('nsw-date-picker__date--keyboard-focus')
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
