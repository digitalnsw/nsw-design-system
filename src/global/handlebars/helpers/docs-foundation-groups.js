const changeExtention = require('./change-extention')
const { FOUNDATION_GROUPS, groupCollection } = require('../data/docs-ia')

function linkFromPage(page) {
  return {
    text: page.title,
    url: changeExtention(page.path),
    brand: page.core,
  }
}

module.exports = function docsFoundationGroups(collections = {}) {
  return groupCollection(collections.corenav, FOUNDATION_GROUPS, linkFromPage)
    .filter((group) => group.items.length)
}
