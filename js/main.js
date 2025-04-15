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
    return byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + '-' + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + '-' + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + '-' + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + '-' + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]];
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

  function createButtons({
    textContent
  }) {
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
    debounce(fn, wait = 250) {
      let timeout;
      return (...args) => {
        const context = this;
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
    static createElement(tag, classes = [], attributes = {}) {
      const element = document.createElement(tag);
      if (classes.length > 0) {
        element.classList.add(...classes);
      }
      Object.entries(attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
      });
      return element;
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

  /*!
  * CookieConsent 3.1.0
  * https://github.com/orestbida/cookieconsent
  * Author Orest Bida
  * Released under the MIT License
  */
  const e = 'opt-in',
    t = 'opt-out',
    o = 'show--consent',
    n = 'show--preferences',
    a = 'disable--interaction',
    s = 'data-category',
    c = 'div',
    r = 'button',
    i = 'aria-hidden',
    l = 'btn-group',
    d = 'click',
    f = 'data-role',
    _ = 'consentModal',
    u = 'preferencesModal';
  class p {
    constructor() {
      this.t = {
        mode: e,
        revision: 0,
        autoShow: !0,
        lazyHtmlGeneration: !0,
        autoClearCookies: !0,
        manageScriptTags: !0,
        hideFromBots: !0,
        cookie: {
          name: 'cc_cookie',
          expiresAfterDays: 182,
          domain: '',
          path: '/',
          secure: !0,
          sameSite: 'Lax'
        }
      }, this.o = {
        i: {},
        l: '',
        _: {},
        u: {},
        p: {},
        m: [],
        v: !1,
        h: null,
        C: null,
        S: null,
        M: '',
        D: !0,
        T: !1,
        k: !1,
        A: !1,
        N: !1,
        H: [],
        V: !1,
        I: !0,
        L: [],
        j: !1,
        F: '',
        P: !1,
        O: [],
        R: [],
        B: [],
        $: [],
        G: !1,
        J: !1,
        U: !1,
        q: [],
        K: [],
        W: [],
        X: {},
        Y: {},
        Z: {},
        ee: {},
        te: {},
        oe: []
      }, this.ne = {
        ae: {},
        se: {}
      }, this.ce = {}, this.re = {
        ie: 'cc:onFirstConsent',
        le: 'cc:onConsent',
        de: 'cc:onChange',
        fe: 'cc:onModalShow',
        _e: 'cc:onModalHide',
        ue: 'cc:onModalReady'
      };
    }
  }
  const g = new p(),
    m = (e, t) => e.indexOf(t),
    b = (e, t) => -1 !== m(e, t),
    v = e => Array.isArray(e),
    y = e => 'string' == typeof e,
    h = e => !!e && 'object' == typeof e && !v(e),
    C = e => 'function' == typeof e,
    w = e => Object.keys(e),
    S = e => Array.from(new Set(e)),
    x = () => document.activeElement,
    M = e => e.preventDefault(),
    D = (e, t) => e.querySelectorAll(t),
    k = e => {
      const t = document.createElement(e);
      return e === r && (t.type = e), t;
    },
    E = (e, t, o) => e.setAttribute(t, o),
    A = (e, t, o) => {
      e.removeAttribute(o ? 'data-' + t : t);
    },
    N = (e, t, o) => e.getAttribute(o ? 'data-' + t : t),
    H = (e, t) => e.appendChild(t),
    V = (e, t) => e.classList.add(t),
    I = (e, t) => V(e, 'cm__' + t),
    L = (e, t) => V(e, 'pm__' + t),
    j = (e, t) => e.classList.remove(t),
    F = e => {
      if ('object' != typeof e) return e;
      if (e instanceof Date) return new Date(e.getTime());
      let t = Array.isArray(e) ? [] : {};
      for (let o in e) {
        let n = e[o];
        t[o] = F(n);
      }
      return t;
    },
    P = () => {
      const e = {},
        {
          O: t,
          X: o,
          Y: n
        } = g.o;
      for (const a of t) e[a] = $(n[a], w(o[a]));
      return e;
    },
    O = (e, t) => dispatchEvent(new CustomEvent(e, {
      detail: t
    })),
    R = (e, t, o, n) => {
      e.addEventListener(t, o), n && g.o.m.push({
        pe: e,
        ge: t,
        me: o
      });
    },
    B = () => {
      const e = g.t.cookie.expiresAfterDays;
      return C(e) ? e(g.o.F) : e;
    },
    $ = (e, t) => {
      const o = e || [],
        n = t || [];
      return o.filter(e => !b(n, e)).concat(n.filter(e => !b(o, e)));
    },
    G = e => {
      g.o.R = S(e), g.o.F = (() => {
        let e = 'custom';
        const {
            R: t,
            O: o,
            B: n
          } = g.o,
          a = t.length;
        return a === o.length ? e = 'all' : a === n.length && (e = 'necessary'), e;
      })();
    },
    J = (e, t, o, n) => {
      const a = 'accept-',
        {
          show: s,
          showPreferences: c,
          hide: r,
          hidePreferences: i,
          acceptCategory: l
        } = t,
        f = e || document,
        _ = e => D(f, `[data-cc="${e}"]`),
        u = (e, t) => {
          M(e), l(t), i(), r();
        },
        p = _('show-preferencesModal'),
        m = _('show-consentModal'),
        b = _(a + 'all'),
        v = _(a + 'necessary'),
        y = _(a + 'custom'),
        h = g.t.lazyHtmlGeneration;
      for (const e of p) E(e, 'aria-haspopup', 'dialog'), R(e, d, e => {
        M(e), c();
      }), h && (R(e, 'mouseenter', e => {
        M(e), g.o.N || o(t, n);
      }, !0), R(e, 'focus', () => {
        g.o.N || o(t, n);
      }));
      for (let e of m) E(e, 'aria-haspopup', 'dialog'), R(e, d, e => {
        M(e), s(!0);
      }, !0);
      for (let e of b) R(e, d, e => {
        u(e, 'all');
      }, !0);
      for (let e of y) R(e, d, e => {
        u(e);
      }, !0);
      for (let e of v) R(e, d, e => {
        u(e, []);
      }, !0);
    },
    U = (e, t) => {
      e && (t && (e.tabIndex = -1), e.focus(), t && e.removeAttribute('tabindex'));
    },
    z = (e, t) => {
      const o = n => {
        n.target.removeEventListener('transitionend', o), 'opacity' === n.propertyName && '1' === getComputedStyle(e).opacity && U((e => 1 === e ? g.ne.be : g.ne.ve)(t));
      };
      R(e, 'transitionend', o);
    };
  let q;
  const K = e => {
      clearTimeout(q), e ? V(g.ne.ye, a) : q = setTimeout(() => {
        j(g.ne.ye, a);
      }, 500);
    },
    Q = ['M 19.5 4.5 L 4.5 19.5 M 4.5 4.501 L 19.5 19.5', 'M 3.572 13.406 L 8.281 18.115 L 20.428 5.885', 'M 21.999 6.94 L 11.639 17.18 L 2.001 6.82 '],
    W = (e = 0, t = 1.5) => `<svg viewBox="0 0 24 24" stroke-width="${t}"><path d="${Q[e]}"/></svg>`,
    X = e => {
      const t = g.ne,
        o = g.o;
      (e => {
        const n = e === t.he,
          a = o.i.disablePageInteraction ? t.ye : n ? t.Ce : t.ye;
        R(a, 'keydown', t => {
          if ('Tab' !== t.key || !(n ? o.k && !o.A : o.A)) return;
          const a = x(),
            s = n ? o.q : o.K;
          0 !== s.length && (t.shiftKey ? a !== s[0] && e.contains(a) || (M(t), U(s[1])) : a !== s[1] && e.contains(a) || (M(t), U(s[0])));
        }, !0);
      })(e);
    },
    Y = ['[href]', r, 'input', 'details', '[tabindex]'].map(e => e + ':not([tabindex="-1"])').join(','),
    Z = e => {
      const {
          o: t,
          ne: o
        } = g,
        n = (e, t) => {
          const o = D(e, Y);
          t[0] = o[0], t[1] = o[o.length - 1];
        };
      1 === e && t.T && n(o.he, t.q), 2 === e && t.N && n(o.we, t.K);
    },
    ee = (e, t, o) => {
      const {
          de: n,
          le: a,
          ie: s,
          _e: c,
          ue: r,
          fe: i
        } = g.ce,
        l = g.re;
      if (t) {
        const n = {
          modalName: t
        };
        return e === l.fe ? C(i) && i(n) : e === l._e ? C(c) && c(n) : (n.modal = o, C(r) && r(n)), O(e, n);
      }
      const d = {
        cookie: g.o.p
      };
      e === l.ie ? C(s) && s(F(d)) : e === l.le ? C(a) && a(F(d)) : (d.changedCategories = g.o.L, d.changedServices = g.o.ee, C(n) && n(F(d))), O(e, F(d));
    },
    te = (e, t) => {
      try {
        return e();
      } catch (e) {
        return !t && console.warn('CookieConsent:', e), !1;
      }
    },
    oe = e => {
      const {
        Y: t,
        ee: o,
        O: n,
        X: a,
        oe: c,
        p: r,
        L: i
      } = g.o;
      for (const e of n) {
        const n = o[e] || t[e] || [];
        for (const o of n) {
          const n = a[e][o];
          if (!n) continue;
          const {
            onAccept: s,
            onReject: c
          } = n;
          !n.Se && b(t[e], o) ? (n.Se = !0, C(s) && s()) : n.Se && !b(t[e], o) && (n.Se = !1, C(c) && c());
        }
      }
      if (!g.t.manageScriptTags) return;
      const l = c,
        d = e || r.categories || [],
        f = (e, n) => {
          if (n >= e.length) return;
          const a = c[n];
          if (a.xe) return f(e, n + 1);
          const r = a.Me,
            l = a.De,
            _ = a.Te,
            u = b(d, l),
            p = !!_ && b(t[l], _);
          if (!_ && !a.ke && u || !_ && a.ke && !u && b(i, l) || _ && !a.ke && p || _ && a.ke && !p && b(o[l] || [], _)) {
            a.xe = !0;
            const t = N(r, 'type', !0);
            A(r, 'type', !!t), A(r, s);
            let o = N(r, 'src', !0);
            o && A(r, 'src', !0);
            const c = k('script');
            c.textContent = r.innerHTML;
            for (const {
              nodeName: e
            } of r.attributes) E(c, e, r[e] || N(r, e));
            t && (c.type = t), o ? c.src = o : o = r.src;
            const i = !!o && (!t || ['text/javascript', 'module'].includes(t));
            if (i && (c.onload = c.onerror = () => {
              f(e, ++n);
            }), r.replaceWith(c), i) return;
          }
          f(e, ++n);
        };
      f(l, 0);
    },
    ne = 'bottom',
    ae = 'left',
    se = 'center',
    ce = 'right',
    re = 'inline',
    ie = 'wide',
    le = 'pm--',
    de = ['middle', 'top', ne],
    fe = [ae, se, ce],
    _e = {
      box: {
        Ee: [ie, re],
        Ae: de,
        Ne: fe,
        He: ne,
        Ve: ce
      },
      cloud: {
        Ee: [re],
        Ae: de,
        Ne: fe,
        He: ne,
        Ve: se
      },
      bar: {
        Ee: [re],
        Ae: de.slice(1),
        Ne: [],
        He: ne,
        Ve: ''
      }
    },
    ue = {
      box: {
        Ee: [],
        Ae: [],
        Ne: [],
        He: '',
        Ve: ''
      },
      bar: {
        Ee: [ie],
        Ae: [],
        Ne: [ae, ce],
        He: '',
        Ve: ae
      }
    },
    pe = e => {
      const t = g.o.i.guiOptions,
        o = t && t.consentModal,
        n = t && t.preferencesModal;
      0 === e && ge(g.ne.he, _e, o, 'cm--', 'box', 'cm'), 1 === e && ge(g.ne.we, ue, n, le, 'box', 'pm');
    },
    ge = (e, t, o, n, a, s) => {
      e.className = s;
      const c = o && o.layout,
        r = o && o.position,
        i = o && o.flipButtons,
        l = !o || !1 !== o.equalWeightButtons,
        d = c && c.split(' ') || [],
        f = d[0],
        _ = d[1],
        u = f in t ? f : a,
        p = t[u],
        m = b(p.Ee, _) && _,
        v = r && r.split(' ') || [],
        y = v[0],
        h = n === le ? v[0] : v[1],
        C = b(p.Ae, y) ? y : p.He,
        w = b(p.Ne, h) ? h : p.Ve,
        S = t => {
          t && V(e, n + t);
        };
      S(u), S(m), S(C), S(w), i && S('flip');
      const x = s + '__btn--secondary';
      if ('cm' === s) {
        const {
          Ie: e,
          Le: t
        } = g.ne;
        e && (l ? j(e, x) : V(e, x)), t && (l ? j(t, x) : V(t, x));
      } else {
        const {
          je: e
        } = g.ne;
        e && (l ? j(e, x) : V(e, x));
      }
    },
    me = (e, t) => {
      const o = g.o,
        n = g.ne,
        {
          hide: a,
          hidePreferences: s,
          acceptCategory: _
        } = e,
        p = e => {
          _(e), s(), a();
        },
        m = o.u && o.u.preferencesModal;
      if (!m) return;
      const b = m.title,
        v = m.closeIconLabel,
        C = m.acceptAllBtn,
        S = m.acceptNecessaryBtn,
        x = m.savePreferencesBtn,
        M = m.sections || [],
        D = C || S || x;
      if (n.Fe) n.Pe = k(c), L(n.Pe, 'body');else {
        n.Fe = k(c), V(n.Fe, 'pm-wrapper');
        const e = k('div');
        V(e, 'pm-overlay'), H(n.Fe, e), R(e, d, s), n.we = k(c), V(n.we, 'pm'), E(n.we, 'role', 'dialog'), E(n.we, i, !0), E(n.we, 'aria-modal', !0), E(n.we, 'aria-labelledby', 'pm__title'), R(n.ye, 'keydown', e => {
          27 === e.keyCode && s();
        }, !0), n.Oe = k(c), L(n.Oe, 'header'), n.Re = k('h2'), L(n.Re, 'title'), n.Re.id = 'pm__title', n.Be = k(r), L(n.Be, 'close-btn'), E(n.Be, 'aria-label', m.closeIconLabel || ''), R(n.Be, d, s), n.$e = k('span'), n.$e.innerHTML = W(), H(n.Be, n.$e), n.Ge = k(c), L(n.Ge, 'body'), n.Je = k(c), L(n.Je, 'footer');
        var T = k(c);
        V(T, 'btns');
        var A = k(c),
          N = k(c);
        L(A, l), L(N, l), H(n.Je, A), H(n.Je, N), H(n.Oe, n.Re), H(n.Oe, n.Be), n.ve = k(c), E(n.ve, 'tabIndex', -1), H(n.we, n.ve), H(n.we, n.Oe), H(n.we, n.Ge), D && H(n.we, n.Je), H(n.Fe, n.we);
      }
      let I;
      b && (n.Re.innerHTML = b, v && E(n.Be, 'aria-label', v)), M.forEach((e, t) => {
        const a = e.title,
          s = e.description,
          l = e.linkedCategory,
          f = l && o.P[l],
          _ = e.cookieTable,
          u = _ && _.body,
          p = _ && _.caption,
          g = u && u.length > 0,
          b = !!f,
          v = b && o.X[l],
          C = h(v) && w(v) || [],
          S = b && (!!s || !!g || w(v).length > 0);
        var x = k(c);
        if (L(x, 'section'), S || s) {
          var M = k(c);
          L(M, 'section-desc-wrapper');
        }
        let D = C.length;
        if (S && D > 0) {
          const e = k(c);
          L(e, 'section-services');
          for (const t of C) {
            const o = v[t],
              n = o && o.label || t,
              a = k(c),
              s = k(c),
              r = k(c),
              i = k(c);
            L(a, 'service'), L(i, 'service-title'), L(s, 'service-header'), L(r, 'service-icon');
            const d = be(n, t, f, !0, l);
            i.innerHTML = n, H(s, r), H(s, i), H(a, s), H(a, d), H(e, a);
          }
          H(M, e);
        }
        if (a) {
          var T = k(c),
            A = k(b ? r : c);
          if (L(T, 'section-title-wrapper'), L(A, 'section-title'), A.innerHTML = a, H(T, A), b) {
            const e = k('span');
            e.innerHTML = W(2, 3.5), L(e, 'section-arrow'), H(T, e), x.className += '--toggle';
            const t = be(a, l, f);
            let o = m.serviceCounterLabel;
            if (D > 0 && y(o)) {
              let e = k('span');
              L(e, 'badge'), L(e, 'service-counter'), E(e, i, !0), E(e, 'data-servicecounter', D), o && (o = o.split('|'), o = o.length > 1 && D > 1 ? o[1] : o[0], E(e, 'data-counterlabel', o)), e.innerHTML = D + (o ? ' ' + o : ''), H(A, e);
            }
            if (S) {
              L(x, 'section--expandable');
              var N = l + '-desc';
              E(A, 'aria-expanded', !1), E(A, 'aria-controls', N);
            }
            H(T, t);
          } else E(A, 'role', 'heading'), E(A, 'aria-level', '3');
          H(x, T);
        }
        if (s) {
          var F = k('p');
          L(F, 'section-desc'), F.innerHTML = s, H(M, F);
        }
        if (S && (E(M, i, 'true'), M.id = N, ((e, t, o) => {
          R(A, d, () => {
            t.classList.contains('is-expanded') ? (j(t, 'is-expanded'), E(o, 'aria-expanded', 'false'), E(e, i, 'true')) : (V(t, 'is-expanded'), E(o, 'aria-expanded', 'true'), E(e, i, 'false'));
          });
        })(M, x, A), g)) {
          const e = k('table'),
            o = k('thead'),
            a = k('tbody');
          if (p) {
            const t = k('caption');
            L(t, 'table-caption'), t.innerHTML = p, e.appendChild(t);
          }
          L(e, 'section-table'), L(o, 'table-head'), L(a, 'table-body');
          const s = _.headers,
            r = w(s),
            i = n.Ue.createDocumentFragment(),
            l = k('tr');
          for (const e of r) {
            const o = s[e],
              n = k('th');
            n.id = 'cc__row-' + o + t, E(n, 'scope', 'col'), L(n, 'table-th'), n.innerHTML = o, H(i, n);
          }
          H(l, i), H(o, l);
          const d = n.Ue.createDocumentFragment();
          for (const e of u) {
            const o = k('tr');
            L(o, 'table-tr');
            for (const n of r) {
              const a = s[n],
                r = e[n],
                i = k('td'),
                l = k(c);
              L(i, 'table-td'), E(i, 'data-column', a), E(i, 'headers', 'cc__row-' + a + t), l.insertAdjacentHTML('beforeend', r), H(i, l), H(o, i);
            }
            H(d, o);
          }
          H(a, d), H(e, o), H(e, a), H(M, e);
        }
        (S || s) && H(x, M);
        const P = n.Pe || n.Ge;
        b ? (I || (I = k(c), L(I, 'section-toggles')), I.appendChild(x)) : I = null, H(P, I || x);
      }), C && (n.ze || (n.ze = k(r), L(n.ze, 'btn'), E(n.ze, f, 'all'), H(A, n.ze), R(n.ze, d, () => p('all'))), n.ze.innerHTML = C), S && (n.je || (n.je = k(r), L(n.je, 'btn'), E(n.je, f, 'necessary'), H(A, n.je), R(n.je, d, () => p([]))), n.je.innerHTML = S), x && (n.qe || (n.qe = k(r), L(n.qe, 'btn'), L(n.qe, 'btn--secondary'), E(n.qe, f, 'save'), H(N, n.qe), R(n.qe, d, () => p())), n.qe.innerHTML = x), n.Pe && (n.we.replaceChild(n.Pe, n.Ge), n.Ge = n.Pe), pe(1), o.N || (o.N = !0, ee(g.re.ue, u, n.we), t(e), H(n.Ce, n.Fe), X(n.we), setTimeout(() => V(n.Fe, 'cc--anim'), 100)), Z(2);
    };
  function be(e, t, o, n, a) {
    const c = g.o,
      r = g.ne,
      l = k('label'),
      f = k('input'),
      _ = k('span'),
      u = k('span'),
      p = k('span'),
      m = k('span'),
      v = k('span');
    if (m.innerHTML = W(1, 3), v.innerHTML = W(0, 3), f.type = 'checkbox', V(l, 'section__toggle-wrapper'), V(f, 'section__toggle'), V(m, 'toggle__icon-on'), V(v, 'toggle__icon-off'), V(_, 'toggle__icon'), V(u, 'toggle__icon-circle'), V(p, 'toggle__label'), E(_, i, 'true'), n ? (V(l, 'toggle-service'), E(f, s, a), r.se[a][t] = f) : r.ae[t] = f, n ? (e => {
      R(f, 'change', () => {
        const t = r.se[e],
          o = r.ae[e];
        c.Z[e] = [];
        for (let o in t) {
          const n = t[o];
          n.checked && c.Z[e].push(n.value);
        }
        o.checked = c.Z[e].length > 0;
      });
    })(a) : (e => {
      R(f, d, () => {
        const t = r.se[e],
          o = f.checked;
        c.Z[e] = [];
        for (let n in t) t[n].checked = o, o && c.Z[e].push(n);
      });
    })(t), f.value = t, p.textContent = e.replace(/<.*>.*<\/.*>/gm, ''), H(u, v), H(u, m), H(_, u), c.D) (o.readOnly || o.enabled) && (f.checked = !0);else if (n) {
      const e = c.Y[a];
      f.checked = o.readOnly || b(e, t);
    } else b(c.R, t) && (f.checked = !0);
    return o.readOnly && (f.disabled = !0), H(l, f), H(l, _), H(l, p), l;
  }
  const ve = () => {
      const e = k('span');
      return g.ne.Ke || (g.ne.Ke = e), e;
    },
    ye = (e, t) => {
      const o = g.o,
        n = g.ne,
        {
          hide: a,
          showPreferences: s,
          acceptCategory: u
        } = e,
        p = o.u && o.u.consentModal;
      if (!p) return;
      const m = p.acceptAllBtn,
        b = p.acceptNecessaryBtn,
        v = p.showPreferencesBtn,
        y = p.closeIconLabel,
        h = p.footer,
        C = p.label,
        w = p.title,
        S = e => {
          a(), u(e);
        };
      if (!n.Qe) {
        n.Qe = k(c), n.he = k(c), n.We = k(c), n.Xe = k(c), n.Ye = k(c), V(n.Qe, 'cm-wrapper'), V(n.he, 'cm'), I(n.We, 'body'), I(n.Xe, 'texts'), I(n.Ye, 'btns'), E(n.he, 'role', 'dialog'), E(n.he, 'aria-modal', 'true'), E(n.he, i, 'false'), E(n.he, 'aria-describedby', 'cm__desc'), C ? E(n.he, 'aria-label', C) : w && E(n.he, 'aria-labelledby', 'cm__title');
        const e = 'box',
          t = o.i.guiOptions,
          a = t && t.consentModal,
          s = (a && a.layout || e).split(' ')[0] === e;
        w && y && s && (n.Le || (n.Le = k(r), n.Le.innerHTML = W(), I(n.Le, 'btn'), I(n.Le, 'btn--close'), R(n.Le, d, () => {
          S([]);
        }), H(n.We, n.Le)), E(n.Le, 'aria-label', y)), H(n.We, n.Xe), (m || b || v) && H(n.We, n.Ye), n.be = k(c), E(n.be, 'tabIndex', -1), H(n.he, n.be), H(n.he, n.We), H(n.Qe, n.he);
      }
      w && (n.Ze || (n.Ze = k('h2'), n.Ze.className = n.Ze.id = 'cm__title', H(n.Xe, n.Ze)), n.Ze.innerHTML = w);
      let x = p.description;
      if (x && (o.V && (x = x.replace('{{revisionMessage}}', o.I ? '' : p.revisionMessage || '')), n.et || (n.et = k('p'), n.et.className = n.et.id = 'cm__desc', H(n.Xe, n.et)), n.et.innerHTML = x), m && (n.tt || (n.tt = k(r), H(n.tt, ve()), I(n.tt, 'btn'), E(n.tt, f, 'all'), R(n.tt, d, () => {
        S('all');
      })), n.tt.firstElementChild.innerHTML = m), b && (n.Ie || (n.Ie = k(r), H(n.Ie, ve()), I(n.Ie, 'btn'), E(n.Ie, f, 'necessary'), R(n.Ie, d, () => {
        S([]);
      })), n.Ie.firstElementChild.innerHTML = b), v && (n.ot || (n.ot = k(r), H(n.ot, ve()), I(n.ot, 'btn'), I(n.ot, 'btn--secondary'), E(n.ot, f, 'show'), R(n.ot, 'mouseenter', () => {
        o.N || me(e, t);
      }), R(n.ot, d, s)), n.ot.firstElementChild.innerHTML = v), n.nt || (n.nt = k(c), I(n.nt, l), m && H(n.nt, n.tt), b && H(n.nt, n.Ie), (m || b) && H(n.We, n.nt), H(n.Ye, n.nt)), n.ot && !n.st && (n.st = k(c), n.Ie && n.tt ? (I(n.st, l), H(n.st, n.ot), H(n.Ye, n.st)) : (H(n.nt, n.ot), I(n.nt, l + '--uneven'))), h) {
        if (!n.ct) {
          let e = k(c),
            t = k(c);
          n.ct = k(c), I(e, 'footer'), I(t, 'links'), I(n.ct, 'link-group'), H(t, n.ct), H(e, t), H(n.he, e);
        }
        n.ct.innerHTML = h;
      }
      pe(0), o.T || (o.T = !0, ee(g.re.ue, _, n.he), t(e), H(n.Ce, n.Qe), X(n.he), setTimeout(() => V(n.Qe, 'cc--anim'), 100)), Z(1), J(n.We, e, me, t);
    },
    he = e => {
      if (!y(e)) return null;
      if (e in g.o._) return e;
      let t = e.slice(0, 2);
      return t in g.o._ ? t : null;
    },
    Ce = () => g.o.l || g.o.i.language.default,
    we = e => {
      e && (g.o.l = e);
    },
    Se = async e => {
      const t = g.o;
      let o = he(e) ? e : Ce(),
        n = t._[o];
      if (y(n) ? n = await (async e => {
        try {
          const t = await fetch(e);
          return await t.json();
        } catch (e) {
          return console.error(e), !1;
        }
      })(n) : C(n) && (n = await n()), !n) throw `Could not load translation for the '${o}' language`;
      return t.u = n, we(o), !0;
    },
    xe = () => {
      let e = g.o.i.language.rtl,
        t = g.ne.Ce;
      e && t && (v(e) || (e = [e]), b(e, g.o.l) ? V(t, 'cc--rtl') : j(t, 'cc--rtl'));
    },
    Me = () => {
      const e = g.ne;
      if (e.Ce) return;
      e.Ce = k(c), e.Ce.id = 'cc-main', e.Ce.setAttribute('data-nosnippet', ''), xe();
      let t = g.o.i.root;
      t && y(t) && (t = document.querySelector(t)), (t || e.Ue.body).appendChild(e.Ce);
    },
    De = e => te(() => localStorage.removeItem(e)),
    Te = (e, t) => {
      if (t instanceof RegExp) return e.filter(e => t.test(e));
      {
        const o = m(e, t);
        return o > -1 ? [e[o]] : [];
      }
    },
    ke = e => {
      const {
          hostname: t,
          protocol: o
        } = location,
        {
          name: n,
          path: a,
          domain: s,
          sameSite: c,
          useLocalStorage: r,
          secure: i
        } = g.t.cookie,
        l = e ? (() => {
          const e = g.o.S,
            t = e ? new Date() - e : 0;
          return 864e5 * B() - t;
        })() : 864e5 * B(),
        d = new Date();
      d.setTime(d.getTime() + l), g.o.p.expirationTime = d.getTime();
      const f = JSON.stringify(g.o.p);
      let _ = n + '=' + encodeURIComponent(f) + (0 !== l ? '; expires=' + d.toUTCString() : '') + '; Path=' + a + '; SameSite=' + c;
      b(t, '.') && (_ += '; Domain=' + s), i && 'https:' === o && (_ += '; Secure'), r ? ((e, t) => {
        te(() => localStorage.setItem(e, t));
      })(n, f) : document.cookie = _, g.o.p;
    },
    Ee = (e, t, o) => {
      if (0 === e.length) return;
      const n = o || g.t.cookie.domain,
        a = t || g.t.cookie.path,
        s = 'www.' === n.slice(0, 4),
        c = s && n.substring(4),
        r = (e, t) => {
          t && '.' !== t.slice(0, 1) && (t = '.' + t), document.cookie = e + '=; path=' + a + (t ? '; domain=' + t : '') + '; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        };
      for (const t of e) r(t, o), o || r(t, n), s && r(t, c);
    },
    Ae = e => {
      const t = e || g.t.cookie.name,
        o = g.t.cookie.useLocalStorage;
      return ((e, t) => {
        let o;
        return o = te(() => JSON.parse(t ? e : decodeURIComponent(e)), !0) || {}, o;
      })(o ? (n = t, te(() => localStorage.getItem(n)) || '') : Ne(t, !0), o);
      var n;
    },
    Ne = (e, t) => {
      const o = document.cookie.match('(^|;)\\s*' + e + '\\s*=\\s*([^;]+)');
      return o ? t ? o.pop() : e : '';
    },
    He = e => {
      const t = document.cookie.split(/;\s*/),
        o = [];
      for (const n of t) {
        let t = n.split('=')[0];
        e ? te(() => {
          e.test(t) && o.push(t);
        }) : o.push(t);
      }
      return o;
    },
    Ve = (o, n = []) => {
      ((e, t) => {
        const {
          O: o,
          R: n,
          B: a,
          N: s,
          Z: c,
          $: r,
          X: i
        } = g.o;
        let l = [];
        if (e) {
          v(e) ? l.push(...e) : y(e) && (l = 'all' === e ? o : [e]);
          for (const e of o) c[e] = b(l, e) ? w(i[e]) : [];
        } else l = [...n, ...r], s && (l = (() => {
          const e = g.ne.ae;
          if (!e) return [];
          let t = [];
          for (let o in e) e[o].checked && t.push(o);
          return t;
        })());
        l = l.filter(e => !b(o, e) || !b(t, e)), l.push(...a), G(l);
      })(o, n), (() => {
        const e = g.o,
          {
            Z: t,
            B: o,
            Y: n,
            X: a,
            O: s
          } = e,
          c = s;
        e.te = F(n);
        for (const s of c) {
          const c = a[s],
            r = w(c),
            i = t[s] && t[s].length > 0,
            l = b(o, s);
          if (0 !== r.length) {
            if (n[s] = [], l) n[s].push(...r);else if (i) {
              const e = t[s];
              n[s].push(...e);
            } else n[s] = e.Z[s];
            n[s] = S(n[s]);
          }
        }
      })(), (() => {
        const o = g.o;
        o.L = g.t.mode === t && o.D ? $(o.$, o.R) : $(o.R, o.p.categories);
        let n = o.L.length > 0,
          a = !1;
        for (const e of o.O) o.ee[e] = $(o.Y[e], o.te[e]), o.ee[e].length > 0 && (a = !0);
        const s = g.ne.ae;
        for (const e in s) s[e].checked = b(o.R, e);
        for (const e of o.O) {
          const t = g.ne.se[e],
            n = o.Y[e];
          for (const e in t) t[e].checked = b(n, e);
        }
        o.C || (o.C = new Date()), o.M || (o.M = ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, e => (e ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> e / 4).toString(16))), o.p = {
          categories: F(o.R),
          revision: g.t.revision,
          data: o.h,
          consentTimestamp: o.C.toISOString(),
          consentId: o.M,
          services: F(o.Y),
          languageCode: g.o.l
        }, o.S && (o.p.lastConsentTimestamp = o.S.toISOString());
        let c = !1;
        const r = n || a;
        (o.D || r) && (o.D && (o.D = !1, c = !0), o.S = o.S ? new Date() : o.C, o.p.lastConsentTimestamp = o.S.toISOString(), ke(), g.t.autoClearCookies && (c || r) && (e => {
          const t = g.o,
            o = He(),
            n = (e => {
              const t = g.o;
              return (e ? t.O : t.L).filter(e => {
                const o = t.P[e];
                return !!o && !o.readOnly && !!o.autoClear;
              });
            })(e);
          for (const e in t.ee) for (const n of t.ee[e]) {
            const a = t.X[e][n].cookies;
            if (!b(t.Y[e], n) && a) for (const e of a) {
              const t = Te(o, e.name);
              Ee(t, e.path, e.domain);
            }
          }
          for (const a of n) {
            const n = t.P[a].autoClear,
              s = n && n.cookies || [],
              c = b(t.L, a),
              r = !b(t.R, a),
              i = c && r;
            if (e ? r : i) {
              n.reloadPage && i && (t.j = !0);
              for (const e of s) {
                const t = Te(o, e.name);
                Ee(t, e.path, e.domain);
              }
            }
          }
        })(c), oe()), c && (ee(g.re.ie), ee(g.re.le), g.t.mode === e) || (r && ee(g.re.de), o.j && (o.j = !1, location.reload()));
      })();
    },
    Ie = e => {
      const t = g.o.D ? [] : g.o.R;
      return b(t, e);
    },
    je = (e, t) => {
      const o = g.o.D ? [] : g.o.Y[t] || [];
      return b(o, e);
    },
    Oe = e => {
      const {
        ne: t,
        o: n
      } = g;
      if (!n.k) {
        if (!n.T) {
          if (!e) return;
          ye(Ge, Me);
        }
        n.k = !0, n.J = x(), n.v && K(!0), z(t.he, 1), V(t.ye, o), E(t.he, i, 'false'), setTimeout(() => {
          U(g.ne.be);
        }, 100), ee(g.re.fe, _);
      }
    },
    Re = () => {
      const {
        ne: e,
        o: t,
        re: n
      } = g;
      t.k && (t.k = !1, t.v && K(), U(e.Ke, !0), j(e.ye, o), E(e.he, i, 'true'), U(t.J), t.J = null, ee(n._e, _));
    },
    Be = () => {
      const e = g.o;
      e.A || (e.N || me(Ge, Me), e.A = !0, e.k ? e.U = x() : e.J = x(), z(g.ne.we, 2), V(g.ne.ye, n), E(g.ne.we, i, 'false'), setTimeout(() => {
        U(g.ne.ve);
      }, 100), ee(g.re.fe, u));
    },
    $e = () => {
      const e = g.o;
      e.A && (e.A = !1, (() => {
        const e = We(),
          t = g.o.P,
          o = g.ne.ae,
          n = g.ne.se,
          a = e => b(g.o.$, e);
        for (const s in o) {
          const c = !!t[s].readOnly;
          o[s].checked = c || (e ? Ie(s) : a(s));
          for (const t in n[s]) n[s][t].checked = c || (e ? je(t, s) : a(s));
        }
      })(), U(g.ne.$e, !0), j(g.ne.ye, n), E(g.ne.we, i, 'true'), e.k ? (U(e.U), e.U = null) : (U(e.J), e.J = null), ee(g.re._e, u));
    };
  var Ge = {
    show: Oe,
    hide: Re,
    showPreferences: Be,
    hidePreferences: $e,
    acceptCategory: Ve
  };
  const Ue = () => {
      const {
          F: e,
          Y: t
        } = g.o,
        {
          accepted: o,
          rejected: n
        } = (() => {
          const {
            D: e,
            R: t,
            O: o
          } = g.o;
          return {
            accepted: t,
            rejected: e ? [] : o.filter(e => !b(t, e))
          };
        })();
      return F({
        acceptType: e,
        acceptedCategories: o,
        rejectedCategories: n,
        acceptedServices: t,
        rejectedServices: P()
      });
    },
    We = () => !g.o.D,
    Xe = async e => {
      const {
          o: o,
          t: n,
          re: a
        } = g,
        c = window;
      if (!c._ccRun) {
        if (c._ccRun = !0, (e => {
          const {
              ne: o,
              t: n,
              o: a
            } = g,
            c = n,
            r = a,
            {
              cookie: i
            } = c,
            l = g.ce,
            d = e.cookie,
            f = e.categories,
            _ = w(f) || [],
            u = navigator,
            p = document;
          o.Ue = p, o.ye = p.documentElement, i.domain = location.hostname, r.i = e, r.P = f, r.O = _, r._ = e.language.translations, r.v = !!e.disablePageInteraction, l.ie = e.onFirstConsent, l.le = e.onConsent, l.de = e.onChange, l._e = e.onModalHide, l.fe = e.onModalShow, l.ue = e.onModalReady;
          const {
            mode: m,
            autoShow: v,
            lazyHtmlGeneration: y,
            autoClearCookies: C,
            revision: S,
            manageScriptTags: x,
            hideFromBots: M
          } = e;
          m === t && (c.mode = m), 'boolean' == typeof C && (c.autoClearCookies = C), 'boolean' == typeof x && (c.manageScriptTags = x), 'number' == typeof S && S >= 0 && (c.revision = S, r.V = !0), 'boolean' == typeof v && (c.autoShow = v), 'boolean' == typeof y && (c.lazyHtmlGeneration = y), !1 === M && (c.hideFromBots = !1), !0 === c.hideFromBots && u && (r.G = u.userAgent && /bot|crawl|spider|slurp|teoma/i.test(u.userAgent) || u.webdriver), h(d) && (c.cookie = {
            ...i,
            ...d
          }), c.autoClearCookies, r.V, c.manageScriptTags, (e => {
            const {
              P: t,
              X: o,
              Y: n,
              Z: a,
              B: s
            } = g.o;
            for (let c of e) {
              const e = t[c],
                r = e.services || {},
                i = h(r) && w(r) || [];
              o[c] = {}, n[c] = [], a[c] = [], e.readOnly && (s.push(c), n[c] = i), g.ne.se[c] = {};
              for (let e of i) {
                const t = r[e];
                t.Se = !1, o[c][e] = t;
              }
            }
          })(_), (() => {
            if (!g.t.manageScriptTags) return;
            const e = g.o,
              t = D(document, 'script[' + s + ']');
            for (const o of t) {
              let t = N(o, s),
                n = o.dataset.service || '',
                a = !1;
              if (t && '!' === t.charAt(0) && (t = t.slice(1), a = !0), '!' === n.charAt(0) && (n = n.slice(1), a = !0), b(e.O, t) && (e.oe.push({
                Me: o,
                xe: !1,
                ke: a,
                De: t,
                Te: n
              }), n)) {
                const o = e.X[t];
                o[n] || (o[n] = {
                  Se: !1
                });
              }
            }
          })(), we((() => {
            const e = g.o.i.language.autoDetect;
            if (e) {
              const t = {
                  browser: navigator.language,
                  document: document.documentElement.lang
                },
                o = he(t[e]);
              if (o) return o;
            }
            return Ce();
          })());
        })(e), o.G) return;
        (() => {
          const e = g.o,
            o = g.t,
            n = Ae(),
            {
              categories: a,
              services: s,
              consentId: c,
              consentTimestamp: r,
              lastConsentTimestamp: i,
              data: l,
              revision: d
            } = n,
            f = v(a);
          e.p = n, e.M = c;
          const _ = !!c && y(c);
          e.C = r, e.C && (e.C = new Date(r)), e.S = i, e.S && (e.S = new Date(i)), e.h = void 0 !== l ? l : null, e.V && _ && d !== o.revision && (e.I = !1), e.D = !(_ && e.I && e.C && e.S && f), o.cookie.useLocalStorage && !e.D && (e.D = new Date().getTime() > (n.expirationTime || 0), e.D && De(o.cookie.name)), e.D, (() => {
            const e = g.o;
            for (const o of e.O) {
              const n = e.P[o];
              if (n.readOnly || n.enabled) {
                e.$.push(o);
                const n = e.X[o] || {};
                for (let a in n) e.Z[o].push(a), e.i.mode === t && e.Y[o].push(a);
              }
            }
          })(), e.D ? o.mode === t && (e.R = [...e.$]) : (e.Y = {
            ...e.Y,
            ...s
          }, e.Z = {
            ...e.Y
          }, G([...e.B, ...a]));
        })();
        const i = We();
        if (!(await Se())) return !1;
        if (J(null, r = Ge, me, Me), g.o.D && ye(r, Me), g.t.lazyHtmlGeneration || me(r, Me), n.autoShow && !i && Oe(!0), i) return oe(), ee(a.le);
        n.mode === t && oe(o.$);
      }
      var r;
    };

  /* eslint-disable max-len */
  class CookieConsent {
    constructor(config = null) {
      this.isInit = false;
      if (!window.NSW || !window.NSW.CookieConsent) {
        console.error('NSW CookieConsent is not available.');
        return;
      }
      if (!config) {
        console.error('Cookie consent configuration not provided');
        return;
      }
      CookieConsent.cleanupDefaultCookieUI();
      this.config = CookieConsent.mapToVanillaCookieConsentConfig(config);
      this.consentBannerElement = null;
      this.preferencesDialogElement = null;
      this.consentBannerConfirmationMessage = '';
      this.consentSelectionMade = false;
      this.createConsentBanner();
      this.createPreferencesDialog();
      this.init();
    }
    static cleanupDefaultCookieUI() {
      // Remove unwanted stylesheet
      const unwantedStylesheet = Array.from(document.querySelectorAll('link')).find(link => link.href.includes('cookieconsent.css'));
      if (unwantedStylesheet) {
        unwantedStylesheet.remove();
      }

      // Monitor for and remove the default cookie consent element
      const observer = new MutationObserver(() => {
        const defaultCookieConsentElement = document.getElementById('cc-main');
        if (defaultCookieConsentElement) {
          defaultCookieConsentElement.remove();
          observer.disconnect(); // Stop observing
        }
      });
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true
      });

      // Remove if it already exists in the DOM
      const existingElement = document.getElementById('cc-main');
      if (existingElement) {
        existingElement.remove();
      }
    }
    static mapToVanillaCookieConsentConfig(config) {
      return {
        ...config,
        autoShow: false,
        language: {
          default: 'en',
          translations: {
            en: {
              consentModal: config.consentBanner,
              preferencesModal: config.preferencesDialog
            }
          }
        }
      };
    }
    createPreferencesDialog() {
      const {
        language: {
          translations: {
            en
          }
        },
        categories = {}
      } = this.config;
      const {
        preferencesModal
      } = en;
      const cookiesListHtml = `
    <ul class="nsw-cookie-dialog__list">
    ${preferencesModal.sections.map((section, index) => `
          <li class="nsw-cookie-dialog__list-item">
            <input 
              class="nsw-form__checkbox-input" 
              value="${section.linkedCategory}" 
              type="checkbox" 
              name="form-checkbox-multi-${index + 1}" 
              id="cookie-settings-${index + 1}"
              ${categories[section.linkedCategory].readOnly ? 'disabled' : ''}
            >
            <label 
              class="nsw-form__checkbox-label" 
              for="cookie-settings-${index + 1}"
            >
              ${section.title}
            </label>
            <div class="nsw-cookie-dialog__cookie-details">
              <p>${section.description}</p>
            </div>
          </li>
          `).join('')}
  </ul>
  `;

      // Create the dialog dynamically
      const preferencesDialogHtml = `
      <div class="nsw-cookie-dialog nsw-dialog nsw-dialog--single-action js-dialog js-dialog-dismiss" id="cookie-consent-preferences" role="dialog" aria-labelledby="cookie-consent-dialog">
        <div class="nsw-dialog__wrapper">
          <div class="nsw-dialog__container">
            <div class="nsw-dialog__top">
              <div class="nsw-dialog__title">
                <h2 id="cookie-dialog-title">${preferencesModal.title ? preferencesModal.title : 'Cookie preferences'}</h2>
              </div>
              <div class="nsw-dialog__close">
                <button class="nsw-icon-button js-close-dialog">
                  <span class="material-icons nsw-material-icons" focusable="false" aria-hidden="true">close</span>
                  <span class="sr-only">${preferencesModal.closeIconLabel ? preferencesModal.closeIconLabel : 'Close dialog'}</span>
                </button>
              </div>
            </div>
            <div class="nsw-dialog__content">
              <div class="nsw-tabs js-cookie-consent-tabs">
                <ul class="nsw-tabs__list">
                  <li><a href="#cookie-settings" class="js-tabs-fixed">${preferencesModal.tab1 ? preferencesModal.tab1.tabTitle : 'Cookie preferences'}</a></li>
                  ${preferencesModal.tab2 ? `<li><a href="#cookie-use" class="js-tabs-fixed">${preferencesModal.tab2.tabTitle ? preferencesModal.tab2.tabTitle : 'How we use cookies'}</a></li>` : ''}
                  <li><a href="#cookie-information" class="js-tabs-fixed">What are cookies?</a></li>
                </ul>
                <section id="cookie-settings" class="nsw-tabs__content nsw-tabs__content--side-flush">
                  <div class="nsw-cookie-dialog__content-wrapper">
                    ${preferencesModal.tab1.content ? preferencesModal.tab1.content : ''}
                    ${cookiesListHtml}
                  </div>
                </section>
                ${preferencesModal.tab2 ? `
                    <section id="cookie-use" class="nsw-tabs__content nsw-tabs__content--side-flush">
                      <div class="nsw-cookie-dialog__content-wrapper">
                        ${preferencesModal.tab2.content}
                      </div>
                    </section>
                  ` : ''}
                <section id="cookie-information" class="nsw-tabs__content nsw-tabs__content--side-flush">
                  <div class="nsw-cookie-dialog__content-wrapper">
                    <p>Cookies are small files stored on your phone, tablet, or computer when you visit a website. They help us understand how you use our website and improve your experience.</p>
                    
                    <p>Some cookies collect information about how you interact with our website, such as the pages you visit and links you click. Others may store personal information, depending on their purpose and configuration.</p>

                    <p>Personal information that may be collected by cookies includes:</p>
                    <ul>
                      <li>Email address</li>
                      <li>Username</li>
                      <li>IP address</li>
                      <li>Geographic location</li>
                      <li>Session screen recordings</li>
                    </ul>

                    <p>We use cookies to:</p>
                    <ul>
                      <li>Make our website work efficiently and securely</li>
                      <li>Remember your preferences, such as which pop-ups you’ve seen</li>
                      <li>Understand how you use our website (analytics cookies)</li>
                      <li>Enable social sharing, such as LinkedIn</li>
                      <li>Continuously improve our website for you</li>
                    </ul>

                    <p>Privacy and compliance:</p>
                    <p>If cookies collect personal information, we are required to comply with Information Privacy Principle (IPP) 3, ensuring openness in data collection. This means you should be informed when your personal information is collected.</p>

                    <p>We provide this information through:</p>
                    <ul>
                      <li>A Privacy Collection Notice (PCN) within the "How we use cookies" tab</li>
                      <li>A link to our Privacy Policy and/or Cookie Policy</li>
                    </ul>

                    <p>As tracking technologies evolve, we periodically review our cookie practices to maintain privacy compliance and control over tracking technologies.</p>

                    <p>For more information on cookies, including how to manage or delete them, visit <a href="https://www.allaboutcookies.org">www.allaboutcookies.org</a>.</p>

                    <p>For privacy advice, please contact your agency’s privacy or information governance team. Additional guidance is available at <a href="mailto:digitalnswprivacy@customerservice.nsw.gov.au">digitalnswprivacy@customerservice.nsw.gov.au</a>.</p>
                  </div>
                </section>
              </div>
            </div>
          </div>
          <div class="nsw-cookie-dialog__bottom">
            <div class="nsw-cookie-dialog__cta-group">
              ${preferencesModal.acceptAllBtn ? `<button class="nsw-button nsw-button--dark-outline-solid js-close-dialog" data-role="accept-all">${preferencesModal.acceptAllBtn ? preferencesModal.acceptAllBtn : 'Accept all cookies'}</button>` : ''}
              ${preferencesModal.acceptNecessaryBtn ? `<button class="nsw-button nsw-button--dark-outline-solid js-close-dialog" data-role="reject-all">${preferencesModal.acceptNecessaryBtn ? preferencesModal.acceptNecessaryBtn : 'Reject all cookies'}</button>` : ''}
            </div>
            <div class="nsw-cookie-dialog__cta-group">
              <button class="nsw-button nsw-button--dark js-close-dialog" data-role="accept-selection">${preferencesModal.savePreferencesBtn ? preferencesModal.savePreferencesBtn : 'Accept current selection'}</button>
            </div>
          </div>
        </div>
      </div>
    `;

      // Append to the body
      const dialogContainer = document.querySelector('.js-open-dialog-cookie-consent-preferences');

      // Initialise dialog
      if (dialogContainer) {
        // Dynamically create the dialog HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = preferencesDialogHtml;
        this.preferencesDialogElement = tempDiv.firstElementChild;

        // Append the dialog directly to the body
        document.body.appendChild(this.preferencesDialogElement);

        // Initialise the NSW Design System Dialog
        this.dialogInstance = new window.NSW.Dialog(this.preferencesDialogElement);
        this.dialogInstance.init();
      } else {
        console.warn('Dialog trigger element not found');
      }

      // Initialise tabs
      if (window.NSW && window.NSW.Tabs) {
        const tabs = document.querySelector('.js-cookie-consent-tabs');
        new window.NSW.Tabs(tabs).init();
      } else {
        console.warn('NSW Tabs library not found');
      }
    }
    createConsentBanner() {
      const {
        language: {
          translations: {
            en
          }
        }
      } = this.config;
      const {
        consentModal
      } = en;
      const bannerOffset = consentModal.bannerOffset ? consentModal.bannerOffset : '0';
      this.consentBannerConfirmationMessage = consentModal.confirmationMessage || '';
      const consentBannerHtml = `
      <div class="nsw-cookie-banner" role="alert" tabindex="-1" aria-labelledby="cookie-banner-title" aria-live="assertive" style="bottom: ${bannerOffset};">
        <div class="nsw-cookie-banner__wrapper">
          <div id="cookie-banner-title" class="nsw-cookie-banner__title">${consentModal.title || 'Cookie use on our website'}</div>
          <span class="nsw-cookie-banner__description">
            <div class="nsw-cookie-banner__content">
              ${consentModal.description ? `<p>${consentModal.description}</p>` : ''}
            </div>
            <div class="nsw-cookie-banner__buttons-container">
              ${consentModal.acceptAllBtn || consentModal.acceptNecessaryBtn ? '<div class="nsw-cookie-banner__cta-group">' : ''}
                ${consentModal.acceptAllBtn ? `<button class="nsw-button nsw-button--dark js-close-dialog ${!consentModal.confirmationMessage ? 'js-dismiss-cookie-banner' : ''}" data-role="accept-all">${consentModal.acceptAllBtn}</button>` : ''}
                ${consentModal.acceptNecessaryBtn ? `<button class="nsw-button nsw-button--dark ${!consentModal.confirmationMessage ? 'js-dismiss-cookie-banner' : ''}" data-role="reject-all">${consentModal.acceptNecessaryBtn}</button>` : ''}
              ${consentModal.acceptAllBtn || consentModal.acceptNecessaryBtn ? '</div>' : ''}
              <a href="#cookie-consent" class="nsw-button nsw-button--dark-outline js-open-dialog-cookie-consent-preferences" aria-haspopup="dialog">${consentModal.showPreferencesBtn || 'Manage your cookies'}</a>
            </div>
          </span>
          <span class="nsw-cookie-banner__confirmation-message" hidden="true">
            <div class="nsw-cookie-banner__content">
              <p>${consentModal.confirmationMessage}</p>
            </div>
            <div class="nsw-cookie-banner__buttons-container">
              <button class="nsw-button nsw-button--dark js-dismiss-cookie-banner">Close this message</button>
            </div>
          </span>
        </div>
      </div>
    `;

      // Append the banner to the body
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = consentBannerHtml;
      this.consentBannerElement = tempDiv.firstElementChild;
      document.body.appendChild(this.consentBannerElement);
      this.consentBannerElement.focus();
    }
    init() {
      if (this.preferencesDialogElement) {
        this.initElements();
        this.initAPI();
        this.attachEventListeners();

        // Immediately hide the banner if user has preferences set
        const preferences = Ue();
        if (preferences && preferences.acceptedCategories.length > 0) {
          this.consentBannerElement.setAttribute('hidden', 'true');
        }
      } else {
        console.error('Banner element not created');
      }
    }
    initElements() {
      this.cookieInputContainer = document.querySelector('.nsw-cookie-dialog__list');
      this.allCookieInputs = this.cookieInputContainer ? this.cookieInputContainer.querySelectorAll('input[type="checkbox"]') : [];
      this.acceptSelectionButton = document.querySelector('[data-role="accept-selection"]');
      this.acceptAllButton = document.querySelector('[data-role="accept-all"]');
      this.rejectAllButton = document.querySelector('[data-role="reject-all"]');
    }
    initAPI() {
      if (!this.isInit) {
        Xe(this.config).then(() => {
          this.isInit = true;
          this.loadUserPreferences();
        });
      }
    }
    attachEventListeners() {
      // Delegate events from the document to handle all relevant elements dynamically
      document.addEventListener('click', event => {
        const {
          target
        } = event;
        if (target.matches('[data-role="accept-all"]')) {
          this.handleConsentAction('accept-all');
        } else if (target.matches('[data-role="reject-all"]')) {
          this.handleConsentAction('reject-all');
        } else if (target.matches('[data-role="accept-selection"]')) {
          this.handleConsentAction('accept-selection');
        }

        // If target is dismissable
        if (target.matches('.js-dismiss-cookie-banner')) {
          this.hideConsentBanner();
        }

        // Manual trigger of cookie consent banner
        if (target.matches('.js-open-banner-cookie-consent')) {
          event.preventDefault();
          this.showConsentBanner();
        }

        // Manual trigger of cookie consent preferences dialog
        if (target.matches('.js-open-dialog-cookie-consent-preferences')) {
          event.preventDefault();
        }
      });
    }
    loadUserPreferences() {
      const preferences = Ue() || {
        acceptedCategories: []
      };
      const inputs = Array.from(this.allCookieInputs);
      for (let i = 0; i < inputs.length; i += 1) {
        const checkbox = inputs[i];
        const category = checkbox.value;
        let isChecked;
        if (preferences.acceptedCategories.length > 0) {
          isChecked = preferences.acceptedCategories.includes(category);
        } else {
          isChecked = Boolean(this.config.categories[category] && this.config.categories[category].readOnly // Ensure read-only categories are checked by default
          );
        }
        checkbox.checked = isChecked;
      }
    }
    handleConsentAction(action) {
      const updatePreferencesDialog = () => {
        const preferences = Ue();
        if (preferences && this.allCookieInputs) {
          this.allCookieInputs.forEach(checkboxElement => {
            const checkbox = checkboxElement; // Local reference
            checkbox.checked = preferences.acceptedCategories.includes(checkbox.value);
          });
        }
      };
      switch (action) {
        case 'accept-all':
          {
            console.log('User accepted all cookies');
            Ve('all');
            updatePreferencesDialog();
            break;
          }
        case 'reject-all':
          {
            console.log('User rejected all cookies');
            Ve([]);
            updatePreferencesDialog();
            break;
          }
        case 'accept-selection':
          {
            console.log('User accepted selected cookies');
            const checked = [];
            const unchecked = [];
            this.allCookieInputs.forEach(checkboxElement => {
              if (checkboxElement.checked) {
                checked.push(checkboxElement.value);
              } else {
                unchecked.push(checkboxElement.value);
              }
            });
            Ve(checked, unchecked);
            updatePreferencesDialog();
            break;
          }
        default:
          {
            console.warn(`Unhandled action: ${action}`);
          }
      }
      this.consentSelectionMade = true;
      this.showConfirmationMessage();

      // Hide banner if present or confirmation is present
      if (!this.consentBannerConfirmationMessage) {
        this.hideConsentBanner();
      }
    }
    showConfirmationMessage() {
      // Select the confirmation message element
      const confirmationMessage = this.consentBannerElement.querySelector('.nsw-cookie-banner__confirmation-message');

      // Select the description element
      const description = this.consentBannerElement.querySelector('.nsw-cookie-banner__description');
      if (confirmationMessage) {
        // Change the hidden attribute to false for the confirmation message
        confirmationMessage.removeAttribute('hidden');
      }
      if (description) {
        // Change the hidden attribute to true for the description
        description.setAttribute('hidden', 'true');
      }
    }
    showConsentBanner() {
      if (this.consentBannerElement) {
        const description = this.consentBannerElement.querySelector('.nsw-cookie-banner__description');
        const confirmationMessage = this.consentBannerElement.querySelector('.nsw-cookie-banner__confirmation-message');
        if (this.consentBannerConfirmationMessage && confirmationMessage) {
          // Hide the confirmation message if it's present
          confirmationMessage.setAttribute('hidden', 'true');
        }
        if (description) {
          // Show the main description
          description.removeAttribute('hidden');
        }
        this.consentBannerElement.removeAttribute('hidden');
      } else {
        console.warn('Consent banner element not found.');
      }
    }
    hideConsentBanner() {
      if (this.consentBannerElement) {
        this.consentBannerElement.setAttribute('hidden', 'true');
      }
    }
  }

  /* eslint-disable max-len */
  class Breadcrumbs {
    constructor(element) {
      this.element = element;
      this.allBreadcrumbs = this.element.querySelector('.nsw-breadcrumbs ol');
      this.secondBreadcrumb = this.element.querySelector('.js-breadcrumbs li:nth-child(2)');
      this.condition = false;
    }
    init() {
      if (this.allBreadcrumbs.children.length > 3) {
        this.createToggle();
      }
    }
    createToggle() {
      const toggle = this.constructor.createElement('li', ['nsw-breadcrumbs__show-more-toggle']);
      toggle.innerHTML = '<button aria-label="Show more breadcrumbs" class="nsw-breadcrumbs__toggle-button" type="button">…</button>';
      toggle.addEventListener('click', () => {
        this.allBreadcrumbs.classList.toggle('nsw-breadcrumbs__show-all');
      });
      this.allBreadcrumbs.insertBefore(toggle, this.secondBreadcrumb);
    }
    static createElement(tag, classes = [], attributes = {}) {
      const element = document.createElement(tag);
      if (classes.length > 0) {
        element.classList.add(...classes);
      }
      Object.entries(attributes).forEach(([key, value]) => {
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
      this.element.addEventListener('click', this.handleFileRemove.bind(this));
    }
    handleInputChange() {
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
      li.querySelector('.nsw-file-upload__item-filename').dataset.filename = file.name;
      return li.outerHTML;
    }
    updateFileList() {
      if (this.input.files.length === 0) {
        // If there are previously stored files, re-sync the input and exit.
        if (this.currentFiles && this.currentFiles.files && this.currentFiles.files.length > 0) {
          this.input.files = this.currentFiles.files;
          return;
        }
        // Clear list if otherwise
        if (this.filesList) {
          this.filesList.innerHTML = '';
          this.filesList.classList.remove('active');
        }
        return;
      }
      if (!this.filesList) {
        this.createFileList();
      }
      this.filesList.classList.add('active');
      const dataTransfer = new DataTransfer();
      const existingFiles = new Set();
      if (this.replaceFiles) {
        this.filesList.innerHTML = '';
        this.currentFiles = new DataTransfer();
      }

      // Collect existing files to maintain them in the list (if multiple is allowed)
      if (this.multipleUpload && this.currentFiles && this.currentFiles.files) {
        for (let i = 0; i < this.currentFiles.files.length; i += 1) {
          const file = this.currentFiles.files[i];
          dataTransfer.items.add(file);
          existingFiles.add(file.name);
        }
      }
      let fileListHTML = '';

      // Add only new files
      for (let i = 0; i < this.input.files.length; i += 1) {
        const file = this.input.files[i];
        if (!existingFiles.has(file.name)) {
          dataTransfer.items.add(file);
          fileListHTML += this.createFileItem(file);
        }
      }
      this.currentFiles = dataTransfer;
      if (fileListHTML) {
        this.filesList.insertAdjacentHTML('beforeend', fileListHTML);
      }
      this.input.files = this.currentFiles.files;
    }
    handleFileRemove(event) {
      if (!event.target.closest('.nsw-icon-button')) return;
      event.preventDefault();
      const item = event.target.closest('.nsw-file-upload__item');
      const {
        filename
      } = item.querySelector('.nsw-file-upload__item-filename').dataset;
      const dataTransfer = new DataTransfer();
      for (let i = 0; i < this.currentFiles.files.length; i += 1) {
        const file = this.currentFiles.files[i];
        if (file.name !== filename) {
          dataTransfer.items.add(file);
        }
      }
      this.currentFiles = dataTransfer;
      this.input.files = this.currentFiles.files;
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
      // Get default selected option
      this.selectedOption = this.element.querySelector('option[selected]');
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
          if (option.type === 'text') {
            option.value = '';
          } else if (option.type === 'select-one') {
            if (this.selectedOption) {
              console.log(Array.from(option.options).indexOf(this.selectedOption));
              option.selectedIndex = Array.from(option.options).indexOf(this.selectedOption);
            } else {
              option.selectedIndex = 0;
            }
          } else if (option.type === 'checkbox') {
            if (option.defaultChecked) {
              option.checked = true;
            } else {
              option.checked = false;
            }
          } else if (!option.parentElement.classList.contains('js-multi-select__option')) {
            option.value = false;
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
    mobileShowMainNav({
      propertyName
    }) {
      if (propertyName !== 'transform') return;
      getFocusableElementBySelector(this.navID, ['> div button', '> ul > li > a']).all[1].focus();
      this.nav.classList.add('active');
      this.nav.classList.remove('activating');
      this.nav.removeEventListener(this.transitionEvent, this.mobileShowMainTransitionEndEvent, false);
      this.nav.addEventListener('keydown', this.mobileTrapTabKeyEvent, false);
    }
    mobileHideMainNav({
      propertyName
    }) {
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
    showSubNav({
      propertyName
    }) {
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

  /**
   * Custom positioning reference element.
   * @see https://floating-ui.com/docs/virtual-elements
   */

  const min = Math.min;
  const max = Math.max;
  const round = Math.round;
  const createCoords = v => ({
    x: v,
    y: v
  });
  const oppositeSideMap = {
    left: 'right',
    right: 'left',
    bottom: 'top',
    top: 'bottom'
  };
  const oppositeAlignmentMap = {
    start: 'end',
    end: 'start'
  };
  function clamp(start, value, end) {
    return max(start, min(value, end));
  }
  function evaluate(value, param) {
    return typeof value === 'function' ? value(param) : value;
  }
  function getSide(placement) {
    return placement.split('-')[0];
  }
  function getAlignment(placement) {
    return placement.split('-')[1];
  }
  function getOppositeAxis(axis) {
    return axis === 'x' ? 'y' : 'x';
  }
  function getAxisLength(axis) {
    return axis === 'y' ? 'height' : 'width';
  }
  function getSideAxis(placement) {
    return ['top', 'bottom'].includes(getSide(placement)) ? 'y' : 'x';
  }
  function getAlignmentAxis(placement) {
    return getOppositeAxis(getSideAxis(placement));
  }
  function getAlignmentSides(placement, rects, rtl) {
    if (rtl === void 0) {
      rtl = false;
    }
    const alignment = getAlignment(placement);
    const alignmentAxis = getAlignmentAxis(placement);
    const length = getAxisLength(alignmentAxis);
    let mainAlignmentSide = alignmentAxis === 'x' ? alignment === (rtl ? 'end' : 'start') ? 'right' : 'left' : alignment === 'start' ? 'bottom' : 'top';
    if (rects.reference[length] > rects.floating[length]) {
      mainAlignmentSide = getOppositePlacement(mainAlignmentSide);
    }
    return [mainAlignmentSide, getOppositePlacement(mainAlignmentSide)];
  }
  function getExpandedPlacements(placement) {
    const oppositePlacement = getOppositePlacement(placement);
    return [getOppositeAlignmentPlacement(placement), oppositePlacement, getOppositeAlignmentPlacement(oppositePlacement)];
  }
  function getOppositeAlignmentPlacement(placement) {
    return placement.replace(/start|end/g, alignment => oppositeAlignmentMap[alignment]);
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
  function getOppositePlacement(placement) {
    return placement.replace(/left|right|bottom|top/g, side => oppositeSideMap[side]);
  }
  function expandPaddingObject(padding) {
    return {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      ...padding
    };
  }
  function getPaddingObject(padding) {
    return typeof padding !== 'number' ? expandPaddingObject(padding) : {
      top: padding,
      right: padding,
      bottom: padding,
      left: padding
    };
  }
  function rectToClientRect(rect) {
    const {
      x,
      y,
      width,
      height
    } = rect;
    return {
      width,
      height,
      top: y,
      left: x,
      right: x + width,
      bottom: y + height,
      x,
      y
    };
  }

  function computeCoordsFromPlacement(_ref, placement, rtl) {
    let {
      reference,
      floating
    } = _ref;
    const sideAxis = getSideAxis(placement);
    const alignmentAxis = getAlignmentAxis(placement);
    const alignLength = getAxisLength(alignmentAxis);
    const side = getSide(placement);
    const isVertical = sideAxis === 'y';
    const commonX = reference.x + reference.width / 2 - floating.width / 2;
    const commonY = reference.y + reference.height / 2 - floating.height / 2;
    const commonAlign = reference[alignLength] / 2 - floating[alignLength] / 2;
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
        coords[alignmentAxis] -= commonAlign * (rtl && isVertical ? -1 : 1);
        break;
      case 'end':
        coords[alignmentAxis] += commonAlign * (rtl && isVertical ? -1 : 1);
        break;
    }
    return coords;
  }

  /**
   * Computes the `x` and `y` coordinates that will place the floating element
   * next to a given reference element.
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
    } = evaluate(options, state);
    const paddingObject = getPaddingObject(padding);
    const altContext = elementContext === 'floating' ? 'reference' : 'floating';
    const element = elements[altBoundary ? altContext : elementContext];
    const clippingClientRect = rectToClientRect(await platform.getClippingRect({
      element: ((_await$platform$isEle = await (platform.isElement == null ? void 0 : platform.isElement(element))) != null ? _await$platform$isEle : true) ? element : element.contextElement || (await (platform.getDocumentElement == null ? void 0 : platform.getDocumentElement(elements.floating))),
      boundary,
      rootBoundary,
      strategy
    }));
    const rect = elementContext === 'floating' ? {
      x,
      y,
      width: rects.floating.width,
      height: rects.floating.height
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
      elements,
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

  /**
   * Provides data to position an inner element of the floating element so that it
   * appears centered to the reference element.
   * @see https://floating-ui.com/docs/arrow
   */
  const arrow$1 = options => ({
    name: 'arrow',
    options,
    async fn(state) {
      const {
        x,
        y,
        placement,
        rects,
        platform,
        elements,
        middlewareData
      } = state;
      // Since `element` is required, we don't Partial<> the type.
      const {
        element,
        padding = 0
      } = evaluate(options, state) || {};
      if (element == null) {
        return {};
      }
      const paddingObject = getPaddingObject(padding);
      const coords = {
        x,
        y
      };
      const axis = getAlignmentAxis(placement);
      const length = getAxisLength(axis);
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

      // If the padding is large enough that it causes the arrow to no longer be
      // centered, modify the padding so that it is centered.
      const largestPossiblePadding = clientSize / 2 - arrowDimensions[length] / 2 - 1;
      const minPadding = min(paddingObject[minProp], largestPossiblePadding);
      const maxPadding = min(paddingObject[maxProp], largestPossiblePadding);

      // Make sure the arrow doesn't overflow the floating element if the center
      // point is outside the floating element's bounds.
      const min$1 = minPadding;
      const max = clientSize - arrowDimensions[length] - maxPadding;
      const center = clientSize / 2 - arrowDimensions[length] / 2 + centerToReference;
      const offset = clamp(min$1, center, max);

      // If the reference is small enough that the arrow's padding causes it to
      // to point to nothing for an aligned placement, adjust the offset of the
      // floating element itself. To ensure `shift()` continues to take action,
      // a single reset is performed when this is true.
      const shouldAddOffset = !middlewareData.arrow && getAlignment(placement) != null && center !== offset && rects.reference[length] / 2 - (center < min$1 ? minPadding : maxPadding) - arrowDimensions[length] / 2 < 0;
      const alignmentOffset = shouldAddOffset ? center < min$1 ? center - min$1 : center - max : 0;
      return {
        [axis]: coords[axis] + alignmentOffset,
        data: {
          [axis]: offset,
          centerOffset: center - offset - alignmentOffset,
          ...(shouldAddOffset && {
            alignmentOffset
          })
        },
        reset: shouldAddOffset
      };
    }
  });

  /**
   * Optimizes the visibility of the floating element by flipping the `placement`
   * in order to keep it in view when the preferred placement(s) will overflow the
   * clipping boundary. Alternative to `autoPlacement`.
   * @see https://floating-ui.com/docs/flip
   */
  const flip$1 = function (options) {
    if (options === void 0) {
      options = {};
    }
    return {
      name: 'flip',
      options,
      async fn(state) {
        var _middlewareData$arrow, _middlewareData$flip;
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
        } = evaluate(options, state);

        // If a reset by the arrow was caused due to an alignment offset being
        // added, we should skip any logic now since `flip()` has already done its
        // work.
        // https://github.com/floating-ui/floating-ui/issues/2549#issuecomment-1719601643
        if ((_middlewareData$arrow = middlewareData.arrow) != null && _middlewareData$arrow.alignmentOffset) {
          return {};
        }
        const side = getSide(placement);
        const initialSideAxis = getSideAxis(initialPlacement);
        const isBasePlacement = getSide(initialPlacement) === initialPlacement;
        const rtl = await (platform.isRTL == null ? void 0 : platform.isRTL(elements.floating));
        const fallbackPlacements = specifiedFallbackPlacements || (isBasePlacement || !flipAlignment ? [getOppositePlacement(initialPlacement)] : getExpandedPlacements(initialPlacement));
        const hasFallbackAxisSideDirection = fallbackAxisSideDirection !== 'none';
        if (!specifiedFallbackPlacements && hasFallbackAxisSideDirection) {
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
          const sides = getAlignmentSides(placement, rects, rtl);
          overflows.push(overflow[sides[0]], overflow[sides[1]]);
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
                  var _overflowsData$filter2;
                  const placement = (_overflowsData$filter2 = overflowsData.filter(d => {
                    if (hasFallbackAxisSideDirection) {
                      const currentSideAxis = getSideAxis(d.placement);
                      return currentSideAxis === initialSideAxis ||
                      // Create a bias to the `y` side axis due to horizontal
                      // reading directions favoring greater width.
                      currentSideAxis === 'y';
                    }
                    return true;
                  }).map(d => [d.placement, d.overflows.filter(overflow => overflow > 0).reduce((acc, overflow) => acc + overflow, 0)]).sort((a, b) => a[1] - b[1])[0]) == null ? void 0 : _overflowsData$filter2[0];
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

  // For type backwards-compatibility, the `OffsetOptions` type was also
  // Derivable.

  async function convertValueToCoords(state, options) {
    const {
      placement,
      platform,
      elements
    } = state;
    const rtl = await (platform.isRTL == null ? void 0 : platform.isRTL(elements.floating));
    const side = getSide(placement);
    const alignment = getAlignment(placement);
    const isVertical = getSideAxis(placement) === 'y';
    const mainAxisMulti = ['left', 'top'].includes(side) ? -1 : 1;
    const crossAxisMulti = rtl && isVertical ? -1 : 1;
    const rawValue = evaluate(options, state);

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
      mainAxis: rawValue.mainAxis || 0,
      crossAxis: rawValue.crossAxis || 0,
      alignmentAxis: rawValue.alignmentAxis
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
  const offset$1 = function (options) {
    if (options === void 0) {
      options = 0;
    }
    return {
      name: 'offset',
      options,
      async fn(state) {
        var _middlewareData$offse, _middlewareData$arrow;
        const {
          x,
          y,
          placement,
          middlewareData
        } = state;
        const diffCoords = await convertValueToCoords(state, options);

        // If the placement is the same and the arrow caused an alignment offset
        // then we don't need to change the positioning coordinates.
        if (placement === ((_middlewareData$offse = middlewareData.offset) == null ? void 0 : _middlewareData$offse.placement) && (_middlewareData$arrow = middlewareData.arrow) != null && _middlewareData$arrow.alignmentOffset) {
          return {};
        }
        return {
          x: x + diffCoords.x,
          y: y + diffCoords.y,
          data: {
            ...diffCoords,
            placement
          }
        };
      }
    };
  };

  /**
   * Optimizes the visibility of the floating element by shifting it in order to
   * keep it in view when it will overflow the clipping boundary.
   * @see https://floating-ui.com/docs/shift
   */
  const shift$1 = function (options) {
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
        } = evaluate(options, state);
        const coords = {
          x,
          y
        };
        const overflow = await detectOverflow(state, detectOverflowOptions);
        const crossAxis = getSideAxis(getSide(placement));
        const mainAxis = getOppositeAxis(crossAxis);
        let mainAxisCoord = coords[mainAxis];
        let crossAxisCoord = coords[crossAxis];
        if (checkMainAxis) {
          const minSide = mainAxis === 'y' ? 'top' : 'left';
          const maxSide = mainAxis === 'y' ? 'bottom' : 'right';
          const min = mainAxisCoord + overflow[minSide];
          const max = mainAxisCoord - overflow[maxSide];
          mainAxisCoord = clamp(min, mainAxisCoord, max);
        }
        if (checkCrossAxis) {
          const minSide = crossAxis === 'y' ? 'top' : 'left';
          const maxSide = crossAxis === 'y' ? 'bottom' : 'right';
          const min = crossAxisCoord + overflow[minSide];
          const max = crossAxisCoord - overflow[maxSide];
          crossAxisCoord = clamp(min, crossAxisCoord, max);
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
            y: limitedCoords.y - y,
            enabled: {
              [mainAxis]: checkMainAxis,
              [crossAxis]: checkCrossAxis
            }
          }
        };
      }
    };
  };
  /**
   * Built-in `limiter` that will stop `shift()` at a certain point.
   */
  const limitShift$1 = function (options) {
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
        } = evaluate(options, state);
        const coords = {
          x,
          y
        };
        const crossAxis = getSideAxis(placement);
        const mainAxis = getOppositeAxis(crossAxis);
        let mainAxisCoord = coords[mainAxis];
        let crossAxisCoord = coords[crossAxis];
        const rawOffset = evaluate(offset, state);
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

  function hasWindow() {
    return typeof window !== 'undefined';
  }
  function getNodeName(node) {
    if (isNode(node)) {
      return (node.nodeName || '').toLowerCase();
    }
    // Mocked nodes in testing environments may not be instances of Node. By
    // returning `#document` an infinite loop won't occur.
    // https://github.com/floating-ui/floating-ui/issues/2317
    return '#document';
  }
  function getWindow(node) {
    var _node$ownerDocument;
    return (node == null || (_node$ownerDocument = node.ownerDocument) == null ? void 0 : _node$ownerDocument.defaultView) || window;
  }
  function getDocumentElement(node) {
    var _ref;
    return (_ref = (isNode(node) ? node.ownerDocument : node.document) || window.document) == null ? void 0 : _ref.documentElement;
  }
  function isNode(value) {
    if (!hasWindow()) {
      return false;
    }
    return value instanceof Node || value instanceof getWindow(value).Node;
  }
  function isElement(value) {
    if (!hasWindow()) {
      return false;
    }
    return value instanceof Element || value instanceof getWindow(value).Element;
  }
  function isHTMLElement(value) {
    if (!hasWindow()) {
      return false;
    }
    return value instanceof HTMLElement || value instanceof getWindow(value).HTMLElement;
  }
  function isShadowRoot(value) {
    if (!hasWindow() || typeof ShadowRoot === 'undefined') {
      return false;
    }
    return value instanceof ShadowRoot || value instanceof getWindow(value).ShadowRoot;
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
  function isTopLayer(element) {
    return [':popover-open', ':modal'].some(selector => {
      try {
        return element.matches(selector);
      } catch (e) {
        return false;
      }
    });
  }
  function isContainingBlock(elementOrCss) {
    const webkit = isWebKit();
    const css = isElement(elementOrCss) ? getComputedStyle$1(elementOrCss) : elementOrCss;

    // https://developer.mozilla.org/en-US/docs/Web/CSS/Containing_block#identifying_the_containing_block
    // https://drafts.csswg.org/css-transforms-2/#individual-transforms
    return ['transform', 'translate', 'scale', 'rotate', 'perspective'].some(value => css[value] ? css[value] !== 'none' : false) || (css.containerType ? css.containerType !== 'normal' : false) || !webkit && (css.backdropFilter ? css.backdropFilter !== 'none' : false) || !webkit && (css.filter ? css.filter !== 'none' : false) || ['transform', 'translate', 'scale', 'rotate', 'perspective', 'filter'].some(value => (css.willChange || '').includes(value)) || ['paint', 'layout', 'strict', 'content'].some(value => (css.contain || '').includes(value));
  }
  function getContainingBlock(element) {
    let currentNode = getParentNode(element);
    while (isHTMLElement(currentNode) && !isLastTraversableNode(currentNode)) {
      if (isContainingBlock(currentNode)) {
        return currentNode;
      } else if (isTopLayer(currentNode)) {
        return null;
      }
      currentNode = getParentNode(currentNode);
    }
    return null;
  }
  function isWebKit() {
    if (typeof CSS === 'undefined' || !CSS.supports) return false;
    return CSS.supports('-webkit-backdrop-filter', 'none');
  }
  function isLastTraversableNode(node) {
    return ['html', 'body', '#document'].includes(getNodeName(node));
  }
  function getComputedStyle$1(element) {
    return getWindow(element).getComputedStyle(element);
  }
  function getNodeScroll(element) {
    if (isElement(element)) {
      return {
        scrollLeft: element.scrollLeft,
        scrollTop: element.scrollTop
      };
    }
    return {
      scrollLeft: element.scrollX,
      scrollTop: element.scrollY
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
      return node.ownerDocument ? node.ownerDocument.body : node.body;
    }
    if (isHTMLElement(parentNode) && isOverflowElement(parentNode)) {
      return parentNode;
    }
    return getNearestOverflowAncestor(parentNode);
  }
  function getOverflowAncestors(node, list, traverseIframes) {
    var _node$ownerDocument2;
    if (list === void 0) {
      list = [];
    }
    if (traverseIframes === void 0) {
      traverseIframes = true;
    }
    const scrollableAncestor = getNearestOverflowAncestor(node);
    const isBody = scrollableAncestor === ((_node$ownerDocument2 = node.ownerDocument) == null ? void 0 : _node$ownerDocument2.body);
    const win = getWindow(scrollableAncestor);
    if (isBody) {
      const frameElement = getFrameElement(win);
      return list.concat(win, win.visualViewport || [], isOverflowElement(scrollableAncestor) ? scrollableAncestor : [], frameElement && traverseIframes ? getOverflowAncestors(frameElement) : []);
    }
    return list.concat(scrollableAncestor, getOverflowAncestors(scrollableAncestor, [], traverseIframes));
  }
  function getFrameElement(win) {
    return win.parent && Object.getPrototypeOf(win.parent) ? win.frameElement : null;
  }

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
      $: shouldFallback
    };
  }
  function unwrapElement(element) {
    return !isElement(element) ? element.contextElement : element;
  }
  function getScale(element) {
    const domElement = unwrapElement(element);
    if (!isHTMLElement(domElement)) {
      return createCoords(1);
    }
    const rect = domElement.getBoundingClientRect();
    const {
      width,
      height,
      $
    } = getCssDimensions(domElement);
    let x = ($ ? round(rect.width) : rect.width) / width;
    let y = ($ ? round(rect.height) : rect.height) / height;

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
  const noOffsets = /*#__PURE__*/createCoords(0);
  function getVisualOffsets(element) {
    const win = getWindow(element);
    if (!isWebKit() || !win.visualViewport) {
      return noOffsets;
    }
    return {
      x: win.visualViewport.offsetLeft,
      y: win.visualViewport.offsetTop
    };
  }
  function shouldAddVisualOffsets(element, isFixed, floatingOffsetParent) {
    if (isFixed === void 0) {
      isFixed = false;
    }
    if (!floatingOffsetParent || isFixed && floatingOffsetParent !== getWindow(element)) {
      return false;
    }
    return isFixed;
  }
  function getBoundingClientRect(element, includeScale, isFixedStrategy, offsetParent) {
    if (includeScale === void 0) {
      includeScale = false;
    }
    if (isFixedStrategy === void 0) {
      isFixedStrategy = false;
    }
    const clientRect = element.getBoundingClientRect();
    const domElement = unwrapElement(element);
    let scale = createCoords(1);
    if (includeScale) {
      if (offsetParent) {
        if (isElement(offsetParent)) {
          scale = getScale(offsetParent);
        }
      } else {
        scale = getScale(element);
      }
    }
    const visualOffsets = shouldAddVisualOffsets(domElement, isFixedStrategy, offsetParent) ? getVisualOffsets(domElement) : createCoords(0);
    let x = (clientRect.left + visualOffsets.x) / scale.x;
    let y = (clientRect.top + visualOffsets.y) / scale.y;
    let width = clientRect.width / scale.x;
    let height = clientRect.height / scale.y;
    if (domElement) {
      const win = getWindow(domElement);
      const offsetWin = offsetParent && isElement(offsetParent) ? getWindow(offsetParent) : offsetParent;
      let currentWin = win;
      let currentIFrame = getFrameElement(currentWin);
      while (currentIFrame && offsetParent && offsetWin !== currentWin) {
        const iframeScale = getScale(currentIFrame);
        const iframeRect = currentIFrame.getBoundingClientRect();
        const css = getComputedStyle$1(currentIFrame);
        const left = iframeRect.left + (currentIFrame.clientLeft + parseFloat(css.paddingLeft)) * iframeScale.x;
        const top = iframeRect.top + (currentIFrame.clientTop + parseFloat(css.paddingTop)) * iframeScale.y;
        x *= iframeScale.x;
        y *= iframeScale.y;
        width *= iframeScale.x;
        height *= iframeScale.y;
        x += left;
        y += top;
        currentWin = getWindow(currentIFrame);
        currentIFrame = getFrameElement(currentWin);
      }
    }
    return rectToClientRect({
      width,
      height,
      x,
      y
    });
  }

  // If <html> has a CSS width greater than the viewport, then this will be
  // incorrect for RTL.
  function getWindowScrollBarX(element, rect) {
    const leftScroll = getNodeScroll(element).scrollLeft;
    if (!rect) {
      return getBoundingClientRect(getDocumentElement(element)).left + leftScroll;
    }
    return rect.left + leftScroll;
  }
  function getHTMLOffset(documentElement, scroll, ignoreScrollbarX) {
    if (ignoreScrollbarX === void 0) {
      ignoreScrollbarX = false;
    }
    const htmlRect = documentElement.getBoundingClientRect();
    const x = htmlRect.left + scroll.scrollLeft - (ignoreScrollbarX ? 0 :
    // RTL <body> scrollbar.
    getWindowScrollBarX(documentElement, htmlRect));
    const y = htmlRect.top + scroll.scrollTop;
    return {
      x,
      y
    };
  }
  function convertOffsetParentRelativeRectToViewportRelativeRect(_ref) {
    let {
      elements,
      rect,
      offsetParent,
      strategy
    } = _ref;
    const isFixed = strategy === 'fixed';
    const documentElement = getDocumentElement(offsetParent);
    const topLayer = elements ? isTopLayer(elements.floating) : false;
    if (offsetParent === documentElement || topLayer && isFixed) {
      return rect;
    }
    let scroll = {
      scrollLeft: 0,
      scrollTop: 0
    };
    let scale = createCoords(1);
    const offsets = createCoords(0);
    const isOffsetParentAnElement = isHTMLElement(offsetParent);
    if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
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
    const htmlOffset = documentElement && !isOffsetParentAnElement && !isFixed ? getHTMLOffset(documentElement, scroll, true) : createCoords(0);
    return {
      width: rect.width * scale.x,
      height: rect.height * scale.y,
      x: rect.x * scale.x - scroll.scrollLeft * scale.x + offsets.x + htmlOffset.x,
      y: rect.y * scale.y - scroll.scrollTop * scale.y + offsets.y + htmlOffset.y
    };
  }
  function getClientRects(element) {
    return Array.from(element.getClientRects());
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
      const visualViewportBased = isWebKit();
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
    const scale = isHTMLElement(element) ? getScale(element) : createCoords(1);
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
      const visualOffsets = getVisualOffsets(element);
      rect = {
        x: clippingAncestor.x - visualOffsets.x,
        y: clippingAncestor.y - visualOffsets.y,
        width: clippingAncestor.width,
        height: clippingAncestor.height
      };
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
    let result = getOverflowAncestors(element, [], false).filter(el => isElement(el) && getNodeName(el) !== 'body');
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
    const elementClippingAncestors = boundary === 'clippingAncestors' ? isTopLayer(element) ? [] : getClippingElementAncestors(element, this._c) : [].concat(boundary);
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
    const {
      width,
      height
    } = getCssDimensions(element);
    return {
      width,
      height
    };
  }
  function getRectRelativeToOffsetParent(element, offsetParent, strategy) {
    const isOffsetParentAnElement = isHTMLElement(offsetParent);
    const documentElement = getDocumentElement(offsetParent);
    const isFixed = strategy === 'fixed';
    const rect = getBoundingClientRect(element, true, isFixed, offsetParent);
    let scroll = {
      scrollLeft: 0,
      scrollTop: 0
    };
    const offsets = createCoords(0);
    if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
      if (getNodeName(offsetParent) !== 'body' || isOverflowElement(documentElement)) {
        scroll = getNodeScroll(offsetParent);
      }
      if (isOffsetParentAnElement) {
        const offsetRect = getBoundingClientRect(offsetParent, true, isFixed, offsetParent);
        offsets.x = offsetRect.x + offsetParent.clientLeft;
        offsets.y = offsetRect.y + offsetParent.clientTop;
      } else if (documentElement) {
        // If the <body> scrollbar appears on the left (e.g. RTL systems). Use
        // Firefox with layout.scrollbar.side = 3 in about:config to test this.
        offsets.x = getWindowScrollBarX(documentElement);
      }
    }
    const htmlOffset = documentElement && !isOffsetParentAnElement && !isFixed ? getHTMLOffset(documentElement, scroll) : createCoords(0);
    const x = rect.left + scroll.scrollLeft - offsets.x - htmlOffset.x;
    const y = rect.top + scroll.scrollTop - offsets.y - htmlOffset.y;
    return {
      x,
      y,
      width: rect.width,
      height: rect.height
    };
  }
  function isStaticPositioned(element) {
    return getComputedStyle$1(element).position === 'static';
  }
  function getTrueOffsetParent(element, polyfill) {
    if (!isHTMLElement(element) || getComputedStyle$1(element).position === 'fixed') {
      return null;
    }
    if (polyfill) {
      return polyfill(element);
    }
    let rawOffsetParent = element.offsetParent;

    // Firefox returns the <html> element as the offsetParent if it's non-static,
    // while Chrome and Safari return the <body> element. The <body> element must
    // be used to perform the correct calculations even if the <html> element is
    // non-static.
    if (getDocumentElement(element) === rawOffsetParent) {
      rawOffsetParent = rawOffsetParent.ownerDocument.body;
    }
    return rawOffsetParent;
  }

  // Gets the closest ancestor positioned element. Handles some edge cases,
  // such as table ancestors and cross browser bugs.
  function getOffsetParent(element, polyfill) {
    const win = getWindow(element);
    if (isTopLayer(element)) {
      return win;
    }
    if (!isHTMLElement(element)) {
      let svgOffsetParent = getParentNode(element);
      while (svgOffsetParent && !isLastTraversableNode(svgOffsetParent)) {
        if (isElement(svgOffsetParent) && !isStaticPositioned(svgOffsetParent)) {
          return svgOffsetParent;
        }
        svgOffsetParent = getParentNode(svgOffsetParent);
      }
      return win;
    }
    let offsetParent = getTrueOffsetParent(element, polyfill);
    while (offsetParent && isTableElement(offsetParent) && isStaticPositioned(offsetParent)) {
      offsetParent = getTrueOffsetParent(offsetParent, polyfill);
    }
    if (offsetParent && isLastTraversableNode(offsetParent) && isStaticPositioned(offsetParent) && !isContainingBlock(offsetParent)) {
      return win;
    }
    return offsetParent || getContainingBlock(element) || win;
  }
  const getElementRects = async function (data) {
    const getOffsetParentFn = this.getOffsetParent || getOffsetParent;
    const getDimensionsFn = this.getDimensions;
    const floatingDimensions = await getDimensionsFn(data.floating);
    return {
      reference: getRectRelativeToOffsetParent(data.reference, await getOffsetParentFn(data.floating), data.strategy),
      floating: {
        x: 0,
        y: 0,
        width: floatingDimensions.width,
        height: floatingDimensions.height
      }
    };
  };
  function isRTL(element) {
    return getComputedStyle$1(element).direction === 'rtl';
  }
  const platform = {
    convertOffsetParentRelativeRectToViewportRelativeRect,
    getDocumentElement,
    getClippingRect,
    getOffsetParent,
    getElementRects,
    getClientRects,
    getDimensions,
    getScale,
    isElement,
    isRTL
  };

  /**
   * Modifies the placement by translating the floating element along the
   * specified axes.
   * A number (shorthand for `mainAxis` or distance), or an axes configuration
   * object may be passed.
   * @see https://floating-ui.com/docs/offset
   */
  const offset = offset$1;

  /**
   * Optimizes the visibility of the floating element by shifting it in order to
   * keep it in view when it will overflow the clipping boundary.
   * @see https://floating-ui.com/docs/shift
   */
  const shift = shift$1;

  /**
   * Optimizes the visibility of the floating element by flipping the `placement`
   * in order to keep it in view when the preferred placement(s) will overflow the
   * clipping boundary. Alternative to `autoPlacement`.
   * @see https://floating-ui.com/docs/flip
   */
  const flip = flip$1;

  /**
   * Provides data to position an inner element of the floating element so that it
   * appears centered to the reference element.
   * @see https://floating-ui.com/docs/arrow
   */
  const arrow = arrow$1;

  /**
   * Built-in `limiter` that will stop `shift()` at a certain point.
   */
  const limitShift = limitShift$1;

  /**
   * Computes the `x` and `y` coordinates that will place the floating element
   * next to a given reference element.
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
      return function executedFunction(...args) {
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
    async updatePopover(popover, placement, anchor = this.popoverAnchor) {
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
      const options = this.dropdown.querySelectorAll(`.js-${this.optionClass}`);
      options.forEach(option => {
        const isVisible = ariaExpanded === 'true';
        option.setAttribute('aria-hidden', !isVisible);
      });
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
        const ariaHidden = options[i].hasAttribute('hidden') ? 'aria-hidden="true"' : '';
        list = `${list}<li class="js-${this.optionClass}" role="option" data-value="${options[i].value}" ${selected} ${ariaHidden} data-label="${options[i].text}" data-index="${this.optionIndex}"><input class="${this.prefix}${this.checkboxInputClass} js-${this.checkboxClass}" type="checkbox" id="${uniqueName}" ${checked} ${disabled}><label class="${this.prefix}${this.checkboxLabelClass} ${this.prefix}${this.itemClass} ${this.prefix}${this.itemClass}--option" for="${uniqueName}"><span>${options[i].text}</span></label></li>`;
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
    arrowKeys({
      which
    }) {
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
    updateToggletip(toggletip, arrowElement, anchor = this.toggletipAnchor) {
      computePosition(anchor, toggletip, {
        placement: 'top',
        middleware: [offset(8), flip(), shift({
          padding: 5
        }), arrow({
          element: arrowElement
        })]
      }).then(({
        x,
        y,
        placement,
        middlewareData
      }) => {
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
      eventArray.forEach((event, {
        listener = this.handleEvent.bind(this)
      }) => {
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
    updateTooltip(tooltip, arrowElement, anchor = this.tooltip) {
      computePosition(anchor, tooltip, {
        placement: 'top',
        middleware: [offset(8), flip(), shift({
          padding: 5
        }), arrow({
          element: arrowElement
        })]
      }).then(({
        x,
        y,
        placement,
        middlewareData
      }) => {
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
    constructor(element, toggletip = element.querySelector('.js-share')) {
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
      const originalText = this.copyElement.innerHTML;
      this.copyElement.classList.add('copied');
      this.copyElement.innerHTML = `${icon} Copied`;
      setTimeout(() => {
        this.copyElement.classList.remove('copied');
        this.copyElement.innerHTML = originalText;
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
    const breadcrumbs = document.querySelectorAll('.js-breadcrumbs');
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
    if (breadcrumbs) {
      breadcrumbs.forEach(element => {
        new Breadcrumbs(element).init();
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
  exports.CookieConsent = CookieConsent;
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
