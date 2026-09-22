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
let session, eventType, updates = [];
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
    select() { return this; }, eq() { return this; }, is() { return this; },
    update(value) { patch=value;updates.push(value);return this; },
    maybeSingle: async()=>({data:report,error:null}),
    single: async()=>({data:{...report,...patch},error:null}),
    then(resolve) { return Promise.resolve({data:{...report,...patch},error:null}).then(resolve); },
  };
}
const original = Module._load;
Module._load = function(request, ...args) {
  if(request==='stripe') return class { checkout={sessions:{retrieve:async()=>session}};webhooks={constructEvent:()=>({type:eventType,data:{object:session}})}; };
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
