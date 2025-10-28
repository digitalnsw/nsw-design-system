const { chromium } = require('playwright');
const axe = require('axe-core');
const fs = require('fs');
const OUTPUT_DIR = process.env.OUTPUT_DIR || 'local';
const FAIL_ON = (process.env.FAIL_ON || 'critical').toLowerCase(); // 'critical' | 'serious' | 'moderate' | 'minor' | 'none'
const IMPACT_LEVELS = ['minor','moderate','serious','critical'];
const failIndex = IMPACT_LEVELS.indexOf(FAIL_ON);
const shouldFailImpact = (impact) => {
  if (FAIL_ON === 'none') return false;
  const idx = IMPACT_LEVELS.indexOf((impact || '').toLowerCase());
  return idx >= 0 && idx >= failIndex;
};

const isCI = !!process.env.CI;

const MAX_PAGES_ENV = process.env.MAX_PAGES && !isNaN(Number(process.env.MAX_PAGES)) ? Number(process.env.MAX_PAGES) : null;
const MAX_LINKS_PER_PAGE_ENV = process.env.MAX_LINKS_PER_PAGE && !isNaN(Number(process.env.MAX_LINKS_PER_PAGE)) ? Number(process.env.MAX_LINKS_PER_PAGE) : null;
const FULL_SWEEP = String(process.env.FULL_SWEEP || '').toLowerCase() === 'true';
const TARGET_URL = (process.env.TARGET_URL || '').trim();
const SINGLE_PAGE = !!TARGET_URL;
// Ensure output directory exists (kept out of git if /local is ignored)
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// Proxy controls for local runs
const DISABLE_PROXY = String(process.env.DISABLE_PROXY || '').toLowerCase() === 'true';
const NO_PROXY_DOMAINS = (process.env.NO_PROXY_DOMAINS || '').trim(); // comma-separated list

(async () => {
    // Allow bypassing corporate proxies/VPN when running locally
    if (NO_PROXY_DOMAINS) {
        // Merge with any existing NO_PROXY set by the environment
        const existing = process.env.NO_PROXY || process.env.no_proxy || '';
        const merged = [existing, NO_PROXY_DOMAINS].filter(Boolean).join(',');
        process.env.NO_PROXY = merged;
        process.env.no_proxy = merged;
        console.log(`🔌 NO_PROXY set for: ${merged}`);
    }
    const launchArgs = [];
    if (DISABLE_PROXY) {
        launchArgs.push('--no-proxy-server');
    }
    const browser = await chromium.launch({
        headless: isCI ? true : false,
        args: launchArgs
    });

    const page = await browser.newPage();
    const baseUrl = process.env.BASE_URL || 'https://designsystem.nsw.gov.au';
    const visitedPages = new Set();
    const pagesToVisit = SINGLE_PAGE ? [TARGET_URL] : [baseUrl];
    if (SINGLE_PAGE) {
        console.log(`🎯 Targeting single page: ${TARGET_URL}`);
    }
    const resultsSummary = [];

    // Attempt to pull full URL list from sitemap.xml (supports index sitemaps)
    async function getSitemapUrls(page, siteRoot) {
        try {
            const sitemapUrl = new URL('/sitemap.xml', siteRoot).toString();
            // Fetch using the page context to avoid adding a new dependency
            const xml = await page.evaluate(async (url) => {
                const res = await fetch(url, { credentials: 'omit' });
                if (!res.ok) return null;
                return await res.text();
            }, sitemapUrl);
            if (!xml) return [];

            // Basic parser that supports both sitemap index and urlset
            const locTags = [];
            // If it's a sitemap index, collect nested sitemaps first
            const sitemapLocs = Array.from(xml.matchAll(/&lt;loc&gt;([^&lt;]+)&lt;\/loc&gt;/g)).map(m => m[1]); // HTML-escaped case
            const rawLocs = Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g)).map(m => m[1]);                 // raw XML case
            const allLocs = (sitemapLocs.length ? sitemapLocs : rawLocs);

            // If any of the locs end with .xml, fetch and parse them as urlsets
            const urlsets = [];
            for (const loc of allLocs) {
                if (loc.endsWith('.xml') && loc !== sitemapUrl) {
                    const childXml = await page.evaluate(async (url) => {
                        const res = await fetch(url, { credentials: 'omit' });
                        if (!res.ok) return null;
                        return await res.text();
                    }, loc);
                    if (childXml) urlsets.push(childXml);
                }
            }

            if (urlsets.length) {
                for (const x of urlsets) {
                    const urls = Array.from(x.matchAll(/<loc>([^<]+)<\/loc>/g)).map(m => m[1]);
                    locTags.push(...urls);
                }
            } else {
                // Treat the original xml as a urlset
                locTags.push(...allLocs);
            }

            // Keep only URLs within the same origin
            const origin = new URL(siteRoot).origin;
            const unique = Array.from(new Set(locTags.filter(u => u.startsWith(origin))));
            return unique;
        } catch (e) {
            console.warn('⚠️  Unable to read sitemap.xml; falling back to crawl-from-homepage only.', e.message);
            return [];
        }
    }

    // Crawl limits (overridable via env). Use FULL_SWEEP=true to ignore caps.
    const DEFAULT_MAX_PAGES = 20;           // keep CI fast and deterministic by default
    const MAX_PAGES = FULL_SWEEP ? Number.MAX_SAFE_INTEGER : (MAX_PAGES_ENV ?? DEFAULT_MAX_PAGES);
    const DEFAULT_MAX_LINKS_PER_PAGE = 20;  // throttle link discovery per page by default
    const MAX_LINKS_PER_PAGE = FULL_SWEEP ? Number.MAX_SAFE_INTEGER : (MAX_LINKS_PER_PAGE_ENV ?? DEFAULT_MAX_LINKS_PER_PAGE);

    if (FULL_SWEEP && !SINGLE_PAGE) {
        try {
            const sitemapUrls = await getSitemapUrls(page, baseUrl);
            if (sitemapUrls.length) {
                // Seed the queue with sitemap URLs, ensuring baseUrl is first
                const seeds = [baseUrl, ...sitemapUrls.filter(u => u !== baseUrl)];
                seeds.forEach(u => {
                    if (!pagesToVisit.includes(u)) pagesToVisit.push(u);
                });
                console.log(`🗺️  FULL_SWEEP enabled. Loaded ${sitemapUrls.length} URL(s) from sitemap.`);
            } else {
                console.log('🗺️  FULL_SWEEP enabled, but no sitemap URLs found. Proceeding with link discovery.');
            }
        } catch (err) {
            console.log('🗺️  FULL_SWEEP sitemap step skipped:', err.message);
        }
    }

    while (pagesToVisit.length > 0 && visitedPages.size < MAX_PAGES) {
        const url = pagesToVisit.shift();

        if (visitedPages.has(url)) continue; // Skip already tested pages

        try {
            console.log(`🔍 Testing: ${url}`);

            // Ensure full page load before injecting Axe
            await page.goto(url, { timeout: 60000, waitUntil: 'load' });

            // Ensure the page has a valid documentElement before running Axe
            const isPageValid = await page.evaluate(() => !!document.documentElement);
            if (!isPageValid) {
                console.warn(`⚠️ Skipping ${url}: Page is empty or blocked.`);
                visitedPages.add(url);
                continue;
            }

            // Inject axe-core
            await page.evaluate(axe.source);

            // Run accessibility test
            const results = await page.evaluate(async () => {
                return await axe.run({
                    runOnly: {
                        type: 'tag',
                        values: ['wcag2a', 'wcag2aa']
                    }
                });
            });

            // Store results
            resultsSummary.push({ url, violations: results.violations });

            if (results.violations.length > 0) {
                console.warn(`⚠️ Found ${results.violations.length} issues on ${url}`);
            } else {
                console.log(`✅ No issues found on ${url}`);
            }

            visitedPages.add(url);

            // Extract internal links (skip discovery in single-page mode)
            if (!SINGLE_PAGE) {
                const newLinks = await page.evaluate((max) => {
                    const disallowExt = /\.(pdf|zip|rar|7z|png|jpe?g|gif|svg|webp|ico)$/i;
                    return Array.from(document.querySelectorAll('a[href]'))
                        .map(link => link.href.split('#')[0])
                        .filter(href => href.startsWith(window.location.origin))
                        .filter(href => !disallowExt.test(href))
                        .filter((href, idx, arr) => arr.indexOf(href) === idx) // de-dupe within page
                        .slice(0, max);
                }, MAX_LINKS_PER_PAGE);

                newLinks.forEach(link => {
                    if (!visitedPages.has(link) && !pagesToVisit.includes(link)) {
                        pagesToVisit.push(link);
                    }
                });
            }

        } catch (error) {
            console.error(`❌ Error testing ${url}:`, error);
            visitedPages.add(url);
        }
    }

    await browser.close();

    // Save full results and filtered reports into OUTPUT_DIR
    const fullPath = `${OUTPUT_DIR}/axe-results.json`;
    fs.writeFileSync(fullPath, JSON.stringify(resultsSummary, null, 2));

    // Build filtered views
    const filteredByFail = resultsSummary.map(p => ({
      url: p.url,
      violations: (p.violations || []).filter(v => shouldFailImpact(v.impact))
    })).filter(p => p.violations.length > 0);

    const criticalOnly = resultsSummary.map(p => ({
      url: p.url,
      violations: (p.violations || []).filter(v => (v.impact || '').toLowerCase() === 'critical')
    })).filter(p => p.violations.length > 0);

    const filteredPath = `${OUTPUT_DIR}/axe-results-fail.json`;
    const criticalPath = `${OUTPUT_DIR}/axe-results-critical.json`;
    fs.writeFileSync(filteredPath, JSON.stringify(filteredByFail, null, 2));
    fs.writeFileSync(criticalPath, JSON.stringify(criticalOnly, null, 2));

    const totals = resultsSummary.reduce((acc, r) => acc + (Array.isArray(r.violations) ? r.violations.length : 0), 0);
    const totalFailing = filteredByFail.reduce((sum, p) => sum + p.violations.length, 0);
    const totalCritical = criticalOnly.reduce((sum, p) => sum + p.violations.length, 0);

    console.log(`🎉 Accessibility tests completed. Scanned ${visitedPages.size} page(s).`);
    console.log(`📝 Saved full results to: ${fullPath}`);
    console.log(`🧭 Saved fail-threshold report (FAIL_ON=${FAIL_ON}) to: ${filteredPath}`);
    console.log(`🚩 Saved critical-only report to: ${criticalPath}`);

    if (SINGLE_PAGE) {
        console.log('ℹ️  Mode: single page (link discovery disabled). To crawl, unset TARGET_URL.');
    }
    if (!FULL_SWEEP) {
        console.log(`ℹ️  Limits: MAX_PAGES=${MAX_PAGES}, MAX_LINKS_PER_PAGE=${MAX_LINKS_PER_PAGE}. Set FULL_SWEEP=true to crawl all discovered pages (uses sitemap if available).`);
    } else {
        console.log('ℹ️  FULL_SWEEP was enabled; crawl attempted to visit all sitemap URLs and discovered internal links.');
    }

    // Proxy summary with usage examples for CI logs
    if (DISABLE_PROXY) {
        console.log('ℹ️  Proxy: disabled via --no-proxy-server (set with DISABLE_PROXY=true).');
    } else if (NO_PROXY_DOMAINS) {
        console.log(`ℹ️  Proxy: bypass domains set to ${NO_PROXY_DOMAINS} (set with NO_PROXY_DOMAINS=designsystem.nsw.gov.au,localhost,127.0.0.1).`);
    } else {
        console.log('ℹ️  Proxy: default system settings in use. Example overrides: DISABLE_PROXY=true or NO_PROXY_DOMAINS=designsystem.nsw.gov.au,localhost,127.0.0.1');
    }

    if (isCI) {
        if (FAIL_ON === 'none') {
            console.log('✅ CI passing: FAIL_ON=none (informational run only).');
            process.exit(0);
        }
        if (totalFailing > 0) {
            console.error(`🚫 Axe found ${totalFailing} violation group(s) at or above impact "${FAIL_ON}". Failing CI.`);
            process.exit(1);
        } else {
            console.log(`✅ No violations at or above impact "${FAIL_ON}". CI passing.`);
            process.exit(0);
        }
    }
})();