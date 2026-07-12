const changeExtention = require('./change-extention')
const {
  FOUNDATION_GROUPS,
  COMPONENT_GROUPS,
  groupCollection,
} = require('../data/docs-ia')

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function normaliseUrl(path) {
  if (!path) return ''

  return path.startsWith('/') ? path : changeExtention(path)
}

function cleanUtilityText(text) {
  return text
    .replace(/ Utility Classes$/, '')
    .replace(/ Utility Class$/, '')
    .replace(/ Classes$/, '')
}

function linkFromPage(page, currentUrl, options = {}) {
  const text = options.text || page.title
  const url = normaliseUrl(page.path)

  return {
    text,
    url,
    brand: page.core,
    current: url === currentUrl,
  }
}

function collectionLinks(collection, currentUrl, options = {}) {
  const pages = collection || []
  const includeTitles = options.includeTitles || null
  const excludeTitles = options.excludeTitles || []
  const textOverrides = options.textOverrides || {}
  const transformText = options.transformText || ((text) => text)

  return pages
    .filter((page) => !includeTitles || includeTitles.includes(page.title))
    .filter((page) => !excludeTitles.includes(page.title))
    .map((page) => linkFromPage(page, currentUrl, {
      text: textOverrides[page.title] || transformText(page.title),
    }))
}

function groupedCollectionLinks(collection, groups, currentUrl) {
  return groupCollection(collection, groups, (page) => linkFromPage(page, currentUrl))
    .map((group) => {
      const active = group.items.some((item) => item.current)

      return {
        id: group.id,
        text: group.title,
        toggle: true,
        open: active,
        active,
        items: group.items,
      }
    })
    .filter((group) => group.items.length)
}

function hasCurrentItem(item) {
  return item.current || (item.items || []).some(hasCurrentItem)
}

function navGroup(id, text, url, currentUrl, items) {
  const sideNavItems = items.map((item, index) => {
    const sideNavItem = {
      id: item.id || `${id}-${slugify(item.text)}-${index + 1}`,
      ...item,
      current: item.current || item.url === currentUrl,
    }

    return {
      ...sideNavItem,
      active: sideNavItem.active || hasCurrentItem(sideNavItem),
    }
  })

  return {
    id,
    'parent-id': `docs-side-nav-${id}`,
    'parent-text': text,
    'parent-url': url,
    items: sideNavItems,
  }
}

module.exports = function docsSideNavModel(collections, path) {
  const safeCollections = collections || {}
  const currentUrl = normaliseUrl(path)

  if (!currentUrl) return null

  const about = safeCollections.about || []
  const design = safeCollections.design || []
  const develop = safeCollections.develop || []
  const contribute = safeCollections.contribute || []
  const methods = safeCollections.methods || []
  const getStartedDesignLinks = collectionLinks(design, currentUrl, {
    includeTitles: ['Figma UI Kit', 'Extending', 'Theming', 'Guides'],
    textOverrides: { Theming: 'Design theming' },
  })

  const groups = [
    navGroup(
      'get-started',
      'Get started',
      '/index.html#get-started',
      currentUrl,
      [
        ...collectionLinks(about, currentUrl, { excludeTitles: ['Release notes'] }),
        ...collectionLinks(design, currentUrl, {
          includeTitles: ['Getting Started'],
          textOverrides: { 'Getting Started': 'Design' },
        }),
        ...collectionLinks(develop, currentUrl, {
          includeTitles: ['Getting Started'],
          textOverrides: { 'Getting Started': 'Develop' },
        }),
        { text: 'Templates', url: '/templates/index.html' },
        ...getStartedDesignLinks,
      ],
    ),
    navGroup(
      'foundations',
      'Foundations',
      '/index.html#foundations',
      currentUrl,
      groupedCollectionLinks(safeCollections.corenav, FOUNDATION_GROUPS, currentUrl),
    ),
    navGroup(
      'components',
      'Components',
      '/index.html#components',
      currentUrl,
      groupedCollectionLinks(safeCollections.componentsnav, COMPONENT_GROUPS, currentUrl),
    ),
    navGroup(
      'utility-classes',
      'Utility classes',
      '/index.html#utility-classes',
      currentUrl,
      collectionLinks(safeCollections.utilities, currentUrl, { transformText: cleanUtilityText }),
    ),
    navGroup(
      'methods',
      'Methods',
      '/index.html#methods',
      currentUrl,
      collectionLinks(methods, currentUrl),
    ),
    navGroup(
      'contribute',
      'Contribute',
      normaliseUrl((contribute[0] || {}).path || 'docs/content/contribute/contribution-criteria.hbs'),
      currentUrl,
      collectionLinks(contribute, currentUrl),
    ),
  ]

  return groups.find((group) => group.items.some(hasCurrentItem)) || null
}
