// Protected-preview/browser runner. Never starts a server or calls real integrations.
const { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = process.env.TEST_BASE_URL;
if (!base) throw new Error('TEST_BASE_URL must identify the isolated fixture preview');
const origin = new URL(base).origin;
const out = process.env.BROWSER_OUTPUT_DIR;
(async () => {
  const browser = await (process.env.TEST_WEBKIT ? webkit : chromium).launch({ headless: true, ...(process.env.TEST_WEBKIT ? { executablePath: process.env.WEBKIT_EXECUTABLE } : { executablePath: process.env.BROWSER_EXECUTABLE }) });
  try {
    for (const width of (process.env.TEST_WEBKIT ? [375, 390] : [320, 375, 390, 430, 768, 1024, 1440])) {
      const context = await browser.newContext({ viewport: { width, height: width >= 1024 ? 720 : 844 }, serviceWorkers: 'block', ...(process.env.TEST_WEBKIT ? { isMobile: true, hasTouch: true, deviceScaleFactor: 3 } : {}) });
      let lookups = 0, checkouts = 0;
      let allowLookupSuccess = false;
      const events = [];
      await context.exposeBinding('__captureEvent', (_, payload) => events.push(payload));
      await context.addInitScript(() => {
        window.va = (kind, payload) => { if (kind === 'event') window.__captureEvent(payload); };
      });
      await context.route('**/*', async route => {
        const url = new URL(route.request().url());
        if (url.hostname === 'checkout.stripe.com' && url.pathname === '/c/pay/fixture') return route.fulfill({ contentType: 'text/html', body: '<h1>Intercepted checkout destination</h1>' });
        if (url.origin !== origin) return route.abort();
        if (url.pathname.startsWith('/_vercel/')) return route.fulfill({ body: '', contentType: 'application/javascript' });
        if (url.pathname === '/api/lookup-reg') {
          lookups++;
          if (!allowLookupSuccess) return route.fulfill({ status: 503, json: { error: 'Fixture lookup unavailable. Please retry.' } });
          return route.fulfill({ json: { registration: 'AB12CDE', make: 'Ford', model: 'Fiesta', year: 2017, fuelType: 'Petrol', engineSize: 1000 } });
        }
        if (url.pathname === '/api/checkout') {
          checkouts++;
          if (checkouts === 1) return route.fulfill({ status: 503, json: { error: 'Fixture checkout failure' } });
          return route.fulfill({ json: { created: true, url: 'https://checkout.stripe.com/c/pay/fixture' } });
        }
        if (url.pathname.startsWith('/api/')) return route.fulfill({ json: { count: 0 } });
        if (!['GET', 'HEAD'].includes(route.request().method())) return route.abort();
        return route.continue({ headers: { ...route.request().headers(), ...(process.env.VERCEL_OIDC_TOKEN ? { 'x-vercel-trusted-oidc-idp-token': process.env.VERCEL_OIDC_TOKEN } : {}) } });
      });
      const page = await context.newPage();
      const pages = ['/', '/cars/skoda/kodiaq/common-problems', '/mot-advisories/undertray-loose', '/best-cars-under-5000', '/check-car-by-registration', '/sample-report', '/manual-check'];
      for (const route of pages) {
        const response = await page.goto(base + route);
        assert.equal(response.status(), 200, route);
        await page.getByRole('button', { name: 'Get my FREE snapshot →', exact: true }).first().waitFor();
        assert.doesNotMatch(await page.locator('body').innerText(), /£4\.99|£9\.99/, route);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${route} overflow ${width}`);
        if (route === '/') {
          assert.equal((await page.locator('h1').innerText()).replace(/\s+/g, ' ').trim(), 'Find out what could be wrong with a used car — FREE');
          if (width < 640) {
            await page.getByRole('button', { name: 'Menu', exact: true }).click();
            await page.locator('#mobile-menu-panel').getByRole('link', { name: 'FREE vehicle snapshot', exact: true }).waitFor();
            await page.getByRole('button', { name: 'Menu', exact: true }).click();
            await page.locator('#mobile-menu-panel').waitFor({ state: 'hidden' });
          }
          const input = await page.getByLabel('UK registration', { exact: true }).boundingBox();
          assert.ok(input.y < 844, 'registration initially visible');
          if (out && [375, 390, 1440].includes(width)) { fs.mkdirSync(out, { recursive: true }); await page.screenshot({ path: path.join(out, `home-${width}.png`) }); }
        }
      }
      await page.goto(base + '/');
      const input = page.getByLabel('UK registration', { exact: true });
      await input.fill('A');
      await page.getByRole('button', { name: 'Get my FREE snapshot →', exact: true }).click();
      await page.getByText('Enter a UK registration, for example AB12 CDE.', { exact: true }).waitFor();
      assert.equal(lookups, 0);
      await input.fill('ab12 cde');
      await input.press('Enter');
      await page.waitForURL('**/check?**');
      await page.getByText('Fixture lookup unavailable. Please retry.', { exact: true }).waitFor().catch(async error => { console.log({ lookups, events, body: (await page.locator('body').innerText()).slice(0, 2200) }); throw error; });
      assert.equal(lookups, 1);
      allowLookupSuccess = true;
      await page.getByRole('button', { name: 'Get my FREE snapshot →', exact: true }).click();
      await page.locator('#mileage').waitFor();
      assert.equal(lookups, 2);
      assert.ok(new URL(page.url()).searchParams.get('registration') === 'AB12CDE');
      assert.equal(events.filter(e => e.name === 'registration_submitted').length, 2);
      assert.equal(events.filter(e => e.name === 'vrm_submitted').length, 2);
      await page.goto(base + '/preview/fixture-report?f_source=common_problems&f_position=end');
      const panel = page.locator('#snapshot-purchase');
      await panel.waitFor();
      const verdict = await page.getByRole('region', { name: 'Overall risk / exposure' }).boundingBox();
      const mot = await page.getByText('Latest MoT', { exact: true }).boundingBox();
      const purchase = await panel.boundingBox();
      assert.ok(purchase.y > verdict.y + verdict.height);
      assert.ok(purchase.y > mot.y + mot.height, 'free MOT signal before optional purchase');
      assert.match(await panel.innerText(), /Core Report · £4.99/);
      assert.match(await panel.innerText(), /Full Bundle including HPI · £9.99/);
      await panel.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      const impressions = () => events.filter(e => e.name === 'upgrade_options_viewed');
      assert.equal(impressions().length, 1);
      assert.equal(impressions()[0].data.cta_position, width >= 1024 ? 'snapshot_sidebar' : 'snapshot_primary');
      await panel.getByRole('link', { name: 'Core Report · £4.99', exact: true }).click();
      await panel.getByText(/Checkout could not be opened/).waitFor();
      assert.equal(checkouts, 1);
      assert.equal(events.filter(e => e.name === 'upgrade_selected').length, 1);
      assert.equal(events.filter(e => e.name === 'checkout_started').length, 0);
      assert.equal(events.filter(e => e.name === 'purchase_completed').length, 0);
      if (width < 1024) {
        const sticky = page.getByRole('link', { name: 'Optional analysis — from £4.99', exact: true });
        for (let n = 0; n < 2; n++) {
          await panel.evaluate(el => window.scrollTo(0, el.getBoundingClientRect().bottom + scrollY + 20));
          await sticky.waitFor();
          await sticky.locator('../..').evaluate(el => el.style.setProperty('--snapshot-bottom-inset', '34px'));
          const safeBox = await sticky.boundingBox();
          assert.ok(safeBox.y + safeBox.height <= 844 - 34, 'safe-area clearance');
          await sticky.locator('../..').evaluate(el => el.style.removeProperty('--snapshot-bottom-inset'));
          await sticky.click();
          await sticky.waitFor({ state: 'hidden' });
          assert.ok(await panel.evaluate(el => document.activeElement === el));
        }
        assert.equal(events.filter(e => e.name === 'cta_view' && e.data.cta_position === 'snapshot_mobile_sticky').length, 1);
      }
      assert.equal(impressions().length, 1);
      assert.equal(events.filter(e => e.name === 'snapshot_viewed').length, 1);
      if (width >= 1024) {
        await page.setViewportSize({ width, height: 400 });
        await panel.evaluate(el => window.scrollTo(0, el.getBoundingClientRect().top + scrollY + 30));
        const box = await panel.boundingBox();
        assert.ok(box.y >= 0 && box.y + box.height <= 400, 'short laptop sticky fits');
        await panel.getByRole('link', { name: 'Full Bundle including HPI · £9.99', exact: true }).focus();
        assert.ok(await panel.evaluate(el => el.contains(document.activeElement)));
        await page.setViewportSize({ width, height: 720 });
      }
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      assert.doesNotMatch(JSON.stringify(events), /AB12CDE|AB12 CDE|fixture-report|session_id|registration":/);
      if (out && [375, 390, 1440].includes(width)) await page.screenshot({ path: path.join(out, `snapshot-${width}.png`) });
      await panel.getByRole('link', { name: 'Core Report · £4.99', exact: true }).click();
      await page.waitForURL('https://checkout.stripe.com/c/pay/fixture');
      assert.equal(events.filter(e => e.name === 'checkout_started').length, 1);
      assert.equal(events.filter(e => e.name === 'core_report_checkout_started').length, 1);
      await page.goto(base + '/preview/fixture-report?f_source=common_problems&f_position=end');
      await page.locator('#snapshot-purchase').getByRole('link', { name: 'Full Bundle including HPI · £9.99', exact: true }).click();
      await page.waitForURL('https://checkout.stripe.com/c/pay/fixture');
      assert.equal(events.filter(e => e.name === 'checkout_started').length, 2);
      assert.equal(events.filter(e => e.name === 'bundle_checkout_started').length, 1);
      assert.equal(events.filter(e => e.name === 'purchase_completed').length, 0);
      console.log(`PASS ${width}px: landing CTAs, no premature prices, registration handoff/retry, free results first, optional tiers, analytics dedupe/privacy and checkout failure`);
      await context.close();
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
