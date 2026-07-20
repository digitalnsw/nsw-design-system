const changeExtention = require('./change-extention')

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function linkFromPage(page, options = {}) {
  const text = options.text || page.title

  return {
    text,
    url: changeExtention(page.path),
    brand: page.core,
  }
}

function cleanUtilityText(text) {
  return text
    .replace(/ Utility Classes$/, '')
    .replace(/ Utility Class$/, '')
    .replace(/ Classes$/, '')
}

function collectionLinks(collection = [], options = {}) {
  const excludeTitles = options.excludeTitles || []
  const textOverrides = options.textOverrides || {}
  const transformText = options.transformText || ((text) => text)

  return collection
    .filter((page) => !excludeTitles.includes(page.title))
    .map((page) => linkFromPage(page, {
      text: textOverrides[page.title] || transformText(page.title),
    }))
}

function navItem(id, text, url, description, subNav = []) {
  return {
    id,
    text,
    url,
    description,
    'sub-nav': subNav.map((item, index) => ({
      id: item.id || `${id}-${slugify(item.text)}-${index + 1}`,
      ...item,
    })),
  }
}

module.exports = function docsNavModel(collections = {}) {
  const about = collections.about || []
  const design = collections.design || []
  const develop = collections.develop || []
  const contribute = collections.contribute || []
  const methods = collections.methods || []
  const getStartedGuidanceLinks = [
    ...collectionLinks(design, {
      excludeTitles: ['Getting Started'],
      textOverrides: { Theming: 'Design theming' },
    }),
    ...collectionLinks(develop, {
      excludeTitles: ['Getting Started'],
      textOverrides: { Theming: 'Develop theming' },
    }),
  ]

  return {
    'mega-menu': true,
    items: [
      navItem(
        'get-started',
        'Get started',
        '/index.html#get-started',
        'Understand the NSW Design System, choose the right starting point for your role and find implementation guidance.',
        [
          ...collectionLinks(about, { excludeTitles: ['Release notes'] }),
          ...collectionLinks(design, {
            excludeTitles: ['Extending', 'Figma UI Kit', 'Guides', 'Theming'],
            textOverrides: { 'Getting Started': 'Design' },
          }),
          ...collectionLinks(develop, {
            excludeTitles: ['Theming'],
            textOverrides: { 'Getting Started': 'Develop' },
          }),
          { text: 'Templates', url: '/templates/index.html' },
          ...getStartedGuidanceLinks,
        ],
      ),
      navItem(
        'foundations',
        'Foundations',
        '/index.html#foundations',
        'Core styles that create the NSW Government look and feel.',
        collectionLinks(collections.corenav),
      ),
      navItem(
        'components',
        'Components',
        '/index.html#components',
        'Reusable interface building blocks with guidance, code examples and variants.',
        collectionLinks(collections.componentsnav),
      ),
      navItem(
        'utility-classes',
        'Utility classes',
        '/index.html#utility-classes',
        'Single-purpose classes for applying spacing, layout, visibility and other common styling utilities.',
        collectionLinks(collections.utilities, { transformText: cleanUtilityText }),
      ),
      navItem(
        'methods',
        'Methods',
        '/index.html#methods',
        'Best practice design solutions for specific user-focused tasks and page types.',
        collectionLinks(methods),
      ),
      navItem(
        'contribute',
        'Contribute',
        changeExtention((contribute[0] || {}).path || 'docs/content/contribute/contribution-criteria.hbs'),
        'Help improve the NSW Design System by proposing, building and reviewing contributions.',
        collectionLinks(contribute),
      ),
      {
        id: 'release-notes',
        text: 'Release notes',
        url: '/docs/content/about/release-notes.html',
      },
    ],
  }
}
