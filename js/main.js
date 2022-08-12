(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define('NSW', ['exports'], factory) :
  (global = global || self, factory(global.NSW = {}));
}(this, (function (exports) { 'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArrayLimit(arr, i) {
    if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(n);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  var SiteSearch = /*#__PURE__*/function () {
    function SiteSearch(element) {
      _classCallCheck(this, SiteSearch);

      this.triggerButton = element;
      this.originalButton = document.querySelector('.js-open-search');
      this.targetElement = document.getElementById(this.triggerButton.getAttribute('aria-controls'));
      this.searchInput = this.targetElement.querySelector('.js-search-input');
      this.pressed = this.triggerButton.getAttribute('aria-expanded') === 'true';
    }

    _createClass(SiteSearch, [{
      key: "init",
      value: function init() {
        this.controls();
      }
    }, {
      key: "controls",
      value: function controls() {
        this.triggerButton.addEventListener('click', this.showHide.bind(this), false);
      }
    }, {
      key: "showHide",
      value: function showHide() {
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
    }]);

    return SiteSearch;
  }();

  var focusObjectGenerator = function focusObjectGenerator(arr) {
    var focusableElements = {
      all: arr,
      first: arr[0],
      last: arr[arr.length - 1],
      length: arr.length
    };
    return focusableElements;
  };
  var getFocusableElementBySelector = function getFocusableElementBySelector(id, selectorArr) {
    var _ref;

    var elements = [];

    for (var i = 0; i < selectorArr.length; i += 1) {
      elements.push([].slice.call(document.querySelectorAll("#".concat(id, " ").concat(selectorArr[i]))));
    }

    var mergedElementArr = (_ref = []).concat.apply(_ref, elements);

    return focusObjectGenerator(mergedElementArr);
  };
  var trapTabKey = function trapTabKey(event, focusObject) {
    var _document = document,
        activeElement = _document.activeElement;
    var focusableElement = focusObject;
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
  var whichTransitionEvent = function whichTransitionEvent() {
    var el = document.createElement('fakeelement');
    var transitions = {
      transition: 'transitionend',
      OTransition: 'oTransitionEnd',
      MozTransition: 'transitionend',
      WebkitTransition: 'webkitTransitionEnd'
    };
    var found = Object.keys(transitions).filter(function (key) {
      return el.style[key] !== undefined;
    });
    return transitions[found[0]];
  };
  var uniqueId = function uniqueId(prefix) {
    var prefixValue = prefix === undefined ? 'nsw' : prefix;
    return "".concat(prefixValue, "-").concat(Math.random().toString(36).substr(2, 16));
  };

  var Navigation = /*#__PURE__*/function () {
    function Navigation() {
      var _this = this;

      _classCallCheck(this, Navigation);

      this.openNavButton = document.querySelector('.js-open-nav');
      this.closeNavButtons = document.querySelectorAll('.js-close-nav');
      this.openSubNavButtons = document.querySelectorAll('.js-open-sub-nav');
      this.closeSubNavButtons = document.querySelectorAll('.js-close-sub-nav');
      this.mainNavElement = document.getElementById('main-nav');
      this.isMegaMenuElement = !!document.querySelector('.js-mega-menu');
      this.transitionEvent = whichTransitionEvent();

      this.mobileToggleMainNavEvent = function (e) {
        return _this.mobileToggleMainNav(e);
      };

      this.mobileToggleSubNavEvent = function () {
        return _this.closeSubNav();
      };

      this.mobileShowMainTransitionEndEvent = function (e) {
        return _this.mobileShowMainNav(e);
      };

      this.mobileHideMainTransitionEndEvent = function (e) {
        return _this.mobileHideMainNav(e);
      };

      this.showSubNavTransitionEndEvent = function (e) {
        return _this.showSubNav(e);
      };

      this.mobileTrapTabKeyEvent = function (e) {
        return _this.mobileMainNavTrapTabs(e);
      };

      this.mobileSubNavTrapTabKeyEvent = function (e) {
        return _this.trapkeyEventStuff(e);
      };

      this.desktopButtonClickEvent = function (e) {
        return _this.buttonClickDesktop(e);
      };

      this.desktopButtonKeydownEvent = function (e) {
        return _this.buttonKeydownDesktop(e);
      };

      this.checkFocusEvent = function (e) {
        return _this.checkIfContainsFocus(e);
      };

      this.escapeCloseEvent = function (e) {
        return _this.escapeClose(e);
      };

      this.openSubNavElements = [];
      this.breakpoint = window.matchMedia('(min-width: 62em)');
      this.body = document.body;
    }

    _createClass(Navigation, [{
      key: "init",
      value: function init() {
        var _this2 = this;

        if (this.mainNavElement) {
          this.setUpMobileControls();
          this.responsiveCheck(this.breakpoint);
          this.breakpoint.addListener(function (e) {
            return _this2.responsiveCheck(e);
          });
        }
      }
    }, {
      key: "responsiveCheck",
      value: function responsiveCheck(e) {
        var megaMenuListItems = [];

        if (e.matches) {
          megaMenuListItems = [].slice.call(this.mainNavElement.querySelectorAll('ul > li'));
          this.body.classList.remove('main-nav-active');
        } else {
          megaMenuListItems = [].slice.call(this.mainNavElement.querySelectorAll('li'));
        }

        this.tearDownNavControls();
        this.setUpNavControls(megaMenuListItems);
      }
    }, {
      key: "tearDownNavControls",
      value: function tearDownNavControls() {
        var _this3 = this;

        if (this.isMegaMenuElement) {
          var listItems = [].slice.call(this.mainNavElement.querySelectorAll('li'));
          listItems.forEach(function (item) {
            var submenu = item.querySelector('[id^=sub-nav-]');
            var link = item.querySelector('a');

            if (submenu) {
              link.removeAttribute('role');
              link.removeAttribute('aria-expanded');
              link.removeAttribute('aria-controls');
              link.removeEventListener('click', _this3.desktopButtonClickEvent, false);
              link.removeEventListener('keydown', _this3.desktopButtonKeydownEvent, false);
            }
          });
        }
      }
    }, {
      key: "setUpMobileControls",
      value: function setUpMobileControls() {
        var _this4 = this;

        this.openNavButton.addEventListener('click', this.mobileToggleMainNavEvent, false);
        this.closeNavButtons.forEach(function (element) {
          element.addEventListener('click', _this4.mobileToggleMainNavEvent, false);
        });
        this.closeSubNavButtons.forEach(function (element) {
          element.addEventListener('click', _this4.mobileToggleSubNavEvent, false);
        });
      }
    }, {
      key: "mobileMainNavTrapTabs",
      value: function mobileMainNavTrapTabs(e) {
        var elemObj = getFocusableElementBySelector(this.mainNavElement.id, ['> div button', '> ul > li > a']);
        trapTabKey(e, elemObj);
      }
    }, {
      key: "setUpNavControls",
      value: function setUpNavControls(listItems) {
        var _this5 = this;

        if (this.isMegaMenuElement) {
          listItems.forEach(function (item) {
            var submenu = item.querySelector('[id^=sub-nav-]');
            var link = item.querySelector('a');

            if (submenu) {
              link.setAttribute('role', 'button');
              link.setAttribute('aria-expanded', 'false');
              link.setAttribute('aria-controls', submenu.id);
              link.addEventListener('click', _this5.desktopButtonClickEvent, false);
              link.addEventListener('keydown', _this5.desktopButtonKeydownEvent, false);
              document.addEventListener('keydown', _this5.escapeCloseEvent, false);
            }
          });
        }
      }
    }, {
      key: "mobileShowMainNav",
      value: function mobileShowMainNav(_ref) {
        var propertyName = _ref.propertyName;
        if (!propertyName === 'transform') return;
        getFocusableElementBySelector(this.mainNavElement.id, ['> div button', '> ul > li > a']).all[1].focus();
        this.mainNavElement.classList.add('active');
        this.mainNavElement.classList.remove('activating');
        this.mainNavElement.removeEventListener(this.transitionEvent, this.mobileShowMainTransitionEndEvent, false);
        this.mainNavElement.addEventListener('keydown', this.mobileTrapTabKeyEvent, false);
      }
    }, {
      key: "mobileHideMainNav",
      value: function mobileHideMainNav(_ref2) {
        var propertyName = _ref2.propertyName;
        if (!propertyName === 'transform') return;
        this.mainNavElement.classList.remove('active');
        this.mainNavElement.classList.remove('closing');

        while (this.openSubNavElements.length > 0) {
          var _this$whichSubNavLate = this.whichSubNavLatest(),
              submenu = _this$whichSubNavLate.submenu;

          submenu.removeEventListener('keydown', this.mobileSubNavTrapTabKeyEvent, false);
          submenu.classList.remove('active');
          submenu.classList.remove('closing');
          this.openSubNavElements.pop();
        }

        this.mainNavElement.removeEventListener(this.transitionEvent, this.mobileHideMainTransitionEndEvent, false);
        this.mainNavElement.removeEventListener('keydown', this.mobileTrapTabKeyEvent, false);
      }
    }, {
      key: "mobileToggleMainNav",
      value: function mobileToggleMainNav(e) {
        var currentTarget = e.currentTarget;
        var isExpanded = currentTarget.getAttribute('aria-expanded') === 'true';

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
    }, {
      key: "buttonClickDesktop",
      value: function buttonClickDesktop(e) {
        var isDesktop = this.breakpoint.matches;

        if (!isDesktop || !e.target.closest('.nsw-main-nav__sub-nav')) {
          this.saveElements(e);
          this.toggleSubNavDesktop();
          e.preventDefault();
        }
      }
    }, {
      key: "buttonKeydownDesktop",
      value: function buttonKeydownDesktop(e) {
        if (e.key === ' ' || e.key === 'Enter' || e.key === 'Spacebar') {
          this.saveElements(e);
          this.toggleSubNavDesktop();
          e.preventDefault();
        }
      }
    }, {
      key: "escapeClose",
      value: function escapeClose(e) {
        if (e.key === 'Escape') {
          var _this$whichSubNavLate2 = this.whichSubNavLatest(),
              link = _this$whichSubNavLate2.link;

          var isExpanded = link.getAttribute('aria-expanded') === 'true';

          if (isExpanded) {
            this.toggleSubNavDesktop(true);
            e.preventDefault();
            link.focus();
          }
        }
      }
    }, {
      key: "saveElements",
      value: function saveElements(e) {
        var currentTarget = e.currentTarget;
        var temp = {
          submenu: document.getElementById(currentTarget.getAttribute('aria-controls')),
          link: currentTarget,
          linkParent: currentTarget.parentNode
        };
        this.openSubNavElements.push(temp);
      }
    }, {
      key: "showSubNav",
      value: function showSubNav(_ref3) {
        var propertyName = _ref3.propertyName;

        var _this$whichSubNavLate3 = this.whichSubNavLatest(),
            submenu = _this$whichSubNavLate3.submenu;

        if (!propertyName === 'transform') return;
        getFocusableElementBySelector(submenu.id, ['> div button', '> .nsw-main-nav__title a', '> ul > li > a']).all[2].focus();
        submenu.removeEventListener(this.transitionEvent, this.showSubNavTransitionEndEvent, false);
      }
    }, {
      key: "closeSubNav",
      value: function closeSubNav() {
        var _this$whichSubNavLate4 = this.whichSubNavLatest(),
            submenu = _this$whichSubNavLate4.submenu,
            link = _this$whichSubNavLate4.link;

        if (this.breakpoint.matches) {
          link.setAttribute('aria-expanded', false);
          link.classList.remove('active');
          this.mainNavElement.removeEventListener('focus', this.checkFocusEvent, true); // fix: workaround for safari because it doesn't support focus event

          this.mainNavElement.removeEventListener('click', this.checkFocusEvent, true);
        } else {
          link.focus();
          submenu.removeEventListener('keydown', this.mobileSubNavTrapTabKeyEvent, false);
        }

        submenu.classList.remove('active');
        submenu.closest('ul').parentElement.classList.remove('no-scroll');
        this.openSubNavElements.pop();
      }
    }, {
      key: "openSubNav",
      value: function openSubNav() {
        var _this$whichSubNavLate5 = this.whichSubNavLatest(),
            submenu = _this$whichSubNavLate5.submenu,
            link = _this$whichSubNavLate5.link;

        if (this.breakpoint.matches) {
          link.setAttribute('aria-expanded', true);
          link.classList.add('active');
          this.mainNavElement.addEventListener('focus', this.checkFocusEvent, true); // fix: workaround for safari because it doesn't support focus event

          this.mainNavElement.addEventListener('click', this.checkFocusEvent, true);
        } else {
          submenu.addEventListener('keydown', this.mobileSubNavTrapTabKeyEvent, false);
          submenu.addEventListener(this.transitionEvent, this.showSubNavTransitionEndEvent, false);
        }

        submenu.closest('ul').parentElement.scrollTop = 0;
        submenu.closest('ul').parentElement.classList.add('no-scroll');
        submenu.classList.add('active');
      }
    }, {
      key: "toggleSubNavDesktop",
      value: function toggleSubNavDesktop() {
        var _this$whichSubNavLate6 = this.whichSubNavLatest(),
            link = _this$whichSubNavLate6.link;

        var isExpanded = link.getAttribute('aria-expanded') === 'true';

        if (isExpanded) {
          this.closeSubNav();
        } else {
          this.openSubNav();
        }
      }
    }, {
      key: "checkIfContainsFocus",
      value: function checkIfContainsFocus(e) {
        var _this$whichSubNavLate7 = this.whichSubNavLatest(),
            linkParent = _this$whichSubNavLate7.linkParent;

        var focusWithin = linkParent.contains(e.target);
        var isButton = e.target.getAttribute('role');

        if (!focusWithin && isButton) {
          this.toggleSubNavDesktop();
        }
      }
    }, {
      key: "whichSubNavLatest",
      value: function whichSubNavLatest() {
        var lastSubNav = this.openSubNavElements.length - 1;
        return this.openSubNavElements[lastSubNav];
      }
    }, {
      key: "trapkeyEventStuff",
      value: function trapkeyEventStuff(e) {
        var _this$whichSubNavLate8 = this.whichSubNavLatest(),
            submenu = _this$whichSubNavLate8.submenu;

        var elemObj = getFocusableElementBySelector(submenu.id, ['> div button', '> ul > li > a']);
        trapTabKey(e, elemObj);
      }
    }]);

    return Navigation;
  }();

  function createButtons(_ref) {
    var textContent = _ref.textContent;
    var fragment = document.createDocumentFragment();
    var button = document.createElement('button');
    var uID = uniqueId('accordion');
    button.textContent = textContent;
    button.setAttribute('type', 'button');
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', uID);
    button.classList.add('nsw-accordion__button');
    button.insertAdjacentHTML('beforeend', "\n  <span class=\"material-icons nsw-material-icons\" focusable=\"false\" aria-hidden=\"true\">keyboard_arrow_down</span>\n  ");
    fragment.appendChild(button);
    return fragment;
  }

  var Accordion = /*#__PURE__*/function () {
    function Accordion(element) {
      var _this = this;

      _classCallCheck(this, Accordion);

      var _Array$from = Array.from(element.querySelectorAll('.nsw-accordion__toggle button')),
          _Array$from2 = _slicedToArray(_Array$from, 2),
          expandAll = _Array$from2[0],
          collapseAll = _Array$from2[1];

      this.accordionHeadingClass = '.nsw-accordion__title';
      this.accordion = element;
      this.headings = element.querySelectorAll(this.accordionHeadingClass);
      this.expandAllBtn = expandAll;
      this.collapseAllBtn = collapseAll;
      this.buttons = [];
      this.content = [];

      this.toggleEvent = function (e) {
        return _this.toggle(e);
      };

      this.expandAllEvent = function (e) {
        return _this.expandAll(e);
      };

      this.collapseAllEvent = function (e) {
        return _this.collapseAll(e);
      };
    }

    _createClass(Accordion, [{
      key: "init",
      value: function init() {
        this.setUpDom();
        this.controls();
      }
    }, {
      key: "setUpDom",
      value: function setUpDom() {
        var _this2 = this;

        this.accordion.classList.add('ready');

        if (this.collapseAllBtn) {
          this.collapseAllBtn.disabled = true;
        }

        this.headings.forEach(function (heading) {
          var headingElem = heading;
          var contentElem = heading.nextElementSibling;
          var buttonFrag = createButtons(heading);
          headingElem.textContent = '';
          headingElem.appendChild(buttonFrag);
          var buttonElem = headingElem.getElementsByTagName('button')[0];
          contentElem.id = buttonElem.getAttribute('aria-controls');
          contentElem.hidden = true;

          _this2.content.push(contentElem);

          _this2.buttons.push(buttonElem);
        });
      }
    }, {
      key: "controls",
      value: function controls() {
        var _this3 = this;

        this.buttons.forEach(function (element) {
          element.addEventListener('click', _this3.toggleEvent, false);
        });

        if (this.expandAllBtn && this.collapseAllBtn) {
          this.expandAllBtn.addEventListener('click', this.expandAllEvent, false);
          this.collapseAllBtn.addEventListener('click', this.collapseAllEvent, false);
        }
      }
    }, {
      key: "getTargetContent",
      value: function getTargetContent(element) {
        var currentIndex = this.buttons.indexOf(element);
        return this.content[currentIndex];
      }
    }, {
      key: "setAccordionState",
      value: function setAccordionState(element, state) {
        var targetContent = this.getTargetContent(element);

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
    }, {
      key: "toggle",
      value: function toggle(e) {
        var currentTarget = e.currentTarget;
        var targetContent = this.getTargetContent(currentTarget);
        var isHidden = targetContent.hidden;

        if (isHidden) {
          this.setAccordionState(currentTarget, 'open');
        } else {
          this.setAccordionState(currentTarget, 'close');
        }

        if (this.expandAllBtn && this.collapseAllBtn) {
          this.expandAllBtn.disabled = this.content.every(function (item) {
            return item.hidden === false;
          });
          this.collapseAllBtn.disabled = this.content.every(function (item) {
            return item.hidden === true;
          });
        }
      }
    }, {
      key: "expandAll",
      value: function expandAll() {
        var _this4 = this;

        this.buttons.forEach(function (element) {
          _this4.setAccordionState(element, 'open');
        });
        this.expandAllBtn.disabled = true;
        this.collapseAllBtn.disabled = false;
      }
    }, {
      key: "collapseAll",
      value: function collapseAll() {
        var _this5 = this;

        this.buttons.forEach(function (element) {
          _this5.setAccordionState(element, 'close');
        });
        this.expandAllBtn.disabled = false;
        this.collapseAllBtn.disabled = true;
      }
    }]);

    return Accordion;
  }();

  var Dialog = /*#__PURE__*/function () {
    function Dialog(element) {
      var _this = this;

      _classCallCheck(this, Dialog);

      this.dialog = element;
      this.dialogWrapper = element.querySelector('.nsw-dialog__wrapper');
      this.openBtn = document.querySelectorAll('.js-open-dialog-'.concat(element.getAttribute('id')));
      this.closeBtn = element.querySelectorAll('.js-close-dialog'); // eslint-disable-next-line max-len

      this.focusableEls = element.querySelectorAll('a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled])');
      this.body = document.body;

      this.openEvent = function (e) {
        return _this.openDialog(e);
      };

      this.closeEvent = function (e) {
        return _this.closeDialog(e);
      };

      this.clickEvent = function (e) {
        return _this.clickDialog(e);
      };

      this.trapEvent = function (e) {
        return _this.trapFocus(e);
      };
    }

    _createClass(Dialog, [{
      key: "init",
      value: function init() {
        this.controls();
      }
    }, {
      key: "controls",
      value: function controls() {
        var _this2 = this;

        this.openBtn.forEach(function (btn) {
          btn.addEventListener('click', _this2.openEvent, false);
        });
        this.closeBtn.forEach(function (btn) {
          btn.addEventListener('click', _this2.closeEvent, false);
        });

        if (this.dialog.classList.contains('js-dialog-dismiss')) {
          this.dialog.addEventListener('click', this.clickEvent, false);
        }

        this.focusableEls[this.focusableEls.length - 1].addEventListener('blur', this.trapEvent, false);
      }
    }, {
      key: "openDialog",
      value: function openDialog() {
        this.dialog.setAttribute('aria-expanded', 'true');
        this.dialog.classList.add('active');
        this.body.classList.add('dialog-active');
        this.focusableEls[0].focus();
      }
    }, {
      key: "closeDialog",
      value: function closeDialog() {
        this.dialog.setAttribute('aria-expanded', 'false');
        this.dialog.classList.remove('active');
        this.body.classList.remove('dialog-active');
      }
    }, {
      key: "clickDialog",
      value: function clickDialog(e) {
        if (!this.dialogWrapper.contains(e.target)) {
          this.closeDialog();
        }
      }
    }, {
      key: "trapFocus",
      value: function trapFocus(e) {
        e.preventDefault();
        this.focusableEls[0].focus();
      }
    }]);

    return Dialog;
  }();

  var Filters = /*#__PURE__*/function () {
    function Filters(element) {
      var _this = this;

      _classCallCheck(this, Filters);

      this.filters = element;
      this.openButton = element.querySelector('.nsw-filters__controls button');
      this.closeButtons = element.querySelectorAll('.nsw-filters__back button');
      this.all = element.querySelectorAll('.nsw-filters__all');
      this.allBlocks = Array.prototype.slice.call(this.all);
      this.showMoreButtons = Array.prototype.slice.call(element.querySelectorAll('.nsw-filters__more'));

      this.showEvent = function (e) {
        return _this.showFilters(e);
      };

      this.hideEvent = function (e) {
        return _this.hideFilters(e);
      };

      this.showMoreEvent = function (e) {
        return _this.showMore(e);
      };

      this.body = document.body;
    }

    _createClass(Filters, [{
      key: "init",
      value: function init() {
        this.controls();
      }
    }, {
      key: "controls",
      value: function controls() {
        var _this2 = this;

        this.openButton.addEventListener('click', this.showEvent, false);
        this.closeButtons.forEach(function (element) {
          element.addEventListener('click', _this2.hideEvent, false);
        });
        this.all.forEach(function (element) {
          var showMoreButton = element.nextElementSibling;
          showMoreButton.addEventListener('click', _this2.showMoreEvent, false);
        });
      }
    }, {
      key: "showFilters",
      value: function showFilters(e) {
        e.preventDefault();
        this.filters.classList.add('active');
        this.body.classList.add('filters-open');
      }
    }, {
      key: "hideFilters",
      value: function hideFilters(e) {
        e.preventDefault();
        this.filters.classList.remove('active');
        this.body.classList.remove('filters-open');
      }
    }, {
      key: "showMore",
      value: function showMore(e) {
        e.preventDefault();
        var currentShowMore = e.target;
        var currentIndex = this.showMoreButtons.indexOf(currentShowMore);
        var currentAll = this.allBlocks[currentIndex];
        currentAll.classList.remove('hidden');
        currentShowMore.classList.add('hidden');
      }
    }]);

    return Filters;
  }();

  var Tabs = /*#__PURE__*/function () {
    function Tabs(element, showTab) {
      var _this = this;

      _classCallCheck(this, Tabs);

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

      this.clickTabEvent = function (e) {
        return _this.clickTab(e);
      };

      this.arrowKeysEvent = function (e) {
        return _this.arrowKeys(e);
      };
    }

    _createClass(Tabs, [{
      key: "init",
      value: function init() {
        this.setUpDom();
        this.controls();
        this.setInitalTab();
      }
    }, {
      key: "setUpDom",
      value: function setUpDom() {
        var _this2 = this;

        var tabListWrapper = document.createElement('div');
        tabListWrapper.classList.add('nsw-tabs__list-wrapper');
        this.tab.prepend(tabListWrapper);
        tabListWrapper.prepend(this.tabList);
        this.tabList.setAttribute('role', 'tablist');
        this.tabItems.forEach(function (item) {
          var itemElem = item;
          var itemLink = item.querySelector(_this2.tablistLinkClass);

          var panel = _this2.tab.querySelector(itemLink.hash);

          var uID = uniqueId('tab');
          itemElem.setAttribute('role', 'presentation');

          _this2.enhanceTabLink(itemLink, uID);

          _this2.enhanceTabPanel(panel, uID);
        });
      }
    }, {
      key: "enhanceTabLink",
      value: function enhanceTabLink(link, id) {
        link.setAttribute('role', 'tab');
        link.setAttribute('id', id);
        link.setAttribute('aria-selected', false);
        link.setAttribute('tabindex', '-1');
        this.tabLinks.push(link);
      }
    }, {
      key: "enhanceTabPanel",
      value: function enhanceTabPanel(panel, id) {
        var panelElem = panel;
        panelElem.setAttribute('role', 'tabpanel');
        panelElem.setAttribute('role', 'tabpanel');
        panelElem.setAttribute('aria-labelledBy', id);
        panelElem.setAttribute('tabindex', '0');
        panelElem.hidden = true;
        this.tabPanel.push(panelElem);
      }
    }, {
      key: "setInitalTab",
      value: function setInitalTab() {
        var tabLinks = this.tabLinks,
            tabPanel = this.tabPanel,
            showTab = this.showTab;
        var index = showTab === undefined ? 0 : showTab;
        var selectedLink = tabLinks[index];
        selectedLink.classList.add('active');
        selectedLink.removeAttribute('tabindex');
        selectedLink.setAttribute('aria-selected', true);
        tabPanel[index].hidden = false;
        this.selectedTab = selectedLink;
      }
    }, {
      key: "clickTab",
      value: function clickTab(e) {
        e.preventDefault();
        this.switchTabs(e.currentTarget);
      }
    }, {
      key: "switchTabs",
      value: function switchTabs(elem) {
        var clickedTab = elem;

        if (clickedTab !== this.selectedTab) {
          clickedTab.focus();
          clickedTab.removeAttribute('tabindex');
          clickedTab.setAttribute('aria-selected', true);
          clickedTab.classList.add('active');
          this.selectedTab.setAttribute('aria-selected', false);
          this.selectedTab.setAttribute('tabindex', '-1');
          this.selectedTab.classList.remove('active');
          var clickedTabIndex = this.tabLinks.indexOf(clickedTab);
          var selectedTabIndex = this.tabLinks.indexOf(this.selectedTab);
          this.tabPanel[clickedTabIndex].hidden = false;
          this.tabPanel[selectedTabIndex].hidden = true;
          this.selectedTab = clickedTab;

          if (!clickedTab.classList.contains('js-tabs-fixed')) {
            this.selectedTab.scrollIntoView();
          }
        }
      }
    }, {
      key: "arrowKeys",
      value: function arrowKeys(_ref) {
        var which = _ref.which;
        var linkLength = this.tabLinks.length - 1;
        var index = this.tabLinks.indexOf(this.selectedTab);
        var down = false;

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
    }, {
      key: "controls",
      value: function controls() {
        var _this3 = this;

        this.tabLinks.forEach(function (link) {
          link.addEventListener('click', _this3.clickTabEvent, false);
          link.addEventListener('keydown', _this3.arrowKeysEvent, false);
        });
      }
    }]);

    return Tabs;
  }();

  var GlobalAlert = /*#__PURE__*/function () {
    function GlobalAlert(element) {
      var _this = this;

      _classCallCheck(this, GlobalAlert);

      this.messageElement = element;
      this.closeButton = element.querySelector('.js-close-alert');

      this.closeMessageEvent = function (e) {
        return _this.closeMessage(e);
      };
    }

    _createClass(GlobalAlert, [{
      key: "init",
      value: function init() {
        this.controls();
      }
    }, {
      key: "controls",
      value: function controls() {
        this.closeButton.addEventListener('click', this.closeMessageEvent, false);
      }
    }, {
      key: "closeMessage",
      value: function closeMessage() {
        this.messageElement.hidden = true;
      }
    }]);

    return GlobalAlert;
  }();

  if (window.NodeList && !NodeList.prototype.forEach) {
    NodeList.prototype.forEach = Array.prototype.forEach;
  }

  if (!Element.prototype.closest) {
    if (!Element.prototype.matches) {
      Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
    }

    Element.prototype.closest = function closest(s) {
      var el = this;
      var ancestor = this;
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
    var openSearchButton = document.querySelectorAll('.js-open-search');
    var closeSearchButton = document.querySelectorAll('.js-close-search');
    var accordions = document.querySelectorAll('.js-accordion');
    var dialogs = document.querySelectorAll('.js-dialog');
    var filters = document.querySelectorAll('.js-filters');
    var tabs = document.querySelectorAll('.js-tabs');
    var globalAlert = document.querySelectorAll('.js-global-alert');
    openSearchButton.forEach(function (element) {
      new SiteSearch(element).init();
    });
    closeSearchButton.forEach(function (element) {
      new SiteSearch(element).init();
    }); // Navigation

    new Navigation().init();
    accordions.forEach(function (element) {
      new Accordion(element).init();
    });
    dialogs.forEach(function (element) {
      new Dialog(element).init();
    });

    if (filters) {
      filters.forEach(function (element) {
        new Filters(element).init();
      });
    }

    if (tabs) {
      tabs.forEach(function (element) {
        new Tabs(element).init();
      });
    }

    if (globalAlert) {
      globalAlert.forEach(function (element) {
        new GlobalAlert(element).init();
      });
    }
  }

  exports.Accordion = Accordion;
  exports.GlobalAlert = GlobalAlert;
  exports.Navigation = Navigation;
  exports.SiteSearch = SiteSearch;
  exports.Tabs = Tabs;
  exports.initSite = initSite;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
