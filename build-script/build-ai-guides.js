#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')

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
    `Generated: ${generatedAt}`,
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

const createArchive = (guides) => {
  const archiveEntries = new Set([
    'guides/README.md',
    ...guides.map((guide) => `guides/${guide.path}`),
    bundleFilename,
    manifestFilename,
  ])

  if (fs.existsSync(archivePath)) {
    fs.unlinkSync(archivePath)
  }

  execFileSync(
    'zip',
    ['-r', '-q', archiveFilename, ...Array.from(archiveEntries)],
    { cwd: aiDir, stdio: 'inherit' },
  )
}

const main = () => {
  const generatedAt = new Date().toISOString()
  const guides = createGuideList()

  ;[legacyBundlePath, legacyManifestPath, legacyArchivePath].forEach((legacyPath) => {
    if (fs.existsSync(legacyPath)) fs.unlinkSync(legacyPath)
  })

  const bundle = buildBundleMarkdown(guides, generatedAt)
  fs.writeFileSync(bundlePath, `${bundle}\n`, 'utf8')

  const manifest = {
    name: 'nsw-design-system-llm-guides',
    generatedAt,
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

  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
  createArchive(guides)

  process.stdout.write(
    `Generated ${bundleFilename}, ${manifestFilename}, and ${archiveFilename} in ai\n`,
  )
}

main()
