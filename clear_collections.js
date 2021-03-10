module.exports = (collectionNames) => function (files, metalsmith, done) {
  'use strict';
  const meta = metalsmith.metadata()

  for (const collection of collectionNames) {
    if (collection in meta) {
      meta[collection] = []
      console.log('rm collection')
    }
  }
  metalsmith.metadata(meta)
  done()
}
