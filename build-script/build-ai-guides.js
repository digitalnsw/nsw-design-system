#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { finished } = require('stream/promises')
const gulp = require('gulp')
const zip = require('gulp-zip')

const repoRoot = path.resolve(__dirname, '..')
const aiDir = path.join(repoRoot, 'ai')
const guidesDir = path.join(repoRoot, 'ai', 'guides')
const domainGuidesDir = path.join(guidesDir, 'domains')
const packageJsonPath = path.join(repoRoot, 'package.json')

const bundleFilename = 'NSW-LLM-GUIDE.md'
const manifestFilename = 'manifest.json'
const archiveFilename = 'nsw-llm-guides.zip'

const bundlePath = path.join(aiDir, bundleFilename)
const manifestPath = path.join(aiDir, manifestFilename)
const archivePath = path.join(aiDir, archiveFilename)
const legacyBundlePath = path.join(guidesDir, bundleFilename)
const legacyManifestPath = path.join(guidesDir, manifestFilename)
const legacyArchivePath = path.join(guidesDir, archiveFilename)

const coreGuideOrder = [
  'core/principles.md',
  'core/colour-and-patterns.md',
  'core/typography-and-layout.md',
  'core/accessibility.md',
]

const excludedGuideFiles = new Set([
  'README.md',
  bundleFilename,
  manifestFilename,
  archiveFilename,
])

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))

const resolveGeneratedAt = () => {
  const sourceDateEpoch = process.env.SOURCE_DATE_EPOCH
  if (!sourceDateEpoch) return null

  const epochSeconds = Number(sourceDateEpoch)
  if (!Number.isInteger(epochSeconds) || epochSeconds < 0) {
    throw new Error('SOURCE_DATE_EPOCH must be a non-negative integer (seconds since Unix epoch).')
  }

  return new Date(epochSeconds * 1000).toISOString()
}

const writeFileIfChanged = (filePath, nextContent) => {
  if (fs.existsSync(filePath)) {
    const currentContent = fs.readFileSync(filePath, 'utf8')
    if (currentContent === nextContent) return
  }

  fs.writeFileSync(filePath, nextContent, 'utf8')
}

const getMarkdownTitle = (content, fallbackTitle) => {
  const firstHeading = content.split('\n').find((line) => line.trim().startsWith('# '))
  if (!firstHeading) return fallbackTitle
  return firstHeading.replace(/^#\s+/, '').trim()
}

const readGuide = (relativePath, category, order) => {
  const absolutePath = path.join(guidesDir, relativePath)
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Missing guide file: ${relativePath}`)
  }

  const content = fs.readFileSync(absolutePath, 'utf8').trim()
  const title = getMarkdownTitle(content, relativePath)

  return {
    title,
    category,
    order,
    path: relativePath,
    content,
  }
}

const getDomainGuides = () => {
  if (!fs.existsSync(domainGuidesDir)) return []

  const collected = []
  const walk = (absoluteDir, relativePrefix = 'domains') => {
    const entries = fs.readdirSync(absoluteDir, { withFileTypes: true })
    entries.forEach((entry) => {
      if (entry.name.startsWith('.')) return
      if (excludedGuideFiles.has(entry.name)) return
      const absolutePath = path.join(absoluteDir, entry.name)
      const relativePath = path.posix.join(relativePrefix, entry.name)
      if (entry.isDirectory()) {
        walk(absolutePath, relativePath)
        return
      }
      if (!entry.isFile() || !entry.name.endsWith('.md')) return
      collected.push(relativePath)
    })
  }

  walk(domainGuidesDir)
  return collected.sort()
}

const createGuideList = () => {
  const guides = []

  coreGuideOrder.forEach((relativePath, index) => {
    guides.push(readGuide(relativePath, 'core', index + 1))
  })

  const domainGuides = getDomainGuides()
  domainGuides.forEach((relativePath, index) => {
    guides.push(readGuide(relativePath, 'domain', coreGuideOrder.length + index + 1))
  })

  return guides
}

const buildBundleMarkdown = (guides, generatedAt) => {
  const heading = [
    '# NSW Design System LLM Guide Bundle',
    '',
    ...(generatedAt ? [`Generated: ${generatedAt}`] : []),
    `Package: ${packageJson.name}@${packageJson.version}`,
    '',
    'Use this file when you want a single-file import into an LLM.',
    '',
    '## Included Guides',
  ]

  const guideList = guides.map((guide, index) => `${index + 1}. ${guide.title} (\`${guide.path}\`)`)
  const sections = guides.map((guide, index) => [
    `## ${index + 1}. ${guide.title}`,
    '',
    `Source: \`${guide.path}\``,
    '',
    guide.content,
    '',
  ].join('\n'))

  return [...heading, ...guideList, '', '---', '', ...sections].join('\n')
}

const createArchive = async (guides) => {
  const archiveEntries = [
    'guides/README.md',
    ...guides.map((guide) => `guides/${guide.path}`),
    bundleFilename,
    manifestFilename,
  ]

  if (fs.existsSync(archivePath)) {
    fs.unlinkSync(archivePath)
  }

  const zipStream = gulp
    .src(archiveEntries, {
      cwd: aiDir,
      base: '.',
      nodir: true,
      dot: false,
      allowEmpty: false,
    })
    .pipe(zip(archiveFilename))
    .pipe(gulp.dest(aiDir))

  await finished(zipStream)
}

const main = async () => {
  const generatedAt = resolveGeneratedAt()
  const guides = createGuideList()

  ;[legacyBundlePath, legacyManifestPath, legacyArchivePath].forEach((legacyPath) => {
    if (fs.existsSync(legacyPath)) fs.unlinkSync(legacyPath)
  })

  const bundle = buildBundleMarkdown(guides, generatedAt)
  writeFileIfChanged(bundlePath, `${bundle}\n`)

  const manifest = {
    name: 'nsw-design-system-llm-guides',
    package: {
      name: packageJson.name,
      version: packageJson.version,
    },
    outputs: {
      bundle: bundleFilename,
      manifest: manifestFilename,
      archive: archiveFilename,
    },
    guides: guides.map((guide) => ({
      title: guide.title,
      category: guide.category,
      order: guide.order,
      path: guide.path,
    })),
  }
  if (generatedAt) manifest.generatedAt = generatedAt

  writeFileIfChanged(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
  await createArchive(guides)

  process.stdout.write(
    `Generated ${bundleFilename}, ${manifestFilename}, and ${archiveFilename} in ai\n`,
  )
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`)
  process.exitCode = 1
})
