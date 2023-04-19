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
  const uniqueId = prefix => {
    const prefixValue = prefix === undefined ? 'nsw' : prefix;
    return `${prefixValue}-${Math.random().toString(36).substr(2, 16)}`;
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
      this.openSubNavElements = [];
      this.breakpoint = window.matchMedia('(min-width: 62em)');
      this.body = document.body;
    }
    init() {
      if (this.mainNavElement) {
        this.setUpMobileControls();
        this.responsiveCheck(this.breakpoint);
        this.breakpoint.addListener(e => this.responsiveCheck(e));
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
      this.filtersItems.forEach(filter => {
        const button = filter.querySelector('.nsw-filters__item-name');
        const content = filter.querySelector('.nsw-filters__item-content');
        const text = content ? content.querySelectorAll('input[type="text"]') : null;
        const selects = content ? content.querySelectorAll('select') : null;
        const checkboxes = content ? content.querySelectorAll('input[type="checkbox"]') : null;
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
    clearAllFilters(e) {
      e.preventDefault();
      this.filtersItems.forEach(filter => {
        const button = filter.querySelector('.nsw-filters__item-name');
        const buttonCheck = button ? button.querySelector('span.nsw-material-icons') : null;
        const content = filter.querySelector('.nsw-filters__item-content');
        const text = content.querySelectorAll('input[type="text"]');
        const selects = content.querySelectorAll('select');
        const checkboxes = content.querySelectorAll('input[type="checkbox"]');
        const allFields = [...text, ...selects, ...checkboxes];
        if (!content) return;
        if (allFields.length > 0) {
          allFields.forEach(input => {
            const field = input;
            if (this.constructor.getCondition(field) && (field.type === 'text' || field.type === 'select-one')) {
              field.value = '';
            } else {
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
          input.checked = false;
          input.removeAttribute('checked');
          check.setAttribute('aria-selected', 'false');
          this.updateNativeSelect(check.getAttribute('data-index'), false);
        } else {
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
  }

  exports.Accordion = Accordion;
  exports.Dialog = Dialog;
  exports.FileUpload = FileUpload;
  exports.Filters = Filters;
  exports.GlobalAlert = GlobalAlert;
  exports.Navigation = Navigation;
  exports.Select = Select;
  exports.SiteSearch = SiteSearch;
  exports.Tabs = Tabs;
  exports.initSite = initSite;

}));
