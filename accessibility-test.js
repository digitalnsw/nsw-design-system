const { chromium } = require('playwright');
const axe = require('axe-core');
const fs = require('fs');

(async () => {
    const browser = await chromium.launch({
        headless: false, // Keep false for debugging, change to true for headless mode
        slowMo: 50, // Optional: slows down interactions
    });

    const page = await browser.newPage();
    const baseUrl = 'https://designsystem.nsw.gov.au';
    const visitedPages = new Set();
    const pagesToVisit = [baseUrl];
    const resultsSummary = [];

    while (pagesToVisit.length > 0) {
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
            const newLinks = await page.evaluate(() =>
                Array.from(document.querySelectorAll('a[href]'))
                    .map(link => link.href)
                    .filter(href => href.startsWith(window.location.origin)) // Only internal links
            );

            newLinks.forEach(link => {
                if (!visitedPages.has(link) && !pagesToVisit.includes(link)) {
                    pagesToVisit.push(link);
                }
            });

        } catch (error) {
            console.error(`❌ Error testing ${url}:`, error);
        }
    }

    await browser.close();

    // Save results to a file
    fs.writeFileSync('axe-results.json', JSON.stringify(resultsSummary, null, 2));

    console.log(`🎉 Accessibility tests completed. Results saved to axe-results.json`);
})();