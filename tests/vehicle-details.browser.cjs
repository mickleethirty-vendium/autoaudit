const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:3199';
// All API requests are fulfilled/blocked in the browser, including on production.
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_EXECUTABLE });
  try {
    for (const width of [320, 375, 390, 430, 768]) {
      const context = await browser.newContext({ viewport: { width, height: 844 }, serviceWorkers: 'block' });
      let creates = 0;
      let release;
      const gate = new Promise(resolve => { release = resolve; });
      await context.route('**/*', async route => {
        const url = new URL(route.request().url());
        if (url.origin !== new URL(base).origin) return route.abort();
        if (url.pathname.startsWith('/_vercel/')) return route.fulfill({ body: '', contentType: 'application/javascript' });
        if (url.pathname === '/api/lookup-reg') return route.fulfill({ json: {
          registration: 'AB12CDE', make: 'Ford', model: null, year: 2017, fuelType: 'Petrol', engineSize: 1000
        } });
        if (url.pathname === '/api/create-report') {
          creates++;
          if (creates === 1) { await gate; return route.fulfill({ status: 503, json: { error: 'Fixture retry message' } }); }
          return route.fulfill({ json: { report_id: 'fixture-only' } });
        }
        if (url.pathname.startsWith('/api/')) return route.fulfill({ json: { count: 0 } });
        if (url.pathname.startsWith('/preview/')) return route.fulfill({ contentType: 'text/html', body: '<h1>Fixture preview</h1>' });
        if (!['GET', 'HEAD'].includes(route.request().method())) return route.abort();
        return route.continue({ headers: {
          ...route.request().headers(),
          ...(process.env.VERCEL_OIDC_TOKEN
            ? { 'x-vercel-trusted-oidc-idp-token': process.env.VERCEL_OIDC_TOKEN }
            : {}),
        } });
      });
      const page = await context.newPage();
      await page.goto(`${base}/check?registration=AB12CDE`);
      await page.locator('#vehicleModel').waitFor();
      const submit = page.getByRole('button', { name: 'Get my FREE snapshot →', exact: true });
      async function expectError(id) {
        await submit.click();
        await page.locator(`#${id}-error`).waitFor();
        assert.equal(await page.locator(`#${id}`).getAttribute('aria-invalid'), 'true');
        assert.equal(await page.locator(`#${id}`).getAttribute('aria-describedby'), `${id}-error`);
        assert.equal(await page.evaluate(() => document.activeElement.id), id);
        assert.equal(creates, 0);
      }
      await expectError('vehicleModel');
      assert.equal(await page.locator('#vehicleModel').evaluate(el => el.form), null);
      await page.locator('#vehicleModel').selectOption({ label: 'Fiesta' });
      assert.equal(await page.locator('#vehicleModel-error').count(), 0);
      await expectError('mileage');
      await page.locator('#mileage').fill('62,000');
      assert.equal(await page.locator('#mileage-error').count(), 0);
      await expectError('gearbox');
      await page.locator('#gearbox').selectOption('manual');
      assert.equal(await page.locator('#gearbox-error').count(), 0);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      const requestStarted = page.waitForRequest(request => new URL(request.url()).pathname === '/api/create-report');
      await submit.click();
      await requestStarted;
      await page.waitForFunction(() => document.querySelector('button[type="submit"]:disabled'));
      await page.locator('#mileage').evaluate(el => { el.form.requestSubmit(); el.form.requestSubmit(); });
      assert.equal(creates, 1);
      release();
      await page.getByText('Fixture retry message', { exact: true }).waitFor();
      await submit.click();
      await page.waitForURL('**/preview/fixture-only**');
      assert.equal(creates, 2);
      console.log(`PASS ${width}px: missing model/mileage/gearbox, inline associations, focus, correction, retry, duplicate protection, no overflow`);
      await context.close();
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
