(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define('NSW', ['exports'], factory) :
  (global = global || self, factory(global.NSW = {}));
}(this, (function (exports) { 'use strict';

  function SiteSearch(element) {
    this.triggerButton = element;
    this.originalButton = document.querySelector('.js-open-search');
    this.targetElement = document.getElementById(this.triggerButton.getAttribute("aria-controls"));
    this.searchInput = this.targetElement.querySelector(".js-search-input");
    this.pressed = this.triggerButton.getAttribute('aria-expanded') === 'true';
  }

  SiteSearch.prototype.init = function () {
    this.controls();
  };

  SiteSearch.prototype.controls = function () {
    this.triggerButton.addEventListener("click", this.showHide.bind(this), false);
  };

  SiteSearch.prototype.showHide = function () {
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

  function initSite() {
    const searchButton = document.querySelectorAll(".js-open-search");
    const closeButton = document.querySelectorAll(".js-close-search");
    searchButton.forEach(function (element) {
      new SiteSearch(element).init();
    });
    closeButton.forEach(function (element) {
      new SiteSearch(element).init();
    });
  }

  exports.SiteSearch = SiteSearch;
  exports.initSite = initSite;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
