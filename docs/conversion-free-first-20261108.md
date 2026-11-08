# Conversion Pass 001 — Free Snapshot First (8 November 2026)

## Baseline and scope

Branch: `feature/free-snapshot-first-20261108`.
Baseline: `6abd77be705e6441e00702c61d9b1dedaffab47a` (clean main matched fetched origin/main).
Production remains on `dpl_9yZa8buVjCv5C2TdLCFCkKXFQHuh`.
No production deployment is authorised by this pass.

## Entry-point inventory and changes

| Entry family | Shared implementation / treatment |
| --- | --- |
| Homepage | HomePageClient: free hero, registration CTA, removed paid badges and price cards; free benefits first; pricing link retained |
| Cars directory, make/model hubs, common problems | RegLookupCta: contextual FREE heading, shared button/reassurance; existing H1/article/metadata unchanged |
| MOT hubs, advisory and advisory/model pages | Same shared CTA; advisory-specific intent retained |
| Buying/editorial guides | Same CTA and ResearchArticle integration; budgets/repair costs untouched |
| Diagnostic symptoms and hubs | Same CTA; explicit statement that the check does not diagnose faults retained |
| /check-car-by-registration and /check | Free proposition and labels; existing handoff, validation and lookup logic retained |
| /manual-check | Free action/reassurance, clear registration-data limitation; removed premature paid cards |
| /sample-report | Removed introductory price comparison; free CTA/sticky action; illustrative Core/Bundle section labels retained |
| Navigation | Mobile/footer registration link labelled FREE vehicle snapshot; URLs unchanged |
| /how-it-works | Product explanation remains, but large price promotions replaced by optional-after-free context and pricing link |
| /pricing | Unchanged: prices and commercial information remain available |
| Free snapshot | Verdict and existing useful MOT/repair summary precede purchase on every width; removed redundant early price comparison; optional sidebar/mobile purchase controls retained |
| Paid report / checkout / success | No layout, entitlement or payment-policy change; CheckoutLink adds only a selection event |

Existing public registration forms are RegLookupCta and CheckForm; manual-check supplies details without a registration. No generated SEO page records were edited.

## Copy and free-tier safeguards

The primary button is **Get my FREE snapshot →**, label **UK registration**, with **100% free snapshot. No card required. No obligation.**
The homepage says **Check a used car for FREE**.
The requested benefit wording is qualified as **available MOT-based warnings and estimated repair-cost indicators**: missing records remain possible and estimates are not diagnosis. No promise of free finance/HPI or paid market comparison was added.
Manual entry explicitly states registration-based MOT/history checks are unavailable.
Product prices and definitions remain unchanged. Snapshot purchase labels use the existing `products` definitions.

## Analytics contract

| Event | Firing point |
| --- | --- |
| free_check_viewed | Shared registration CTA / direct checker becomes >=35% visible; once per page visit and bounded CTA context |
| registration_submitted | Alias at the existing validated lookup attempt (`vrm_submitted`); explicit retries are separate attempts |
| vehicle_found | Existing successful lookup event, unchanged |
| snapshot_viewed | Existing successful free-snapshot render; remount deduplication strengthened |
| upgrade_options_viewed | Snapshot options become >=35% visible; snapshot_primary or snapshot_sidebar |
| upgrade_selected | User chooses a tier through the existing CheckoutLink, before the request; never implies success |
| checkout_started | Alias of existing tier-specific start, only after server confirms session creation and a valid Stripe checkout URL |
| purchase_completed | Existing server-confirmed paid-session path and browser deduplication, unchanged; success-page arrival alone does not qualify |

`cta_view` / `cta_click` remain, including `snapshot_mobile_sticky`. The mobile bar returns focus to the existing options; it does not create a checkout.
Historical event names are retained deliberately. Do **not** sum new aliases and old events together. These are aggregate events, not linked unique-customer funnels.
Existing bounded attribution and privacy filtering remain. No registrations, report/session IDs or payment data are added. Browser blocking, failure to return after payment and modifier-click navigation can undercount; Stripe remains the financial source of truth.

## Validation and preview safety

Automated suite: 74 passing tests, including payment eligibility, paid/unpaid verification, Stripe-route mocks, attribution, timeout/recovery, purchase deduplication and SEO gates.
TypeScript, lint, dependency consistency and diff checks passed.
Production build passed in a separate source copy with the existing locked dependencies and inert fixtures: 14,610 generated routes. No existing build output was deleted; no security controls or dependencies changed.
Public metadata/schema/status comparison against production passed for ten representative routes. Robots unchanged; sitemap still 438 identical URLs.
Browser runner `tests/free-first.browser.cjs` uses only intercepted API/checkout responses and a synthetic snapshot. `tests/vehicle-details.browser.cjs` retains missing-field/focus/correction/retry/concurrent-submit checks.

Protected fixture preview: https://autoaudit-5hj8cuhif-auto-audit.vercel.app
Deployment: `dpl_5VkzZrVw8ssKHJgLMVTLk9twoUDH`.
For snapshot layout review: `/preview/fixture-report`.
Vercel authentication is required. The owner can browse public pages and the synthetic snapshot on iPhone. Actual lookup/checkout is intentionally disabled outside the intercepting automated runner.

The disposable preview artifact differs from application source only in its test infrastructure: a synthetic read-only report stub and middleware blocking all API routes. It uses deployment-only inert build/runtime credentials and loopback provider/database endpoints; no project environment was changed. These stubs and credentials are **not** in the commit. Do not promote this fixture preview to production. A separately approved release must build the committed branch normally with existing Production configuration.

No real reports, provider calls, Stripe sessions, transactions or production database writes were performed.

Final browser results: Chromium passed at 320, 375, 390, 430, 768, 1024 and 1440px; installed WebKit 2370 passed at 375 and 390px with touch/mobile emulation. Navigation, 34px safe-area clearance, short 400px laptop viewport, sticky remount deduplication, free result ordering, malformed registration, lookup retry and both successful mocked paid-tier handoffs passed. Vehicle-details recovery passed at 320/375/390/430/768px.
The runner's default WebKit revision was absent; the already installed WebKit executable was selected explicitly. Nothing was installed or upgraded. This is WebKit emulation, not a physical iPhone/Safari test; owner iPhone review remains advisable.
Initial test failures were stale copy assertions and an incorrectly chosen invalid-registration fixture (the existing permissive validator accepts short personalised-style plates). Both test expectations were corrected; no validation/business rule was weakened.
Recommendation: GO for owner preview/release review, with no production release performed. Keep baseline main and the existing production deployment as rollback references.
