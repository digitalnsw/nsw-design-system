const { chromium } = require('playwright');
const axe = require('axe-core');
const fs = require('fs');

const isCI = !!process.env.CI;

(async () => {
    const browser = await chromium.launch({
        headless: isCI ? true : false
    });

    const page = await browser.newPage();
    const baseUrl = 'https://designsystem.nsw.gov.au';
    const visitedPages = new Set();
    const pagesToVisit = [baseUrl];
    const resultsSummary = [];

    const MAX_PAGES = 20;            // keep CI fast and deterministic
    const MAX_LINKS_PER_PAGE = 20;   // throttle link discovery per page

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

            // Extract internal links
            const newLinks = await page.evaluate((max) => {
                return Array.from(document.querySelectorAll('a[href]'))
                    .map(link => link.href.split('#')[0])
                    .filter(href => href.startsWith(window.location.origin))
                    .filter((href, idx, arr) => arr.indexOf(href) === idx) // de-dupe within page
                    .slice(0, max);
            }, MAX_LINKS_PER_PAGE);

            newLinks.forEach(link => {
                if (!visitedPages.has(link) && !pagesToVisit.includes(link)) {
                    pagesToVisit.push(link);
                }
            });

        } catch (error) {
            console.error(`❌ Error testing ${url}:`, error);
            visitedPages.add(url);
        }
    }

    await browser.close();

    // Save results to a file
    fs.writeFileSync('axe-results.json', JSON.stringify(resultsSummary, null, 2));

    const totals = resultsSummary.reduce((acc, r) => acc + (Array.isArray(r.violations) ? r.violations.length : 0), 0);
    console.log(`🎉 Accessibility tests completed. Scanned ${visitedPages.size} page(s). Results saved to axe-results.json`);

    if (isCI && totals > 0) {
        console.error(`🚫 Axe found ${totals} violation group(s). Failing CI.`);
        process.exit(1);
    }
})();