const changeExtention = require('./change-extention')

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
    current: url === currentUrl,
  }
}

function collectionLinks(collection, currentUrl, options = {}) {
  const pages = collection || []
  const excludeTitles = options.excludeTitles || []
  const textOverrides = options.textOverrides || {}
  const transformText = options.transformText || ((text) => text)

  return pages
    .filter((page) => !excludeTitles.includes(page.title))
    .map((page) => linkFromPage(page, currentUrl, {
      text: textOverrides[page.title] || transformText(page.title),
    }))
}

function navGroup(id, text, url, currentUrl, items) {
  const sideNavItems = items.map((item, index) => ({
    id: item.id || `${id}-${slugify(item.text)}-${index + 1}`,
    ...item,
    current: item.url === currentUrl,
  }))

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
  const getStartedGuidanceLinks = [
    ...collectionLinks(design, currentUrl, {
      excludeTitles: ['Getting Started'],
      textOverrides: { Theming: 'Design theming' },
    }),
    ...collectionLinks(develop, currentUrl, {
      excludeTitles: ['Getting Started'],
      textOverrides: { Theming: 'Develop theming' },
    }),
  ]

  const groups = [
    navGroup(
      'get-started',
      'Get started',
      '/index.html#get-started',
      currentUrl,
      [
        ...collectionLinks(about, currentUrl, { excludeTitles: ['Release notes'] }),
        ...collectionLinks(design, currentUrl, {
          excludeTitles: ['Extending', 'Figma UI Kit', 'Guides', 'Theming'],
          textOverrides: { 'Getting Started': 'Design' },
        }),
        ...collectionLinks(develop, currentUrl, {
          excludeTitles: ['Theming'],
          textOverrides: { 'Getting Started': 'Develop' },
        }),
        { text: 'Templates', url: '/templates/index.html' },
        ...getStartedGuidanceLinks,
      ],
    ),
    navGroup(
      'foundations',
      'Foundations',
      '/index.html#foundations',
      currentUrl,
      collectionLinks(safeCollections.corenav, currentUrl),
    ),
    navGroup(
      'components',
      'Components',
      '/index.html#components',
      currentUrl,
      collectionLinks(safeCollections.componentsnav, currentUrl),
    ),
    navGroup(
      'utility-classes',
      'Utility classes',
      '/index.html#foundations',
      currentUrl,
      collectionLinks(safeCollections.utilities, currentUrl, { transformText: cleanUtilityText }),
    ),
    navGroup(
      'methods',
      'Methods',
      '/index.html#guidance',
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

  return groups.find((group) => group.items.some((item) => item.current)) || null
}
