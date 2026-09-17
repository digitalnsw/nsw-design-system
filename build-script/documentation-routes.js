const DOCUMENTATION_ROUTES = [
  {
    source: 'docs/content/about/release-notes.hbs',
    output: 'release-notes/index.hbs',
  },
  {
    source: 'docs/content/design/guides.hbs',
    output: 'get-started/guides.hbs',
  },
]

const DOCUMENTATION_ROUTE_PREFIXES = [
  {
    source: 'docs/content/get-started/',
    output: 'get-started/',
  },
  {
    source: 'docs/content/utilities/',
    output: 'utility-classes/',
  },
  {
    source: 'docs/content/methods/',
    output: 'methods/',
  },
  {
    source: 'docs/content/contribute/',
    output: 'contribute/',
  },
]

function documentationOutputPath(sourcePath) {
  const normalisedPath = sourcePath.replace(/\\/g, '/').replace(/^\//, '')
  const route = DOCUMENTATION_ROUTES.find((item) => item.source === normalisedPath)

  if (route) return route.output

  const routePrefix = DOCUMENTATION_ROUTE_PREFIXES.find((item) => normalisedPath.startsWith(item.source))

  if (!routePrefix) return normalisedPath

  return `${routePrefix.output}${normalisedPath.slice(routePrefix.source.length)}`
}

function mapDocumentationRoutes(files, metalsmith, done) {
  Object.keys(files).forEach((sourcePath) => {
    const outputPath = documentationOutputPath(sourcePath)

    if (outputPath === sourcePath) return

    if (files[outputPath]) {
      throw new Error(`Documentation route conflicts with an existing file: ${outputPath}`)
    }

    const file = files[sourcePath]
    file.path = outputPath
    // eslint-disable-next-line no-param-reassign
    files[outputPath] = file
    // eslint-disable-next-line no-param-reassign
    delete files[sourcePath]
  })

  done()
}

module.exports = {
  DOCUMENTATION_ROUTES,
  DOCUMENTATION_ROUTE_PREFIXES,
  documentationOutputPath,
  mapDocumentationRoutes,
}
