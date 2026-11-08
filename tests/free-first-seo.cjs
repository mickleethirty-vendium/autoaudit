const assert = require('node:assert/strict');
const preview = process.env.TEST_BASE_URL;
if (!preview) throw new Error('TEST_BASE_URL required');
const routes = ['/', '/cars', '/cars/skoda', '/cars/skoda/kodiaq', '/cars/skoda/kodiaq/common-problems', '/mot-advisories/undertray-loose', '/best-cars-under-5000', '/diagnostics/car-overheating', '/pricing', '/sample-report'];
const headers = process.env.VERCEL_OIDC_TOKEN ? { 'x-vercel-trusted-oidc-idp-token': process.env.VERCEL_OIDC_TOKEN } : {};
const extract = html => ({
 title: html.match(/<title>(.*?)<\/title>/)?.[1],
 canonical: html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1],
 description: html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/)?.[1],
 robots: html.match(/<meta[^>]*name="robots"[^>]*content="([^"]+)"/)?.[1],
 schemas: [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]))
});
(async () => {
 for (const route of routes) {
  const [before, after] = await Promise.all([fetch('https://autoaudit.uk'+route), fetch(preview+route,{headers})]);
  assert.equal(before.status,200,route); assert.equal(after.status,200,route);
  const [b,a] = await Promise.all([before.text(),after.text()]);
  assert.deepEqual(extract(a),extract(b),route+' metadata/schema changed');
  if (!['/'].includes(route)) assert.equal(a.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1],b.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1],route+' H1 changed');
  console.log('PASS unchanged metadata/schema and HTTP 200',route);
 }
 for(const route of ['/sitemap.xml','/robots.txt']) {
  const [before,after]=await Promise.all([fetch('https://autoaudit.uk'+route),fetch(preview+route,{headers})]);
  assert.equal(after.status,200);const b=await before.text(),a=await after.text();
  if(route==='/sitemap.xml') {
   const urls=html=>[...html.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]).sort();
   assert.deepEqual(urls(a),urls(b));assert.equal(urls(a).length,438);
  } else assert.equal(a,b);
  console.log('PASS unchanged',route);
 }
})().catch(error=>{console.error(error);process.exitCode=1});
