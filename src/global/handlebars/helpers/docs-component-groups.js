const changeExtention = require('./change-extention')
const { COMPONENT_GROUPS, groupCollection } = require('../data/docs-ia')

function linkFromPage(page) {
  return {
    text: page.title,
    url: changeExtention(page.path),
    description: page.intro || page['meta-description'],
    brand: page.core,
  }
}

module.exports = function docsComponentGroups(collections, groupId) {
  const safeCollections = collections || {}
  const groups = groupCollection(safeCollections.componentsnav, COMPONENT_GROUPS, linkFromPage)
    .filter((group) => group.items.length)
    .map((group) => ({
      ...group,
      url: `/components/${group.id}/index.html`,
    }))

  return typeof groupId === 'string'
    ? groups.find((group) => group.id === groupId)
    : groups
}
