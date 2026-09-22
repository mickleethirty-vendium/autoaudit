const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const resolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...args) {
  return resolve.call(this, request.startsWith('@/') ? path.join(root, request.slice(2)) : request, ...args);
};
for (const ext of ['.ts', '.tsx']) require.extensions[ext] = (module, file) => module._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true, target: ts.ScriptTarget.ES2020 } }).outputText, file);

const vehicle = require('../lib/vehicleCheck.ts');
const policy = require('../lib/analyticsPolicy.ts');
const checkout = require('../lib/checkout.ts');

test('normalises whitespace/case and formats modern plates without truncating older plates', () => {
  assert.equal(vehicle.normaliseRegistration(' ab12 cde '), 'AB12CDE');
  assert.equal(vehicle.formatRegistration('ab12cde'), 'AB12 CDE');
  assert.equal(vehicle.formatRegistration('a123 bcd'), 'A123BCD');
  assert.equal(vehicle.formatRegistration('AB123456'), 'AB123456');
  for (const value of ['AB12 CDE', 'A123BCD', 'ABC123D', '123ABC', 'AB1234', 'AB123456']) assert.equal(vehicle.isLikelyUkRegistration(value), true);
  for (const value of ['', 'A', 'AB12@CDE', 'ABCDEFGHI', '<script>']) assert.equal(vehicle.isLikelyUkRegistration(value), false);
});
test('handoff preserves asking price and bounded attribution but drops arbitrary/sensitive query parameters', () => {
  const url = new URL(vehicle.buildCheckUrl(' ab12 cde ', new URLSearchParams('asking_price=5,000&f_source=common_problems&f_variant=common-problems&f_position=end&email=private&session_id=secret&next=https://evil.test')), 'https://autoaudit.uk');
  assert.equal(url.pathname, '/check');
  assert.equal(url.searchParams.get('registration'), 'AB12CDE');
  assert.equal(url.searchParams.get('asking_price'), '5000');
  assert.equal(url.searchParams.get('f_source'), 'common_problems');
  assert.equal(url.searchParams.has('email'), false);
  assert.equal(url.searchParams.has('session_id'), false);
  assert.equal(url.searchParams.has('next'), false);
  assert.equal(vehicle.funnelParams(new URLSearchParams('f_source=AB12CDE&f_position=private')).size, 0);
});
test('analytics removes record IDs, VRMs, prices, email and raw errors', () => {
  assert.deepEqual(policy.safeEventData({ page: 'check', report_id: 'private', registration: 'AB12CDE', email: 'private@example.test', error: 'sensitive', exposure_high: 1234, reason: 'lookup_error', tier: 'report', has_model: true }), { page_type: 'check', reason: 'lookup_error', tier: 'report', has_model: true });
});
test('analytics URL policy strips all queries/fragments and private record paths', () => {
  assert.equal(policy.safeAnalyticsUrl('https://autoaudit.uk/report/private-id?session_id=secret#details'), 'https://autoaudit.uk/report');
  assert.equal(policy.safeAnalyticsUrl('https://autoaudit.uk/check?registration=AB12CDE&email=private'), 'https://autoaudit.uk/check');
  assert.equal(policy.safeAnalyticsUrl('https://autoaudit.uk/preview/private'), 'https://autoaudit.uk/preview');
  assert.equal(policy.safeAnalyticsUrl('https://autoaudit.uk/cars/bmw/x5/common-problems?utm_source=test'), 'https://autoaudit.uk/cars/bmw/x5/common-problems');
});
test('checkout cancellation distinguishes new reports from HPI upgrades', () => {
  assert.equal(checkout.checkoutReturnPath('fixture-id', 'report'), '/preview/fixture-id?checkout_cancelled=1&tier=report');
  assert.equal(checkout.checkoutReturnPath('fixture-id', 'report_plus_hpi'), '/preview/fixture-id?checkout_cancelled=1&tier=report_plus_hpi');
  assert.equal(checkout.checkoutReturnPath('fixture-id', 'hpi_upgrade'), '/report/fixture-id?checkout_cancelled=1&tier=hpi_upgrade');
  assert.equal(checkout.checkoutSource('private-id'), 'unknown');
});
test('checkout event taxonomy separates paid products', () => {
  assert.equal(checkout.checkoutStartedEvent('report'), 'core_report_checkout_started');
  assert.equal(checkout.checkoutStartedEvent('report_plus_hpi'), 'bundle_checkout_started');
  assert.equal(checkout.checkoutStartedEvent('hpi_upgrade'), 'hpi_upgrade_checkout_started');
  assert.equal(new Set(Object.values(policy.AnalyticsEvents)).size, Object.values(policy.AnalyticsEvents).length);
});

// Exercise the real route against a local Stripe stub. No network or real keys.
process.env.STRIPE_SECRET_KEY = 'sk_test_local_fixture_only';
process.env.STRIPE_REPORT_PRICE_ID = 'price_fixturecore';
process.env.STRIPE_REPORT_PLUS_HPI_PRICE_ID = 'price_fixturebundle';
process.env.STRIPE_HPI_UPGRADE_PRICE_ID = 'price_fixturehpi';
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
let eligibleReport = { registration: "AB12CDE", is_paid: true };
let createCalls = [];
let createResult = { url: 'https://checkout.stripe.com/c/pay/fixture' };
const load = Module._load;
Module._load = function (request, ...args) {
  if (request === '@/lib/supabase') return { supabaseAdmin: { from: () => ({ select() { return this; }, eq() { return this; }, abortSignal() { return this; }, maybeSingle: async () => ({ data: eligibleReport, error: null }) }) } };
  if (request === 'stripe') return class { checkout = { sessions: { create: async (args) => { createCalls.push(args); return createResult; } } }; };
  if (request === 'next/navigation') return { usePathname: () => '/cars/bmw/x5/common-problems', useSearchParams: () => new URLSearchParams(), useRouter: () => ({ push() {} }) };
  return load.call(this, request, ...args);
};
const { GET } = require('../app/api/checkout/route.ts');
test('invalid checkout input never creates a session', async () => {
  createCalls = [];
  const response = await GET(new Request('http://localhost/api/checkout?report_id=x'));
  assert.equal(response.status, 400); assert.equal(createCalls.length, 0);
});
test('JSON checkout acknowledgement follows actual session creation and preserves source/tier', async () => {
  createCalls = [];
  const response = await GET(new Request('http://localhost/api/checkout?report_id=fixture-id&tier=report_plus_hpi&source=preview', { headers: { Accept: 'application/json' } }));
  assert.equal(response.status, 200); assert.deepEqual(await response.json(), { url: createResult.url, created: true });
  assert.equal(createCalls.length, 1); const args = createCalls[0];
  assert.equal(args.line_items[0].price, 'price_fixturebundle');
  assert.equal(args.metadata.checkout_source, 'preview');
  assert.equal(args.metadata.unlock_hpi, 'true');
  assert.match(args.success_url, /report\/fixture-id\?session_id=\{CHECKOUT_SESSION_ID\}&tier=report_plus_hpi$/);
});
test('ordinary checkout navigation retains Stripe redirect fallback', async () => {
  const response = await GET(new Request('http://localhost/api/checkout?report_id=fixture-id&tier=hpi_upgrade&source=report'));
  assert.equal(response.status, 307); assert.equal(response.headers.get('location'), createResult.url);
  assert.match(createCalls.at(-1).cancel_url, /\/report\/fixture-id\?checkout_cancelled=1&tier=hpi_upgrade$/);
});
test('session without a Stripe URL is not acknowledged as created', async () => {
  createResult = {}; const originalError = console.error; console.error = () => {};
  try { const response = await GET(new Request('http://localhost/api/checkout?report_id=fixture-id', { headers: { Accept: 'application/json' } })); assert.equal(response.status, 500); assert.equal((await response.json()).created, undefined); }
  finally { console.error = originalError; createResult = { url: 'https://checkout.stripe.com/c/pay/fixture' }; }
});
test('shared CTA renders a labelled, native GET form with intent copy and no payment requirement', () => {
  const React = require('react'); const { renderToStaticMarkup } = require('react-dom/server');
  const CTA = require('../components/seo/RegLookupCta.tsx').default;
  const html = renderToStaticMarkup(React.createElement(CTA, { intent: 'mot-advisory', position: 'end' }));
  assert.match(html, /action="\/check"/); assert.match(html, /method="get"/); assert.match(html, /<label for="/);
  assert.match(html, /name="registration"/); assert.match(html, /Check its history/); assert.match(html, /No payment details needed/);
  assert.doesNotMatch(html, /action="\/check-car-by-registration"/);
});

test('purchase analytics deduplicates StrictMode effects and reloads without exporting session identifiers', async () => {
  let effect; const emitted = []; const saved = new Map();
  const previousLoad = Module._load;
  Module._load = function (request, parent, ...args) {
    if (parent?.filename.endsWith('PurchaseAnalytics.tsx') && request === 'react') return { useEffect: fn => { effect = fn; } };
    if (parent?.filename.endsWith('PurchaseAnalytics.tsx') && request === '@/lib/analytics') return { AnalyticsEvents: policy.AnalyticsEvents, trackEvent: (name, data) => emitted.push({ name, data }) };
    return previousLoad.call(this, request, parent, ...args);
  };
  const oldStorage = global.localStorage;
  global.localStorage = { getItem: key => saved.get(key), setItem: (key, value) => saved.set(key, value) };
  try {
    const file = require.resolve('../components/conversion/PurchaseAnalytics.tsx');
    let Component = require(file).default;
    Component({ sessionId: 'cs_test_private_fixture', tier: 'report', context: { funnel_source: 'common_problems' } });
    const cancel = effect(); cancel(); effect();
    await new Promise(resolve => setTimeout(resolve, 30));
    assert.equal(emitted.length, 1);
    assert.deepEqual(emitted[0], { name: 'purchase_completed', data: { page_type: 'report', tier: 'report', funnel_source: 'common_problems' } });
    assert.ok(!JSON.stringify(emitted).includes('private_fixture'));
    assert.ok([...saved.keys()].every(key => !key.includes('private_fixture')));
    delete require.cache[file]; Component = require(file).default;
    Component({ sessionId: 'cs_test_private_fixture', tier: 'report' }); effect();
    await new Promise(resolve => setTimeout(resolve, 30));
    assert.equal(emitted.length, 1);
    Component({ sessionId: 'cs_test_separate_purchase', tier: 'hpi_upgrade' }); effect();
    await new Promise(resolve => setTimeout(resolve, 30));
    assert.equal(emitted.length, 2);
  } finally { Module._load = previousLoad; global.localStorage = oldStorage; }
});

const payment = require('../lib/paymentPolicy.ts');
for (const [name, registration, isPaid, tier, status] of [
  ['manual Core allowed', null, false, 'report', 200],
  ['manual Bundle rejected', null, false, 'report_plus_hpi', 400],
  ['manual Core HPI upgrade rejected', null, true, 'hpi_upgrade', 400],
  ['malformed registration Bundle rejected', 'AB!12', false, 'report_plus_hpi', 400],
  ['registration Bundle preserved', 'AB12 CDE', false, 'report_plus_hpi', 200],
  ['registration Core HPI upgrade preserved', 'AB12CDE', true, 'hpi_upgrade', 200],
  ['unpaid standalone HPI upgrade rejected', 'AB12CDE', false, 'hpi_upgrade', 400],
]) test(name, async () => {
  eligibleReport = { registration, is_paid: isPaid }; createCalls = [];
  const response = await GET(new Request(`http://localhost/api/checkout?report_id=fixture-id&tier=${tier}`, { headers: { Accept: 'application/json' } }));
  assert.equal(response.status, status);
  assert.equal(createCalls.length, status === 200 ? 1 : 0);
});
for (const tier of ['report', 'report_plus_hpi', 'hpi_upgrade']) {
  for (const [status, paymentStatus, allowed] of [['complete','paid',true],['complete','unpaid',false],['open','unpaid',false]]) {
    test(`${tier}: ${status}/${paymentStatus} grants only confirmed paid entitlements`, () => {
      const result = payment.paidEntitlements({ mode: 'payment', status, payment_status: paymentStatus, metadata: { report_id: 'fixture-id', checkout_tier: tier } }, 'fixture-id');
      assert.deepEqual(result, allowed ? { core: true, history: tier !== 'report' } : null);
    });
  }
}
test('payment must match the report, mode and a known product', () => {
  const session = { mode:'payment', payment_status:'paid', metadata: { report_id:'fixture-id', checkout_tier:'report' } };
  assert.equal(payment.paidEntitlements(session,'other-id'), null);
  assert.equal(payment.paidEntitlements({...session,mode:'setup'},'fixture-id'), null);
  assert.equal(payment.paidEntitlements({...session,metadata:{...session.metadata,checkout_tier:'unknown'}},'fixture-id'), null);
});
test('current journey wins over stale context and persists through Stripe returns', async () => {
  const query = 'f_source=common_problems&f_landing=common_problems&f_variant=common-problems&f_position=end';
  const target = checkout.checkoutRequestUrl('/api/checkout?report_id=fixture-id&tier=report&source=preview&'+query, { funnel_source:'homepage',cta_variant:'general',cta_position:'hero' });
  eligibleReport = { registration:'AB12CDE', is_paid:false }; createCalls=[];
  const response = await GET(new Request('http://localhost'+target,{headers:{Accept:'application/json'}}));
  assert.equal(response.status,200);
  const session=createCalls[0];
  assert.equal(session.metadata.funnel_source,'common_problems');
  assert.equal(session.metadata.entry_position,'end');
  for(const url of [session.success_url,session.cancel_url]) {
    const params=new URL(url).searchParams;
    assert.equal(params.get('f_source'),'common_problems');
    assert.equal(params.get('f_position'),'end');
    assert.equal(params.get('f_landing'),'common_problems');
  }
});
const { requestJson, RequestTimeoutError } = require('../lib/request.ts');
const { RequestTask, acquireCheckout, checkoutPending } = require('../lib/requestTask.ts');
test('request timeout recovers even when transport ignores abort', async () => {
  const previous=global.fetch;global.fetch=()=>new Promise(()=>{});
  try { await assert.rejects(requestJson('/fixture',{},10),RequestTimeoutError); }
  finally { global.fetch=previous; }
});
test('request body timeout is bounded too', async () => {
  const previous=global.fetch;global.fetch=async()=>({json:()=>new Promise(()=>{})});
  try { await assert.rejects(requestJson('/fixture',{},10),RequestTimeoutError); }
  finally { global.fetch=previous; }
});
test('cancelled and superseded requests cannot apply late responses', async () => {
  const previous=global.fetch;let resolveOld;
  global.fetch=()=>new Promise(resolve=>{resolveOld=resolve});
  const task=new RequestTask();
  const old=task.run('/old');const cancelled=assert.rejects(old,{name:'AbortError'});
  global.fetch=async()=>new Response(JSON.stringify({value:'new'}));
  const latest=await task.run('/new');
  resolveOld(new Response(JSON.stringify({value:'old'})));
  await cancelled;assert.equal(latest.data.value,'new');assert.equal(task.pending,false);
  global.fetch=()=>new Promise(()=>{});const pending=task.run('/unmount');const stopped=assert.rejects(pending,{name:'AbortError'});task.cancel();await stopped;assert.equal(task.pending,false);
  global.fetch=previous;
});
test('repeated checkout controls share a lock and recover after release', () => {
  const release=acquireCheckout('/preview/fixture');assert.ok(release);
  assert.equal(acquireCheckout('/preview/fixture'),null);
  assert.equal(checkoutPending('/preview/fixture'),true);
  release();assert.equal(checkoutPending('/preview/fixture'),false);
  const retry=acquireCheckout('/preview/fixture');assert.ok(retry);retry();
});

test('CTA impressions enforce 35 percent visibility and survive sticky remounts', () => {
  const previousLoad=Module._load;const savedWindow=global.window;const savedObserver=global.IntersectionObserver;
  let effect,callback;const emitted=[];
  global.window={location:{pathname:'/sample-report',search:''},IntersectionObserver:true};
  global.IntersectionObserver=class { constructor(fn) {callback=fn;} observe() {} disconnect() {} };
  Module._load=function(request,parent,...args) {
    if(request==='@vercel/analytics')return {inject(){},track:(name,data)=>emitted.push({name,data})};
    if(parent?.filename.endsWith('ViewEvent.tsx')&&request==='react')return {useRef:value=>({current:value===null?{}:value}),useEffect:fn=>{effect=fn}};
    return previousLoad.call(this,request,parent,...args);
  };
  const analyticsFile=require.resolve('../lib/analytics.ts');delete require.cache[analyticsFile];
  const viewFile=require.resolve('../components/conversion/ViewEvent.tsx');delete require.cache[viewFile];
  const View=require(viewFile).default;
  const mount=()=>{View({event:'cta_view',visible:true,data:{page_type:'sample_report',cta_variant:'general',cta_position:'sticky'}});effect();};
  try {
    mount();callback([{isIntersecting:true,intersectionRatio:0.1}]);assert.equal(emitted.length,0);
    callback([{isIntersecting:true,intersectionRatio:0.35}]);assert.equal(emitted.length,1);
    mount();callback([{isIntersecting:true,intersectionRatio:1}]);assert.equal(emitted.length,1);
    global.window.location.pathname='/pricing';require(analyticsFile).beginAnalyticsVisit();
    global.window.location.pathname='/sample-report';mount();callback([{isIntersecting:true,intersectionRatio:1}]);assert.equal(emitted.length,2);
  } finally {Module._load=previousLoad;global.window=savedWindow;global.IntersectionObserver=savedObserver;delete require.cache[analyticsFile];delete require.cache[viewFile];}
});
test('analytics reads only current bounded journey categories, ignoring old storage', () => {
  const previous=global.window;
  global.window={location:{pathname:'/preview/private',search:'?f_source=mot_advisory&f_position=end&f_variant=mot-advisory&registration=AB12CDE'}};
  try {
    const analytics=require('../lib/analytics.ts');
    assert.deepEqual(analytics.readFunnel(),{funnel_source:'mot_advisory',cta_variant:'mot-advisory',cta_position:'end'});
    global.window.location.search='?f_source=buying_guide&f_position=early';
    assert.deepEqual(analytics.readFunnel(),{funnel_source:'buying_guide',cta_position:'early'});
    assert.deepEqual(analytics.readFunnel(new URLSearchParams()),{});
  } finally {global.window=previous;}
});
