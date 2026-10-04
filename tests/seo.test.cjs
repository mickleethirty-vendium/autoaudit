const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');

test('Wave 1 content passes body-only similarity and evidence review', () => {
  const content = require('./seo-content-checks.cjs');
  const result = content.review();
  assert.equal(result.guides, 60);
  assert.equal(result.pairsCompared, 1770);
  assert.deepEqual(result.violations, []);
  assert.equal(content.body({ slug: 'skoda/kodiaq', intro: 'Škoda Kodiaq   inspection', sections: [] }), 'inspection');
  const baseline = require('../docs/seo-wave1-baseline.json');
  assert.equal(baseline.existingPages.length, 40);
  assert.ok(baseline.existingPages.every(x => x.latest28?.impressions >= 20));
  assert.equal(baseline.newPages.length, 20);
});
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

test('page metadata resolves to one brand suffix under the root title template', async () => {
  const { resolveTitle } = require('next/dist/lib/metadata/resolvers/resolve-title');
  const template = '%s | AutoAudit';
  function check(title) {
    const resolved = resolveTitle(title, template).absolute;
    assert.equal((resolved.match(/\| AutoAudit/g) || []).length, 1, resolved);
    assert.ok(resolved.endsWith('| AutoAudit'), resolved);
  }
  // Audit static page metadata without importing unrelated client/payment modules.
  let staticTitles = 0;
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) { walk(file); continue; }
      if (entry.name !== 'page.tsx') continue;
      const source = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
      function visit(node) {
        if (ts.isVariableDeclaration(node) && node.name.getText(source) === 'metadata' && ts.isObjectLiteralExpression(node.initializer)) {
          const prop = node.initializer.properties.find(p => p.name?.getText(source) === 'title');
          if (prop) {
            const value = prop.initializer;
            if (ts.isStringLiteral(value)) check(value.text);
            else {
              assert.ok(ts.isObjectLiteralExpression(value), file);
              const absolute = value.properties.find(p => p.name?.getText(source) === 'absolute');
              assert.ok(absolute && ts.isStringLiteral(absolute.initializer), file);
              check({ absolute: absolute.initializer.text });
            }
            staticTitles++;
          }
        }
        ts.forEachChild(node, visit);
      }
      visit(source);
    }
  }
  walk(path.join(root, 'app'));
  assert.ok(staticTitles >= 35);
  for (const [modulePath, params] of [
    ['../app/check-car-by-registration/page.tsx', {}],
    ['../app/cars/[make]/page.tsx', { make: 'skoda' }],
    ['../app/cars/[make]/[model]/page.tsx', { make: 'skoda', model: 'kodiaq' }],
    ['../app/cars/[make]/[model]/common-problems/page.tsx', { make: 'skoda', model: 'kodiaq' }],
    ['../app/cars/[make]/[model]/common-problems/page.tsx', { make: 'bmw', model: 'x5' }],
    ['../app/diagnostics/[slug]/page.tsx', { slug: 'car-losing-power' }],
    ['../app/diagnostics/[slug]/page.tsx', { slug: 'engine-starting-electrical' }],
    ['../app/mot-advisories/[advisory]/page.tsx', { advisory: 'undertray-loose' }],
    ['../app/mot-advisories/[advisory]/[make]/[model]/page.tsx', { advisory: 'brake-pads-worn', make: 'skoda', model: 'kodiaq' }],
  ]) {
    const metadata = await require(modulePath).generateMetadata({ params });
    check(metadata.title);
  }
});

test('sitemap is unique and contains only supported canonical routes', () => {
  const entries = sitemap();
  assert.equal(entries.length, 438);
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
    } else if (parts[0] === 'diagnostics') {
      assert.equal(parts.length, 2);
      assert.ok(estate.publishedDiagnostics.some(x => x.slug === parts[1]));
    } else {
      assert.ok(fs.existsSync(path.join(root, 'app', u.pathname, 'page.tsx')));
    }
  }
});

test('Wave 1 publishes only 16 researched symptoms and four hubs with stable parents', async () => {
  const { diagnosticSymptoms, diagnosticHubs, diagnosticGuides } = require('../data/seo/diagnostic-guides.ts');
  const { isPublishableGuide } = require('../lib/seo/research.ts');
  const page = require('../app/diagnostics/[slug]/page.tsx');
  assert.equal(diagnosticSymptoms.length, 16);
  assert.equal(diagnosticHubs.length, 4);
  assert.equal(page.dynamicParams, false);
  assert.equal(page.generateStaticParams().length, 20);
  assert.equal(new Set(diagnosticGuides.map(x => x.slug)).size, 20);
  for (const guide of diagnosticGuides) {
    assert.ok(isPublishableGuide(guide), guide.slug);
    assert.ok(!isPublishableGuide({ ...guide, status: 'draft' }));
    assert.ok(!isPublishableGuide({ ...guide, sections: [{ heading: 'Unverified', paragraphs: ['text'], sources: ['invented'] }] }));
    const meta = await page.generateMetadata({ params: Promise.resolve({ slug: guide.slug }) });
    assert.equal(meta.alternates.canonical, `https://autoaudit.uk/diagnostics/${guide.slug}`);
    assert.deepEqual(meta.robots, { index: true, follow: true });
    if (guide.kind === 'symptom') assert.ok(diagnosticHubs.some(x => x.slug === guide.hub));
    else assert.ok(diagnosticSymptoms.some(x => x.hub === guide.slug));
  }
  assert.equal((await page.generateMetadata({ params: Promise.resolve({ slug: 'invented' }) })).robots.index, false);
});

test('researched content has valid sources, established URLs and contextual internal links', () => {
  const { modelResearch } = require('../data/seo/model-research.ts');
  const { motResearch } = require('../data/seo/mot-research.ts');
  const { diagnosticGuides } = require('../data/seo/diagnostic-guides.ts');
  const { researchSources, isPublishableGuide } = require('../lib/seo/research.ts');
  assert.equal(modelResearch.length, 20);
  assert.equal(motResearch.length, 20);
  for (const guide of modelResearch) assert.ok(allMakesModels.some(x => x.full_slug === guide.slug));
  for (const guide of motResearch) assert.ok(allMotAdvisoryTypes.some(x => x.advisory_slug === guide.slug));
  const paths = new Set(sitemap().map(x => new URL(x.url).pathname));
  for (const guide of [...modelResearch, ...motResearch, ...diagnosticGuides]) {
    assert.ok(isPublishableGuide(guide), guide.slug);
    assert.equal(new Set(guide.sections.map(x => x.heading)).size, guide.sections.length);
    for (const section of guide.sections) {
      for (const source of section.sources) assert.equal(new URL(researchSources[source].url).protocol, 'https:');
    }
    for (const link of guide.links) assert.ok(paths.has(link.href), `${guide.slug}: ${link.href}`);
  }
  const { pageTypeForPath } = require('../lib/vehicleCheck.ts');
  assert.equal(pageTypeForPath('/diagnostics/car-losing-power'), 'diagnostic');
});

test('specific MOT and model distinctions replace generic risk claims', () => {
  const { getMotResearch } = require('../data/seo/mot-research.ts');
  const { getModelResearch } = require('../data/seo/model-research.ts');
  const text = x => JSON.stringify(x);
  assert.match(text(getMotResearch('ac-not-cold')), /not itself a formal/);
  assert.match(text(getMotResearch('undertray-loose')), /likely to detach is dangerous/);
  assert.match(text(getMotResearch('brake-dust-shield-insecure')), /drum-brake backplate/);
  assert.match(text(getModelResearch('skoda', 'kodiaq')), /second-generation/i);
  assert.match(text(getModelResearch('citroen', 'berlingo')), /1\.5 BlueHDi/);
  assert.match(text(getModelResearch('hyundai', 'kona')), /VIN applicability/);
  assert.equal(getModelResearch('ford', 'focus'), undefined);
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
