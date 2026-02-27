export type Fuel = "petrol" | "diesel" | "hybrid" | "ev";
export type Transmission = "manual" | "automatic" | "cvt" | "dct";
export type TimingType = "belt" | "chain" | "unknown";

export type PreviewPayload = {
  summary: {
    risk_level: "low" | "moderate" | "high" | "very_high";
    exposure_low: number;
    exposure_high: number;
    negotiation_suggested: number;
    primary_drivers: Array<{ label: string; reason_short: string }>;
  };
};

export type FullPayload = PreviewPayload & {
  items: Array<{
    item_id: string;
    label: string;
    category: string;
    status: string;
    cost_low: number;
    cost_high: number;
    why_flagged: string;
    why_it_matters: string;
    questions_to_ask: string[];
    red_flags?: string[];
  }>;
  negotiation: {
    suggested_reduction: number;
    script: string;
    tip: string;
  };
  disclaimer: { text: string };
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function roundTo(n: number, step: number) {
  return Math.round(n / step) * step;
}

type Inputs = {
  year: number;
  mileage: number;
  fuel: Fuel;
  transmission: Transmission;
  timing_type: TimingType;
  asking_price?: number | null;
};

// Very simple v1 heuristics. These are intentionally conservative & transparent.
// You can refine later.
export function generateReport(inputs: Inputs): { preview: PreviewPayload; full: FullPayload } {
  const nowYear = new Date().getFullYear();
  const age = clamp(nowYear - inputs.year, 0, 50);
  const miles = inputs.mileage;

  const items: FullPayload["items"] = [];

  // Helper to add items with multiplier depending on due-ness.
  const addItem = (it: Omit<FullPayload["items"][number], "cost_low" | "cost_high"> & {
    base_low: number; base_high: number; multiplier: number;
  }) => {
    items.push({
      ...it,
      cost_low: Math.round(it.base_low * it.multiplier),
      cost_high: Math.round(it.base_high * it.multiplier),
    });
  };

  // TIMING BELT (critical)
  const timingUnknownOrBelt = inputs.timing_type === "unknown" || inputs.timing_type === "belt";
  if (timingUnknownOrBelt) {
    if (age >= 5 || miles >= 60000) {
      addItem({
        item_id: "timing_belt",
        label: "Timing belt / cam belt replacement",
        category: "engine",
        status: "likely_due_or_unverified",
        base_low: 450, base_high: 900,
        multiplier: 1.0,
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
      });
    } else if (age >= 4 || miles >= 50000) {
      addItem({
        item_id: "timing_belt",
        label: "Timing belt / cam belt (verification recommended)",
        category: "engine",
        status: "due_soon_or_verify",
        base_low: 450, base_high: 900,
        multiplier: 0.5,
        why_flagged: "Timing type is belt/unknown AND vehicle is nearing common interval thresholds.",
        why_it_matters:
          "If there is no documented replacement, budgeting for preventive replacement can reduce risk of costly failure.",
        questions_to_ask: [
          "Is this engine belt or chain?",
          "If belt: when was it last replaced (invoice)?",
        ],
      });
    }
  }

  // AUTO/CVT/DCT GEARBOX SERVICE (critical-ish)
  const isAuto = inputs.transmission !== "manual";
  if (isAuto) {
    if (miles >= 60000) {
      addItem({
        item_id: "gearbox_service",
        label: "Automatic gearbox service (fluid)",
        category: "transmission",
        status: "likely_due",
        base_low: 250, base_high: 450,
        multiplier: 1.0,
        why_flagged: "Automatic/CVT/DCT + 60k+ miles.",
        why_it_matters:
          "Many automatics benefit from fluid servicing to reduce wear. Servicing is far cheaper than gearbox repairs.",
        questions_to_ask: [
          "Has gearbox fluid ever been changed? If yes, when and where?",
          "Any invoices for gearbox servicing?",
          "Any judder, delayed engagement, harsh shifting?",
        ],
        red_flags: [
          "'Sealed for life' used as justification for no history",
          "Harsh shifts or hesitation on test drive",
        ],
      });
    } else if (miles >= 50000) {
      addItem({
        item_id: "gearbox_service",
        label: "Automatic gearbox service (due soon)",
        category: "transmission",
        status: "due_soon",
        base_low: 250, base_high: 450,
        multiplier: 0.5,
        why_flagged: "Automatic/CVT/DCT + approaching 60k miles.",
        why_it_matters:
          "Regular servicing can reduce wear and improve shift quality.",
        questions_to_ask: [
          "Any record of gearbox servicing?",
        ],
      });
    }
  }

  // BRAKE FLUID (minor but common)
  if (age >= 5) {
    addItem({
      item_id: "brake_fluid",
      label: "Brake fluid change",
      category: "brakes",
      status: "likely_overdue",
      base_low: 60, base_high: 120,
      multiplier: 1.0,
      why_flagged: "Vehicle is 5+ years old (often due every ~2 years).",
      why_it_matters:
        "Brake fluid absorbs moisture over time which can reduce performance and increase corrosion risk. Often neglected but inexpensive to fix.",
      questions_to_ask: [
        "When was brake fluid last changed (date)?",
        "Any invoice or service record entry?",
      ],
    });
  } else if (age >= 3) {
    addItem({
      item_id: "brake_fluid",
      label: "Brake fluid change (due soon)",
      category: "brakes",
      status: "due_soon",
      base_low: 60, base_high: 120,
      multiplier: 0.5,
      why_flagged: "Vehicle is 3+ years old.",
      why_it_matters:
        "Brake fluid is a time-based service item. Proof reduces uncertainty.",
      questions_to_ask: [
        "When was brake fluid last changed (date)?",
      ],
    });
  }

  // SPARK PLUGS / DPF (major-ish)
  if (inputs.fuel === "petrol" || inputs.fuel === "hybrid") {
    if (miles >= 60000) {
      addItem({
        item_id: "spark_plugs",
        label: "Spark plugs",
        category: "engine",
        status: "likely_due",
        base_low: 120, base_high: 300,
        multiplier: 1.0,
        why_flagged: "Petrol/Hybrid + 60k+ miles.",
        why_it_matters:
          "Worn plugs can cause misfires and poor fuel economy. Replacement is routine and negotiable if due.",
        questions_to_ask: [
          "When were spark plugs last replaced (date + mileage)?",
          "Invoice or service record entry?",
        ],
      });
    } else if (miles >= 40000) {
      addItem({
        item_id: "spark_plugs",
        label: "Spark plugs (due soon)",
        category: "engine",
        status: "due_soon",
        base_low: 120, base_high: 300,
        multiplier: 0.5,
        why_flagged: "Petrol/Hybrid + 40k+ miles.",
        why_it_matters:
          "Approaching common replacement intervals; proof helps.",
        questions_to_ask: [
          "Any record of spark plug replacement?",
        ],
      });
    }
  }

  if (inputs.fuel === "diesel") {
    if (miles >= 70000) {
      addItem({
        item_id: "dpf",
        label: "DPF cleaning (risk)",
        category: "engine",
        status: "risk_due_to_age_mileage",
        base_low: 150, base_high: 400,
        multiplier: 0.5,
        why_flagged: "Diesel + 70k+ miles (DPF/EGR risk increases).",
        why_it_matters:
          "Short-trip diesel use can increase DPF clogging risk. A preventive clean can be cheaper than major DPF issues.",
        questions_to_ask: [
          "Mostly short trips or motorway driving?",
          "Any DPF warning lights or forced regenerations?",
        ],
      });
    }
  }

  // BRAKES (major wear)
  if (miles >= 70000) {
    addItem({
      item_id: "brakes",
      label: "Brake discs & pads (verification)",
      category: "brakes",
      status: "due_soon_or_verify",
      base_low: 300, base_high: 600,
      multiplier: 0.5,
      why_flagged: "Mileage 70k+ (wear items likely changed or nearing replacement).",
      why_it_matters:
        "Brakes are wear items; if replacement is imminent it is negotiable.",
      questions_to_ask: [
        "When were pads/discs last replaced (front/rear)?",
        "Any pulsing under braking or pulling to one side?",
      ],
    });
  } else if (miles >= 50000) {
    addItem({
      item_id: "brakes",
      label: "Brake discs & pads (verification)",
      category: "brakes",
      status: "verify",
      base_low: 300, base_high: 600,
      multiplier: 0.25,
      why_flagged: "Mileage 50k+ (check history/condition).",
      why_it_matters:
        "If brakes are worn, replacement cost can be used in negotiation.",
      questions_to_ask: [
        "Any invoice for brakes?",
      ],
    });
  }

  // Suspension (wear)
  if (miles >= 100000) {
    addItem({
      item_id: "suspension",
      label: "Suspension wear (arms/bushes/shocks)",
      category: "suspension",
      status: "likely_due_or_verify",
      base_low: 300, base_high: 900,
      multiplier: 1.0,
      why_flagged: "Mileage 100k+ (wear risk increases).",
      why_it_matters:
        "Worn suspension can cause uneven tyre wear and poor handling. Costs vary; check MOT advisories and test drive knocks.",
      questions_to_ask: [
        "Any knocks over bumps?",
        "Any recent suspension work or MOT advisories?",
      ],
    });
  } else if (miles >= 80000) {
    addItem({
      item_id: "suspension",
      label: "Suspension wear (risk)",
      category: "suspension",
      status: "risk_due_soon",
      base_low: 300, base_high: 900,
      multiplier: 0.5,
      why_flagged: "Mileage 80k+ (wear risk increases).",
      why_it_matters:
        "Suspension wear is common at higher mileage; verify with inspection/advisories.",
      questions_to_ask: [
        "Any MOT advisories for suspension?",
      ],
    });
  }

  // Compute exposure totals
  const exposure_low = items.reduce((sum, it) => sum + it.cost_low, 0);
  const exposure_high = items.reduce((sum, it) => sum + it.cost_high, 0);

  // Risk score (simple)
  let score = 0;
  for (const it of items) {
    if (it.item_id === "timing_belt" && it.status.includes("due")) score += 4;
    else if (it.item_id === "gearbox_service" && it.status.includes("due")) score += 4;
    else if (it.item_id === "suspension") score += 2;
    else if (it.item_id === "brakes") score += 2;
    else score += 1;
  }

  let risk_level: PreviewPayload["summary"]["risk_level"] = "low";
  if (score >= 16) risk_level = "very_high";
  else if (score >= 10) risk_level = "high";
  else if (score >= 5) risk_level = "moderate";

  const drivers = items
    .slice()
    .sort((a, b) => (b.cost_high - a.cost_low) - (a.cost_high - a.cost_low))
    .slice(0, 3)
    .map((it) => ({ label: it.label, reason_short: it.why_flagged }));

  // Negotiation suggestion (conservative midpoint * 0.8, rounded)
  const midpoint = (exposure_low + exposure_high) / 2;
  const negotiation_suggested = roundTo(Math.round(midpoint * 0.8), 50);

  const preview: PreviewPayload = {
    summary: {
      risk_level,
      exposure_low,
      exposure_high,
      negotiation_suggested,
      primary_drivers: drivers,
    },
  };

  const full: FullPayload = {
    ...preview,
    items,
    negotiation: {
      suggested_reduction: negotiation_suggested,
      script:
        `Based on the vehicle’s age and mileage, I’d need to budget roughly £${negotiation_suggested} for potential near-term maintenance unless there’s documented proof these items were recently done. I’m happy to proceed at £X.`,
      tip: "Set £X as asking price minus the suggested reduction.",
    },
    disclaimer: {
      text:
        "AutoAudit provides cost guidance based on typical UK maintenance intervals and independent garage pricing. It is not a mechanical inspection and does not diagnose faults or guarantee required repairs.",
    },
  };

  return { preview, full };
}
