const searchValues = [
  {
    label: 'Accordion',
    template: 'result',
    keywords: 'show, hide, Collapse, Expand, expandable, vertical, panels',
    url: 'https://digitalnsw.github.io/nsw-design-system/components/accordion/index.html',
  },
  {
    label: 'Breadcrumbs',
    template: 'result',
    keywords: 'navigation, information architecture, IA',
    url: 'https://digitalnsw.github.io/nsw-design-system/components/breadcrumbs/index.html',
  },
  {
    label: 'Buttons',
    template: 'result',
    keywords: 'blue diamond, links, submit, call to action, transaction',
    url: 'https://digitalnsw.github.io/nsw-design-system/components/button/index.html',
  },
  {
    label: 'Callout',
    template: 'result',
    keywords: 'action, highlight, attention',
    url: 'https://digitalnsw.github.io/nsw-design-system/components/callout/index.html',
  },
  {
    label: 'Cards',
    template: 'result',
    keywords: 'Highlight, Content, images, links, summary, related content, navigation',
    url: 'https://digitalnsw.github.io/nsw-design-system/components/card/index.html',
  },
  {
    label: 'Content blocks',
    template: 'result',
    keywords: 'columns, links, content',
    url: 'https://digitalnsw.github.io/nsw-design-system/components/content-block/index.html',
  },
  {
    label: 'Dialog',
    template: 'result',
    keywords: 'modal, window, alert, message, action, information, notification, required, response, Transactional, single, call to action, Danger, Dismissible',
    url: 'https://digitalnsw.github.io/nsw-design-system/components/dialog/index.html',
  },
  {
    label: 'Filters',
    template: 'result',
    keywords: 'results, data, refine',
    url: 'https://digitalnsw.github.io/nsw-design-system/components/filters/index.html',
  },
  {
    label: 'Footer',
    template: 'result',
    keywords: 'links, copyright, blue diamond, social, privacy, contact',
    url: 'https://digitalnsw.github.io/nsw-design-system/components/footer/index.html',
  },
  {
    label: 'Forms',
    template: 'result',
    keywords: 'data, input, field, Freeform, Selection, label, checkbox, Dropdown, radio, list, Validation, help text, placeholder, autofill, autocorrect, blue diamond',
    url: 'https://digitalnsw.github.io/nsw-design-system/components/form/index.html',
  },
  {
    label: 'Global alert',
    template: 'result',
    keywords: 'attention, important, critical',
    url: 'https://digitalnsw.github.io/nsw-design-system/components/global-alert/index.html',
  },
  {
    label: 'Header',
    template: 'result',
    keywords: 'logo, site descriptors, Search, masthead, blue diamond',
    url: 'https://digitalnsw.github.io/nsw-design-system/components/header/index.html',
  },
  {
    label: 'Hero banner',
    template: 'result',
    keywords: 'landing page, homepage',
    url: 'https://digitalnsw.github.io/nsw-design-system/components/hero-banner/index.html',
  },
  {
    label: 'Hero search',
    template: 'result',
    keywords: '',
    url: 'https://digitalnsw.github.io/nsw-design-system/components/hero-search/index.html',
  },
  {
    label: 'In-page alert',
    template: 'result',
    keywords: '',
    url: 'https://digitalnsw.github.io/nsw-design-system/components/in-page-alert/index.html',
  },
  {
    label: 'In-page navigation',
    template: 'result',
    keywords: 'table of contents, anchor, links',
    url: 'https://digitalnsw.github.io/nsw-design-system/components/in-page-nav/index.html',
  },
  {
    label: 'Link list',
    template: 'result',
    keywords: '',
    url: 'https://digitalnsw.github.io/nsw-design-system/components/link-list/index.html',
  },
  {
    label: 'List items',
    template: 'result',
    keywords: '',
    url: 'https://digitalnsw.github.io/nsw-design-system/components/list-item/index.html',
  },
  {
    label: 'Main navigation',
    template: 'result',
    keywords: 'information, architecture, IA, orientate, Mega, menu, navigation, top level, Search, off-canvas, animation, slide-in, Offcanvas',
    url: 'https://digitalnsw.github.io/nsw-design-system/components/main-nav/index.html',
  },
  {
    label: 'Masthead',
    template: 'result',
    keywords: 'topbar, Top, bar, blue diamond, alert',
    url: 'https://digitalnsw.github.io/nsw-design-system/components/masthead/index.html',
  },
  {
    label: 'Media',
    template: 'result',
    keywords: 'visual, elements, images, video, Captions, figure, figcaption',
    url: 'https://digitalnsw.github.io/nsw-design-system/components/media/index.html',
  },
  {
    label: 'Pagination',
    template: 'result',
    keywords: 'total, navigation, listing',
    url: 'https://digitalnsw.github.io/nsw-design-system/components/pagination/index.html',
  },
  {
    label: 'Progress Indicator',
    template: 'result',
    keywords: 'step',
    url: 'https://digitalnsw.github.io/nsw-design-system/components/progress-indicator/index.html',
  },
  {
    label: 'Results bar',
    template: 'result',
    keywords: 'list, sort, counter, filter',
    url: 'https://digitalnsw.github.io/nsw-design-system/components/results-bar/index.html',
  },
  {
    label: 'Side navigation',
    template: 'result',
    keywords: 'hierarchy, Single, Multiple, level, nesting, nav',
    url: 'https://digitalnsw.github.io/nsw-design-system/components/side-nav/index.html',
  },
  {
    label: 'Steps',
    template: 'result',
    keywords: 'Steps, stages, timeline, wizard, sequences, Sequential',
    url: 'https://digitalnsw.github.io/nsw-design-system/components/steps/index.html',
  },
  {
    label: 'Tables',
    template: 'result',
    keywords: 'data, rows, columns, scan, sort, compare, information, Horizontal lined, Stripped, Bordered, Stripe, Border',
    url: 'https://digitalnsw.github.io/nsw-design-system/components/table/index.html',
  },
  {
    label: 'Tabs',
    template: 'result',
    keywords: 'ui, design, Toolbar',
    url: 'https://digitalnsw.github.io/nsw-design-system/components/tabs/index.html',
  },
  {
    label: 'Tags',
    template: 'result',
    keywords: 'badge, button, chip, marker, mark, identification, label, categorise',
    url: 'https://digitalnsw.github.io/nsw-design-system/components/tag/index.html',
  },
  {
    label: 'Logo',
    template: 'result',
    keywords: 'Branding, visual, representation, Primary Logo, Usage and placement, Clear space, Sizing, Masterbrand, Co-brand, Endorsed, Independent, blue diamond',
    url: 'https://digitalnsw.github.io/nsw-design-system/core/logo/index.html',
  },
  {
    label: 'Colour',
    template: 'result',
    keywords: 'consistent, visual, identify, digital, base, theme, Brand, colours, Grey, Text, Status, palette, dark, light, brand, supplementary, accent, blue diamond',
    url: 'https://digitalnsw.github.io/nsw-design-system/core/colour/index.html',
  },
  {
    label: 'Typography',
    template: 'result',
    keywords: 'font, headings, body text, lists, paragraphs, styles, Public Sans, font stack, CSS, Links, Blockquote, Unordered, Ordered, Definition, blue diamond',
    url: 'https://digitalnsw.github.io/nsw-design-system/core/typography/index.html',
  },
  {
    label: 'Iconography',
    template: 'result',
    keywords: 'Icons, illustrate, actions, communicate, status, interaction, attention, information, Usage, Styling, Application, Designing, Accessibility, Text, Button, Colour, Sizing, Spacing, Material Design, SVG, scalable vector graphics, rotation, blue diamond',
    url: 'https://digitalnsw.github.io/nsw-design-system/core/iconography/index.html',
  },
  {
    label: 'Pictograms',
    template: 'result',
    keywords: 'word, simple, clean, illustration, idea, Usage, Styling, Designing, SVG, utility classes, Styling, Brand, blue diamond',
    url: 'https://digitalnsw.github.io/nsw-design-system/core/pictograms/index.html',
  },
  {
    label: 'Grid',
    template: 'result',
    keywords: 'Breakpoints, Content, 12 column, responsive, viewport, Token, Container, fixed, Gutters, Max active content, area, layouts, Whole, Half, Third, Quarter, Offset, grids',
    url: 'https://digitalnsw.github.io/nsw-design-system/core/grid/index.html',
  },
  {
    label: 'Layout',
    template: 'result',
    keywords: 'Page, layouts, standard, Full width, Two column, Left, Right, Usage, Main, content, desktop, viewport',
    url: 'https://digitalnsw.github.io/nsw-design-system/core/layout/index.html',
  },
  {
    label: 'Section',
    template: 'result',
    keywords: 'Flexible, layout, component, content, consistent, vertical, spacing, Usage, style, container, Image, Box, Colour, Inverted, colours, dark background',
    url: 'https://digitalnsw.github.io/nsw-design-system/core/section/index.html',
  },
  {
    label: 'Graphic elements',
    template: 'result',
    keywords: 'Logo positioning, details, hierarchy, interactions, digital branding, brand, Border radius, Drop shadow, Application, Line System, Examples,  tabs, card, in-page navigation, blue diamond',
    url: 'https://digitalnsw.github.io/nsw-design-system/core/graphic-elements/index.html',
  },
  {
    label: 'Search & Filters',
    template: 'result',
    keywords: 'explore, keywords, phrases, find, results, Predictive, suggestions, autocomplete',
    url: 'https://digitalnsw.github.io/nsw-design-system/docs/content/methods/search.html',
  },
  {
    label: 'Maps',
    template: 'result',
    keywords: 'Markers, Mapbox, MapMarker.io, leaflet.js, location, pin',
    url: 'https://digitalnsw.github.io/nsw-design-system/docs/content/methods/maps.html',
  },
  {
    label: 'Data visualisation',
    template: 'result',
    keywords: 'Comparison, data, trends, Display, statistics, Processes, workflows, Mapping, diagramming, Colours, theming, charts.js, charts, graphs, Screen readers',
    url: 'https://digitalnsw.github.io/nsw-design-system/docs/content/methods/data-visualisation.html',
  },
  {
    label: 'You are here',
    template: 'result',
    keywords: 'Where am I, Where can I go, Who is speaking, orientate, Breadcrumbs, Hero banner, Typography, hierarchy, navigation, Main navigation, Side navigation',
    url: 'https://digitalnsw.github.io/nsw-design-system/docs/content/methods/you-are-here.html',
  },
  {
    label: 'Templates',
    template: 'result',
    keywords: 'Homepage, Content, Search, Sample, Example, Hero banner, Featured list, Hero search, Simple, Filters, No results, Side navigation, Article, Filters, Form, Maps, Location, primary, sub filters, Equal value filters, Theming, Masterbrand,Full page, Content, Partial',
    url: 'https://digitalnsw.github.io/nsw-design-system/templates/index.html',
  },
  {
    label: 'What is Design System',
    template: 'result',
    keywords: 'Benefits, Build faster and at scale, brand and accessibility compliance, Consistent code and design language, Quality across all layers, Support, Questions, Report issues, Issues tracker, Report a bug',
    url: 'https://digitalnsw.github.io/nsw-design-system/docs/content/about/what-is-design-system.html',
  },
  {
    label: 'Supporting different roles',
    template: 'result',
    keywords: 'Product Managers, Designers, Developers, UI, UX',
    url: 'https://digitalnsw.github.io/nsw-design-system/docs/content/about/supporting-different-roles.html',
  },
  {
    label: 'Our ecosystem',
    template: 'result',
    keywords: 'Digital Visual Identity, Core styles and components, Digital NSW Community, Built in accessibility, UX, content guidance, UI, code starter kits',
    url: 'https://digitalnsw.github.io/nsw-design-system/docs/content/about/our-ecosystem.html',
  },
  {
    label: "What's happening",
    template: 'result',
    keywords: 'Releases, Work in progress, Consulting with community, Backlog, Changelog, changed, Version, Change logs',
    url: 'https://digitalnsw.github.io/nsw-design-system/docs/content/about/whats-happening.html',
  },
  {
    label: 'Getting Started',
    template: 'result',
    keywords: 'Core styles, Base components, UX Guidance, First steps',
    url: 'https://digitalnsw.github.io/nsw-design-system/docs/content/design/getting-started.html',
  },
  {
    label: 'Figma UI Kit',
    template: 'result',
    keywords: 'guides, video tutorials, file, UI, Design',
    url: 'https://digitalnsw.github.io/nsw-design-system/docs/content/design/figma-ui-kit.html',
  },
  {
    label: 'Extending',
    template: 'result',
    keywords: 'core elements, create, consistent, building, accessible, Core styles, Components, UX Guidance, Contributing, customise, custom, unique, adapt, adapting',
    url: 'https://digitalnsw.github.io/nsw-design-system/docs/content/design/extending.html',
  },
  {
    label: 'Design Theming',
    template: 'result',
    keywords: 'colours, consistent, branding, colour palette, Dark, Light, Brand, Supplementary, Accent, non corporate, cobrand, Masterbrand corporate, non-corporate, co-brand, independent',
    url: 'https://digitalnsw.github.io/nsw-design-system/docs/content/design/theming.html',
  },
  {
    label: 'Guides',
    template: 'result',
    keywords: 'Using the design system, Designing, Collaborating, Prototyping, Guidance, ',
    url: 'https://digitalnsw.github.io/nsw-design-system/docs/content/design/guides.html',
  },
  {
    label: 'Getting Started',
    template: 'result',
    keywords: 'npm, CDN, starter kit, Installing, Import styles, Core and selected components, Public Sans, Material Icons, Node, SASS, base theme, typography, mixins, functions, javascript, JSDelivr, Browser support, starter kit',
    url: 'https://digitalnsw.github.io/nsw-design-system/docs/content/develop/getting-started.html',
  },
  {
    label: 'Develop Theming',
    template: 'result',
    keywords: 'customisation, branding, CSS Variables, Full page, Content only, Partial, brand',
    url: 'https://digitalnsw.github.io/nsw-design-system/docs/content/develop/theming.html',
  },
  {
    label: 'Background Utility Classes',
    template: 'result',
    keywords: 'Background colour, Opacity, Hover state, color',
    url: 'https://digitalnsw.github.io/nsw-design-system/docs/content/utilities/background.html',
  },
  {
    label: 'Border Utility Classes',
    template: 'result',
    keywords: 'Border radius, width, style, color, borders',
    url: 'https://digitalnsw.github.io/nsw-design-system/docs/content/utilities/borders.html',
  },
  {
    label: 'Box Shadow Utility Class',
    template: 'result',
    keywords: 'Box Shadow, box-shadow, shadow',
    url: 'https://digitalnsw.github.io/nsw-design-system/docs/content/utilities/box-shadow.html',
  },
  {
    label: 'Display Utility Classes',
    template: 'result',
    keywords: 'display, inline, inline-block, block, grid, inline-grid, flex, inline-flex, hide, show',
    url: 'https://digitalnsw.github.io/nsw-design-system/docs/content/utilities/displayu.html',
  },
  {
    label: 'Flex Utility Classes',
    template: 'result',
    keywords: 'Flex, Direction, Justify content, Align items, Align self, Fill, Grow, shrink, Wrap, Order, content',
    url: 'https://digitalnsw.github.io/nsw-design-system/docs/content/utilities/flex.html',
  },
  {
    label: 'Float Utility Classes',
    template: 'result',
    keywords: 'Float, wrapping, ',
    url: 'https://digitalnsw.github.io/nsw-design-system/docs/content/utilities/float.html',
  },
  {
    label: 'Overflow Utility Classes',
    template: 'result',
    keywords: 'Overflow, auto, hidden, visible, scroll',
    url: 'https://digitalnsw.github.io/nsw-design-system/docs/content/utilities/overflow.html',
  },
  {
    label: 'Position Utility Classes',
    template: 'result',
    keywords: 'Position, static, relative, absolute, fixed, sticky',
    url: 'https://digitalnsw.github.io/nsw-design-system/docs/content/utilities/position.html',
  },
  {
    label: 'Spacing',
    template: 'result',
    keywords: 'Responsive, units, alignment, consistent, 8-pixel grid, Spacing token, Helper classes, margin, padding, banner',
    url: 'https://digitalnsw.github.io/nsw-design-system/docs/content/utilities/spacing.html',
  },
  {
    label: 'SVG Utility Classes',
    template: 'result',
    keywords: 'SVG, fill, stroke, stroke width, icons, pictograms',
    url: 'https://digitalnsw.github.io/nsw-design-system/docs/content/utilities/svg.html',
  },
  {
    label: 'Text Utility Classes',
    template: 'result',
    keywords: 'Text, alignment, wrapping, font, weight, overflow, colour',
    url: 'https://digitalnsw.github.io/nsw-design-system/docs/content/utilities/text.html',
  },
  {
    label: 'Vertical alignment Utility Classes',
    template: 'result',
    keywords: 'Vertical align, alignment, inline, inline-block, inline-table, table, baseline, top, middle, bottom, text-bottom, text-top',
    url: 'https://digitalnsw.github.io/nsw-design-system/docs/content/utilities/vertical-align.html',
  },
  {
    label: 'Visibility Utility Classes',
    template: 'result',
    keywords: 'Visibility, show, hide',
    url: 'https://digitalnsw.github.io/nsw-design-system/docs/content/utilities/visibility.html',
  },
  {
    label: 'Z-index Classes',
    template: 'result',
    keywords: 'Z-index, stack order, three-dimensional, positioning, 3D',
    url: 'https://digitalnsw.github.io/nsw-design-system/docs/content/utilities/z-index.html',
  },
  {
    label: 'Close button',
    template: 'result',
    keywords: 'Dialog, Global Alert, dismiss, icon, button',
    url: 'https://digitalnsw.github.io/nsw-design-system/components/close-button/index.html',
  },
  {
    label: 'Popover',
    template: 'result',
    keywords: 'tooltips, toggletip, dropdown, menu',
    url: 'https://digitalnsw.github.io/nsw-design-system/components/popover/index.html',
  },
];

const defaults = {
  debounce: 200,
  characters: 1,
  populate: true,
  searchData(query, cb, eventType) {
    let data = searchValues.filter((item) => item.label.toLowerCase().includes(query.toLowerCase())
    || item.keywords.toLowerCase().includes(query.toLowerCase()));

    if (data.length === 0) { // fallback for no results found
      data = [{
        label: 'No results',
        template: 'no-results',
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
  },
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
    this.input.addEventListener('keyup', (event) => {
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
        return
      }
      this.updateSearch(true);
    });

    this.input.addEventListener('blur', (event) => {
      this.checkFocusLost(event);
    });

    this.resultsList.addEventListener('keydown', (event) => {
      this.navigateList(event);
    });

    this.resultsList.addEventListener('focusout', (event) => {
      this.checkFocusLost(event);
    });

    window.addEventListener('keyup', (event) => {
      if (event.key && event.key.toLowerCase() === 'escape') {
        this.toggleOptionsList(false);
      } else if (event.key && event.key.toLowerCase() === 'enter') {
        this.selectResult(document.activeElement.closest(`.${this.resultClassName}`), event);
      }
    });

    this.resultsList.addEventListener('click', (event) => {
      this.selectResult(event.target.closest(`.${this.resultClassName}`), event);
    });
  }

  checkFocusLost(event) {
    if (this.element.contains(event.relatedTarget)) return
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
    if (!this.element.classList.contains(this.dropdownActiveClass)) return
    this.resetSearch();
    let index = 0;
    if (!this.elementListIsFocusable(index)) {
      index = this.getElementFocusbleIndex(index, true);
    }
    this.getListFocusableEl(index).focus();
  }

  updateSearch(bool) {
    const inputValue = this.input.value;
    if (inputValue === this.inputVal && !bool) return
    this.inputVal = inputValue;
    if (this.typeId) clearInterval(this.typeId);
    if (this.inputVal.length < this.options.characters) {
      this.toggleOptionsList(false);
      return
    }
    if (bool) {
      this.updateResultsList('focus');
      return
    }
    this.typeId = setTimeout(() => {
      this.updateResultsList('type');
    }, this.options.debounce);
  }

  toggleOptionsList(bool) {
    if (bool) {
      if (this.element.classList.contains(this.dropdownActiveClass)) return
      this.element.classList.add(this.dropdownActiveClass);
      this.input.setAttribute('aria-expanded', true);
      this.truncateAutocompleteList();
    } else {
      if (!this.element.classList.contains(this.dropdownActiveClass)) return
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
    if (!this.truncateDropdown) return
    // reset max height
    this.resultsList.style.maxHeight = '';
    // check available space
    const spaceBelow = (window.innerHeight - this.input.getBoundingClientRect().bottom - 10);
    const maxHeight = parseInt(this.getComputedStyle(this.resultsList).maxHeight, 10);

    if (maxHeight > spaceBelow) {
      this.resultsList.style.maxHeight = `${spaceBelow}px`;
    } else {
      this.resultsList.style.maxHeight = '';
    }
  }

  updateResultsList(eventType) {
    if (this.searching) return
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
    if (this.ariaResult.length === 0) return
    this.ariaResult[0].textContent = this.resultsItems.length;
  }

  resetSearch() {
    if (this.typeId) clearInterval(this.typeId);
    this.typeId = false;
  }

  navigateList(event) {
    const downArrow = (event.key.toLowerCase() === 'arrowdown');
    const upArrow = (event.key.toLowerCase() === 'arrowup');
    if (!downArrow && !upArrow) return
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
      return this.getElementFocusbleIndex(newIndex, nextItem)
    }
    return newIndex
  }

  elementListIsFocusable(index) {
    const item = this.resultsItems[index];
    const role = item.getAttribute('role');
    if (role && role === 'presentation') {
      return false
    }
    return true
  }

  getListFocusableEl(index) {
    let newFocus = this.resultsItems[index];
    const focusable = newFocus.querySelector('button:not([disabled]), [href]');
    if (focusable.length > 0) {
      newFocus = focusable;
    }
    return newFocus
  }

  selectResult(result, event) {
    if (!result) return
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
    return this.selectedLabelElement ? this.selectedLabelElement.textContent : result.textContent
  }

  populateResults(data, cb) {
    let innerHtml = '';

    data.forEach((item) => {
      innerHtml += this.getItemHtml(item);
    });

    if (this.options.populate) this.resultsList.innerHTML = innerHtml;
    else if (cb) cb(innerHtml);
  }

  getItemHtml(data) {
    this.clone = this.getClone(data);
    this.clone.setAttribute('tabindex', '-1');

    Object.keys(data).forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        if (key === 'label') this.setLabel(data[key]);
        else if (key === 'class') this.setClass(data[key]);
        else if (key === 'url') this.setUrl(data[key]);
        else if (key === 'src') this.setSrc(data[key]);
        else this.setKey(key, data[key]);
      }
    });

    return this.clone.outerHTML
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
    return item.cloneNode(true)
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
      if (subElement.hasAttribute('data-autocomplete-html')) subElement.innerHTML = value;
      else subElement.textContent = value;
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
    this.searchInput.addEventListener('input', (event) => {
      const input = event.target;
      if (input.value.length > 0) {
        input.classList.add(this.hasContentClass);
        input.setAttribute('aria-expanded', true);
      } else {
        input.classList.remove(this.hasContentClass);
        input.setAttribute('aria-expanded', false);
      }
    });

    this.buttons.forEach((element) => {
      element.addEventListener('click', () => {
        if (this.searchInput.classList.contains(this.hasContentClass)) {
          this.searchArea.hidden = false;
          this.searchInput.focus();
        }
      });
    });
  }
}

function initDocs() {
  const codeButtons = document.querySelectorAll('.js-code-button');

  codeButtons.forEach((button) => {
    const code = button.nextElementSibling;
    const text = button.querySelector('span');

    button.addEventListener('click', (event) => {
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

  copyButtons.forEach((button) => {
    const code = button.nextElementSibling;
    const text = button.querySelector('span');
    const script = code.querySelector('script');

    script.remove();

    button.addEventListener('click', (event) => {
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

  if (currentURL === '/' || currentURL === '/nsw-design-system/') currentURL = '/home/index.html';

  navLinks.forEach((link) => {
    let linkURL = link.getAttribute('href');
    if (linkURL == '/' || linkURL == '/nsw-design-system/') linkURL = '/home/index.html';

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
    autoComplete.forEach((element) => {
      new Autocomplete(element).init();
    });
  }

  const expandableSearch = document.querySelectorAll('.js-header');

  if (expandableSearch) {
    expandableSearch.forEach((element) => {
      new ExpandableSearch(element).init();
    });
  }
}

initDocs();
