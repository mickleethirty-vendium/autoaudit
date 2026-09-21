import type { Metadata } from "next";
import ReportClient from "@/app/report/[id]/ReportClient";
import { absoluteUrl } from "@/lib/seo/routes";
import SampleReportAnalytics from "./SampleReportAnalytics";

export const metadata: Metadata = {
  title: "Sample Used Car Report | AutoAudit",
  description:
    "View a sample AutoAudit used car report showing repair-risk signals, MOT analysis, valuation context and buyer guidance.",
  alternates: {
    canonical: absoluteUrl("/sample-report"),
  },
  openGraph: {
    title: "Sample Used Car Report | AutoAudit",
    description:
      "View a sample AutoAudit used car report showing repair-risk signals, MOT analysis, valuation context and buyer guidance.",
    url: absoluteUrl("/sample-report"),
    type: "website",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sample Used Car Report | AutoAudit",
    description:
      "View a sample AutoAudit used car report showing repair-risk signals, MOT analysis, valuation context and buyer guidance.",
    images: ["/og-image.png"],
  },
};

const motPayload = {
  motTests: [
    {
      completedDate: "2025-03-18",
      testResult: "PASSED",
      odometerValue: 71842,
      odometerUnit: "miles",
      expiryDate: "2026-03-17",
      defects: [
        {
          type: "ADVISORY",
          text: "Nearside front tyre worn close to legal limit/worn on edge",
        },
        {
          type: "ADVISORY",
          text: "Front brake disc worn, pitted or scored, but not seriously weakened",
        },
      ],
    },
    {
      completedDate: "2024-03-11",
      testResult: "PASSED",
      odometerValue: 64219,
      odometerUnit: "miles",
      expiryDate: "2025-03-10",
      defects: [
        {
          type: "ADVISORY",
          text: "Offside front suspension arm pin or bush worn but not resulting in excessive movement",
        },
      ],
    },
    {
      completedDate: "2023-03-02",
      testResult: "PASSED",
      odometerValue: 56904,
      odometerUnit: "miles",
      expiryDate: "2024-03-01",
      defects: [
        {
          type: "ADVISORY",
          text: "Front brake disc worn, pitted or scored, but not seriously weakened",
        },
      ],
    },
  ],
};

const fullSummary = {
  headline:
    "This example vehicle shows moderate buyer risk, mainly from repeated wear-item advisories and known model weak points.",
  summary_text:
    "It is not an automatic avoid, but the buyer should verify repair evidence and use unresolved items during negotiation.",
  vehicle_identity: {
    registration: "AB12 CDE",
    make: "Ford",
    model: "Fiesta",
    derivative: "1.0 EcoBoost Titanium",
    engine: "1.0 EcoBoost",
    fuel: "Petrol",
    transmission: "Manual",
    year: 2017,
    mileage: 71842,
  },
  vehicle_identity_enriched: {
    registration: "AB12 CDE",
    make: "Ford",
    model: "Fiesta",
    derivative: "1.0 EcoBoost Titanium",
    generation: "Mk7 facelift",
    engine: "1.0 EcoBoost",
    engine_family: "EcoBoost",
    engine_size: "1.0L",
    power: "100 bhp",
    fuel: "Petrol",
    transmission: "Manual",
    year: 2017,
    mileage: 71842,
  },
  mot_summary: {
    repeat_advisory_categories: ["Brakes", "Tyres", "Suspension"],
    repeat_advisory_details: [
      {
        text: "Front brake disc wear appears across more than one MOT record.",
        count: 2,
        patternLabel: "Brake wear pattern",
      },
      {
        text: "Tyre and suspension advisories suggest possible alignment or front-end wear.",
        count: 2,
        patternLabel: "Front-end wear pattern",
      },
    ],
  },
  known_model_issues: [
    {
      item_id: "ecoboost_wet_belt",
      issue_code: "ecoboost_wet_belt",
      label: "EcoBoost wet belt service risk",
      category: "engine",
      cost_low: 900,
      cost_high: 1800,
      severity: "high",
      match_confidence: "medium",
      match_basis: "engine_family",
      probability_score: 0.72,
      why_flagged:
        "This engine family is known for timing belt-in-oil service sensitivity. Lack of evidence can increase buyer risk.",
      why_it_matters:
        "Failure or overdue replacement can become expensive quickly compared with the value of the car.",
      questions_to_ask: [
        "Has the wet belt been replaced?",
        "Is there an invoice showing the work, mileage and date?",
        "Was the correct oil specification used throughout servicing?",
      ],
      red_flags: [
        "Seller says it has been done but has no invoice.",
        "Patchy oil service history.",
      ],
    },
    {
      item_id: "fiesta_clutch_wear",
      issue_code: "fiesta_clutch_wear",
      label: "Clutch wear on town-used examples",
      category: "drivetrain",
      cost_low: 450,
      cost_high: 850,
      severity: "medium",
      match_confidence: "medium",
      match_basis: "make_model_only",
      probability_score: 0.56,
      why_flagged:
        "Small hatchbacks used mainly in towns can show clutch wear earlier than expected.",
      why_it_matters:
        "Clutch replacement can materially affect the real cost of buying a cheap used car.",
      questions_to_ask: [
        "Does the clutch bite high?",
        "Has the clutch ever been replaced?",
      ],
      red_flags: [
        "Clutch slip under acceleration.",
        "Judder when pulling away.",
      ],
    },
  ],
  ukvd: {
    enrichment_status: "success",
  },
};

const serviceRiskItems = [
  {
    item_id: "front_brakes",
    label: "Front brake discs and pads likely due",
    category: "brakes",
    cost_low: 220,
    cost_high: 420,
    why_flagged:
      "Brake disc wear appears in the MOT history and may not have been resolved.",
    why_it_matters:
      "Brake work is common but should be priced into the deal if there is no evidence it has been completed.",
    questions_to_ask: [
      "Have the front discs and pads been replaced since the advisory?",
      "Is there an invoice for the work?",
    ],
    red_flags: [
      "Grinding noise during braking.",
      "Seller cannot confirm whether the advisory was repaired.",
    ],
  },
  {
    item_id: "front_tyres_alignment",
    label: "Front tyre wear / possible alignment issue",
    category: "tyres",
    cost_low: 180,
    cost_high: 380,
    why_flagged:
      "Tyre wear close to the legal limit was recorded and may point to normal wear or alignment-related wear.",
    why_it_matters:
      "Uneven tyre wear can indicate suspension or tracking issues, not just old tyres.",
    questions_to_ask: [
      "Were the tyres replaced after the MOT?",
      "Has the tracking or alignment been checked?",
    ],
    red_flags: [
      "Uneven tyre wear across the front axle.",
      "Budget mismatched tyres.",
    ],
  },
  {
    item_id: "service_history_gap",
    label: "Service evidence needs checking",
    category: "maintenance",
    cost_low: 150,
    cost_high: 500,
    why_flagged:
      "This example report assumes the buyer has not yet confirmed full service evidence.",
    why_it_matters:
      "For this engine type, oil service history is especially important.",
    questions_to_ask: [
      "Can the seller show invoices rather than only a stamped book?",
      "Is the oil service history complete?",
    ],
    red_flags: ["Long gaps between services.", "No invoices for major work."],
  },
];

const motRiskItems = [
  {
    item_id: "mot_repeat_advisories",
    label: "Recurring advisory pattern",
    category: "mot_history",
    cost_low: 350,
    cost_high: 900,
    why_flagged:
      "Brakes, tyres and suspension-related advisories appear across multiple MOT records.",
    why_it_matters:
      "Repeated advisories can suggest maintenance has been delayed until MOT time rather than handled proactively.",
    questions_to_ask: [
      "Which advisory items have been repaired?",
      "Can the seller show invoices after each MOT?",
    ],
    red_flags: [
      "Same advisory wording appears year after year.",
      "Seller dismisses advisories as unimportant.",
    ],
  },
  {
    item_id: "suspension_bush_wear",
    label: "Front suspension bush wear",
    category: "suspension",
    cost_low: 250,
    cost_high: 650,
    why_flagged:
      "A previous MOT advisory recorded front suspension arm bush wear.",
    why_it_matters:
      "Suspension wear can affect handling, tyre wear and future MOT outcomes.",
    questions_to_ask: [
      "Was the suspension arm or bush replaced?",
      "Are there any knocks over bumps?",
    ],
    red_flags: ["Knocking on the test drive.", "Uneven front tyre wear."],
  },
];

const hpiChecks = [
  { label: "Finance", value: false },
  { label: "Write-off", value: false },
  { label: "Stolen", value: false },
  { label: "Mileage", value: "No anomaly shown" },
  { label: "Keepers", value: "3 previous keepers" },
  { label: "Plate changes", value: "None shown" },
];

const marketValue = {
  asking_price: 5295,
  benchmark_value: 5000,
  low: 4550,
  high: 5450,
  delta: 295,
  position: "fair",
  summary:
    "The asking price sits within the expected market range, but unresolved advisory items could justify negotiation.",
  valuation_date: "2026-05-09",
  valuation_mileage: 71842,
};

export default function SampleReportPage() {
  return (
    <main className="pb-20 sm:pb-0">
      <section className="mx-auto max-w-7xl px-3 pt-6 sm:px-4 lg:px-5">
        <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-900">
            Sample AutoAudit report
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950">
            This is an example of the report a buyer sees after unlocking
            AutoAudit.
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
            The registration and vehicle details below are example data, but the
            layout, report sections and buyer guidance are based on the real
            AutoAudit report experience.
          </p>
        </div>
      </section>

      <ReportClient
        reg="AB12 CDE"
        make="Ford Fiesta"
        year={2017}
        mileage={71842}
        fuel="Petrol"
        transmission="Manual"
        fullSummary={fullSummary}
        confidenceDisplay="Medium (74/100)"
        baseExposureLow={900}
        baseExposureHigh={2450}
        negotiationSuggested={1250}
        motPanel={{
          available: true,
          latestResult: "PASSED",
          latestDate: "2025-03-18",
          latestAdvisoryCount: 2,
          passCount: 3,
          failCount: 0,
          advisoryCount: 4,
          repeatAdvisoryCount: 2,
        }}
        motPayload={motPayload}
        hpiUnlocked={true}
        hpiStatus="success"
        hpiChecks={hpiChecks}
        hpiUpgradeCheckoutUrl="/pricing"
        hpiUpgradePriceLabel="£5"
        justUnlockedReport={false}
        justUnlockedHpi={false}
        ownerUserId="sample-report"
        userId="sample-report"
        registerUrl="/auth?mode=signup"
        loginUrl="/auth?mode=login"
        expiresAtLabel={null}
        serviceRiskItems={serviceRiskItems}
        motRiskItems={motRiskItems}
        askingPrice={5295}
        marketValue={marketValue}
      />

      <SampleReportAnalytics />
    </main>
  );
}