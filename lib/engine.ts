import { getBrandTier, BRAND_TIER_MULTIPLIER } from "@/lib/brandTier";

export type Fuel = "petrol" | "diesel" | "hybrid" | "ev";
export type Transmission = "manual" | "automatic" | "cvt" | "dct";
export type TimingType = "belt" | "chain" | "unknown";

export type EngineInput = {
  year: number;
  mileage: number;
  fuel: Fuel;
  transmission: Transmission;
  timing_type: TimingType;
  asking_price?: number | null;
  make?: string | null; // ✅ Step 4: allows brand multiplier
};

export type PreviewPayload = {
  summary: {
    risk_level: "low" | "medium" | "high";
    exposure_low: number;
    exposure_high: number;
    primary_drivers: Array<{
      label: string;
      reason_short: string;
    }>;
    negotiation_suggested: number;
  };
};

export type FullItem = {
  label: string;
  status:
    | "ok"
    | "likely_overdue"
    | "likely_due_or_unverified"
    | "due_soon_or_verify"
    | "risk_due_to_age_mileage"
    | "risk_due_soon";
  item_id: string;
  category: "engine" | "brakes" | "service" | "cooling" | "suspension" | "electrical";
  base_low: number;
  base_high: number;
  multiplier: number; // item-level multiplier (uncertainty/partial)
  cost_low: number;
  cost_high: number;
  why_flagged: string;
  why_it_matters: string;
  questions_to_ask: string[];
  red_flags: string[];
};

export type FullPayload = {
  items: FullItem[];
  summary: PreviewPayload["summary"];
  disclaimer: { text: string };
  negotiation: {
    tip: string;
    script: string;
    suggested_reduction: number;
  };
};

// ---- helpers ----

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function nowYear() {
  return new Date().getFullYear();
}

function round10(n: number) {
  return Math.round(n / 10) * 10;
}

function cleanMake(m?: string | null) {
  if (!m) return null;
  return String(m).trim();
}

function computeRiskLevel(exposureHigh: number): "low" | "medium" | "high" {
  if (exposureHigh >= 1800) return "high";
  if (exposureHigh >= 900) return "medium";
  return "low";
}

/**
 * Brand multiplier applies to *all costs*.
 * Tier system is in lib/brandTier.ts
 */
function getBrandMultiplier(make?: string | null) {
  const tier = getBrandTier(make);
  return {
    tier,
    multiplier: BRAND_TIER_MULTIPLIER[tier],
  };
}

type CandidateItem = {
  item_id: string;
  label: string;
  category: FullItem["category"];
  base_low: number;
  base_high: number;
  // item-level multiplier (e.g. a "risk" item may be weighted at 0.5)
  multiplier: number;
  status: FullItem["status"];
  why_flagged: string;
  why_it_matters: string;
  questions_to_ask: string[];
  red_flags: string[];
  // a number used to select top 3 drivers
  driverWeight: number;
};

function costWithMultipliers(baseLow: number, baseHigh: number, itemMult: number, brandMult: number) {
  const low = Math.round(baseLow * itemMult * brandMult);
  const high = Math.round(baseHigh * itemMult * brandMult);
  return { low, high };
}

// ---- main engine ----

export function generateReport(input: EngineInput): { preview: PreviewPayload; full: FullPayload } {
  const age = clamp(nowYear() - input.year, 0, 50);
  const miles = clamp(input.mileage, 0, 500_000);

  const make = cleanMake(input.make);
  const { tier: brandTier, multiplier: brandMultiplier } = getBrandMultiplier(make);

  // Candidate items based on broad heuristics (safe MVP assumptions)
  const items: CandidateItem[] = [];

  // 1) Timing belt risk (only if belt OR unknown)
  if (input.timing_type !== "chain") {
    const dueByAge = age >= 5;
    const dueByMiles = miles >= 60_000;

    if (dueByAge || dueByMiles) {
      items.push({
        item_id: "timing_belt",
        label: "Timing belt / cam belt replacement",
        category: "engine",
        base_low: 450,
        base_high: 900,
        multiplier: 1.0,
        status: "likely_due_or_unverified",
        why_flagged: "Timing type is belt/unknown AND vehicle is 5+ years old or 60k+ miles.",
        why_it_matters:
          "Many belt-driven engines require replacement on time/mileage intervals. Belt failure can cause severe internal engine damage and significantly higher costs than preventive replacement.",
        questions_to_ask: [
          "When was the belt last replaced (date + mileage)?",
          "Do you have an invoice showing the work?",
          "Was the water pump/tensioner kit replaced at the same time?",
        ],
        red_flags: [
          "Seller unsure or no documentation",
          "Claims it's fine without proof",
        ],
        driverWeight: 10,
      });
    }
  }

  // 2) Brake fluid (age-driven, cheap but common)
  if (age >= 5) {
    items.push({
      item_id: "brake_fluid",
      label: "Brake fluid change",
      category: "brakes",
      base_low: 60,
      base_high: 120,
      multiplier: 1.0,
      status: "likely_overdue",
      why_flagged: "Vehicle is 5+ years old (often due every ~2 years).",
      why_it_matters:
        "Brake fluid absorbs moisture over time which can reduce performance and increase corrosion risk. Often neglected but inexpensive to fix.",
      questions_to_ask: [
        "When was brake fluid last changed (date)?",
        "Any invoice or service record entry?",
      ],
      red_flags: ["No record of brake fluid service"],
      driverWeight: 4,
    });
  }

  // 3) Spark plugs (petrol/hybrid) - mileage-driven
  if ((input.fuel === "petrol" || input.fuel === "hybrid") && miles >= 60_000) {
    items.push({
      item_id: "spark_plugs",
      label: "Spark plug replacement (verification)",
      category: "service",
      base_low: 120,
      base_high: 280,
      multiplier: 0.7,
      status: "due_soon_or_verify",
      why_flagged: "Petrol/Hybrid + 60k+ miles (spark plugs often due by this point).",
      why_it_matters:
        "Worn plugs can cause misfires, poor fuel economy and stress ignition components. It’s usually inexpensive compared to downstream issues.",
      questions_to_ask: [
        "When were spark plugs last replaced?",
        "Any invoice or service record entry?",
      ],
      red_flags: ["Misfire/rough idle reported", "No service evidence"],
      driverWeight: 3,
    });
  }

  // 4) Oil service gap risk (generic)
  if (miles >= 50_000) {
    items.push({
      item_id: "oil_service",
      label: "Oil & filter service (verification)",
      category: "service",
      base_low: 120,
      base_high: 220,
      multiplier: 0.7,
      status: "due_soon_or_verify",
      why_flagged: "50k+ miles — service history should show regular oil changes.",
      why_it_matters:
        "Poor oil change history increases wear risk and can shorten engine/turbo life. Verify service intervals and evidence.",
      questions_to_ask: [
        "When was the last oil change (date + mileage)?",
        "Do you have invoices/service book stamps?",
      ],
      red_flags: ["Long gaps in service history", "No proof of oil changes"],
      driverWeight: 3,
    });
  }

  // 5) Brakes wear verification (mileage)
  if (miles >= 70_000) {
    items.push({
      item_id: "brakes",
      label: "Brake discs & pads (verification)",
      category: "brakes",
      base_low: 300,
      base_high: 600,
      multiplier: 0.5, // risk/verification weighting
      status: "due_soon_or_verify",
      why_flagged: "Mileage 70k+ (wear items likely changed or nearing replacement).",
      why_it_matters: "Brakes are wear items; if replacement is imminent it is negotiable.",
      questions_to_ask: [
        "When were pads/discs last replaced (front/rear)?",
        "Any pulsing under braking or pulling to one side?",
      ],
      red_flags: ["Squealing/pulsing", "No evidence of brake work at higher mileage"],
      driverWeight: 6,
    });
  }

  // 6) Suspension wear (higher mileage)
  if (miles >= 80_000) {
    items.push({
      item_id: "suspension",
      label: "Suspension wear (risk)",
      category: "suspension",
      base_low: 300,
      base_high: 900,
      multiplier: 0.5,
      status: "risk_due_soon",
      why_flagged: "Mileage 80k+ (wear risk increases).",
      why_it_matters: "Suspension wear is common at higher mileage; verify with inspection/advisories.",
      questions_to_ask: ["Any MOT advisories for suspension?"],
      red_flags: ["Knocking noises", "Uneven tyre wear", "Recurring MOT advisories"],
      driverWeight: 7,
    });
  }

  // 7) Diesel DPF risk
  if (input.fuel === "diesel" && miles >= 70_000) {
    items.push({
      item_id: "dpf",
      label: "DPF cleaning (risk)",
      category: "engine",
      base_low: 150,
      base_high: 400,
      multiplier: 0.5,
      status: "risk_due_to_age_mileage",
      why_flagged: "Diesel + 70k+ miles (DPF/EGR risk increases).",
      why_it_matters:
        "Short-trip diesel use can increase DPF clogging risk. A preventive clean can be cheaper than major DPF issues.",
      questions_to_ask: [
        "Mostly short trips or motorway driving?",
        "Any DPF warning lights or forced regenerations?",
      ],
      red_flags: ["DPF warning lights", "Mostly short trips", "History of forced regenerations"],
      driverWeight: 5,
    });
  }

  // If nothing triggered, add a minimal “verification” item so snapshot isn’t empty
  if (items.length === 0) {
    items.push({
      item_id: "service_history",
      label: "Service history verification",
      category: "service",
      base_low: 0,
      base_high: 0,
      multiplier: 1.0,
      status: "ok",
      why_flagged: "No major interval items triggered based on age/mileage inputs.",
      why_it_matters:
        "Even when no items are flagged, verifying service history reduces risk and improves negotiation confidence.",
      questions_to_ask: [
        "Do you have a complete service history (invoices, stamps, receipts)?",
        "Any major work in the last 12 months?",
      ],
      red_flags: ["No service history"],
      driverWeight: 1,
    });
  }

  // Convert CandidateItem -> FullItem and compute exposure
  const fullItems: FullItem[] = items.map((it) => {
    const { low, high } = costWithMultipliers(it.base_low, it.base_high, it.multiplier, brandMultiplier);
    return {
      label: it.label,
      status: it.status,
      item_id: it.item_id,
      category: it.category,
      base_low: it.base_low,
      base_high: it.base_high,
      multiplier: it.multiplier,
      cost_low: low,
      cost_high: high,
      why_flagged: it.why_flagged,
      why_it_matters: it.why_it_matters,
      questions_to_ask: it.questions_to_ask,
      red_flags: it.red_flags,
    };
  });

  const exposureLowRaw = fullItems.reduce((sum, it) => sum + (it.cost_low || 0), 0);
  const exposureHighRaw = fullItems.reduce((sum, it) => sum + (it.cost_high || 0), 0);

  const exposure_low = round10(exposureLowRaw);
  const exposure_high = round10(exposureHighRaw);

  const risk_level = computeRiskLevel(exposure_high);

  // Primary drivers = top 3 by weight, but use your preview structure
  const primary_drivers = items
    .slice()
    .sort((a, b) => b.driverWeight - a.driverWeight)
    .slice(0, 3)
    .map((d) => ({
      label: d.label,
      reason_short: d.why_flagged,
    }));

  // Suggested negotiation: use ~60% of high exposure, capped sensibly
  // (You can tune this later)
  const negotiation_suggested = round10(
    clamp(Math.round(exposure_high * 0.6), 150, 10_000)
  );

  const summary: PreviewPayload["summary"] = {
    risk_level,
    exposure_low,
    exposure_high,
    primary_drivers,
    negotiation_suggested,
  };

  const preview: PreviewPayload = { summary };

  const full: FullPayload = {
    items: fullItems,
    summary,
    disclaimer: {
      text:
        "AutoAudit provides cost guidance based on typical UK maintenance intervals and independent garage pricing. It is not a mechanical inspection and does not diagnose faults or guarantee required repairs.",
    },
    negotiation: {
      tip: "Set £X as asking price minus the suggested reduction.",
      script:
        `Based on the vehicle’s age and mileage, I’d need to budget roughly ${money(
          negotiation_suggested
        )} for potential near-term maintenance unless there’s documented proof these items were recently done. I’m happy to proceed at £X.`,
      suggested_reduction: negotiation_suggested,
    },
  };

  // Optional: include calibration info for debugging/tuning (kept out of your UI unless you render it)
  // If you want, we can store these too.
  // (Not required for the app to work.)
  (full as any).calibration = {
    make: make ?? null,
    brand_tier: brandTier,
    brand_multiplier: brandMultiplier,
  };

  return { preview, full };
}