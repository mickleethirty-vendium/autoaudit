# AutoAudit conversion rebuild

Baseline: `249f72eb03f626fd7c90309544000646ad9f3e0b`. Work is confined to `feature/cta-conversion-rebuild`; no deployment or payment-provider configuration is part of this change.

## Audit and decisions

The repository contains 54 page templates. Public content includes the homepage, registration landing page, cars index, make hubs, new model buying guides, common-problem pages, MOT advisory index/detail/model combinations, 32 editorial/buying-guide pages, pricing, how-it-works, sample report, privacy and terms. Application routes cover check, manual check, preview, report, success, auth and saved-report lists. There are no separate live diagnostic/symptom page templates; advisory and model pages provide that informational context. A diagnostic CTA intent is available without claiming diagnosis.

| Area | Baseline problem | Decision |
| --- | --- | --- |
| Shared SEO registration CTA | Submitted to `/check-car-by-registration?vrm=…`; that page ignored the query and repeated the form | Submit to existing `/check`; retain the indexable landing page and support old query links |
| Homepage | A separate normaliser/formatter, with formatting that truncated longer plates | Reuse the shared registration component and API format check; retain account-aware content |
| Shared hero | Image and form preceded the heading and useful introduction, particularly costly on mobile | Render the heading/introduction first; retain image on desktop |
| Common-problem and model pages | Already had personalised early/mid/end forms | Keep these placements, identify them for measurement and refine supporting copy |
| Editorial pages | Early form but most end sections offered only research links/backtracking | Keep early CTA and add end registration where absent; no mechanical midpoint insertion |
| Make/cars/advisory hubs | End content referred users to the checker above | Add an end action; preserve research links and content |
| Advisory/model combinations | Two bespoke GET forms without shared validation/tracking | Reuse the same registration component in the existing positions |
| Privacy/terms/auth/saved reports | Different intent from car research | Retain navigation and existing start-check actions; do not add promotional forms to legal/account pages |
| Snapshot | Two mounted CTA components each emitted a page view | One page-owned snapshot event; CTA instances only measure impressions/clicks |
| Paid conversion | £9.99 absent on pricing; unclear sample tier | Explain Free/Core/Full Bundle consistently; sample explicitly demonstrates Full Bundle |
| Checkout | Link clicks labelled session starts; source omitted; cancellation flag ignored | Acknowledge successful session creation before started event; retain GET redirect fallback; show cancellation messages |
| Sample | Reused report renderer emitted real paid-report views | Explicit sample mode; sample views and engagement remain separate |
| Mobile | Tall decorative hero, floating contact overlap, sample sticky without dismissal | Shorten homepage steps; hide decorative article image on mobile; 56px registration inputs; mobile support in menu; sample sticky is dismissible and hidden when either sample form is visible |

No site-wide sticky bar was added. Inline actions already provide a coherent next step; adding another fixed control has no demonstrated benefit yet.

## Architecture and journey

`RegLookupCta` remains the shared public CTA. It accepts intent (`general`, `common-problems`, `mot-advisory`, `buying-guide`, `diagnostic`), position, optional known make/model, light/dark styling and a compact form option. Existing reliable page-specific titles are retained. It supplies labels, inline errors, Enter submission, normalisation and a native GET fallback.

`lib/vehicleCheck.ts` owns registration formatting and the existing API's permissive 2–8 alphanumeric validation. It does not pretend to establish whether a registration actually exists. The DVLA lookup remains authoritative. Non-alphanumeric punctuation is rejected rather than silently converted into a different registration. Modern plates receive display spacing; older/personalised/NI formats are not truncated.

Organic page → shared registration form → `/check?registration=…` → existing `/api/lookup-reg` → mileage/gearbox/model confirmation as required, optional asking price → existing report creation → `/preview/[id]` → Core or Full Bundle checkout → existing verified report/unlock flow. Manual checks retain their existing business logic and distinct instrumentation.

`/check-car-by-registration` keeps its content, canonical and URL. Valid legacy `vrm` or `registration` queries hand off to `/check`. Only registration, valid asking price and allowlisted funnel categories survive that handoff. Arbitrary queries/URLs/identifiers are not propagated.

`CheckoutLink` retains the existing checkout href and intercepts ordinary clicks to request JSON from the same checkout route. Only a successful created-session response with a Stripe checkout URL emits a checkout-start event. Failures leave the snapshot/report accessible with an inline retry message. Ordinary navigation/new-tab/no-JavaScript retains the original redirect contract. Stripe prices and database schema are unchanged. Payment verification is now shared by the report page, session-report API and webhook; see payment safety below.

## Event taxonomy

All permitted names are typed in `lib/analyticsPolicy.ts`; the shared client wrapper uses Vercel Analytics. Existing event names were consolidated; old dashboards must adopt the new names at release.

| Event | Fires when | Context |
| --- | --- | --- |
| `cta_view` | 35% of a shared registration or checkout module is visible; once per CTA identity/page visit, including sticky remounts | page_type, cta_variant, cta_position; known page make/model when supplied |
| `cta_click` | Shared registration form submission attempt, checkout click, or sample sticky action | same CTA context; tier/source for checkout |
| `vrm_submitted` | A valid registration is accepted for an actual lookup, including automatic handoff and direct `/check` entry | page_type, manual/automatic source, entry attribution; not emitted again on the landing form |
| `vehicle_found` | Existing lookup succeeds | availability booleans, entry attribution |
| `snapshot_viewed` | A successfully loaded unpaid preview mounts | page_type and funnel context; one owner per page |
| `core_report_checkout_started` | Created Core Stripe session acknowledged | tier=report, source, position, entry attribution |
| `bundle_checkout_started` | Created Full Bundle session acknowledged | tier=report_plus_hpi, same context |
| `hpi_upgrade_checkout_started` | Created upgrade session acknowledged | tier=hpi_upgrade, same context |
| `checkout_failed` | Session response fails/is unusable | bounded reason=session_creation_failed; no raw message |
| `purchase_completed` | Server has verified Stripe payment_status=paid and matching report, then the report client mounts | tier and allowlisted Stripe source metadata; no report/session ID |
| `paid_report_viewed` | Real paid renderer mounts | hpi_unlocked; sample renderer is excluded |
| `sample_report_viewed` | Sample page mounts | sample=true |
| `sample_report_cta_clicked` | Existing homepage sample-report links | homepage location/source |
| `pricing_viewed` | Pricing page mounts | page_type |
| `manual_check_clicked` | Existing manual-check links | originating page/source |
| `lookup_details_viewed`, `lookup_started`, `lookup_failed` | Check/manual entry and lookup lifecycle | availability booleans, bounded failure reasons |
| `lookup_details_submitted`, `lookup_details_failed`, `free_preview_created`, `lookup_vehicle_reset` | Required detail submission, validation/creation failure, successful creation, reset | field-presence booleans, fuel/transmission, bounded reason |
| `seller_summary_clicked`, `print_requested` | Report actions; print event means a print dialog request, not a confirmed download | page_type=report or sample_report; sample boolean |
| `payment_success_missing_session`, `payment_success_page_viewed`, `payment_unlock_failed`, `payment_unlock_succeeded`, `paid_report_view_clicked` | Legacy success-page verification and report-link action | page_type, bounded failure reason |

Current journey URL context is authoritative: bounded `f_source`, `f_landing`, `f_variant` and `f_position` survive lookup, report creation, preview, checkout and cancellation/return, including manual fallback. No previous-check context is read from tab storage. Optional sessionStorage remembers only the first landing category; unavailable storage is harmless. Checkout metadata and events use the same current context. Known make/model properties are available on landing CTA events but are not propagated through the entire purchase journey.

The payload allowlist drops registration, record/session/user IDs, email, raw error text and vehicle-specific monetary estimates. Analytics URLs strip all queries/fragments and replace private report/preview IDs with category paths. Strict-origin referrer policy prevents query/record paths leaking through HTTP referrers. Custom events initialise the same Vercel queue/privacy hook before emitting, even if child effects mount before the root provider.

Purchase deduplication uses a SHA-256 session digest locally (never exported) and localStorage plus in-memory guards. It prevents StrictMode duplication and ordinary reload duplication. This remains browser conversion analytics: blockers, disabled JavaScript, cleared storage, another browser, failure to return from Stripe, or SDK delivery failure limit completeness. Checkout-start events are unavailable on the native redirect fallback. Stripe remains the transaction source of truth; these events are not an accounting ledger. No cross-device identifier or new database tracking was introduced.

## Product consistency

- **Free snapshot:** available MOT signals and initial estimated repair exposure; no payment details required. Existing free data remains visible.
- **Core £4.99:** detailed findings, itemised repair-risk guidance, fuller MOT analysis, model issues, available market comparison, seller questions and negotiation guidance. Asking price prepares this paid comparison; it is not a Free benefit.
- **Full Bundle £9.99:** Core plus available finance, write-off, stolen, mileage anomaly, keeper and plate-change checks.
- **Existing Core customer:** existing £5 HPI upgrade remains available for registration-backed reports.

Pricing now includes the bundle and upgrade explanation. How-it-works retains its existing two paid-tier descriptions. Registration-backed snapshots and the sample share a three-tier comparison. Manual reports show Free/Core and explain that registration-based history is unavailable. The sample explicitly labels its Full Bundle examples and identifies the Core versus additional history sections. No guarantees or mechanical-diagnosis claims were added.

Core/bundle cancellations return to the free preview; HPI-upgrade cancellation returns to the existing paid report. Messages explain that the prior view remains available. The legacy success page no longer asserts that a payment was received when verification failed.

## SEO and validation boundaries

Existing routes, metadata/canonicals, schemas, sitemap, breadcrumbs, model buying-guide routes and internal links are retained. Content is rendered before the early CTA; public content remains server-rendered. Privacy referrer metadata is additive. No Next.js upgrade is included.

Run `npm test`, `npx tsc --noEmit --incremental false`, `npm run lint -- --no-cache`, `npm ls --depth=0`, and `npm run build`. The unit suite uses Node's test runner and installed TypeScript, with no new dependency. Tests cover plates, query/privacy policy, real checkout route with mocked Stripe, native form markup and purchase deduplication.

`tests/browser.cjs` optionally uses an installed Playwright via PLAYWRIGHT_MODULE and browser executable via BROWSER_EXECUTABLE. It starts an isolated localhost fixture backend and Next dev server, blocks external browser requests, mocks lookup/report creation/checkout, and verifies the funnel, cancellation, sample isolation, events and responsive layouts. It uses fixture-only environment values; no production secrets, database or vehicle/payment services. Screenshots/results are written outside the checkout to `../cta-validation`.

The preservation baseline build failed without STRIPE_SECRET_KEY. A safe build can supply dummy Stripe and Supabase keys, point the Supabase URL at localhost, and disable Next telemetry. This checks buildability but does not validate live provider credentials, production data, real Stripe payment/unlock delivery or analytics dashboard ingestion.

## Later experiments

Measure the repaired path before changing CTA frequency. Consider testing intent-specific headline wording, early versus after-first-section placement, concise versus expanded paid-tier explanations, and Core versus Full Bundle sample emphasis. Compare by landing category, device and origin CTA position. A site-wide sticky CTA should only follow evidence of missed inline actions. Separately address the acknowledged Next.js security maintenance and pre-existing sitemap/robots inconsistencies; neither is bundled into this conversion change.

## Recorded validation — 22 September 2026

- Dependency consistency: `npm ls --depth=0` passed; no dependency or lockfile changes.
- TypeScript: `tsc --noEmit --incremental false` passed.
- Lint: `next lint --no-cache` passed without warnings or errors.
- Tests: all 46 Node tests passed, including checkout eligibility, payment-state matrices against actual report/webhook/session routes, attribution, request cancellation/timeouts, shared checkout locking and impression semantics.
- Browser: all 16 fixture-only scenario groups passed, including 20 representative templates at 320, 375, 390, 430, 768, 1024 and 1440px (140 layout combinations), no overflow, minimum touch-target checks, no runtime errors, no unexpected backend writes and no vehicle/record identifiers in captured events.
- Production build: passed, generating all 14,590 entries, with dummy provider keys and a localhost Supabase URL. The baseline missing-STRIPE_SECRET_KEY failure was environmental; environment validation was not weakened. Non-blocking build notices concerned outdated Browserslist data and webpack cache snapshotting.
- SEO comparison against the preserved source: all 54 page templates checked; 51 SEO/static-generation declarations and 17 structured-data scripts unchanged. Sitemap, robots, SEO routes and schema helpers unchanged.
- Git diff whitespace check passed. Main and preservation refs remain unchanged; application work remains uncommitted on the feature branch.

Live payments, provider responses and Vercel dashboard ingestion were not exercised. They require a separate approved integration/release check; fixture tests do not establish live-service correctness.

## Adversarial corrections and payment safety

`lib/paymentPolicy.ts` permits new entitlements only for a Stripe session with mode=payment, payment_status=paid, matching report metadata and a recognized checkout tier. Session status=complete alone never unlocks anything. The report page, `/api/session-report` and signed Stripe webhook use this policy. The webhook supports both checkout.session.completed and checkout.session.async_payment_succeeded; unsuccessful asynchronous events do not unlock. No code restricts payment methods to cards, so delayed success remains supported. External Stripe event subscriptions have not been inspected or changed.

The sole session creation route, `/api/checkout`, checks report eligibility server-side. Core remains available without registration. Bundle and the existing HPI upgrade require a format-valid registration; the upgrade also requires an already-paid Core report. Hidden UI is not the security boundary. Existing stored paid flags, ownership and expiry behaviour remain trusted and unchanged; historical production entitlements were not audited or altered.

Lookup/report creation requests are bounded at 30 seconds; checkout requests at 35 seconds. Cancellation and generation guards reject stale results and clean up on navigation/unmount. A page-wide checkout lock prevents repeated controls creating concurrent sessions; payment creation is never automatically retried. Upstream DVLA requests use 15 seconds, DVSA calls 10 seconds, checkout database lookup 10 seconds and Stripe creation 20 seconds with SDK retries disabled.

CTA impressions require an observed intersection ratio of at least 0.35. One event is claimed per CTA event/context identity per pathname-and-query visit; remounting the sticky sample control does not reset it. Navigating to a different URL begins another visit; hash-only movement does not. Impression memory is local and ephemeral.

Analytics injection, event emission and browser storage are guarded independently of conversion. Fixture tests inject SDK failures and unavailable storage while completing checks. Floating contact is suppressed on report routes (support remains in navigation/footer), avoiding fixed checkout collisions. Decorative desktop pictures retain optimized responsive sources but use an inline mobile fallback, avoiding mobile hero downloads. Asking-price and manual fields have explicit labels; affected controls have visible keyboard focus.

Browser tests also cover second-check attribution, fresh/cleared storage, cancellation, manual fallback, crafted ineligible checkout requests, shared checkout locking, delayed stale responses, timeout recovery, sticky remounts and mobile image requests. Real Stripe payments, asynchronous event delivery and provider/dashboard integrations remain release checks. Purchase deduplication is browser-local, not an atomic cross-tab or server accounting ledger.
