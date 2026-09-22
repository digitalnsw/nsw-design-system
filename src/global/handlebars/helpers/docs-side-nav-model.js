const changeExtention = require('./change-extention')
const getStartedNavModel = require('./get-started-nav-model')

const { GET_STARTED_RELATED_URLS } = getStartedNavModel
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

function groupedCollectionLinks(collection, groups, currentUrl, sectionPath) {
  return groupCollection(collection, groups, (page) => linkFromPage(page, currentUrl))
    .map((group) => {
      const url = sectionPath ? `/${sectionPath}/${group.id}/index.html` : null
      const current = url === currentUrl
      const active = current || group.items.some((item) => item.current)

      return {
        id: group.id,
        text: group.title,
        url,
        toggle: true,
        current,
        open: active,
        active,
        items: group.items,
      }
    })
    .filter((group) => group.items.length)
}

function hasCurrentItem(item) {
  return item.current || item.active || (item.items || []).some(hasCurrentItem)
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

  const contribute = safeCollections.contribute || []
  const methods = safeCollections.methods || []

  const groups = [
    navGroup(
      'get-started',
      'Get started',
      '/index.html#get-started',
      currentUrl,
      getStartedNavModel(currentUrl),
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
      '/components/index.html',
      currentUrl,
      groupedCollectionLinks(safeCollections.componentsnav, COMPONENT_GROUPS, currentUrl, 'components'),
    ),
    navGroup(
      'utility-classes',
      'Utility classes',
      null,
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
      normaliseUrl((contribute[0] || {}).path || 'contribute/contribution-criteria.hbs'),
      currentUrl,
      collectionLinks(contribute, currentUrl),
    ),
  ]

  const matchingGroup = groups.find((group) => group.items.some(hasCurrentItem))

  if (matchingGroup) return matchingGroup
  if (GET_STARTED_RELATED_URLS.includes(currentUrl)) return groups[0]

  return null
}
