const changeExtention = require('./change-extention')
const { COMPONENT_GROUPS, groupCollection } = require('../data/docs-ia')

function linkFromPage(page) {
  return {
    text: page.title,
    url: changeExtention(page.path),
    brand: page.core,
  }
}

module.exports = function docsComponentGroups(collections = {}) {
  return groupCollection(collections.componentsnav, COMPONENT_GROUPS, linkFromPage)
    .filter((group) => group.items.length)
}
