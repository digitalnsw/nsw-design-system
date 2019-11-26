(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define('NSW', ['exports'], factory) :
  (global = global || self, factory(global.NSW = {}));
}(this, (function (exports) { 'use strict';

  function SiteSearch(element) {
    this.triggerButton = element;
    this.originalButton = document.querySelector('.js-open-search');
    this.targetElement = document.getElementById(this.triggerButton.getAttribute('aria-controls'));
    this.searchInput = this.targetElement.querySelector('.js-search-input');
    this.pressed = this.triggerButton.getAttribute('aria-expanded') === 'true';
  }

  SiteSearch.prototype.init = function init() {
    this.controls();
  };

  SiteSearch.prototype.controls = function controls() {
    this.triggerButton.addEventListener('click', this.showHide.bind(this), false);
  };

  SiteSearch.prototype.showHide = function showHide() {
    if (this.pressed) {
      this.targetElement.hidden = true;
      this.originalButton.hidden = false;
      this.originalButton.focus();
    } else {
      this.targetElement.hidden = false;
      this.originalButton.hidden = true;
      this.searchInput.focus();
    }
  };

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

  function Navigation() {
    var _this = this;

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

  Navigation.prototype.init = function init() {
    var _this2 = this;

    if (this.mainNavElement) {
      this.responsiveCheck(this.breakpoint);
      this.breakpoint.addListener(function (e) {
        return _this2.responsiveCheck(e);
      });
    }
  };

  Navigation.prototype.responsiveCheck = function responsiveCheck(e) {
    if (e.matches) {
      this.teardownMobileNav();
      this.setUpDesktopNav();
    } else {
      this.setUpMobileNav();
      this.teardownDesktopNav();
    }
  };

  Navigation.prototype.setUpMobileNav = function setUpMobileNav() {
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
  };

  Navigation.prototype.teardownMobileNav = function teardownMobileNav() {
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
  };

  Navigation.prototype.setUpDesktopNav = function setUpDesktopNav() {
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
  };

  Navigation.prototype.teardownDesktopNav = function teardownDesktopNav() {
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
  };

  Navigation.prototype.mobileShowMainNav = function mobileShowMainNav(e) {
    if (!e.propertyName === 'transform') return;
    getFocusableElement(this.mainNavElement).all[1].focus();
    this.mainNavElement.classList.add('is-open');
    this.mainNavElement.classList.remove('is-opening');
    this.mainNavElement.removeEventListener(this.transitionEvent, this.mobileShowMainTransitionEndEvent, false);
  };

  Navigation.prototype.mobileHideMainNav = function mobileHideMainNav(e) {
    if (!e.propertyName === 'transform') return;
    var subNavElement = this.subNavControls.subNavElement;
    this.mainNavElement.classList.remove('is-open');
    this.mainNavElement.classList.remove('is-closing');

    if (subNavElement) {
      subNavElement.removeEventListener('keydown', this.mobileSubNavTrapTabKeyEvent, false);
      subNavElement.classList.remove('is-open');
      subNavElement.classList.remove('is-closing');
    }

    this.mainNavElement.removeEventListener(this.transitionEvent, this.mobileHideMainTransitionEndEvent, false);
  };

  Navigation.prototype.mobileToggleMainNav = function mobileToggleMainNav(e) {
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
  };

  Navigation.prototype.mobileToggleSubnav = function mobileToggleSubnav(e) {
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
  };

  Navigation.prototype.mobileSaveSubnavElements = function mobileSaveSubnavElements(element) {
    var parentElement = element.closest('li');
    this.subNavControls = {
      subNavElement: document.getElementById(element.getAttribute('aria-controls')),
      openButton: parentElement.querySelector('.js-open-subnav')
    };
  };

  Navigation.prototype.mobileShowSubNav = function mobileShowSubNav(e) {
    var subNavElement = this.subNavControls.subNavElement;
    if (!e.propertyName === 'transform') return;
    getFocusableElement(subNavElement).all[2].focus();
    subNavElement.removeEventListener(this.transitionEvent, this.mobileShowSubNavTransitionEndEvent, false);
  };

  Navigation.prototype.buttonClickDesktop = function buttonClickDesktop(e) {
    this.saveElements(e);
    this.toggleSubnavDesktop();
    e.preventDefault();
  };

  Navigation.prototype.buttonKeydownDesktop = function buttonKeydownDesktop(e) {
    this.saveElements(e);

    if (e.key === ' ' || e.key === 'Enter' || e.key === 'Spacebar') {
      this.toggleSubnavDesktop();
      e.preventDefault();
    }
  };

  Navigation.prototype.escapeClose = function escapeClose(e) {
    var isExpanded = this.openSubNavElements.isExpanded;

    if (e.key === 'Escape' && isExpanded) {
      this.toggleSubnavDesktop(true);
      e.preventDefault();
    }
  };

  Navigation.prototype.saveElements = function saveElements(e) {
    var currentTarget = e.currentTarget;
    this.openSubNavElements = {
      submenu: document.getElementById(currentTarget.getAttribute('aria-controls')),
      link: currentTarget,
      isExpanded: currentTarget.getAttribute('aria-expanded') === 'true',
      linkParent: currentTarget.parentNode
    };
  };

  Navigation.prototype.toggleSubnavDesktop = function toggleSubnavDesktop(close) {
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
  };

  Navigation.prototype.checkIfContainsFocus = function checkIfContainsFocus() {
    var linkParent = this.openSubNavElements.linkParent;
    var focusWithin = linkParent.contains(document.activeElement);

    if (!focusWithin) {
      this.toggleSubnavDesktop(true);
    }
  };

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
    openSearchButton.forEach(function (element) {
      new SiteSearch(element).init();
    });
    closeSearchButton.forEach(function (element) {
      new SiteSearch(element).init();
    }); // Navigation

    new Navigation().init();
  }

  exports.Navigation = Navigation;
  exports.SiteSearch = SiteSearch;
  exports.initSite = initSite;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
