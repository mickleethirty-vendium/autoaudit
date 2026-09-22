// Optional browser verification: supply PLAYWRIGHT_MODULE and BROWSER_EXECUTABLE
// from a local installation. Runs a localhost-only fixture backend and Next dev.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const out = path.resolve(root, '../cta-validation'); fs.mkdirSync(out, { recursive: true });
const log = fs.openSync(path.join(out, 'dev-server.log'), 'w');
const fixture = { id: 'fixture-report', registration: 'AB12CDE', make: 'Ford', car_year: 2017, mileage: 71842, fuel: 'petrol', transmission: 'manual', is_paid: false, hpi_unlocked: false,
  preview_payload: { summary: { exposure_low: 300, exposure_high: 800, risk_level: 'medium', asking_price: 5000 }, buckets: [{ key: 'brakes', system: 'brakes', category: 'brakes', label: 'Brakes', exposure_low: 200, exposure_high: 400 }] },
  full_payload: { summary: { exposure_low: 300, exposure_high: 800 }, items: [], ukvd: { enrichment_applied: true } },
  mot_payload: { motTests: [{ completedDate: '2026-03-18', testResult: 'PASSED', odometerValue: '71842', odometerUnit: 'mi', defects: [{ type: 'ADVISORY', text: 'Front brake discs worn' }] }] } };
let writes = 0;
const backend = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json'); res.setHeader('Access-Control-Allow-Origin', '*');
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) { writes++; res.writeHead(405); return res.end('{}'); }
  if (req.method === 'HEAD') { res.setHeader('Content-Range', '0-0/0'); return res.end(); }
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/rest/v1/reports') {
    if (['eq.manual-fixture','eq.manual-paid'].includes(url.searchParams.get('id'))) return res.end(JSON.stringify({...fixture, registration:null, is_paid:url.searchParams.get('id')==='eq.manual-paid', id:url.searchParams.get('id').slice(3)}));
    const data = url.searchParams.get('id') === 'eq.paid-fixture' ? { ...fixture, id: 'paid-fixture', is_paid: true } : fixture;
    return res.end(JSON.stringify(req.headers.accept?.includes('vnd.pgrst.object') ? data : [data]));
  }
  res.writeHead(200); res.end('{}');
});
let app, browser;
const results = [];
async function run(name, fn) { if (process.env.BROWSER_LAYOUT_ONLY && !name.startsWith('representative')) return; await fn(); results.push({ name, result: 'PASS' }); console.log(`PASS ${name}`); }
const delay = ms => new Promise(r => setTimeout(r, ms));
async function main() {
  await new Promise(resolve => backend.listen(54329, '127.0.0.1', resolve));
  app = spawn(process.execPath, [path.join(root, 'node_modules/next/dist/bin/next'), 'dev', '-p', '3100', '-H', '127.0.0.1'], { cwd: root, windowsHide: true, stdio: ['ignore', log, log], env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1', NEXT_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:54329', NEXT_PUBLIC_SUPABASE_ANON_KEY: 'local-fixture-only', SUPABASE_SERVICE_ROLE_KEY: 'local-fixture-only', STRIPE_SECRET_KEY: 'sk_test_local_fixture_only', NEXT_PUBLIC_APP_URL: 'http://127.0.0.1:3100' } });
  for (let n=0;n<100;n++) { try { if ((await fetch('http://127.0.0.1:3100/check-car-by-registration')).ok) break; } catch {} await delay(500); }
  browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_EXECUTABLE });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  let captured = [];
  await context.exposeBinding('__captureEvent', (_, record) => captured.push(record));
  await context.addInitScript(() => {
    window.__events = [];
    let beforeSend = event => event;
    window.va = (kind, payload) => {
      if (kind === 'beforeSend') beforeSend = payload;
      if (kind === 'event') {
        const record = { ...payload, url: beforeSend({ type: 'event', url: location.href }).url };
        window.__events.push(record);
        window.__captureEvent(record);
        sessionStorage.setItem('__testEvents', JSON.stringify([...JSON.parse(sessionStorage.getItem('__testEvents') || '[]'), record]));
      }
    };
  });
  await context.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.hostname !== '127.0.0.1' && url.hostname !== 'localhost') return route.abort();
    if (url.pathname.startsWith('/_vercel/')) return route.fulfill({ contentType: 'application/javascript', body: '' });
    if (url.pathname === '/api/stats/daily-report-count') return route.fulfill({ json: { count: 0 } });
    if (url.pathname === '/api/lookup-reg') return route.fulfill({ json: { registration: 'AB12CDE', make: 'Ford', model: 'Fiesta', year: 2017, fuelType: 'Petrol', engineSize: 1000, motStatus: 'Valid' } });
    if (url.pathname === '/api/create-report') return route.fulfill({ json: { report_id: 'fixture-report' } });
    return route.continue();
  });
  const page = await context.newPage(); const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const go = async url => { await page.goto(`http://127.0.0.1:3100${url}`); await page.waitForLoadState('networkidle'); };
  const events = async () => captured;
  const clear = async () => { captured = []; };
  await run('mobile content precedes CTA; invalid VRM stays inline; Enter reaches lookup once', async () => {
    await go('/cars/bmw/x5/common-problems'); await clear();
    assert.ok((await page.locator('h1').boundingBox()).y < (await page.locator('input[name=registration]').first().boundingBox()).y);
    const reg = page.locator('input[name=registration]').first(); await reg.fill('!'); await reg.press('Enter');
    await page.getByRole('alert').filter({ hasText: 'Enter a UK registration' }).waitFor(); assert.match(page.url(), /common-problems$/);
    await reg.fill('ab12 cde'); await reg.press('Enter'); await page.waitForURL('**/check?**');
    await page.getByText('Step 1 complete', { exact: true }).waitFor();
    const emitted = await events(); assert.equal(emitted.filter(e => e.name === 'vrm_submitted').length, 1); assert.equal(emitted.filter(e => e.name === 'vehicle_found').length, 1);
    assert.equal(emitted.find(e=>e.name==='vehicle_found').data.funnel_source, 'common_problems');
    assert.ok(emitted.every(e=>!JSON.stringify(e).includes('AB12CDE')));
    await page.screenshot({ path: path.join(out, 'mobile-vehicle-details.png'), fullPage: true });
  });
  await run('vehicle details reach one snapshot view with source retained', async () => {
    await page.locator('#mileage').fill('71842');
    await page.locator('#gearbox').selectOption('manual');
    await page.getByRole('button', { name: /snapshot|preview/i }).click();
    await page.waitForURL('**/preview/fixture-report**'); await page.getByText('Your snapshot is free. Choose more detail if it helps.').waitFor();
    assert.equal((await events()).filter(e => e.name === 'snapshot_viewed').length, 1);
    await page.screenshot({ path: path.join(out, 'mobile-snapshot.png'), fullPage: true });
  });
  await run('checkout failure is retryable and does not emit checkout_started', async () => {
    await clear(); await page.route('**/api/checkout?**', route=>route.fulfill({ status: 500, json: { error: 'fixture failure' } }));
    await page.getByRole('link', { name: 'Unlock Core Report · £4.99' }).first().click();
    await page.getByRole('alert').filter({ hasText: 'Checkout could not be opened' }).waitFor();
    assert.equal((await events()).filter(e=>e.name.includes('checkout_started')).length, 0);
    assert.equal((await events()).filter(e=>e.name==='checkout_failed').length, 1);
    await page.unroute('**/api/checkout?**');
  });
  await run('checkout starts only after valid session response and carries source', async () => {
    let requestUrl;
    await page.route('**/api/checkout?**', route => { requestUrl = route.request().url(); return route.fulfill({ json: { created: true, url: 'https://checkout.stripe.com/c/pay/fixture' } }); });
    await page.getByRole('link', { name: 'Unlock Core Report · £4.99' }).first().click();
    await delay(300);
    assert.equal((await events()).filter(e=>e.name==='core_report_checkout_started').length, 1);
    assert.equal(new URL(requestUrl).searchParams.get('source'), 'preview');
    assert.equal(new URL(requestUrl).searchParams.get('f_source'), 'common_problems');
    await page.unroute('**/api/checkout?**');
  });
  await run('legacy VRM and asking-price links start the existing lookup', async () => {
    await go('/check-car-by-registration?vrm=ab12%20cde&asking_price=5000&f_source=buying_guide');
    assert.match(page.url(), /\/check\?/); assert.match(page.url(), /registration=AB12CDE/);
    await page.getByText('Step 1 complete', { exact: true }).waitFor();
    assert.equal(await page.locator('#askingPrice').inputValue(), '5000');
  });
  await run('sample is labelled, does not emit paid_report_viewed, sticky can be dismissed', async () => {
    await go('/sample-report'); await clear(); await page.reload(); await page.waitForLoadState('networkidle');
    await page.getByRole('heading', { name: /example Full Bundle/ }).waitFor();
    assert.equal((await events()).filter(e=>e.name==='sample_report_viewed').length, 1);
    assert.equal((await events()).filter(e=>e.name==='paid_report_viewed').length, 0);
    await page.locator('[data-sample-check]').first().scrollIntoViewIfNeeded();
    await page.getByRole('button', { name: 'Dismiss check a car bar' }).waitFor({ state: 'hidden' });
    await page.screenshot({ path: path.join(out, 'mobile-sample.png'), fullPage: false });
    await page.evaluate(()=>window.scrollBy(0, 950));
    await page.getByRole('button', { name: 'Dismiss check a car bar' }).waitFor();
    await page.getByRole('button', { name: 'Dismiss check a car bar' }).click();
    assert.equal(await page.getByRole('button', { name: 'Dismiss check a car bar' }).count(), 0);
  });
  await run('cancellation preserves snapshot/Core access and real report analytics', async () => {
    await go('/preview/fixture-report?checkout_cancelled=1'); await page.getByRole('status').filter({ hasText: 'Checkout was cancelled' }).waitFor();
    await clear(); await go('/report/paid-fixture?checkout_cancelled=1&tier=hpi_upgrade');
    await page.getByRole('status').filter({ hasText: 'Your Core Report remains available' }).waitFor();
    assert.equal((await events()).filter(e=>e.name==='paid_report_viewed').length, 1);
    assert.equal((await events()).filter(e=>e.name==='purchase_completed').length, 0);
  });

  await run('manual reports expose Core only and server rejects crafted Bundle/upgrade requests', async () => {
    await go('/preview/manual-fixture');
    assert.equal(await page.locator('a[href*="tier=report_plus_hpi"]').count(),0);
    assert.equal(await page.locator('a[href*="tier=report&"]').count(),2);
    await page.getByText('This manual check has no registration.',{exact:false}).first().waitFor();
    for(const [id,tier] of [['manual-fixture','report_plus_hpi'],['manual-paid','hpi_upgrade']]) {
      const response=await page.request.get(`http://127.0.0.1:3100/api/checkout?report_id=${id}&tier=${tier}`,{headers:{Accept:'application/json'}});
      assert.equal(response.status(),400);assert.match((await response.json()).error,/registration/);
    }
    await go('/report/manual-paid');
    assert.equal(await page.locator('a[href*="hpi_upgrade"]').count(),0);
    await page.getByText('History checks require a registration. Your Core Report remains available.').first().waitFor();
  });
  await run('current URL attribution beats stale storage, survives fresh tabs and cancellation', async () => {
    for(const source of ['common_problems','mot_advisory']) {
      await go(`/preview/fixture-report?f_source=${source}&f_landing=${source}&f_variant=general&f_position=end&checkout_cancelled=1`);
      await page.evaluate(()=>{sessionStorage.clear();sessionStorage.setItem('aa_funnel_context',JSON.stringify({funnel_source:'homepage',cta_position:'hero'}));});
      let requested;
      await page.route('**/api/checkout?**',route=>{requested=new URL(route.request().url());return route.fulfill({status:500,json:{error:'fixture'}});});
      await clear();await page.getByRole('link',{name:'Unlock Core Report · £4.99'}).first().click();
      await page.getByText('Checkout could not be opened.',{exact:false}).waitFor();
      assert.equal(requested.searchParams.get('f_source'),source);
      assert.equal(requested.searchParams.get('f_position'),'end');
      assert.equal((await events()).find(e=>e.name==='cta_click').data.funnel_source,source);
      await page.unroute('**/api/checkout?**');
    }
    const fresh=await context.newPage();
    await fresh.goto('http://127.0.0.1:3100/preview/fixture-report?f_source=buying_guide&f_variant=buying-guide&f_position=end');
    await fresh.waitForLoadState('networkidle');
    const href=await fresh.getByRole('link',{name:'Unlock Core Report · £4.99'}).first().getAttribute('href');
    assert.equal(new URL(href,'http://localhost').searchParams.get('f_source'),'buying_guide');
    await fresh.close();
  });
  await run('lookup failure preserves origin through manual fallback', async () => {
    await page.route('**/api/lookup-reg',route=>route.fulfill({status:404,json:{error:'Vehicle not found'}}));
    await go('/check?registration=AB12CDE&f_source=common_problems&f_variant=common-problems&f_position=end');
    await page.getByText('Vehicle not found',{exact:true}).waitFor();
    assert.equal(await page.getByRole('button',{name:'Find vehicle'}).isEnabled(),true);
    await page.getByRole('link',{name:'Or check manually'}).click();
    await page.waitForURL('**/manual-check?**');
    assert.equal(new URL(page.url()).searchParams.get('f_source'),'common_problems');
    await page.unroute('**/api/lookup-reg');
    await page.locator('#manual-make').selectOption('ford');
    await page.locator('#manual-model').selectOption('fiesta');
    await page.locator('#manual-year').fill('2017');
    await page.locator('#manual-fuelType').selectOption('petrol');
    await page.locator('#manual-engineSize').fill('1.0');
    await page.locator('#manual-mileage').fill('71842');
    await page.locator('#manual-gearbox').selectOption('manual');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/preview/fixture-report?**');
    assert.equal(new URL(page.url()).searchParams.get('f_source'),'common_problems');
    assert.equal(new URL(page.url()).searchParams.get('f_position'),'end');
  });
  await run('repeated checkout controls cannot create concurrent sessions', async () => {
    await go('/preview/fixture-report');let calls=0;let finish;
    await page.route('**/api/checkout?**',async route=>{calls++;await new Promise(resolve=>finish=resolve);await route.fulfill({status:500,json:{error:'fixture'}});});
    await page.getByRole('link',{name:'Unlock Core Report · £4.99'}).first().click();await delay(100);
    await page.locator('a[href*="tier=report_plus_hpi"]').first().click({force:true});
    assert.equal(calls,1);finish();await page.getByText('Checkout could not be opened.',{exact:false}).waitFor();
    assert.equal(await page.locator('a[href*="tier=report_plus_hpi"]').first().getAttribute('aria-disabled'),'false');
    await page.unroute('**/api/checkout?**');
  });
  await run('sticky impression counts once despite repeated remounts', async () => {
    await clear();await go('/sample-report');
    for(let i=0;i<3;i++) {
      await page.locator('[data-sample-check]').first().scrollIntoViewIfNeeded();await delay(150);
      await page.evaluate(()=>window.scrollBy(0,1100));await delay(150);
    }
    assert.equal((await events()).filter(e=>e.name==='cta_view'&&e.data.cta_position==='sticky').length,1);
  });
  await run('unpaid report contact does not collide; mobile decorative hero is not requested', async () => {
    for(const width of [768,1024,1440]) {
      await page.setViewportSize({width,height:844});await go('/report/fixture-report');
      assert.equal(await page.locator('a.fixed[href="mailto:support@autoaudit.uk"]').count(),0);
      assert.ok(await page.locator('footer a[href="mailto:support@autoaudit.uk"]').count());
    }
    await page.setViewportSize({width:390,height:844});const images=[];
    const listen=request=>{if(request.resourceType()==='image')images.push(request.url());};page.on('request',listen);
    await go('/cars/bmw/x5/common-problems');
    await go('/mot-advisories/brake-pads-worn/bmw/x5');page.off('request',listen);
    assert.equal(images.some(url=>url.includes('hero-car-road')),false);
  });
  await run('SDK exceptions and unavailable storage cannot break conversion', async () => {
    const isolated=await browser.newContext({viewport:{width:390,height:844}});
    await isolated.addInitScript(()=>{
      window.va=()=>{throw new Error('Injected SDK failure')};
      Object.defineProperty(window,'sessionStorage',{get(){throw new Error('Unavailable storage')}});
    });
    await isolated.route('**/*',route=>{
      const url=new URL(route.request().url());
      if(url.hostname!=='127.0.0.1')return route.abort();
      if(url.pathname==='/api/lookup-reg')return route.fulfill({json:{registration:'AB12CDE',make:'Ford',model:'Fiesta',year:2017,fuelType:'Petrol'}});
      if(url.pathname.startsWith('/_vercel/'))return route.fulfill({body:''});
      return route.continue();
    });
    const other=await isolated.newPage();const failures=[];other.on('pageerror',e=>failures.push(e.message));
    await other.goto('http://127.0.0.1:3100/');
    await other.locator('input[name=registration]').first().fill('AB12CDE');
    await other.locator('input[name=registration]').first().press('Enter');
    await other.getByText('Step 1 complete',{exact:true}).waitFor();
    assert.deepEqual(failures,[]);await isolated.close();
  });

  await run('lookup, report creation and checkout timeouts recover and ignore late success', async () => {
    const timed=await browser.newContext({viewport:{width:390,height:844}});
    await timed.addInitScript(()=>{
      const original=window.setTimeout.bind(window);
      window.setTimeout=(fn,ms,...args)=>original(fn,ms>=30000&&ms<=35000?150:ms,...args);
    });
    let lookupCalls=0,createCalls=0,checkoutCalls=0;
    await timed.route('**/*',async route=>{
      const url=new URL(route.request().url());
      if(url.hostname!=='127.0.0.1')return route.abort();
      if(url.pathname.startsWith('/_vercel/'))return route.fulfill({body:''});
      if(url.pathname==='/api/lookup-reg') {
        lookupCalls++;if(lookupCalls===1)await delay(600);
        return route.fulfill({json:{registration:'AB12CDE',make:'Ford',model:'Fiesta',year:2017,fuelType:'Petrol'}}).catch(()=>{});
      }
      if(url.pathname==='/api/create-report') {
        createCalls++;if(createCalls===1)await delay(600);
        return route.fulfill({json:{report_id:'fixture-report'}}).catch(()=>{});
      }
      if(url.pathname==='/api/checkout') {
        checkoutCalls++;await delay(600);
        return route.fulfill({json:{created:true,url:'https://checkout.stripe.com/c/pay/fixture'}}).catch(()=>{});
      }
      return route.continue();
    });
    const tab=await timed.newPage();
    await tab.goto('http://127.0.0.1:3100/check?registration=AB12CDE');
    await tab.getByText('This is taking longer than expected. Please try again.',{exact:true}).waitFor();
    await delay(650);assert.equal(await tab.getByText('Step 1 complete',{exact:true}).count(),0);
    await tab.getByRole('button',{name:'Find vehicle'}).click();
    await tab.getByText('Step 1 complete',{exact:true}).waitFor();
    await tab.locator('#mileage').fill('71842');await tab.locator('#gearbox').selectOption('manual');
    assert.equal(await tab.getByLabel('Asking price',{exact:true}).count(),1);
    await tab.getByRole('button',{name:'Continue to free preview'}).click();
    await tab.getByText('This is taking longer than expected. Please try again.',{exact:true}).waitFor();
    await delay(650);assert.match(tab.url(),/\/check\?/);
    await tab.getByRole('button',{name:'Continue to free preview'}).click();await tab.waitForURL('**/preview/fixture-report?**');
    await tab.getByRole('link',{name:'Unlock Core Report · £4.99'}).first().click();
    await tab.getByText('Checkout could not be opened.',{exact:false}).waitFor();
    await delay(650);assert.match(tab.url(),/\/preview\//);assert.equal(checkoutCalls,1);
    assert.equal(await tab.locator('a[href*="tier=report_plus_hpi"]').first().getAttribute('aria-disabled'),'false');
    await timed.close();
  });
  const routes = ['/', '/cars', '/cars/bmw', '/cars/bmw/x5', '/cars/bmw/x5/common-problems', '/mot-advisories', '/mot-advisories/brake-pads-worn', '/mot-advisories/brake-pads-worn/bmw/x5', '/best-cars-under-5000', '/used-car-buying-checklist-uk', '/check-car-by-registration', '/pricing', '/how-it-works', '/sample-report', '/preview/fixture-report', '/report/paid-fixture', '/report/fixture-report', '/preview/manual-fixture', '/report/manual-paid', '/manual-check'];
  await run('representative templates have no horizontal overflow at 320, 375, 390, 430, 768, 1024 and 1440px', async () => {
    for (const width of [320, 375, 390, 430, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 844 });
      for (const route of routes) {
        await go(route);
        assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth + 1), `${route} overflow at ${width}`);
        if (width === 390 && ['/', '/cars/bmw/x5/common-problems', '/pricing', '/sample-report', '/preview/fixture-report'].includes(route)) {
          const slug = route === '/' ? 'home' : route.split('/').filter(Boolean).join('-');
          await page.screenshot({ path: path.join(out, `mobile-${slug}-top.png`) });
          if (await page.locator('input[name=registration]').count()) { await page.locator('input[name=registration]').first().scrollIntoViewIfNeeded(); await delay(150); await page.screenshot({ path: path.join(out, `mobile-${slug}-cta.png`) }); }
        }
        const inputs = await page.locator('input[name=registration]').all();
        for (const input of inputs) { const box=await input.boundingBox(); if (box.height < 44 || box.width < 100) { console.log('Input dimensions', box, await input.evaluate(el=>({height:getComputedStyle(el).height,flex:getComputedStyle(el).flex,minHeight:getComputedStyle(el).minHeight}))); await input.scrollIntoViewIfNeeded(); await page.screenshot({path:path.join(out,'layout-failure.png')}); } assert.ok(box.height >= 44 && box.width >= 100, `${route} input target at ${width}`); }
      }
    }
  });
  assert.equal(writes, 0, 'Fixture backend received an unexpected write');
  assert.ok(captured.every(event => !/AB12CDE|fixture-report|paid-fixture|session_id/.test(JSON.stringify(event))), 'Analytics included vehicle or record identifiers');
  assert.deepEqual(errors, [], 'Browser runtime errors');
  fs.writeFileSync(path.join(out, 'browser-results.json'), JSON.stringify(results, null, 2));
}
main().catch(error => { console.error(error); process.exitCode = 1; fs.writeFileSync(path.join(out, 'browser-results.json'), JSON.stringify({ results, failure: error.message }, null, 2)); }).finally(async () => { if(browser) await browser.close(); if(app) app.kill(); backend.close(); fs.closeSync(log); });
