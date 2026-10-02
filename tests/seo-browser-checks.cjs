const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');

module.exports = async function checkSeo({ context, page, out }) {
  const base = 'http://127.0.0.1:3100';
  const xml = await (await context.request.get(`${base}/sitemap.xml`)).text();
  const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(x => x[1]);
  assert.equal(urls.length, 438);
  const visited = new Set();
  const incoming = new Set();
  let schemaCount = 0;
  async function inspect(url, indexable = true) {
    const pathname = new URL(url, base).pathname;
    const response = await context.request.get(base + pathname);
    assert.equal(response.status(), 200, pathname);
    const html = await response.text();
    const canonical = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/);
    assert.ok(canonical, `canonical ${pathname}`);
    assert.equal(new URL(canonical[1]).pathname, pathname, `self canonical ${pathname}`);
    const robots = html.match(/<meta[^>]*name="robots"[^>]*content="([^"]+)"/)?.[1];
    if (indexable) assert.ok(!robots?.includes('noindex'), pathname);
    else assert.ok(robots?.includes('noindex') && robots?.includes('follow'), pathname);
    for (const match of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
      const schema = JSON.parse(match[1]);
      assert.equal(schema['@context'], 'https://schema.org');
      if (schema['@type'] === 'FAQPage') {
        assert.ok(schema.mainEntity.length);
        for (const entry of schema.mainEntity) assert.ok(html.includes(entry.name.replaceAll('&', '&amp;')) || html.includes(entry.name));
      }
      if (schema['@type'] === 'BreadcrumbList') {
        assert.equal(new URL(schema.itemListElement.at(-1).item).pathname, pathname);
      }
      schemaCount++;
    }
    for (const match of html.matchAll(/<a\b[^>]*href="(\/[^"#?]*)[^\"]*"/g)) incoming.add(match[1]);
    visited.add(pathname);
    return html;
  }
  let cursor = 0;
  await Promise.all(Array.from({ length: 3 }, async () => {
    while (cursor < urls.length) await inspect(urls[cursor++]);
  }));
  const catalogue = require('../data/seo/makes_models.json');
  const manifest = new Set(require('../data/seo/published_models.json'));
  for (const make of new Set(catalogue.map(x => x.make_slug))) {
    const curated = catalogue.some(x => x.make_slug === make && manifest.has(x.full_slug));
    if (!curated) await inspect(`/cars/${make}`, false);
  }
  // Existing on-demand children keep their canonicals and indexability.
  for (const url of ['/cars/fiat/panda', '/cars/fiat/panda/common-problems', '/cars/ford/mondeo', '/mot-advisories/brake-pads-worn/fiat/panda']) await inspect(url);
  for (const url of urls) assert.ok(new URL(url).pathname === '/' || incoming.has(new URL(url).pathname), `No incoming link: ${url}`);
  for (const row of catalogue) {
    assert.ok(incoming.has(`/cars/${row.make_slug}`), `parent path ${row.make_slug}`);
    assert.ok(incoming.has(`/cars/${row.full_slug}`), `model hub ${row.full_slug}`);
  }
  for (const row of require('../data/seo/mot_advisory_types.json')) assert.ok(incoming.has(`/mot-advisories/${row.advisory_slug}`));
  const config = require('../next.config.js');
  for (const redirect of (await config.redirects()).slice(1)) {
    const response = await context.request.get(base + redirect.source, { maxRedirects: 0 });
    assert.equal(response.status(), 308);
    assert.equal(new URL(response.headers().location, base).pathname, redirect.destination);
  }
  const routes = ['/cars', '/cars/fiat', '/cars/ford', '/cars/fiat/panda', '/mot-advisories', '/mot-advisories/brake-pads-worn', '/cars/skoda/kodiaq/common-problems', '/cars/citroen/berlingo/common-problems', '/mot-advisories/undertray-loose', '/mot-advisories/ac-not-cold', '/diagnostics/engine-starting-electrical', '/diagnostics/car-losing-power', '/diagnostics/adblue-warning-no-start'];
  for (const width of [320, 375, 390, 430, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    for (const route of routes) {
      await page.goto(base + route);
      await page.waitForLoadState('networkidle');
      for (const details of await page.locator('main details').all()) await details.locator('summary').click();
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${route} at ${width}`);
      if (route === '/cars' && width === 390) {
        const summary = page.locator('summary').first();
        await summary.focus();
        await page.keyboard.press('Enter');
        assert.equal(await summary.evaluate(el => el.parentElement.open), false);
        await page.keyboard.press('Enter');
        assert.equal(await summary.evaluate(el => el.parentElement.open), true);
      }
      if ([390, 1440].includes(width) && ['/cars/skoda/kodiaq/common-problems', '/mot-advisories/undertray-loose', '/diagnostics/car-losing-power', '/diagnostics/engine-starting-electrical'].includes(route)) {
        await page.screenshot({ path: path.join(out, `seo-${route.split('/').filter(Boolean).join('-')}-${width}.png`), fullPage: true });
      }
    }
  }
  fs.writeFileSync(path.join(out, 'seo-results.json'), JSON.stringify({ sitemap: urls.length, routesChecked: visited.size, schemaBlocks: schemaCount, responsiveCombinations: routes.length * 7, incomingLinks: incoming.size, result: 'PASS' }, null, 2));
};
