const algoliasearch = require('algoliasearch')
const records = require('./dist/search.json')
const client = algoliasearch('C105ELLKR4', '90cf0ce79beded0042372a772ea21fa8')
const index = client.initIndex('test_index_upload')

index.saveObjects(records, { autoGenerateObjectIDIfNotExist: true }).then(function() {
  console.info('search index uploaded 🎉')
}).catch(function(err) {
  console.error(err)
})
