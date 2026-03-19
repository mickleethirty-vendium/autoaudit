// lib/engine.ts

import type { MotSignals } from "@/lib/motSignals";

type Fuel = string;
type Transmission = string;
type TimingType = "belt" | "chain" | "unknown";

export type EngineInput = {
  year: number;
  mileage: number;
  fuel: Fuel;
  transmission: Transmission;
  timing_type?: TimingType;
  asking_price?: number | null;
  make?: string | null;
  registration?: string | null;
  mot_present?: boolean;
  motSignals?: MotSignals | null;
};

type ReportItem = {
  label: string;
  status: string;
  item_id: string;
  category: string;
  base_low: number;
  base_high: number;
  multiplier: number;
  cost_low: number;
  cost_high: number;
  why_flagged: string;
  why_it_matters?: string;
  questions_to_ask?: string[];
  red_flags?: string[];
};

type Bucket = {
  key: string;
  label: string;
  exposure_low: number;
  exposure_high: number;
  item_count: number;
};

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function roundMoney(n: number) {
  return Math.round(n);
}

function normMake(make?: string | null) {
  if (!make) return null;
  return make.trim().toLowerCase();
}

function titleCase(s: string) {
  return s
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

function brandMultiplier(make?: string | null): number {
  const m = normMake(make);
  if (!m) return 1.0;

  const budget = new Set([
    "dacia",
    "skoda",
    "seat",
    "kia",
    "hyundai",
    "suzuki",
  ]);
  if (budget.has(m)) return 0.9;

  const mainstream = new Set([
    "ford",
    "vauxhall",
    "opel",
    "volkswagen",
    "vw",
    "toyota",
    "honda",
    "nissan",
    "mazda",
    "renault",
    "peugeot",
    "citroen",
    "fiat",
    "mini",
    "mg",
  ]);
  if (mainstream.has(m)) return 1.0;

  const premium = new Set([
    "bmw",
    "audi",
    "mercedes",
    "mercedes-benz",
    "lexus",
    "volvo",
    "jaguar",
    "alfa romeo",
  ]);
  if (premium.has(m)) return 1.25;

  const high = new Set([
    "porsche",
    "land rover",
    "range rover",
    "maserati",
    "ferrari",
    "lamborghini",
    "bentley",
    "aston martin",
    "mclaren",
  ]);
  if (high.has(m)) return 1.6;

  return 1.1;
}

function formatCategoryList(values: string[]) {
  if (!values.length) return "";
  if (values.length === 1) return values[0];
  if (values.length === 2) return `${values[0]} and ${values[1]}`;
  return `${values.slice(0, -1).join(", ")}, and ${values[values.length - 1]}`;
}

function normaliseRepeatCategoryLabel(value: string) {
  const v = value.trim().toLowerCase();
  if (!v) return null;

  const map: Record<string, string> = {
    brake: "brakes",
    brakes: "brakes",
    braking: "brakes",
    suspension: "suspension",
    steering: "steering",
    tyre: "tyres",
    tyres: "tyres",
    tire: "tyres",
    tires: "tyres",
    corrosion: "corrosion",
    structure: "corrosion",
    exhaust: "exhaust",
    emissions: "emissions",
    engine: "engine",
    drivetrain: "drivetrain",
    lighting: "lighting",
    electrical: "electrical",
    body: "body",
  };

  return map[v] ?? titleCase(v);
}

function getRepeatAdvisoryCategoryLabels(mot?: MotSignals | null): string[] {
  if (!mot) return [];

  const rawCandidates: unknown[] = [];
  const anyMot = mot as any;

  if (Array.isArray(anyMot.repeatAdvisoryCategories)) {
    rawCandidates.push(...anyMot.repeatAdvisoryCategories);
  }

  if (Array.isArray(anyMot.repeatAdvisoryGroups)) {
    rawCandidates.push(...anyMot.repeatAdvisoryGroups);
  }

  if (Array.isArray(anyMot.repeatAdvisoryLabels)) {
    rawCandidates.push(...anyMot.repeatAdvisoryLabels);
  }

  const normalised = rawCandidates
    .map((value) =>
      typeof value === "string" ? normaliseRepeatCategoryLabel(value) : null
    )
    .filter(Boolean) as string[];

  return Array.from(new Set(normalised));
}

function macroBucketForCategory(category: string): { key: string; label: string } {
  const c = (category || "").toLowerCase();

  if (["engine", "drivetrain", "cooling", "turbo", "timing"].includes(c)) {
    return { key: "engine_drivetrain", label: "Engine & Drivetrain" };
  }
  if (["brakes", "safety"].includes(c)) {
    return { key: "brakes_safety", label: "Brakes & Safety" };
  }
  if (["suspension", "steering", "chassis"].includes(c)) {
    return { key: "suspension_steering", label: "Suspension & Steering" };
  }
  if (["electrical", "electronics"].includes(c)) {
    return { key: "electronics", label: "Electrical & Electronics" };
  }
  if (
    ["service", "general_maintenance_risk", "fluids", "filters"].includes(c)
  ) {
    return { key: "routine_service", label: "Routine Service" };
  }
  if (["mot", "mot_history"].includes(c)) {
    return { key: "mot_history", label: "MoT History Signals" };
  }

  return { key: "other", label: "Other Checks" };
}

function confidenceScore(input: EngineInput, items: ReportItem[]) {
  let score = 74;
  const reasons: string[] = [];

  if (!Number.isFinite(input.year)) {
    score -= 35;
    reasons.push("Missing or invalid year reduces confidence.");
  } else {
    reasons.push("Vehicle year provided.");
  }

  if (!Number.isFinite(input.mileage)) {
    score -= 35;
    reasons.push("Missing or invalid mileage reduces confidence.");
  } else {
    reasons.push("Mileage provided.");
  }

  if ((input.timing_type ?? "unknown") === "unknown") {
    score -= 10;
    reasons.push("Timing type unknown, so major interval assumptions are broader.");
  } else {
    reasons.push("Timing type provided.");
  }

  if (!input.make) {
    score -= 8;
    reasons.push("Make not provided, so cost calibration is less precise.");
  } else {
    reasons.push("Make provided, improving cost calibration.");
  }

  if (
    !input.transmission ||
    String(input.transmission).toLowerCase().includes("select")
  ) {
    score -= 8;
    reasons.push("Transmission not confirmed.");
  } else {
    reasons.push("Transmission confirmed.");
  }

  if (!input.fuel) {
    score -= 6;
    reasons.push("Fuel type missing.");
  } else {
    reasons.push("Fuel type confirmed.");
  }

  if (input.motSignals || input.mot_present) {
    score += 8;
    reasons.push("MoT history present, improving confidence.");
  } else {
    reasons.push("MoT history not included, so confidence is lower.");
  }

  if (input.motSignals?.repeatAdvisories?.length) {
    score += 3;
    reasons.push("Repeated MoT advisory patterns strengthen the estimate.");
  }

  if (input.motSignals?.recentFailureCount) {
    score += 4;
    reasons.push("Recent MoT failures strengthen the estimate.");
  }

  if (items.length >= 3) {
    score += 2;
    reasons.push("Multiple risk items identified.");
  } else if (items.length <= 1) {
    score -= 5;
    reasons.push("Few detected items, so the estimate has less signal.");
  }

  score = clamp(score, 30, 95);

  const label = score >= 80 ? "High" : score >= 60 ? "Medium" : "Low";

  return { score, label, reasons };
}

function shortDriverReason(item: ReportItem) {
  const label = item.label.toLowerCase();

  if (label.includes("timing belt") || label.includes("cam belt")) {
    return "Timing-related maintenance may be due based on age or mileage.";
  }
  if (label.includes("recent mot failure")) {
    return "Recent MoT failures suggest defects that need checking.";
  }
  if (label.includes("recurring advisory")) {
    return "Repeated advisory patterns suggest issues may have persisted over time.";
  }
  if (label.includes("corrosion")) {
    return "MoT history contains corrosion-related wording.";
  }
  if (label.includes("brake")) {
    return "Brake-related wear or MoT history may lead to near-term cost.";
  }
  if (label.includes("suspension") || label.includes("steering")) {
    return "Suspension or steering wear signals were identified.";
  }
  if (label.includes("dpf")) {
    return "Diesel age and mileage increase emissions-system risk.";
  }
  if (label.includes("mileage history")) {
    return "Mileage progression should be checked more closely.";
  }

  return item.why_flagged;
}

function buildHeadline(
  risk_level: "low" | "medium" | "high",
  exposure_high: number,
  mot?: MotSignals | null
) {
  if (
    risk_level === "high" ||
    mot?.corrosionFlag ||
    (mot?.hasRecentFailures && exposure_high >= 1000)
  ) {
    return "This vehicle may carry meaningful near-term repair risk.";
  }

  if (risk_level === "medium") {
    return "There are signs worth checking before you buy.";
  }

  return "This vehicle looks less exposed, but hidden issues can still matter.";
}

function buildSummaryText(
  risk_level: "low" | "medium" | "high",
  exposure_low: number,
  exposure_high: number,
  mot?: MotSignals | null
) {
  const motContext =
    mot &&
    (mot.hasRecentFailures || mot.repeatAdvisories?.length || mot.corrosionFlag)
      ? " MoT history also adds useful warning signals."
      : "";

  if (risk_level === "high") {
    return `Estimated near-term repair exposure is around £${exposure_low}–£${exposure_high}.${motContext} This is the kind of profile worth checking carefully before agreeing a price.`;
  }

  if (risk_level === "medium") {
    return `Estimated near-term repair exposure is around £${exposure_low}–£${exposure_high}.${motContext} There is enough here to justify a closer look at the detailed findings.`;
  }

  return `Estimated near-term repair exposure is around £${exposure_low}–£${exposure_high}.${motContext} The profile looks lighter, but further detail may still help avoid surprises.`;
}

export function generateReport(input: EngineInput) {
  const nowYear = new Date().getFullYear();
  const age = nowYear - input.year;
  const mileage = input.mileage;

  const timingType: TimingType = input.timing_type ?? "unknown";
  const makeMult = brandMultiplier(input.make);
  const mot = input.motSignals ?? null;
  const repeatAdvisoryCategoryLabels = getRepeatAdvisoryCategoryLabels(mot);

  const items: ReportItem[] = [];

  if (timingType !== "chain") {
    const due = age >= 5 || mileage >= 60000;
    if (due) {
      const baseLow = 450;
      const baseHigh = 900;
      items.push({
        label: "Timing belt / cam belt replacement",
        status: "likely_due_or_unverified",
        item_id: "timing_belt",
        category: "engine",
        base_low: baseLow,
        base_high: baseHigh,
        multiplier: 1,
        cost_low: roundMoney(baseLow * makeMult),
        cost_high: roundMoney(baseHigh * makeMult),
        why_flagged:
          "Timing type is belt/unknown and the vehicle is 5+ years old or 60k+ miles.",
        why_it_matters:
          "Many belt-driven engines require replacement on time or mileage intervals. Failure can cause major engine damage and far higher costs than preventative replacement.",
        questions_to_ask: [
          "When was the belt last replaced (date and mileage)?",
          "Do you have an invoice showing the work?",
          "Was the water pump or tensioner kit replaced at the same time?",
        ],
        red_flags: [
          "Seller is unsure or has no documentation",
          "Claims it was done without proof",
        ],
      });
    }
  }

  if (age >= 5) {
    const baseLow = 60;
    const baseHigh = 120;
    items.push({
      label: "Brake fluid change",
      status: "likely_overdue",
      item_id: "brake_fluid",
      category: "brakes",
      base_low: baseLow,
      base_high: baseHigh,
      multiplier: 1,
      cost_low: roundMoney(baseLow * makeMult),
      cost_high: roundMoney(baseHigh * makeMult),
      why_flagged: "Vehicle is 5+ years old and brake fluid is often neglected.",
      why_it_matters:
        "Brake fluid absorbs moisture over time, which can reduce braking performance and increase corrosion risk.",
      questions_to_ask: [
        "When was brake fluid last changed?",
        "Is there an invoice or service record entry for it?",
      ],
    });
  }

  const fuel = String(input.fuel || "").toLowerCase();
  if (fuel.includes("diesel") && mileage >= 70000) {
    const baseLow = 150;
    const baseHigh = 400;
    items.push({
      label: "DPF cleaning (risk)",
      status: "risk_due_to_age_mileage",
      item_id: "dpf",
      category: "engine",
      base_low: baseLow,
      base_high: baseHigh,
      multiplier: 0.5,
      cost_low: roundMoney(baseLow * makeMult * 0.5),
      cost_high: roundMoney(baseHigh * makeMult * 0.5),
      why_flagged: "Diesel vehicle with 70k+ miles increases DPF/EGR risk.",
      why_it_matters:
        "Short-trip diesel use can increase DPF clogging risk. Preventive cleaning can be cheaper than more serious DPF problems.",
      questions_to_ask: [
        "Has the car mainly done short trips or motorway driving?",
        "Any DPF warning lights or forced regenerations?",
      ],
    });
  }

  if (mileage >= 70000) {
    const baseLow = 300;
    const baseHigh = 600;
    items.push({
      label: "Brake discs & pads (verification)",
      status: "due_soon_or_verify",
      item_id: "brakes",
      category: "brakes",
      base_low: baseLow,
      base_high: baseHigh,
      multiplier: 0.5,
      cost_low: roundMoney(baseLow * makeMult * 0.5),
      cost_high: roundMoney(baseHigh * makeMult * 0.5),
      why_flagged:
        "Mileage is 70k+ and brake wear items may be due soon or need verification.",
      why_it_matters:
        "Brakes are common wear items. If replacement is close, this becomes a real negotiation point.",
      questions_to_ask: [
        "When were pads and discs last replaced?",
        "Any pulsing under braking or pulling to one side?",
      ],
    });
  }

  if (mileage >= 80000) {
    const baseLow = 300;
    const baseHigh = 900;
    items.push({
      label: "Suspension wear (risk)",
      status: "risk_due_soon",
      item_id: "suspension",
      category: "suspension",
      base_low: baseLow,
      base_high: baseHigh,
      multiplier: 0.5,
      cost_low: roundMoney(baseLow * makeMult * 0.5),
      cost_high: roundMoney(baseHigh * makeMult * 0.5),
      why_flagged:
        "Mileage is 80k+ and suspension wear risk increases at this level.",
      why_it_matters:
        "Suspension wear becomes more common at higher mileage and can lead to advisory or failure costs.",
      questions_to_ask: [
        "Any MoT advisories for suspension or steering components?",
      ],
    });
  }

  if (mot?.hasRecentFailures) {
    const baseLow = 150;
    const baseHigh = 450;
    items.push({
      label: "Recent MoT failure items need follow-up",
      status: "recent_failure_history",
      item_id: "mot_recent_failures",
      category: "mot_history",
      base_low: baseLow,
      base_high: baseHigh,
      multiplier: 1,
      cost_low: roundMoney(baseLow * makeMult),
      cost_high: roundMoney(baseHigh * makeMult),
      why_flagged: `Recent MoT history shows ${mot.recentFailureCount} failure${
        mot.recentFailureCount === 1 ? "" : "s"
      }.`,
      why_it_matters:
        "Recent failures can indicate unresolved defects or repairs that were only just enough to get the car through a later test.",
      questions_to_ask: [
        "What were the most recent MoT failure items?",
        "Do you have invoices showing the work completed after the failure?",
      ],
      red_flags: [
        "Seller cannot explain recent failure history",
        "No proof of remedial work",
      ],
    });
  }

  if (mot?.repeatAdvisories?.length) {
    const baseLow = 80;
    const baseHigh = 220;

    const categoryText = repeatAdvisoryCategoryLabels.length
      ? ` Repeat patterns appear in ${formatCategoryList(
          repeatAdvisoryCategoryLabels
        )}.`
      : "";

    items.push({
      label: repeatAdvisoryCategoryLabels.length
        ? `Recurring advisory pattern detected (${formatCategoryList(
            repeatAdvisoryCategoryLabels
          )})`
        : "Recurring advisory pattern detected",
      status: "repeat_advisory_pattern",
      item_id: "mot_repeat_advisories",
      category: "general_maintenance_risk",
      base_low: baseLow,
      base_high: baseHigh,
      multiplier: 1,
      cost_low: roundMoney(baseLow * makeMult),
      cost_high: roundMoney(baseHigh * makeMult),
      why_flagged: `MoT history shows ${mot.repeatAdvisories.length} recurring advisory pattern${
        mot.repeatAdvisories.length === 1 ? "" : "s"
      }.${categoryText}`,
      why_it_matters:
        "Recurring advisories can suggest the same underlying issue has persisted over multiple test cycles.",
      questions_to_ask: repeatAdvisoryCategoryLabels.length
        ? [
            `Can you explain the repeated ${formatCategoryList(
              repeatAdvisoryCategoryLabels
            )} advisories?`,
            "Were the recurring advisory items properly repaired after previous MoTs?",
            "Do you have invoices for work relating to those repeated advisories?",
          ]
        : [
            "Which advisory items have appeared more than once?",
            "Were the recurring advisory items properly repaired after previous MoTs?",
            "Do you have invoices for work relating to those repeated advisories?",
          ],
    });
  }

  if (mot?.corrosionFlag) {
    const baseLow = 250;
    const baseHigh = 1200;
    items.push({
      label: "Corrosion / underside condition follow-up",
      status: "mot_corrosion_signal",
      item_id: "mot_corrosion",
      category: "mot_history",
      base_low: baseLow,
      base_high: baseHigh,
      multiplier: 1,
      cost_low: roundMoney(baseLow * makeMult),
      cost_high: roundMoney(baseHigh * makeMult),
      why_flagged: "MoT history contains corrosion-related wording.",
      why_it_matters:
        "Corrosion can range from light surface treatment to structural welding. It is one of the most important warning signals in MoT history.",
      questions_to_ask: [
        "What corrosion-related MoT advisories or failures has the car had?",
        "Has any welding or structural repair been carried out?",
        "Can the underside be inspected before purchase?",
      ],
      red_flags: [
        "Fresh underseal with no photos or invoices",
        "Seller dismisses corrosion history",
      ],
    });
  }

  if (mot?.brakeFlag) {
    const baseLow = 180;
    const baseHigh = 500;
    items.push({
      label: "Brake-related MoT advisories",
      status: "mot_brake_signal",
      item_id: "mot_brake_signal",
      category: "mot_history",
      base_low: baseLow,
      base_high: baseHigh,
      multiplier: 0.8,
      cost_low: roundMoney(baseLow * makeMult * 0.8),
      cost_high: roundMoney(baseHigh * makeMult * 0.8),
      why_flagged:
        "MoT history contains brake-related advisory or failure wording.",
      why_it_matters:
        "Brake-related history can mean either imminent consumable costs or unresolved braking issues.",
      questions_to_ask: [
        "What brake work has been done since the advisory or failure?",
        "Are there invoices for pads, discs, lines or caliper work?",
      ],
    });
  }

  if (mot?.tyreFlag) {
    const baseLow = 120;
    const baseHigh = 350;
    items.push({
      label: "Tyre condition / tread follow-up",
      status: "mot_tyre_signal",
      item_id: "mot_tyre_signal",
      category: "mot_history",
      base_low: baseLow,
      base_high: baseHigh,
      multiplier: 1,
      cost_low: roundMoney(baseLow * makeMult),
      cost_high: roundMoney(baseHigh * makeMult),
      why_flagged: "MoT history contains tyre or tread-related wording.",
      why_it_matters:
        "Tyres are safety-critical and often become an immediate cost if left close to legal or practical limits.",
      questions_to_ask: [
        "When were the tyres last replaced?",
        "Are all four tyres matched and do they have good tread depth?",
      ],
    });
  }

  if (mot?.suspensionFlag) {
    const baseLow = 200;
    const baseHigh = 700;
    items.push({
      label: "Suspension / steering MoT advisories",
      status: "mot_suspension_signal",
      item_id: "mot_suspension_signal",
      category: "mot_history",
      base_low: baseLow,
      base_high: baseHigh,
      multiplier: 0.9,
      cost_low: roundMoney(baseLow * makeMult * 0.9),
      cost_high: roundMoney(baseHigh * makeMult * 0.9),
      why_flagged:
        "MoT history contains suspension or steering-related wording.",
      why_it_matters:
        "Recurring suspension or steering advisories can point to worn components and more near-term spend.",
      questions_to_ask: [
        "Have any springs, shocks, arms, links or bushes been replaced recently?",
        "Are there invoices for the advisory items?",
      ],
    });
  }

  if (mot?.mileageConcern) {
    const baseLow = 50;
    const baseHigh = 150;
    items.push({
      label: "Mileage history consistency check",
      status: "mot_mileage_signal",
      item_id: "mot_mileage_signal",
      category: "mot_history",
      base_low: baseLow,
      base_high: baseHigh,
      multiplier: 1,
      cost_low: roundMoney(baseLow * makeMult),
      cost_high: roundMoney(baseHigh * makeMult),
      why_flagged: "MoT history suggests mileage progression needs checking.",
      why_it_matters:
        "Mileage inconsistencies can materially affect valuation and confidence in the vehicle history.",
      questions_to_ask: [
        "Can the seller explain the mileage history?",
        "Do service records align with the MoT mileage progression?",
      ],
      red_flags: [
        "Mileage cannot be explained",
        "Service records do not align with MoT history",
      ],
    });
  }

  const exposure_low = roundMoney(
    items.reduce((sum, it) => sum + (it.cost_low ?? 0), 0)
  );
  const exposure_high = roundMoney(
    items.reduce((sum, it) => sum + (it.cost_high ?? 0), 0)
  );

  let risk_level: "low" | "medium" | "high" =
    exposure_high >= 1500 ? "high" : exposure_high >= 700 ? "medium" : "low";

  if (
    risk_level === "low" &&
    (mot?.hasRecentFailures ||
      mot?.corrosionFlag ||
      mot?.repeatAdvisories?.length)
  ) {
    risk_level = "medium";
  }

  if (mot?.corrosionFlag && (mot.hasRecentFailures || exposure_high >= 900)) {
    risk_level = "high";
  }

  const primary_drivers = [...items]
    .sort((a, b) => (b.cost_high ?? 0) - (a.cost_high ?? 0))
    .slice(0, 3)
    .map((it) => ({
      label: it.label,
      reason_short: shortDriverReason(it),
    }));

  const midpointExposure = (exposure_low + exposure_high) / 2;
  const negotiationBase = roundMoney(midpointExposure * 0.65);
  const negotiation_suggested = clamp(
    negotiationBase +
      (mot?.hasRecentFailures ? 100 : 0) +
      (mot?.corrosionFlag ? 150 : 0) +
      (mot?.repeatAdvisories?.length ? 75 : 0),
    0,
    25000
  );

  const confidence = confidenceScore(
    {
      ...input,
      mot_present: input.mot_present || !!mot,
    },
    items
  );

  const headline = buildHeadline(risk_level, exposure_high, mot);
  const summary_text = buildSummaryText(
    risk_level,
    exposure_low,
    exposure_high,
    mot
  );

  const bucketMap = new Map<string, Bucket>();

  for (const it of items) {
    const b = macroBucketForCategory(it.category);
    const existing = bucketMap.get(b.key);
    if (!existing) {
      bucketMap.set(b.key, {
        key: b.key,
        label: b.label,
        exposure_low: it.cost_low ?? 0,
        exposure_high: it.cost_high ?? 0,
        item_count: 1,
      });
    } else {
      existing.exposure_low += it.cost_low ?? 0;
      existing.exposure_high += it.cost_high ?? 0;
      existing.item_count += 1;
    }
  }

  const buckets = [...bucketMap.values()].sort(
    (a, b) => b.exposure_high - a.exposure_high
  );

  const teaser_labels = [...items]
    .sort((a, b) => (b.cost_high ?? 0) - (a.cost_high ?? 0))
    .slice(0, 5)
    .map((it) => it.label);

  const full = {
    items,
    summary: {
      headline,
      summary_text,
      risk_level,
      risk: risk_level,
      exposure_low,
      exposure_high,
      primary_drivers,
      negotiation_suggested,
      confidence,
      mot_summary: mot
        ? {
            recent_failure_count: mot.recentFailureCount,
            recent_advisory_count: mot.recentAdvisoryCount,
            repeat_advisory_count: mot.repeatAdvisories.length,
            repeat_advisory_categories: repeatAdvisoryCategoryLabels,
            corrosion_flag: mot.corrosionFlag,
            brake_flag: mot.brakeFlag,
            tyre_flag: mot.tyreFlag,
            suspension_flag: mot.suspensionFlag,
            mileage_concern: mot.mileageConcern,
          }
        : null,
    },
    negotiation: {
      suggested_reduction: negotiation_suggested,
      tip: "Use the suggested reduction as a starting point, then adjust for service history and any proof of recent work.",
      script: `Based on the vehicle’s age, mileage and available history, I’d need to budget roughly £${negotiation_suggested} for likely near-term maintenance unless there’s documented proof these items were recently done. I’d be more comfortable proceeding at around £X.`,
    },
    disclaimer: {
      text: "AutoAudit provides cost guidance based on typical UK maintenance intervals, available history signals and independent garage pricing. It is not a mechanical inspection and does not diagnose faults or guarantee required repairs.",
    },
  };

  const preview = {
    summary: {
      headline,
      summary_text,
      risk_level,
      risk: risk_level,
      exposure_low,
      exposure_high,
      primary_drivers,
      negotiation_suggested,
      confidence,
    },
    buckets,
    teaser: {
      hidden_count: items.length,
      blurred_labels: teaser_labels,
    },
  };

  return { preview, full };
}