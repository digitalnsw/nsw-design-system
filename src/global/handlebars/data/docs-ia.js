const FOUNDATION_GROUPS = [
  {
    id: 'brand',
    title: 'Brand',
    aliases: ['Core styles', 'Visual identity'],
    items: [
      'Logo',
      'Colour',
      'Typography',
      'Iconography',
      'Pictograms',
      'Graphic elements',
    ],
  },
  {
    id: 'layout',
    title: 'Layout',
    aliases: ['Structure'],
    items: [
      'Grid',
      'Page layout',
      'Section',
    ],
  },
]

const COMPONENT_GROUPS = [
  {
    id: 'actions-and-controls',
    title: 'Actions and controls',
    description: 'Components that let users initiate actions and control an interface.',
    image: '/assets/images/card-actions.png',
    aliases: ['Actions', 'Controls'],
    items: [
      'Buttons',
      'Close button',
      'Link',
      'Quick exit',
    ],
  },
  {
    id: 'forms-and-input',
    title: 'Forms and input',
    description: 'Components that collect, select and validate information from users.',
    image: '/assets/images/card-forms.png',
    aliases: ['Forms', 'Input'],
    items: [
      'Forms',
      'Date input',
      'Date picker',
      'File upload',
      'Select',
    ],
  },
  {
    id: 'navigation',
    title: 'Navigation',
    description: 'Components that help users understand where they are and move through a service.',
    image: '/assets/images/card-navigation.png',
    aliases: ['Menus', 'Wayfinding'],
    items: [
      'Back to top',
      'Breadcrumbs',
      'In-page navigation',
      'Main navigation',
      'Pagination',
      'Side navigation',
      'Tabs',
      'Utility list',
    ],
  },
  {
    id: 'content',
    title: 'Content',
    description: 'Components that organise and present information clearly.',
    image: '/assets/images/card-content.png',
    aliases: ['Content display'],
    items: [
      'Accordion',
      'Card carousel',
      'Cards',
      'Content blocks',
      'Link list',
      'List items',
      'Media',
      'Show more',
      'Support list',
      'Tables',
      'Tags',
    ],
  },
  {
    id: 'feedback-and-status',
    title: 'Feedback and status',
    description: 'Components that communicate progress, status and important feedback.',
    image: '/assets/images/card-feedback.png',
    aliases: ['Feedback', 'Status', 'Alerts'],
    items: [
      'Callout',
      'Cookie consent',
      'Global alert',
      'In-page alert',
      'Loader',
      'Progress indicator',
      'Status labels',
    ],
  },
  {
    id: 'overlays',
    title: 'Overlays',
    description: 'Components that display contextual information in a layer above the page.',
    image: '/assets/images/card-overlays.png',
    aliases: ['Layered content'],
    items: [
      'Dialog',
      'Popover',
      'Tooltip',
    ],
  },
  {
    id: 'page-structure',
    title: 'Page structure',
    description: 'Components that provide consistent page-level regions and structure.',
    image: '/assets/images/card-page-structure.png',
    aliases: ['Global page structure', 'Page layout'],
    items: [
      'Header',
      'Masthead',
      'Footer',
      'Hero banner',
    ],
  },
  {
    id: 'search-and-task-flow',
    title: 'Search and task flow',
    description: 'Components that help users find information and complete structured tasks.',
    image: '/assets/images/card-search.png',
    aliases: ['Search', 'Task flow'],
    items: [
      'Filters',
      'Hero search',
      'Results bar',
      'Steps',
    ],
  },
]

function normaliseTitle(title) {
  return title.toLowerCase()
}

function pageTitle(page = {}) {
  return normaliseTitle(page.title || '')
}

function findPageByTitle(collection, title) {
  const normalisedTitle = normaliseTitle(title)

  return (collection || []).find((page) => pageTitle(page) === normalisedTitle)
}

function categoryForTitle(groups, title) {
  const normalisedTitle = normaliseTitle(title)

  return groups.find((group) => group.items.some((item) => normaliseTitle(item) === normalisedTitle)) || null
}

function groupCollection(collection, groups, mapPage) {
  return groups.map((group) => ({
    ...group,
    items: group.items
      .map((title) => findPageByTitle(collection, title))
      .filter(Boolean)
      .map((page) => mapPage(page, group)),
  }))
}

module.exports = {
  FOUNDATION_GROUPS,
  COMPONENT_GROUPS,
  categoryForTitle,
  groupCollection,
}
