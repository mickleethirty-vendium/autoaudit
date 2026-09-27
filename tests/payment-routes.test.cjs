const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const resolve = Module._resolveFilename;
Module._resolveFilename = function(request, ...args) {
  return resolve.call(this, request.startsWith('@/') ? path.join(root, request.slice(2)) : request, ...args);
};
for (const ext of ['.ts', '.tsx']) require.extensions[ext] = (module, file) => module._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true, target: ts.ScriptTarget.ES2020 } }).outputText, file);
process.env.STRIPE_SECRET_KEY = 'sk_test_local_fixture_only';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_fixture_only';
process.env.STRIPE_REPORT_PRICE_ID = 'price_fixturecore';
process.env.STRIPE_REPORT_PLUS_HPI_PRICE_ID = 'price_fixturebundle';
process.env.STRIPE_HPI_UPGRADE_PRICE_ID = 'price_fixturehpi';
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
let session, eventType, updates = [];
let checkoutCalls = [], queriedReferences = [];
const report = {
  id:'fixture-id',registration:'AB12CDE',is_paid:false,hpi_unlocked:false,
  make:'Ford',car_year:2017,mileage:71842,fuel:'petrol',transmission:'manual',
  preview_payload:{summary:{exposure_low:100,exposure_high:300},buckets:[]},
  full_payload:{summary:{exposure_low:100,exposure_high:300},items:[],ukvd:{enrichment_applied:true}},
  hpi_checked:true,hpi_status:'success',hpi_payload:{Results:{}},hpi_summary:{finance:false,stolen:false,writeOff:false,notes:[]},
};
function query() {
  let patch = null;
  return {
    select() { return this; },
    eq(column, value) { if (column === 'id') queriedReferences.push(value); return this; },
    is() { return this; }, abortSignal() { return this; },
    update(value) { patch=value;updates.push(value);return this; },
    maybeSingle: async()=>({data:report,error:null}),
    single: async()=>({data:{...report,...patch},error:null}),
    then(resolve) { return Promise.resolve({data:{...report,...patch},error:null}).then(resolve); },
  };
}
const original = Module._load;
Module._load = function(request, ...args) {
  if(request==='stripe') return class { checkout={sessions:{retrieve:async()=>session,create:async(args)=>{checkoutCalls.push(args);return {url:'https://checkout.stripe.com/c/pay/fixture'};}}};webhooks={constructEvent:()=>({type:eventType,data:{object:session}})}; };
  if(request==='@/lib/supabase') return {supabaseAdmin:{from:query}};
  if(request==='@/lib/env') return {mustGetEnv:()=> 'local-fixture-only'};
  if(request==='@supabase/ssr') return {createServerClient:()=>({auth:{getUser:async()=>({data:{user:null}})}})};
  if(request==='next/headers') return {headers:()=>new Headers({'stripe-signature':'fixture'}),cookies:()=>({get:()=>undefined})};
  if(request==='next/navigation') return {usePathname:()=>'/report/fixture-id',useSearchParams:()=>new URLSearchParams(),redirect:()=>{throw Error('Unexpected redirect')}};
  if(request==='@/lib/commonFailures') return {matchKnownModelIssues:async()=>({knownModelIssues:[],vehicleIdentity:{}})};
  if(request==='@/lib/ukvdValuation') return {fetchUkvdValuationByVrm:async()=>({}),buildUkvdValuationSummary:()=>({}),buildUkvdVehicleEnrichment:()=>({}),buildUkvdMarketValue:()=>({})};
  if(request==='@/lib/hpi') return {fetchUkvdHpiByVrm:async()=>{throw Error('Unexpected HPI fetch')},buildUkvdHpiSummary:()=>({})};
  return original.call(this,request,...args);
};
const verify=require('../app/api/session-report/route.ts').GET;
const webhook=require('../app/api/stripe-webhook/route.ts').POST;
const ReportPage=require('../app/report/[id]/page.tsx').default;
const checkoutGet=require('../app/api/checkout/route.ts').GET;
function containsComponent(node,name) {
  if(!node||typeof node!=='object')return false;
  if(Array.isArray(node))return node.some(n=>containsComponent(n,name));
  return node.type?.name===name||containsComponent(node.props?.children,name);
}
for(const tier of ['report','report_plus_hpi','hpi_upgrade']) {
  for(const [status,paymentStatus,paid] of [['complete','paid',true],['complete','unpaid',false],['open','unpaid',false]]) {
    test(`all unlock entry points: ${tier} ${status}/${paymentStatus}`,async()=>{
      session={id:'cs_fixture',mode:'payment',status,payment_status:paymentStatus,metadata:{report_id:'fixture-id',checkout_tier:tier}};
      updates=[];
      const verification=await verify(new Request('http://localhost/api/session-report?session_id=cs_fixture'));
      assert.equal(verification.status,paid?200:400);
      assert.equal(updates.length,paid?1:0);
      if(paid) assert.equal(updates[0].hpi_unlocked===true,tier!=='report');
      updates=[];eventType='checkout.session.completed';
      const response=await webhook(new Request('http://localhost/api/stripe-webhook',{method:'POST',body:'fixture'}));
      assert.equal(response.status,200);
      assert.equal((await response.json()).unlocked,paid);
      assert.equal(updates.length,paid?1:0);
      if(paid) {assert.equal(updates[0].is_paid,true);assert.equal(updates[0].hpi_unlocked===true,tier!=='report');}
      updates=[];
      const page=await ReportPage({params:{id:'fixture-id'},searchParams:{session_id:'cs_fixture'}});
      assert.equal(containsComponent(page,'ReportClient'),paid);
      assert.equal(containsComponent(page,'PurchaseAnalytics'),paid);
      assert.equal(updates.length,0);
    });
  }
}
test('delayed-payment success is processed; unpaid completion and failure never unlock',async()=>{
  session={id:'cs_fixture',mode:'payment',status:'complete',payment_status:'paid',metadata:{report_id:'fixture-id',checkout_tier:'report_plus_hpi'}};
  eventType='checkout.session.async_payment_succeeded';updates=[];
  const response=await webhook(new Request('http://localhost/api/stripe-webhook',{method:'POST',body:'fixture'}));
  assert.equal((await response.json()).unlocked,true);assert.equal(updates[0].hpi_unlocked,true);
  eventType='checkout.session.async_payment_failed';updates=[];
  const failed=await webhook(new Request('http://localhost/api/stripe-webhook',{method:'POST',body:'fixture'}));
  assert.equal((await failed.json()).ignored,true);assert.equal(updates.length,0);
});

test('paid report server props and its visible upgrade CTA preserve the reference through checkout', async () => {
  const { renderToStaticMarkup } = require('react-dom/server');
  const saved = { ...report };
  try {
    report.id = '11111111-2222-4333-8444-555555555555';
    report.is_paid = true;
    report.registration = 'AB12 CDE';
    session = { id:'cs_fixture', mode:'payment', status:'complete', payment_status:'paid', metadata:{report_id:report.id,checkout_tier:'report'} };
    const page = await ReportPage({ params:{id:report.id}, searchParams:{session_id:'cs_fixture',tier:'report',f_source:'common_problems',f_variant:'common-problems',f_position:'end'} });
    const html = renderToStaticMarkup(page);
    const upgradeUrls = [...html.matchAll(/href="([^"]*tier=hpi_upgrade[^"]*)"/g)].map(match => match[1].replaceAll('&amp;', '&'));
    // The second upgrade control is inside the initially inactive history tab.
    assert.equal(upgradeUrls.length, 1);
    for (const href of upgradeUrls) {
      const url = new URL(href, 'http://localhost');
      assert.equal(url.searchParams.get('report_id'), report.id);
      assert.equal(url.searchParams.get('tier'), 'hpi_upgrade');
      assert.equal(url.searchParams.get('source'), 'report');
      assert.equal(url.searchParams.get('f_source'), 'common_problems');
      assert.equal(url.searchParams.has('session_id'), false);
      checkoutCalls = []; queriedReferences = [];
      const response = await checkoutGet(new Request(url, {headers:{Accept:'application/json'}}));
      assert.equal(response.status, 200);
      assert.equal((await response.json()).created, true);
      assert.deepEqual(queriedReferences, [report.id]);
      assert.equal(checkoutCalls.length, 1);
      assert.equal(checkoutCalls[0].metadata.report_id, report.id);
      assert.equal(checkoutCalls[0].line_items[0].price, 'price_fixturehpi');
    }
  } finally { Object.assign(report, saved); }
});

for (const scenario of [
  {name:'unpaid upgrade',paid:false,reg:'AB12CDE',reference:'fixture-id',tier:'hpi_upgrade',code:'CORE_PAYMENT_REQUIRED'},
  {name:'manual upgrade',paid:true,reg:null,reference:'fixture-id',tier:'hpi_upgrade',code:'REGISTRATION_REQUIRED'},
  {name:'malformed reference',paid:true,reg:'AB12CDE',reference:'private@example.test',tier:'hpi_upgrade',code:'INVALID_REPORT_REFERENCE'},
  {name:'missing reference',paid:true,reg:'AB12CDE',reference:'',tier:'hpi_upgrade',code:'INVALID_REPORT_REFERENCE'},
  {name:'Core unaffected',paid:false,reg:null,reference:'fixture-id',tier:'report'},
  {name:'Bundle unaffected',paid:false,reg:'AB12CDE',reference:'fixture-id',tier:'report_plus_hpi'},
]) test(`checkout diagnostic contract: ${scenario.name}`, async () => {
  const saved = { ...report };
  const originalWarn = console.warn;
  const warnings = [];
  console.warn = (...args) => warnings.push(args);
  try {
    Object.assign(report, {is_paid:scenario.paid,registration:scenario.reg});
    checkoutCalls = [];
    const params = new URLSearchParams({report_id:scenario.reference,tier:scenario.tier});
    const response = await checkoutGet(new Request(`http://localhost/api/checkout?${params}`, {headers:{Accept:'application/json'}}));
    const body = await response.json();
    assert.equal(response.status, scenario.code ? 400 : 200);
    assert.equal(checkoutCalls.length, scenario.code ? 0 : 1);
    if (scenario.code) {
      assert.equal(body.code, scenario.code);
      assert.deepEqual(Object.keys(body).sort(), ['code','error']);
      assert.deepEqual(warnings, [['Checkout rejected', {code:scenario.code,tier:scenario.tier}]]);
      assert.equal(JSON.stringify(warnings).includes(scenario.reference || 'never-present'), false);
    } else {
      assert.deepEqual(warnings, []);
      assert.equal(body.created, true);
    }
  } finally { console.warn = originalWarn; Object.assign(report, saved); }
});
