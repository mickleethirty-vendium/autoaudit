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

function normMake(make?: string | null) {
  if (!make) return null;
  return make.trim().toLowerCase();
}

/**
 * Brand calibration (simple v1).
 */
function brandMultiplier(make?: string | null): number {
  const m = normMake(make);
  if (!m) return 1.0;

  const budget = new Set(["dacia", "skoda", "seat", "kia", "hyundai", "suzuki"]);
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
  ]);
  if (high.has(m)) return 1.6;

  return 1.1;
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
  if (["service", "general_maintenance_risk", "fluids", "filters"].includes(c)) {
    return { key: "routine_service", label: "Routine Service" };
  }
  if (["mot", "mot_history"].includes(c)) {
    return { key: "mot_history", label: "MoT History Signals" };
  }

  return { key: "other", label: "Other Checks" };
}

function confidenceScore(input: EngineInput, items: ReportItem[]) {
  let score = 75;
  const reasons: string[] = [];

  if (!Number.isFinite(input.year)) {
    score -= 35;
    reasons.push("Missing/invalid year reduces confidence.");
  }
  if (!Number.isFinite(input.mileage)) {
    score -= 35;
    reasons.push("Missing/invalid mileage reduces confidence.");
  }

  if ((input.timing_type ?? "unknown") === "unknown") {
    score -= 12;
    reasons.push("Timing type unknown (belt vs chain) affects major interval estimates.");
  }

  if (!input.make) {
    score -= 10;
    reasons.push("Make not provided — cost calibration may be less precise.");
  } else {
    reasons.push("Make provided — cost calibration improved.");
  }

  if (!input.transmission || String(input.transmission).toLowerCase().includes("select")) {
    score -= 8;
    reasons.push("Transmission not confirmed — drivetrain wear assumptions may be weaker.");
  } else {
    reasons.push("Transmission confirmed.");
  }

  if (!input.fuel) {
    score -= 6;
    reasons.push("Fuel type missing — emissions system risk assumptions may be weaker.");
  } else {
    reasons.push("Fuel type confirmed.");
  }

  if (input.motSignals || input.mot_present) {
    score += 6;
    reasons.push("MoT history present — advisory patterns improve confidence.");
  } else {
    reasons.push("MoT history not yet included — confidence could improve with advisories.");
  }

  if (input.motSignals?.repeatAdvisories?.length) {
    score += 4;
    reasons.push("Repeated MoT advisory patterns strengthen the estimate.");
  }

  if (input.motSignals?.recentFailureCount) {
    score += 4;
    reasons.push("Recent MoT failures strengthen the estimate.");
  }

  if (items.length <= 1) {
    score -= 6;
    reasons.push("Few detected items — estimate has less signal.");
  }

  score = clamp(score, 30, 95);

  const label = score >= 80 ? "High" : score >= 60 ? "Medium" : "Low";

  return { score, label, reasons };
}

export function generateReport(input: EngineInput) {
  const nowYear = new Date().getFullYear();
  const age = nowYear - input.year;
  const mileage = input.mileage;

  const timingType: TimingType = input.timing_type ?? "unknown";
  const makeMult = brandMultiplier(input.make);
  const mot = input.motSignals ?? null;

  const items: ReportItem[] = [];

  // ---- Base rules ----

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
        cost_low: Math.round(baseLow * makeMult),
        cost_high: Math.round(baseHigh * makeMult),
        why_flagged: "Timing type is belt/unknown AND vehicle is 5+ years old or 60k+ miles.",
        why_it_matters:
          "Many belt-driven engines require replacement on time/mileage intervals. Belt failure can cause severe internal engine damage and significantly higher costs than preventive replacement.",
        questions_to_ask: [
          "When was the belt last replaced (date + mileage)?",
          "Do you have an invoice showing the work?",
          "Was the water pump/tensioner kit replaced at the same time?",
        ],
        red_flags: ["Seller unsure or no documentation", "Claims it's fine without proof"],
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
      cost_low: Math.round(baseLow * makeMult),
      cost_high: Math.round(baseHigh * makeMult),
      why_flagged: "Vehicle is 5+ years old (often due every ~2 years).",
      why_it_matters:
        "Brake fluid absorbs moisture over time which can reduce performance and increase corrosion risk. Often neglected but inexpensive to fix.",
      questions_to_ask: [
        "When was brake fluid last changed (date)?",
        "Any invoice or service record entry?",
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
      cost_low: Math.round(baseLow * makeMult * 0.5),
      cost_high: Math.round(baseHigh * makeMult * 0.5),
      why_flagged: "Diesel + 70k+ miles (DPF/EGR risk increases).",
      why_it_matters:
        "Short-trip diesel use can increase DPF clogging risk. A preventive clean can be cheaper than major DPF issues.",
      questions_to_ask: [
        "Mostly short trips or motorway driving?",
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
      cost_low: Math.round(baseLow * makeMult * 0.5),
      cost_high: Math.round(baseHigh * makeMult * 0.5),
      why_flagged: "Mileage 70k+ (wear items likely changed or nearing replacement).",
      why_it_matters: "Brakes are wear items; if replacement is imminent it is negotiable.",
      questions_to_ask: [
        "When were pads/discs last replaced (front/rear)?",
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
      cost_low: Math.round(baseLow * makeMult * 0.5),
      cost_high: Math.round(baseHigh * makeMult * 0.5),
      why_flagged: "Mileage 80k+ (wear risk increases).",
      why_it_matters: "Suspension wear is common at higher mileage; verify with inspection/advisories.",
      questions_to_ask: ["Any MOT advisories for suspension?"],
    });
  }

  // ---- MoT-derived rules ----

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
      cost_low: Math.round(baseLow * makeMult),
      cost_high: Math.round(baseHigh * makeMult),
      why_flagged: `Recent MoT history shows ${mot.recentFailureCount} failure${mot.recentFailureCount === 1 ? "" : "s"}.`,
      why_it_matters:
        "Recent failures can indicate unresolved defects or maintenance that was only temporarily addressed before sale.",
      questions_to_ask: [
        "What were the most recent MoT failure items?",
        "Do you have invoices showing the work completed after the failure?",
      ],
      red_flags: ["Seller cannot explain recent failure history", "No proof of remedial work"],
    });
  }

  if (mot?.repeatAdvisories?.length) {
    const baseLow = 80;
    const baseHigh = 220;
    items.push({
      label: "Recurring advisory pattern detected",
      status: "repeat_advisory_pattern",
      item_id: "mot_repeat_advisories",
      category: "general_maintenance_risk",
      base_low: baseLow,
      base_high: baseHigh,
      multiplier: 1,
      cost_low: Math.round(baseLow * makeMult),
      cost_high: Math.round(baseHigh * makeMult),
      why_flagged: `MoT history shows ${mot.repeatAdvisories.length} recurring advisory pattern${mot.repeatAdvisories.length === 1 ? "" : "s"} across multiple test cycles.`,
      why_it_matters:
        "Recurring advisories can suggest an issue has been allowed to persist over time rather than being fully resolved after a single MoT.",
      questions_to_ask: [
        "Which advisory items have appeared more than once in the MoT history?",
        "Were the recurring advisory items repaired properly after previous MoTs?",
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
      cost_low: Math.round(baseLow * makeMult),
      cost_high: Math.round(baseHigh * makeMult),
      why_flagged: "MoT history contains corrosion-related wording.",
      why_it_matters:
        "Corrosion can range from surface treatment to structural work. It is one of the most important MoT-derived warning signals.",
      questions_to_ask: [
        "What corrosion-related MoT advisories or failures has the car had?",
        "Has any welding or structural repair been carried out?",
        "Can the underside be inspected before purchase?",
      ],
      red_flags: ["Fresh underseal with no photos/invoices", "Seller dismisses corrosion history"],
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
      cost_low: Math.round(baseLow * makeMult * 0.8),
      cost_high: Math.round(baseHigh * makeMult * 0.8),
      why_flagged: "MoT history contains brake-related advisory or failure wording.",
      why_it_matters:
        "Brake-related MoT history can mean imminent consumable costs or unresolved braking performance issues.",
      questions_to_ask: [
        "What brake work has been done since the advisory/failure?",
        "Are there invoices for pads, discs, lines, or caliper work?",
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
      cost_low: Math.round(baseLow * makeMult),
      cost_high: Math.round(baseHigh * makeMult),
      why_flagged: "MoT history contains tyre or tread-related advisory wording.",
      why_it_matters:
        "Tyres are safety-critical and often become an immediate post-purchase cost if left close to limits.",
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
      cost_low: Math.round(baseLow * makeMult * 0.9),
      cost_high: Math.round(baseHigh * makeMult * 0.9),
      why_flagged: "MoT history contains suspension or steering-related advisory wording.",
      why_it_matters:
        "Recurring suspension or steering advisories can point to worn components and further near-term spend.",
      questions_to_ask: [
        "Have any springs, shocks, arms, links, or bushes been replaced recently?",
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
      cost_low: Math.round(baseLow * makeMult),
      cost_high: Math.round(baseHigh * makeMult),
      why_flagged: "MoT history suggests mileage progression needs checking.",
      why_it_matters:
        "Mileage inconsistencies can materially affect valuation and confidence in the vehicle history.",
      questions_to_ask: [
        "Can the seller explain the mileage history?",
        "Do service records align with the MoT mileage progression?",
      ],
      red_flags: ["Mileage cannot be explained", "Service records do not align with MoT history"],
    });
  }

  // ---- Totals / summary ----

  const exposure_low = Math.round(
    items.reduce((sum, it) => sum + (it.cost_low ?? 0), 0)
  );
  const exposure_high = Math.round(
    items.reduce((sum, it) => sum + (it.cost_high ?? 0), 0)
  );

  let risk_level: "low" | "medium" | "high" =
    exposure_high >= 1500 ? "high" : exposure_high >= 700 ? "medium" : "low";

  if (
    risk_level === "low" &&
    (mot?.hasRecentFailures || mot?.corrosionFlag || mot?.repeatAdvisories?.length)
  ) {
    risk_level = "medium";
  }

  if (
    mot?.corrosionFlag &&
    (mot.hasRecentFailures || exposure_high >= 900)
  ) {
    risk_level = "high";
  }

  const primary_drivers = [...items]
    .sort((a, b) => (b.cost_high ?? 0) - (a.cost_high ?? 0))
    .slice(0, 3)
    .map((it) => ({
      label: it.label,
      reason_short: it.why_flagged,
    }));

  const negotiationBase = Math.round(((exposure_low + exposure_high) / 2) * 0.7);
  const negotiation_suggested = clamp(
    negotiationBase + (mot?.hasRecentFailures ? 100 : 0) + (mot?.corrosionFlag ? 150 : 0),
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

  // ---- Preview bucket aggregation ----

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
      risk_level,
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
      tip: "Set £X as asking price minus the suggested reduction.",
      script: `Based on the vehicle’s age, mileage, and available history, I’d need to budget roughly £${negotiation_suggested} for potential near-term maintenance unless there’s documented proof these items were recently done. I’m happy to proceed at £X.`,
    },
    disclaimer: {
      text:
        "AutoAudit provides cost guidance based on typical UK maintenance intervals, available history signals, and independent garage pricing. It is not a mechanical inspection and does not diagnose faults or guarantee required repairs.",
    },
  };

  const preview = {
    summary: {
      risk_level,
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