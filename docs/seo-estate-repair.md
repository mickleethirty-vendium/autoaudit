# SEO estate repair and evidence gate — 2 October 2026

## Baseline and scope

Main and origin/main: `4e986691b3fb9b29ce13caf9568b3db76b892598`.
Production: `dpl_ExGD12mG2C3C1yKXjomJRgBBLLeh`.
Recovery tag: `baseline/pre-seo-estate-repair-20261002`; a verified full-history
Git bundle and the complete production HTTP inventory are held outside the checkout.
The original CTA preservation checkpoint remains unchanged.

Baseline crawl: all 427 sitemap URLs checked, 398 HTTP 200 and 29 HTTP 404.
The 404 set is the three editorial aliases below plus these 26 make hubs:
abarth, alfa-romeo, bentley, byd, cupra, ds, fiat, genesis, jeep, lexus, lotus,
maserati, mitsubishi, polestar, porsche, smart, subaru, aston-martin, chevrolet,
ferrari, infiniti, isuzu, kgm-ssangyong, mclaren, ora, saab.

No conversion, analytics, payment, report, provider, database, dependency or
commonFailures runtime behaviour is changed. No expansion content is published.

## Repairs and publication policy

- `published_models.json` freezes the existing 116-model curated set. It is a
  grandfathered publication manifest, not a claim that those pages passed a new
  editorial evidence review. Catalogue wave labels no longer control the main
  model/make sitemap and navigation. Future additions require human approval.
- `editorial_pages.json` lists all 32 existing editorial routes, shared by the
  sitemap and the cars hub. Seven other core public routes are retained.
- Sitemap: 418 unique canonical URLs = 7 core + 32 editorial + 25 curated makes
  + 116 model hubs + 116 common-problems pages + 122 advisory guides.
- The 26 previously broken make parents become short factual model directories,
  explicitly `noindex,follow`, with self-canonicals and no fabricated reliability
  claims. They are excluded from the sitemap. Curated parents retain indexability
  and give access to their other existing model pages in a labelled directory.
- All 426 existing model hubs and common-problems routes retain their URLs,
  canonicals and indexing policy. The 310 later-wave models are a **legacy retained**
  exception, not newly approved content. No mass-noindex without GSC and approval.
- The cars hub links to the existing editorial library and make directories.
  All 122 advisory guides are reachable from the component-grouped MOT hub.
- Related defects now use explicit component relationships. Missing relationships
  stay empty with a hub link. General model/make MOT links are labelled generic
  component guidance, not assertions of model-specific frequency. The first-six
  model recommendation on every advisory is removed because it implied unsupported
  model/defect relevance; the model research hub remains linked.
- `lastModified = new Date()` is removed: a build is not evidence that every
  article changed. Actual per-page editorial dates can be introduced later.

The obsolete URLs were exposed in the production sitemap by commit `85abe6c`:

| Old URL | Permanent destination |
| --- | --- |
| /small-cars-uk | /best-small-cars-uk |
| /reliable-used-cars-uk | /best-reliable-cars-uk |
| /family-cars-uk | /best-family-cars-uk |

Current internal links use the destination forms. Public search did not establish
indexation of the aliases. Historical sitemap exposure and exact equivalence
justify these three redirects; this is not evidence that Google indexed them.

## Advisory/model estate: assessment, not a removal operation

The existing generator enumerates 122 × 116 = 14,152 paths. Route validation
accepts all 426 model records, giving a potential 51,972 combinations. Production
samples for both Ford Focus and later-wave Fiat Panda return 200 with self-canonicals.
No combinations are in the sitemap. The public templates do not provide inbound
links to this combination family; those pages link outward to their parent and
model. General advisory explanations and a few component branches supply almost
all content; no measured model-specific defect distributions are rendered.

No deletion, canonical consolidation or indexing changes are made to this family.
Later treatment, after a GSC family-level export and URL samples:

| Treatment | Evidence required |
| --- | --- |
| KEEP | Distinct useful answer plus evidence of relevance; preserve working URLs |
| IMPROVE | Query traction or clearly useful intent, but insufficient model-specific explanation |
| CONSOLIDATE | Same intent as a stronger advisory/model parent, with a genuinely equivalent destination and reviewed redirect |
| NOINDEX/REMOVE | No unique useful answer after review; inspect traffic, links and Google-selected canonicals first; separate approval |

Do not infer that missing GSC query rows mean zero traffic. Do not treat an
indexation exclusion label alone as proof of thin content. Avoid 14,152 redirect
rules or automatic blanket canonical changes.

## commonFailures safety review — no runtime data change

500 starter records cover 17 models across 13 makes and 51 model/generation pairs.
There are 1,077 issue assignments but only 24 distinct issue codes. All confidence
labels are `starter`; none has an engine code or a per-claim evidence URL/date.
All cost ranges pass numeric ordering, which does not validate their accuracy.
No measured probability or population denominator exists. There are no exact
duplicate record payloads after removing IDs, but repeated generic assignments:
water-pump/thermostat 231; EGR/DPF 172; clutch/DMF 160.

Objectively incompatible records identified:

| IDs | Mapping | Evidence issue |
| --- | --- | --- |
| cf_0005, cf_0006 | Fiesta Mk6, 2002–2008, 1.0 EcoBoost | Engine introduced in Europe in 2012 |
| cf_0043, cf_0044 | Focus Mk2, 2004–2011, 1.0 EcoBoost | Engine introduced with the Focus in 2012 |

Manufacturer source: https://media.ford.com/content/fordmedia/feu/gb/en/news/2016/11/29/ford-global-first-offers-fuel-saving-cylinder-deactivation-tech-.html

These records are flagged, not reassigned to guessed generations. The same JSON
feeds paid-report matching through lib/commonFailures/dataset.ts; changing or
removing entries would alter report behaviour, outside this repair's boundary.
The dataset is not connected to SEO templates. A separate approved data repair
should test matching exclusions as well as correct applications.

Other review requirements: generation nomenclature differs by market; engine
families are repeated across broad year ranges; null gearbox rows overlap explicit
manual rows; generic clutch/DMF claims need component-specific applicability.
Catalogue aliases include ORA Funky Cat/03 and Picasso/SpaceTourer naming;
MINI Cooper-to-Hatch matching needs derivative exclusions before extension.
No additional uncertain record is declared mechanically wrong without evidence.

Future evidence record (design only): stable issue ID; make/model IDs and aliases;
generation/market; inclusive years plus build-date limits where known; engine
family/code/size; gearbox family/code; fuel; applicability and exclusions; observed
symptoms; severity with rationale; repair-cost range/currency/VAT/labour/region/date;
primary evidence URL/document reference and quoted-claim location; evidence date;
review date/reviewer; confidence; notes; optional measured rate with denominator,
period and methodology. Keep severity separate from frequency and matching confidence.

## Search Console access and evidence protocol

No Search Console connector was exposed, no browser surface/session was available,
and no repository Search Console integration was found. Gmail authorisation is not
Search Console authorisation. No credentials/settings were created or changed.

Minimum operator action: open the existing verified AutoAudit property in a signed-in
browser connected to Codex. Alternatively supply Search Results and Page Indexing
exports. No new property, credential or owner permission is needed merely to share
exports. For a separate analyst Google account, grant Restricted access where it
supports the requested reports; do not grant Owner access. API integration would
need separate approval and the webmasters.readonly scope.

Until access is available, clicks/impressions/CTR/position and discovered/crawled
exclusion totals remain unknown. The candidate pilot below is market/architecture-
led, not presented as GSC-backed. Public search is not an indexation census.

Use latest final reporting day D (not a guessed current-day cutoff): D-6..D,
D-27..D, and D-55..D-28. Record property, search type, report timezone and finality.
Collect totals separately from query/page/device/country breakdowns; anonymised
queries and row truncation can make breakdown sums differ. Compare UK and all-country
results, mobile and desktop. Rank near-opportunities at positions 8–30 only with
meaningful impressions and the actual landing page; avoid tiny-sample CTR conclusions.
Inspect exclusions and Google-selected canonicals by family, using representative
URL Inspection evidence if accessible. Do not submit indexing requests in this pass.

## Proposed pilot — NOT implemented; human approval required

The requested components add to 80 pages if every one of 20 models receives two
separate treatments. Recommend **60 content units initially**: 20 existing model hubs
upgraded with researched common-problem sections, 20 existing MOT pages upgraded,
16 diagnostic articles and four system hubs. Separate common-problems rewrites for
those 20 models would expand the work to 80 and need evidence of distinct value.
Existing common-problems URLs are not removed or repointed by this proposal.

### Twenty model candidates (all already in the catalogue)

| Candidates | Rationale and evidence needed |
| --- | --- |
| Fiat 500, Panda | Used city-car choices; distinguish engines, years and service evidence |
| Ford Mondeo, C-Max | Family/commuting purchases; engine/gearbox and generation boundaries |
| Toyota Auris, Prius, Avensis | Hybrid versus conventional ownership; no unsupported battery-health claims |
| Nissan Note | Practical budget purchase; generation and transmission differences |
| Skoda Yeti, Citigo | Distinct family/city intents; confirmed engine/gearbox applicability |
| Vauxhall Meriva, Zafira | Used family practicality; generation, recall and service context |
| Peugeot 107, 108, 207 | Budget-car market; do not transfer one engine's issues to every variant |
| Volkswagen up!, Touran | City/family choice; variant and maintenance evidence |
| Hyundai ix35, i40, IONIQ | SUV/commuter/hybrid-EV choices; explicit powertrain separation |

These are provisional priority candidates, not search-volume claims. Validate UK
fleet relevance using DfT and available market evidence, then reorder with GSC.
No model is approved for publication solely because it is in this list.

### Twenty existing MOT candidates (exact current slugs)

brake-pads-worn; brake-discs-worn-or-pitted; brake-pipe-corroded;
parking-brake-efficiency-low; front-tyres-low-tread; tyre-sidewall-damaged;
tyre-uneven-wear; wheel-bearing-noisy; suspension-arm-bush-worn; ball-joint-play;
drop-link-worn; coil-spring-broken-end; shock-absorber-misting; subframe-corrosion;
sill-corrosion; exhaust-leak-minor; engine-oil-leak; cv-boot-damaged;
headlamp-lens-cloudy; windscreen-chip.

Rationale: distinct components with direct used-buyer decisions, repair-evidence
questions and official MOT applicability to research. GSC impressions are **not
yet verified**. Combine meaning/severity/cost/driving questions on the same page;
do not split synonyms into more URLs. Cite current DVSA rules; obtain real cost
assumptions rather than recycling generic ranges.

### Sixteen diagnostic candidates and four hubs

1. Juddering when accelerating
2. Juddering when braking
3. Rattle on a cold start
4. Loss of power while driving
5. Engine overheating
6. Coolant loss
7. Battery draining while parked
8. Difficult starting
9. Clutch slipping under load
10. Automatic gearbox jerking on engagement or changes
11. Steering-wheel vibration
12. Suspension knocking over bumps
13. Blue exhaust smoke
14. Persistent white exhaust smoke (distinguish ordinary condensation)
15. DPF warning and regeneration questions
16. AdBlue warning/no-start countdown

Hubs: Engine/starting/electrics; Transmission/clutch; Steering/suspension/brakes;
Emissions/exhaust. Link symptoms by operating condition and system, not permutations.
Diagnostics provide uncertainty and safe next steps, never a remote diagnosis.
The relevant product action is to check recorded history of a car being considered;
it cannot establish the mechanical cause. Compare overlap before approving URLs.

## Future generation quality gates

Implemented now: explicit publication manifest; editorial route registry shared
with navigation; executable route/canonical/parent/sitemap/relationship checks;
unchanged legacy URL guard; reviewed component links. No CMS or database schema.

For future content, use a small repository record with `draft`, `researched`,
`publishable`, `indexable` states. Only approved indexable records enter new route
generation, navigation and sitemap. Existing retained URLs require explicit
migration decisions, not a default noindex side effect.

Promotion requires:
1. Distinct intent and documented overlap decision against existing pages.
2. Claim-level provenance and correct UK configuration applicability/exclusions.
3. At least three substantive evidence-backed decision points for a model article,
   or an equally useful defect explanation covering wording/severity/action.
   This is an editorial gate, not an instruction to pad words or invent issues.
4. Source and review dates; manufacturer/DVSA or independently corroborated evidence.
5. Similarity check after removing navigation/CTAs; flag high overlap for human review
   (e.g. >80% shingle overlap), not automatic synonym rewriting to evade the check.
6. Correct self-canonical, unique path, no accidental redirects/soft 404s, valid parent.
7. At least one substantive contextual incoming link plus the parent listing.
8. Schema matches visible content; no fabricated ratings/reviews/statistics.
9. Unsupported certainty/probability/safety/diagnosis claims blocked for review.
10. Statistical pages state sample size, period, denominator, retest handling,
    age/mileage confounding and limitations; no reliability inference from MOT alone.
11. Relevant existing vehicle-check CTA; no new checkout logic or product promises.
12. Full tests/build, responsive sample review, controlled deployment and GSC observation.

The checks cannot prove factual truth automatically. New content and bulk changes
remain behind human approval. A smaller defensible pilot is preferable to a quota.

## Validation commands

`npm test`, `tsc --noEmit --incremental false`, `next lint --no-cache`.
`tests/browser.cjs` includes the SEO HTTP/schema/link checks and responsive checks
through `tests/seo-browser-checks.cjs`; uses only localhost fixtures and blocks
external browser requests. Build with fixture-only keys and localhost Supabase.
Production smoke checks must be GET-only public-page requests; no actual check,
report, payment, provider or account action.

### Recorded pre-release validation

- Dependency ranges, installed versions and lockfile: 16 direct packages consistent;
  no dependency changes.
- TypeScript and lint: passed, no lint warnings/errors.
- Full Node suite: 63 passed, including eight SEO regression groups and unchanged
  checkout/payment-state tests.
- Full fixture browser suite: 20 scenario groups passed, including prior conversion
  scenarios. SEO checks cover 448 HTTP routes, all 418 sitemap entries, 778 schema
  blocks, incoming-link coverage for every sitemap page/model parent, all 122
  advisory links, and the three 308 redirects.
- Responsive: existing 140 template/width combinations plus 42 SEO combinations;
  widths 320/375/390/430/768/1024/1440. Native disclosure keyboard behaviour passed.
  Mobile and desktop directory screenshots reviewed.
- Production build: passed all 14,590 generation tasks using fixture-only environment
  values. Existing Browserslist age and local webpack cache warnings are non-blocking;
  no dependency upgrades were made.
- Diff review: checkout/report/provider/analytics/data files unchanged. Git whitespace
  check passed. All production baseline/smoke requests are public GET requests only.
