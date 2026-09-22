const GET_STARTED_RELATED_URLS = ['/get-started/guides.html']

const GET_STARTED_ITEMS = [
  {
    id: 'get-started-about',
    text: 'About the NSW Design System',
    url: '/get-started/about-the-nsw-design-system.html',
  },
  {
    id: 'get-started-roles',
    text: 'Supporting different roles',
    url: '/get-started/supporting-different-roles.html',
  },
  {
    id: 'get-started-ecosystem',
    text: 'Our ecosystem',
    url: '/get-started/our-ecosystem.html',
  },
  {
    id: 'get-started-for-designers',
    text: 'For designers',
    url: '/get-started/for-designers.html',
  },
  {
    id: 'get-started-for-developers',
    text: 'For developers',
    url: '/get-started/for-developers.html',
  },
  {
    id: 'get-started-figma',
    text: 'Figma UI Kit',
    url: '/get-started/figma-ui-kit.html',
  },
  {
    id: 'get-started-templates',
    text: 'Templates',
    url: '/get-started/templates.html',
  },
  {
    id: 'get-started-theming',
    text: 'Theming',
    url: '/get-started/theming.html',
    associatedUrls: ['/get-started/theming-for-developers.html'],
  },
  {
    id: 'get-started-extending',
    text: 'Extending',
    url: '/get-started/extending.html',
  },
]

function getStartedNavModel(currentUrl = '') {
  function buildItem(item) {
    const children = (item.children || []).map(buildItem)
    const current = item.url === currentUrl
    const associated = (item.associatedUrls || []).includes(currentUrl)
    const active = associated || children.some((child) => child.current || child.active)
    const navItem = {
      id: item.id,
      text: item.text,
      url: item.url,
      current,
      active,
    }

    if (children.length) {
      navItem.toggle = true
      navItem.open = current || active
      navItem.items = children
      navItem['sub-nav'] = children
    }

    return navItem
  }

  return GET_STARTED_ITEMS.map(buildItem)
}

module.exports = getStartedNavModel
module.exports.GET_STARTED_ITEMS = GET_STARTED_ITEMS
module.exports.GET_STARTED_RELATED_URLS = GET_STARTED_RELATED_URLS
