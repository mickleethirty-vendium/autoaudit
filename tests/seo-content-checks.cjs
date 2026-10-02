// Read-only source-content review. Deliberately excludes navigation, CTAs,
// template explanations, source labels and related-link text.
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

const { modelResearch } = require('../data/seo/model-research.ts');
const { motResearch } = require('../data/seo/mot-research.ts');
const { diagnosticGuides } = require('../data/seo/diagnostic-guides.ts');
const { researchSources, isPublishableGuide } = require('../lib/seo/research.ts');
const all = [...modelResearch, ...motResearch, ...diagnosticGuides];
const normalise = text => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
function body(guide) {
  let text = normalise([guide.intro, ...guide.sections.flatMap(x => x.paragraphs)].join(' '));
  // Remove the page identity rather than letting different names mask duplication.
  for (const name of guide.slug.split(/[/-]/).filter(x => x.length > 2)) text = text.replace(new RegExp(`\\b${name}\\b`, 'g'), '');
  return text.replace(/\s+/g, ' ').trim();
}
function shingles(text) {
  const words = text.split(' ');
  return new Set(words.slice(0, -2).map((_, i) => words.slice(i, i + 3).join(' ')));
}
function review() {
  const pairs = [], violations = [];
  for (const guide of all) {
    if (!isPublishableGuide(guide)) violations.push(`Publication gate: ${guide.slug}`);
    const claimText = body(guide)
      .replace('does not supply a failure probability', '')
      .replace('neither should be sold as a guaranteed cure without inspection', '');
    if (/\b(guaranteed|always fails|failure probability|reliability score of)\b/i.test(claimText)) violations.push(`Claim review: ${guide.slug}`);
  }
  const texts = all.map(body), sets = texts.map(shingles);
  for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) {
    const intersection = [...sets[i]].filter(x => sets[j].has(x)).length;
    const jaccard = intersection / (sets[i].size + sets[j].size - intersection);
    const containment = intersection / Math.min(sets[i].size, sets[j].size);
    const pair = { left: all[i].slug, right: all[j].slug, jaccard, containment };
    pairs.push(pair);
    if (jaccard > 0.30 || containment > 0.55) violations.push(pair);
  }
  return { guides: all.length, pairsCompared: pairs.length, rule: 'Name-stripped, body-only three-word shingles. Review required above 0.30 Jaccard or 0.55 smaller-body containment. Editorial review remains necessary.', highestSimilarity: pairs.sort((a, b) => b.jaccard - a.jaccard).slice(0, 10), violations };
}
if (require.main === module) {
  const result = review();
  console.log(JSON.stringify(result, null, 2));
  if (result.violations.length) process.exitCode = 1;
}
module.exports = { modelResearch, motResearch, diagnosticGuides, researchSources, review, body };
