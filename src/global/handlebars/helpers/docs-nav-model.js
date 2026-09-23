const changeExtention = require('./change-extention')
const docsComponentGroups = require('./docs-component-groups')
const getStartedNavModel = require('./get-started-nav-model')

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

function navItem(id, text, description, subNav = [], titleUrl = null) {
  return {
    id,
    text,
    description,
    'title-url': titleUrl,
    'sub-nav': subNav.map((item, index) => ({
      id: item.id || `${id}-${slugify(item.text)}-${index + 1}`,
      ...item,
    })),
  }
}

module.exports = function docsNavModel(collections = {}) {
  const methods = collections.methods || []
  const componentGroups = docsComponentGroups(collections)
    .map((group) => ({
      id: group.id,
      text: group.title,
      url: group.url,
    }))

  return {
    'mega-menu': true,
    items: [
      navItem(
        'get-started',
        'Get started',
        'Understand the NSW Design System, choose the right starting point for your role and find implementation guidance.',
        getStartedNavModel(),
      ),
      navItem(
        'foundations',
        'Core styles',
        'Core styles that create the NSW Government look and feel.',
        collectionLinks(collections.corenav),
      ),
      navItem(
        'components',
        'Components',
        'Reusable interface building blocks with guidance, code examples and variants.',
        componentGroups,
        '/components/index.html',
      ),
      navItem(
        'utility-classes',
        'Utility classes',
        'Single-purpose classes for applying spacing, layout, visibility and other common styling utilities.',
        collectionLinks(collections.utilities, { transformText: cleanUtilityText }),
      ),
      navItem(
        'methods',
        'Methods',
        'Best practice design solutions for specific user-focused tasks and page types.',
        collectionLinks(methods),
      ),

      {
        id: 'release-notes',
        text: 'Release notes',
        url: '/release-notes/index.html',
      },
    ],
  }
}
