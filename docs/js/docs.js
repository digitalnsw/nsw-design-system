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
    keywords: 'ui, design, Toolbar',
    url: '/components/tabs/index.html'
  }, {
    label: 'Tags',
    template: 'result',
    keywords: 'badge, button, chip, marker, mark, identification, label, categorise',
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
      this.buttons.forEach(element => {
        element.addEventListener('click', () => {
          if (this.searchInput.classList.contains(this.hasContentClass)) {
            this.searchArea.hidden = false;
            this.searchInput.focus();
          }
        });
      });
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

  class ColorSwatches {
    constructor(element, opts) {
      this.element = element;
      this.options = opts;
      this.target = document.querySelectorAll(this.element.getAttribute('data-target') || 'body');
      this.selectedClass = 'nsw-color-swatches__item--selected';
      this.select = false;
      this.list = false;
      this.swatches = false;
      this.labels = false;
      this.selectedLabel = false;
      this.focusOutId = false;
      const [color] = Object.keys(this.options);
      this.color = color;
      this.dataTable = document.querySelector('.js-color-swatches__content');
      this.customAttrArray = false;
    }
    init() {
      this.target.forEach(element => {
        element.classList.add(this.color);
      });
      this.initOptions();
      this.initCustomSelect();
      this.createColorData();
      this.initEvents();
    }
    createColorData() {
      if (this.dataTable) {
        const data = this.options[this.color].content;
        let customContent = '';
        Object.keys(data).forEach(element => {
          customContent = `${customContent}
        <tr class="nsw-color-swatches__data"><td><div class="nsw-docs__swatch" style="background-color: var(${data[element].var})"></div></td>
        <td><p>${element}</p></td>               
        <td><p>${data[element].hex}</p></td>
        <td><p><code>${data[element].var}</code></p></td></tr>`;
        });
        this.dataTable.innerHTML = customContent;
      }
    }
    initOptions() {
      const select = this.element.querySelector('.js-color-swatches__select');
      if (!select) return;
      this.select = select;
      let customContent = '';
      Object.keys(this.options).forEach(element => {
        customContent = `${customContent}<option value="${this.options[element].val}" data-color="${element}" data-style="background-color: ${this.options[element].hex};">${this.options[element].val}</option>`;
      });
      this.select.innerHTML = customContent;
    }
    initCustomSelect() {
      if (this.select === false) return;
      let customContent = '';
      for (let i = 0; i < this.select.options.length; i += 1) {
        const ariaChecked = i === this.select.selectedIndex ? 'true' : 'false';
        const customClass = i === this.select.selectedIndex ? ` ${this.selectedClass}` : '';
        const customAttributes = this.getSwatchCustomAttr(this.select.options[i]);
        customContent = `${customContent}<li class="nsw-color-swatches__item js-color-swatches__item${customClass}" role="radio" aria-checked="${ariaChecked}" data-color="${this.select.options[i].getAttribute('data-color')}" data-value="${this.select.options[i].value}"><span class="js-color-swatches__option" tabindex="0"${customAttributes}><span class="sr-only js-color-swatch__label">${this.select.options[i].text}</span><span aria-hidden="true" style="${this.select.options[i].getAttribute('data-style')}" class="nsw-color-swatches__swatch"></span></span></li>`;
      }
      const list = document.createElement('ul');
      list.setAttribute('class', 'nsw-color-swatches__list js-color-swatches__list');
      list.setAttribute('role', 'radiogroup');
      list.innerHTML = customContent;
      this.element.insertBefore(list, this.select);
      this.select.classList.add('nsw-hide-xs');
      this.list = this.element.querySelector('.js-color-swatches__list');
      this.swatches = this.list.getElementsByClassName('js-color-swatches__option');
      this.labels = this.list.getElementsByClassName('js-color-swatch__label');
      this.selectedLabel = this.element.getElementsByClassName('js-color-swatches__color');
    }
    initEvents() {
      // detect focusin/focusout event - update selected color label
      if (this.list) {
        this.list.addEventListener('focusin', () => {
          if (this.focusOutId) clearTimeout(this.focusOutId);
          this.updateSelectedLabel(document.activeElement);
        });
        this.list.addEventListener('focusout', () => {
          this.focusOutId = setTimeout(() => {
            this.resetSelectedLabel();
          }, 200);
        });
      }

      // mouse move events
      for (let i = 0; i < this.swatches.length; i += 1) {
        this.handleHoverEvents(i);
      }

      // --select variation only
      if (this.select) {
        // click event - select new option
        this.list.addEventListener('click', event => {
          // update selected option
          this.resetSelectedOption(event.target);
        });

        // space key - select new option
        this.list.addEventListener('keydown', event => {
          if (event.keyCode && event.keyCode === 32 || event.key && event.key === ' ' || event.keyCode && event.keyCode === 13 || event.key && event.key.toLowerCase() === 'enter') {
            // update selected option
            this.resetSelectedOption(event.target);
          }
        });
      }
    }
    handleHoverEvents(index) {
      this.swatches[index].addEventListener('mouseenter', () => {
        this.updateSelectedLabel(this.swatches[index]);
      });
      this.swatches[index].addEventListener('mouseleave', () => {
        this.resetSelectedLabel();
      });
    }
    resetSelectedOption(target) {
      if (this.color) {
        this.target.forEach(element => {
          element.classList.remove(this.color);
        });
      }
      const option = target.closest('.js-color-swatches__item');
      this.color = option.getAttribute('data-color');
      if (!option) return;
      const selectedSwatch = this.list.querySelector(`.${this.selectedClass}`);
      if (selectedSwatch) {
        selectedSwatch.classList.remove(this.selectedClass);
        selectedSwatch.setAttribute('aria-checked', 'false');
      }
      option.classList.add(this.selectedClass);
      option.setAttribute('aria-checked', 'true');
      this.target.forEach(element => {
        element.classList.add(this.color);
      });
      // update select element
      this.updateNativeSelect(option.getAttribute('data-value'));
      this.createColorData();
    }
    resetSelectedLabel() {
      const selectedSwatch = this.list.getElementsByClassName(this.selectedClass);
      if (selectedSwatch.length > 0) this.updateSelectedLabel(selectedSwatch[0]);
    }
    updateSelectedLabel(swatch) {
      const newLabel = swatch.getElementsByClassName('js-color-swatch__label');
      if (newLabel.length === 0) return;
      this.selectedLabel[0].textContent = newLabel[0].textContent;
    }
    updateNativeSelect(value) {
      for (let i = 0; i < this.select.options.length; i += 1) {
        if (this.select.options[i].value === value) {
          this.select.selectedIndex = i; // set new value
          this.select.dispatchEvent(new CustomEvent('change')); // trigger change event
          break;
        }
      }
    }
    getSwatchCustomAttr(swatch) {
      this.customAttrArray = swatch.getAttribute('data-custom-attr');
      if (!this.customAttrArray) return '';
      let customAttr = ' ';
      const list = this.customAttrArray.split(',');
      for (let i = 0; i < list.length; i += 1) {
        const attr = list[i].split(':');
        customAttr = `${customAttr + attr[0].trim()}="${attr[1].trim()}" `;
      }
      return customAttr;
    }
  }

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
      button.addEventListener('click', event => {
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
    const options = {
      blue: {
        val: 'Blue 01',
        hex: '#002664',
        content: {
          'Brand Dark': {
            hex: 'Blue 01 <code>#002664</code>',
            var: '--nsw-brand-dark'
          },
          'Brand Light': {
            hex: 'Blue 04 <code>#CBEDFD</code>',
            var: '--nsw-brand-light'
          },
          'Brand Supplementary': {
            hex: 'Blue 02 <code>#146CFD</code>',
            var: '--nsw-brand-supplementary'
          },
          'Brand Accent': {
            hex: 'Red 02 <code>#D7153A</code>',
            var: '--nsw-brand-accent'
          },
          'Link colour': {
            hex: '<code>#002664</code>',
            var: '--nsw-link'
          },
          'Visited link colour': {
            hex: '<code>#551A8B</code>',
            var: '--nsw-visited'
          },
          'Hover background colour': {
            hex: '<code>rgba(0, 38, 100, 0.1)</code>',
            var: '--nsw-hover'
          },
          'Active background colour': {
            hex: '<code>rgba(0, 38, 100, 0.2)</code>',
            var: '--nsw-active'
          },
          'Focus outline colour': {
            hex: '<code>#0086B3</code>',
            var: '--nsw-focus'
          }
        }
      },
      purple: {
        val: 'Purple 01',
        hex: '#441170',
        content: {
          'Brand Dark': {
            hex: 'Purple 01 <code>#441170</code>',
            var: '--nsw-brand-dark'
          },
          'Brand Light': {
            hex: 'Purple 04 <code>#E6E1FD</code>',
            var: '--nsw-brand-light'
          },
          'Brand Supplementary': {
            hex: 'Purple 02 <code>#8055F1</code>',
            var: '--nsw-brand-supplementary'
          },
          'Brand Accent': {
            hex: 'Yellow 02 <code>#FAAF05</code>',
            var: '--nsw-brand-accent'
          },
          'Link colour': {
            hex: '<code>#441170</code>',
            var: '--nsw-link'
          },
          'Visited link colour': {
            hex: '<code>#70114D</code>',
            var: '--nsw-visited'
          },
          'Hover background colour': {
            hex: '<code>rgba(68, 17, 112, 0.1)</code>',
            var: '--nsw-hover'
          },
          'Active background colour': {
            hex: '<code>rgba(68, 17, 112, 0.2)</code>',
            var: '--nsw-active'
          },
          'Focus outline colour': {
            hex: '<code>#351BB5</code>',
            var: '--nsw-focus'
          }
        }
      },
      fuchsia: {
        val: 'Fuchsia 01',
        hex: '#65004D',
        content: {
          'Brand Dark': {
            hex: 'Fuchsia 01 <code>#65004D</code>',
            var: '--nsw-brand-dark'
          },
          'Brand Light': {
            hex: 'Fuchsia 04 <code>#F0E6ED</code>',
            var: '--nsw-brand-light'
          },
          'Brand Supplementary': {
            hex: 'Fuchsia 02 <code>#D912AE</code>',
            var: '--nsw-brand-supplementary'
          },
          'Brand Accent': {
            hex: 'Orange 02 <code>#F3631B</code>',
            var: '--nsw-brand-accent'
          },
          'Link colour': {
            hex: '<code>#65004D</code>',
            var: '--nsw-link'
          },
          'Visited link colour': {
            hex: '<code>#983379</code>',
            var: '--nsw-visited'
          },
          'Hover background colour': {
            hex: '<code>rgba(101, 0, 77, 0.1)</code>',
            var: '--nsw-hover'
          },
          'Active background colour': {
            hex: '<code>rgba(101, 0, 77, 0.2)</code>',
            var: '--nsw-active'
          },
          'Focus outline colour': {
            hex: '<code>#9D00B4</code>',
            var: '--nsw-focus'
          }
        }
      },
      red: {
        val: 'Red 01',
        hex: '#630019',
        content: {
          'Brand Dark': {
            hex: 'Red 01 <code>#630019</code>',
            var: '--nsw-brand-dark'
          },
          'Brand Light': {
            hex: 'Red 04 <code>#FFE6EA</code>',
            var: '--nsw-brand-light'
          },
          'Brand Supplementary': {
            hex: 'Red 02 <code>#D7153A</code>',
            var: '--nsw-brand-supplementary'
          },
          'Brand Accent': {
            hex: 'Brown 02 <code>#B68D5D</code>',
            var: '--nsw-brand-accent'
          },
          'Link colour': {
            hex: '<code>#630019</code>',
            var: '--nsw-link'
          },
          'Visited link colour': {
            hex: '<code>#9C3D1B</code>',
            var: '--nsw-visited'
          },
          'Hover background colour': {
            hex: '<code>rgba(99, 0, 25, 0.1)</code>',
            var: '--nsw-hover'
          },
          'Active background colour': {
            hex: '<code>rgba(99, 0, 25, 0.2)</code>',
            var: '--nsw-active'
          },
          'Focus outline colour': {
            hex: '<code>#B2006E</code>',
            var: '--nsw-focus'
          }
        }
      },
      orange: {
        val: 'Orange 01',
        hex: '#941B00',
        content: {
          'Brand Dark': {
            hex: 'Orange 01 <code>#941B00</code>',
            var: '--nsw-brand-dark'
          },
          'Brand Light': {
            hex: 'Orange 04 <code>#FDEDDF</code>',
            var: '--nsw-brand-light'
          },
          'Brand Supplementary': {
            hex: 'Orange 02 <code>#F3631B</code>',
            var: '--nsw-brand-supplementary'
          },
          'Brand Accent': {
            hex: 'Purple 02 <code>#8055F1</code>',
            var: '--nsw-brand-accent'
          },
          'Link colour': {
            hex: '<code>#941B00</code>',
            var: '--nsw-link'
          },
          'Visited link colour': {
            hex: '<code>#7D4D27</code>',
            var: '--nsw-visited'
          },
          'Hover background colour': {
            hex: '<code>rgba(148, 27, 0, 0.1)</code>',
            var: '--nsw-hover'
          },
          'Active background colour': {
            hex: '<code>rgba(148, 27, 0, 0.2)</code>',
            var: '--nsw-active'
          },
          'Focus outline colour': {
            hex: '<code>#E3002A</code>',
            var: '--nsw-focus'
          }
        }
      },
      brown: {
        val: 'Brown 01',
        hex: '#523719',
        content: {
          'Brand Dark': {
            hex: 'Brown 01 <code>#523719</code>',
            var: '--nsw-brand-dark'
          },
          'Brand Light': {
            hex: 'Brown 04 <code>#EDE3D7</code>',
            var: '--nsw-brand-light'
          },
          'Brand Supplementary': {
            hex: 'Brown 02 <code>#B68D5D</code>',
            var: '--nsw-brand-supplementary'
          },
          'Brand Accent': {
            hex: 'Teal 02 <code>#2E808E</code>',
            var: '--nsw-brand-accent'
          },
          'Link colour': {
            hex: '<code>#523719</code>',
            var: '--nsw-link'
          },
          'Visited link colour': {
            hex: '<code>#914132</code>',
            var: '--nsw-visited'
          },
          'Hover background colour': {
            hex: '<code>rgba(82, 55, 25, 0.1)</code>',
            var: '--nsw-hover'
          },
          'Active background colour': {
            hex: '<code>rgba(82, 55, 25, 0.2)</code>',
            var: '--nsw-active'
          },
          'Focus outline colour': {
            hex: '<code>#8F3B2B</code>',
            var: '--nsw-focus'
          }
        }
      },
      yellow: {
        val: 'Yellow 01',
        hex: '#694800',
        content: {
          'Brand Dark': {
            hex: 'Yellow 01 <code>#694800</code>',
            var: '--nsw-brand-dark'
          },
          'Brand Light': {
            hex: 'Yellow 04 <code>#FFF4CF</code>',
            var: '--nsw-brand-light'
          },
          'Brand Supplementary': {
            hex: 'Yellow 02 <code>#FAAF05</code>',
            var: '--nsw-brand-supplementary'
          },
          'Brand Accent': {
            hex: 'Green 02 <code>#00AA45</code>',
            var: '--nsw-brand-accent'
          },
          'Link colour': {
            hex: '<code>#694800</code>',
            var: '--nsw-link'
          },
          'Visited link colour': {
            hex: '<code>#5B5A16</code>',
            var: '--nsw-visited'
          },
          'Hover background colour': {
            hex: '<code>rgba(105, 72, 0, 0.1)</code>',
            var: '--nsw-hover'
          },
          'Active background colour': {
            hex: '<code>rgba(105, 72, 0, 0.2)</code>',
            var: '--nsw-active'
          },
          'Focus outline colour': {
            hex: '<code>#B83B00</code>',
            var: '--nsw-focus'
          }
        }
      },
      green: {
        val: 'Green 01',
        hex: '#004000',
        content: {
          'Brand Dark': {
            hex: 'Green 01 <code>#004000</code>',
            var: '--nsw-brand-dark'
          },
          'Brand Light': {
            hex: 'Green 04 <code>#DBFADF</code>',
            var: '--nsw-brand-light'
          },
          'Brand Supplementary': {
            hex: 'Green 02 <code>#00AA45</code>',
            var: '--nsw-brand-supplementary'
          },
          'Brand Accent': {
            hex: 'Blue 02 <code>#146CFD</code>',
            var: '--nsw-brand-accent'
          },
          'Link colour': {
            hex: '<code>#004000</code>',
            var: '--nsw-link'
          },
          'Visited link colour': {
            hex: '<code>#016740</code>',
            var: '--nsw-visited'
          },
          'Hover background colour': {
            hex: '<code>rgba(0, 64, 0, 0.1)</code>',
            var: '--nsw-hover'
          },
          'Active background colour': {
            hex: '<code>rgba(0, 64, 0, 0.2)</code>',
            var: '--nsw-active'
          },
          'Focus outline colour': {
            hex: '<code>#348F00</code>',
            var: '--nsw-focus'
          }
        }
      },
      teal: {
        val: 'Teal 01',
        hex: '#0B3F47',
        content: {
          'Brand Dark': {
            hex: 'Teal 01 <code>#0B3F47</code>',
            var: '--nsw-brand-dark'
          },
          'Brand Light': {
            hex: 'Teal 04 <code>#D1EEEA</code>',
            var: '--nsw-brand-light'
          },
          'Brand Supplementary': {
            hex: 'Teal 02 <code>#2E808E</code>',
            var: '--nsw-brand-supplementary'
          },
          'Brand Accent': {
            hex: 'Fuchsia 02 <code>#D912AE</code>',
            var: '--nsw-brand-accent'
          },
          'Link colour': {
            hex: '<code>#0B3F47</code>',
            var: '--nsw-link'
          },
          'Visited link colour': {
            hex: '<code>#265E76</code>',
            var: '--nsw-visited'
          },
          'Hover background colour': {
            hex: '<code>rgba(11, 63, 71, 0.1)</code>',
            var: '--nsw-hover'
          },
          'Active background colour': {
            hex: '<code>rgba(11, 63, 71, 0.2)</code>',
            var: '--nsw-active'
          },
          'Focus outline colour': {
            hex: '<code>#168B70</code>',
            var: '--nsw-focus'
          }
        }
      }
    };
    const colorSwatches = document.querySelectorAll('.js-color-swatches');
    if (colorSwatches) {
      colorSwatches.forEach(element => {
        new ColorSwatches(element, options).init();
      });
    }
    const partial = {
      'blue-accent': {
        val: 'Blue 02',
        hex: '#146CFD',
        content: {
          'Brand Accent': {
            hex: 'Blue 02 <code>#146CFD</code>',
            var: '--nsw-brand-accent'
          }
        }
      },
      'purple-accent': {
        val: 'Purple 01',
        hex: '#8055F1',
        content: {
          'Brand Accent': {
            hex: 'Purple 02 <code>#8055F1</code>',
            var: '--nsw-brand-accent'
          }
        }
      },
      'fuchsia-accent': {
        val: 'Fuchsia 02',
        hex: '#D912AE',
        content: {
          'Brand Accent': {
            hex: 'Fuchsia 02 <code>#D912AE</code>',
            var: '--nsw-brand-accent'
          }
        }
      },
      'red-accent': {
        val: 'Red 02',
        hex: '#D7153A',
        content: {
          'Brand Accent': {
            hex: 'Red 02 <code>#D7153A</code>',
            var: '--nsw-brand-accent'
          }
        }
      },
      'orange-accent': {
        val: 'Orange 02',
        hex: '#F3631B',
        content: {
          'Brand Accent': {
            hex: 'Orange 02 <code>#F3631B</code>',
            var: '--nsw-brand-accent'
          }
        }
      },
      'brown-accent': {
        val: 'Brown 02',
        hex: '#B68D5D',
        content: {
          'Brand Accent': {
            hex: 'Brown 02 <code>#B68D5D</code>',
            var: '--nsw-brand-accent'
          }
        }
      },
      'yellow-accent': {
        val: 'Yellow 02',
        hex: '#FAAF05',
        content: {
          'Brand Accent': {
            hex: 'Yellow 02 <code>#FAAF05</code>',
            var: '--nsw-brand-accent'
          }
        }
      },
      'green-accent': {
        val: 'Green 02',
        hex: '#00AA45',
        content: {
          'Brand Accent': {
            hex: 'Green 02 <code>#00AA45</code>',
            var: '--nsw-brand-accent'
          }
        }
      },
      'teal-accent': {
        val: 'Teal 02',
        hex: '#2E808E',
        content: {
          'Brand Accent': {
            hex: 'Teal 02 <code>#2E808E</code>',
            var: '--nsw-brand-accent'
          }
        }
      }
    };
    const colorSwatch = document.querySelectorAll('.js-color-swatch');
    if (colorSwatch) {
      colorSwatch.forEach(element => {
        new ColorSwatches(element, partial).init();
      });
    }
  }
  initDocs();

}));
