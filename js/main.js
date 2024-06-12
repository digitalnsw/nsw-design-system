(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define('NSW', ['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.NSW = {}));
})(this, (function (exports) { 'use strict';

  // Unique ID creation requires a high quality random # generator. In the browser we therefore
  // require the crypto API and do not support built-in fallback to lower quality random number
  // generators (like Math.random()).
  let getRandomValues;
  const rnds8 = new Uint8Array(16);
  function rng() {
    // lazy load so that environments that need to polyfill have a chance to do so
    if (!getRandomValues) {
      // getRandomValues needs to be invoked in a context where "this" is a Crypto implementation.
      getRandomValues = typeof crypto !== 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto);
      if (!getRandomValues) {
        throw new Error('crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported');
      }
    }
    return getRandomValues(rnds8);
  }

  /**
   * Convert array of 16 byte values to UUID string format of the form:
   * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
   */

  const byteToHex = [];
  for (let i = 0; i < 256; ++i) {
    byteToHex.push((i + 0x100).toString(16).slice(1));
  }
  function unsafeStringify(arr, offset = 0) {
    // Note: Be careful editing this code!  It's been tuned for performance
    // and works in ways you may not expect. See https://github.com/uuidjs/uuid/pull/434
    return (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + '-' + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + '-' + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + '-' + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + '-' + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
  }

  const randomUUID = typeof crypto !== 'undefined' && crypto.randomUUID && crypto.randomUUID.bind(crypto);
  var native = {
    randomUUID
  };

  function v4(options, buf, offset) {
    if (native.randomUUID && !buf && !options) {
      return native.randomUUID();
    }
    options = options || {};
    const rnds = options.random || (options.rng || rng)(); // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`

    rnds[6] = rnds[6] & 0x0f | 0x40;
    rnds[8] = rnds[8] & 0x3f | 0x80; // Copy bytes to buffer, if provided

    if (buf) {
      offset = offset || 0;
      for (let i = 0; i < 16; ++i) {
        buf[offset + i] = rnds[i];
      }
      return buf;
    }
    return unsafeStringify(rnds);
  }

  // eslint-disable-next-line import/no-extraneous-dependencies
  const uniqueId = prefix => {
    const prefixValue = prefix === undefined ? 'nsw' : prefix;
    const uuid = v4();
    return `${prefixValue}-${uuid}`;
  };
  const focusObjectGenerator = arr => {
    const focusableElements = {
      all: arr,
      first: arr[0],
      last: arr[arr.length - 1],
      length: arr.length
    };
    return focusableElements;
  };
  const getFocusableElementBySelector = (id, selectorArr) => {
    const elements = [];
    for (let i = 0; i < selectorArr.length; i += 1) {
      elements.push([].slice.call(document.querySelectorAll(`#${id} ${selectorArr[i]}`)));
    }
    const mergedElementArr = [].concat(...elements);
    return focusObjectGenerator(mergedElementArr);
  };
  const trapTabKey = (event, focusObject) => {
    const {
      activeElement
    } = document;
    const focusableElement = focusObject;
    if (event.keyCode !== 9) return false;
    if (focusableElement.length === 1) {
      event.preventDefault();
    } else if (event.shiftKey && activeElement === focusableElement.first) {
      focusableElement.last.focus();
      event.preventDefault();
    } else if (!event.shiftKey && activeElement === focusableElement.last) {
      focusableElement.first.focus();
      event.preventDefault();
    }
    return true;
  };
  const whichTransitionEvent = () => {
    const el = document.createElement('fakeelement');
    const transitions = {
      transition: 'transitionend',
      OTransition: 'oTransitionEnd',
      MozTransition: 'transitionend',
      WebkitTransition: 'webkitTransitionEnd'
    };
    const found = Object.keys(transitions).filter(key => el.style[key] !== undefined);
    return transitions[found[0]];
  };

  function createButtons(_ref) {
    let {
      textContent
    } = _ref;
    const fragment = document.createDocumentFragment();
    const button = document.createElement('button');
    const uID = uniqueId('accordion');
    button.textContent = textContent;
    button.setAttribute('type', 'button');
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', uID);
    button.classList.add('nsw-accordion__button');
    button.insertAdjacentHTML('beforeend', `
  <span class="material-icons nsw-material-icons" focusable="false" aria-hidden="true">keyboard_arrow_down</span>
  `);
    fragment.appendChild(button);
    return fragment;
  }
  class Accordion {
    constructor(element) {
      this.element = element;
      const [expandAll, collapseAll] = Array.from(this.element.querySelectorAll('.nsw-accordion__toggle button'));
      this.accordionHeadingClass = '.nsw-accordion__title';
      this.headings = this.element.querySelectorAll(this.accordionHeadingClass);
      this.expandAllBtn = expandAll;
      this.collapseAllBtn = collapseAll;
      this.isExpandedOnLoad = this.element.querySelectorAll('.nsw-accordion__open');
      this.buttons = [];
      this.content = [];
      this.toggleEvent = event => this.toggle(event);
      this.expandAllEvent = event => this.expandAll(event);
      this.collapseAllEvent = event => this.collapseAll(event);
    }
    init() {
      this.setUpDom();
      this.controls();
    }
    setUpDom() {
      this.element.classList.add('ready');
      if (this.collapseAllBtn) {
        this.collapseAllBtn.disabled = true;
      }
      this.headings.forEach(heading => {
        const headingElem = heading;
        const contentElem = heading.nextElementSibling;
        const buttonFrag = createButtons(heading);
        headingElem.textContent = '';
        headingElem.appendChild(buttonFrag);
        const buttonElem = headingElem.getElementsByTagName('button')[0];
        if (contentElem) {
          contentElem.id = buttonElem.getAttribute('aria-controls');
          contentElem.hidden = 'until-found';
          this.content.push(contentElem);
        }
        this.buttons.push(buttonElem);
      });
      if (this.isExpandedOnLoad) {
        this.isExpandedOnLoad.forEach(element => {
          const openButton = element.querySelector('button');
          this.setAccordionState(openButton, 'open');
        });
      }
    }
    controls() {
      this.buttons.forEach(element => {
        element.addEventListener('click', this.toggleEvent, false);
        element.addEventListener('beforematch', this.toggleEvent, false);
      });
      if (this.expandAllBtn && this.collapseAllBtn) {
        this.expandAllBtn.addEventListener('click', this.expandAllEvent, false);
        this.collapseAllBtn.addEventListener('click', this.collapseAllEvent, false);
      }
    }
    getTargetContent(element) {
      const currentIndex = this.buttons.indexOf(element);
      return this.content[currentIndex];
    }
    setAccordionState(element, state) {
      const targetContent = this.getTargetContent(element);
      if (state === 'open') {
        element.classList.add('active');
        element.setAttribute('aria-expanded', 'true');
        targetContent.hidden = false;
      } else if (state === 'close') {
        element.classList.remove('active');
        element.setAttribute('aria-expanded', 'false');
        targetContent.hidden = 'until-found';
      }
    }
    toggle(event) {
      const {
        currentTarget
      } = event;
      const targetContent = this.getTargetContent(currentTarget);
      if (targetContent) {
        const isHidden = targetContent.hidden;
        if (isHidden === true || isHidden === 'until-found') {
          this.setAccordionState(currentTarget, 'open');
        } else {
          this.setAccordionState(currentTarget, 'close');
        }
        if (this.expandAllBtn && this.collapseAllBtn) {
          this.expandAllBtn.disabled = this.content.every(item => item.hidden === false);
          this.collapseAllBtn.disabled = this.content.every(item => item.hidden === 'until-found');
        }
      }
    }
    expandAll() {
      this.buttons.forEach(element => {
        this.setAccordionState(element, 'open');
      });
      this.expandAllBtn.disabled = true;
      this.collapseAllBtn.disabled = false;
    }
    collapseAll() {
      this.buttons.forEach(element => {
        this.setAccordionState(element, 'close');
      });
      this.expandAllBtn.disabled = false;
      this.collapseAllBtn.disabled = true;
    }
  }

  class BackTop {
    constructor(element) {
      this.element = element;
      this.dataElement = this.element.getAttribute('data-element');
      this.scrollOffset = this.element.getAttribute('data-offset');
      this.text = false;
      this.icon = false;
      this.scrollElement = this.dataElement ? document.querySelector(this.dataElement) : window;
      this.scrollPosition = 0;
      this.width = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
      this.height = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
      this.condition = false;
    }
    init() {
      this.createButton();
      this.element.addEventListener('click', event => {
        event.preventDefault();
        if (!window.requestAnimationFrame) {
          this.scrollElement.scrollTo(0, 0);
        } else if (this.dataElement) {
          this.scrollElement.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        } else {
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        }
      });
      this.checkBackToTop();
      const debounceEvent = this.debounce(this.checkBackToTop);
      this.scrollElement.addEventListener('scroll', () => {
        debounceEvent();
      });
      const debounceResize = this.debounce(this.resizeHandler);
      window.addEventListener('resize', () => {
        debounceResize();
      });
    }
    createButton() {
      const textSpan = this.constructor.createElement('span');
      const iconSpan = this.constructor.createElement('span', ['material-icons', 'nsw-material-icons'], {
        title: 'Back to top',
        focusable: 'false',
        'aria-hidden': 'true'
      });
      this.element.append(textSpan, iconSpan);
      this.text = this.element.querySelector('span:not(.material-icons)');
      this.icon = this.element.querySelector('span.material-icons');
      this.createButtonContent();
    }
    createButtonContent() {
      if (this.width < 768) {
        this.text.innerText = 'Top';
        this.icon.innerText = 'keyboard_arrow_up';
      } else {
        this.text.innerText = 'Back to top';
        this.icon.innerText = 'north';
      }
    }
    checkBackToTop() {
      let windowTop = this.scrollElement.scrollTop || document.documentElement.scrollTop;
      if (!this.dataElement) windowTop = window.scrollY || document.documentElement.scrollTop;
      const scroll = this.scrollPosition;
      this.scrollPosition = window.scrollY;
      if (this.scrollOffset && this.scrollOffset > 0) {
        this.condition = windowTop >= this.scrollOffset;
        this.element.classList.toggle('active', this.condition);
      } else {
        this.condition = scroll > this.scrollPosition && this.scrollPosition > 200;
        this.element.classList.toggle('active', this.condition);
      }
    }
    resizeHandler() {
      const oldWidth = this.width;
      const oldHeight = this.height;
      this.width = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
      this.height = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
      if (oldWidth !== this.width && oldHeight === this.height) {
        this.createButtonContent();
      }
    }
    debounce(fn) {
      var _this = this;
      let wait = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 250;
      let timeout;
      return function () {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }
        const context = _this;
        if (!window.requestAnimationFrame) {
          clearTimeout(timeout);
          timeout = setTimeout(() => fn.apply(context, args), wait);
        } else {
          if (timeout) {
            window.cancelAnimationFrame(timeout);
          }
          timeout = window.requestAnimationFrame(() => {
            fn.apply(context, args);
          });
        }
      };
    }
    static createElement(tag) {
      let classes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      let attributes = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      const element = document.createElement(tag);
      if (classes.length > 0) {
        element.classList.add(...classes);
      }
      Object.entries(attributes).forEach(_ref => {
        let [key, value] = _ref;
        element.setAttribute(key, value);
      });
      return element;
    }
  }

  /* eslint-disable max-len */
  class DatePicker {
    constructor(element) {
      this.element = element;
      this.prefix = 'nsw-';
      this.class = 'date-picker';
      this.uID = uniqueId('calendar-label');
      this.dateClass = `${this.prefix}${this.class}__date`;
      this.todayClass = `${this.dateClass}--today`;
      this.selectedClass = `${this.dateClass}--selected`;
      this.keyboardFocusClass = `${this.dateClass}--keyboard-focus`;
      this.visibleClass = `${this.prefix}${this.class}--is-visible`;
      this.months = this.element.getAttribute('data-months') ? this.element.getAttribute('data-months') : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      this.dateFormat = this.element.getAttribute('data-date-format') ? this.element.getAttribute('data-date-format') : 'd-m-y';
      this.dateSeparator = this.element.getAttribute('data-date-separator') ? this.element.getAttribute('data-date-separator') : '/';
      this.datesDisabled = this.element.getAttribute('data-dates-disabled') ? this.element.getAttribute('data-dates-disabled') : '';
      this.minDate = this.element.getAttribute('data-min-date') ? this.element.getAttribute('data-min-date') : '';
      this.maxDate = this.element.getAttribute('data-max-date') ? this.element.getAttribute('data-max-date') : '';
      this.input = this.element.querySelector('.js-date-input__text');
      this.trigger = this.element.querySelector('.js-date-input__trigger');
      this.triggerLabel = this.trigger && this.trigger.getAttribute('aria-label') ? this.trigger.getAttribute('aria-label') : 'Select a date';
      this.datePicker = this.element.querySelector('.js-date-picker');
      this.body = this.datePicker && this.datePicker.querySelector('.js-date-picker__dates');
      this.navigation = this.datePicker && this.datePicker.querySelector('.js-date-picker__title-nav');
      this.heading = this.datePicker && this.datePicker.querySelector('.js-date-picker__title-label');
      this.close = this.datePicker && this.datePicker.querySelector('.js-date-picker__close');
      this.accept = this.datePicker && this.datePicker.querySelector('.js-date-picker__accept');
      this.multipleInput = this.element.querySelector('.js-date-input-multiple');
      this.dateInput = this.multipleInput && this.multipleInput.querySelector('.js-date-picker-date');
      this.monthInput = this.multipleInput && this.multipleInput.querySelector('.js-date-picker-month');
      this.yearInput = this.multipleInput && this.multipleInput.querySelector('.js-date-picker-year');
      this.multiDateArray = [this.dateInput, this.monthInput, this.yearInput];
      this.dateIndexes = this.getDateIndexes();
      this.pickerVisible = false;
      this.dateSelected = false;
      this.selectedDay = false;
      this.selectedMonth = false;
      this.selectedYear = false;
      this.firstFocusable = false;
      this.lastFocusable = false;
      this.disabledArray = false;
    }
    init() {
      if (!this.input && !this.multipleInput) return;
      if (!this.datePicker) {
        this.initCreateCalendar();
      }
      this.disabledDates();
      this.resetCalendar();
      this.initCalendarAria();
      this.initCalendarEvents();
      this.placeCalendar();
    }
    initCreateCalendar() {
      const calendar = `
    <div class="nsw-date-picker js-date-picker" role="dialog" aria-labelledby="${this.uID}">
      <header class="nsw-date-picker__header">
        <div class="nsw-date-picker__title">
          <span class="nsw-date-picker__title-label js-date-picker__title-label" id="${this.uID}"></span>

          <nav>
            <ul class="nsw-date-picker__title-nav js-date-picker__title-nav">
              <li>
                <button class="nsw-icon-button nsw-date-picker__title-nav-btn js-date-picker__year-nav-btn js-date-picker__year-nav-btn--prev" type="button">
                  <span class="material-icons nsw-material-icons">keyboard_double_arrow_left</span>
                </button>
                <button class="nsw-icon-button nsw-date-picker__title-nav-btn js-date-picker__month-nav-btn js-date-picker__month-nav-btn--prev" type="button">
                  <span class="material-icons nsw-material-icons">chevron_left</span>
                </button>
              </li>

              <li>
                <button class="nsw-icon-button nsw-date-picker__title-nav-btn js-date-picker__month-nav-btn js-date-picker__month-nav-btn--next" type="button">
                  <span class="material-icons nsw-material-icons">chevron_right</span>
                </button>
                <button class="nsw-icon-button nsw-date-picker__title-nav-btn js-date-picker__year-nav-btn js-date-picker__year-nav-btn--next" type="button">
                  <span class="material-icons nsw-material-icons">keyboard_double_arrow_right</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>

        <ol class="nsw-date-picker__week">
          <li><div class="nsw-date-picker__day">M<span class="sr-only">onday</span></div></li>
          <li><div class="nsw-date-picker__day">T<span class="sr-only">uesday</span></div></li>
          <li><div class="nsw-date-picker__day">W<span class="sr-only">ednesday</span></div></li>
          <li><div class="nsw-date-picker__day">T<span class="sr-only">hursday</span></div></li>
          <li><div class="nsw-date-picker__day">F<span class="sr-only">riday</span></div></li>
          <li><div class="nsw-date-picker__day">S<span class="sr-only">aturday</span></div></li>
          <li><div class="nsw-date-picker__day">S<span class="sr-only">unday</span></div></li>
        </ol>
      </header>

      <ol class="nsw-date-picker__dates js-date-picker__dates" aria-labelledby="${this.uID}">
        
      </ol>

      <div class="nsw-date-picker__buttongroup">
        <button type="button" class="nsw-button nsw-button--dark-outline-solid js-date-picker__close" value="cancel">Cancel</button>
        <button type="button" class="nsw-button nsw-button--dark js-date-picker__accept" value="ok">OK</button>
      </div>
    </div>`;
      this.element.insertAdjacentHTML('beforeend', calendar);
      this.datePicker = this.element.querySelector('.js-date-picker');
      this.body = this.datePicker.querySelector('.js-date-picker__dates');
      this.navigation = this.datePicker.querySelector('.js-date-picker__title-nav');
      this.heading = this.datePicker.querySelector('.js-date-picker__title-label');
      this.close = this.datePicker.querySelector('.js-date-picker__close');
      this.accept = this.datePicker.querySelector('.js-date-picker__accept');
    }
    initCalendarAria() {
      this.resetLabelCalendarTrigger();
      const srLiveReagion = document.createElement('div');
      srLiveReagion.setAttribute('aria-live', 'polite');
      srLiveReagion.classList.add('sr-only', 'js-date-input__sr-live');
      this.element.appendChild(srLiveReagion);
      this.srLiveReagion = this.element.querySelector('.js-date-input__sr-live');
    }
    initCalendarEvents() {
      if (this.input) {
        this.input.addEventListener('focus', () => {
          this.toggleCalendar(true);
        });
      }
      if (this.multipleInput) {
        this.multiDateArray.forEach(element => {
          element.addEventListener('focus', () => {
            this.hideCalendar();
          });
        });
      }
      if (this.trigger) {
        this.trigger.addEventListener('click', event => {
          event.preventDefault();
          this.pickerVisible = false;
          this.toggleCalendar();
          this.trigger.setAttribute('aria-expanded', 'true');
        });
      }
      if (this.close) {
        this.close.addEventListener('click', event => {
          event.preventDefault();
          this.hideCalendar();
        });
      }
      if (this.accept) {
        this.accept.addEventListener('click', event => {
          event.preventDefault();
          const day = this.body.querySelector('button[tabindex="0"]');
          if (day) {
            this.dateSelected = true;
            this.selectedDay = day.innerText;
            this.selectedMonth = this.currentMonth;
            this.selectedYear = this.currentYear;
            this.setInputValue();
            if (this.input) {
              this.input.focus();
            } else if (this.multipleInput) {
              this.trigger.focus();
              this.hideCalendar();
            }
            this.resetLabelCalendarTrigger();
          }
        });
      }
      this.body.addEventListener('click', event => {
        event.preventDefault();
        const day = event.target.closest('button');
        if (day) {
          this.dateSelected = true;
          this.selectedDay = day.innerText;
          this.selectedMonth = this.currentMonth;
          this.selectedYear = this.currentYear;
          this.setInputValue();
          if (this.input) {
            this.input.focus();
          } else if (this.multipleInput) {
            this.trigger.focus();
            this.hideCalendar();
          }
          this.resetLabelCalendarTrigger();
        }
      });
      this.navigation.addEventListener('click', event => {
        event.preventDefault();
        const monthBtn = event.target.closest('.js-date-picker__month-nav-btn');
        const yearBtn = event.target.closest('.js-date-picker__year-nav-btn');
        if (monthBtn && monthBtn.classList.contains('js-date-picker__month-nav-btn--prev')) {
          this.showPrevMonth(true);
        } else if (monthBtn && monthBtn.classList.contains('js-date-picker__month-nav-btn--next')) {
          this.showNextMonth(true);
        } else if (yearBtn && yearBtn.classList.contains('js-date-picker__year-nav-btn--prev')) {
          this.showPrevYear(true);
        } else if (yearBtn && yearBtn.classList.contains('js-date-picker__year-nav-btn--next')) {
          this.showNextYear(true);
        }
      });
      window.addEventListener('keydown', event => {
        if (event.code && event.code === 27 || event.key && event.key.toLowerCase() === 'escape') {
          if (document.activeElement.closest('.js-date-picker')) {
            const activeInput = document.activeElement.closest('.js-date-input').querySelector('input');
            activeInput.focus();
          } else {
            this.hideCalendar();
          }
        }
      });
      window.addEventListener('click', event => {
        if (!event.target.closest('.js-date-picker') && !event.target.closest('.js-date-input') && this.pickerVisible) {
          this.hideCalendar();
        }
      });
      this.body.addEventListener('keydown', event => {
        let day = this.currentDay;
        if (event.code && event.code === 40 || event.key && event.key.toLowerCase() === 'arrowdown') {
          day += 7;
          this.resetDayValue(day);
        } else if (event.code && event.code === 39 || event.key && event.key.toLowerCase() === 'arrowright') {
          day += 1;
          this.resetDayValue(day);
        } else if (event.code && event.code === 37 || event.key && event.key.toLowerCase() === 'arrowleft') {
          day -= 1;
          this.resetDayValue(day);
        } else if (event.code && event.code === 38 || event.key && event.key.toLowerCase() === 'arrowup') {
          day -= 7;
          this.resetDayValue(day);
        } else if (event.code && event.code === 35 || event.key && event.key.toLowerCase() === 'end') {
          event.preventDefault();
          day = day + 6 - this.getDayOfWeek(this.currentYear, this.currentMonth, day);
          this.resetDayValue(day);
        } else if (event.code && event.code === 36 || event.key && event.key.toLowerCase() === 'home') {
          event.preventDefault();
          day -= this.getDayOfWeek(this.currentYear, this.currentMonth, day);
          this.resetDayValue(day);
        } else if (event.code && event.code === 34 || event.key && event.key.toLowerCase() === 'pagedown') {
          event.preventDefault();
          this.showNextMonth();
        } else if (event.code && event.code === 33 || event.key && event.key.toLowerCase() === 'pageup') {
          event.preventDefault();
          this.showPrevMonth();
        }
      });
      this.datePicker.addEventListener('keydown', event => {
        if (event.code && event.code === 9 || event.key && event.key === 'Tab') {
          this.trapFocus(event);
        }
      });
      if (this.input) {
        this.input.addEventListener('keydown', event => {
          if (event.code && event.code === 13 || event.key && event.key.toLowerCase() === 'enter') {
            this.resetCalendar();
            this.resetLabelCalendarTrigger();
            this.hideCalendar();
          } else if (event.code && event.code === 40 || event.key && event.key.toLowerCase() === 'arrowdown' && this.pickerVisible) {
            this.body.querySelector('button[tabindex="0"]').focus();
          }
        });
      }
      if (this.multipleInput) {
        this.multiDateArray.forEach(element => {
          element.addEventListener('keydown', event => {
            if (event.code && event.code === 13 || event.key && event.key.toLowerCase() === 'enter') {
              this.resetCalendar();
              this.resetLabelCalendarTrigger();
              this.hideCalendar();
            } else if (event.code && event.code === 40 || event.key && event.key.toLowerCase() === 'arrowdown' && this.pickerVisible) {
              this.body.querySelector('button[tabindex="0"]').focus();
            }
          });
        });
      }
    }
    getCurrentDay(date) {
      return date ? this.getDayFromDate(date) : new Date().getDate();
    }
    getCurrentMonth(date) {
      return date ? this.getMonthFromDate(date) : new Date().getMonth();
    }
    getCurrentYear(date) {
      return date ? this.getYearFromDate(date) : new Date().getFullYear();
    }
    getDayFromDate(date) {
      const day = parseInt(date.split('-')[2], 10);
      return Number.isNaN(day) ? this.getCurrentDay(false) : day;
    }
    getMonthFromDate(date) {
      const month = parseInt(date.split('-')[1], 10) - 1;
      return Number.isNaN(month) ? this.getCurrentMonth(false) : month;
    }
    getYearFromDate(date) {
      const year = parseInt(date.split('-')[0], 10);
      return Number.isNaN(year) ? this.getCurrentYear(false) : year;
    }
    showNextMonth(bool) {
      this.currentYear = this.currentMonth === 11 ? this.currentYear + 1 : this.currentYear;
      this.currentMonth = (this.currentMonth + 1) % 12;
      this.currentDay = this.checkDayInMonth();
      this.showCalendar(bool);
      this.srLiveReagion.textContent = `${this.months[this.currentMonth]} ${this.currentYear}`;
    }
    showPrevMonth(bool) {
      this.currentYear = this.currentMonth === 0 ? this.currentYear - 1 : this.currentYear;
      this.currentMonth = this.currentMonth === 0 ? 11 : this.currentMonth - 1;
      this.currentDay = this.checkDayInMonth();
      this.showCalendar(bool);
      this.srLiveReagion.textContent = `${this.months[this.currentMonth]} ${this.currentYear}`;
    }
    showNextYear(bool) {
      this.currentYear += 1;
      this.currentMonth %= 12;
      this.currentDay = this.checkDayInMonth();
      this.showCalendar(bool);
      this.srLiveReagion.textContent = `${this.months[this.currentMonth]} ${this.currentYear}`;
    }
    showPrevYear(bool) {
      this.currentYear -= 1;
      this.currentMonth %= 12;
      this.currentDay = this.checkDayInMonth();
      this.showCalendar(bool);
      this.srLiveReagion.textContent = `${this.months[this.currentMonth]} ${this.currentYear}`;
    }
    checkDayInMonth() {
      return this.currentDay > this.constructor.daysInMonth(this.currentYear, this.currentMonth) ? 1 : this.currentDay;
    }
    static daysInMonth(year, month) {
      return 32 - new Date(year, month, 32).getDate();
    }
    resetCalendar() {
      let currentDate = false;
      let selectedDate;
      if (this.input) {
        selectedDate = this.input.value;
      } else if (this.multipleInput) {
        if (this.dateInput.value !== '' && this.monthInput.value !== '' && this.yearInput.value !== '') {
          selectedDate = `${this.dateInput.value}/${this.monthInput.value}/${this.yearInput.value}`;
        } else {
          selectedDate = '';
        }
      }
      this.dateSelected = false;
      if (selectedDate !== '') {
        const date = this.getDateFromInput();
        this.dateSelected = true;
        currentDate = date;
      }
      this.currentDay = this.getCurrentDay(currentDate);
      this.currentMonth = this.getCurrentMonth(currentDate);
      this.currentYear = this.getCurrentYear(currentDate);
      this.selectedDay = this.dateSelected ? this.currentDay : false;
      this.selectedMonth = this.dateSelected ? this.currentMonth : false;
      this.selectedYear = this.dateSelected ? this.currentYear : false;
    }
    disabledDates() {
      this.disabledArray = [];
      if (this.datesDisabled) {
        const disabledDates = this.datesDisabled.split(' ');
        disabledDates.forEach(element => {
          this.disabledArray.push(element);
        });
      }
    }
    convertDateToParse(date) {
      const dateArray = date.split(this.dateSeparator);
      return `${dateArray[this.dateIndexes[2]]}, ${dateArray[this.dateIndexes[1]]}, ${dateArray[this.dateIndexes[0]]}`;
    }
    isDisabledDate(day, month, year) {
      let disabled = false;
      const dateParse = new Date(year, month, day);
      const minDate = new Date(this.convertDateToParse(this.minDate));
      const maxDate = new Date(this.convertDateToParse(this.maxDate));
      if (this.minDate && minDate > dateParse) {
        disabled = true;
      }
      if (this.maxDate && maxDate < dateParse) {
        disabled = true;
      }
      if (this.disabledArray.length > 0) {
        this.disabledArray.forEach(element => {
          const disabledDate = new Date(this.convertDateToParse(element));
          if (dateParse.getTime() === disabledDate.getTime()) {
            disabled = true;
          }
        });
      }
      return disabled;
    }
    showCalendar(bool) {
      const firstDay = this.constructor.getDayOfWeek(this.currentYear, this.currentMonth, '01');
      this.body.innerHTML = '';
      this.heading.innerHTML = `${this.months[this.currentMonth]} ${this.currentYear}`;
      let date = 1;
      let calendar = '';
      for (let i = 0; i < 6; i += 1) {
        for (let j = 0; j < 7; j += 1) {
          if (i === 0 && j < firstDay) {
            calendar += '<li></li>';
          } else if (date > this.constructor.daysInMonth(this.currentYear, this.currentMonth)) {
            break;
          } else {
            let classListDate = '';
            let tabindexValue = '-1';
            let disabled;
            if (date === this.currentDay) {
              tabindexValue = '0';
            }
            if (this.getCurrentMonth() === this.currentMonth && this.getCurrentYear() === this.currentYear && date === this.getCurrentDay()) {
              classListDate += ` ${this.todayClass}`;
            }
            if (this.isDisabledDate(date, this.currentMonth, this.currentYear)) {
              classListDate += ` ${this.dateClass}--disabled`;
              disabled = 'aria-disabled="true"';
            }
            if (this.dateSelected && date === this.selectedDay && this.currentYear === this.selectedYear && this.currentMonth === this.selectedMonth) {
              classListDate += ` ${this.selectedClass}`;
            }
            calendar = `${calendar}<li><button class="${this.dateClass}${classListDate}" tabindex="${tabindexValue}" type="button" ${disabled || ''}>${date}</button></li>`;
            date += 1;
          }
        }
      }
      this.body.innerHTML = calendar;
      if (!this.pickerVisible) this.datePicker.classList.add(this.visibleClass);
      this.pickerVisible = true;
      if (!bool) this.body.querySelector('button[tabindex="0"]').focus();
      this.getFocusableElements();
      this.placeCalendar();
    }
    hideCalendar() {
      this.datePicker.classList.remove(this.visibleClass);
      this.pickerVisible = false;
      this.firstFocusable = false;
      this.lastFocusable = false;
      if (this.trigger) this.trigger.setAttribute('aria-expanded', 'false');
    }
    toggleCalendar(bool) {
      if (!this.pickerVisible) {
        this.resetCalendar();
        this.showCalendar(bool);
      } else {
        this.hideCalendar();
      }
    }
    static getDayOfWeek(year, month, day) {
      let weekDay = new Date(year, month, day).getDay() - 1;
      if (weekDay < 0) weekDay = 6;
      return weekDay;
    }
    getDateIndexes() {
      const dateFormat = this.dateFormat.toLowerCase().replace(/-/g, '');
      return [dateFormat.indexOf('d'), dateFormat.indexOf('m'), dateFormat.indexOf('y')];
    }
    setInputValue() {
      if (this.input) {
        this.input.value = this.getDateForInput(this.selectedDay, this.selectedMonth, this.selectedYear);
      } else if (this.multipleInput) {
        this.dateInput.value = this.constructor.getReadableDate(this.selectedDay);
        this.monthInput.value = this.constructor.getReadableDate(this.selectedMonth + 1);
        this.yearInput.value = this.selectedYear;
      }
    }
    getDateForInput(day, month, year) {
      const dateArray = [];
      dateArray[this.dateIndexes[0]] = this.constructor.getReadableDate(day);
      dateArray[this.dateIndexes[1]] = this.constructor.getReadableDate(month + 1);
      dateArray[this.dateIndexes[2]] = year;
      return dateArray[0] + this.dateSeparator + dateArray[1] + this.dateSeparator + dateArray[2];
    }
    getDateFromInput() {
      let dateArray;
      if (this.input) {
        dateArray = this.input.value.split(this.dateSeparator);
      } else if (this.multipleInput) {
        dateArray = [this.dateInput.value, this.monthInput.value, this.yearInput.value];
      }
      return `${dateArray[this.dateIndexes[2]]}-${dateArray[this.dateIndexes[1]]}-${dateArray[this.dateIndexes[0]]}`;
    }
    static getReadableDate(date) {
      return date < 10 ? `0${date}` : date;
    }
    resetDayValue(day) {
      const totDays = this.constructor.daysInMonth(this.currentYear, this.currentMonth);
      if (day > totDays) {
        this.currentDay = day - totDays;
        this.showNextMonth(false);
      } else if (day < 1) {
        const newMonth = this.currentMonth === 0 ? 11 : this.currentMonth - 1;
        this.currentDay = this.constructor.daysInMonth(this.currentYear, newMonth) + day;
        this.showPrevMonth(false);
      } else {
        this.currentDay = day;
        const focusItem = this.body.querySelector('button[tabindex="0"]');
        focusItem.setAttribute('tabindex', '-1');
        focusItem.classList.remove(this.keyboardFocusClass);
        const buttons = this.body.getElementsByTagName('button');
        for (let i = 0; i < buttons.length; i += 1) {
          if (parseInt(buttons[i].textContent, 10) === this.currentDay) {
            buttons[i].setAttribute('tabindex', '0');
            buttons[i].classList.add(this.keyboardFocusClass);
            buttons[i].focus();
            break;
          }
        }
        this.getFocusableElements();
      }
    }
    resetLabelCalendarTrigger() {
      if (!this.trigger) return;
      if (this.selectedYear && this.selectedMonth !== false && this.selectedDay) {
        this.trigger.setAttribute('aria-label', `Selected date is ${new Date(this.selectedYear, this.selectedMonth, this.selectedDay).toDateString()}`);
      } else {
        this.trigger.setAttribute('aria-label', this.triggerLabel);
      }
    }
    getFocusableElements() {
      const allFocusable = this.datePicker.querySelectorAll('[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary');
      this.getFirstFocusable(allFocusable);
      this.getLastFocusable(allFocusable);
    }
    getFirstFocusable(elements) {
      for (let i = 0; i < elements.length; i += 1) {
        if ((elements[i].offsetWidth || elements[i].offsetHeight || elements[i].getClientRects().length) && elements[i].getAttribute('tabindex') !== '-1') {
          this.firstFocusable = elements[i];
          return true;
        }
      }
      return false;
    }
    getLastFocusable(elements) {
      for (let i = elements.length - 1; i >= 0; i -= 1) {
        if ((elements[i].offsetWidth || elements[i].offsetHeight || elements[i].getClientRects().length) && elements[i].getAttribute('tabindex') !== '-1') {
          this.lastFocusable = elements[i];
          return true;
        }
      }
      return false;
    }
    trapFocus(event) {
      if (this.firstFocusable === document.activeElement && event.shiftKey) {
        event.preventDefault();
        this.lastFocusable.focus();
      }
      if (this.lastFocusable === document.activeElement && !event.shiftKey) {
        event.preventDefault();
        this.firstFocusable.focus();
      }
    }
    placeCalendar() {
      this.datePicker.style.left = '0px';
      this.datePicker.style.right = 'auto';
      const pickerBoundingRect = this.datePicker.getBoundingClientRect();
      if (pickerBoundingRect.right > window.innerWidth) {
        this.datePicker.style.left = 'auto';
        this.datePicker.style.right = '0px';
      }
    }
  }

  function getSign(x) {
    if (!Math.sign) {
      return (x > 0) - (x < 0) || +x;
    }
    return Math.sign(x);
  }
  class SwipeContent {
    constructor(element) {
      this.element = element;
      this.delta = [false, false];
      this.dragging = false;
      this.intervalId = false;
      this.changedTouches = false;
    }
    init() {
      this.element.addEventListener('mousedown', this.handleEvent.bind(this));
      this.element.addEventListener('touchstart', this.handleEvent.bind(this), {
        passive: true
      });
    }
    initDragging() {
      this.element.addEventListener('mousemove', this.handleEvent.bind(this));
      this.element.addEventListener('touchmove', this.handleEvent.bind(this), {
        passive: true
      });
      this.element.addEventListener('mouseup', this.handleEvent.bind(this));
      this.element.addEventListener('mouseleave', this.handleEvent.bind(this));
      this.element.addEventListener('touchend', this.handleEvent.bind(this));
    }
    cancelDragging() {
      if (this.intervalId) {
        if (!window.requestAnimationFrame) {
          clearInterval(this.intervalId);
        } else {
          window.cancelAnimationFrame(this.intervalId);
        }
        this.intervalId = false;
      }
      this.element.removeEventListener('mousemove', this.handleEvent.bind(this));
      this.element.removeEventListener('touchmove', this.handleEvent.bind(this));
      this.element.removeEventListener('mouseup', this.handleEvent.bind(this));
      this.element.removeEventListener('mouseleave', this.handleEvent.bind(this));
      this.element.removeEventListener('touchend', this.handleEvent.bind(this));
    }
    handleEvent(event) {
      switch (event.type) {
        case 'mousedown':
        case 'touchstart':
          this.startDrag(event);
          break;
        case 'mousemove':
        case 'touchmove':
          this.drag(event);
          break;
        case 'mouseup':
        case 'mouseleave':
        case 'touchend':
          this.endDrag(event);
          break;
        default:
          console.log(`${event.type}.`);
      }
    }
    startDrag(event) {
      this.dragging = true;
      this.initDragging();
      this.delta = [parseInt(this.unify(event).clientX, 10), parseInt(this.unify(event).clientY, 10)];
      this.emitSwipeEvents('dragStart', this.delta, event.target);
    }
    endDrag(event) {
      this.cancelDragging();
      const dx = parseInt(this.unify(event).clientX, 10);
      const dy = parseInt(this.unify(event).clientY, 10);
      if (this.delta && (this.delta[0] || this.delta[0] === 0)) {
        const s = getSign(dx - this.delta[0]);
        if (Math.abs(dx - this.delta[0]) > 30) {
          if (s < 0) {
            this.emitSwipeEvents('swipeLeft', [dx, dy]);
          } else {
            this.emitSwipeEvents('swipeRight', [dx, dy]);
          }
        }
        this.delta[0] = false;
      }
      if (this.delta && (this.delta[1] || this.delta[1] === 0)) {
        const y = getSign(dy - this.delta[1]);
        if (Math.abs(dy - this.delta[1]) > 30) {
          if (y < 0) {
            this.emitSwipeEvents('swipeUp', [dx, dy]);
          } else {
            this.emitSwipeEvents('swipeDown', [dx, dy]);
          }
        }
        this.delta[1] = false;
      }
      this.emitSwipeEvents('dragEnd', [dx, dy]);
      this.dragging = false;
    }
    drag(event) {
      if (!this.dragging) return;
      if (!window.requestAnimationFrame) {
        this.intervalId = setTimeout(() => {
          this.emitDrag(event);
        }, 250);
      } else {
        this.intervalId = window.requestAnimationFrame(() => {
          this.emitDrag(event);
        });
      }
    }
    unify(event) {
      this.changedTouches = event.changedTouches;
      return this.changedTouches ? this.changedTouches[0] : event;
    }
    emitDrag(event) {
      this.emitSwipeEvents('dragging', [parseInt(this.unify(event).clientX, 10), parseInt(this.unify(event).clientY, 10)]);
    }
    emitSwipeEvents(eventName, detail, el) {
      let trigger = false;
      if (el) trigger = el;
      const event = new CustomEvent(eventName, {
        detail: {
          x: detail[0],
          y: detail[1],
          origin: trigger
        }
      });
      this.element.dispatchEvent(event);
    }
  }

  /* eslint-disable max-len */
  class Carousel extends SwipeContent {
    constructor(element) {
      super(element);
      this.element = element;
      this.containerClass = 'nsw-carousel-container';
      this.controlClass = 'js-carousel__control';
      this.wrapperClass = 'js-carousel__wrapper';
      this.counterClass = 'js-carousel__counter';
      this.counterTorClass = 'js-carousel__counter-tot';
      this.navClass = 'js-carousel__navigation';
      this.navItemClass = 'js-carousel__nav-item';
      this.navigationItemClass = this.element.getAttribute('data-navigation-item-class') ? this.element.getAttribute('data-navigation-item-class') : 'nsw-carousel__nav-item';
      this.navigationClass = this.element.getAttribute('data-navigation-class') ? this.element.getAttribute('data-navigation-class') : 'nsw-carousel__navigation';
      this.paginationClass = this.element.getAttribute('data-pagination-class') ? this.element.getAttribute('data-pagination-class') : 'nsw-carousel__navigation--pagination';
      this.draggingClass = 'nsw-carousel--is-dragging';
      this.loadedClass = 'nsw-carousel--loaded';
      this.animateClass = 'nsw-carousel__list--animating';
      this.cloneClass = 'js-clone';
      this.srClass = 'sr-only';
      this.srLiveAreaClass = 'js-carousel__aria-live';
      this.hideControlsClass = 'nsw-carousel--hide-controls';
      this.hideClass = 'nsw-display-none';
      this.centerClass = 'nsw-justify-content-center';
      this.listWrapper = this.element.querySelector(`.${this.wrapperClass}`);
      this.list = this.listWrapper ? this.listWrapper.querySelector('ol') : false;
      this.items = this.list ? this.list.getElementsByTagName('li') : false;
      this.controls = this.element.querySelectorAll(`.${this.controlClass}`);
      this.counter = this.element.querySelectorAll(`.${this.counterClass}`);
      this.counterTor = this.element.querySelectorAll(`.${this.counterTorClass}`);
      this.ariaLabel = this.element.getAttribute('data-description') ? this.element.getAttribute('data-description') : 'Card carousel';
      this.dragEnabled = !!(this.element.getAttribute('data-drag') && this.element.getAttribute('data-drag') === 'on');
      this.loop = !!(this.element.getAttribute('data-loop') && this.element.getAttribute('data-loop') === 'on');
      this.nav = !(this.element.getAttribute('data-navigation') && this.element.getAttribute('data-navigation') === 'off');
      this.navigationPagination = !!(this.element.getAttribute('data-navigation-pagination') && this.element.getAttribute('data-navigation-pagination') === 'on');
      this.justifyContent = !!(this.element.getAttribute('data-justify-content') && this.element.getAttribute('data-justify-content') === 'on');
      this.initItems = [];
      this.itemsNb = this.items.length;
      this.visibItemsNb = 1;
      this.itemsWidth = 1;
      this.itemOriginalWidth = false;
      this.selectedItem = 0;
      this.translateContainer = 0;
      this.containerWidth = 0;
      this.animating = false;
      this.dragStart = false;
      this.resizeId = false;
      this.cloneList = [];
      this.itemAutoSize = false;
      this.totTranslate = 0;
      if (this.nav) this.loop = false;
      this.flexSupported = CSS.supports('align-items', 'stretch');
      this.transitionSupported = CSS.supports('transition', 'transform');
      this.cssPropertiesSupported = 'CSS' in window && CSS.supports('color', 'var(--color-var)');
    }
    init() {
      if (!this.items) return;
      this.initCarouselLayout();
      this.setItemsWidth(true);
      this.insertBefore(this.visibItemsNb);
      this.updateCarouselClones();
      this.resetItemsTabIndex();
      this.initAriaLive();
      this.initCarouselEvents();
      this.initCarouselCounter();
    }
    initCarouselLayout() {
      this.element.classList.add(this.loadedClass);
      this.element.setAttribute('aria-roledescription', 'carousel');
      this.element.setAttribute('aria-label', this.ariaLabel);
      const itemsArray = Array.from(this.items);
      itemsArray.forEach((element, index) => {
        element.setAttribute('role', 'group');
        element.setAttribute('aria-roledescription', 'slide');
        element.setAttribute('aria-label', `${index + 1} of ${itemsArray.length}`);
        element.setAttribute('data-index', index);
      });
      this.carouselCreateContainer();
      const itemStyle = this.items && window.getComputedStyle(this.items[0]);
      const containerStyle = this.listWrapper && window.getComputedStyle(this.listWrapper);
      let itemWidth = itemStyle ? parseFloat(itemStyle.getPropertyValue('width')) : 0;
      const itemMargin = itemStyle ? parseFloat(itemStyle.getPropertyValue('margin-right')) : 0;
      const containerPadding = containerStyle ? parseFloat(containerStyle.getPropertyValue('padding-left')) : 0;
      let containerWidth = containerStyle ? parseFloat(containerStyle.getPropertyValue('width')) : 0;
      if (!this.itemAutoSize) {
        this.itemAutoSize = itemWidth;
      }
      containerWidth = this.getCarouselWidth(containerWidth);
      if (!this.itemOriginalWidth) {
        this.itemOriginalWidth = itemWidth;
      } else {
        itemWidth = this.itemOriginalWidth;
      }
      if (this.itemAutoSize) {
        this.itemOriginalWidth = parseInt(this.itemAutoSize, 10);
        itemWidth = this.itemOriginalWidth;
      }
      if (containerWidth < itemWidth) {
        this.itemOriginalWidth = containerWidth;
        itemWidth = this.itemOriginalWidth;
      }
      this.visibItemsNb = parseInt((containerWidth - 2 * containerPadding + itemMargin) / (itemWidth + itemMargin), 10);
      this.itemsWidth = parseFloat(((containerWidth - 2 * containerPadding + itemMargin) / this.visibItemsNb - itemMargin).toFixed(1));
      this.containerWidth = (this.itemsWidth + itemMargin) * this.items.length;
      this.translateContainer = 0 - (this.itemsWidth + itemMargin) * this.visibItemsNb;
      if (!this.flexSupported) this.list.style.width = `${(this.itemsWidth + itemMargin) * this.visibItemsNb * 3}px`;
      this.totTranslate = 0 - this.selectedItem * (this.itemsWidth + itemMargin);
      if (this.items.length <= this.visibItemsNb) this.totTranslate = 0;
      this.centerItems();
    }
    carouselCreateContainer() {
      if (!this.element.parentElement.classList.contains(this.containerClass)) {
        const el = document.createElement('div');
        el.classList.add(this.containerClass);
        this.element.parentNode.insertBefore(el, this.element);
        el.appendChild(this.element);
      }
    }
    setItemsWidth(bool) {
      for (let i = 0; i < this.items.length; i += 1) {
        this.items[i].style.width = `${this.itemsWidth}px`;
        if (bool) this.initItems.push(this.items[i]);
      }
    }
    updateCarouselClones() {
      if (!this.loop) return;
      if (this.items.length < this.visibItemsNb * 3) {
        this.insertAfter(this.visibItemsNb * 3 - this.items.length, this.items.length - this.visibItemsNb * 2);
      } else if (this.items.length > this.visibItemsNb * 3) {
        this.removeClones(this.visibItemsNb * 3, this.items.length - this.visibItemsNb * 3);
      }
      this.setTranslate(`translateX(${this.translateContainer}px)`);
    }
    initCarouselEvents() {
      if (this.nav) {
        this.carouselCreateNavigation();
        this.carouselInitNavigationEvents();
      }
      if (this.controls.length > 0) {
        this.controls[0].addEventListener('click', event => {
          event.preventDefault();
          this.showPrevItems();
          this.updateAriaLive();
        });
        this.controls[1].addEventListener('click', event => {
          event.preventDefault();
          this.showNextItems();
          this.updateAriaLive();
        });
        this.resetCarouselControls();
        this.emitCarouselActiveItemsEvent();
      }
      if (this.dragEnabled && window.requestAnimationFrame) {
        super.init();
        this.element.addEventListener('dragStart', event => {
          if (event.detail.origin && event.detail.origin.closest(`.${this.controlClass}`)) return;
          if (event.detail.origin && event.detail.origin.closest(`.${this.navClass}`)) return;
          if (event.detail.origin && !event.detail.origin.closest(`.${this.wrapperClass}`)) return;
          this.element.classList.add(this.draggingClass);
          this.dragStart = event.detail.x;
          this.animateDragEnd();
        });
        this.element.addEventListener('dragging', event => {
          if (!this.dragStart) return;
          if (this.animating || Math.abs(event.detail.x - this.dragStart) < 10) return;
          let translate = event.detail.x - this.dragStart + this.translateContainer;
          if (!this.loop) {
            translate = event.detail.x - this.dragStart + this.totTranslate;
          }
          this.setTranslate(`translateX(${translate}px)`);
        });
      }
      window.addEventListener('resize', () => {
        clearTimeout(this.resizeId);
        this.resizeId = setTimeout(() => {
          this.resetCarouselResize();
          this.resetDotsNavigation();
          this.resetCarouselControls();
          this.setCounterItem();
          this.centerItems();
          this.emitCarouselActiveItemsEvent();
        }, 250);
      });
      this.element.addEventListener('keydown', event => {
        if (event.key && event.key.toLowerCase() === 'arrowright') {
          this.showNextItems();
        } else if (event.key && event.key.toLowerCase() === 'arrowleft') {
          this.showPrevItems();
        } else if (event.key && event.key.toLowerCase() === 'home') {
          this.showPrevItems();
        } else if (event.key && event.key.toLowerCase() === 'end') {
          this.showNextItems();
        } else if (event.key && event.key.toLowerCase() === 'enter') {
          event.preventDefault();
          event.target.click();
        }
      });
      const itemLinks = this.element.querySelectorAll('.nsw-carousel__item a');
      if (itemLinks.length > 0) {
        itemLinks.forEach((link, index) => {
          link.addEventListener('focus', () => {
            const slider = link.closest('.js-carousel__wrapper');
            const carousel = slider.querySelector('.nsw-carousel__list');
            if (carousel) {
              link.focus({
                preventScroll: true
              });
            }
          });
          link.addEventListener('focusout', () => {
            const item = link.closest('.nsw-carousel__item');
            const dataIndex = Number(item.getAttribute('data-index')) + 1;
            if (dataIndex % this.visibItemsNb === 0 && dataIndex !== this.items.length) {
              itemLinks[index + 1].focus({
                preventScroll: true
              });
              this.showNextItems();
            }
          });
        });
      }
    }
    showPrevItems() {
      if (this.animating) return;
      this.animating = true;
      this.selectedItem = this.getIndex(this.selectedItem - this.visibItemsNb);
      this.animateList('0', 'prev');
    }
    showNextItems() {
      if (this.animating) return;
      this.animating = true;
      this.selectedItem = this.getIndex(this.selectedItem + this.visibItemsNb);
      this.animateList(`${this.translateContainer * 2}px`, 'next');
    }
    animateDragEnd() {
      const cb = event => {
        this.element.removeEventListener('dragEnd', cb);
        this.element.classList.remove(this.draggingClass);
        if (event.detail.x - this.dragStart < -40) {
          this.animating = false;
          this.showNextItems();
        } else if (event.detail.x - this.dragStart > 40) {
          this.animating = false;
          this.showPrevItems();
        } else if (event.detail.x - this.dragStart === 0) {
          return;
        } else {
          this.animating = true;
          this.animateList(`${this.translateContainer}px`, false);
        }
        this.dragStart = false;
      };
      this.element.addEventListener('dragEnd', cb);
    }
    animateList(translate, direction) {
      let trans = translate;
      this.list.classList.add(this.animateClass);
      const initTranslate = this.totTranslate;
      if (!this.loop) {
        trans = this.noLoopTranslateValue(direction);
      }
      setTimeout(() => {
        this.setTranslate(`translateX(${trans})`);
      });
      if (this.transitionSupported) {
        const cb = event => {
          if (event.propertyName && event.propertyName !== 'transform') return;
          if (this.list) {
            this.list.classList.remove(this.animateClass);
            this.list.removeEventListener('transitionend', cb);
          }
          this.animateListCb(direction);
        };
        this.list.addEventListener('transitionend', cb);
      } else {
        this.animateListCb(direction);
      }
      if (!this.loop && initTranslate === this.totTranslate) {
        this.list.dispatchEvent(new CustomEvent('transitionend'));
      }
      this.resetCarouselControls();
      this.setCounterItem();
      this.emitCarouselActiveItemsEvent();
    }
    noLoopTranslateValue(direction) {
      let translate = this.totTranslate;
      if (direction === 'next') {
        translate = this.totTranslate + this.translateContainer;
      } else if (direction === 'prev') {
        translate = this.totTranslate - this.translateContainer;
      } else if (direction === 'click') {
        translate = this.selectedDotIndex * this.translateContainer;
      }
      if (translate > 0) {
        translate = 0;
        this.selectedItem = 0;
      }
      if (translate < -this.translateContainer - this.containerWidth) {
        translate = -this.translateContainer - this.containerWidth;
        this.selectedItem = this.items.length - this.visibItemsNb;
      }
      if (this.visibItemsNb > this.items.length) translate = 0;
      this.totTranslate = translate;
      return `${translate}px`;
    }
    animateListCb(direction) {
      if (direction) this.updateClones(direction);
      this.animating = false;
      this.resetItemsTabIndex();
    }
    updateClones(direction) {
      if (!this.loop) return;
      const index = direction === 'next' ? 0 : this.items.length - this.visibItemsNb;
      this.removeClones(index, false);
      if (direction === 'next') {
        this.insertAfter(this.visibItemsNb, 0);
      } else {
        this.insertBefore(this.visibItemsNb);
      }
      this.setTranslate(`translateX(${this.translateContainer}px)`);
    }
    insertBefore(nb, delta) {
      if (!this.loop) return;
      const clones = document.createDocumentFragment();
      let start = 0;
      if (delta) start = delta;
      for (let i = start; i < nb; i += 1) {
        const index = this.getIndex(this.selectedItem - i - 1);
        const clone = this.initItems[index].cloneNode(true);
        clone.classList.add(this.cloneClass);
        clones.insertBefore(clone, clones.firstChild);
      }
      this.list.insertBefore(clones, this.list.firstChild);
      this.emitCarouselUpdateEvent();
    }
    insertAfter(nb, init) {
      if (!this.loop) return;
      const clones = document.createDocumentFragment();
      for (let i = init; i < nb + init; i += 1) {
        const index = this.getIndex(this.selectedItem + this.visibItemsNb + i);
        const clone = this.initItems[index].cloneNode(true);
        clone.classList.add(this.cloneClass);
        clones.appendChild(clone);
      }
      this.list.appendChild(clones);
      this.emitCarouselUpdateEvent();
    }
    removeClones(index, bool) {
      let newBool = bool;
      if (!this.loop) return;
      if (!bool) {
        newBool = this.visibItemsNb;
      }
      for (let i = 0; i < newBool; i += 1) {
        if (this.items[index]) this.list.removeChild(this.items[index]);
      }
    }
    resetCarouselResize() {
      const visibleItems = this.visibItemsNb;
      this.resetItemAutoSize();
      this.initCarouselLayout();
      this.setItemsWidth(false);
      this.resetItemsWidth();
      if (this.loop) {
        if (visibleItems > this.visibItemsNb) {
          this.removeClones(0, visibleItems - this.visibItemsNb);
        } else if (visibleItems < this.visibItemsNb) {
          this.insertBefore(this.visibItemsNb, visibleItems);
        }
        this.updateCarouselClones();
      } else {
        const translate = this.noLoopTranslateValue();
        this.setTranslate(`translateX(${translate})`);
      }
      this.resetItemsTabIndex();
    }
    resetItemAutoSize() {
      if (!this.cssPropertiesSupported) return;
      this.items[0].removeAttribute('style');
      this.itemAutoSize = getComputedStyle(this.items[0]).getPropertyValue('width');
    }
    resetItemsWidth() {
      this.initItems.forEach(element => {
        const el = element;
        el.style.width = `${this.itemsWidth}px`;
      });
    }
    resetItemsTabIndex() {
      const carouselActive = this.items.length > this.visibItemsNb;
      let j = this.items.length;
      for (let i = 0; i < this.items.length; i += 1) {
        if (this.loop) {
          if (i < this.visibItemsNb || i >= 2 * this.visibItemsNb) {
            this.items[i].setAttribute('tabindex', '-1');
            this.items[i].setAttribute('aria-hidden', 'true');
            this.items[i].removeAttribute('aria-current');
          } else {
            if (i < j) j = i;
            this.items[i].removeAttribute('tabindex');
            this.items[i].removeAttribute('aria-hidden');
            this.items[i].setAttribute('aria-current', 'true');
          }
        } else if ((i < this.selectedItem || i >= this.selectedItem + this.visibItemsNb) && carouselActive) {
          this.items[i].setAttribute('tabindex', '-1');
          this.items[i].setAttribute('aria-hidden', 'true');
          this.items[i].removeAttribute('aria-current');
        } else {
          if (i < j) j = i;
          this.items[i].removeAttribute('tabindex');
          this.items[i].removeAttribute('aria-hidden');
          this.items[i].setAttribute('aria-current', 'true');
        }
      }
      this.resetVisibilityOverflowItems(j);
    }
    initAriaLive() {
      const srLiveArea = document.createElement('div');
      srLiveArea.setAttribute('class', `${this.srClass} ${this.srLiveAreaClass}`);
      srLiveArea.setAttribute('aria-live', 'polite');
      srLiveArea.setAttribute('aria-atomic', 'true');
      this.element.appendChild(srLiveArea);
      this.ariaLive = srLiveArea;
    }
    updateAriaLive() {
      this.ariaLive.innerHTML = `Item ${this.selectedItem + 1} selected. ${this.visibItemsNb} items of ${this.initItems.length} visible`;
    }
    getIndex(index) {
      let i = index;
      if (i < 0) i = this.getPositiveValue(i, this.itemsNb);
      if (i >= this.itemsNb) i %= this.itemsNb;
      return i;
    }
    getPositiveValue(value, add) {
      let val = value;
      val += add;
      if (val > 0) return val;
      return this.getPositiveValue(val, add);
    }
    setTranslate(translate) {
      this.list.style.transform = translate;
      this.list.style.msTransform = translate;
    }
    getCarouselWidth(computedWidth) {
      let comWidth = computedWidth;
      const closestHidden = this.listWrapper.closest(`.${this.srClass}`);
      if (closestHidden) {
        closestHidden.classList.remove(this.srClass);
        comWidth = this.listWrapper.offsetWidth;
        closestHidden.classList.add(this.srClass);
      } else if (Number.isNaN(comWidth)) {
        comWidth = this.getHiddenParentWidth(this.element);
      }
      return comWidth;
    }
    getHiddenParentWidth(element) {
      const parent = element.parentElement;
      if (parent.tagName.toLowerCase() === 'html') return 0;
      const style = window.getComputedStyle(parent);
      if (style.display === 'none' || style.visibility === 'hidden') {
        parent.setAttribute('style', 'display: block!important; visibility: visible!important;');
        const computedWidth = this.listWrapper.offsetWidth;
        parent.style.display = '';
        parent.style.visibility = '';
        return computedWidth;
      }
      return this.getHiddenParentWidth(parent);
    }
    resetCarouselControls() {
      if (this.loop) return;
      if (this.controls.length > 0) {
        if (this.totTranslate === 0) {
          this.controls[0].setAttribute('disabled', true);
        } else {
          this.controls[0].removeAttribute('disabled');
        }
        if (this.totTranslate === -this.translateContainer - this.containerWidth || this.items.length <= this.visibItemsNb) {
          this.controls[1].setAttribute('disabled', true);
        } else {
          this.controls[1].removeAttribute('disabled');
        }
      }
      if (this.nav) {
        const selectedDot = this.navigation.querySelectorAll(`.${this.navigationItemClass}--selected`);
        if (selectedDot.length > 0) selectedDot[0].classList.remove(`${this.navigationItemClass}--selected`);
        let newSelectedIndex = this.getSelectedDot();
        if (this.totTranslate === -this.translateContainer - this.containerWidth) {
          newSelectedIndex = this.navDots.length - 1;
        }
        this.navDots[newSelectedIndex].classList.add(`${this.navigationItemClass}--selected`);
      }
      if (this.totTranslate === 0 && (this.totTranslate === -this.translateContainer - this.containerWidth || this.items.length <= this.visibItemsNb)) {
        this.element.classList.add(this.hideControlsClass);
      } else {
        this.element.classList.remove(this.hideControlsClass);
      }
    }
    emitCarouselUpdateEvent() {
      this.cloneList = [];
      const clones = this.element.querySelectorAll(`.${this.cloneClass}`);
      clones.forEach(element => {
        element.classList.remove(this.cloneClass);
        this.cloneList.push(element);
      });
      this.emitCarouselEvents('carousel-updated', this.cloneList);
    }
    carouselCreateNavigation() {
      if (this.element.querySelectorAll(`.${this.navClass}`).length > 0) return;
      const navigation = document.createElement('ol');
      let navChildren = '';
      let navClasses = '';
      if (this.navigationPagination) {
        navClasses = `${this.navigationClass} ${this.paginationClass} ${this.navClass}`;
      } else {
        navClasses = `${this.navigationClass} ${this.navClass}`;
      }
      if (this.items.length <= this.visibItemsNb) {
        navClasses += ` ${this.hideClass}`;
      }
      navigation.setAttribute('class', navClasses);
      const dotsNr = Math.ceil(this.items.length / this.visibItemsNb);
      const selectedDot = this.getSelectedDot();
      const indexClass = this.navigationPagination ? '' : this.srClass;
      for (let i = 0; i < dotsNr; i += 1) {
        const className = i === selectedDot ? `class="${this.navigationItemClass} ${this.navigationItemClass}--selected ${this.navItemClass}"` : `class="${this.navigationItemClass} ${this.navItemClass}"`;
        navChildren = `${navChildren}<li ${className}><button><span class="${indexClass}">${i + 1}</span></button></li>`;
      }
      navigation.innerHTML = navChildren;
      this.element.appendChild(navigation);
    }
    carouselInitNavigationEvents() {
      this.navigation = this.element.querySelector(`.${this.navClass}`);
      this.navDots = this.element.querySelectorAll(`.${this.navItemClass}`);
      this.navIdEvent = this.carouselNavigationClick.bind(this);
      this.navigation.addEventListener('click', this.navIdEvent);
    }
    carouselRemoveNavigation() {
      if (this.navigation) this.element.removeChild(this.navigation);
      if (this.navIdEvent) this.navigation.removeEventListener('click', this.navIdEvent);
    }
    resetDotsNavigation() {
      if (!this.nav) return;
      this.carouselRemoveNavigation();
      this.carouselCreateNavigation();
      this.carouselInitNavigationEvents();
    }
    carouselNavigationClick(event) {
      const dot = event.target.closest(`.${this.navItemClass}`);
      if (!dot) return;
      if (this.animating) return;
      this.animating = true;
      const index = Array.from(this.navDots).indexOf(dot);
      this.selectedDotIndex = index;
      this.selectedItem = index * this.visibItemsNb;
      this.animateList(false, 'click');
    }
    getSelectedDot() {
      return Math.ceil(this.selectedItem / this.visibItemsNb);
    }
    initCarouselCounter() {
      if (this.counterTor.length > 0) this.counterTor[0].textContent = this.itemsNb;
      this.setCounterItem();
    }
    setCounterItem() {
      if (this.counter.length === 0) return;
      let totalItems = this.selectedItem + this.visibItemsNb;
      if (totalItems > this.items.length) totalItems = this.items.length;
      this.counter[0].textContent = totalItems;
    }
    centerItems() {
      if (!this.justifyContent) return;
      this.list.classList.toggle(this.centerClass, this.items.length < this.visibItemsNb);
    }
    emitCarouselActiveItemsEvent() {
      this.emitCarouselEvents('carousel-active-items', {
        firstSelectedItem: this.selectedItem,
        visibleItemsNb: this.visibItemsNb
      });
    }
    emitCarouselEvents(eventName, eventDetail) {
      const event = new CustomEvent(eventName, {
        detail: eventDetail
      });
      this.element.dispatchEvent(event);
    }
    resetVisibilityOverflowItems(j) {
      const itemWidth = this.containerWidth / this.items.length;
      const delta = (window.innerWidth - itemWidth * this.visibItemsNb) / 2;
      const overflowItems = Math.ceil(delta / itemWidth);
      for (let i = 0; i < overflowItems; i += 1) {
        const indexPrev = j - 1 - i;
        if (indexPrev >= 0) this.items[indexPrev].removeAttribute('tabindex');
        const indexNext = j + this.visibItemsNb + i;
        if (indexNext < this.items.length) this.items[indexNext].removeAttribute('tabindex');
      }
    }
  }

  /* eslint-disable max-len */
  class Dialog {
    constructor(element) {
      this.element = element;
      this.elementWrapper = this.element.querySelector('.nsw-dialog__wrapper');
      this.openBtn = document.querySelectorAll(`.js-open-dialog-${this.element.getAttribute('id')}`);
      this.closeBtn = this.element.querySelectorAll('.js-close-dialog');
      this.focusableEls = this.element.querySelectorAll('a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled])');
      this.body = document.body;
      this.openEvent = this.openDialog.bind(this);
      this.closeEvent = this.closeDialog.bind(this);
      this.clickEvent = this.clickDialog.bind(this);
      this.trapEvent = this.trapFocus.bind(this);
    }
    init() {
      this.controls();
    }
    controls() {
      if (!this.elementWrapper) return;
      this.openBtn.forEach(btn => {
        btn.addEventListener('click', this.openEvent, false);
      });
      this.closeBtn.forEach(btn => {
        btn.addEventListener('click', this.closeEvent, false);
      });
      if (this.element.classList.contains('js-dialog-dismiss')) {
        this.element.addEventListener('click', this.clickEvent, false);
      }
      if (this.focusableEls.length > 0) {
        this.focusableEls[this.focusableEls.length - 1].addEventListener('blur', this.trapEvent, false);
      }
    }
    openDialog() {
      this.element.setAttribute('aria-expanded', 'true');
      this.element.classList.add('active');
      this.body.classList.add('dialog-active');
      if (this.focusableEls.length > 0) {
        this.focusableEls[0].focus();
      }
    }
    closeDialog() {
      this.element.setAttribute('aria-expanded', 'false');
      this.element.classList.remove('active');
      this.body.classList.remove('dialog-active');
    }
    clickDialog(event) {
      if (!this.elementWrapper.contains(event.target)) {
        this.closeDialog();
      }
    }
    trapFocus(event) {
      event.preventDefault();
      if (this.focusableEls.length > 0) {
        this.focusableEls[0].focus();
      }
    }
  }

  class ExternalLink {
    constructor(element) {
      this.element = element;
      this.uID = uniqueId('external');
      this.linkIcon = this.element.querySelector('.nsw-material-icons');
      this.linkIconTitle = this.linkIcon ? this.linkIcon.getAttribute('title') : false;
      this.linkElement = false;
    }
    init() {
      if (this.element.tagName !== 'A') return;
      this.element.classList.add('nsw-link', 'nsw-link--icon');
      this.constructor.setAttributes(this.element, {
        target: '_blank',
        rel: 'noopener'
      });
      if (this.linkIcon) {
        this.constructor.setAttributes(this.linkIcon, {
          focusable: 'false',
          'aria-hidden': 'true'
        });
      }
      if (this.linkIconTitle) this.createElement(this.linkIconTitle);
    }
    createElement(title) {
      if (title) {
        this.linkElement = document.createElement('span');
        this.linkElement.id = this.uID;
        this.linkElement.classList.add('sr-only');
        this.linkElement.innerText = title;
        this.element.insertAdjacentElement('afterend', this.linkElement);
        this.constructor.setAttributes(this.element, {
          'aria-describedby': this.uID
        });
      }
    }
    static setAttributes(el, attrs) {
      Object.keys(attrs).forEach(key => el.setAttribute(key, attrs[key]));
    }
  }

  /* eslint-disable max-len */
  class FileUpload {
    constructor(element) {
      this.element = element;
      this.input = this.element.querySelector('input.nsw-file-upload__input');
      this.label = this.element.querySelector('label.nsw-file-upload__label');
      this.multipleUpload = this.input && this.input.hasAttribute('multiple');
      this.replaceFiles = this.element.hasAttribute('data-replace-files');
      this.filesList = null;
    }
    init() {
      if (!this.input) return;
      if (!this.label) {
        const label = document.createElement('label');
        label.htmlFor = this.input.id;
        label.classList.add('nsw-file-upload__label', 'nsw-button', 'nsw-button--dark-outline-solid');
        label.textContent = 'Select file';
        this.element.insertAdjacentElement('beforeend', label);
        this.label = this.element.querySelector('label.nsw-file-upload__label');
      }
      this.input.addEventListener('change', this.handleInputChange.bind(this));
    }
    handleInputChange() {
      if (this.input.value === '') return;
      this.updateFileList();
    }
    createFileList() {
      const ul = document.createElement('ul');
      ul.classList.add('nsw-file-upload__list');
      this.label.insertAdjacentElement('afterend', ul);
      this.filesList = this.element.querySelector('.nsw-file-upload__list');
    }
    createFileItem(file) {
      const li = document.createElement('li');
      li.classList.add('nsw-file-upload__item');
      const html = `
      <span class="nsw-file-upload__item-filename"></span>
      <button type="button" class="nsw-icon-button">
        <span class="sr-only">Remove file</span>
        <span class="material-icons nsw-material-icons" focusable="false" aria-hidden="true">cancel</span>
      </button>`;
      li.insertAdjacentHTML('afterbegin', html);
      li.querySelector('.nsw-file-upload__item-filename').textContent = this.constructor.truncateString(file.name, 50);
      return li.outerHTML;
    }
    updateFileList() {
      if (!this.filesList) {
        this.createFileList();
      }
      this.filesList.classList.add('active');
      let fileListHTML = '';
      for (let i = 0; i < this.input.files.length; i += 1) {
        const file = this.input.files[i];
        fileListHTML = this.createFileItem(file) + fileListHTML;
      }
      if (this.replaceFiles) {
        this.filesList.innerHTML = fileListHTML;
      } else {
        this.filesList.insertAdjacentHTML('beforeend', fileListHTML);
      }
      this.removeFile();
    }
    removeFile() {
      this.filesList.addEventListener('click', this.handleFileRemove.bind(this));
    }
    handleFileRemove(event) {
      if (!event.target.closest('.nsw-icon-button')) return;
      event.preventDefault();
      const item = event.target.closest('.nsw-file-upload__item');
      item.remove();
      if (this.filesList.children.length === 0) {
        this.filesList.classList.remove('active');
      }
    }
    static truncateString(str, num) {
      return str.length <= num ? str : `${str.slice(0, num)}...`;
    }
  }

  /* eslint-disable max-len */
  class Filters {
    constructor(element) {
      this.element = element;
      // Classes
      this.hideClass = 'nsw-display-none';
      this.showClass = 'active';
      this.openClass = 'filters-open';
      this.prefix = 'nsw-';
      this.class = 'filters';
      this.controlsClass = `${this.class}__controls`;
      this.wrapperClass = `${this.class}__wrapper`;
      this.listClass = `${this.class}__list`;
      this.itemClass = `${this.class}__item`;
      this.resetClass = `${this.class}__cancel`;
      this.submitClass = `${this.class}__accept`;
      this.closeClass = `${this.class}__back`;
      this.countClass = `${this.class}__count`;
      this.allClass = `${this.class}__all`;
      this.moreClass = `${this.class}__more`;
      // Elements
      this.count = this.element.querySelector(`.js-${this.countClass}`);
      this.controls = this.element.querySelector(`.${this.prefix}${this.controlsClass}`);
      this.controlsButton = this.controls && this.controls.querySelector('button');
      this.controlsButtonIcons = this.controlsButton && this.controlsButton.querySelectorAll('span');
      this.controlsButtonText = this.controlsButton && this.controlsButton.querySelector('span:not(.nsw-material-icons)');
      this.controlsButtonTextContent = this.controlsButton && this.controlsButtonText.innerText;
      this.wrapper = this.element.querySelector(`.${this.prefix}${this.wrapperClass}`);
      this.closeButton = this.wrapper && this.wrapper.querySelector(`.${this.prefix}${this.closeClass} button`);
      this.submitButton = this.wrapper && this.wrapper.querySelector(`.${this.prefix}${this.submitClass} button`);
      this.resetButton = this.wrapper && this.wrapper.querySelector(`.${this.prefix}${this.resetClass} button`);
      this.items = this.wrapper && this.wrapper.querySelectorAll(`.${this.prefix}${this.itemClass}`);
      this.accordionButtons = this.wrapper && this.wrapper.querySelectorAll(`.${this.prefix}${this.itemClass}-button`);
      this.showMoreContent = this.element.querySelectorAll(`.${this.prefix}${this.allClass}`);
      this.showMoreButtons = this.element.querySelectorAll(`.${this.prefix}${this.moreClass}`);
      this.focusableElements = 'a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled])';
      // Accordion arrays
      this.buttons = [];
      this.content = [];
      this.options = [];
      this.selected = [];
    }
    init() {
      this.element.classList.add('ready');
      if (this.accordionButtons) {
        this.accordionButtons.forEach(button => {
          const buttonElem = button;
          const uID = uniqueId('collapsed');
          buttonElem.setAttribute('type', 'button');
          buttonElem.setAttribute('aria-expanded', 'false');
          buttonElem.setAttribute('aria-controls', uID);
          const label = buttonElem.querySelector(`.${this.prefix}${this.itemClass}-name`);
          buttonElem.setAttribute('data-label', label.innerText);
          const contentElem = buttonElem.nextElementSibling;
          contentElem.id = buttonElem.getAttribute('aria-controls');
          contentElem.hidden = true;
          this.content.push(contentElem);
          this.buttons.push(buttonElem);
        });
      }
      this.updateDom();
      this.initEvents();
    }
    initEvents() {
      document.addEventListener('DOMContentLoaded', () => {
        this.updateDom();
      });
      if (this.options) {
        this.options.forEach(element => {
          element.addEventListener('change', () => {
            this.updateDom();
          });
        });
      }
      if (this.controlsButton) {
        this.controlsButton.addEventListener('click', event => {
          this.showFilters(event);
        });
      }
      if (this.submitButton) {
        this.submitButton.disabled = true;
      }
      if (this.closeButton) {
        this.closeButton.addEventListener('click', event => {
          this.closeFilters(event);
        });
      }
      if (this.buttons) {
        this.buttons.forEach(element => {
          element.addEventListener('click', event => {
            this.toggleAccordion(event);
          });
        });
      }
      if (this.resetButton) {
        this.resetButton.addEventListener('click', event => {
          this.clearAll(event);
        });
        this.resetButton.addEventListener('change', event => {
          this.clearAll(event);
        });
      }
      if (this.showMoreButtons) {
        this.showMoreButtons.forEach((element, index) => {
          element.addEventListener('click', event => {
            this.showMore(event, index);
          });
        });
      }
    }
    setAccordionState(element, state) {
      const targetContent = this.getTargetContent(element);
      const firstfocusable = targetContent.querySelector(this.focusableElements);
      if (state === 'open') {
        element.classList.add(this.showClass);
        element.setAttribute('aria-expanded', 'true');
        targetContent.hidden = false;
        this.constructor.moveFocusFn(firstfocusable);
      } else if (state === 'close') {
        element.classList.remove(this.showClass);
        element.setAttribute('aria-expanded', 'false');
        targetContent.hidden = true;
      }
    }
    toggleAccordion(event) {
      const {
        currentTarget
      } = event;
      const targetContent = this.getTargetContent(currentTarget);
      if (targetContent.hidden) {
        this.setAccordionState(currentTarget, 'open');
      } else {
        this.setAccordionState(currentTarget, 'close');
      }
    }
    getTargetContent(element) {
      const currentIndex = this.buttons.indexOf(element);
      return this.content[currentIndex];
    }
    toggleSubmit(array) {
      if (this.submitButton) {
        if (array.length > 0) {
          this.submitButton.disabled = false;
        } else {
          this.submitButton.disabled = true;
        }
      }
    }
    showMore(event, index) {
      event.preventDefault();
      const firstfocusable = this.showMoreContent[index].querySelector(this.focusableElements);
      this.showMoreContent[index].classList.remove(this.hideClass);
      event.target.classList.add(this.hideClass);
      this.constructor.moveFocusFn(firstfocusable);
    }
    closeFilters(event) {
      event.preventDefault();
      this.element.classList.remove(this.showClass);
      document.body.classList.remove(this.openClass);
    }
    showFilters(event) {
      event.preventDefault();
      if (this.element.classList.contains('nsw-filters--down')) {
        this.element.classList.toggle(this.showClass);
      } else {
        this.trapFocus(this.wrapper);
        this.element.classList.add(this.showClass);
        document.body.classList.add(this.openClass);
      }
    }
    clearAll(event) {
      event.preventDefault();
      const simulateEvent = new MouseEvent('change', {
        view: window,
        bubbles: true,
        cancelable: true
      });
      const multiSelect = this.element.querySelector('.js-multi-select');
      const multiSelectAll = multiSelect && multiSelect.querySelector('.js-multi-select__all');
      const multiSelectOptions = multiSelect && multiSelect.querySelectorAll('.js-multi-select__option');
      if (this.options.length > 0) {
        this.options.forEach(input => {
          const option = input;
          if (option.type === 'text' || option.type === 'select-one') {
            option.value = '';
          } else if (!option.parentElement.classList.contains('js-multi-select__option')) {
            option.value = false;
            option.checked = false;
          }
        });
      }
      if (multiSelect) {
        multiSelectAll.classList.remove(this.showClass);
        multiSelectOptions.forEach(element => {
          element.setAttribute('aria-selected', 'true');
          element.dispatchEvent(new Event(simulateEvent));
          element.click();
        });
      }
      this.updateDom();
    }
    getOptions() {
      this.options = [];
      if (this.items) {
        this.items.forEach(element => {
          const content = element.querySelector(`.${this.prefix}${this.itemClass}-content`);
          const textInputs = content.querySelectorAll('input[type="text"]');
          const singleSelects = content.querySelectorAll('select:not([multiple]):not(.nsw-display-none)');
          const multiSelects = content.querySelectorAll('select[multiple]:not(.nsw-display-none)');
          const checkboxes = content.querySelectorAll('input[type="checkbox"]');
          this.options.push(...textInputs, ...singleSelects, ...checkboxes, ...multiSelects);
        });
      }
    }
    getSelected() {
      this.selected = [];
      if (this.options.length > 0) {
        const select = this.options.filter(option => option.type === 'select-one' && option.value !== '');
        const checkboxes = this.options.filter(option => option.checked);
        const text = this.options.filter(option => option.type === 'text' && option.value !== '');
        const multiple = this.options.filter(option => option.type === 'select-multiple' && option.value !== '');
        const selectMultiple = this.constructor.getMultiSelectValues(multiple);
        this.selected = [...select, ...checkboxes, ...text, ...selectMultiple];
      }
    }
    selectedCount(array) {
      if (!this.count) return;
      const dateInputs = array.filter(option => option.closest('.nsw-form__date'));
      const removedDateInputs = array.filter(option => !option.closest('.nsw-form__date'));
      let buttonText = `${this.controlsButtonTextContent}`;
      let countText = '';
      if (dateInputs.length > 0) {
        countText = ` (${removedDateInputs.length + 1})`;
      } else {
        countText = ` (${array.length})`;
      }
      if (dateInputs.length === 0 && array.length === 0) {
        this.controlsButtonText.innerText = buttonText;
      } else {
        buttonText += countText;
        this.controlsButtonText.innerText = buttonText;
      }
    }
    setSelectedState() {
      const formElements = 'textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled]):not(.nsw-display-none)';
      const checkIcon = '<span class="material-icons nsw-material-icons nsw-material-icons--valid" focusable="false" aria-hidden="true">check_circle</span>';
      this.buttons.forEach(element => {
        const buttonName = element.querySelector(`.${this.prefix}${this.itemClass}-name`);
        const label = element.getAttribute('data-label');
        const content = element.nextElementSibling;
        const values = content.querySelectorAll(formElements);
        const selected = Array.from(values).filter(field => {
          if (field.type === 'checkbox' || field.type === 'radio') {
            return field.checked;
          }
          return field.value !== '';
        });
        if (selected.length > 0) {
          buttonName.innerText = label;
          buttonName.innerHTML = `${label} ${checkIcon}`;
        } else if (selected.length === 0) {
          buttonName.innerText = label;
        }
      });
    }
    updateDom() {
      this.getOptions();
      this.getSelected();
      this.toggleSubmit(this.selected);
      this.selectedCount(this.selected);
      this.setSelectedState();
    }
    trapFocus(element) {
      const focusableContent = element.querySelectorAll(this.focusableElements);
      const firstFocusableElement = focusableContent[0];
      const lastFocusableElement = focusableContent[focusableContent.length - 1];
      document.addEventListener('keydown', event => {
        const tab = event.code && event.code === 9 || event.key && event.key === 'Tab';
        if (!tab) return;
        if (document.activeElement === firstFocusableElement && event.shiftKey) {
          event.preventDefault();
          lastFocusableElement.focus();
        }
        if (document.activeElement === lastFocusableElement && !event.shiftKey) {
          event.preventDefault();
          firstFocusableElement.focus();
        }
      });
      firstFocusableElement.focus();
    }
    static getMultiSelectValues(array) {
      let selectedOptions = [];
      if (array.length > 0) {
        array.forEach(element => {
          selectedOptions = Array.from(element.options).filter(option => option.selected);
        });
      }
      return selectedOptions;
    }
    static moveFocusFn(element) {
      element.focus();
      if (document.activeElement !== element) {
        element.setAttribute('tabindex', '-1');
        element.focus();
      }
    }
  }

  class GlobalAlert {
    constructor(element) {
      this.element = element;
      this.closeButton = this.element.querySelector('button.js-close-alert');
      this.cookieName = this.element.getAttribute('data-cookie-name') || false;
    }
    init() {
      if (this.cookieName && this.constructor.getCookie(this.cookieName)) {
        this.element.hidden = true;
        return;
      }
      if (this.closeButton) {
        this.controls();
      }
    }
    controls() {
      this.closeButton.addEventListener('click', () => {
        this.closeMessage();
      });
    }
    closeMessage() {
      this.element.hidden = true;
      if (this.cookieName) {
        this.constructor.setCookie(this.cookieName, 'dismissed', 7);
      }
    }
    static setCookie(name, value, days) {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      const expires = `expires=${date.toUTCString()}`;
      document.cookie = `${name}=${value};${expires};path=/`;
    }
    static getCookie(name) {
      const nameEQ = `${name}=`;
      const ca = document.cookie.split(';');
      for (let i = 0; i < ca.length; i += 1) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
      }
      return null;
    }
  }

  class Navigation {
    constructor(element) {
      this.nav = element;
      this.navID = this.nav.id;
      this.openNavButton = document.querySelector('.js-open-nav');
      this.closeNavButtons = this.nav.querySelectorAll('.js-close-nav');
      this.closeSubNavButtons = this.nav.querySelectorAll('.js-close-sub-nav');
      this.isMegaMenuElement = this.nav.classList.contains('js-mega-menu');
      this.mainNavIsOpen = false;
      this.transitionEvent = whichTransitionEvent();
      this.mobileShowMainTransitionEndEvent = e => this.mobileShowMainNav(e);
      this.mobileHideMainTransitionEndEvent = e => this.mobileHideMainNav(e);
      this.showSubNavTransitionEndEvent = e => this.showSubNav(e);
      this.mobileTrapTabKeyEvent = e => this.mobileMainNavTrapTabs(e);
      this.mobileSubNavTrapTabKeyEvent = e => this.trapkeyEventStuff(e);
      this.desktopButtonClickEvent = e => this.buttonClickDesktop(e);
      this.desktopButtonKeydownEvent = e => this.buttonKeydownDesktop(e);
      this.checkFocusEvent = e => this.checkIfContainsFocus(e);
      this.openSubNavElements = [];
      this.breakpoint = window.matchMedia('(min-width: 62em)');
    }
    init() {
      this.initEvents();
      this.responsiveCheck(this.breakpoint);
      if (this.nav) {
        this.breakpoint.addEventListener('change', event => this.responsiveCheck(event));
      }
    }
    initEvents() {
      if (this.isMegaMenuElement) {
        document.addEventListener('click', this.handleOutsideClick.bind(this), false);
        document.addEventListener('keydown', this.escapeClose.bind(this), false);
      }
      if (this.openNavButton) {
        this.openNavButton.addEventListener('click', this.mobileToggleMainNav.bind(this), false);
      }
      this.closeNavButtons.forEach(element => {
        element.addEventListener('click', this.mobileToggleMainNav.bind(this), false);
      });
      this.closeSubNavButtons.forEach(element => {
        element.addEventListener('click', this.closeSubNav.bind(this), false);
      });
    }
    responsiveCheck(event) {
      let megaMenuListItems = [];
      if (event.matches) {
        megaMenuListItems = [].slice.call(this.nav.querySelectorAll('ul > li'));
        document.body.classList.remove('main-nav-active');
      } else {
        megaMenuListItems = [].slice.call(this.nav.querySelectorAll('li'));
      }
      this.tearDownNavControls();
      this.setUpNavControls(megaMenuListItems);
    }
    handleOutsideClick(event) {
      // removes handleOutsideClick functionality from docs site
      if (this.nav.closest('.nsw-docs')) return;
      if (!this.mainNavIsOpen) return;
      const isOutsideNav = !this.nav.contains(event.target);
      if (isOutsideNav) {
        this.toggleSubNavDesktop(true);
      }
    }
    tearDownNavControls() {
      if (this.isMegaMenuElement) {
        const listItems = [].slice.call(this.nav.querySelectorAll('li'));
        listItems.forEach(item => {
          const submenu = item.querySelector('[id^=sub-nav-]');
          const link = item.querySelector('a');
          if (submenu) {
            link.removeAttribute('role');
            link.removeAttribute('aria-expanded');
            link.removeAttribute('aria-controls');
            link.removeEventListener('click', this.desktopButtonClickEvent, false);
            link.removeEventListener('keydown', this.desktopButtonKeydownEvent, false);
          }
        });
      }
    }
    setUpNavControls(listItems) {
      if (this.isMegaMenuElement) {
        listItems.forEach(item => {
          const submenu = item.querySelector('[id^=sub-nav-]');
          const link = item.querySelector('a');
          if (submenu) {
            link.setAttribute('role', 'button');
            link.setAttribute('aria-expanded', 'false');
            link.setAttribute('aria-controls', submenu.id);
            link.addEventListener('click', this.desktopButtonClickEvent, false);
            link.addEventListener('keydown', this.desktopButtonKeydownEvent, false);
          }
        });
      }
    }
    mobileMainNavTrapTabs(e) {
      const elemObj = getFocusableElementBySelector(this.navID, ['> div button', '> ul > li > a']);
      trapTabKey(e, elemObj);
    }
    mobileShowMainNav(_ref) {
      let {
        propertyName
      } = _ref;
      if (propertyName !== 'transform') return;
      getFocusableElementBySelector(this.navID, ['> div button', '> ul > li > a']).all[1].focus();
      this.nav.classList.add('active');
      this.nav.classList.remove('activating');
      this.nav.removeEventListener(this.transitionEvent, this.mobileShowMainTransitionEndEvent, false);
      this.nav.addEventListener('keydown', this.mobileTrapTabKeyEvent, false);
    }
    mobileHideMainNav(_ref2) {
      let {
        propertyName
      } = _ref2;
      if (propertyName !== 'transform') return;
      this.nav.classList.remove('active');
      this.nav.classList.remove('closing');
      while (this.openSubNavElements.length > 0) {
        const {
          submenu
        } = this.whichSubNavLatest();
        submenu.removeEventListener('keydown', this.mobileSubNavTrapTabKeyEvent, false);
        submenu.classList.remove('active');
        submenu.classList.remove('closing');
        this.openSubNavElements.pop();
      }
      this.nav.removeEventListener(this.transitionEvent, this.mobileHideMainTransitionEndEvent, false);
      this.nav.removeEventListener('keydown', this.mobileTrapTabKeyEvent, false);
    }
    mobileToggleMainNav(e) {
      const {
        currentTarget
      } = e;
      const isExpanded = currentTarget.getAttribute('aria-expanded') === 'true';
      if (isExpanded) {
        document.body.classList.remove('main-nav-active');
        this.openNavButton.focus();
        this.nav.classList.add('closing');
        this.nav.addEventListener(this.transitionEvent, this.mobileHideMainTransitionEndEvent, false);
      } else {
        document.body.classList.add('main-nav-active');
        this.nav.classList.add('activating');
        this.nav.addEventListener(this.transitionEvent, this.mobileShowMainTransitionEndEvent, false);
      }
    }
    buttonClickDesktop(event) {
      const isDesktop = this.breakpoint.matches;
      if (!isDesktop || !event.target.closest('.nsw-main-nav__sub-nav')) {
        this.saveElements(event);
        this.toggleSubNavDesktop();
        event.preventDefault();
      }
    }
    buttonKeydownDesktop(event) {
      if (event.key === ' ' || event.key === 'Enter' || event.key === 'Spacebar') {
        this.saveElements(event);
        this.toggleSubNavDesktop();
        event.preventDefault();
      }
    }
    escapeClose(e) {
      if (e.key === 'Escape') {
        // removes handleOutsideClick functionality from docs site
        if (this.nav.closest('.nsw-docs')) return;
        const {
          link
        } = this.whichSubNavLatest();
        const isExpanded = link.getAttribute('aria-expanded') === 'true';
        if (isExpanded) {
          this.toggleSubNavDesktop(true);
          e.preventDefault();
          link.focus();
        }
      }
    }
    saveElements(e) {
      const {
        currentTarget
      } = e;
      const temp = {
        submenu: document.getElementById(currentTarget.getAttribute('aria-controls')),
        link: currentTarget,
        linkParent: currentTarget.parentNode
      };
      this.openSubNavElements.push(temp);
    }
    showSubNav(_ref3) {
      let {
        propertyName
      } = _ref3;
      const {
        submenu
      } = this.whichSubNavLatest();
      if (propertyName !== 'transform') return;
      getFocusableElementBySelector(submenu.id, ['> div button', '> .nsw-main-nav__title a', '> ul > li > a']).all[2].focus();
      submenu.removeEventListener(this.transitionEvent, this.showSubNavTransitionEndEvent, false);
    }
    closeSubNav() {
      const {
        submenu,
        link
      } = this.whichSubNavLatest();
      if (this.breakpoint.matches) {
        link.setAttribute('aria-expanded', false);
        link.classList.remove('active');
        this.nav.removeEventListener('focus', this.checkFocusEvent, true);
        // fix: workaround for safari because it doesn't support focus event
        this.nav.removeEventListener('click', this.checkFocusEvent, true);
      } else {
        link.focus();
        submenu.removeEventListener('keydown', this.mobileSubNavTrapTabKeyEvent, false);
      }
      submenu.classList.remove('active');
      submenu.closest('ul').parentElement.classList.remove('no-scroll');
      this.openSubNavElements.pop();
    }
    openSubNav() {
      const {
        submenu,
        link
      } = this.whichSubNavLatest();
      if (this.breakpoint.matches) {
        link.setAttribute('aria-expanded', true);
        link.classList.add('active');
        this.nav.addEventListener('focus', this.checkFocusEvent, true);
        // fix: workaround for safari because it doesn't support focus event
        this.nav.addEventListener('click', this.checkFocusEvent, true);
      } else {
        submenu.addEventListener('keydown', this.mobileSubNavTrapTabKeyEvent, false);
        submenu.addEventListener(this.transitionEvent, this.showSubNavTransitionEndEvent, false);
      }
      submenu.closest('ul').parentElement.scrollTop = 0;
      submenu.closest('ul').parentElement.classList.add('no-scroll');
      submenu.classList.add('active');
    }
    toggleSubNavDesktop() {
      const {
        link
      } = this.whichSubNavLatest();
      const isExpanded = link.getAttribute('aria-expanded') === 'true';
      if (isExpanded) {
        this.mainNavIsOpen = false;
        this.closeSubNav();
      } else {
        this.mainNavIsOpen = true;
        this.openSubNav();
      }
    }
    checkIfContainsFocus(e) {
      const {
        linkParent
      } = this.whichSubNavLatest();
      const focusWithin = linkParent.contains(e.target);
      const isButton = e.target.closest('a').getAttribute('role') === 'button';
      if (!focusWithin && isButton) {
        this.toggleSubNavDesktop();
      }
    }
    whichSubNavLatest() {
      const lastSubNav = this.openSubNavElements.length - 1;
      return this.openSubNavElements[lastSubNav];
    }
    trapkeyEventStuff(e) {
      const {
        submenu
      } = this.whichSubNavLatest();
      const elemObj = getFocusableElementBySelector(submenu.id, ['> div button', '> ul > li > a']);
      trapTabKey(e, elemObj);
    }
  }

  function getAlignment(placement) {
    return placement.split('-')[1];
  }
  function getLengthFromAxis(axis) {
    return axis === 'y' ? 'height' : 'width';
  }
  function getSide(placement) {
    return placement.split('-')[0];
  }
  function getMainAxisFromPlacement(placement) {
    return ['top', 'bottom'].includes(getSide(placement)) ? 'x' : 'y';
  }
  function computeCoordsFromPlacement(_ref, placement, rtl) {
    let {
      reference,
      floating
    } = _ref;
    const commonX = reference.x + reference.width / 2 - floating.width / 2;
    const commonY = reference.y + reference.height / 2 - floating.height / 2;
    const mainAxis = getMainAxisFromPlacement(placement);
    const length = getLengthFromAxis(mainAxis);
    const commonAlign = reference[length] / 2 - floating[length] / 2;
    const side = getSide(placement);
    const isVertical = mainAxis === 'x';
    let coords;
    switch (side) {
      case 'top':
        coords = {
          x: commonX,
          y: reference.y - floating.height
        };
        break;
      case 'bottom':
        coords = {
          x: commonX,
          y: reference.y + reference.height
        };
        break;
      case 'right':
        coords = {
          x: reference.x + reference.width,
          y: commonY
        };
        break;
      case 'left':
        coords = {
          x: reference.x - floating.width,
          y: commonY
        };
        break;
      default:
        coords = {
          x: reference.x,
          y: reference.y
        };
    }
    switch (getAlignment(placement)) {
      case 'start':
        coords[mainAxis] -= commonAlign * (rtl && isVertical ? -1 : 1);
        break;
      case 'end':
        coords[mainAxis] += commonAlign * (rtl && isVertical ? -1 : 1);
        break;
    }
    return coords;
  }

  /**
   * Computes the `x` and `y` coordinates that will place the floating element
   * next to a reference element when it is given a certain positioning strategy.
   *
   * This export does not have any `platform` interface logic. You will need to
   * write one for the platform you are using Floating UI with.
   */
  const computePosition$1 = async (reference, floating, config) => {
    const {
      placement = 'bottom',
      strategy = 'absolute',
      middleware = [],
      platform
    } = config;
    const validMiddleware = middleware.filter(Boolean);
    const rtl = await (platform.isRTL == null ? void 0 : platform.isRTL(floating));
    let rects = await platform.getElementRects({
      reference,
      floating,
      strategy
    });
    let {
      x,
      y
    } = computeCoordsFromPlacement(rects, placement, rtl);
    let statefulPlacement = placement;
    let middlewareData = {};
    let resetCount = 0;
    for (let i = 0; i < validMiddleware.length; i++) {
      const {
        name,
        fn
      } = validMiddleware[i];
      const {
        x: nextX,
        y: nextY,
        data,
        reset
      } = await fn({
        x,
        y,
        initialPlacement: placement,
        placement: statefulPlacement,
        strategy,
        middlewareData,
        rects,
        platform,
        elements: {
          reference,
          floating
        }
      });
      x = nextX != null ? nextX : x;
      y = nextY != null ? nextY : y;
      middlewareData = {
        ...middlewareData,
        [name]: {
          ...middlewareData[name],
          ...data
        }
      };
      if (reset && resetCount <= 50) {
        resetCount++;
        if (typeof reset === 'object') {
          if (reset.placement) {
            statefulPlacement = reset.placement;
          }
          if (reset.rects) {
            rects = reset.rects === true ? await platform.getElementRects({
              reference,
              floating,
              strategy
            }) : reset.rects;
          }
          ({
            x,
            y
          } = computeCoordsFromPlacement(rects, statefulPlacement, rtl));
        }
        i = -1;
        continue;
      }
    }
    return {
      x,
      y,
      placement: statefulPlacement,
      strategy,
      middlewareData
    };
  };
  function expandPaddingObject(padding) {
    return {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      ...padding
    };
  }
  function getSideObjectFromPadding(padding) {
    return typeof padding !== 'number' ? expandPaddingObject(padding) : {
      top: padding,
      right: padding,
      bottom: padding,
      left: padding
    };
  }
  function rectToClientRect(rect) {
    return {
      ...rect,
      top: rect.y,
      left: rect.x,
      right: rect.x + rect.width,
      bottom: rect.y + rect.height
    };
  }

  /**
   * Resolves with an object of overflow side offsets that determine how much the
   * element is overflowing a given clipping boundary on each side.
   * - positive = overflowing the boundary by that number of pixels
   * - negative = how many pixels left before it will overflow
   * - 0 = lies flush with the boundary
   * @see https://floating-ui.com/docs/detectOverflow
   */
  async function detectOverflow(state, options) {
    var _await$platform$isEle;
    if (options === void 0) {
      options = {};
    }
    const {
      x,
      y,
      platform,
      rects,
      elements,
      strategy
    } = state;
    const {
      boundary = 'clippingAncestors',
      rootBoundary = 'viewport',
      elementContext = 'floating',
      altBoundary = false,
      padding = 0
    } = options;
    const paddingObject = getSideObjectFromPadding(padding);
    const altContext = elementContext === 'floating' ? 'reference' : 'floating';
    const element = elements[altBoundary ? altContext : elementContext];
    const clippingClientRect = rectToClientRect(await platform.getClippingRect({
      element: ((_await$platform$isEle = await (platform.isElement == null ? void 0 : platform.isElement(element))) != null ? _await$platform$isEle : true) ? element : element.contextElement || (await (platform.getDocumentElement == null ? void 0 : platform.getDocumentElement(elements.floating))),
      boundary,
      rootBoundary,
      strategy
    }));
    const rect = elementContext === 'floating' ? {
      ...rects.floating,
      x,
      y
    } : rects.reference;
    const offsetParent = await (platform.getOffsetParent == null ? void 0 : platform.getOffsetParent(elements.floating));
    const offsetScale = (await (platform.isElement == null ? void 0 : platform.isElement(offsetParent))) ? (await (platform.getScale == null ? void 0 : platform.getScale(offsetParent))) || {
      x: 1,
      y: 1
    } : {
      x: 1,
      y: 1
    };
    const elementClientRect = rectToClientRect(platform.convertOffsetParentRelativeRectToViewportRelativeRect ? await platform.convertOffsetParentRelativeRectToViewportRelativeRect({
      rect,
      offsetParent,
      strategy
    }) : rect);
    return {
      top: (clippingClientRect.top - elementClientRect.top + paddingObject.top) / offsetScale.y,
      bottom: (elementClientRect.bottom - clippingClientRect.bottom + paddingObject.bottom) / offsetScale.y,
      left: (clippingClientRect.left - elementClientRect.left + paddingObject.left) / offsetScale.x,
      right: (elementClientRect.right - clippingClientRect.right + paddingObject.right) / offsetScale.x
    };
  }
  const min$1 = Math.min;
  const max$1 = Math.max;
  function within(min$1$1, value, max$1$1) {
    return max$1(min$1$1, min$1(value, max$1$1));
  }

  /**
   * Provides data to position an inner element of the floating element so that it
   * appears centered to the reference element.
   * @see https://floating-ui.com/docs/arrow
   */
  const arrow = options => ({
    name: 'arrow',
    options,
    async fn(state) {
      // Since `element` is required, we don't Partial<> the type.
      const {
        element,
        padding = 0
      } = options || {};
      const {
        x,
        y,
        placement,
        rects,
        platform,
        elements
      } = state;
      if (element == null) {
        return {};
      }
      const paddingObject = getSideObjectFromPadding(padding);
      const coords = {
        x,
        y
      };
      const axis = getMainAxisFromPlacement(placement);
      const length = getLengthFromAxis(axis);
      const arrowDimensions = await platform.getDimensions(element);
      const isYAxis = axis === 'y';
      const minProp = isYAxis ? 'top' : 'left';
      const maxProp = isYAxis ? 'bottom' : 'right';
      const clientProp = isYAxis ? 'clientHeight' : 'clientWidth';
      const endDiff = rects.reference[length] + rects.reference[axis] - coords[axis] - rects.floating[length];
      const startDiff = coords[axis] - rects.reference[axis];
      const arrowOffsetParent = await (platform.getOffsetParent == null ? void 0 : platform.getOffsetParent(element));
      let clientSize = arrowOffsetParent ? arrowOffsetParent[clientProp] : 0;

      // DOM platform can return `window` as the `offsetParent`.
      if (!clientSize || !(await (platform.isElement == null ? void 0 : platform.isElement(arrowOffsetParent)))) {
        clientSize = elements.floating[clientProp] || rects.floating[length];
      }
      const centerToReference = endDiff / 2 - startDiff / 2;

      // Make sure the arrow doesn't overflow the floating element if the center
      // point is outside the floating element's bounds.
      const min = paddingObject[minProp];
      const max = clientSize - arrowDimensions[length] - paddingObject[maxProp];
      const center = clientSize / 2 - arrowDimensions[length] / 2 + centerToReference;
      const offset = within(min, center, max);

      // If the reference is small enough that the arrow's padding causes it to
      // to point to nothing for an aligned placement, adjust the offset of the
      // floating element itself. This stops `shift()` from taking action, but can
      // be worked around by calling it again after the `arrow()` if desired.
      const shouldAddOffset = getAlignment(placement) != null && center != offset && rects.reference[length] / 2 - (center < min ? paddingObject[minProp] : paddingObject[maxProp]) - arrowDimensions[length] / 2 < 0;
      const alignmentOffset = shouldAddOffset ? center < min ? min - center : max - center : 0;
      return {
        [axis]: coords[axis] - alignmentOffset,
        data: {
          [axis]: offset,
          centerOffset: center - offset
        }
      };
    }
  });
  const oppositeSideMap = {
    left: 'right',
    right: 'left',
    bottom: 'top',
    top: 'bottom'
  };
  function getOppositePlacement(placement) {
    return placement.replace(/left|right|bottom|top/g, side => oppositeSideMap[side]);
  }
  function getAlignmentSides(placement, rects, rtl) {
    if (rtl === void 0) {
      rtl = false;
    }
    const alignment = getAlignment(placement);
    const mainAxis = getMainAxisFromPlacement(placement);
    const length = getLengthFromAxis(mainAxis);
    let mainAlignmentSide = mainAxis === 'x' ? alignment === (rtl ? 'end' : 'start') ? 'right' : 'left' : alignment === 'start' ? 'bottom' : 'top';
    if (rects.reference[length] > rects.floating[length]) {
      mainAlignmentSide = getOppositePlacement(mainAlignmentSide);
    }
    return {
      main: mainAlignmentSide,
      cross: getOppositePlacement(mainAlignmentSide)
    };
  }
  const oppositeAlignmentMap = {
    start: 'end',
    end: 'start'
  };
  function getOppositeAlignmentPlacement(placement) {
    return placement.replace(/start|end/g, alignment => oppositeAlignmentMap[alignment]);
  }
  function getExpandedPlacements(placement) {
    const oppositePlacement = getOppositePlacement(placement);
    return [getOppositeAlignmentPlacement(placement), oppositePlacement, getOppositeAlignmentPlacement(oppositePlacement)];
  }
  function getSideList(side, isStart, rtl) {
    const lr = ['left', 'right'];
    const rl = ['right', 'left'];
    const tb = ['top', 'bottom'];
    const bt = ['bottom', 'top'];
    switch (side) {
      case 'top':
      case 'bottom':
        if (rtl) return isStart ? rl : lr;
        return isStart ? lr : rl;
      case 'left':
      case 'right':
        return isStart ? tb : bt;
      default:
        return [];
    }
  }
  function getOppositeAxisPlacements(placement, flipAlignment, direction, rtl) {
    const alignment = getAlignment(placement);
    let list = getSideList(getSide(placement), direction === 'start', rtl);
    if (alignment) {
      list = list.map(side => side + "-" + alignment);
      if (flipAlignment) {
        list = list.concat(list.map(getOppositeAlignmentPlacement));
      }
    }
    return list;
  }

  /**
   * Optimizes the visibility of the floating element by flipping the `placement`
   * in order to keep it in view when the preferred placement(s) will overflow the
   * clipping boundary. Alternative to `autoPlacement`.
   * @see https://floating-ui.com/docs/flip
   */
  const flip = function (options) {
    if (options === void 0) {
      options = {};
    }
    return {
      name: 'flip',
      options,
      async fn(state) {
        var _middlewareData$flip;
        const {
          placement,
          middlewareData,
          rects,
          initialPlacement,
          platform,
          elements
        } = state;
        const {
          mainAxis: checkMainAxis = true,
          crossAxis: checkCrossAxis = true,
          fallbackPlacements: specifiedFallbackPlacements,
          fallbackStrategy = 'bestFit',
          fallbackAxisSideDirection = 'none',
          flipAlignment = true,
          ...detectOverflowOptions
        } = options;
        const side = getSide(placement);
        const isBasePlacement = getSide(initialPlacement) === initialPlacement;
        const rtl = await (platform.isRTL == null ? void 0 : platform.isRTL(elements.floating));
        const fallbackPlacements = specifiedFallbackPlacements || (isBasePlacement || !flipAlignment ? [getOppositePlacement(initialPlacement)] : getExpandedPlacements(initialPlacement));
        if (!specifiedFallbackPlacements && fallbackAxisSideDirection !== 'none') {
          fallbackPlacements.push(...getOppositeAxisPlacements(initialPlacement, flipAlignment, fallbackAxisSideDirection, rtl));
        }
        const placements = [initialPlacement, ...fallbackPlacements];
        const overflow = await detectOverflow(state, detectOverflowOptions);
        const overflows = [];
        let overflowsData = ((_middlewareData$flip = middlewareData.flip) == null ? void 0 : _middlewareData$flip.overflows) || [];
        if (checkMainAxis) {
          overflows.push(overflow[side]);
        }
        if (checkCrossAxis) {
          const {
            main,
            cross
          } = getAlignmentSides(placement, rects, rtl);
          overflows.push(overflow[main], overflow[cross]);
        }
        overflowsData = [...overflowsData, {
          placement,
          overflows
        }];

        // One or more sides is overflowing.
        if (!overflows.every(side => side <= 0)) {
          var _middlewareData$flip2, _overflowsData$filter;
          const nextIndex = (((_middlewareData$flip2 = middlewareData.flip) == null ? void 0 : _middlewareData$flip2.index) || 0) + 1;
          const nextPlacement = placements[nextIndex];
          if (nextPlacement) {
            // Try next placement and re-run the lifecycle.
            return {
              data: {
                index: nextIndex,
                overflows: overflowsData
              },
              reset: {
                placement: nextPlacement
              }
            };
          }

          // First, find the candidates that fit on the mainAxis side of overflow,
          // then find the placement that fits the best on the main crossAxis side.
          let resetPlacement = (_overflowsData$filter = overflowsData.filter(d => d.overflows[0] <= 0).sort((a, b) => a.overflows[1] - b.overflows[1])[0]) == null ? void 0 : _overflowsData$filter.placement;

          // Otherwise fallback.
          if (!resetPlacement) {
            switch (fallbackStrategy) {
              case 'bestFit':
                {
                  var _overflowsData$map$so;
                  const placement = (_overflowsData$map$so = overflowsData.map(d => [d.placement, d.overflows.filter(overflow => overflow > 0).reduce((acc, overflow) => acc + overflow, 0)]).sort((a, b) => a[1] - b[1])[0]) == null ? void 0 : _overflowsData$map$so[0];
                  if (placement) {
                    resetPlacement = placement;
                  }
                  break;
                }
              case 'initialPlacement':
                resetPlacement = initialPlacement;
                break;
            }
          }
          if (placement !== resetPlacement) {
            return {
              reset: {
                placement: resetPlacement
              }
            };
          }
        }
        return {};
      }
    };
  };
  async function convertValueToCoords(state, value) {
    const {
      placement,
      platform,
      elements
    } = state;
    const rtl = await (platform.isRTL == null ? void 0 : platform.isRTL(elements.floating));
    const side = getSide(placement);
    const alignment = getAlignment(placement);
    const isVertical = getMainAxisFromPlacement(placement) === 'x';
    const mainAxisMulti = ['left', 'top'].includes(side) ? -1 : 1;
    const crossAxisMulti = rtl && isVertical ? -1 : 1;
    const rawValue = typeof value === 'function' ? value(state) : value;

    // eslint-disable-next-line prefer-const
    let {
      mainAxis,
      crossAxis,
      alignmentAxis
    } = typeof rawValue === 'number' ? {
      mainAxis: rawValue,
      crossAxis: 0,
      alignmentAxis: null
    } : {
      mainAxis: 0,
      crossAxis: 0,
      alignmentAxis: null,
      ...rawValue
    };
    if (alignment && typeof alignmentAxis === 'number') {
      crossAxis = alignment === 'end' ? alignmentAxis * -1 : alignmentAxis;
    }
    return isVertical ? {
      x: crossAxis * crossAxisMulti,
      y: mainAxis * mainAxisMulti
    } : {
      x: mainAxis * mainAxisMulti,
      y: crossAxis * crossAxisMulti
    };
  }

  /**
   * Modifies the placement by translating the floating element along the
   * specified axes.
   * A number (shorthand for `mainAxis` or distance), or an axes configuration
   * object may be passed.
   * @see https://floating-ui.com/docs/offset
   */
  const offset = function (value) {
    if (value === void 0) {
      value = 0;
    }
    return {
      name: 'offset',
      options: value,
      async fn(state) {
        const {
          x,
          y
        } = state;
        const diffCoords = await convertValueToCoords(state, value);
        return {
          x: x + diffCoords.x,
          y: y + diffCoords.y,
          data: diffCoords
        };
      }
    };
  };
  function getCrossAxis(axis) {
    return axis === 'x' ? 'y' : 'x';
  }

  /**
   * Optimizes the visibility of the floating element by shifting it in order to
   * keep it in view when it will overflow the clipping boundary.
   * @see https://floating-ui.com/docs/shift
   */
  const shift = function (options) {
    if (options === void 0) {
      options = {};
    }
    return {
      name: 'shift',
      options,
      async fn(state) {
        const {
          x,
          y,
          placement
        } = state;
        const {
          mainAxis: checkMainAxis = true,
          crossAxis: checkCrossAxis = false,
          limiter = {
            fn: _ref => {
              let {
                x,
                y
              } = _ref;
              return {
                x,
                y
              };
            }
          },
          ...detectOverflowOptions
        } = options;
        const coords = {
          x,
          y
        };
        const overflow = await detectOverflow(state, detectOverflowOptions);
        const mainAxis = getMainAxisFromPlacement(getSide(placement));
        const crossAxis = getCrossAxis(mainAxis);
        let mainAxisCoord = coords[mainAxis];
        let crossAxisCoord = coords[crossAxis];
        if (checkMainAxis) {
          const minSide = mainAxis === 'y' ? 'top' : 'left';
          const maxSide = mainAxis === 'y' ? 'bottom' : 'right';
          const min = mainAxisCoord + overflow[minSide];
          const max = mainAxisCoord - overflow[maxSide];
          mainAxisCoord = within(min, mainAxisCoord, max);
        }
        if (checkCrossAxis) {
          const minSide = crossAxis === 'y' ? 'top' : 'left';
          const maxSide = crossAxis === 'y' ? 'bottom' : 'right';
          const min = crossAxisCoord + overflow[minSide];
          const max = crossAxisCoord - overflow[maxSide];
          crossAxisCoord = within(min, crossAxisCoord, max);
        }
        const limitedCoords = limiter.fn({
          ...state,
          [mainAxis]: mainAxisCoord,
          [crossAxis]: crossAxisCoord
        });
        return {
          ...limitedCoords,
          data: {
            x: limitedCoords.x - x,
            y: limitedCoords.y - y
          }
        };
      }
    };
  };
  /**
   * Built-in `limiter` that will stop `shift()` at a certain point.
   */
  const limitShift = function (options) {
    if (options === void 0) {
      options = {};
    }
    return {
      options,
      fn(state) {
        const {
          x,
          y,
          placement,
          rects,
          middlewareData
        } = state;
        const {
          offset = 0,
          mainAxis: checkMainAxis = true,
          crossAxis: checkCrossAxis = true
        } = options;
        const coords = {
          x,
          y
        };
        const mainAxis = getMainAxisFromPlacement(placement);
        const crossAxis = getCrossAxis(mainAxis);
        let mainAxisCoord = coords[mainAxis];
        let crossAxisCoord = coords[crossAxis];
        const rawOffset = typeof offset === 'function' ? offset(state) : offset;
        const computedOffset = typeof rawOffset === 'number' ? {
          mainAxis: rawOffset,
          crossAxis: 0
        } : {
          mainAxis: 0,
          crossAxis: 0,
          ...rawOffset
        };
        if (checkMainAxis) {
          const len = mainAxis === 'y' ? 'height' : 'width';
          const limitMin = rects.reference[mainAxis] - rects.floating[len] + computedOffset.mainAxis;
          const limitMax = rects.reference[mainAxis] + rects.reference[len] - computedOffset.mainAxis;
          if (mainAxisCoord < limitMin) {
            mainAxisCoord = limitMin;
          } else if (mainAxisCoord > limitMax) {
            mainAxisCoord = limitMax;
          }
        }
        if (checkCrossAxis) {
          var _middlewareData$offse, _middlewareData$offse2;
          const len = mainAxis === 'y' ? 'width' : 'height';
          const isOriginSide = ['top', 'left'].includes(getSide(placement));
          const limitMin = rects.reference[crossAxis] - rects.floating[len] + (isOriginSide ? ((_middlewareData$offse = middlewareData.offset) == null ? void 0 : _middlewareData$offse[crossAxis]) || 0 : 0) + (isOriginSide ? 0 : computedOffset.crossAxis);
          const limitMax = rects.reference[crossAxis] + rects.reference[len] + (isOriginSide ? 0 : ((_middlewareData$offse2 = middlewareData.offset) == null ? void 0 : _middlewareData$offse2[crossAxis]) || 0) - (isOriginSide ? computedOffset.crossAxis : 0);
          if (crossAxisCoord < limitMin) {
            crossAxisCoord = limitMin;
          } else if (crossAxisCoord > limitMax) {
            crossAxisCoord = limitMax;
          }
        }
        return {
          [mainAxis]: mainAxisCoord,
          [crossAxis]: crossAxisCoord
        };
      }
    };
  };

  function getWindow(node) {
    var _node$ownerDocument;
    return ((_node$ownerDocument = node.ownerDocument) == null ? void 0 : _node$ownerDocument.defaultView) || window;
  }
  function getComputedStyle$1(element) {
    return getWindow(element).getComputedStyle(element);
  }
  function isNode(value) {
    return value instanceof getWindow(value).Node;
  }
  function getNodeName(node) {
    return isNode(node) ? (node.nodeName || '').toLowerCase() : '';
  }
  let uaString;
  function getUAString() {
    if (uaString) {
      return uaString;
    }
    const uaData = navigator.userAgentData;
    if (uaData && Array.isArray(uaData.brands)) {
      uaString = uaData.brands.map(item => item.brand + "/" + item.version).join(' ');
      return uaString;
    }
    return navigator.userAgent;
  }
  function isHTMLElement(value) {
    return value instanceof getWindow(value).HTMLElement;
  }
  function isElement(value) {
    return value instanceof getWindow(value).Element;
  }
  function isShadowRoot(node) {
    // Browsers without `ShadowRoot` support.
    if (typeof ShadowRoot === 'undefined') {
      return false;
    }
    const OwnElement = getWindow(node).ShadowRoot;
    return node instanceof OwnElement || node instanceof ShadowRoot;
  }
  function isOverflowElement(element) {
    const {
      overflow,
      overflowX,
      overflowY,
      display
    } = getComputedStyle$1(element);
    return /auto|scroll|overlay|hidden|clip/.test(overflow + overflowY + overflowX) && !['inline', 'contents'].includes(display);
  }
  function isTableElement(element) {
    return ['table', 'td', 'th'].includes(getNodeName(element));
  }
  function isContainingBlock(element) {
    // TODO: Try to use feature detection here instead.
    const isFirefox = /firefox/i.test(getUAString());
    const css = getComputedStyle$1(element);
    const backdropFilter = css.backdropFilter || css.WebkitBackdropFilter;

    // This is non-exhaustive but covers the most common CSS properties that
    // create a containing block.
    // https://developer.mozilla.org/en-US/docs/Web/CSS/Containing_block#identifying_the_containing_block
    return css.transform !== 'none' || css.perspective !== 'none' || (backdropFilter ? backdropFilter !== 'none' : false) || isFirefox && css.willChange === 'filter' || isFirefox && (css.filter ? css.filter !== 'none' : false) || ['transform', 'perspective'].some(value => css.willChange.includes(value)) || ['paint', 'layout', 'strict', 'content'].some(value => {
      // Add type check for old browsers.
      const contain = css.contain;
      return contain != null ? contain.includes(value) : false;
    });
  }

  /**
   * Determines whether or not `.getBoundingClientRect()` is affected by visual
   * viewport offsets. In Safari, the `x`/`y` offsets are values relative to the
   * visual viewport, while in other engines, they are values relative to the
   * layout viewport.
   */
  function isClientRectVisualViewportBased() {
    // TODO: Try to use feature detection here instead. Feature detection for
    // this can fail in various ways, making the userAgent check the most
    // reliable:
    // • Always-visible scrollbar or not
    // • Width of <html>

    // Is Safari.
    return /^((?!chrome|android).)*safari/i.test(getUAString());
  }
  function isLastTraversableNode(node) {
    return ['html', 'body', '#document'].includes(getNodeName(node));
  }
  const min = Math.min;
  const max = Math.max;
  const round = Math.round;
  function getCssDimensions(element) {
    const css = getComputedStyle$1(element);
    // In testing environments, the `width` and `height` properties are empty
    // strings for SVG elements, returning NaN. Fallback to `0` in this case.
    let width = parseFloat(css.width) || 0;
    let height = parseFloat(css.height) || 0;
    const hasOffset = isHTMLElement(element);
    const offsetWidth = hasOffset ? element.offsetWidth : width;
    const offsetHeight = hasOffset ? element.offsetHeight : height;
    const shouldFallback = round(width) !== offsetWidth || round(height) !== offsetHeight;
    if (shouldFallback) {
      width = offsetWidth;
      height = offsetHeight;
    }
    return {
      width,
      height,
      fallback: shouldFallback
    };
  }
  function unwrapElement(element) {
    return !isElement(element) ? element.contextElement : element;
  }
  const FALLBACK_SCALE = {
    x: 1,
    y: 1
  };
  function getScale(element) {
    const domElement = unwrapElement(element);
    if (!isHTMLElement(domElement)) {
      return FALLBACK_SCALE;
    }
    const rect = domElement.getBoundingClientRect();
    const {
      width,
      height,
      fallback
    } = getCssDimensions(domElement);
    let x = (fallback ? round(rect.width) : rect.width) / width;
    let y = (fallback ? round(rect.height) : rect.height) / height;

    // 0, NaN, or Infinity should always fallback to 1.

    if (!x || !Number.isFinite(x)) {
      x = 1;
    }
    if (!y || !Number.isFinite(y)) {
      y = 1;
    }
    return {
      x,
      y
    };
  }
  function getBoundingClientRect(element, includeScale, isFixedStrategy, offsetParent) {
    var _win$visualViewport, _win$visualViewport2;
    if (includeScale === void 0) {
      includeScale = false;
    }
    if (isFixedStrategy === void 0) {
      isFixedStrategy = false;
    }
    const clientRect = element.getBoundingClientRect();
    const domElement = unwrapElement(element);
    let scale = FALLBACK_SCALE;
    if (includeScale) {
      if (offsetParent) {
        if (isElement(offsetParent)) {
          scale = getScale(offsetParent);
        }
      } else {
        scale = getScale(element);
      }
    }
    const win = domElement ? getWindow(domElement) : window;
    const addVisualOffsets = isClientRectVisualViewportBased() && isFixedStrategy;
    let x = (clientRect.left + (addVisualOffsets ? ((_win$visualViewport = win.visualViewport) == null ? void 0 : _win$visualViewport.offsetLeft) || 0 : 0)) / scale.x;
    let y = (clientRect.top + (addVisualOffsets ? ((_win$visualViewport2 = win.visualViewport) == null ? void 0 : _win$visualViewport2.offsetTop) || 0 : 0)) / scale.y;
    let width = clientRect.width / scale.x;
    let height = clientRect.height / scale.y;
    if (domElement) {
      const win = getWindow(domElement);
      const offsetWin = offsetParent && isElement(offsetParent) ? getWindow(offsetParent) : offsetParent;
      let currentIFrame = win.frameElement;
      while (currentIFrame && offsetParent && offsetWin !== win) {
        const iframeScale = getScale(currentIFrame);
        const iframeRect = currentIFrame.getBoundingClientRect();
        const css = getComputedStyle(currentIFrame);
        iframeRect.x += (currentIFrame.clientLeft + parseFloat(css.paddingLeft)) * iframeScale.x;
        iframeRect.y += (currentIFrame.clientTop + parseFloat(css.paddingTop)) * iframeScale.y;
        x *= iframeScale.x;
        y *= iframeScale.y;
        width *= iframeScale.x;
        height *= iframeScale.y;
        x += iframeRect.x;
        y += iframeRect.y;
        currentIFrame = getWindow(currentIFrame).frameElement;
      }
    }
    return rectToClientRect({
      width,
      height,
      x,
      y
    });
  }
  function getDocumentElement(node) {
    return ((isNode(node) ? node.ownerDocument : node.document) || window.document).documentElement;
  }
  function getNodeScroll(element) {
    if (isElement(element)) {
      return {
        scrollLeft: element.scrollLeft,
        scrollTop: element.scrollTop
      };
    }
    return {
      scrollLeft: element.pageXOffset,
      scrollTop: element.pageYOffset
    };
  }
  function convertOffsetParentRelativeRectToViewportRelativeRect(_ref) {
    let {
      rect,
      offsetParent,
      strategy
    } = _ref;
    const isOffsetParentAnElement = isHTMLElement(offsetParent);
    const documentElement = getDocumentElement(offsetParent);
    if (offsetParent === documentElement) {
      return rect;
    }
    let scroll = {
      scrollLeft: 0,
      scrollTop: 0
    };
    let scale = {
      x: 1,
      y: 1
    };
    const offsets = {
      x: 0,
      y: 0
    };
    if (isOffsetParentAnElement || !isOffsetParentAnElement && strategy !== 'fixed') {
      if (getNodeName(offsetParent) !== 'body' || isOverflowElement(documentElement)) {
        scroll = getNodeScroll(offsetParent);
      }
      if (isHTMLElement(offsetParent)) {
        const offsetRect = getBoundingClientRect(offsetParent);
        scale = getScale(offsetParent);
        offsets.x = offsetRect.x + offsetParent.clientLeft;
        offsets.y = offsetRect.y + offsetParent.clientTop;
      }
    }
    return {
      width: rect.width * scale.x,
      height: rect.height * scale.y,
      x: rect.x * scale.x - scroll.scrollLeft * scale.x + offsets.x,
      y: rect.y * scale.y - scroll.scrollTop * scale.y + offsets.y
    };
  }
  function getWindowScrollBarX(element) {
    // If <html> has a CSS width greater than the viewport, then this will be
    // incorrect for RTL.
    return getBoundingClientRect(getDocumentElement(element)).left + getNodeScroll(element).scrollLeft;
  }

  // Gets the entire size of the scrollable document area, even extending outside
  // of the `<html>` and `<body>` rect bounds if horizontally scrollable.
  function getDocumentRect(element) {
    const html = getDocumentElement(element);
    const scroll = getNodeScroll(element);
    const body = element.ownerDocument.body;
    const width = max(html.scrollWidth, html.clientWidth, body.scrollWidth, body.clientWidth);
    const height = max(html.scrollHeight, html.clientHeight, body.scrollHeight, body.clientHeight);
    let x = -scroll.scrollLeft + getWindowScrollBarX(element);
    const y = -scroll.scrollTop;
    if (getComputedStyle$1(body).direction === 'rtl') {
      x += max(html.clientWidth, body.clientWidth) - width;
    }
    return {
      width,
      height,
      x,
      y
    };
  }
  function getParentNode(node) {
    if (getNodeName(node) === 'html') {
      return node;
    }
    const result =
    // Step into the shadow DOM of the parent of a slotted node.
    node.assignedSlot ||
    // DOM Element detected.
    node.parentNode ||
    // ShadowRoot detected.
    isShadowRoot(node) && node.host ||
    // Fallback.
    getDocumentElement(node);
    return isShadowRoot(result) ? result.host : result;
  }
  function getNearestOverflowAncestor(node) {
    const parentNode = getParentNode(node);
    if (isLastTraversableNode(parentNode)) {
      // `getParentNode` will never return a `Document` due to the fallback
      // check, so it's either the <html> or <body> element.
      return parentNode.ownerDocument.body;
    }
    if (isHTMLElement(parentNode) && isOverflowElement(parentNode)) {
      return parentNode;
    }
    return getNearestOverflowAncestor(parentNode);
  }
  function getOverflowAncestors(node, list) {
    var _node$ownerDocument;
    if (list === void 0) {
      list = [];
    }
    const scrollableAncestor = getNearestOverflowAncestor(node);
    const isBody = scrollableAncestor === ((_node$ownerDocument = node.ownerDocument) == null ? void 0 : _node$ownerDocument.body);
    const win = getWindow(scrollableAncestor);
    if (isBody) {
      return list.concat(win, win.visualViewport || [], isOverflowElement(scrollableAncestor) ? scrollableAncestor : []);
    }
    return list.concat(scrollableAncestor, getOverflowAncestors(scrollableAncestor));
  }
  function getViewportRect(element, strategy) {
    const win = getWindow(element);
    const html = getDocumentElement(element);
    const visualViewport = win.visualViewport;
    let width = html.clientWidth;
    let height = html.clientHeight;
    let x = 0;
    let y = 0;
    if (visualViewport) {
      width = visualViewport.width;
      height = visualViewport.height;
      const visualViewportBased = isClientRectVisualViewportBased();
      if (!visualViewportBased || visualViewportBased && strategy === 'fixed') {
        x = visualViewport.offsetLeft;
        y = visualViewport.offsetTop;
      }
    }
    return {
      width,
      height,
      x,
      y
    };
  }

  // Returns the inner client rect, subtracting scrollbars if present.
  function getInnerBoundingClientRect(element, strategy) {
    const clientRect = getBoundingClientRect(element, true, strategy === 'fixed');
    const top = clientRect.top + element.clientTop;
    const left = clientRect.left + element.clientLeft;
    const scale = isHTMLElement(element) ? getScale(element) : {
      x: 1,
      y: 1
    };
    const width = element.clientWidth * scale.x;
    const height = element.clientHeight * scale.y;
    const x = left * scale.x;
    const y = top * scale.y;
    return {
      width,
      height,
      x,
      y
    };
  }
  function getClientRectFromClippingAncestor(element, clippingAncestor, strategy) {
    let rect;
    if (clippingAncestor === 'viewport') {
      rect = getViewportRect(element, strategy);
    } else if (clippingAncestor === 'document') {
      rect = getDocumentRect(getDocumentElement(element));
    } else if (isElement(clippingAncestor)) {
      rect = getInnerBoundingClientRect(clippingAncestor, strategy);
    } else {
      const mutableRect = {
        ...clippingAncestor
      };
      if (isClientRectVisualViewportBased()) {
        var _win$visualViewport, _win$visualViewport2;
        const win = getWindow(element);
        mutableRect.x -= ((_win$visualViewport = win.visualViewport) == null ? void 0 : _win$visualViewport.offsetLeft) || 0;
        mutableRect.y -= ((_win$visualViewport2 = win.visualViewport) == null ? void 0 : _win$visualViewport2.offsetTop) || 0;
      }
      rect = mutableRect;
    }
    return rectToClientRect(rect);
  }
  function hasFixedPositionAncestor(element, stopNode) {
    const parentNode = getParentNode(element);
    if (parentNode === stopNode || !isElement(parentNode) || isLastTraversableNode(parentNode)) {
      return false;
    }
    return getComputedStyle$1(parentNode).position === 'fixed' || hasFixedPositionAncestor(parentNode, stopNode);
  }

  // A "clipping ancestor" is an `overflow` element with the characteristic of
  // clipping (or hiding) child elements. This returns all clipping ancestors
  // of the given element up the tree.
  function getClippingElementAncestors(element, cache) {
    const cachedResult = cache.get(element);
    if (cachedResult) {
      return cachedResult;
    }
    let result = getOverflowAncestors(element).filter(el => isElement(el) && getNodeName(el) !== 'body');
    let currentContainingBlockComputedStyle = null;
    const elementIsFixed = getComputedStyle$1(element).position === 'fixed';
    let currentNode = elementIsFixed ? getParentNode(element) : element;

    // https://developer.mozilla.org/en-US/docs/Web/CSS/Containing_block#identifying_the_containing_block
    while (isElement(currentNode) && !isLastTraversableNode(currentNode)) {
      const computedStyle = getComputedStyle$1(currentNode);
      const currentNodeIsContaining = isContainingBlock(currentNode);
      if (!currentNodeIsContaining && computedStyle.position === 'fixed') {
        currentContainingBlockComputedStyle = null;
      }
      const shouldDropCurrentNode = elementIsFixed ? !currentNodeIsContaining && !currentContainingBlockComputedStyle : !currentNodeIsContaining && computedStyle.position === 'static' && !!currentContainingBlockComputedStyle && ['absolute', 'fixed'].includes(currentContainingBlockComputedStyle.position) || isOverflowElement(currentNode) && !currentNodeIsContaining && hasFixedPositionAncestor(element, currentNode);
      if (shouldDropCurrentNode) {
        // Drop non-containing blocks.
        result = result.filter(ancestor => ancestor !== currentNode);
      } else {
        // Record last containing block for next iteration.
        currentContainingBlockComputedStyle = computedStyle;
      }
      currentNode = getParentNode(currentNode);
    }
    cache.set(element, result);
    return result;
  }

  // Gets the maximum area that the element is visible in due to any number of
  // clipping ancestors.
  function getClippingRect(_ref) {
    let {
      element,
      boundary,
      rootBoundary,
      strategy
    } = _ref;
    const elementClippingAncestors = boundary === 'clippingAncestors' ? getClippingElementAncestors(element, this._c) : [].concat(boundary);
    const clippingAncestors = [...elementClippingAncestors, rootBoundary];
    const firstClippingAncestor = clippingAncestors[0];
    const clippingRect = clippingAncestors.reduce((accRect, clippingAncestor) => {
      const rect = getClientRectFromClippingAncestor(element, clippingAncestor, strategy);
      accRect.top = max(rect.top, accRect.top);
      accRect.right = min(rect.right, accRect.right);
      accRect.bottom = min(rect.bottom, accRect.bottom);
      accRect.left = max(rect.left, accRect.left);
      return accRect;
    }, getClientRectFromClippingAncestor(element, firstClippingAncestor, strategy));
    return {
      width: clippingRect.right - clippingRect.left,
      height: clippingRect.bottom - clippingRect.top,
      x: clippingRect.left,
      y: clippingRect.top
    };
  }
  function getDimensions(element) {
    return getCssDimensions(element);
  }
  function getTrueOffsetParent(element, polyfill) {
    if (!isHTMLElement(element) || getComputedStyle$1(element).position === 'fixed') {
      return null;
    }
    if (polyfill) {
      return polyfill(element);
    }
    return element.offsetParent;
  }
  function getContainingBlock(element) {
    let currentNode = getParentNode(element);
    while (isHTMLElement(currentNode) && !isLastTraversableNode(currentNode)) {
      if (isContainingBlock(currentNode)) {
        return currentNode;
      } else {
        currentNode = getParentNode(currentNode);
      }
    }
    return null;
  }

  // Gets the closest ancestor positioned element. Handles some edge cases,
  // such as table ancestors and cross browser bugs.
  function getOffsetParent(element, polyfill) {
    const window = getWindow(element);
    if (!isHTMLElement(element)) {
      return window;
    }
    let offsetParent = getTrueOffsetParent(element, polyfill);
    while (offsetParent && isTableElement(offsetParent) && getComputedStyle$1(offsetParent).position === 'static') {
      offsetParent = getTrueOffsetParent(offsetParent, polyfill);
    }
    if (offsetParent && (getNodeName(offsetParent) === 'html' || getNodeName(offsetParent) === 'body' && getComputedStyle$1(offsetParent).position === 'static' && !isContainingBlock(offsetParent))) {
      return window;
    }
    return offsetParent || getContainingBlock(element) || window;
  }
  function getRectRelativeToOffsetParent(element, offsetParent, strategy) {
    const isOffsetParentAnElement = isHTMLElement(offsetParent);
    const documentElement = getDocumentElement(offsetParent);
    const rect = getBoundingClientRect(element, true, strategy === 'fixed', offsetParent);
    let scroll = {
      scrollLeft: 0,
      scrollTop: 0
    };
    const offsets = {
      x: 0,
      y: 0
    };
    if (isOffsetParentAnElement || !isOffsetParentAnElement && strategy !== 'fixed') {
      if (getNodeName(offsetParent) !== 'body' || isOverflowElement(documentElement)) {
        scroll = getNodeScroll(offsetParent);
      }
      if (isHTMLElement(offsetParent)) {
        const offsetRect = getBoundingClientRect(offsetParent, true);
        offsets.x = offsetRect.x + offsetParent.clientLeft;
        offsets.y = offsetRect.y + offsetParent.clientTop;
      } else if (documentElement) {
        offsets.x = getWindowScrollBarX(documentElement);
      }
    }
    return {
      x: rect.left + scroll.scrollLeft - offsets.x,
      y: rect.top + scroll.scrollTop - offsets.y,
      width: rect.width,
      height: rect.height
    };
  }
  const platform = {
    getClippingRect,
    convertOffsetParentRelativeRectToViewportRelativeRect,
    isElement,
    getDimensions,
    getOffsetParent,
    getDocumentElement,
    getScale,
    async getElementRects(_ref) {
      let {
        reference,
        floating,
        strategy
      } = _ref;
      const getOffsetParentFn = this.getOffsetParent || getOffsetParent;
      const getDimensionsFn = this.getDimensions;
      return {
        reference: getRectRelativeToOffsetParent(reference, await getOffsetParentFn(floating), strategy),
        floating: {
          x: 0,
          y: 0,
          ...(await getDimensionsFn(floating))
        }
      };
    },
    getClientRects: element => Array.from(element.getClientRects()),
    isRTL: element => getComputedStyle$1(element).direction === 'rtl'
  };

  /**
   * Computes the `x` and `y` coordinates that will place the floating element
   * next to a reference element when it is given a certain CSS positioning
   * strategy.
   */
  const computePosition = (reference, floating, options) => {
    // This caches the expensive `getClippingElementAncestors` function so that
    // multiple lifecycle resets re-use the same result. It only lives for a
    // single call. If other functions become expensive, we can add them as well.
    const cache = new Map();
    const mergedOptions = {
      platform,
      ...options
    };
    const platformWithCache = {
      ...mergedOptions.platform,
      _c: cache
    };
    return computePosition$1(reference, floating, {
      ...mergedOptions,
      platform: platformWithCache
    });
  };

  /* eslint-disable max-len */
  class Popover {
    constructor(element) {
      this.element = element;
      this.popoverId = this.element.getAttribute('aria-controls');
      this.popoverPosition = this.element.dataset.popoverPosition || 'bottom';
      this.popoverGap = this.element.dataset.popoverGap || 5;
      this.popoverAnchor = this.element.querySelector('[data-anchor]') || this.element;
      this.popoverElement = this.popoverId && document.querySelector(`#${this.popoverId}`);
      this.popoverVisibleClass = 'active';
      this.popoverContent = false;
      this.popoverIsOpen = false;
      this.firstFocusable = null;
      this.lastFocusable = null;
    }
    init() {
      if (!this.popoverElement) return;
      this.constructor.setAttributes(this.element, {
        tabindex: '0',
        'aria-haspopup': 'dialog'
      });
      this.initEvents();
    }
    initEvents() {
      this.element.addEventListener('click', this.togglePopover.bind(this));
      this.element.addEventListener('keyup', event => {
        if (event.code && event.code.toLowerCase() === 'enter' || event.key && event.key.toLowerCase() === 'enter') {
          this.togglePopover();
        }
      });
      window.addEventListener('DOMContentLoaded', () => {
        this.popoverContent = this.popoverElement.innerHTML;
      });
      this.popoverElement.addEventListener('keydown', this.trapFocus.bind(this));
      window.addEventListener('click', event => {
        this.checkPopoverClick(event.target);
      });
      window.addEventListener('keyup', event => {
        if (event.code && event.code.toLowerCase() === 'escape' || event.key && event.key.toLowerCase() === 'escape') {
          this.checkPopoverFocus();
        }
      });
      this.debouncedTogglePopover = this.constructor.debounce(() => {
        if (this.popoverIsOpen) this.togglePopover();
      }, 300);
      window.addEventListener('resize', this.debouncedTogglePopover);
      window.addEventListener('scroll', this.debouncedTogglePopover);
    }
    static debounce(func, wait) {
      let timeout;
      return function executedFunction() {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    }
    togglePopover() {
      if (this.popoverElement.classList.contains('active')) {
        this.hidePopover();
      } else {
        this.popoverElement.focus();
        this.showPopover();
      }
    }
    showPopover() {
      this.constructor.setAttributes(this.popoverElement, {
        tabindex: '0',
        role: 'dialog'
      });
      this.popoverElement.setAttribute('aria-expanded', 'true');
      this.popoverElement.classList.add('active');
      this.popoverIsOpen = true;
      this.getFocusableElements();
      this.popoverElement.focus({
        preventScroll: true
      });
      this.element.addEventListener('transitionend', () => {
        this.focusPopover();
      }, {
        once: true
      });
      this.updatePopover(this.popoverElement, this.popoverPosition);
    }
    hidePopover() {
      this.popoverElement.setAttribute('aria-expanded', 'false');
      this.popoverElement.classList.remove('active');
      this.popoverIsOpen = false;
    }
    async updatePopover(popover, placement) {
      let anchor = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.popoverAnchor;
      try {
        const {
          x,
          y
        } = await computePosition(anchor, popover, {
          placement,
          middleware: [offset(parseInt(this.popoverGap, 10)), flip({
            fallbackAxisSideDirection: 'start',
            crossAxis: false
          }), shift({
            limiter: limitShift()
          })]
        });
        Object.assign(popover.style, {
          left: `${x}px`,
          top: `${y}px`
        });
      } catch (error) {
        console.error('Error updating popover position:', error);
      }
    }
    checkPopoverClick(target) {
      if (!this.popoverIsOpen) return;
      if (!this.popoverElement.contains(target) && !target.closest(`[aria-controls="${this.popoverId}"]`)) this.togglePopover();
    }
    checkPopoverFocus() {
      if (!this.popoverIsOpen) return;
      this.constructor.moveFocus(this.element);
      this.togglePopover();
    }
    focusPopover() {
      if (this.firstFocusable) {
        this.firstFocusable.focus({
          preventScroll: true
        });
      } else {
        this.constructor.moveFocus(this.popoverElement);
      }
    }
    getFocusableElements() {
      const focusableElString = '[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary';
      const allFocusable = this.popoverElement.querySelectorAll(focusableElString);
      this.getFirstVisible(allFocusable);
      this.getLastVisible(allFocusable);
    }
    getFirstVisible(elements) {
      for (let i = 0; i < elements.length; i += 1) {
        if (this.constructor.isVisible(elements[i])) {
          this.firstFocusable = elements[i];
          break;
        }
      }
    }
    getLastVisible(elements) {
      for (let i = elements.length - 1; i >= 0; i -= 1) {
        if (this.constructor.isVisible(elements[i])) {
          this.lastFocusable = elements[i];
          break;
        }
      }
    }
    trapFocus(event) {
      if (this.firstFocusable === document.activeElement && event.shiftKey) {
        event.preventDefault();
        this.lastFocusable.focus();
      }
      if (this.lastFocusable === document.activeElement && !event.shiftKey) {
        event.preventDefault();
        this.firstFocusable.focus();
      }
    }
    static isVisible(element) {
      return element.offsetWidth || element.offsetHeight || element.getClientRects().length;
    }
    static moveFocus(element) {
      element.focus({
        preventScroll: true
      });
      if (document.activeElement !== element) {
        element.setAttribute('tabindex', '-1');
        element.focus();
      }
    }
    static setAttributes(el, attrs) {
      Object.keys(attrs).forEach(key => el.setAttribute(key, attrs[key]));
    }
  }

  /* eslint-disable max-len */
  class Select {
    constructor(element) {
      this.element = element;
      this.select = this.element.querySelector('select');
      this.optGroups = this.select && this.select.getElementsByTagName('optgroup');
      this.options = this.select && this.select.getElementsByTagName('option');
      this.selectId = this.select && this.select.getAttribute('id');
      this.trigger = false;
      this.dropdown = false;
      this.customOptions = false;
      this.list = false;
      this.allButton = false;
      this.arrowIcon = this.element.getElementsByTagName('svg');
      this.label = document.querySelector(`[for="${this.selectId}"]`);
      this.selectedOptCounter = 0;
      this.optionIndex = 0;
      this.noSelectText = this.element.getAttribute('data-select-text') || 'Select';
      this.multiSelectText = this.element.getAttribute('data-multi-select-text') || '{n} items selected';
      this.nMultiSelect = this.element.getAttribute('data-n-multi-select') || 1;
      this.noUpdateLabel = this.element.getAttribute('data-update-text') && this.element.getAttribute('data-update-text') === 'off';
      this.insetLabel = this.element.getAttribute('data-inset-label') && this.element.getAttribute('data-inset-label') === 'on';
      this.hideClass = 'nsw-display-none';
      this.showClass = 'active';
      this.errorClass = 'has-error';
      this.srClass = 'sr-only';
      this.prefix = 'nsw-';
      this.class = 'multi-select';
      this.buttonClass = `${this.class}__button`;
      this.allButtonClass = `${this.class}__all`;
      this.listClass = `${this.class}__list`;
      this.optionClass = `${this.class}__option`;
      this.dropdownClass = `${this.class}__dropdown`;
      this.checkboxClass = `${this.class}__checkbox`;
      this.itemClass = `${this.class}__item`;
      this.labelClass = `${this.class}__label`;
      this.termClass = `${this.class}__term`;
      this.detailsClass = `${this.class}__details`;
      this.selectClass = 'form__select';
      this.checkboxLabelClass = 'form__checkbox-label';
      this.checkboxInputClass = 'form__checkbox-input';
    }
    init() {
      if (!this.select) return;
      this.element.insertAdjacentHTML('beforeend', this.initButtonSelect() + this.initListSelect());
      this.dropdown = this.element.querySelector(`.js-${this.dropdownClass}`);
      this.trigger = this.element.querySelector(`.js-${this.buttonClass}`);
      this.customOptions = this.dropdown.querySelectorAll(`.js-${this.optionClass}`);
      this.list = this.dropdown.querySelector(`.js-${this.listClass}`);
      this.list.insertAdjacentHTML('afterbegin', this.initAllButton());
      this.allButton = this.list.querySelector(`.js-${this.allButtonClass}`);
      this.select.classList.add(this.hideClass);
      if (this.arrowIcon.length > 0) this.arrowIcon[0].style.display = 'none';
      this.initCustomSelectEvents();
      this.updateAllButton();
    }
    initCustomSelectEvents() {
      this.initSelection();
      this.trigger.addEventListener('click', event => {
        event.preventDefault();
        this.toggleCustomSelect(false);
      });
      if (this.label) {
        this.label.addEventListener('click', () => {
          this.constructor.moveFocusFn(this.trigger);
        });
      }
      this.dropdown.addEventListener('keydown', event => {
        if (event.key && event.key.toLowerCase() === 'arrowup') {
          this.keyboardCustomSelect('prev', event);
        } else if (event.key && event.key.toLowerCase() === 'arrowdown') {
          this.keyboardCustomSelect('next', event);
        }
      });
      window.addEventListener('keyup', event => {
        if (event.key && event.key.toLowerCase() === 'escape') {
          this.moveFocusToSelectTrigger();
          this.toggleCustomSelect('false');
        }
      });
      window.addEventListener('click', event => {
        this.checkCustomSelectClick(event.target);
      });
    }
    toggleCustomSelect(bool) {
      let ariaExpanded;
      if (bool) {
        ariaExpanded = bool;
      } else {
        ariaExpanded = this.trigger.getAttribute('aria-expanded') === 'true' ? 'false' : 'true';
      }
      this.trigger.setAttribute('aria-expanded', ariaExpanded);
      if (ariaExpanded === 'true') {
        const selectedOption = this.getSelectedOption() || this.allButton;
        this.constructor.moveFocusFn(selectedOption);
        const cb = () => {
          this.constructor.moveFocusFn(selectedOption);
          this.dropdown.removeEventListener('transitionend', cb);
        };
        this.dropdown.addEventListener('transitionend', cb);
        this.constructor.trapFocus(this.dropdown);
        this.placeDropdown();
      }
    }
    placeDropdown() {
      const {
        top,
        bottom,
        left
      } = this.trigger.getBoundingClientRect();
      this.dropdown.classList.toggle(`${this.prefix}${this.dropdownClass}--right`, window.innerWidth < left + this.dropdown.offsetWidth);
      const moveUp = window.innerHeight - bottom < top;
      this.dropdown.classList.toggle(`${this.prefix}${this.dropdownClass}--up`, moveUp);
      const maxHeight = moveUp ? top - 20 : window.innerHeight - bottom - 20;
      const vhCalc = Math.ceil(100 * maxHeight / window.innerHeight);
      this.dropdown.setAttribute('style', `max-height: ${vhCalc}vh;`);
    }
    keyboardCustomSelect(direction, event) {
      event.preventDefault();
      const allOptions = [...this.customOptions, this.allButton];
      let index = allOptions.findIndex(option => option === document.activeElement.closest(`.js-${this.optionClass}`));
      index = direction === 'next' ? index + 1 : index - 1;
      if (index < 0) index = allOptions.length - 1;
      if (index >= allOptions.length) index = 0;
      const targetOption = allOptions[index].querySelector(`.js-${this.checkboxClass}`) || this.allButton;
      this.constructor.moveFocusFn(targetOption);
    }
    toggleAllButton() {
      const status = !this.allButton.classList.contains(this.showClass);
      this.allButton.classList.toggle(this.showClass, status);
      const [optionsArray, totalOptions, selectedOptions] = this.getOptions();
      optionsArray.forEach(option => {
        option.setAttribute('aria-selected', 'false');
        this.selectOption(option);
      });
      if (selectedOptions === totalOptions) {
        optionsArray.forEach(option => this.selectOption(option));
      }
    }
    initSelection() {
      this.allButton.addEventListener('click', event => {
        event.preventDefault();
        this.toggleAllButton();
      });
      this.dropdown.addEventListener('change', event => {
        const option = event.target.closest(`.js-${this.optionClass}`);
        if (!option) return;
        this.selectOption(option);
      });
      this.dropdown.addEventListener('click', event => {
        const option = event.target.closest(`.js-${this.optionClass}`);
        if (!option || !event.target.classList.contains(`js-${this.optionClass}`)) return;
        this.selectOption(option);
      });
    }
    selectOption(option) {
      const input = option.querySelector(`.js-${this.checkboxClass}`);
      if (option.hasAttribute('aria-selected') && option.getAttribute('aria-selected') === 'true') {
        input.checked = false;
        input.removeAttribute('checked');
        option.setAttribute('aria-selected', 'false');
        this.updateNativeSelect(option.getAttribute('data-index'), false);
      } else {
        input.checked = true;
        input.value = true;
        input.setAttribute('checked', '');
        option.setAttribute('aria-selected', 'true');
        this.updateNativeSelect(option.getAttribute('data-index'), true);
      }
      const triggerLabel = this.getSelectedOptionText();
      const [selectedLabel] = triggerLabel;
      this.trigger.querySelector(`.js-${this.labelClass}`).innerHTML = selectedLabel;
      this.trigger.classList.toggle(`${this.prefix}${this.buttonClass}--active`, this.selectedOptCounter > 0);
      this.updateTriggerAria(triggerLabel[1]);
      this.updateAllButton();
    }
    updateAllButton() {
      const [, totalOptions, selectedOptions] = this.getOptions();
      if (selectedOptions === totalOptions) {
        this.allButton.classList.add(this.showClass);
      } else {
        this.allButton.classList.remove(this.showClass);
      }
    }
    updateNativeSelect(index, bool) {
      this.options[index].selected = bool;
      this.select.dispatchEvent(new CustomEvent('change', {
        bubbles: true
      }));
    }
    updateTriggerAria(ariaLabel) {
      this.trigger.setAttribute('aria-label', ariaLabel);
    }
    getSelectedOptionText() {
      const noSelectionText = `<span class="${this.prefix}${this.termClass}">${this.noSelectText}</span>`;
      if (this.noUpdateLabel) return [noSelectionText, this.noSelectText];
      let label = '';
      let ariaLabel = '';
      this.selectedOptCounter = 0;
      for (let i = 0; i < this.options.length; i += 1) {
        if (this.options[i].selected) {
          if (this.selectedOptCounter !== 0) label += ', ';
          label = `${label}${this.options[i].text}`;
          this.selectedOptCounter += 1;
        }
      }
      if (this.selectedOptCounter > this.nMultiSelect) {
        label = `<span class="${this.prefix}${this.detailsClass}">${this.multiSelectText.replace('{n}', this.selectedOptCounter)}</span>`;
        ariaLabel = `${this.multiSelectText.replace('{n}', this.selectedOptCounter)}, ${this.noSelectText}`;
      } else if (this.selectedOptCounter > 0) {
        ariaLabel = `${label}, ${this.noSelectText}`;
        label = `<span class="${this.prefix}${this.detailsClass}">${label}</span>`;
      } else {
        label = noSelectionText;
        ariaLabel = this.noSelectText;
      }
      if (this.insetLabel && this.selectedOptCounter > 0) label = noSelectionText + label;
      return [label, ariaLabel];
    }
    initButtonSelect() {
      const customClasses = this.element.getAttribute('data-trigger-class') ? ` ${this.element.getAttribute('data-trigger-class')}` : '';
      const error = this.select.getAttribute('aria-invalid');
      const triggerLabel = this.getSelectedOptionText();
      const activeSelectionClass = this.selectedOptCounter > 0 ? ` ${this.buttonClass}--active` : '';
      let button = `<button class="js-${this.buttonClass} ${error === 'true' ? this.errorClass : ''} ${this.prefix}${this.selectClass} ${this.prefix}${this.buttonClass}${customClasses}${activeSelectionClass}" aria-label="${triggerLabel[1]}" aria-expanded="false" aria-controls="${this.selectId}-dropdown"><span aria-hidden="true" class="js-${this.labelClass} ${this.prefix}${this.labelClass}">${triggerLabel[0]}</span><span class="material-icons nsw-material-icons" focusable="false" aria-hidden="true">keyboard_arrow_down</span>`;
      if (this.arrowIcon.length > 0 && this.arrowIcon[0].outerHTML) {
        button += this.arrowIcon[0].outerHTML;
      }
      return `${button}</button>`;
    }
    initListSelect() {
      let list = `<div class="js-${this.dropdownClass} ${this.prefix}${this.dropdownClass}" aria-describedby="${this.selectId}-description" id="${this.selectId}-dropdown">`;
      list += this.getSelectLabelSR();
      if (this.optGroups.length > 0) {
        for (let i = 0; i < this.optGroups.length; i += 1) {
          const optGroupList = this.optGroups[i].getElementsByTagName('option');
          const optGroupLabel = `<li><span class="${this.prefix}${this.itemClass} ${this.prefix}${this.itemClass}--optgroup">${this.optGroups[i].getAttribute('label')}</span></li>`;
          list = `${list}<ul class="${this.prefix}${this.listClass}" role="listbox" aria-multiselectable="true">${optGroupLabel}${this.getOptionsList(optGroupList)}</ul>`;
        }
      } else {
        list = `${list}<ul class="${this.prefix}${this.listClass} js-${this.listClass}" role="listbox" aria-multiselectable="true">${this.getOptionsList(this.options)}</ul>`;
      }
      return list;
    }
    initAllButton() {
      return `<button class="${this.prefix}${this.allButtonClass} js-${this.allButtonClass}"><span>All</span></button>`;
    }
    getSelectLabelSR() {
      if (this.label) {
        return `<p class="${this.srClass}" id="${this.selectId}-description">${this.label.textContent}</p>`;
      }
      return '';
    }
    getOptionsList(options) {
      let list = '';
      for (let i = 0; i < options.length; i += 1) {
        const selected = options[i].hasAttribute('selected') ? ' aria-selected="true"' : ' aria-selected="false"';
        const disabled = options[i].hasAttribute('disabled') ? 'disabled' : '';
        const checked = options[i].hasAttribute('selected') ? 'checked' : '';
        const uniqueName = this.constructor.createSafeCss(`${this.selectId}-${options[i].value}-${this.optionIndex.toString()}`);
        list = `${list}<li class="js-${this.optionClass}" role="option" data-value="${options[i].value}" ${selected} data-label="${options[i].text}" data-index="${this.optionIndex}"><input aria-hidden="true" class="${this.prefix}${this.checkboxInputClass} js-${this.checkboxClass}" type="checkbox" id="${uniqueName}" ${checked} ${disabled}><label class="${this.prefix}${this.checkboxLabelClass} ${this.prefix}${this.itemClass} ${this.prefix}${this.itemClass}--option" aria-hidden="true" for="${uniqueName}"><span>${options[i].text}</span></label></li>`;
        this.optionIndex += 1;
      }
      return list;
    }
    getSelectedOption() {
      const option = this.dropdown.querySelector('[aria-selected="true"]');
      if (option) return option.querySelector(`.js-${this.checkboxClass}`);
      return this.allButton;
    }
    getOptions() {
      const options = Array.from(this.dropdown.querySelectorAll(`.js-${this.optionClass}`));
      const total = options.length;
      const selected = options.filter(option => option.getAttribute('aria-selected') === 'true').length;
      return [options, total, selected];
    }
    moveFocusToSelectTrigger() {
      if (!document.activeElement.closest(`.js-${this.class}`)) return;
      this.trigger.focus();
    }
    static trapFocus(element) {
      const focusableElements = 'a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled])';
      const firstFocusableElement = element.querySelectorAll(focusableElements)[0];
      const focusableContent = element.querySelectorAll(focusableElements);
      const lastFocusableElement = focusableContent[focusableContent.length - 1];
      document.addEventListener('keydown', event => {
        const isTabPressed = event.key === 'Tab' || event.code === 9;
        if (!isTabPressed) {
          return;
        }
        if (event.shiftKey) {
          if (document.activeElement === firstFocusableElement) {
            lastFocusableElement.focus();
            event.preventDefault();
          }
        } else if (document.activeElement === lastFocusableElement) {
          firstFocusableElement.focus();
          event.preventDefault();
        }
      });
      firstFocusableElement.focus();
    }
    checkCustomSelectClick(target) {
      if (!this.element.contains(target)) this.toggleCustomSelect('false');
    }
    static createSafeCss(str) {
      const invalidBeginningOfClassname = /^([0-9]|--|-[0-9])/;
      if (typeof str !== 'string') {
        return '';
      }
      const strippedClassname = str.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g).map(x => x.toLowerCase()).join('-');
      return invalidBeginningOfClassname.test(strippedClassname) ? `_${strippedClassname}` : strippedClassname;
    }
    static moveFocusFn(element) {
      element.focus();
      if (document.activeElement !== element) {
        element.setAttribute('tabindex', '-1');
        element.focus();
      }
    }
  }

  class SiteSearch {
    constructor(element) {
      this.element = element;
      this.originalButton = document.querySelector('.js-open-search');
      this.targetElement = document.getElementById(this.element.getAttribute('aria-controls'));
      this.searchInput = this.targetElement.querySelector('input.js-search-input');
      this.pressed = this.element.getAttribute('aria-expanded') === 'true';
    }
    init() {
      if (!this.originalButton) return;
      this.controls();
    }
    controls() {
      this.element.addEventListener('click', this.showHide.bind(this), false);
    }
    showHide() {
      if (this.pressed) {
        this.targetElement.hidden = true;
        this.originalButton.hidden = false;
        this.originalButton.focus();
      } else {
        this.targetElement.hidden = false;
        this.originalButton.hidden = true;
        this.searchInput.focus();
      }
    }
  }

  class Tabs {
    constructor(element, showTab) {
      this.element = element;
      this.tablistClass = '.nsw-tabs__list';
      this.tablistItemClass = 'li';
      this.tablistLinkClass = 'a';
      this.showTab = showTab;
      this.tabList = this.element.querySelector(this.tablistClass);
      this.tabItems = this.tabList && this.tabList.querySelectorAll(this.tablistItemClass);
      this.allowedKeys = [35, 36, 37, 39, 40];
      this.tabLinks = [];
      this.tabPanel = [];
      this.selectedTab = null;
      this.clickTabEvent = event => this.clickTab(event);
      this.arrowKeysEvent = event => this.arrowKeys(event);
      this.owns = [];
    }
    init() {
      if (!this.tabList) return;
      this.setUpDom();
      this.controls();
      this.setInitalTab();
    }
    setUpDom() {
      const tabListWrapper = document.createElement('div');
      tabListWrapper.classList.add('nsw-tabs__list-wrapper');
      this.element.prepend(tabListWrapper);
      tabListWrapper.prepend(this.tabList);
      this.tabList.setAttribute('role', 'tablist');
      this.tabItems.forEach(item => {
        const itemElem = item;
        const itemLink = item.querySelector(this.tablistLinkClass);
        const panel = this.element.querySelector(itemLink.hash);
        const uID = uniqueId('tab');
        this.owns.push(uID);
        itemElem.setAttribute('role', 'presentation');
        this.enhanceTabLink(itemLink, uID);
        this.enhanceTabPanel(panel, uID);
      });
      this.tabList.setAttribute('aria-owns', this.owns.join(' '));
    }
    enhanceTabLink(link, id) {
      link.setAttribute('role', 'tab');
      link.setAttribute('id', id);
      link.setAttribute('aria-selected', false);
      link.setAttribute('tabindex', '-1');
      this.tabLinks.push(link);
    }
    enhanceTabPanel(panel, id) {
      const panelElem = panel;
      panelElem.setAttribute('role', 'tabpanel');
      panelElem.setAttribute('role', 'tabpanel');
      panelElem.setAttribute('aria-labelledBy', id);
      panelElem.setAttribute('tabindex', '0');
      panelElem.hidden = true;
      this.tabPanel.push(panelElem);
    }
    setInitalTab() {
      const {
        tabLinks,
        tabPanel,
        showTab
      } = this;
      const index = showTab === undefined ? 0 : showTab;
      const selectedLink = tabLinks[index];
      selectedLink.classList.add('active');
      selectedLink.removeAttribute('tabindex');
      selectedLink.setAttribute('aria-selected', true);
      tabPanel[index].hidden = false;
      this.selectedTab = selectedLink;
    }
    clickTab(e) {
      e.preventDefault();
      this.switchTabs(e.currentTarget);
    }
    switchTabs(elem) {
      const clickedTab = elem;
      if (clickedTab !== this.selectedTab) {
        clickedTab.focus();
        clickedTab.removeAttribute('tabindex');
        clickedTab.setAttribute('aria-selected', true);
        clickedTab.classList.add('active');
        this.selectedTab.setAttribute('aria-selected', false);
        this.selectedTab.setAttribute('tabindex', '-1');
        this.selectedTab.classList.remove('active');
        const clickedTabIndex = this.tabLinks.indexOf(clickedTab);
        const selectedTabIndex = this.tabLinks.indexOf(this.selectedTab);
        this.tabPanel[clickedTabIndex].hidden = false;
        this.tabPanel[selectedTabIndex].hidden = true;
        this.selectedTab = clickedTab;
        if (!clickedTab.classList.contains('js-tabs-fixed')) {
          clickedTab.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'nearest'
          });
        }
      }
    }
    arrowKeys(_ref) {
      let {
        which
      } = _ref;
      const linkLength = this.tabLinks.length - 1;
      let index = this.tabLinks.indexOf(this.selectedTab);
      let down = false;
      if (this.allowedKeys.includes(which)) {
        switch (which) {
          case 35:
            index = linkLength;
            break;
          case 36:
            index = 0;
            break;
          case 37:
            index = index === 0 ? -1 : index -= 1;
            break;
          case 39:
            index = index === linkLength ? -1 : index += 1;
            break;
          case 40:
            down = true;
            break;
        }
        if (index > -1) {
          if (down) {
            this.tabPanel[index].focus();
          } else {
            this.switchTabs(this.tabLinks[index]);
          }
        }
      }
    }
    controls() {
      this.tabLinks.forEach(link => {
        link.addEventListener('click', this.clickTabEvent, false);
        link.addEventListener('keydown', this.arrowKeysEvent, false);
      });
    }
  }

  /* eslint-disable */
  function cleanHTML(str, nodes) {
    function stringToHTML() {
      const parser = new DOMParser();
      const doc = parser.parseFromString(str, 'text/html');
      return doc.body || document.createElement('body');
    }
    function removeScripts(html) {
      const scripts = html.querySelectorAll('script');
      for (const script of scripts) {
        script.remove();
      }
    }
    function isPossiblyDangerous(name, value) {
      const val = value.replace(/\s+/g, '').toLowerCase();
      if (['src', 'href', 'xlink:href'].includes(name)) {
        if (val.includes('javascript:') || val.includes('data:text/html')) return true;
      }
      if (name.startsWith('on')) return true;
      return false;
    }
    function removeAttributes(elem) {
      const atts = elem.attributes;
      for (const {
        name,
        value
      } of atts) {
        if (!isPossiblyDangerous(name, value)) continue;
        elem.removeAttribute(name);
      }
    }
    function clean(html) {
      const htmlNodes = html.children;
      for (const node of htmlNodes) {
        removeAttributes(node);
        clean(node);
      }
    }
    const html = stringToHTML();
    removeScripts(html);
    clean(html);
    return nodes ? html.childNodes : html.innerHTML;
  }

  /* eslint-disable max-len, import/no-extraneous-dependencies */
  class Toggletip {
    constructor(element) {
      this.toggletip = element;
      this.toggletipId = this.toggletip.getAttribute('aria-controls');
      this.toggletipElement = this.toggletipId && document.querySelector(`#${this.toggletipId}`);
      this.toggletipContent = false;
      this.toggletipAnchor = this.toggletip.querySelector('[data-anchor]') || this.toggletip;
      this.toggletipText = this.toggletip.innerText;
      this.toggletipHeading = this.toggletip.getAttribute('data-title') || this.toggletipText;
      this.arrowElement = false;
      this.closeButton = false;
      this.toggletipIsOpen = false;
      this.toggletipVisibleClass = 'active';
      this.firstFocusable = false;
      this.lastFocusable = false;
    }
    init() {
      if (!this.toggletipElement) return;
      this.constructor.setAttributes(this.toggletip, {
        tabindex: '0',
        'aria-haspopup': 'dialog'
      });
      this.initEvents();
    }
    initEvents() {
      this.toggletip.addEventListener('click', this.toggleToggletip.bind(this));
      this.toggletip.addEventListener('keyup', event => {
        if (event.code && event.code.toLowerCase() === 'enter' || event.key && event.key.toLowerCase() === 'enter') {
          this.toggleToggletip();
        }
      });
      window.addEventListener('DOMContentLoaded', () => {
        this.toggletipContent = this.toggletipElement.innerHTML;
      });
      this.toggletipElement.addEventListener('keydown', this.trapFocus.bind(this));
      window.addEventListener('click', event => {
        this.checkToggletipClick(event.target);
      });
      window.addEventListener('keyup', event => {
        if (event.code && event.code.toLowerCase() === 'escape' || event.key && event.key.toLowerCase() === 'escape') {
          this.checkToggletipFocus();
        }
      });
      window.addEventListener('resize', () => {
        if (this.toggletipIsOpen) this.toggleToggletip();
      });
      window.addEventListener('scroll', () => {
        if (this.toggletipIsOpen) this.toggleToggletip();
      });
    }
    toggleToggletip() {
      if (this.toggletipElement.classList.contains('active')) {
        this.hideToggletip();
      } else {
        this.toggletipElement.focus();
        this.showToggletip();
      }
    }
    createToggletipElement() {
      if (this.toggletipElement) {
        this.toggletipElement.innerHTML = '';
        const createToggletip = `
      <div class="nsw-toggletip__header">
        <div id="nsw-toggletip__header" class="sr-only">${cleanHTML(this.toggletipHeading)}</div>
        <button type="button" class="nsw-icon-button">
          <span class="sr-only">Remove file</span>
          <span class="material-icons nsw-material-icons" focusable="false" aria-hidden="true">close</span>
        </button>
      </div>
      <div id="nsw-toggletip__content" class="nsw-toggletip__content">
        ${cleanHTML(this.toggletipContent)}
      </div>
      <div class="nsw-toggletip__arrow"></div>`;
        this.toggletipElement.insertAdjacentHTML('afterbegin', createToggletip);
      }
      this.constructor.setAttributes(this.toggletipElement, {
        'aria-labelledby': 'nsw-toggletip__header',
        'aria-describedby': 'nsw-toggletip__content',
        'aria-expanded': 'false',
        tabindex: '0',
        role: 'dialog'
      });
    }
    showToggletip() {
      this.createToggletipElement();
      this.arrowElement = this.toggletipElement.querySelector('.nsw-toggletip__arrow');
      this.closeButton = this.toggletipElement.querySelector('.nsw-icon-button');
      this.toggletipElement.setAttribute('aria-expanded', 'true');
      this.toggletipElement.classList.add('active');
      this.toggletipIsOpen = true;
      this.getFocusableElements();
      this.toggletipElement.focus({
        preventScroll: true
      });
      this.toggletip.addEventListener('transitionend', () => {
        this.focusToggletip();
      }, {
        once: true
      });
      this.updateToggletip(this.toggletipElement, this.arrowElement);
      this.closeButton.addEventListener('click', this.toggleToggletip.bind(this));
    }
    hideToggletip() {
      this.toggletipElement.setAttribute('aria-expanded', 'false');
      this.toggletipElement.classList.remove('active');
      this.toggletipIsOpen = false;
    }
    updateToggletip(toggletip, arrowElement) {
      let anchor = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.toggletipAnchor;
      computePosition(anchor, toggletip, {
        placement: 'top',
        middleware: [offset(8), flip(), shift({
          padding: 5
        }), arrow({
          element: arrowElement
        })]
      }).then(_ref => {
        let {
          x,
          y,
          placement,
          middlewareData
        } = _ref;
        Object.assign(toggletip.style, {
          left: `${x}px`,
          top: `${y}px`
        });
        const {
          x: arrowX,
          y: arrowY
        } = middlewareData.arrow;
        const staticSide = {
          top: 'bottom',
          right: 'left',
          bottom: 'top',
          left: 'right'
        }[placement.split('-')[0]];
        Object.assign(arrowElement.style, {
          left: arrowX != null ? `${arrowX}px` : '',
          top: arrowY != null ? `${arrowY}px` : '',
          right: '',
          bottom: '',
          [staticSide]: '-6px'
        });
      });
    }
    checkToggletipClick(target) {
      if (!this.toggletipIsOpen) return;
      if (!this.toggletipElement.contains(target) && !target.closest(`[aria-controls="${this.toggletipId}"]`)) this.toggleToggletip();
    }
    checkToggletipFocus() {
      if (!this.toggletipIsOpen) return;
      this.constructor.moveFocus(this.toggletip);
      this.toggleToggletip();
    }
    focusToggletip() {
      if (this.firstFocusable) {
        this.firstFocusable.focus({
          preventScroll: true
        });
      } else {
        this.constructor.moveFocus(this.toggletipElement);
      }
    }
    getFocusableElements() {
      const focusableElString = '[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary';
      const allFocusable = this.toggletipElement.querySelectorAll(focusableElString);
      this.getFirstVisible(allFocusable);
      this.getLastVisible(allFocusable);
    }
    getFirstVisible(elements) {
      for (let i = 0; i < elements.length; i += 1) {
        if (this.constructor.isVisible(elements[i])) {
          this.firstFocusable = elements[i];
          break;
        }
      }
    }
    getLastVisible(elements) {
      for (let i = elements.length - 1; i >= 0; i -= 1) {
        if (this.constructor.isVisible(elements[i])) {
          this.lastFocusable = elements[i];
          break;
        }
      }
    }
    trapFocus(event) {
      if (this.firstFocusable === document.activeElement && event.shiftKey) {
        event.preventDefault();
        this.lastFocusable.focus();
      }
      if (this.lastFocusable === document.activeElement && !event.shiftKey) {
        event.preventDefault();
        this.firstFocusable.focus();
      }
    }
    static isVisible(element) {
      return element.offsetWidth || element.offsetHeight || element.getClientRects().length;
    }
    static moveFocus(element) {
      element.focus({
        preventScroll: true
      });
      if (document.activeElement !== element) {
        element.setAttribute('tabindex', '-1');
        element.focus();
      }
    }
    static setAttributes(el, attrs) {
      Object.keys(attrs).forEach(key => el.setAttribute(key, attrs[key]));
    }
  }

  /* eslint-disable max-len */
  class Tooltip {
    constructor(element) {
      this.tooltip = element;
      this.uID = uniqueId('tooltip');
      this.tooltipElement = false;
      this.arrowElement = false;
      this.tooltipContent = false;
      this.tooltipDelay = 400;
      this.screenSize = false;
      this.tooltipTheme = this.tooltip.getAttribute('data-theme') || 'dark';
    }
    init() {
      this.tooltipContent = this.tooltip.getAttribute('title');
      if (!this.tooltipContent) return;
      this.constructor.setAttributes(this.tooltip, {
        'data-tooltip-content': this.tooltipContent,
        'aria-describedby': this.uID,
        tabindex: '0'
      });
      this.tooltip.removeAttribute('title');
      const eventArray = ['mouseenter', 'mouseleave', 'focus', 'blur'];
      eventArray.forEach((event, _ref) => {
        let {
          listener = this.handleEvent.bind(this)
        } = _ref;
        this.tooltip.addEventListener(event, listener);
      });
    }
    handleEvent(event) {
      switch (event.type) {
        case 'mouseenter':
        case 'focus':
          this.showTooltip(this, event);
          break;
        case 'mouseleave':
        case 'blur':
          this.hideTooltip(this, event);
          break;
        default:
          console.log(`Unexpected event type: ${event.type}`);
          break;
      }
    }
    createTooltipElement() {
      if (!this.tooltipElement) {
        this.tooltipElement = document.createElement('div');
        document.body.appendChild(this.tooltipElement);
      }
      this.constructor.setAttributes(this.tooltipElement, {
        id: this.uID,
        class: `nsw-tooltip__element nsw-tooltip__element--${this.tooltipTheme}`,
        role: 'tooltip'
      });
      if (this.tooltip) {
        this.arrowElement = document.createElement('div');
        this.arrowElement.className = 'nsw-tooltip__arrow';
      }
      this.tooltipContent = this.tooltip.getAttribute('data-tooltip-content');
      this.tooltipElement.innerHTML = this.tooltipContent;
      this.tooltipElement.insertAdjacentElement('beforeend', this.arrowElement);
    }
    showTooltip() {
      setTimeout(() => {
        this.createTooltipElement();
        this.tooltipElement.classList.add('active');
        const range = document.createRange();
        const text = this.tooltipElement.childNodes[0];
        range.setStartBefore(text);
        range.setEndAfter(text);
        const clientRect = range.getBoundingClientRect();
        this.matchMedia();
        this.tooltipElement.style.width = `${clientRect.width + this.screenSize}px`;
        this.updateTooltip(this.tooltipElement, this.arrowElement);
      }, this.tooltipDelay);
    }
    hideTooltip() {
      setTimeout(() => {
        this.tooltipElement.classList.remove('active');
        this.tooltipElement.style.width = '';
      }, this.tooltipDelay);
    }
    matchMedia() {
      if (window.matchMedia('(min-width: 576px)').matches) {
        this.screenSize = 32;
      } else {
        this.screenSize = 16;
      }
    }
    updateTooltip(tooltip, arrowElement) {
      let anchor = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.tooltip;
      computePosition(anchor, tooltip, {
        placement: 'top',
        middleware: [offset(8), flip(), shift({
          padding: 5
        }), arrow({
          element: arrowElement
        })]
      }).then(_ref2 => {
        let {
          x,
          y,
          placement,
          middlewareData
        } = _ref2;
        Object.assign(tooltip.style, {
          left: `${x}px`,
          top: `${y}px`
        });

        // Accessing the data
        const {
          x: arrowX,
          y: arrowY
        } = middlewareData.arrow;
        const staticSide = {
          top: 'bottom',
          right: 'left',
          bottom: 'top',
          left: 'right'
        }[placement.split('-')[0]];
        Object.assign(arrowElement.style, {
          left: arrowX != null ? `${arrowX}px` : '',
          top: arrowY != null ? `${arrowY}px` : '',
          right: '',
          bottom: '',
          [staticSide]: '-6px'
        });
      });
    }
    static setAttributes(el, attrs) {
      Object.keys(attrs).forEach(key => el.setAttribute(key, attrs[key]));
    }
  }

  class UtilityList extends Toggletip {
    constructor(element) {
      let toggletip = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : element.querySelector('.js-share');
      super(toggletip === null ? element : toggletip);
      this.element = element;
      this.share = toggletip;
      this.print = this.element.querySelectorAll('.js-print-page');
      this.download = this.element.querySelectorAll('.js-download-page');
      this.copy = this.element.querySelectorAll('.js-copy-clipboard');
      this.shareItems = this.share && this.share.querySelectorAll('a');
      this.urlLocation = window.location.href;
      this.copyElement = false;
    }
    init() {
      if (this.share) {
        super.init();
        this.shareItems.forEach(share => {
          const shareLocation = share.getAttribute('data-url');
          if (!shareLocation) {
            share.setAttribute('data-url', window.location.href);
          }
        });
        this.share.addEventListener('click', event => {
          const button = event.target.closest('a');
          if (!button) return;
          event.preventDefault();
          const social = button.getAttribute('data-social');
          const url = this.getSocialUrl(button, social);
          if (social === 'mail') {
            window.location.href = url;
          } else {
            window.open(url, `${social}-share-dialog`, 'width=626,height=436');
          }
        });
      }
      if (this.print) {
        this.print.forEach(element => {
          element.setAttribute('tabindex', '0');
          element.addEventListener('click', () => {
            window.print();
          });
          element.addEventListener('keyup', event => {
            if (event.code && event.code.toLowerCase() === 'enter' || event.key && event.key.toLowerCase() === 'enter') {
              window.print();
            }
          });
        });
      }
      if (this.download) {
        this.download.forEach(element => {
          element.setAttribute('tabindex', '0');
        });
      }
      if (this.copy) {
        this.copy.forEach(element => {
          element.setAttribute('tabindex', '0');
          element.addEventListener('click', () => {
            this.copyToClipboard(element);
          });
          element.addEventListener('keyup', event => {
            if (event.code && event.code.toLowerCase() === 'enter' || event.key && event.key.toLowerCase() === 'enter') {
              this.copyToClipboard(element);
            }
          });
        });
      }
    }
    getSocialUrl(button, social) {
      const params = this.getSocialParams(social);
      let newUrl = '';
      if (social === 'twitter') {
        this.getTwitterText(button);
      }
      params.forEach(param => {
        let paramValue = button.getAttribute(`data-${param}`);
        if (param === 'hashtags') paramValue = encodeURI(paramValue.replace(/#| /g, ''));
        if (paramValue) {
          if (social === 'facebook') {
            newUrl = `${newUrl}u=${encodeURIComponent(paramValue)}&`;
          } else {
            newUrl = `${newUrl + param}=${encodeURIComponent(paramValue)}&`;
          }
        }
      });
      if (social === 'linkedin') newUrl = `mini=true&${newUrl}`;
      return `${button.getAttribute('href')}?${newUrl}`;
    }
    getSocialParams(social) {
      switch (social) {
        case 'twitter':
          this.socialParams = ['text', 'hashtags'];
          break;
        case 'facebook':
        case 'linkedin':
          this.socialParams = ['url'];
          break;
        case 'mail':
          this.socialParams = ['subject', 'body'];
          break;
        default:
          console.log('No social links found');
          break;
      }
      return this.socialParams;
    }
    getTwitterText(button) {
      let twitText = button.getAttribute('data-text');
      const twitUrl = button.getAttribute('data-url') || this.urlLocation;
      const twitUsername = button.getAttribute('data-username');
      if (twitUsername) {
        twitText = `${twitText} ${twitUrl} via ${twitUsername}`;
      } else {
        twitText = `${twitText} ${twitUrl}`;
      }
      button.setAttribute('data-text', twitText);
      button.removeAttribute('data-url');
      button.removeAttribute('data-username');
    }
    copyToClipboard(element) {
      if (!navigator.clipboard) {
        const input = document.createElement('input');
        input.setAttribute('value', this.urlLocation);
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        this.copiedMessage(element);
      } else {
        navigator.clipboard.writeText(this.urlLocation).then(() => {
          this.copiedMessage(element);
        });
      }
    }
    copiedMessage(element) {
      this.copyElement = element;
      const icon = '<span class="material-icons nsw-material-icons" focusable="false" aria-hidden="true">link</span>';
      this.copyElement.classList.add('copied');
      this.copyElement.innerHTML = `${icon} Copied`;
      setTimeout(() => {
        this.copyElement.classList.remove('copied');
        this.copyElement.innerHTML = `${icon} Copy link`;
      }, 3000);
    }
  }

  /* eslint-disable max-len */
  if (window.NodeList && !NodeList.prototype.forEach) {
    NodeList.prototype.forEach = Array.prototype.forEach;
  }
  if (!Element.prototype.closest) {
    if (!Element.prototype.matches) {
      Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
    }
    Element.prototype.closest = function closest(s) {
      const el = this;
      let ancestor = this;
      if (!document.documentElement.contains(el)) return null;
      do {
        if (ancestor.matches(s)) return ancestor;
        ancestor = ancestor.parentElement;
      } while (ancestor !== null);
      return null;
    };
  }
  function initSite() {
    const accordions = document.querySelectorAll('.js-accordion');
    const backTop = document.querySelectorAll('button.js-back-to-top');
    const carousel = document.querySelectorAll('.js-carousel');
    const closeSearchButton = document.querySelectorAll('button.js-close-search');
    const datePicker = document.querySelectorAll('.js-date-input');
    const dialogs = document.querySelectorAll('.js-dialog');
    const fileUpload = document.querySelectorAll('.js-file-upload');
    const filters = document.querySelectorAll('.js-filters');
    const globalAlert = document.querySelectorAll('.js-global-alert');
    const link = document.querySelectorAll('a.js-link');
    const multiSelect = document.querySelectorAll('.js-multi-select');
    const navigation = document.getElementById('main-nav');
    const openSearchButton = document.querySelectorAll('button.js-open-search');
    const popover = document.querySelectorAll('.js-popover');
    const tabs = document.querySelectorAll('.js-tabs');
    const toggletip = document.querySelectorAll('.js-toggletip');
    const tooltip = document.querySelectorAll('.js-tooltip');
    const utilityList = document.querySelectorAll('.js-utility-list');
    if (accordions) {
      accordions.forEach(element => {
        new Accordion(element).init();
      });
    }
    if (backTop) {
      backTop.forEach(element => {
        new BackTop(element).init();
      });
    }
    if (carousel) {
      carousel.forEach(element => {
        new Carousel(element).init();
      });
    }
    if (closeSearchButton) {
      closeSearchButton.forEach(element => {
        new SiteSearch(element).init();
      });
    }
    if (datePicker) {
      datePicker.forEach(element => {
        new DatePicker(element).init();
      });
    }
    if (dialogs) {
      dialogs.forEach(element => {
        new Dialog(element).init();
      });
    }
    if (fileUpload) {
      fileUpload.forEach(element => {
        new FileUpload(element).init();
      });
    }
    if (filters) {
      filters.forEach(element => {
        new Filters(element).init();
      });
    }
    if (globalAlert) {
      globalAlert.forEach(element => {
        new GlobalAlert(element).init();
      });
    }
    if (link) {
      link.forEach(element => {
        new ExternalLink(element).init();
      });
    }
    if (multiSelect) {
      multiSelect.forEach(element => {
        new Select(element).init();
      });
    }
    if (navigation) {
      new Navigation(navigation).init();
    }
    if (openSearchButton) {
      openSearchButton.forEach(element => {
        new SiteSearch(element).init();
      });
    }
    if (popover) {
      popover.forEach(element => {
        new Popover(element).init();
      });
    }
    if (tabs) {
      tabs.forEach(element => {
        new Tabs(element).init();
      });
    }
    if (toggletip) {
      toggletip.forEach(element => {
        new Toggletip(element).init();
      });
    }
    if (tooltip) {
      tooltip.forEach(element => {
        new Tooltip(element).init();
      });
    }
    if (utilityList) {
      utilityList.forEach(element => {
        new UtilityList(element).init();
      });
    }
  }

  exports.Accordion = Accordion;
  exports.BackTop = BackTop;
  exports.Carousel = Carousel;
  exports.DatePicker = DatePicker;
  exports.Dialog = Dialog;
  exports.ExternalLink = ExternalLink;
  exports.FileUpload = FileUpload;
  exports.Filters = Filters;
  exports.GlobalAlert = GlobalAlert;
  exports.Navigation = Navigation;
  exports.Popover = Popover;
  exports.Select = Select;
  exports.SiteSearch = SiteSearch;
  exports.Tabs = Tabs;
  exports.Toggletip = Toggletip;
  exports.Tooltip = Tooltip;
  exports.UtilityList = UtilityList;
  exports.initSite = initSite;

}));
