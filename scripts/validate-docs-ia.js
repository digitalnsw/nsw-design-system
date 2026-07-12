const fs = require('fs')
const path = require('path')

const {
  FOUNDATION_GROUPS,
  COMPONENT_GROUPS,
} = require('../src/global/handlebars/data/docs-ia')

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
assert(![...COMPONENT_GROUPS, ...FOUNDATION_GROUPS].some((group) => group.title === 'Primitives'), 'Primitives must not be used as a category')

const methodFiles = [
  'src/docs/content/methods/search.hbs',
  'src/docs/content/methods/charts-and-graphs.hbs',
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
  methods.join('|') === 'Search and filters|Charts and graphs|Inactive fields|Maps|You are here',
  `Unexpected Methods order: ${methods.join(', ')}`,
)
assert(!fs.existsSync(path.join(root, 'src/docs/content/methods/index.hbs')), 'Methods overview page must not be added')

const searchData = readFile('src/docs/data.js')
const normalisedSearchData = searchData.toLowerCase()
;[
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
].forEach((term) => {
  assert(normalisedSearchData.includes(term.toLowerCase()), `Search data missing alias or keyword: ${term}`)
})

const redirectsCsvPath = path.join(root, 'redirects/cloudflare-bulk-redirects.csv')
const redirectsReportPath = path.join(root, 'redirects/docs-ia-redirects.md')

assert(fs.existsSync(redirectsCsvPath), 'Cloudflare redirects CSV is missing')
assert(fs.existsSync(redirectsReportPath), 'Redirect report is missing')

const redirectRows = fs.readFileSync(redirectsCsvPath, 'utf8')
  .split(/\r?\n/)
  .filter((line) => line.trim())

redirectRows.forEach((row) => {
  const columns = row.split(',')
  assert(columns.length === 7, `Redirect row must have 7 columns: ${row}`)
  assert(columns[0].startsWith('https://designsystem.nsw.gov.au/'), `Redirect source must be production URL: ${row}`)
  assert(columns[1].startsWith('https://designsystem.nsw.gov.au/'), `Redirect target must be production URL: ${row}`)
  assert(columns[2] === '301', `Redirect status must be 301: ${row}`)
})

console.log('Docs IA validation passed')
