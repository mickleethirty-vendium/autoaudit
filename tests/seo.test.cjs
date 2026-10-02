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
for (const ext of ['.ts', '.tsx']) require.extensions[ext] = (module, file) => module._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true, target: ts.ScriptTarget.ES2020 },
}).outputText, file);
process.env.NEXT_PUBLIC_APP_URL = 'https://autoaudit.uk';
const { allMakesModels, allMotAdvisoryTypes } = require('../lib/seo/data.ts');
const estate = require('../lib/seo/estate.ts');
const relationships = require('../lib/seo/relationships.ts');
const sitemap = require('../app/sitemap.ts').default;
const makePage = require('../app/cars/[make]/page.tsx');

test('sitemap is unique and contains only supported canonical routes', () => {
  const entries = sitemap();
  assert.equal(entries.length, 418);
  assert.equal(new Set(entries.map(x => x.url)).size, entries.length);
  for (const { url } of entries) {
    const u = new URL(url);
    assert.equal(u.origin, 'https://autoaudit.uk');
    const parts = u.pathname.split('/').filter(Boolean);
    if (parts[0] === 'cars' && parts.length === 2) {
      assert.equal(estate.getMakeEstate(parts[1]).status, 'curated');
    } else if (parts[0] === 'cars' && parts.length >= 3) {
      assert.ok(estate.publishedModels.some(x => x.make_slug === parts[1] && x.model_slug === parts[2]));
      assert.ok(parts.length === 3 || (parts.length === 4 && parts[3] === 'common-problems'));
    } else if (parts[0] === 'mot-advisories' && parts.length > 1) {
      assert.equal(parts.length, 2);
      assert.ok(allMotAdvisoryTypes.some(x => x.advisory_slug === parts[1]));
    } else {
      assert.ok(fs.existsSync(path.join(root, 'app', u.pathname, 'page.tsx')));
    }
  }
});

test('publication allowlist preserves 116 models; catalogue additions cannot implicitly publish', () => {
  const manifest = require('../data/seo/published_models.json');
  assert.equal(manifest.length, 116);
  assert.equal(new Set(manifest).size, manifest.length);
  assert.equal(estate.publishedModels.length, manifest.length);
  assert.equal(estate.publishedMakeSlugs.length, 25);
});

test('all existing models have a valid parent without expanding make indexability', async () => {
  let directories = 0;
  for (const make of new Set(allMakesModels.map(x => x.make_slug))) {
    const state = estate.getMakeEstate(make);
    assert.notEqual(state.status, 'missing');
    const meta = await makePage.generateMetadata({ params: Promise.resolve({ make }) });
    assert.equal(meta.alternates.canonical, `https://autoaudit.uk/cars/${make}`);
    if (state.status === 'directory') {
      directories++;
      assert.deepEqual(meta.robots, { index: false, follow: true });
      assert.ok(!sitemap().some(x => x.url.endsWith(`/cars/${make}`)));
    } else assert.notEqual(meta.robots?.index, false);
  }
  assert.equal(directories, 26);
  assert.equal(estate.getMakeEstate('invented-make').status, 'missing');
  for (const model of allMakesModels) {
    assert.ok(estate.getMakeEstate(model.make_slug).models.some(x => x.full_slug === model.full_slug));
  }
});

test('all 32 existing editorial routes are included, with stable self-canonicals', () => {
  assert.equal(estate.editorialPages.length, 32);
  const actual = fs.readdirSync(path.join(root, 'app')).filter(x => /^(best-|cheap|most-|lowest-|used-car-buying|questions-to)/.test(x));
  assert.deepEqual(estate.editorialPages.map(x => x.path.slice(1)).sort(), actual.sort());
  for (const page of estate.editorialPages) {
    const module = require(path.join(root, 'app', page.path, 'page.tsx'));
    assert.equal(module.metadata.alternates.canonical, `https://autoaudit.uk${page.path}`);
    assert.ok(sitemap().some(x => x.url.endsWith(page.path)));
  }
});

test('model and problem canonicals remain unchanged for the entire catalogue', async () => {
  const hub = require('../app/cars/[make]/[model]/page.tsx');
  const problems = require('../app/cars/[make]/[model]/common-problems/page.tsx');
  for (const row of allMakesModels) {
    const params = Promise.resolve({ make: row.make_slug, model: row.model_slug });
    for (const [module, suffix] of [[hub, ''], [problems, '/common-problems']]) {
      const meta = await module.generateMetadata({ params });
      assert.equal(meta.alternates.canonical, `https://autoaudit.uk/cars/${row.full_slug}${suffix}`);
      assert.notEqual(meta.robots?.index, false);
    }
  }
});

test('component relationships resolve, are reciprocal, and do not invent model links', () => {
  const slugs = new Set(allMotAdvisoryTypes.map(x => x.advisory_slug));
  for (const group of relationships.advisoryComponentGroups) {
    assert.equal(new Set(group).size, group.length);
    for (const slug of group) assert.ok(slugs.has(slug), slug);
  }
  for (const row of allMotAdvisoryTypes) {
    const related = relationships.getRelatedAdvisories(row.advisory_slug);
    assert.ok(!related.some(x => x.advisory_slug === row.advisory_slug));
    for (const other of related) assert.ok(relationships.getRelatedAdvisories(other.advisory_slug).some(x => x.advisory_slug === row.advisory_slug));
  }
  assert.deepEqual(relationships.getRelatedAdvisories('not-a-defect'), []);
  assert.ok(relationships.getRelatedAdvisories('brake-pads-worn').some(x => x.advisory_slug === 'brake-discs-worn-or-pitted'));
  assert.ok(!relationships.getRelatedAdvisories('brake-pads-worn').some(x => x.advisory_slug === 'coolant-leak'));
});

test('advisory/model estate retains static enumeration and canonical/indexing behaviour', async () => {
  const page = require('../app/mot-advisories/[advisory]/[make]/[model]/page.tsx');
  assert.equal((await page.generateStaticParams()).length, 14152);
  for (const [make, model] of [['ford', 'focus'], ['fiat', 'panda']]) {
    const meta = await page.generateMetadata({ params: Promise.resolve({ advisory: 'brake-pads-worn', make, model }) });
    assert.equal(meta.alternates.canonical, `https://autoaudit.uk/mot-advisories/brake-pads-worn/${make}/${model}`);
    assert.notEqual(meta.robots?.index, false);
  }
});

test('only the three historically exposed editorial aliases are redirected', async () => {
  const redirects = await require('../next.config.js').redirects();
  assert.equal(redirects.length, 4);
  assert.equal(redirects[0].has[0].value, 'www.autoaudit.uk');
  for (const row of redirects.slice(1)) {
    assert.equal(row.permanent, true);
    assert.ok(estate.editorialPages.some(x => x.path === row.destination));
    assert.ok(!sitemap().some(x => x.url.endsWith(row.source)));
  }
});
