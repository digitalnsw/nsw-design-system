(function (factory) {
  typeof define === 'function' && define.amd ? define('NSW', factory) :
  factory();
})((function () { 'use strict';

  const searchValues = [{
    label: 'Accordion',
    template: 'result',
    keywords: 'show, hide, Collapse, Expand, expandable, vertical, panels',
    url: '/components/accordion/index.html'
  }, {
    label: 'Breadcrumbs',
    template: 'result',
    keywords: 'navigation, information architecture, IA',
    url: '/components/breadcrumbs/index.html'
  }, {
    label: 'Buttons',
    template: 'result',
    keywords: 'blue diamond, links, submit, call to action, transaction',
    url: '/components/button/index.html'
  }, {
    label: 'Callout',
    template: 'result',
    keywords: 'action, highlight, attention',
    url: '/components/callout/index.html'
  }, {
    label: 'Cards',
    template: 'result',
    keywords: 'Highlight, Content, images, links, summary, related content, navigation',
    url: '/components/card/index.html'
  }, {
    label: 'Content blocks',
    template: 'result',
    keywords: 'columns, links, content',
    url: '/components/content-block/index.html'
  }, {
    label: 'Cookie consent',
    template: 'result',
    keywords: 'cookie, consent, consent banner, privacy, GDPR, CCPA, cookie policy, cookie preferences, cookie consent solution, cookie banner design, tracking consent, online privacy compliance, data protection, cookie management, privacy notice, user data consent, web compliance, privacy settings, regulatory compliance, digital consent',
    url: '/components/cookie-consent/index.html'
  }, {
    label: 'Date input',
    template: 'result',
    keywords: 'date, day, month, year, calendar, input field, manual entry, form field, accessibility, validation, format, required, date format, user input, form date, date input, date field',
    url: '/components/date-input/index.html'
  }, {
    label: 'Date picker',
    template: 'result',
    keywords: 'date, calendar, UI picker, dropdown calendar, select date, form, input field, visual selector, accessibility, date selection, required field, user-friendly, mobile-friendly, form date, date input, date field',
    url: '/components/date-picker/index.html'
  }, {
    label: 'Dialog',
    template: 'result',
    keywords: 'modal, window, alert, message, action, information, notification, required, response, Transactional, single, call to action, Danger, Dismissible',
    url: '/components/dialog/index.html'
  }, {
    label: 'Filters',
    template: 'result',
    keywords: 'results, data, refine',
    url: '/components/filters/index.html'
  }, {
    label: 'Footer',
    template: 'result',
    keywords: 'links, copyright, blue diamond, social, privacy, contact',
    url: '/components/footer/index.html'
  }, {
    label: 'Forms',
    template: 'result',
    keywords: 'data, input, field, Freeform, Selection, label, checkbox, Dropdown, radio, list, Validation, help text, placeholder, autofill, autocorrect, blue diamond',
    url: '/components/form/index.html'
  }, {
    label: 'Global alert',
    template: 'result',
    keywords: 'attention, important, critical',
    url: '/components/global-alert/index.html'
  }, {
    label: 'Header',
    template: 'result',
    keywords: 'logo, site descriptors, Search, masthead, blue diamond',
    url: '/components/header/index.html'
  }, {
    label: 'Hero banner',
    template: 'result',
    keywords: 'landing page, homepage',
    url: '/components/hero-banner/index.html'
  }, {
    label: 'Hero search',
    template: 'result',
    keywords: '',
    url: '/components/hero-search/index.html'
  }, {
    label: 'In-page alert',
    template: 'result',
    keywords: '',
    url: '/components/in-page-alert/index.html'
  }, {
    label: 'In-page navigation',
    template: 'result',
    keywords: 'table of contents, anchor, links',
    url: '/components/in-page-nav/index.html'
  }, {
    label: 'Link list',
    template: 'result',
    keywords: '',
    url: '/components/link-list/index.html'
  }, {
    label: 'List items',
    template: 'result',
    keywords: '',
    url: '/components/list-item/index.html'
  }, {
    label: 'Main navigation',
    template: 'result',
    keywords: 'information, architecture, IA, orientate, Mega, menu, navigation, top level, Search, off-canvas, animation, slide-in, Offcanvas',
    url: '/components/main-nav/index.html'
  }, {
    label: 'Masthead',
    template: 'result',
    keywords: 'topbar, Top, bar, blue diamond, alert',
    url: '/components/masthead/index.html'
  }, {
    label: 'Media',
    template: 'result',
    keywords: 'visual, elements, images, video, Captions, figure, figcaption',
    url: '/components/media/index.html'
  }, {
    label: 'Pagination',
    template: 'result',
    keywords: 'total, navigation, listing',
    url: '/components/pagination/index.html'
  }, {
    label: 'Progress Indicator',
    template: 'result',
    keywords: 'step',
    url: '/components/progress-indicator/index.html'
  }, {
    label: 'Results bar',
    template: 'result',
    keywords: 'list, sort, counter, filter',
    url: '/components/results-bar/index.html'
  }, {
    label: 'Side navigation',
    template: 'result',
    keywords: 'hierarchy, Single, Multiple, level, nesting, nav',
    url: '/components/side-nav/index.html'
  }, {
    label: 'Steps',
    template: 'result',
    keywords: 'Steps, stages, timeline, wizard, sequences, Sequential',
    url: '/components/steps/index.html'
  }, {
    label: 'Support list',
    template: 'result',
    keywords: 'support list, contact list, help, assistance, user support, government support, design system, resource links, navigation, customer service, accessibility',
    url: '/components/support-list/index.html'
  }, {
    label: 'Tables',
    template: 'result',
    keywords: 'data, rows, columns, scan, sort, compare, information, Horizontal lined, Stripped, Bordered, Stripe, Border',
    url: '/components/table/index.html'
  }, {
    label: 'Tabs',
    template: 'result',
    keywords: 'ui, design, Toolbar, interface, navigation, panels, tabbed content, tab switcher, content grouping, horizontal tabs, accessibility, interactive, layout, tab interface, section control',
    url: '/components/tabs/index.html'
  }, {
    label: 'Tags',
    template: 'result',
    keywords: 'badge, button, chip, marker, mark, identification, label, categorise, checkbox, tag, toggle, status, pill, filter, selection, selectable, metadata, classification, option, category, token, indicator, visual tag, highlight',
    url: '/components/tag/index.html'
  }, {
    label: 'Logo',
    template: 'result',
    keywords: 'Branding, visual, representation, Primary Logo, Usage and placement, Clear space, Sizing, Masterbrand, Co-brand, Endorsed, Independent, blue diamond',
    url: '/core/logo/index.html'
  }, {
    label: 'Colour',
    template: 'result',
    keywords: 'consistent, visual, identify, digital, base, theme, Brand, colours, Grey, Text, Status, palette, dark, light, brand, supplementary, accent, blue diamond',
    url: '/core/colour/index.html'
  }, {
    label: 'Typography',
    template: 'result',
    keywords: 'font, headings, body text, lists, paragraphs, styles, Public Sans, font stack, CSS, Links, Blockquote, Unordered, Ordered, Definition, blue diamond',
    url: '/core/typography/index.html'
  }, {
    label: 'Iconography',
    template: 'result',
    keywords: 'Icons, illustrate, actions, communicate, status, interaction, attention, information, Usage, Styling, Application, Designing, Accessibility, Text, Button, Colour, Sizing, Spacing, Material Design, SVG, scalable vector graphics, rotation, blue diamond',
    url: '/core/iconography/index.html'
  }, {
    label: 'Pictograms',
    template: 'result',
    keywords: 'word, simple, clean, illustration, idea, Usage, Styling, Designing, SVG, utility classes, Styling, Brand, blue diamond',
    url: '/core/pictograms/index.html'
  }, {
    label: 'Grid',
    template: 'result',
    keywords: 'Breakpoints, Content, 12 column, responsive, viewport, Token, Container, fixed, Gutters, Max active content, area, layouts, Whole, Half, Third, Quarter, Offset, grids',
    url: '/core/grid/index.html'
  }, {
    label: 'Layout',
    template: 'result',
    keywords: 'Page, layouts, standard, Full width, Two column, Left, Right, Usage, Main, content, desktop, viewport',
    url: '/core/layout/index.html'
  }, {
    label: 'Section',
    template: 'result',
    keywords: 'Flexible, layout, component, content, consistent, vertical, spacing, Usage, style, container, Image, Box, Colour, Inverted, colours, dark background',
    url: '/core/section/index.html'
  }, {
    label: 'Graphic elements',
    template: 'result',
    keywords: 'Logo positioning, details, hierarchy, interactions, digital branding, brand, Border radius, Drop shadow, Application, Line System, Examples,  tabs, card, in-page navigation, blue diamond',
    url: '/core/graphic-elements/index.html'
  }, {
    label: 'Search & Filters',
    template: 'result',
    keywords: 'explore, keywords, phrases, find, results, Predictive, suggestions, autocomplete',
    url: '/docs/content/methods/search.html'
  }, {
    label: 'Maps',
    template: 'result',
    keywords: 'Markers, Mapbox, MapMarker.io, leaflet.js, location, pin',
    url: '/docs/content/methods/maps.html'
  }, {
    label: 'Data visualisation',
    template: 'result',
    keywords: 'Comparison, data, trends, Display, statistics, Processes, workflows, Mapping, diagramming, Colours, theming, charts.js, charts, graphs, Screen readers',
    url: '/docs/content/methods/data-visualisation.html'
  }, {
    label: 'You are here',
    template: 'result',
    keywords: 'Where am I, Where can I go, Who is speaking, orientate, Breadcrumbs, Hero banner, Typography, hierarchy, navigation, Main navigation, Side navigation',
    url: '/docs/content/methods/you-are-here.html'
  }, {
    label: 'Templates',
    template: 'result',
    keywords: 'Homepage, Content, Search, Sample, Example, Hero banner, Featured list, Hero search, Simple, Filters, No results, Side navigation, Article, Filters, Form, Maps, Location, primary, sub filters, Equal value filters, Theming, Masterbrand,Full page, Content, Partial',
    url: '/templates/index.html'
  }, {
    label: 'What is Design System',
    template: 'result',
    keywords: 'Benefits, Build faster and at scale, brand and accessibility compliance, Consistent code and design language, Quality across all layers, Support, Questions, Report issues, Issues tracker, Report a bug',
    url: '/docs/content/about/what-is-design-system.html'
  }, {
    label: 'Supporting different roles',
    template: 'result',
    keywords: 'Product Managers, Designers, Developers, UI, UX',
    url: '/docs/content/about/supporting-different-roles.html'
  }, {
    label: 'Our ecosystem',
    template: 'result',
    keywords: 'Digital Visual Identity, Core styles and components, Digital NSW Community, Built in accessibility, UX, content guidance, UI, code starter kits',
    url: '/docs/content/about/our-ecosystem.html'
  }, {
    label: "What's happening",
    template: 'result',
    keywords: 'Releases, Work in progress, Consulting with community, Backlog, Changelog, changed, Version, Change logs',
    url: '/docs/content/about/whats-happening.html'
  }, {
    label: 'Getting Started',
    template: 'result',
    keywords: 'Core styles, Base components, UX Guidance, First steps',
    url: '/docs/content/design/getting-started.html'
  }, {
    label: 'Figma UI Kit',
    template: 'result',
    keywords: 'guides, video tutorials, file, UI, Design',
    url: '/docs/content/design/figma-ui-kit.html'
  }, {
    label: 'Extending',
    template: 'result',
    keywords: 'core elements, create, consistent, building, accessible, Core styles, Components, UX Guidance, Contributing, customise, custom, unique, adapt, adapting',
    url: '/docs/content/design/extending.html'
  }, {
    label: 'Design Theming',
    template: 'result',
    keywords: 'colours, consistent, branding, colour palette, Dark, Light, Brand, Supplementary, Accent, non corporate, cobrand, Masterbrand corporate, non-corporate, co-brand, independent',
    url: '/docs/content/design/theming.html'
  }, {
    label: 'Guides',
    template: 'result',
    keywords: 'Using the design system, Designing, Collaborating, Prototyping, Guidance, ',
    url: '/docs/content/design/guides.html'
  }, {
    label: 'Getting Started',
    template: 'result',
    keywords: 'npm, CDN, starter kit, Installing, Import styles, Core and selected components, Public Sans, Material Icons, Node, SASS, base theme, typography, mixins, functions, javascript, JSDelivr, Browser support, starter kit',
    url: '/docs/content/develop/getting-started.html'
  }, {
    label: 'Develop Theming',
    template: 'result',
    keywords: 'customisation, branding, CSS Variables, Full page, Content only, Partial, brand',
    url: '/docs/content/develop/theming.html'
  }, {
    label: 'Background Utility Classes',
    template: 'result',
    keywords: 'Background colour, Opacity, Hover state, color',
    url: '/docs/content/utilities/background.html'
  }, {
    label: 'Border Utility Classes',
    template: 'result',
    keywords: 'Border radius, width, style, color, borders',
    url: '/docs/content/utilities/borders.html'
  }, {
    label: 'Box Shadow Utility Class',
    template: 'result',
    keywords: 'Box Shadow, box-shadow, shadow',
    url: '/docs/content/utilities/box-shadow.html'
  }, {
    label: 'Display Utility Classes',
    template: 'result',
    keywords: 'display, inline, inline-block, block, grid, inline-grid, flex, inline-flex, hide, show',
    url: '/docs/content/utilities/displayu.html'
  }, {
    label: 'Flex Utility Classes',
    template: 'result',
    keywords: 'Flex, Direction, Justify content, Align items, Align self, Fill, Grow, shrink, Wrap, Order, content',
    url: '/docs/content/utilities/flex.html'
  }, {
    label: 'Float Utility Classes',
    template: 'result',
    keywords: 'Float, wrapping, ',
    url: '/docs/content/utilities/float.html'
  }, {
    label: 'Overflow Utility Classes',
    template: 'result',
    keywords: 'Overflow, auto, hidden, visible, scroll',
    url: '/docs/content/utilities/overflow.html'
  }, {
    label: 'Position Utility Classes',
    template: 'result',
    keywords: 'Position, static, relative, absolute, fixed, sticky',
    url: '/docs/content/utilities/position.html'
  }, {
    label: 'Spacing',
    template: 'result',
    keywords: 'Responsive, units, alignment, consistent, 8-pixel grid, Spacing token, Helper classes, margin, padding, banner',
    url: '/docs/content/utilities/spacing.html'
  }, {
    label: 'SVG Utility Classes',
    template: 'result',
    keywords: 'SVG, fill, stroke, stroke width, icons, pictograms',
    url: '/docs/content/utilities/svg.html'
  }, {
    label: 'Text Utility Classes',
    template: 'result',
    keywords: 'Text, alignment, wrapping, font, weight, overflow, colour',
    url: '/docs/content/utilities/text.html'
  }, {
    label: 'Vertical alignment Utility Classes',
    template: 'result',
    keywords: 'Vertical align, alignment, inline, inline-block, inline-table, table, baseline, top, middle, bottom, text-bottom, text-top',
    url: '/docs/content/utilities/vertical-align.html'
  }, {
    label: 'Visibility Utility Classes',
    template: 'result',
    keywords: 'Visibility, show, hide',
    url: '/docs/content/utilities/visibility.html'
  }, {
    label: 'Z-index Classes',
    template: 'result',
    keywords: 'Z-index, stack order, three-dimensional, positioning, 3D',
    url: '/docs/content/utilities/z-index.html'
  }, {
    label: 'Close button',
    template: 'result',
    keywords: 'Dialog, Global Alert, dismiss, icon, button',
    url: '/components/close-button/index.html'
  }, {
    label: 'Popover',
    template: 'result',
    keywords: 'tooltips, toggletip, dropdown, menu',
    url: '/components/popover/index.html'
  }];

  const defaults = {
    debounce: 200,
    characters: 1,
    populate: true,
    searchData(query, cb, eventType) {
      let data = searchValues.filter(item => item.label.toLowerCase().includes(query.toLowerCase()) || item.keywords.toLowerCase().includes(query.toLowerCase()));
      if (data.length === 0) {
        // fallback for no results found
        data = [{
          label: 'No results',
          template: 'no-results'
        }];
      }
      cb(data);
    },
    onClick(option, obj, event, cb) {
      // update input value
      const input = obj.querySelector('input');
      const linkElement = option.querySelector('a');
      input.value = linkElement.textContent;

      // close dropdown
      cb();
    }
  };
  class Autocomplete {
    constructor(element) {
      this.element = element;
      this.options = defaults;
      this.input = this.element.querySelector('.js-autocomplete__input');
      this.results = this.element.querySelector('.js-autocomplete__results');
      this.resultsList = this.results.querySelector('.js-autocomplete__list');
      this.ariaResult = this.element.querySelectorAll('.js-autocomplete__aria-results');
      this.resultClassName = this.element.querySelectorAll('.js-autocomplete__item').length > 0 ? 'js-autocomplete__item' : 'js-autocomplete__result';
      this.inputVal = '';
      this.typeId = false;
      this.searching = false;
      this.searchingClass = 'searching';
      this.dropdownActiveClass = 'active';
      this.truncateDropdown = !!(this.element.getAttribute('data-autocomplete-dropdown-truncate') && this.element.getAttribute('data-autocomplete-dropdown-truncate') === 'on');
      this.autocompleteClosed = false;
      this.clone = false;
      this.selectedLabelElement = false;
    }
    init() {
      this.initAutocompleteAria();
      this.initAutocompleteTemplates();
      this.initAutocompleteEvents();
    }
    initAutocompleteAria() {
      this.input.setAttribute('role', 'combobox');
      this.input.setAttribute('aria-autocomplete', 'list');
      const listId = this.resultsList.getAttribute('id');
      if (listId) this.input.setAttribute('aria-owns', listId);
      this.resultsList.setAttribute('role', 'list');
    }
    initAutocompleteTemplates() {
      this.templateItems = this.resultsList.querySelectorAll(`.${this.resultClassName}[data-autocomplete-template]`);
      if (this.templateItems.length < 1) this.templateItems = this.resultsList.querySelectorAll(`.${this.resultClassName}`);
      this.templates = [];
      this.templateItems.forEach((item, i) => {
        this.templates[i] = item.getAttribute('data-autocomplete-template');
      });
    }
    initAutocompleteEvents() {
      this.input.addEventListener('keyup', event => {
        this.handleInputTyped(event);
      });
      this.input.addEventListener('search', () => {
        this.updateSearch();
      });
      this.input.addEventListener('click', () => {
        this.updateSearch(true);
      });
      this.input.addEventListener('focus', () => {
        if (this.autocompleteClosed) {
          this.autocompleteClosed = false;
          return;
        }
        this.updateSearch(true);
      });
      this.input.addEventListener('blur', event => {
        this.checkFocusLost(event);
      });
      this.resultsList.addEventListener('keydown', event => {
        this.navigateList(event);
      });
      this.resultsList.addEventListener('focusout', event => {
        this.checkFocusLost(event);
      });
      window.addEventListener('keyup', event => {
        if (event.key && event.key.toLowerCase() === 'escape') {
          this.toggleOptionsList(false);
        } else if (event.key && event.key.toLowerCase() === 'enter') {
          this.selectResult(document.activeElement.closest(`.${this.resultClassName}`), event);
        }
      });
      this.resultsList.addEventListener('click', event => {
        this.selectResult(event.target.closest(`.${this.resultClassName}`), event);
      });
    }
    checkFocusLost(event) {
      if (this.element.contains(event.relatedTarget)) return;
      this.toggleOptionsList(false);
    }
    handleInputTyped(event) {
      if (event.key.toLowerCase() === 'arrowdown') {
        this.moveFocusToList();
      } else {
        this.updateSearch();
      }
    }
    moveFocusToList() {
      if (!this.element.classList.contains(this.dropdownActiveClass)) return;
      this.resetSearch();
      let index = 0;
      if (!this.elementListIsFocusable(index)) {
        index = this.getElementFocusbleIndex(index, true);
      }
      this.getListFocusableEl(index).focus();
    }
    updateSearch(bool) {
      const inputValue = this.input.value;
      if (inputValue === this.inputVal && !bool) return;
      this.inputVal = inputValue;
      if (this.typeId) clearInterval(this.typeId);
      if (this.inputVal.length < this.options.characters) {
        this.toggleOptionsList(false);
        return;
      }
      if (bool) {
        this.updateResultsList('focus');
        return;
      }
      this.typeId = setTimeout(() => {
        this.updateResultsList('type');
      }, this.options.debounce);
    }
    toggleOptionsList(bool) {
      if (bool) {
        if (this.element.classList.contains(this.dropdownActiveClass)) return;
        this.element.classList.add(this.dropdownActiveClass);
        this.input.setAttribute('aria-expanded', true);
        this.truncateAutocompleteList();
      } else {
        if (!this.element.classList.contains(this.dropdownActiveClass)) return;
        if (this.resultsList.contains(document.activeElement)) {
          this.autocompleteClosed = true;
          this.input.focus();
        }
        this.element.classList.remove(this.dropdownActiveClass);
        this.input.removeAttribute('aria-expanded');
        this.resetSearch();
      }
    }
    truncateAutocompleteList() {
      if (!this.truncateDropdown) return;
      // reset max height
      this.resultsList.style.maxHeight = '';
      // check available space
      const spaceBelow = window.innerHeight - this.input.getBoundingClientRect().bottom - 10;
      const maxHeight = parseInt(this.getComputedStyle(this.resultsList).maxHeight, 10);
      if (maxHeight > spaceBelow) {
        this.resultsList.style.maxHeight = `${spaceBelow}px`;
      } else {
        this.resultsList.style.maxHeight = '';
      }
    }
    updateResultsList(eventType) {
      if (this.searching) return;
      this.searching = true;
      this.element.classList.add(this.searchingClass);
      this.options.searchData(this.inputVal, (data, cb) => {
        this.populateResults(data, cb);
        this.element.classList.remove(this.searchingClass);
        this.toggleOptionsList(true);
        this.updateAriaRegion();
        this.searching = false;
      }, eventType);
    }
    updateAriaRegion() {
      this.resultsItems = this.resultsList.querySelectorAll(`.${this.resultClassName}[tabindex="-1"]`);
      if (this.ariaResult.length === 0) return;
      this.ariaResult[0].textContent = this.resultsItems.length;
    }
    resetSearch() {
      if (this.typeId) clearInterval(this.typeId);
      this.typeId = false;
    }
    navigateList(event) {
      const downArrow = event.key.toLowerCase() === 'arrowdown';
      const upArrow = event.key.toLowerCase() === 'arrowup';
      if (!downArrow && !upArrow) return;
      event.preventDefault();
      const selectedElement = document.activeElement.closest(`.${this.resultClassName}`) || document.activeElement;
      const index = Array.prototype.indexOf.call(this.resultsItems, selectedElement);
      const newIndex = this.getElementFocusbleIndex(index, downArrow);
      this.getListFocusableEl(newIndex).focus();
    }
    getElementFocusbleIndex(index, nextItem) {
      let newIndex = nextItem ? index + 1 : index - 1;
      if (newIndex < 0) newIndex = this.resultsItems.length - 1;
      if (newIndex >= this.resultsItems.length) newIndex = 0;
      if (!this.elementListIsFocusable(newIndex)) {
        return this.getElementFocusbleIndex(newIndex, nextItem);
      }
      return newIndex;
    }
    elementListIsFocusable(index) {
      const item = this.resultsItems[index];
      const role = item.getAttribute('role');
      if (role && role === 'presentation') {
        return false;
      }
      return true;
    }
    getListFocusableEl(index) {
      let newFocus = this.resultsItems[index];
      const focusable = newFocus.querySelector('button:not([disabled]), [href]');
      if (focusable.length > 0) {
        newFocus = focusable;
      }
      return newFocus;
    }
    selectResult(result, event) {
      if (!result) return;
      if (this.options.onClick) {
        this.options.onClick(result, this.element, event, () => {
          this.toggleOptionsList(false);
        });
      } else {
        this.input.value = this.getResultContent(result);
        this.toggleOptionsList(false);
      }
      this.inputVal = this.input.value;
    }
    getResultContent(result) {
      this.selectedLabelElement = result.querySelector('[data-autocomplete-label]');
      return this.selectedLabelElement ? this.selectedLabelElement.textContent : result.textContent;
    }
    populateResults(data, cb) {
      let innerHtml = '';
      data.forEach(item => {
        innerHtml += this.getItemHtml(item);
      });
      if (this.options.populate) this.resultsList.innerHTML = innerHtml;else if (cb) cb(innerHtml);
    }
    getItemHtml(data) {
      this.clone = this.getClone(data);
      this.clone.setAttribute('tabindex', '-1');
      Object.keys(data).forEach(key => {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          if (key === 'label') this.setLabel(data[key]);else if (key === 'class') this.setClass(data[key]);else if (key === 'url') this.setUrl(data[key]);else if (key === 'src') this.setSrc(data[key]);else this.setKey(key, data[key]);
        }
      });
      return this.clone.outerHTML;
    }
    getClone(data) {
      let item = false;
      if (this.templateItems.length === 1 || !data.template) {
        [item] = this.templateItems;
      } else {
        this.templateItems.forEach((templateItem, i) => {
          if (data.template === this.templates[i]) {
            item = templateItem;
          }
        });
        if (!item) [item] = this.templateItems;
      }
      return item.cloneNode(true);
    }
    setLabel(label) {
      const labelElement = this.clone.querySelector('[data-autocomplete-label]');
      if (labelElement) {
        labelElement.textContent = label;
      } else {
        this.clone.textContent = label;
      }
    }
    setClass(classList) {
      const classesArray = classList.split(' ');
      this.clone.classList.add(classesArray[0]);
      if (classesArray.length > 1) this.setClass(classesArray.slice(1).join(' '));
    }
    setUrl(url) {
      const linkElement = this.clone.querySelector('[data-autocomplete-url]');
      if (linkElement) linkElement.setAttribute('href', url);
    }
    setSrc(src) {
      const imgElement = this.clone.querySelector('[data-autocomplete-src]');
      if (imgElement) imgElement.setAttribute('src', src);
    }
    setKey(key, value) {
      const subElement = this.clone.querySelector(`[data-autocomplete-${key}]`);
      if (subElement) {
        if (subElement.hasAttribute('data-autocomplete-html')) subElement.innerHTML = value;else subElement.textContent = value;
      }
    }
  }

  class ExpandableSearch {
    constructor(element) {
      this.element = element;
      this.searchInput = this.element.querySelector('.js-search-input');
      this.buttons = this.element.querySelectorAll('.js-open-search');
      this.searchArea = this.element.querySelector('.js-search-area');
      this.hasContentClass = 'active';
    }
    init() {
      this.searchInput.addEventListener('input', event => {
        const input = event.target;
        if (input.value.length > 0) {
          input.classList.add(this.hasContentClass);
          input.setAttribute('aria-expanded', true);
        } else {
          input.classList.remove(this.hasContentClass);
          input.setAttribute('aria-expanded', false);
        }
      });

      // Mouse: navigate through to each suggestion on click
      this.buttons.forEach(btn => {
        btn.addEventListener('click', () => {
          if (this.searchInput.classList.contains(this.hasContentClass)) {
            this.searchArea.hidden = false;
            this.searchInput.focus();
          }
        });
      });

      // Keyboard: submit on Enter by navigating to the active suggestion (or first link)
      if (this.searchInput && this.searchArea) {
        this.searchInput.addEventListener('keydown', e => {
          if (e.key === 'Enter' && !e.shiftKey) {
            const activeLink = this.searchArea.querySelector('[aria-selected="true"] a[href], .is-active a[href], [data-selected="true"] a[href]');
            const firstLink = this.searchArea.querySelector('a[href]');
            const target = activeLink || firstLink;
            if (target && target.href) {
              e.preventDefault();
              window.location.assign(target.href);
            }
          }
        });
      }
    }
  }

  /* eslint-disable new-cap */
  /* eslint-disable no-undef */
  class DownloadPDF {
    constructor(element) {
      this.element = element;
      this.contentClass = this.element.getAttribute('data-pdf-content');
      this.content = this.contentClass ? document.querySelector(`.${this.contentClass}`) : document.body;
      this.name = this.element.getAttribute('data-pdf-title') || document.title;
      this.buttonText = this.element.querySelector('span:not(.nsw-material-icons)');
    }
    init() {
      this.element.addEventListener('click', () => {
        this.downloadEvent();
      });
      this.element.addEventListener('keyup', event => {
        if (event.code && event.code.toLowerCase() === 'enter' || event.key && event.key.toLowerCase() === 'enter') {
          this.downloadEvent();
        }
      });
    }
    downloadEvent() {
      const originalButtonText = this.buttonText.innerText;
      this.buttonText.innerText = 'Building PDF...';
      html2canvas(this.content).then(canvas => {
        const base64image = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'px', [canvas.width, canvas.height]);
        pdf.addImage(base64image, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`${this.name}.pdf`);
        this.buttonText.innerText = originalButtonText;
      }).catch(error => {
        console.error('An error occurred:', error);
        this.buttonText.innerText = originalButtonText;
      });
    }
  }

  /* eslint-disable max-len */
  class ColorSwatches {
    constructor(element, config) {
      if (element.dataset.initialised) {
        return;
      }
      element.dataset.initialised = 'true';
      this.element = element;
      this.variables = config.variables;
      this.palettes = config.palettes;
      this.dataTable = document.querySelector('.js-color-swatches__content');
      this.targetSelector = this.element.dataset.target || ':root';
      this.targetElement = document.querySelector(this.targetSelector);
      const [firstPalette] = Object.keys(this.palettes);
      const [firstColor] = Object.keys(this.palettes[firstPalette]).filter(key => key !== 'label');
      this.currentPalette = firstPalette;
      this.currentColor = firstColor;
      this.legend = this.element.querySelector('.js-color-swatches__color'); // Title element
      this.swatchList = null; // Swatch list container

      this.init();
    }

    // Initialise the color swatches
    init() {
      this.createColorSwatches(); // Creates the color swatch list first
      // Create the palette select dropdown before reading URL param
      this.paletteSelect = this.createPaletteSelector();
      // Move the select after the swatches
      this.swatchList.insertAdjacentElement('afterend', this.paletteSelect);
      // Now apply any palette from URL
      this.setPaletteFromURL();
      this.addEventListeners();
      this.updateCSSVariables();
      this.updateColorData();
      this.updateLegend();
    }

    // Creates palette selector (dropdown)
    createPaletteSelector() {
      const existingPaletteSelect = this.element.querySelector('.js-palette-selector');
      if (existingPaletteSelect) return existingPaletteSelect;
      const paletteSelect = document.createElement('select');
      paletteSelect.classList.add('js-palette-selector', 'nsw-form__select', 'nsw-color-swatches__palette-selector');
      Object.keys(this.palettes).forEach(palette => {
        const option = document.createElement('option');
        option.value = palette;
        // Use label from palette data if available
        const paletteMeta = this.palettes[palette];
        option.textContent = paletteMeta.label || this.constructor.formatLabel(palette);
        paletteSelect.appendChild(option);
      });
      return paletteSelect;
    }

    // Creates color swatches (clickable circles)
    createColorSwatches() {
      if (!this.swatchList) {
        this.swatchList = document.createElement('ul');
        this.swatchList.classList.add('nsw-color-swatches__list', 'js-color-swatches__list');
        this.swatchList.setAttribute('role', 'radiogroup');
        this.swatchList.setAttribute('aria-labelledby', this.legend && this.legend.id ? this.legend.id : 'color-swatches-title');
        this.element.appendChild(this.swatchList);
      } else {
        this.swatchList.innerHTML = ''; // Clear previous colors
      }
      Object.entries(this.palettes[this.currentPalette]).filter(([colorKey]) => colorKey !== 'label').forEach(([colorKey, colorData], index) => {
        const swatchItem = document.createElement('li');
        swatchItem.classList.add('nsw-color-swatches__item', 'js-color-swatches__item');
        if (index === 0) swatchItem.classList.add('nsw-color-swatches__item--selected'); // First one selected
        swatchItem.setAttribute('data-color', colorKey);
        swatchItem.setAttribute('role', 'radio');
        swatchItem.setAttribute('aria-checked', index === 0 ? 'true' : 'false');
        swatchItem.setAttribute('tabindex', index === 0 ? '0' : '-1');
        swatchItem.innerHTML = `
        <span class="nsw-color-swatches__option" tabindex="0">
          <span class="sr-only js-color-swatch__label">${this.constructor.formatLabel(colorKey)}</span>
          <span aria-hidden="true" style="background-color: ${colorData.val};" class="nsw-color-swatches__swatch"></span>
        </span>
      `;
        this.swatchList.appendChild(swatchItem);
      });
      return this.swatchList;
    }

    // Adds event listeners
    addEventListeners() {
      // Palette selection event
      this.paletteSelect.addEventListener('change', e => {
        this.currentPalette = e.target.value;
        const [firstColor] = Object.keys(this.palettes[this.currentPalette]).filter(key => key !== 'label');
        this.currentColor = firstColor; // Reset to first color
        this.createColorSwatches();
        this.updateURL();
        this.updateCSSVariables();
        this.updateColorData();
        this.updateLegend();
      });

      // Color swatches event
      this.element.addEventListener('click', e => {
        const swatch = e.target.closest('.js-color-swatches__item');
        if (!swatch) return;
        this.currentColor = swatch.getAttribute('data-color');
        this.updateSelectedSwatch(swatch);
        this.updateURL();
        this.updateCSSVariables();
        this.updateColorData();
        this.updateLegend();
      });

      // Keyboard interaction
      this.element.addEventListener('keydown', e => {
        const swatch = document.activeElement.closest('.js-color-swatches__item');
        if (!swatch) return;
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault(); // Prevent scrolling when pressing the space key
          this.currentColor = swatch.getAttribute('data-color');
          this.updateSelectedSwatch(swatch);
          this.updateCSSVariables();
          this.updateColorData();
          this.updateLegend();
        }
      });
      this.element.addEventListener('focusin', e => {
        const swatch = e.target.closest('.js-color-swatches__item');
        if (!swatch) return;

        // Ensure the swatch receives a visual focus style when navigated to
        this.updateSelectedSwatch(swatch);
      });
    }

    // Updates swatch selection
    updateSelectedSwatch(selectedSwatch) {
      this.swatchList.querySelectorAll('.js-color-swatches__item').forEach(swatch => {
        swatch.classList.remove('nsw-color-swatches__item--selected');
        swatch.setAttribute('aria-checked', 'false');
      });
      selectedSwatch.classList.add('nsw-color-swatches__item--selected');
      selectedSwatch.setAttribute('aria-checked', 'true');
    }

    // Updates CSS variables
    updateCSSVariables() {
      const selectedColors = this.palettes[this.currentPalette][this.currentColor];

      // Apply changes to correct scope (content-only or full-page)
      Object.keys(this.variables).forEach(key => {
        // unwrap label/value objects if present
        const entry = selectedColors[key];
        const colorValue = entry && typeof entry === 'object' && entry.value ? entry.value : entry;
        this.targetElement.style.setProperty(this.variables[key], colorValue);
      });
    }

    // Updates color data table
    updateColorData() {
      if (!this.dataTable) return;
      const selectedColors = this.palettes[this.currentPalette][this.currentColor];
      this.dataTable.innerHTML = Object.keys(this.variables).map(key => {
        // unwrap label/value objects if present
        const entry = selectedColors[key];
        const colorValue = entry && typeof entry === 'object' && entry.value ? entry.value : entry;
        const colorLabel = entry && typeof entry === 'object' && entry.label ? entry.label : '';
        return `
          <tr class="nsw-color-swatches__data">
            <td><div class="nsw-docs__swatch" style="background-color: var(${this.variables[key]})"></div></td>
            <td><p>${this.constructor.formatLabel(key)}</p></td>
            <td><p><code>${colorValue}</code>${colorLabel && `<br><p class='nsw-small nsw-m-top-xs nsw-m-bottom-xxs'>${colorLabel}`}</p></td>
            <td><p><code>${this.variables[key]}</code></p></td>
          </tr>`;
      }).join('');
    }

    // Updates legend (title)
    updateLegend() {
      if (this.legend) {
        this.legend.textContent = this.constructor.formatLabel(this.currentColor);
        this.legend.setAttribute('aria-live', 'polite');
      }
    }

    // Formats labels
    static formatLabel(text) {
      return text.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
    }

    // Sets palette and color from URL query parameters if provided
    setPaletteFromURL() {
      const params = new URLSearchParams(window.location.search);
      const paletteFromURL = params.get('palette');
      const colorFromURL = params.get('color');
      if (!paletteFromURL || !this.palettes[paletteFromURL]) return;
      this.currentPalette = paletteFromURL;
      const colors = Object.keys(this.palettes[this.currentPalette]).filter(key => key !== 'label');
      this.currentColor = colorFromURL && colors.includes(colorFromURL) ? colorFromURL : colors[0];
      if (this.paletteSelect) {
        this.paletteSelect.value = this.currentPalette;
      }
      this.createColorSwatches();
      const selectedSwatch = this.swatchList.querySelector(`[data-color="${this.currentColor}"]`);
      if (selectedSwatch) this.updateSelectedSwatch(selectedSwatch);
      this.updateCSSVariables();
      this.updateColorData();
      this.updateLegend();
    }

    // Updates the URL query string without reloading
    updateURL() {
      const params = new URLSearchParams(window.location.search);
      params.set('palette', this.currentPalette);
      params.set('color', this.currentColor);
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState({}, '', newUrl);
    }
  }

  // Prevent icon flash: hide icons until font loads
  document.documentElement.classList.add('material-icons-loading');
  function initDocs() {
    const codeButtons = document.querySelectorAll('.js-code-button');
    codeButtons.forEach(button => {
      const code = button.nextElementSibling;
      const text = button.querySelector('span');
      button.addEventListener('click', () => {
        if (code.classList.contains('active')) {
          button.classList.remove('active');
          code.classList.remove('active');
          text.textContent = 'Show code';
        } else {
          button.classList.add('active');
          code.classList.add('active');
          text.textContent = 'Hide code';
        }
      }, false);
    });
    const copyButtons = document.querySelectorAll('.js-code-copy');
    copyButtons.forEach(button => {
      const code = button.nextElementSibling;
      const text = button.querySelector('span');
      const script = code.querySelector('script');
      script.remove();
      button.addEventListener('click', () => {
        const elem = document.createElement('textarea');
        elem.value = code.innerHTML.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
        document.body.appendChild(elem);
        elem.select();
        document.execCommand('copy');
        text.textContent = 'Copied';
        document.body.removeChild(elem);
        setTimeout(() => {
          text.textContent = 'Copy';
        }, 2000);
      }, false);
    });
    const navLinks = document.querySelectorAll('.nsw-docs__nav a');
    let currentURL = window.location.pathname;
    if (currentURL === '/') currentURL = '/home/index.html';
    navLinks.forEach(link => {
      let linkURL = link.getAttribute('href');
      const sanitisedURL = new URL(linkURL, window.location.origin);
      linkURL = sanitisedURL.pathname + sanitisedURL.search + sanitisedURL.hash;
      if (linkURL === '/') linkURL = '/home/index.html';
      if (currentURL.match(linkURL)) {
        link.classList.add('current');
        if (link.closest('ul').classList.contains('nsw-main-nav__sub-list')) {
          const list = link.closest('.nsw-main-nav__sub-nav');
          const button = list.previousElementSibling;
          list.classList.add('current-section');
          button.classList.add('current-section');
          button.click();
        } else {
          link.classList.add('current-section');
        }
      }
    });
    const autoComplete = document.querySelectorAll('.js-autocomplete');
    if (autoComplete) {
      autoComplete.forEach(element => {
        new Autocomplete(element).init();
      });
    }
    const expandableSearch = document.querySelectorAll('.js-header');
    if (expandableSearch) {
      expandableSearch.forEach(element => {
        new ExpandableSearch(element).init();
      });
    }
    const downloadPDF = document.querySelectorAll('.js-download-page');
    if (downloadPDF) {
      downloadPDF.forEach(element => {
        new DownloadPDF(element).init();
      });
    }
    const colorConfig = {
      variables: {
        'brand-dark': '--nsw-brand-dark',
        'brand-light': '--nsw-brand-light',
        'brand-supplementary': '--nsw-brand-supplementary',
        'brand-accent': '--nsw-brand-accent',
        'brand-accent-light': '--nsw-brand-accent-light',
        'link-colour': '--nsw-link',
        'visited-link-colour': '--nsw-visited',
        'hover-background-colour': '--nsw-hover',
        'active-background-colour': '--nsw-active',
        focus: '--nsw-focus'
      },
      palettes: {
        default: {
          label: 'Default Palette',
          'Blue 01': {
            val: '#002664',
            'brand-dark': {
              label: 'Blue 01',
              value: '#002664'
            },
            'brand-light': {
              label: 'Blue 04',
              value: '#CBEDFD'
            },
            'brand-supplementary': {
              label: 'Blue 02',
              value: '#146CFD'
            },
            'brand-accent': {
              label: 'Red 02',
              value: '#D7153A'
            },
            'brand-accent-light': {
              label: 'Red 04',
              value: '#FFE6EA'
            },
            'link-colour': {
              label: 'Blue 01',
              value: '#002664'
            },
            'visited-link-colour': {
              label: '',
              value: '#551A8B'
            },
            'hover-background-colour': {
              label: '',
              value: 'rgba(0, 38, 100, 0.1)'
            },
            'active-background-colour': {
              label: '',
              value: 'rgba(0, 38, 100, 0.2)'
            },
            focus: {
              label: '',
              value: '#0086B3'
            }
          },
          'Purple 01': {
            val: '#441170',
            'brand-dark': {
              label: 'Purple 01',
              value: '#441170'
            },
            'brand-light': {
              label: 'Purple 04',
              value: '#E6E1FD'
            },
            'brand-supplementary': {
              label: 'Purple 02',
              value: '#8055F1'
            },
            'brand-accent': {
              label: 'Yellow 02',
              value: '#FAAF05'
            },
            'brand-accent-light': {
              label: 'Yellow 04',
              value: '#FFF4CF'
            },
            'link-colour': {
              label: 'Purple 01',
              value: '#441170'
            },
            'visited-link-colour': {
              label: '',
              value: '#70114D'
            },
            'hover-background-colour': {
              label: '',
              value: 'rgba(68, 17, 112, 0.1)'
            },
            'active-background-colour': {
              label: '',
              value: 'rgba(68, 17, 112, 0.2)'
            },
            focus: {
              label: '',
              value: '#351BB5'
            }
          },
          'Fuchsia 01': {
            val: '#65004D',
            'brand-dark': {
              label: 'Fuchsia 01',
              value: '#65004D'
            },
            'brand-light': {
              label: 'Fuchsia 04',
              value: '#F0E6ED'
            },
            'brand-supplementary': {
              label: 'Fuchsia 02',
              value: '#D912AE'
            },
            'brand-accent': {
              label: 'Orange 02',
              value: '#F3631B'
            },
            'brand-accent-light': {
              label: 'Orange 04',
              value: '#FDEDDF'
            },
            'link-colour': {
              label: 'Fuchsia 01',
              value: '#65004D'
            },
            'visited-link-colour': {
              label: '',
              value: '#983379'
            },
            'hover-background-colour': {
              label: '',
              value: 'rgba(101, 0, 77, 0.1)'
            },
            'active-background-colour': {
              label: '',
              value: 'rgba(101, 0, 77, 0.2)'
            },
            focus: {
              label: '',
              value: '#9D00B4'
            }
          },
          'Red 01': {
            val: '#630019',
            'brand-dark': {
              label: 'Red 01',
              value: '#630019'
            },
            'brand-light': {
              label: 'Red 04',
              value: '#FFE6EA'
            },
            'brand-supplementary': {
              label: 'Red 02',
              value: '#D7153A'
            },
            'brand-accent': {
              label: 'Brown 02',
              value: '#B68D5D'
            },
            'brand-accent-light': {
              label: 'Brown 04',
              value: '#EDE3D7'
            },
            'link-colour': {
              label: 'Red 01',
              value: '#630019'
            },
            'visited-link-colour': {
              label: '',
              value: '#9C3D1B'
            },
            'hover-background-colour': {
              label: '',
              value: 'rgba(99, 0, 25, 0.1)'
            },
            'active-background-colour': {
              label: '',
              value: 'rgba(99, 0, 25, 0.2)'
            },
            focus: {
              label: '',
              value: '#B2006E'
            }
          },
          'Orange 01': {
            val: '#941B00',
            'brand-dark': {
              label: 'Orange 01',
              value: '#941B00'
            },
            'brand-light': {
              label: 'Orange 04',
              value: '#FDEDDF'
            },
            'brand-supplementary': {
              label: 'Orange 02',
              value: '#F3631B'
            },
            'brand-accent': {
              label: 'Purple 02',
              value: '#8055F1'
            },
            'brand-accent-light': {
              label: 'Purple 04',
              value: '#E6E1FD'
            },
            'link-colour': {
              label: 'Orange 01',
              value: '#941B00'
            },
            'visited-link-colour': {
              label: '',
              value: '#7D4D27'
            },
            'hover-background-colour': {
              label: '',
              value: 'rgba(148, 27, 0, 0.1)'
            },
            'active-background-colour': {
              label: '',
              value: 'rgba(148, 27, 0, 0.2)'
            },
            focus: {
              label: '',
              value: '#E3002A'
            }
          },
          'Brown 01': {
            val: '#523719',
            'brand-dark': {
              label: 'Brown 01',
              value: '#523719'
            },
            'brand-light': {
              label: 'Brown 04',
              value: '#EDE3D7'
            },
            'brand-supplementary': {
              label: 'Brown 02',
              value: '#B68D5D'
            },
            'brand-accent': {
              label: 'Teal 02',
              value: '#2E808E'
            },
            'brand-accent-light': {
              label: 'Teal 04',
              value: '#D1EEEA'
            },
            'link-colour': {
              label: 'Brown 01',
              value: '#523719'
            },
            'visited-link-colour': {
              label: '',
              value: '#914132'
            },
            'hover-background-colour': {
              label: '',
              value: 'rgba(82, 55, 25, 0.1)'
            },
            'active-background-colour': {
              label: '',
              value: 'rgba(82, 55, 25, 0.2)'
            },
            focus: {
              label: '',
              value: '#8F3B2B'
            }
          },
          'Yellow 01': {
            val: '#694800',
            'brand-dark': {
              label: 'Yellow 01',
              value: '#694800'
            },
            'brand-light': {
              label: 'Yellow 04',
              value: '#FFF4CF'
            },
            'brand-supplementary': {
              label: 'Yellow 02',
              value: '#FAAF05'
            },
            'brand-accent': {
              label: 'Green 02',
              value: '#00AA45'
            },
            'brand-accent-light': {
              label: 'Green 04',
              value: '#DBFADF'
            },
            'link-colour': {
              label: 'Yellow 01',
              value: '#694800'
            },
            'visited-link-colour': {
              label: '',
              value: '#5B5A16'
            },
            'hover-background-colour': {
              label: '',
              value: 'rgba(105, 72, 0, 0.1)'
            },
            'active-background-colour': {
              label: '',
              value: 'rgba(105, 72, 0, 0.2)'
            },
            focus: {
              label: '',
              value: '#B83B00'
            }
          },
          'Green 01': {
            val: '#004000',
            'brand-dark': {
              label: 'Green 01',
              value: '#004000'
            },
            'brand-light': {
              label: 'Green 04',
              value: '#DBFADF'
            },
            'brand-supplementary': {
              label: 'Green 02',
              value: '#00AA45'
            },
            'brand-accent': {
              label: 'Blue 02',
              value: '#146CFD'
            },
            'brand-accent-light': {
              label: 'Blue 04',
              value: '#CBEDFD'
            },
            'link-colour': {
              label: 'Green 01',
              value: '#004000'
            },
            'visited-link-colour': {
              label: '',
              value: '#016740'
            },
            'hover-background-colour': {
              label: '',
              value: 'rgba(0, 64, 0, 0.1)'
            },
            'active-background-colour': {
              label: '',
              value: 'rgba(0, 64, 0, 0.2)'
            },
            focus: {
              label: '',
              value: '#348F00'
            }
          },
          'Teal 01': {
            val: '#0B3F47',
            'brand-dark': {
              label: 'Teal 01',
              value: '#0B3F47'
            },
            'brand-light': {
              label: 'Teal 04',
              value: '#D1EEEA'
            },
            'brand-supplementary': {
              label: 'Teal 02',
              value: '#2E808E'
            },
            'brand-accent': {
              label: 'Fuchsia 02',
              value: '#D912AE'
            },
            'brand-accent-light': {
              label: 'Fuchsia 04',
              value: '#FDDEF2'
            },
            'link-colour': {
              label: 'Teal 01',
              value: '#0B3F47'
            },
            'visited-link-colour': {
              label: '',
              value: '#265E76'
            },
            'hover-background-colour': {
              label: '',
              value: 'rgba(11, 63, 71, 0.1)'
            },
            'active-background-colour': {
              label: '',
              value: 'rgba(11, 63, 71, 0.2)'
            },
            focus: {
              label: '',
              value: '#168B70'
            }
          }
        },
        aboriginal: {
          label: 'Aboriginal Palette',
          'Earth-Red': {
            val: '#950906',
            'brand-dark': {
              label: 'Earth Red',
              value: '#950906'
            },
            'brand-light': {
              label: 'Galah Pink',
              value: '#FDD9D9'
            },
            'brand-supplementary': {
              label: 'Ember Red',
              value: '#E1261C'
            },
            'brand-accent': {
              label: 'Saltwater Blue',
              value: '#0D6791'
            },
            'brand-accent-light': {
              label: 'Coastal Blue',
              value: '#C1E2E8'
            },
            'link-colour': {
              label: 'Earth Red',
              value: '#950906'
            },
            'visited-link-colour': {
              label: 'Bush Plum',
              value: '#472642'
            },
            'hover-background-colour': {
              label: 'Earth Red',
              value: 'rgba(149, 9, 6, 0.1)'
            },
            'active-background-colour': {
              label: 'Earth Red',
              value: 'rgba(149, 9, 6, 0.2)'
            },
            focus: {
              label: 'Ember Red',
              value: '#E1261C'
            }
          },
          'Deep Orange': {
            val: '#882600',
            'brand-dark': {
              label: 'Deep Orange',
              value: '#882600'
            },
            'brand-light': {
              label: 'Sunset Orange',
              value: '#F9D4BE'
            },
            'brand-supplementary': {
              label: 'Orange Ochre',
              value: '#EE6314'
            },
            'brand-accent': {
              label: 'Saltwater Blue',
              value: '#0D6791'
            },
            'brand-accent-light': {
              label: 'Coastal Blue',
              value: '#C1E2E8'
            },
            'link-colour': {
              label: 'Deep Orange',
              value: '#882600'
            },
            'visited-link-colour': {
              label: 'Bush Plum',
              value: '#472642'
            },
            'hover-background-colour': {
              label: 'Deep Orange',
              value: 'rgba(136, 38, 0, 0.1)'
            },
            'active-background-colour': {
              label: 'Deep Orange',
              value: 'rgba(136, 38, 0, 0.2)'
            },
            focus: {
              label: 'Orange Ochre',
              value: '#EE6314'
            }
          },
          'Riverbed Brown': {
            val: '#552105',
            'brand-dark': {
              label: 'Riverbed Brown',
              value: '#552105'
            },
            'brand-light': {
              label: 'Macadamia Brown',
              value: '#E9C8B2'
            },
            'brand-supplementary': {
              label: 'Firewood Brown',
              value: '#9E5332'
            },
            'brand-accent': {
              label: 'Saltwater Blue',
              value: '#0D6791'
            },
            'brand-accent-light': {
              label: 'Coastal Blue',
              value: '#C1E2E8'
            },
            'link-colour': {
              label: 'Riverbed Brown',
              value: '#552105'
            },
            'visited-link-colour': {
              label: 'Spirit Lilac',
              value: '#9A5E93'
            },
            'hover-background-colour': {
              label: 'Riverbed Brown',
              value: 'rgba(85, 33, 5, 0.1)'
            },
            'active-background-colour': {
              label: 'Riverbed Brown',
              value: 'rgba(85, 33, 5, 0.2)'
            },
            focus: {
              label: 'Firewood Brown',
              value: '#9E5332'
            }
          },
          'Bush Honey Yellow': {
            val: '#895E00',
            'brand-dark': {
              label: 'Bush Honey Yellow',
              value: '#895E00'
            },
            'brand-light': {
              label: 'Sunbeam Yellow',
              value: '#FFF1C5'
            },
            'brand-supplementary': {
              label: 'Sandstone Yellow',
              value: '#FEA927'
            },
            'brand-accent': {
              label: 'Spirit Lilac',
              value: '#9A5E93'
            },
            'brand-accent-light': {
              label: 'Dusk Purple',
              value: '#E4CCE0'
            },
            'link-colour': {
              label: 'Bush Honey Yellow',
              value: '#895E00'
            },
            'visited-link-colour': {
              label: 'Bush Plum',
              value: '#472642'
            },
            'hover-background-colour': {
              label: 'Bush Honey Yellow',
              value: 'rgba(105, 72, 0, 0.1)'
            },
            'active-background-colour': {
              label: 'Bush Honey Yellow',
              value: 'rgba(105, 72, 0, 0.2)'
            },
            focus: {
              label: 'Saltwater Blue',
              value: '#0D6791'
            }
          },
          'Bushland Green': {
            val: '#215834',
            'brand-dark': {
              label: 'Bushland Green',
              value: '#215834'
            },
            'brand-light': {
              label: 'Saltbush Green',
              value: '#DAE6D1'
            },
            'brand-supplementary': {
              label: 'Marshland Lime',
              value: '#78A146'
            },
            'brand-accent': {
              label: 'Firewood Brown',
              value: '#9E5332'
            },
            'brand-accent-light': {
              label: 'Macadamia Brown',
              value: '#E9C8B2'
            },
            'link-colour': {
              label: 'Bushland Green',
              value: '#215834'
            },
            'visited-link-colour': {
              label: 'Bush Plum',
              value: '#472642'
            },
            'hover-background-colour': {
              label: 'Bushland Green',
              value: 'rgba(33, 88, 52, 0.1)'
            },
            'active-background-colour': {
              label: 'Bushland Green',
              value: 'rgba(33, 88, 52, 0.2)'
            },
            focus: {
              label: 'Marshland Lime',
              value: '#78A146'
            }
          },
          'Billabong Blue': {
            val: '#162953',
            'brand-dark': {
              label: 'Billabong Blue',
              value: '#00405E'
            },
            'brand-light': {
              label: 'Coastal Blue',
              value: '#C1E2E8'
            },
            'brand-supplementary': {
              label: 'Saltwater Blue',
              value: '#0D6791'
            },
            'brand-accent': {
              label: 'Orange Ochre',
              value: '#EE6314'
            },
            'brand-accent-light': {
              label: 'Sunset Orange',
              value: '#F9D4BE'
            },
            'link-colour': {
              label: 'Saltwater Blue',
              value: '#0D6791'
            },
            'visited-link-colour': {
              label: 'Spirit Lilac',
              value: '#9A5E93'
            },
            'hover-background-colour': {
              label: 'Billabong Blue',
              value: 'rgba(0, 64, 94, 0.1)'
            },
            'active-background-colour': {
              label: 'Billabong Blue',
              value: 'rgba(0, 64, 94, 0.2)'
            },
            focus: {
              label: 'Saltwater Blue',
              value: '#0D6791'
            }
          },
          'Bush Plum': {
            val: '#472642',
            'brand-dark': {
              label: 'Bush Plum',
              value: '#472642'
            },
            'brand-light': {
              label: 'Dusk Purple',
              value: '#E4CCE0'
            },
            'brand-supplementary': {
              label: 'Spirit Lilac',
              value: '#9A5E93'
            },
            'brand-accent': {
              label: 'Orange Ochre',
              value: '#EE6314'
            },
            'brand-accent-light': {
              label: 'Sunset Orange',
              value: '#F9D4BE'
            },
            'link-colour': {
              label: 'Bush Plum',
              value: '#472642'
            },
            'visited-link-colour': {
              label: 'Spirit Lilac',
              value: '#9A5E93'
            },
            'hover-background-colour': {
              label: 'Bush Plum',
              value: 'rgba(71, 38, 66, 0.1)'
            },
            'active-background-colour': {
              label: 'Bush Plum',
              value: 'rgba(71, 38, 66, 0.2)'
            },
            focus: {
              label: 'Orange Ochre',
              value: '#EE6314'
            }
          },
          'Charcoal Grey': {
            val: '#2D2D2D',
            'brand-dark': {
              label: 'Charcoal Grey',
              value: '#272727'
            },
            'brand-light': {
              label: 'Smoke Grey',
              value: '#E5E3E0'
            },
            'brand-supplementary': {
              label: 'Bush Honey Yellow',
              value: '#694800'
            },
            'brand-accent': {
              label: 'Sandstone Yellow',
              value: '#FEA927'
            },
            'brand-accent-light': {
              label: 'Sunbeam Yellow',
              value: '#FFF1C5'
            },
            'link-colour': {
              label: 'Charcoal Grey',
              value: '#272727'
            },
            'visited-link-colour': {
              label: 'Bush Plum',
              value: '#472642'
            },
            'hover-background-colour': {
              label: 'Charcoal Grey',
              value: 'rgba(39, 39, 39, 0.1)'
            },
            'active-background-colour': {
              label: 'Charcoal Grey',
              value: 'rgba(39, 39, 39, 0.2)'
            },
            focus: {
              label: 'Sandstone Yellow',
              value: '#FEA927'
            }
          }
        }
      }
    };

    // Partial theming (accent-only, updates brand-accent without affecting others)
    const accentConfig = {
      variables: {
        'brand-accent': '--nsw-brand-accent'
      },
      palettes: {
        'Default Palette': {
          'Blue 02': {
            val: '#146CFD',
            'brand-accent': '#146CFD'
          },
          'Purple 02': {
            val: '#8055F1',
            'brand-accent': '#8055F1'
          },
          'Fuchsia 02': {
            val: '#D912AE',
            'brand-accent': '#D912AE'
          },
          'Red 02': {
            val: '#D7153A',
            'brand-accent': '#D7153A'
          },
          'Orange 02': {
            val: '#F3631B',
            'brand-accent': '#F3631B'
          },
          'Brown 02': {
            val: '#B68D5D',
            'brand-accent': '#B68D5D'
          },
          'Yellow 02': {
            val: '#FAAF05',
            'brand-accent': '#FAAF05'
          },
          'Green 02': {
            val: '#00AA45',
            'brand-accent': '#00AA45'
          },
          'Teal 02': {
            val: '#2E808E',
            'brand-accent': '#2E808E'
          }
        },
        'Aboriginal Palette': {
          'Ember Red': {
            val: '#E1261C',
            'brand-accent': '#E1261C'
          },
          'Orange Ochre': {
            val: '#EE6314',
            'brand-accent': '#EE6314'
          },
          'Firewood Brown': {
            val: '#9E5332',
            'brand-accent': '#9E5332'
          },
          'Sandstone Yellow': {
            val: '#FEA927',
            'brand-accent': '#FEA927'
          },
          'Marshland Lime': {
            val: '#78A146',
            'brand-accent': '#78A146'
          },
          'Saltwater Blue': {
            val: '#0D6791',
            'brand-accent': '#0D6791'
          },
          'Spirit Lilac': {
            val: '#9A5E93',
            'brand-accent': '#9A5E93'
          },
          'Emu Grey': {
            val: '#555555',
            'brand-accent': '#555555'
          }
        }
      }
    };

    // Initialise Color Swatches for full-page and content-only pages
    document.querySelectorAll('.js-color-swatches').forEach(element => {
      new ColorSwatches(element, colorConfig).init();
    });

    // Initialise Color Swatches for partial re-theming (only updates brand-accent)
    document.querySelectorAll('.js-color-swatch[data-mode="accent-only"]').forEach(element => {
      new ColorSwatches(element, accentConfig).init();
    });
  }
  initDocs();

  // Show icons when Material Icons font is ready
  function handleIconsReady() {
    document.documentElement.classList.remove('material-icons-loading');
    document.documentElement.classList.add('material-icons-loaded');
  }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(handleIconsReady);
  } else {
    window.addEventListener('load', handleIconsReady);
  }

}));
