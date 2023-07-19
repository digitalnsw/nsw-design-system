(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define('NSW', ['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.NSW = {}));
})(this, (function (exports) { 'use strict';

  class SiteSearch {
    constructor(element) {
      this.triggerButton = element;
      this.originalButton = document.querySelector('.js-open-search');
      this.targetElement = document.getElementById(this.triggerButton.getAttribute('aria-controls'));
      this.searchInput = this.targetElement.querySelector('.js-search-input');
      this.pressed = this.triggerButton.getAttribute('aria-expanded') === 'true';
    }
    init() {
      this.controls();
    }
    controls() {
      this.triggerButton.addEventListener('click', this.showHide.bind(this), false);
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

  class Navigation {
    constructor() {
      this.openNavButton = document.querySelector('.js-open-nav');
      this.closeNavButtons = document.querySelectorAll('.js-close-nav');
      this.openSubNavButtons = document.querySelectorAll('.js-open-sub-nav');
      this.closeSubNavButtons = document.querySelectorAll('.js-close-sub-nav');
      this.mainNavElement = document.getElementById('main-nav');
      this.isMegaMenuElement = !!document.querySelector('.js-mega-menu');
      this.transitionEvent = whichTransitionEvent();
      this.mobileToggleMainNavEvent = e => this.mobileToggleMainNav(e);
      this.mobileToggleSubNavEvent = () => this.closeSubNav();
      this.mobileShowMainTransitionEndEvent = e => this.mobileShowMainNav(e);
      this.mobileHideMainTransitionEndEvent = e => this.mobileHideMainNav(e);
      this.showSubNavTransitionEndEvent = e => this.showSubNav(e);
      this.mobileTrapTabKeyEvent = e => this.mobileMainNavTrapTabs(e);
      this.mobileSubNavTrapTabKeyEvent = e => this.trapkeyEventStuff(e);
      this.desktopButtonClickEvent = e => this.buttonClickDesktop(e);
      this.desktopButtonKeydownEvent = e => this.buttonKeydownDesktop(e);
      this.checkFocusEvent = e => this.checkIfContainsFocus(e);
      this.escapeCloseEvent = e => this.escapeClose(e);
      this.outsideClickEvent = e => this.handleOutsideClick(e);
      this.openSubNavElements = [];
      this.breakpoint = window.matchMedia('(min-width: 62em)');
      this.body = document.body;
    }
    init() {
      if (this.mainNavElement) {
        this.setUpMobileControls();
        this.responsiveCheck(this.breakpoint);
        this.breakpoint.addListener(e => this.responsiveCheck(e));
        this.addOutsideClickListener();
      }
    }
    addOutsideClickListener() {
      document.addEventListener('click', this.outsideClickEvent, false);
    }
    removeOutsideClickListener() {
      document.removeEventListener('click', this.outsideClickEvent, false);
    }
    handleOutsideClick(event) {
      const isOutsideNav = !this.mainNavElement.contains(event.target);
      if (isOutsideNav) {
        this.saveElements(event);
        this.toggleSubNavDesktop(true);
        event.preventDefault();
      }
    }
    responsiveCheck(e) {
      let megaMenuListItems = [];
      if (e.matches) {
        megaMenuListItems = [].slice.call(this.mainNavElement.querySelectorAll('ul > li'));
        this.body.classList.remove('main-nav-active');
      } else {
        megaMenuListItems = [].slice.call(this.mainNavElement.querySelectorAll('li'));
      }
      this.tearDownNavControls();
      this.setUpNavControls(megaMenuListItems);
    }
    tearDownNavControls() {
      if (this.isMegaMenuElement) {
        const listItems = [].slice.call(this.mainNavElement.querySelectorAll('li'));
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
    setUpMobileControls() {
      this.openNavButton.addEventListener('click', this.mobileToggleMainNavEvent, false);
      this.closeNavButtons.forEach(element => {
        element.addEventListener('click', this.mobileToggleMainNavEvent, false);
      });
      this.closeSubNavButtons.forEach(element => {
        element.addEventListener('click', this.mobileToggleSubNavEvent, false);
      });
    }
    mobileMainNavTrapTabs(e) {
      const elemObj = getFocusableElementBySelector(this.mainNavElement.id, ['> div button', '> ul > li > a']);
      trapTabKey(e, elemObj);
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
            document.addEventListener('keydown', this.escapeCloseEvent, false);
          }
        });
      }
    }
    mobileShowMainNav(_ref) {
      let {
        propertyName
      } = _ref;
      if (!propertyName === 'transform') return;
      getFocusableElementBySelector(this.mainNavElement.id, ['> div button', '> ul > li > a']).all[1].focus();
      this.mainNavElement.classList.add('active');
      this.mainNavElement.classList.remove('activating');
      this.mainNavElement.removeEventListener(this.transitionEvent, this.mobileShowMainTransitionEndEvent, false);
      this.mainNavElement.addEventListener('keydown', this.mobileTrapTabKeyEvent, false);
    }
    mobileHideMainNav(_ref2) {
      let {
        propertyName
      } = _ref2;
      if (!propertyName === 'transform') return;
      this.mainNavElement.classList.remove('active');
      this.mainNavElement.classList.remove('closing');
      while (this.openSubNavElements.length > 0) {
        const {
          submenu
        } = this.whichSubNavLatest();
        submenu.removeEventListener('keydown', this.mobileSubNavTrapTabKeyEvent, false);
        submenu.classList.remove('active');
        submenu.classList.remove('closing');
        this.openSubNavElements.pop();
      }
      this.mainNavElement.removeEventListener(this.transitionEvent, this.mobileHideMainTransitionEndEvent, false);
      this.mainNavElement.removeEventListener('keydown', this.mobileTrapTabKeyEvent, false);
    }
    mobileToggleMainNav(e) {
      const {
        currentTarget
      } = e;
      const isExpanded = currentTarget.getAttribute('aria-expanded') === 'true';
      if (isExpanded) {
        this.body.classList.remove('main-nav-active');
        this.openNavButton.focus();
        this.mainNavElement.classList.add('closing');
        this.mainNavElement.addEventListener(this.transitionEvent, this.mobileHideMainTransitionEndEvent, false);
      } else {
        this.body.classList.add('main-nav-active');
        this.mainNavElement.classList.add('activating');
        this.mainNavElement.addEventListener(this.transitionEvent, this.mobileShowMainTransitionEndEvent, false);
      }
    }
    buttonClickDesktop(e) {
      const isDesktop = this.breakpoint.matches;
      if (!isDesktop || !e.target.closest('.nsw-main-nav__sub-nav')) {
        this.saveElements(e);
        this.toggleSubNavDesktop();
        e.preventDefault();
      }
    }
    buttonKeydownDesktop(e) {
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'Spacebar') {
        this.saveElements(e);
        this.toggleSubNavDesktop();
        e.preventDefault();
      }
    }
    escapeClose(e) {
      if (e.key === 'Escape') {
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
      if (!propertyName === 'transform') return;
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
        this.mainNavElement.removeEventListener('focus', this.checkFocusEvent, true);
        // fix: workaround for safari because it doesn't support focus event
        this.mainNavElement.removeEventListener('click', this.checkFocusEvent, true);
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
        this.mainNavElement.addEventListener('focus', this.checkFocusEvent, true);
        // fix: workaround for safari because it doesn't support focus event
        this.mainNavElement.addEventListener('click', this.checkFocusEvent, true);
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
        this.closeSubNav();
      } else {
        this.openSubNav();
      }
    }
    checkIfContainsFocus(e) {
      const {
        linkParent
      } = this.whichSubNavLatest();
      const focusWithin = linkParent.contains(e.target);
      const isButton = e.target.getAttribute('role');
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
      const [expandAll, collapseAll] = Array.from(element.querySelectorAll('.nsw-accordion__toggle button'));
      this.accordionHeadingClass = '.nsw-accordion__title';
      this.accordion = element;
      this.headings = element.querySelectorAll(this.accordionHeadingClass);
      this.expandAllBtn = expandAll;
      this.collapseAllBtn = collapseAll;
      this.buttons = [];
      this.content = [];
      this.toggleEvent = e => this.toggle(e);
      this.expandAllEvent = e => this.expandAll(e);
      this.collapseAllEvent = e => this.collapseAll(e);
    }
    init() {
      this.setUpDom();
      this.controls();
    }
    setUpDom() {
      this.accordion.classList.add('ready');
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
        contentElem.id = buttonElem.getAttribute('aria-controls');
        contentElem.hidden = true;
        this.content.push(contentElem);
        this.buttons.push(buttonElem);
      });
    }
    controls() {
      this.buttons.forEach(element => {
        element.addEventListener('click', this.toggleEvent, false);
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
        targetContent.hidden = true;
      }
    }
    toggle(e) {
      const {
        currentTarget
      } = e;
      const targetContent = this.getTargetContent(currentTarget);
      const isHidden = targetContent.hidden;
      if (isHidden) {
        this.setAccordionState(currentTarget, 'open');
      } else {
        this.setAccordionState(currentTarget, 'close');
      }
      if (this.expandAllBtn && this.collapseAllBtn) {
        this.expandAllBtn.disabled = this.content.every(item => item.hidden === false);
        this.collapseAllBtn.disabled = this.content.every(item => item.hidden === true);
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

  class Dialog {
    constructor(element) {
      this.dialog = element;
      this.dialogWrapper = element.querySelector('.nsw-dialog__wrapper');
      this.openBtn = document.querySelectorAll('.js-open-dialog-'.concat(element.getAttribute('id')));
      this.closeBtn = element.querySelectorAll('.js-close-dialog');
      // eslint-disable-next-line max-len
      this.focusableEls = element.querySelectorAll('a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled])');
      this.body = document.body;
      this.openEvent = e => this.openDialog(e);
      this.closeEvent = e => this.closeDialog(e);
      this.clickEvent = e => this.clickDialog(e);
      this.trapEvent = e => this.trapFocus(e);
    }
    init() {
      this.controls();
    }
    controls() {
      this.openBtn.forEach(btn => {
        btn.addEventListener('click', this.openEvent, false);
      });
      this.closeBtn.forEach(btn => {
        btn.addEventListener('click', this.closeEvent, false);
      });
      if (this.dialog.classList.contains('js-dialog-dismiss')) {
        this.dialog.addEventListener('click', this.clickEvent, false);
      }
      this.focusableEls[this.focusableEls.length - 1].addEventListener('blur', this.trapEvent, false);
    }
    openDialog() {
      this.dialog.setAttribute('aria-expanded', 'true');
      this.dialog.classList.add('active');
      this.body.classList.add('dialog-active');
      this.focusableEls[0].focus();
    }
    closeDialog() {
      this.dialog.setAttribute('aria-expanded', 'false');
      this.dialog.classList.remove('active');
      this.body.classList.remove('dialog-active');
    }
    clickDialog(e) {
      if (!this.dialogWrapper.contains(e.target)) {
        this.closeDialog();
      }
    }
    trapFocus(e) {
      e.preventDefault();
      this.focusableEls[0].focus();
    }
  }

  class Filters {
    constructor(element) {
      this.filters = element;
      this.filtersWrapper = element.querySelector('.nsw-filters__wrapper');
      this.openButton = element.querySelector('.nsw-filters__controls button');
      this.openButtonIcons = this.openButton ? this.openButton.querySelectorAll('span') : null;
      this.selectedCount = element.querySelector('.js-filters--count');
      this.openButtonText = this.selectedCount ? this.selectedCount.querySelector('span:not(.nsw-material-icons)') : null;
      this.buttonLabel = this.openButtonText ? this.openButtonText.innerText : null;
      this.closeButton = element.querySelector('.nsw-filters__back button');
      this.acceptButton = element.querySelector('.nsw-filters__accept button');
      this.clearButton = element.querySelector('.nsw-filters__cancel button');
      this.showMoreButtons = Array.prototype.slice.call(element.querySelectorAll('.nsw-filters__more'));
      this.accordionButtons = element.querySelectorAll('.nsw-filters__item-button');
      this.showAll = element.querySelectorAll('.nsw-filters__all');
      this.showAllBlocks = Array.prototype.slice.call(this.showAll);
      this.filtersItems = element.querySelectorAll('.nsw-filters__item');
      /* eslint-disable max-len */
      this.focusableEls = this.filtersWrapper.querySelectorAll('a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled])');
      this.checkIcon = '<span class="material-icons nsw-material-icons" focusable="false" aria-hidden="true">check_circle</span>';
      this.arrowIcon = '<span class="material-icons nsw-material-icons" focusable="false" aria-hidden="true">keyboard_arrow_right</span>';
      /* eslint-ensable max-len */
      this.showEvent = e => this.showFilters(e);
      this.hideEvent = e => this.hideFilters(e);
      this.showMoreEvent = e => this.showMore(e);
      this.toggleEvent = e => this.toggleAccordion(e);
      this.resetEvent = e => this.clearAllFilters(e);
      this.body = document.body;
      this.buttons = [];
      this.content = [];
      this.selected = [];
    }
    init() {
      this.setUpDom();
      this.controls();
      this.selectedItems();
    }
    setUpDom() {
      this.filters.classList.add('ready');
      if (this.openButton) {
        if (this.openButtonIcons.length < 3) {
          this.openButton.insertAdjacentHTML('beforeend', this.arrowIcon);
        }
      }
      this.accordionButtons.forEach(button => {
        const buttonElem = button;
        const uID = uniqueId('collapsed');
        buttonElem.setAttribute('type', 'button');
        buttonElem.setAttribute('aria-expanded', 'false');
        buttonElem.setAttribute('aria-controls', uID);
        const contentElem = buttonElem.nextElementSibling;
        contentElem.id = buttonElem.getAttribute('aria-controls');
        contentElem.hidden = true;
        this.content.push(contentElem);
        this.buttons.push(buttonElem);
      });
    }
    controls() {
      if (this.openButton) {
        this.openButton.addEventListener('click', this.showEvent, false);
      }
      if (this.acceptButton) {
        this.acceptButton.disabled = true;
      }
      if (this.closeButton) {
        this.closeButton.addEventListener('click', this.hideEvent, false);
      }
      this.showAll.forEach(element => {
        const showMoreButton = element.nextElementSibling;
        showMoreButton.addEventListener('click', this.showMoreEvent, false);
      });
      if (this.buttons) {
        this.buttons.forEach(element => {
          element.addEventListener('click', this.toggleEvent, false);
        });
      }
      if (this.clearButton) {
        this.clearButton.addEventListener('click', this.resetEvent, false);
      }
    }
    showFilters(e) {
      e.preventDefault();
      if (this.filters.classList.contains('nsw-filters--down')) {
        this.filters.classList.toggle('active');
      } else {
        this.trapFocus(this.filtersWrapper);
        this.filters.classList.add('active');
        this.body.classList.add('filters-open');
      }
    }
    hideFilters(e) {
      e.preventDefault();
      this.filters.classList.remove('active');
      this.body.classList.remove('filters-open');
    }
    showMore(e) {
      e.preventDefault();
      const currentShowMore = e.target;
      const currentIndex = this.showMoreButtons.indexOf(currentShowMore);
      const currentAll = this.showAllBlocks[currentIndex];
      currentAll.classList.remove('hidden');
      currentShowMore.classList.add('hidden');
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
        targetContent.hidden = true;
      }
    }
    toggleAccordion(e) {
      const {
        currentTarget
      } = e;
      const targetContent = this.getTargetContent(currentTarget);
      const isHidden = targetContent.hidden;
      if (isHidden) {
        this.setAccordionState(currentTarget, 'open');
      } else {
        this.setAccordionState(currentTarget, 'close');
      }
    }
    trapFocus(element) {
      const firstFocusableEl = this.focusableEls[0];
      const lastFocusableEl = this.focusableEls[this.focusableEls.length - 1];
      const KEYCODE_TAB = 9;
      element.addEventListener('keydown', e => {
        const isTabPressed = e.key === 'Tab' || e.keyCode === KEYCODE_TAB;
        if (!isTabPressed) {
          return;
        }
        if (e.shiftKey) {
          if (document.activeElement === firstFocusableEl) {
            e.preventDefault();
            lastFocusableEl.focus();
          }
        } else if (document.activeElement === lastFocusableEl) {
          e.preventDefault();
          firstFocusableEl.focus();
        }
      });
    }
    toggleAccept(array) {
      if (this.acceptButton) {
        if (array.length > 0) {
          this.acceptButton.disabled = false;
        } else {
          this.acceptButton.disabled = true;
        }
      }
    }
    toggleSelectedState(array) {
      if (array.length > 0) {
        this.openButton.parentElement.classList.add('active');
      } else {
        this.openButton.parentElement.classList.remove('active');
      }
    }
    resultsCount(array, buttonText) {
      if (this.openButtonText) {
        if (array.length > 0) {
          this.openButtonText.innerText = `${buttonText} (${array.length})`;
        } else {
          this.openButtonText.innerText = `${buttonText}`;
        }
      }
    }
    updateDom() {
      this.resultsCount(this.selected, this.buttonLabel);
      this.toggleAccept(this.selected);
      this.toggleSelectedState(this.selected);
    }
    static getEventType(type) {
      if (type === 'text') {
        return 'input';
      }
      return 'change';
    }
    static getCondition(element) {
      if (element.type === 'text' || element.type === 'select-one') {
        return element.value !== '';
      }
      return element.checked;
    }
    static singleCount(element, index, id) {
      const isSingleCount = element.closest('.js-filters--single-count');
      if (!isSingleCount) {
        return {
          uniqueID: `${id}-${index}`,
          singleID: `${id}-${index}`,
          isSingleCount
        };
      }
      return {
        uniqueID: `${id}`,
        singleID: `${id}-${index}`,
        isSingleCount
      };
    }
    updateCount(options) {
      const id = uniqueId();
      const GroupArray = [];
      if (options.array.length > 0) {
        options.array.forEach((element, index) => {
          const getEventType = this.constructor.getEventType(element.type);
          const {
            uniqueID,
            singleID,
            isSingleCount
          } = this.constructor.singleCount(element, index, id);
          if (this.constructor.getCondition(element)) {
            this.selected.push(uniqueID);
            if (isSingleCount) {
              GroupArray.push(singleID);
            }
            this.updateDom();
          }
          element.addEventListener(getEventType, () => {
            const selectedIndex = this.selected.indexOf(uniqueID);
            const singleSelectedIndex = GroupArray.indexOf(singleID);
            if (this.constructor.getCondition(element)) {
              if (!this.selected.includes(uniqueID)) {
                this.selected.push(uniqueID);
              }
              if (isSingleCount && !GroupArray.includes(singleID)) {
                GroupArray.push(singleID);
              }
              this.updateDom();
            } else {
              if (isSingleCount && singleSelectedIndex !== -1) {
                GroupArray.splice(singleSelectedIndex, 1);
              }
              if (!isSingleCount && selectedIndex !== -1) {
                this.selected.splice(selectedIndex, 1);
              } else if (GroupArray.length <= 0) {
                this.selected.splice(selectedIndex, 1);
              }
              this.updateDom();
            }
          });
        });
      }
    }
    updateStatus(options) {
      const id = uniqueId();
      const text = options.title;
      const GroupArray = [];
      if (options.array.length > 0) {
        const labelText = text ? text.textContent : null;
        options.array.forEach((element, index) => {
          const getEventType = this.constructor.getEventType(element.type);
          const {
            singleID
          } = this.constructor.singleCount(element, index, id);
          if (this.constructor.getCondition(element)) {
            if (text) {
              text.textContent = labelText;
              text.innerHTML = `${text.textContent} ${this.checkIcon}`;
            }
          }
          element.addEventListener(getEventType, () => {
            if (this.constructor.getCondition(element)) {
              if (!GroupArray.includes(singleID)) {
                GroupArray.push(singleID);
              }
            } else if (GroupArray.indexOf(singleID) !== -1) {
              GroupArray.splice(GroupArray.indexOf(singleID), 1);
            }
            if (text) {
              if (GroupArray.length > 0) {
                text.textContent = labelText;
                text.innerHTML = `${text.textContent} ${this.checkIcon}`;
              } else {
                text.textContent = labelText;
              }
            }
          });
        });
      }
    }
    selectedItems() {
      const stateCheck = setInterval(() => {
        if (document.readyState === 'complete') {
          clearInterval(stateCheck);
          this.filtersItems.forEach(filter => {
            const button = filter.querySelector('.nsw-filters__item-name');
            const content = filter.querySelector('.nsw-filters__item-content');
            const text = content ? content.querySelectorAll('input[type="text"]') : null;
            const selects = content ? content.querySelectorAll('select') : null;
            const checkboxes = content ? content.querySelectorAll('input[type="checkbox"]:not([id$="-all"])') : null;
            if (!content) return;
            this.updateCount({
              array: text,
              title: button
            });
            this.updateCount({
              array: selects,
              title: button
            });
            this.updateCount({
              array: checkboxes,
              title: button
            });
            this.updateStatus({
              array: text,
              title: button
            });
            this.updateStatus({
              array: selects,
              title: button
            });
            this.updateStatus({
              array: checkboxes,
              title: button
            });
          });
        }
      }, 100);
    }
    clearAllFilters(e) {
      e.preventDefault();
      this.filtersItems.forEach(filter => {
        const button = filter.querySelector('.nsw-filters__item-name');
        const buttonCheck = button ? button.querySelector('span.nsw-material-icons') : null;
        const content = filter.querySelector('.nsw-filters__item-content');
        const text = content.querySelectorAll('input[type="text"]');
        const selects = content.querySelectorAll('select');
        const checkboxes = content.querySelectorAll('input[type="checkbox"]:not([id$="-all"])');
        const allFields = [...text, ...selects, ...checkboxes];
        if (!content) return;
        if (allFields.length > 0) {
          allFields.forEach(input => {
            const field = input;
            if (this.constructor.getCondition(field) && (field.type === 'text' || field.type === 'select-one')) {
              field.value = '';
            } else {
              field.click();
              field.checked = false;
            }
          });
        }
        if (buttonCheck) {
          buttonCheck.remove();
        }
        this.selected = [];
        this.updateDom();
      });
    }
  }

  /* eslint-disable max-len */
  class FileUpload {
    constructor(element) {
      this.element = element;
      this.input = this.element.querySelector('.nsw-file-upload__input');
      this.label = this.element.querySelector('.nsw-file-upload__label');
      this.multipleUpload = this.input.hasAttribute('multiple');
      this.replaceFiles = this.element.hasAttribute('data-replace-files');
      this.filesList = false;
    }
    init() {
      if (!this.input) return;
      this.input.addEventListener('change', () => {
        if (this.input.value === '') return;
        this.updateFileList();
      });
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
      let string = '';
      for (let i = 0; i < this.input.files.length; i += 1) {
        const file = this.input.files[i];
        string = this.createFileItem(file) + string;
      }
      if (this.replaceFiles) {
        this.filesList.innerHTML = string;
      } else {
        this.filesList.insertAdjacentHTML('beforeend', string);
      }
      this.removeFile();
    }
    removeFile() {
      this.filesList.addEventListener('click', event => {
        if (!event.target.closest('.nsw-icon-button')) return;
        event.preventDefault();
        const item = event.target.closest('.nsw-file-upload__item');
        item.remove();
        if (event.currentTarget.children.length === 0) {
          this.filesList.classList.remove('active');
        }
      });
    }
    static truncateString(str, num) {
      if (str.length <= num) {
        return str;
      }
      return `${str.slice(0, num)}...`;
    }
  }

  class Tabs {
    constructor(element, showTab) {
      this.tablistClass = '.nsw-tabs__list';
      this.tablistItemClass = 'li';
      this.tablistLinkClass = 'a';
      this.tab = element;
      this.showTab = showTab;
      this.tabList = element.querySelector(this.tablistClass);
      this.tabItems = this.tabList.querySelectorAll(this.tablistItemClass);
      this.allowedKeys = [35, 36, 37, 39, 40];
      this.tabLinks = [];
      this.tabPanel = [];
      this.selectedTab = null;
      this.clickTabEvent = e => this.clickTab(e);
      this.arrowKeysEvent = e => this.arrowKeys(e);
    }
    init() {
      this.setUpDom();
      this.controls();
      this.setInitalTab();
    }
    setUpDom() {
      const tabListWrapper = document.createElement('div');
      tabListWrapper.classList.add('nsw-tabs__list-wrapper');
      this.tab.prepend(tabListWrapper);
      tabListWrapper.prepend(this.tabList);
      this.tabList.setAttribute('role', 'tablist');
      this.tabItems.forEach(item => {
        const itemElem = item;
        const itemLink = item.querySelector(this.tablistLinkClass);
        const panel = this.tab.querySelector(itemLink.hash);
        const uID = uniqueId('tab');
        itemElem.setAttribute('role', 'presentation');
        this.enhanceTabLink(itemLink, uID);
        this.enhanceTabPanel(panel, uID);
      });
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

  class GlobalAlert {
    constructor(element) {
      this.messageElement = element;
      this.closeButton = element.querySelector('.js-close-alert');
      this.closeMessageEvent = e => this.closeMessage(e);
    }
    init() {
      this.controls();
    }
    controls() {
      this.closeButton.addEventListener('click', this.closeMessageEvent, false);
    }
    closeMessage() {
      this.messageElement.hidden = true;
    }
  }

  /* eslint-disable max-len */
  class Select {
    constructor(element) {
      this.element = element;
      this.select = this.element.querySelector('select');
      this.options = this.select.querySelectorAll('option');
      this.optGroups = this.select.querySelectorAll('optgroup');
      this.selectId = this.select.getAttribute('id');
      this.trigger = false;
      this.dropdown = false;
      this.customOptions = false;
      this.optionIndex = 0;
      this.textSelected = this.element.getAttribute('data-selection-text') || 'selected';
    }
    init() {
      this.initCustomSelect();
      this.initCustomSelectEvents();
    }
    initCustomSelect() {
      this.element.insertAdjacentHTML('beforeend', this.initButtonSelect() + this.initListSelect());
      this.dropdown = this.element.querySelector('.nsw-multi-select__dropdown');
      this.trigger = this.element.querySelector('.nsw-multi-select__button');
      this.multiSelectList = this.dropdown.querySelector('.nsw-multi-select__list');
      this.customOptions = this.multiSelectList.querySelectorAll('.nsw-multi-select__option');
      this.multiSelectList.insertAdjacentHTML('afterbegin', this.initAllButton());
      this.allButton = this.multiSelectList.querySelector('.js-multi-select-all');
      this.allButtonInput = this.allButton.querySelector('.nsw-form__checkbox-input');
    }
    initCustomSelectEvents() {
      this.initSelection();
      this.trigger.addEventListener('click', event => {
        event.preventDefault();
        this.toggleCustomSelect(false);
      });
      this.trigger.addEventListener('keydown', event => {
        if (event.code && event.code === 38 || event.key && event.key.toLowerCase() === 'arrowup' || event.code && event.code === 40 || event.key && event.key.toLowerCase() === 'arrowdown') {
          event.preventDefault();
          this.toggleCustomSelect(false);
        }
      });
      this.dropdown.addEventListener('keydown', event => {
        if (event.code && event.code === 38 || event.key && event.key.toLowerCase() === 'arrowup') {
          this.keyboardCustomSelect('prev', event);
        } else if (event.code && event.code === 40 || event.key && event.key.toLowerCase() === 'arrowdown') {
          this.keyboardCustomSelect('next', event);
        }
      });
      window.addEventListener('keyup', event => {
        if (event.key && event.key.toLowerCase() === 'escape') {
          this.constructor.moveFocusToSelectTrigger(event.target);
          this.toggleCustomSelect('false');
        }
      });
      window.addEventListener('click', event => {
        this.checkCustomSelectClick(event.target);
      });
      window.addEventListener('resize', this.placeDropdown);
      this.allButton.addEventListener('change', () => {
        this.toggleAllOptions();
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
        const selectedOption = this.getSelectedOption();
        this.constructor.moveFocus(selectedOption);
        this.dropdown.addEventListener('transitionend', function cb() {
          this.constructor.moveFocus(selectedOption);
          this.dropdown.removeEventListener('transitionend', cb);
        });
        this.constructor.trapFocus(this.dropdown);
        this.placeDropdown();
      }
    }
    placeDropdown() {
      const {
        top,
        bottom
      } = this.trigger.getBoundingClientRect();
      const moveUp = window.innerHeight - bottom < top;
      const maxHeight = moveUp ? top - 20 : window.innerHeight - bottom - 20;
      const vhCalc = Math.ceil(100 * maxHeight / window.innerHeight);
      this.dropdown.setAttribute('style', `max-height: ${vhCalc}vh;`);
    }
    keyboardCustomSelect(direction, event) {
      event.preventDefault();
      const allOptions = [...this.customOptions, this.allButton];
      let index = Array.prototype.indexOf.call(allOptions, document.activeElement.closest('.nsw-multi-select__option'));
      index = direction === 'next' ? index + 1 : index - 1;
      if (index < 0) index = allOptions.length - 1;
      if (index >= allOptions.length) index = 0;
      this.constructor.moveFocus(allOptions[index].querySelector('.nsw-form__checkbox-input'));
    }
    initSelection() {
      if (!this.dropdown) return;
      this.customOptions.forEach(opt => {
        opt.addEventListener('change', event => {
          const option = event.currentTarget.closest('.nsw-multi-select__option');
          if (!option) return;
          this.selectOption(option);
        });
        opt.addEventListener('click', event => {
          const option = event.currentTarget.closest('.nsw-multi-select__option');
          if (!option || !event.target.classList.contains('nsw-multi-select__option')) return;
          this.selectOption(option);
        });
      });
    }
    getSelectedOptionCount() {
      let selectedOptCounter = 0;
      for (let i = 0; i < this.options.length; i += 1) {
        if (this.options[i].selected) {
          selectedOptCounter += 1;
        }
      }
      return selectedOptCounter;
    }
    toggleAllOptions() {
      const count = this.getSelectedOptionCount();
      this.customOptions.forEach(check => {
        const input = check.querySelector('.nsw-form__checkbox-input');
        if (count === this.options.length) {
          input.click();
          input.checked = false;
          input.removeAttribute('checked');
          check.setAttribute('aria-selected', 'false');
          this.updateNativeSelect(check.getAttribute('data-index'), false);
        } else {
          input.click();
          input.checked = true;
          input.setAttribute('checked', '');
          check.setAttribute('aria-selected', 'true');
          this.updateNativeSelect(check.getAttribute('data-index'), true);
        }
        //
      });

      const [label, ariaLabel] = this.getSelectedOptionText();
      this.trigger.querySelector('.nsw-multi-select__label').innerHTML = label;
      this.constructor.toggleClass(this.trigger, 'active', count > 0);
      this.updateTriggerAria(ariaLabel);
    }
    selectOption(option) {
      const input = option.querySelector('.nsw-form__checkbox-input');
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
      const [label, ariaLabel] = this.getSelectedOptionText();
      const count = this.getSelectedOptionCount();
      if (count === this.options.length) {
        this.allButtonInput.checked = true;
        this.allButtonInput.setAttribute('checked', '');
        this.allButton.setAttribute('aria-selected', 'true');
      } else {
        this.allButtonInput.checked = false;
        this.allButtonInput.removeAttribute('checked');
        this.allButton.setAttribute('aria-selected', 'false');
      }
      this.trigger.querySelector('.nsw-multi-select__label').innerHTML = label;
      this.constructor.toggleClass(this.trigger, 'active', count > 0);
      this.updateTriggerAria(ariaLabel);
    }
    initButtonSelect() {
      const triggerLabel = this.getSelectedOptionText(this.element);
      const button = `<button class="nsw-button nsw-multi-select__button" aria-label="${triggerLabel[1]}" aria-expanded="false" aria-controls="${this.selectId}-dropdown">
      <span aria-hidden="true" class="nsw-multi-select__label">${triggerLabel[0]}</span>
      <span class="material-icons nsw-material-icons" focusable="false" aria-hidden="true">keyboard_arrow_down</span>
      </button>`;
      return button;
    }
    initAllButton() {
      const all = this.getSelectedOptionCount() === this.options.length;
      const selected = all ? ' aria-selected="true"' : ' aria-selected="false"';
      const checked = all ? 'checked' : '';
      const allButton = `
      <li class="js-multi-select-all nsw-multi-select__option" role="option" data-value="Select all" aria-selected="false" ${selected} data-label="Select all">
        <input aria-hidden="true" class="nsw-form__checkbox-input" type="checkbox" id="${this.selectId}-all" ${checked}>
        <label class="nsw-form__checkbox-label" aria-hidden="true" for="${this.selectId}-all">
          <span>Select all</span>
        </label>
      </li>`;
      return allButton;
    }
    getSelectedOptionText() {
      const noSelectionText = '<span class="multi-select__term">Please select</span>';
      let label = '';
      let ariaLabel = '';
      const count = this.getSelectedOptionCount();
      if (count === this.options.length) {
        label = `All ${this.textSelected}`;
        ariaLabel = `All ${this.textSelected}`;
      } else if (count > 1) {
        label = `${count} ${this.textSelected}`;
        ariaLabel = `${count} ${this.textSelected}, Please select`;
      } else if (count > 0) {
        ariaLabel += `${this.options[0].text}, Please select`;
        label = this.options[0].text;
      } else {
        label = noSelectionText;
        ariaLabel = 'Please select';
      }
      return [label, ariaLabel];
    }
    initListSelect() {
      let list = `<div class="nsw-multi-select__dropdown" aria-describedby=${this.selectId}-description" id="${this.selectId}-dropdown">`;
      if (this.optGroups.length > 0) {
        this.optGroups.forEach(optionGroup => {
          const optGroupList = optionGroup.querySelectorAll('option');
          const optGroupLabel = `<li><span>${optionGroup.getAttribute('label')}</span></li>`;
          list += `<ul class="nsw-multi-select__list" role="listbox" aria-multiselectable="true">
          ${optGroupLabel + this.getOptionsList(optGroupList)}
        </ul>`;
        });
      } else {
        list += `<ul class="nsw-multi-select__list" role="listbox" aria-multiselectable="true">${this.getOptionsList(this.options)}</ul>`;
      }
      return list;
    }
    getOptionsList(options) {
      let list = '';
      options.forEach(option => {
        const selected = option.hasAttribute('selected') ? ' aria-selected="true"' : ' aria-selected="false"';
        const checked = option.hasAttribute('selected') ? 'checked' : '';
        const uniqueName = this.constructor.createSafeCssClassname(`${this.selectId}-${option.value}-${this.optionIndex.toString()}`);
        list += `
      <li class="nsw-multi-select__option" role="option" data-value="${option.value}" ${selected} data-label="${option.text}" data-index="${this.optionIndex}">
        <input aria-hidden="true" class="nsw-form__checkbox-input" type="checkbox" id="${uniqueName}" ${checked}>
        <label class="nsw-form__checkbox-label" aria-hidden="true" for="${uniqueName}">
          <span>${option.text}</span>
        </label>
      </li>`;
        this.optionIndex += 1;
      });
      return list;
    }
    getSelectedOption() {
      const option = this.dropdown.querySelector('[aria-selected="true"]');
      if (option) {
        return option.querySelector('.nsw-form__checkbox-input');
      }
      return this.dropdown.querySelector('.nsw-multi-select__option').querySelector('.nsw-form__checkbox-input');
    }
    checkCustomSelectClick(target) {
      if (!this.element.contains(target)) this.toggleCustomSelect('false');
    }
    updateNativeSelect(index, bool) {
      this.options[index].selected = bool;
      this.select.dispatchEvent(new CustomEvent('update', {
        bubbles: true
      }));
    }
    updateTriggerAria(ariaLabel) {
      this.trigger.setAttribute('aria-label', ariaLabel);
    }
    static createSafeCssClassname(str) {
      const invalidBeginningOfClassname = /^([0-9]|--|-[0-9])/;
      if (typeof str !== 'string') {
        return '';
      }
      const strippedClassname = str.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g).map(x => x.toLowerCase()).join('-');
      return invalidBeginningOfClassname.test(strippedClassname) ? `_${strippedClassname}` : strippedClassname;
    }
    static moveFocusToSelectTrigger(target) {
      const multiSelect = target.closest('.js-multi-select');
      if (!multiSelect) return;
      multiSelect.querySelector('.nsw-multi-select__button').focus();
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
    static moveFocus(element) {
      if (document.activeElement !== element) {
        element.focus();
      }
    }
    static toggleClass(el, className, bool) {
      if (bool) el.classList.add(className);else el.classList.remove(className);
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

  /* eslint-disable no-shadow */
  /* eslint-disable no-continue */
  /* eslint-disable consistent-return */
  /* eslint-disable no-script-url */
  /* eslint-disable no-restricted-syntax */
  /*!
   * Sanitize an HTML string
   * (c) 2021 Chris Ferdinandi, MIT License, https://gomakethings.com
   * @param  {String}          str   The HTML string to sanitize
   * @param  {Boolean}         nodes If true, returns HTML nodes instead of a string
   * @return {String|NodeList}       The sanitized string or nodes
   */
  function cleanHTML(str, nodes) {
    /**
    * Convert the string to an HTML document
    * @return {Node} An HTML document
    */
    function stringToHTML() {
      const parser = new DOMParser();
      const doc = parser.parseFromString(str, 'text/html');
      return doc.body || document.createElement('body');
    }

    /**
    * Remove <script> elements
    * @param  {Node} html The HTML
    */
    function removeScripts(html) {
      const scripts = html.querySelectorAll('script');
      for (const script of scripts) {
        script.remove();
      }
    }

    /**
    * Check if the attribute is potentially dangerous
    * @param  {String}  name  The attribute name
    * @param  {String}  value The attribute value
    * @return {Boolean}       If true, the attribute is potentially dangerous
    */
    function isPossiblyDangerous(name, value) {
      const val = value.replace(/\s+/g, '').toLowerCase();
      if (['src', 'href', 'xlink:href'].includes(name)) {
        if (val.includes('javascript:') || val.includes('data:text/html')) return true;
      }
      if (name.startsWith('on')) return true;
    }

    /**
    * Remove potentially dangerous attributes from an element
    * @param  {Node} elem The element
    */
    function removeAttributes(elem) {
      // Loop through each attribute
      // If it's dangerous, remove it
      const atts = elem.attributes;
      for (const {
        name,
        value
      } of atts) {
        if (!isPossiblyDangerous(name, value)) continue;
        elem.removeAttribute(name);
      }
    }

    /**
    * Remove dangerous stuff from the HTML document's nodes
    * @param  {Node} html The HTML document
    */
    function clean(html) {
      const nodes = html.children;
      for (const node of nodes) {
        removeAttributes(node);
        clean(node);
      }
    }

    // Convert the string to HTML
    const html = stringToHTML();

    // Sanitize it
    removeScripts(html);
    clean(html);

    // If the user wants HTML nodes back, return them
    // Otherwise, pass a sanitized string back
    return nodes ? html.childNodes : html.innerHTML;
  }

  /* eslint-disable max-len, import/no-extraneous-dependencies */
  class Toggletip {
    constructor(element) {
      this.toggletip = element;
      this.toggletipId = this.toggletip.getAttribute('aria-controls');
      this.toggletipElement = document.querySelector(`#${this.toggletipId}`);
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

  class ExternalLink {
    constructor(element) {
      this.link = element;
      this.uID = uniqueId('external');
      this.linkIcon = this.link.querySelector('.nsw-material-icons');
      this.linkIconTitle = this.linkIcon.getAttribute('title');
      this.linkElement = false;
    }
    init() {
      this.link.classList.add('nsw-link', 'nsw-link--icon');
      this.constructor.setAttributes(this.link, {
        target: '_blank',
        rel: 'noopener'
      });
      this.constructor.setAttributes(this.linkIcon, {
        focusable: 'false',
        'aria-hidden': 'true'
      });
      this.createElement(this.linkIconTitle);
    }
    createElement(title) {
      if (title) {
        this.linkElement = document.createElement('span');
        this.linkElement.id = this.uID;
        this.linkElement.classList.add('sr-only');
        this.linkElement.innerText = title;
        this.link.insertAdjacentElement('afterend', this.linkElement);
        this.constructor.setAttributes(this.link, {
          'aria-describedby': this.uID
        });
      }
    }
    static setAttributes(el, attrs) {
      Object.keys(attrs).forEach(key => el.setAttribute(key, attrs[key]));
    }
  }

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
    // Header Search
    const openSearchButton = document.querySelectorAll('.js-open-search');
    const closeSearchButton = document.querySelectorAll('.js-close-search');
    const accordions = document.querySelectorAll('.js-accordion');
    const dialogs = document.querySelectorAll('.js-dialog');
    const fileUpload = document.querySelectorAll('.js-file-upload');
    const filters = document.querySelectorAll('.js-filters');
    const tabs = document.querySelectorAll('.js-tabs');
    const globalAlert = document.querySelectorAll('.js-global-alert');
    const multiSelect = document.querySelectorAll('.js-multi-select');
    const tooltip = document.querySelectorAll('.js-tooltip');
    const toggletip = document.querySelectorAll('.js-toggletip');
    const link = document.querySelectorAll('.js-link');
    openSearchButton.forEach(element => {
      new SiteSearch(element).init();
    });
    closeSearchButton.forEach(element => {
      new SiteSearch(element).init();
    });

    // Navigation
    new Navigation().init();
    accordions.forEach(element => {
      new Accordion(element).init();
    });
    dialogs.forEach(element => {
      new Dialog(element).init();
    });
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
    if (tabs) {
      tabs.forEach(element => {
        new Tabs(element).init();
      });
    }
    if (globalAlert) {
      globalAlert.forEach(element => {
        new GlobalAlert(element).init();
      });
    }
    if (multiSelect) {
      multiSelect.forEach(element => {
        new Select(element).init();
      });
    }
    if (tooltip) {
      tooltip.forEach(element => {
        new Tooltip(element).init();
      });
    }
    if (toggletip) {
      toggletip.forEach(element => {
        new Toggletip(element).init();
      });
    }
    if (link) {
      link.forEach(element => {
        new ExternalLink(element).init();
      });
    }
  }

  exports.Accordion = Accordion;
  exports.Dialog = Dialog;
  exports.ExternalLink = ExternalLink;
  exports.FileUpload = FileUpload;
  exports.Filters = Filters;
  exports.GlobalAlert = GlobalAlert;
  exports.Navigation = Navigation;
  exports.Select = Select;
  exports.SiteSearch = SiteSearch;
  exports.Tabs = Tabs;
  exports.Toggletip = Toggletip;
  exports.Tooltip = Tooltip;
  exports.initSite = initSite;

}));
