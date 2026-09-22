const fs = require('fs')
const path = require('path')

const {
  FOUNDATION_GROUPS,
  COMPONENT_GROUPS,
} = require('../src/global/handlebars/data/docs-ia')
const getStartedNavModel = require('../src/global/handlebars/helpers/get-started-nav-model')
const docsSideNavModel = require('../src/global/handlebars/helpers/docs-side-nav-model')
const { documentationOutputPath } = require('../build-script/documentation-routes')

const root = path.resolve(__dirname, '..')

function readFile(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8')
}

function listIndexFiles(relativePath) {
  return fs.readdirSync(path.join(root, relativePath), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(relativePath, entry.name, 'index.hbs'))
    .filter((filePath) => fs.existsSync(path.join(root, filePath)))
}

function listFiles(relativePath, extension) {
  return fs.readdirSync(path.join(root, relativePath), { withFileTypes: true })
    .flatMap((entry) => {
      const entryPath = path.join(relativePath, entry.name)

      return entry.isDirectory() ? listFiles(entryPath, extension) : [entryPath]
    })
    .filter((filePath) => filePath.endsWith(extension))
}

function frontmatterValue(filePath, key) {
  const file = readFile(filePath)
  const frontmatter = file.match(/^---\n([\s\S]*?)\n---/)
  if (!frontmatter) return null
  const value = frontmatter[1].match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))

  return value ? value[1].trim() : null
}

function groupedTitles(groups) {
  return groups.flatMap((group) => group.items)
}

function duplicates(values) {
  return [...new Set(values.filter((value, index) => values.indexOf(value) !== index))]
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

function assertExactCoverage(label, actual, expected) {
  const actualSet = new Set(actual)
  const expectedSet = new Set(expected)
  const missing = actual.filter((title) => !expectedSet.has(title))
  const extra = expected.filter((title) => !actualSet.has(title))
  const duplicateTitles = duplicates(expected)

  assert(missing.length === 0, `${label} missing from IA groups: ${missing.join(', ')}`)
  assert(extra.length === 0, `${label} IA groups contain unknown pages: ${extra.join(', ')}`)
  assert(duplicateTitles.length === 0, `${label} IA groups contain duplicates: ${duplicateTitles.join(', ')}`)
}

const componentTitles = listIndexFiles('src/components').map((filePath) => frontmatterValue(filePath, 'title'))
const foundationTitles = listIndexFiles('src/core').map((filePath) => frontmatterValue(filePath, 'title'))

assertExactCoverage('Component', componentTitles, groupedTitles(COMPONENT_GROUPS))
assertExactCoverage('Foundation', foundationTitles, groupedTitles(FOUNDATION_GROUPS))

assert(groupedTitles(COMPONENT_GROUPS).includes('Quick exit'), 'Quick exit must remain a component')
assert(groupedTitles(COMPONENT_GROUPS).includes('Cookie consent'), 'Cookie consent must remain a component')
assert(
  ![...COMPONENT_GROUPS, ...FOUNDATION_GROUPS].some((group) => group.title === 'Primitives'),
  'Primitives must not be used as a category',
)

const methodFiles = [
  'src/docs/content/methods/search.hbs',
  'src/docs/content/methods/charts-and-graphs.hbs',
  'src/docs/content/methods/easy-read.hbs',
  'src/docs/content/methods/inactive-fields.hbs',
  'src/docs/content/methods/maps.hbs',
  'src/docs/content/methods/you-are-here.hbs',
]

const methods = methodFiles
  .map((filePath) => ({
    title: frontmatterValue(filePath, 'title'),
    order: Number(frontmatterValue(filePath, 'order')),
  }))
  .sort((a, b) => a.order - b.order)
  .map((method) => method.title)

assert(
  methods.join('|') === 'Search and filters|Charts and graphs|Easy Read|Inactive fields|Maps|You are here',
  `Unexpected Methods order: ${methods.join(', ')}`,
)
assert(!fs.existsSync(path.join(root, 'src/docs/content/methods/index.hbs')), 'Methods overview page must not be added')

assert(
  documentationOutputPath('docs/content/get-started/theming.hbs') === 'get-started/theming.hbs',
  'Get started pages must emit without the docs/content source path',
)
assert(
  documentationOutputPath('docs/content/utilities/background.hbs') === 'utility-classes/background.hbs',
  'Utility class pages must emit under utility-classes',
)
assert(
  documentationOutputPath('docs/content/methods/search.hbs') === 'methods/search.hbs',
  'Method pages must emit under methods',
)
assert(
  documentationOutputPath('docs/content/contribute/contribution-criteria.hbs') === 'contribute/contribution-criteria.hbs',
  'Contribute pages must emit under contribute',
)
assert(
  documentationOutputPath('docs/content/about/release-notes.hbs') === 'release-notes/index.hbs',
  'Release notes must emit as a top-level section',
)
assert(
  documentationOutputPath('docs/content/design/guides.hbs') === 'get-started/guides.hbs',
  'Legacy design guides must emit under Get started',
)
assert(
  documentationOutputPath('components/accordion/index.hbs') === 'components/accordion/index.hbs',
  'Component output paths must remain unchanged',
)
assert(
  documentationOutputPath('core/logo/index.hbs') === 'core/logo/index.hbs',
  'Foundation output paths must remain unchanged',
)

assert(
  frontmatterValue('src/docs/content/get-started/for-designers.hbs', 'title') === 'For designers',
  'Designer setup page title must be For designers',
)
assert(
  frontmatterValue('src/docs/content/get-started/for-developers.hbs', 'title') === 'For developers',
  'Developer setup page title must be For developers',
)

const getStartedItems = getStartedNavModel()
const expectedGetStartedItems = [
  'About the NSW Design System',
  'Supporting different roles',
  'Our ecosystem',
  'For designers',
  'For developers',
  'Figma UI Kit',
  'Templates',
  'Theming',
  'Extending',
].join('|')
assert(
  getStartedItems.map((item) => item.text).join('|') === expectedGetStartedItems,
  `Unexpected Get started order: ${getStartedItems.map((item) => item.text).join(', ')}`,
)
assert(
  getStartedItems.every((item) => !item.items),
  'Get started navigation must remain a flat list',
)
assert(!getStartedItems.some((item) => item.text === 'Guides'), 'Guides must not appear in primary navigation')
assert(
  !getStartedItems.some((item) => item.url === '/get-started/theming-for-developers.html'),
  'Developer theming must not appear in primary navigation',
)
const developerThemingNav = getStartedNavModel('/get-started/theming-for-developers.html')
assert(
  developerThemingNav.find((item) => item.text === 'Theming').active,
  'Developer theming must remain associated with the Get started navigation',
)
const developerThemingSideNav = docsSideNavModel({}, '/get-started/theming-for-developers.html')
assert(
  developerThemingSideNav && developerThemingSideNav['parent-text'] === 'Get started',
  'Developer theming must use the standard Get started documentation shell',
)
const designersSideNav = docsSideNavModel({}, '/get-started/for-designers.html')
assert(
  designersSideNav && designersSideNav.items.some((item) => item.text === 'For designers' && item.current),
  'For designers must be a direct Get started navigation item',
)
const templatesSideNav = docsSideNavModel({}, '/get-started/templates.html')
assert(
  templatesSideNav && templatesSideNav.items.some((item) => item.text === 'Templates' && item.current),
  'Templates must use the standard Get started documentation shell',
)
assert(
  frontmatterValue('src/docs/content/get-started/templates.hbs', 'home') !== 'true',
  'Templates must not use the home page template',
)
const guidesSideNav = docsSideNavModel({}, '/get-started/guides.html')
assert(
  guidesSideNav && guidesSideNav['parent-text'] === 'Get started',
  'Guides must use Get started as its documentation parent',
)
assert(
  !guidesSideNav.items.some((item) => item.active || item.open),
  'Guides must not activate another Get started navigation item',
)

const searchData = readFile('src/docs/data.js')
const normalisedSearchData = searchData.toLowerCase()
const requiredSearchTerms = [
  'What is Design System',
  'Search & Filters',
  'Progress Indicator',
  'Vertical align',
  'Core styles',
  'actions and controls',
  'forms and input',
  'feedback and status',
  'page structure',
  'search and task flow',
]
requiredSearchTerms.forEach((term) => {
  assert(normalisedSearchData.includes(term.toLowerCase()), `Search data missing alias or keyword: ${term}`)
})

const redirectsCsvPath = path.join(root, 'redirects/cloudflare-bulk-redirects.csv')
const redirectsReportPath = path.join(root, 'redirects/docs-ia-redirects.md')

assert(fs.existsSync(redirectsCsvPath), 'Cloudflare redirects CSV is missing')
assert(fs.existsSync(redirectsReportPath), 'Redirect report is missing')

const redirectRows = fs.readFileSync(redirectsCsvPath, 'utf8')
  .split(/\r?\n/)
  .filter((line) => line.trim())
const redirects = redirectRows.map((row) => {
  const columns = row.split(',')
  assert(columns.length === 7, `Redirect row must have 7 columns: ${row}`)
  assert(columns[0].startsWith('https://designsystem.nsw.gov.au/'), `Redirect source must be production URL: ${row}`)
  assert(columns[1].startsWith('https://designsystem.nsw.gov.au/'), `Redirect target must be production URL: ${row}`)
  assert(columns[2] === '301', `Redirect status must be 301: ${row}`)

  return { source: columns[0], target: columns[1] }
})
const redirectSources = redirects.map((redirect) => redirect.source)
const duplicateRedirectSources = duplicates(redirectSources)
const redirectMap = new Map(redirects.map((redirect) => [redirect.source, redirect.target]))
const productionUrl = 'https://designsystem.nsw.gov.au'

assert(duplicateRedirectSources.length === 0, `Duplicate redirect sources: ${duplicateRedirectSources.join(', ')}`)
redirects.forEach((redirect) => {
  assert(redirect.source !== redirect.target, `Redirect source and target must differ: ${redirect.source}`)
  assert(!redirect.target.includes('/docs/content/'), `Redirect target exposes a source path: ${redirect.target}`)
  assert(!redirectMap.has(redirect.target), `Redirect chain detected at target: ${redirect.target}`)
})

const routedPageFiles = [
  ...listFiles('src/docs/content/get-started', '.hbs'),
  ...listFiles('src/docs/content/utilities', '.hbs'),
  ...listFiles('src/docs/content/methods', '.hbs'),
  ...listFiles('src/docs/content/contribute', '.hbs'),
  'src/docs/content/about/release-notes.hbs',
  'src/docs/content/design/guides.hbs',
].filter((filePath) => !path.basename(filePath).startsWith('_'))

const requiredRedirects = new Map(routedPageFiles.map((filePath) => {
  const sourcePath = filePath.replace(/^src\//, '')
  const outputPath = documentationOutputPath(sourcePath)
  const sourceUrl = `${productionUrl}/${sourcePath.replace(/\.hbs$/, '.html')}`
  const targetUrl = `${productionUrl}/${outputPath.replace(/\.hbs$/, '.html')}`

  return [sourceUrl, targetUrl]
}))

const legacyRedirects = [
  ['/docs/content/about/what-is-design-system.html', '/get-started/about-the-nsw-design-system.html'],
  ['/docs/content/about/about-the-nsw-design-system.html', '/get-started/about-the-nsw-design-system.html'],
  ['/docs/content/about/supporting-different-roles.html', '/get-started/supporting-different-roles.html'],
  ['/docs/content/about/our-ecosystem.html', '/get-started/our-ecosystem.html'],
  ['/docs/content/setup/index.html', '/index.html#get-started'],
  ['/get-started/set-up/index.html', '/index.html#get-started'],
  ['/docs/content/get-started/set-up/index.html', '/index.html#get-started'],
  ['/docs/content/design/getting-started.html', '/get-started/for-designers.html'],
  ['/get-started/set-up/for-designers.html', '/get-started/for-designers.html'],
  ['/docs/content/get-started/set-up/for-designers.html', '/get-started/for-designers.html'],
  ['/docs/content/develop/getting-started.html', '/get-started/for-developers.html'],
  ['/get-started/set-up/for-developers.html', '/get-started/for-developers.html'],
  ['/docs/content/get-started/set-up/for-developers.html', '/get-started/for-developers.html'],
  ['/docs/content/design/figma-ui-kit.html', '/get-started/figma-ui-kit.html'],
  ['/get-started/set-up/figma-ui-kit.html', '/get-started/figma-ui-kit.html'],
  ['/docs/content/get-started/set-up/figma-ui-kit.html', '/get-started/figma-ui-kit.html'],
  ['/templates/index.html', '/get-started/templates.html'],
  ['/docs/content/design/theming.html', '/get-started/theming.html'],
  ['/docs/content/develop/theming.html', '/get-started/theming-for-developers.html'],
  ['/docs/content/design/extending.html', '/get-started/extending.html'],
  ['/docs/content/develop/helpers.html', '/index.html#utility-classes'],
]
legacyRedirects.forEach(([source, target]) => {
  requiredRedirects.set(`${productionUrl}${source}`, `${productionUrl}${target}`)
})

requiredRedirects.forEach((target, source) => {
  assert(redirectMap.get(source) === target, `Missing or incorrect redirect: ${source} -> ${target}`)
})

console.log('Docs IA validation passed')
