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

  var SiteSearch =
  /*#__PURE__*/
  function () {
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

  var getFocusableElement = function getFocusableElement(el) {
    var focusable = el.querySelectorAll("a[href],button:not([disabled]),\n    area[href],input:not([disabled]):not([type=hidden]),\n    select:not([disabled]),textarea:not([disabled]),\n    iframe,object,embed,*:not(.is-draggabe)[tabindex],\n    *[contenteditable]");
    var slicedFocusable = Array.prototype.slice.call(focusable);
    var focusableArray = [];

    for (var i = 0; i < slicedFocusable.length; i += 1) {
      if (slicedFocusable[i].offsetHeight !== 0) focusableArray.push(slicedFocusable[i]);
    }

    var focusableElement = {
      all: focusableArray,
      first: focusableArray[0],
      last: focusableArray[focusableArray.length - 1],
      length: focusableArray.length
    };
    return focusableElement;
  };
  var trapTabKey = function trapTabKey(event, container) {
    var _document = document,
        activeElement = _document.activeElement;
    var focusableElement = getFocusableElement(container);
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
  var popupWindow = function popupWindow(url, width, height) {
    var y = window.top.outerHeight / 2 + window.top.screenY - height / 2;
    var x = window.top.outerWidth / 2 + window.top.screenX - width / 2;
    window.open(url, '', "toolbar=no,location=no,directories=no, status=no,\n    menubar=no, scrollbars=no, resizable=no, copyhistory=no,\n    width=".concat(width, ", height=").concat(height, ", top=").concat(y, ", left=").concat(x));
  };

  var Navigation =
  /*#__PURE__*/
  function () {
    function Navigation() {
      var _this = this;

      _classCallCheck(this, Navigation);

      this.openNavButton = document.querySelector('.js-open-navigation');
      this.closeNavButtons = document.querySelectorAll('.js-close-navigation');
      this.openSubnavButtons = document.querySelectorAll('.js-open-subnav');
      this.closeSubnavButtons = document.querySelectorAll('.js-close-subnav');
      this.mainNavElement = document.getElementById('main-navigation');
      this.isMegaMenuElement = !!document.querySelector('.js-mega-menu');
      this.transitionEvent = whichTransitionEvent();

      this.mobileToggleMainNavEvent = function (e) {
        return _this.mobileToggleMainNav(e);
      };

      this.mobileToggleSubnavEvent = function (e) {
        return _this.mobileToggleSubnav(e);
      };

      this.mobileShowMainTransitionEndEvent = function (e) {
        return _this.mobileShowMainNav(e);
      };

      this.mobileHideMainTransitionEndEvent = function (e) {
        return _this.mobileHideMainNav(e);
      };

      this.mobileShowSubNavTransitionEndEvent = function (e) {
        return _this.mobileShowSubNav(e);
      };

      this.mobileTrapTabKeyEvent = function (e) {
        return trapTabKey(e, _this.mainNavElement);
      };

      this.mobileSubNavTrapTabKeyEvent = function (e) {
        return trapTabKey(e, _this.subNavControls.subNavElement);
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

      this.subNavControls = {};
      this.openSubNavElements = {};
      this.megaMenuListItems = [];
      this.breakpoint = window.matchMedia('(min-width: 48em)');
    }

    _createClass(Navigation, [{
      key: "init",
      value: function init() {
        var _this2 = this;

        if (this.mainNavElement) {
          this.responsiveCheck(this.breakpoint);
          this.breakpoint.addListener(function (e) {
            return _this2.responsiveCheck(e);
          });
        }
      }
    }, {
      key: "responsiveCheck",
      value: function responsiveCheck(_ref) {
        var matches = _ref.matches;

        if (matches) {
          this.teardownMobileNav();
          this.setUpDesktopNav();
        } else {
          this.setUpMobileNav();
          this.teardownDesktopNav();
        }
      }
    }, {
      key: "setUpMobileNav",
      value: function setUpMobileNav() {
        var _this3 = this;

        this.openNavButton.addEventListener('click', this.mobileToggleMainNavEvent, false);
        this.closeNavButtons.forEach(function (element) {
          element.addEventListener('click', _this3.mobileToggleMainNavEvent, false);
        });
        this.mainNavElement.addEventListener('keydown', this.mobileTrapTabKeyEvent, false);
        this.openSubnavButtons.forEach(function (element) {
          element.addEventListener('click', _this3.mobileToggleSubnavEvent, false);
        });
        this.closeSubnavButtons.forEach(function (element) {
          element.addEventListener('click', _this3.mobileToggleSubnavEvent, false);
        });
      }
    }, {
      key: "teardownMobileNav",
      value: function teardownMobileNav() {
        var _this4 = this;

        this.openNavButton.removeEventListener('click', this.mobileToggleMainNavEvent, false);
        this.closeNavButtons.forEach(function (element) {
          element.removeEventListener('click', _this4.mobileToggleMainNavEvent, false);
        });
        this.mainNavElement.removeEventListener('keydown', this.mobileTrapTabKeyEvent, false);
        this.openSubnavButtons.forEach(function (element) {
          element.removeEventListener('click', _this4.mobileToggleSubnavEvent, false);
        });
        this.closeSubnavButtons.forEach(function (element) {
          element.removeEventListener('click', _this4.mobileToggleSubnavEvent, false);
        });
      }
    }, {
      key: "setUpDesktopNav",
      value: function setUpDesktopNav() {
        var _this5 = this;

        if (this.isMegaMenuElement) {
          var tempListItems = this.mainNavElement.getElementsByTagName('ul')[0].children;
          this.megaMenuListItems = Array.prototype.slice.call(tempListItems);
          this.megaMenuListItems.forEach(function (item) {
            var submenu = item.querySelector('[id$=-subnav]');
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
      key: "teardownDesktopNav",
      value: function teardownDesktopNav() {
        var _this6 = this;

        if (this.isMegaMenuElement) {
          this.megaMenuListItems.forEach(function (item) {
            var submenu = item.querySelector('[id$=-subnav]');
            var link = item.querySelector('a');

            if (submenu) {
              link.removeAttribute('role');
              link.removeAttribute('aria-expanded');
              link.removeAttribute('aria-controls');
              link.removeEventListener('click', _this6.desktopButtonClickEvent, false);
              link.removeEventListener('keydown', _this6.desktopButtonKeydownEvent, false);
              document.removeEventListener('keydown', _this6.escapeCloseEvent, false);
            }
          });
        }
      }
    }, {
      key: "mobileShowMainNav",
      value: function mobileShowMainNav(_ref2) {
        var propertyName = _ref2.propertyName;
        if (!propertyName === 'transform') return;
        getFocusableElement(this.mainNavElement).all[1].focus();
        this.mainNavElement.classList.add('is-open');
        this.mainNavElement.classList.remove('is-opening');
        this.mainNavElement.removeEventListener(this.transitionEvent, this.mobileShowMainTransitionEndEvent, false);
      }
    }, {
      key: "mobileHideMainNav",
      value: function mobileHideMainNav(_ref3) {
        var propertyName = _ref3.propertyName;
        if (!propertyName === 'transform') return;
        var subNavElement = this.subNavControls.subNavElement;
        this.mainNavElement.classList.remove('is-open');
        this.mainNavElement.classList.remove('is-closing');

        if (subNavElement) {
          subNavElement.removeEventListener('keydown', this.mobileSubNavTrapTabKeyEvent, false);
          subNavElement.classList.remove('is-open');
          subNavElement.classList.remove('is-closing');
        }

        this.mainNavElement.removeEventListener(this.transitionEvent, this.mobileHideMainTransitionEndEvent, false);
      }
    }, {
      key: "mobileToggleMainNav",
      value: function mobileToggleMainNav(e) {
        var currentTarget = e.currentTarget;
        var isExpanded = currentTarget.getAttribute('aria-expanded') === 'true';

        if (isExpanded) {
          this.openNavButton.focus();
          this.mainNavElement.classList.add('is-closing');
          this.mainNavElement.addEventListener(this.transitionEvent, this.mobileHideMainTransitionEndEvent, false);
        } else {
          this.mainNavElement.classList.add('is-opening');
          this.mainNavElement.addEventListener(this.transitionEvent, this.mobileShowMainTransitionEndEvent, false);
        }
      }
    }, {
      key: "mobileToggleSubnav",
      value: function mobileToggleSubnav(e) {
        var currentTarget = e.currentTarget;
        var isExpanded = currentTarget.getAttribute('aria-expanded') === 'true';
        this.mobileSaveSubnavElements(currentTarget);
        var _this$subNavControls = this.subNavControls,
            subNavElement = _this$subNavControls.subNavElement,
            openButton = _this$subNavControls.openButton;

        if (isExpanded) {
          subNavElement.classList.remove('is-open');
          openButton.focus();
          subNavElement.removeEventListener('keydown', this.mobileSubNavTrapTabKeyEvent, false);
        } else {
          subNavElement.classList.add('is-open');
          subNavElement.addEventListener('keydown', this.mobileSubNavTrapTabKeyEvent, false);
          subNavElement.addEventListener(this.transitionEvent, this.mobileShowSubNavTransitionEndEvent, false);
        }
      }
    }, {
      key: "mobileSaveSubnavElements",
      value: function mobileSaveSubnavElements(element) {
        var parentElement = element.closest('li');
        this.subNavControls = {
          subNavElement: document.getElementById(element.getAttribute('aria-controls')),
          openButton: parentElement.querySelector('.js-open-subnav')
        };
      }
    }, {
      key: "mobileShowSubNav",
      value: function mobileShowSubNav(_ref4) {
        var propertyName = _ref4.propertyName;
        var subNavElement = this.subNavControls.subNavElement;
        if (!propertyName === 'transform') return;
        getFocusableElement(subNavElement).all[2].focus();
        subNavElement.removeEventListener(this.transitionEvent, this.mobileShowSubNavTransitionEndEvent, false);
      }
    }, {
      key: "buttonClickDesktop",
      value: function buttonClickDesktop(e) {
        this.saveElements(e);
        this.toggleSubnavDesktop();
        e.preventDefault();
      }
    }, {
      key: "buttonKeydownDesktop",
      value: function buttonKeydownDesktop(e) {
        this.saveElements(e);

        if (e.key === ' ' || e.key === 'Enter' || e.key === 'Spacebar') {
          this.toggleSubnavDesktop();
          e.preventDefault();
        }
      }
    }, {
      key: "escapeClose",
      value: function escapeClose(e) {
        var isExpanded = this.openSubNavElements.isExpanded;

        if (e.key === 'Escape' && isExpanded) {
          this.toggleSubnavDesktop(true);
          e.preventDefault();
          this.openSubNavElements.link.focus();
        }
      }
    }, {
      key: "saveElements",
      value: function saveElements(e) {
        var currentTarget = e.currentTarget;
        this.openSubNavElements = {
          submenu: document.getElementById(currentTarget.getAttribute('aria-controls')),
          link: currentTarget,
          isExpanded: currentTarget.getAttribute('aria-expanded') === 'true',
          linkParent: currentTarget.parentNode
        };
      }
    }, {
      key: "toggleSubnavDesktop",
      value: function toggleSubnavDesktop(close) {
        var _this$openSubNavEleme = this.openSubNavElements,
            submenu = _this$openSubNavEleme.submenu,
            link = _this$openSubNavEleme.link,
            isExpanded = _this$openSubNavEleme.isExpanded;

        if (isExpanded || close) {
          link.setAttribute('aria-expanded', false);
          link.classList.remove('is-open');
          submenu.classList.remove('is-open');
          this.mainNavElement.removeEventListener('focus', this.checkFocusEvent, true);
        } else {
          link.setAttribute('aria-expanded', true);
          link.classList.add('is-open');
          submenu.classList.add('is-open');
          this.mainNavElement.addEventListener('focus', this.checkFocusEvent, true);
        }
      }
    }, {
      key: "checkIfContainsFocus",
      value: function checkIfContainsFocus() {
        var linkParent = this.openSubNavElements.linkParent;
        var focusWithin = linkParent.contains(document.activeElement);

        if (!focusWithin) {
          this.toggleSubnavDesktop(true);
        }
      }
    }]);

    return Navigation;
  }();

  var ResponsiveTables =
  /*#__PURE__*/
  function () {
    function ResponsiveTables(element) {
      _classCallCheck(this, ResponsiveTables);

      this.table = element;
      this.tablehead = element.getElementsByTagName('thead');
      this.thCells = this.tablehead[0].getElementsByTagName('th');
      this.tablebody = element.getElementsByTagName('tbody');
      this.tdCells = Array.prototype.slice.call(this.tablebody[0].getElementsByTagName('td'));
    }

    _createClass(ResponsiveTables, [{
      key: "init",
      value: function init() {
        this.table.classList.add('nsw-table--stacked');
        this.addHeadingContent();
        this.enhanceWithAria();
      }
    }, {
      key: "addHeadingContent",
      value: function addHeadingContent() {
        var _this = this;

        this.tdCells.forEach(function (cell) {
          var theCell = cell;
          var headingText = _this.thCells[cell.cellIndex].textContent;
          var heading = document.createElement('strong');
          heading.classList.add('nsw-table__heading');
          heading.innerHTML = "".concat(headingText, ": ");
          theCell.insertAdjacentElement('afterbegin', heading);
        });
      }
    }, {
      key: "enhanceWithAria",
      value: function enhanceWithAria() {
        this.tdCells.forEach(function (cell) {
          var rowElement = cell.parentNode;
          rowElement.setAttribute('role', 'row');
          cell.setAttribute('role', 'cell');
        });
      }
    }]);

    return ResponsiveTables;
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
    button.insertAdjacentHTML('beforeend', "\n  <svg class=\"nsw-icon nsw-accordion__icon\" focusable=\"false\" aria-hidden=\"true\">\n    <use xlink:href=\"#chevron\"></use>\n  </svg>\n  ");
    fragment.appendChild(button);
    return fragment;
  }

  var Accordion =
  /*#__PURE__*/
  function () {
    function Accordion(element) {
      var _this = this;

      _classCallCheck(this, Accordion);

      this.accordionHeadingClass = '.nsw-accordion__title';
      this.accordion = element;
      this.headings = element.querySelectorAll(this.accordionHeadingClass);
      this.buttons = [];
      this.content = [];

      this.showHideEvent = function (e) {
        return _this.showHide(e);
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

        this.accordion.classList.add('is-ready');
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
          element.addEventListener('click', _this3.showHideEvent, false);
        });
      }
    }, {
      key: "showHide",
      value: function showHide(e) {
        var currentTarget = e.currentTarget;
        var currentIndex = this.buttons.indexOf(currentTarget);
        var targetContent = this.content[currentIndex];
        var isHidden = targetContent.hidden;

        if (isHidden) {
          currentTarget.classList.add('is-open');
          currentTarget.setAttribute('aria-expanded', 'true');
          targetContent.hidden = false;
        } else {
          currentTarget.classList.remove('is-open');
          currentTarget.setAttribute('aria-expanded', 'false');
          targetContent.hidden = true;
        }
      }
    }]);

    return Accordion;
  }();

  var ShareThis =
  /*#__PURE__*/
  function () {
    function ShareThis() {
      _classCallCheck(this, ShareThis);

      this.sharelinks = document.querySelectorAll('.js-share-this');
    }

    _createClass(ShareThis, [{
      key: "init",
      value: function init() {
        this.controls();
      }
    }, {
      key: "controls",
      value: function controls() {
        var _this = this;

        this.sharelinks.forEach(function (element) {
          element.addEventListener('click', _this.popup, false);
        });
      }
    }, {
      key: "popup",
      value: function popup(e) {
        e.preventDefault();
        popupWindow(this.href, 600, 600);
      }
    }]);

    return ShareThis;
  }();

  var Tabs =
  /*#__PURE__*/
  function () {
    function Tabs(element, showTab) {
      var _this = this;

      _classCallCheck(this, Tabs);

      this.tablistClass = '.nsw-tabs__list';
      this.tablistItemClass = '.nsw-tabs__list-item';
      this.tablistLinkClass = '.nsw-tabs__link';
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

        this.tab.classList.add('is-ready');
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
        var tabItems = this.tabItems,
            tabLinks = this.tabLinks,
            tabPanel = this.tabPanel,
            showTab = this.showTab;
        var index = showTab === undefined ? 0 : showTab;
        var selectedLink = tabLinks[index];
        tabItems[index].classList.add('is-selected');
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
          this.selectedTab.setAttribute('aria-selected', false);
          this.selectedTab.setAttribute('tabindex', '-1');
          var clickedTabIndex = this.tabLinks.indexOf(clickedTab);
          var selectedTabIndex = this.tabLinks.indexOf(this.selectedTab);
          this.tabItems[clickedTabIndex].classList.add('is-selected');
          this.tabItems[selectedTabIndex].classList.remove('is-selected');
          this.tabPanel[clickedTabIndex].hidden = false;
          this.tabPanel[selectedTabIndex].hidden = true;
          this.selectedTab = clickedTab;
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
              index = index === 0 ? linkLength : index -= 1;
              break;

            case 39:
              index = index === linkLength ? 0 : index += 1;
              break;

            case 40:
              down = true;
              break;
          }

          if (down) {
            this.tabPanel[index].focus();
          } else {
            this.switchTabs(this.tabLinks[index]);
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

  var SitewideMessage =
  /*#__PURE__*/
  function () {
    function SitewideMessage(element) {
      var _this = this;

      _classCallCheck(this, SitewideMessage);

      this.messageElement = element;
      this.closeButton = element.querySelector('.nsw-sitewide-message__close');

      this.closeMessageEvent = function (e) {
        return _this.closeMessage(e);
      };
    }

    _createClass(SitewideMessage, [{
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

    return SitewideMessage;
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
    var responsiveTables = document.querySelectorAll('.js-responsive-table');
    var accordions = document.querySelectorAll('.js-accordion');
    var tabs = document.querySelectorAll('.js-tabs');
    var siteMessages = document.querySelectorAll('.js-sitewide-message');
    openSearchButton.forEach(function (element) {
      new SiteSearch(element).init();
    });
    closeSearchButton.forEach(function (element) {
      new SiteSearch(element).init();
    }); // Navigation

    new Navigation().init();
    responsiveTables.forEach(function (element) {
      new ResponsiveTables(element).init();
    });
    accordions.forEach(function (element) {
      new Accordion(element).init();
    });

    if (tabs) {
      tabs.forEach(function (element) {
        new Tabs(element).init();
      });
    }

    new ShareThis().init();

    if (siteMessages) {
      siteMessages.forEach(function (element) {
        new SitewideMessage(element).init();
      });
    }
  }

  exports.Accordion = Accordion;
  exports.Navigation = Navigation;
  exports.ResponsiveTables = ResponsiveTables;
  exports.ShareThis = ShareThis;
  exports.SiteSearch = SiteSearch;
  exports.SitewideMessage = SitewideMessage;
  exports.Tabs = Tabs;
  exports.initSite = initSite;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
