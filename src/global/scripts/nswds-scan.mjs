// Zero-dep, post-build scanner.
// Finds class tokens starting with `nsw-` in built HTML and writes
// dist/.well-known/nsw-design-system.json (plus two optional fallbacks).

import fs from 'node:fs/promises';
import path from 'node:path';

const DIST = process.env.NSWDS_DIST || 'dist';
const VERSION = process.env.NSWDS_VERSION || 'unknown';
const MODE = process.env.NSWDS_MODE || 'vanilla';

// Allow-list of canonical component ids to report
const ALLOWED = new Set([
  'accordion','alert','autocomplete','back-to-top','breadcrumbs','button','callout','card','carousel','cookie-consent','dialog','footer','form','global-alert','header','hero-banner','in-page-alert','in-page-nav','loader','pagination','popover','progress-indicator','table','tabs','tag','toggletip','tooltip'
]);

async function walk(dir) {
  const out = [];
  for (const ent of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...await walk(p));
    else if (ent.isFile() && p.toLowerCase().endsWith('.html')) out.push(p);
  }
  return out;
}

// Normalise a token → component-ish name:
// - "nsw-card--featured" → "card"
// - "nsw-accordion__header" → "accordion"
function toComponent(token) {
  const base = token.replace(/^nsw-/, '');
  return base.split(/(--|__)/)[0]; // take before modifier/element
}

const htmlFiles = await walk(DIST);
const components = new Set();

// Scan only class attributes, ignore inline CSS/JS text
const classAttrRe = /\bclass\s*=\s*(["'])(.*?)\1/gi;

for (const file of htmlFiles) {
  const html = await fs.readFile(file, 'utf8');
  const attrMatches = html.matchAll(classAttrRe);
  for (const m of attrMatches) {
    const classes = m[2].trim().split(/\s+/);
    for (const token of classes) {
      if (!token.startsWith('nsw-')) continue;
      const base = toComponent(token);
      if (ALLOWED.has(base)) components.add(base);
    }
  }
}

const payload = {
  nswDesignSystem: {
    version: VERSION,
    mode: MODE,
    components: Array.from(components).sort(),
    detection: 'build',
    generatedAt: new Date().toISOString(),
  },
};

// Write outputs
const wkDir = path.join(DIST, '.well-known');
await fs.mkdir(wkDir, { recursive: true });
await fs.writeFile(path.join(wkDir, 'nsw-design-system.json'), JSON.stringify(payload, null, 2));

/* Optional fallbacks (safe to keep; comment out if you don’t want them) */
await fs.writeFile(path.join(DIST, 'nsw-design-system.json'), JSON.stringify(payload, null, 2));
await fs.mkdir(path.join(DIST, 'assets'), { recursive: true });
await fs.writeFile(path.join(DIST, 'assets', 'nsw-design-system.json'), JSON.stringify(payload, null, 2));

console.log(`[nswds-scan] ${payload.nswDesignSystem.components.length} components → ${path.join('.well-known', 'nsw-design-system.json')}`);