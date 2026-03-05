// lib/engine.ts

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
  mot_present?: boolean; // optional (if you later store mot_payload)
};

type ReportItem = {
  label: string;
  status: string;
  item_id: string;
  category: string; // e.g. engine, brakes, suspension, etc.
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
 * You can expand this later into tier tables.
 */
function brandMultiplier(make?: string | null): number {
  const m = normMake(make);
  if (!m) return 1.0;

  // budget-ish
  const budget = new Set(["dacia", "skoda", "seat", "kia", "hyundai", "suzuki"]);
  if (budget.has(m)) return 0.9;

  // mainstream
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

  // premium
  const premium = new Set(["bmw", "audi", "mercedes", "mercedes-benz", "lexus", "volvo", "jaguar"]);
  if (premium.has(m)) return 1.25;

  // high-end / performance
  const high = new Set(["porsche", "land rover", "range rover", "maserati", "ferrari", "lamborghini", "bentley", "aston martin"]);
  if (high.has(m)) return 1.6;

  return 1.1; // unknown -> slight uplift
}

/**
 * Macro bucket mapping:
 * we keep fine-grained categories in items, but preview aggregates into macro headings.
 */
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
  if (["service", "fluids", "filters"].includes(c)) {
    return { key: "routine_service", label: "Routine Service" };
  }

  return { key: "other", label: "Other Checks" };
}

/**
 * Confidence scoring:
 * - It’s about how “certain” we are the estimate is relevant.
 * - Influenced by data completeness and key unknowns.
 */
function confidenceScore(input: EngineInput, items: ReportItem[]) {
  let score = 75; // baseline
  const reasons: string[] = [];

  // Required fields already validated upstream (year/mileage), but still:
  if (!Number.isFinite(input.year)) {
    score -= 35;
    reasons.push("Missing/invalid year reduces confidence.");
  }
  if (!Number.isFinite(input.mileage)) {
    score -= 35;
    reasons.push("Missing/invalid mileage reduces confidence.");
  }

  // Unknown timing type is a big one (belt vs chain)
  if ((input.timing_type ?? "unknown") === "unknown") {
    score -= 12;
    reasons.push("Timing type unknown (belt vs chain) affects major interval estimates.");
  }

  // Make helps calibrate costs
  if (!input.make) {
    score -= 10;
    reasons.push("Make not provided — cost calibration may be less precise.");
  } else {
    reasons.push("Make provided — cost calibration improved.");
  }

  // Transmission clarity helps (auto/clutch risks)
  if (!input.transmission || String(input.transmission).toLowerCase().includes("select")) {
    score -= 8;
    reasons.push("Transmission not confirmed — drivetrain wear assumptions may be weaker.");
  } else {
    reasons.push("Transmission confirmed.");
  }

  // Fuel clarity helps (diesel DPF/EGR)
  if (!input.fuel) {
    score -= 6;
    reasons.push("Fuel type missing — emissions system risk assumptions may be weaker.");
  } else {
    reasons.push("Fuel type confirmed.");
  }

  // If MoT present (later), boost slightly
  if (input.mot_present) {
    score += 6;
    reasons.push("MoT history present — advisory patterns improve confidence.");
  } else {
    reasons.push("MoT history not yet included — confidence could improve with advisories.");
  }

  // If we found only 1 item, lower confidence a bit (less signal)
  if (items.length <= 1) {
    score -= 6;
    reasons.push("Few detected items — estimate has less signal.");
  }

  score = clamp(score, 30, 95);

  const label = score >= 80 ? "High" : score >= 60 ? "Medium" : "Low";

  return { score, label, reasons };
}

/**
 * Core engine:
 * Build full item list, compute exposure, drivers, negotiation, preview buckets, confidence.
 */
export function generateReport(input: EngineInput) {
  const nowYear = new Date().getFullYear();
  const age = nowYear - input.year;
  const mileage = input.mileage;

  const timingType: TimingType = input.timing_type ?? "unknown";
  const makeMult = brandMultiplier(input.make);

  const items: ReportItem[] = [];

  // ---- Item rules (keep what you already had; this is a sane baseline) ----

  // Timing belt (or unknown) risk (belt intervals often 5-8 yrs / 60-100k)
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

  // Brake fluid (often every ~2 years)
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
      questions_to_ask: ["When was brake fluid last changed (date)?", "Any invoice or service record entry?"],
    });
  }

  // Diesel DPF / EGR risk (simplified)
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
      questions_to_ask: ["Mostly short trips or motorway driving?", "Any DPF warning lights or forced regenerations?"],
    });
  }

  // Brakes wear (verification)
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
      questions_to_ask: ["When were pads/discs last replaced (front/rear)?", "Any pulsing under braking or pulling to one side?"],
    });
  }

  // Suspension risk
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

  // ---- Totals / summary ----

  const exposure_low = Math.round(items.reduce((sum, it) => sum + (it.cost_low ?? 0), 0));
  const exposure_high = Math.round(items.reduce((sum, it) => sum + (it.cost_high ?? 0), 0));

  const risk_level =
    exposure_high >= 1500 ? "high" : exposure_high >= 700 ? "medium" : "low";

  // primary drivers: top 3 by high cost
  const primary_drivers = [...items]
    .sort((a, b) => (b.cost_high ?? 0) - (a.cost_high ?? 0))
    .slice(0, 3)
    .map((it) => ({
      label: it.label,
      reason_short: it.why_flagged,
    }));

  const negotiation_suggested = Math.round((exposure_low + exposure_high) / 2 * 0.7);

  const confidence = confidenceScore(input, items);

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

  const buckets = [...bucketMap.values()].sort((a, b) => b.exposure_high - a.exposure_high);

  // teaser labels (we’ll blur these in the snapshot)
  const teaser_labels = items
    .slice(0, 5)
    .map((it) => it.label);

  // ---- Build payloads ----

  const full = {
    items,
    summary: {
      risk_level,
      exposure_low,
      exposure_high,
      primary_drivers,
      negotiation_suggested,
      confidence,
    },
    negotiation: {
      suggested_reduction: negotiation_suggested,
      tip: "Set £X as asking price minus the suggested reduction.",
      script: `Based on the vehicle’s age and mileage, I’d need to budget roughly £${negotiation_suggested} for potential near-term maintenance unless there’s documented proof these items were recently done. I’m happy to proceed at £X.`,
    },
    disclaimer: {
      text:
        "AutoAudit provides cost guidance based on typical UK maintenance intervals and independent garage pricing. It is not a mechanical inspection and does not diagnose faults or guarantee required repairs.",
    },
  };

  // Preview intentionally excludes details (no why_it_matters / questions)
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