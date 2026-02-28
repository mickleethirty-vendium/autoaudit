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
  make?: string | null;
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

export type FullPayload = {
  items: any[];
  summary: PreviewPayload["summary"];
  disclaimer: { text: string };
  negotiation: {
    tip: string;
    script: string;
    suggested_reduction: number;
  };
};

// ---------------------
// Helpers
// ---------------------

function money(amount: number) {
  return `£${amount.toLocaleString()}`;
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function round10(n: number) {
  return Math.round(n / 10) * 10;
}

function nowYear() {
  return new Date().getFullYear();
}

function computeRiskLevel(exposureHigh: number): "low" | "medium" | "high" {
  if (exposureHigh >= 1800) return "high";
  if (exposureHigh >= 900) return "medium";
  return "low";
}

// ---------------------
// Engine
// ---------------------

export function generateReport(input: EngineInput): {
  preview: PreviewPayload;
  full: FullPayload;
} {
  const age = clamp(nowYear() - input.year, 0, 50);
  const miles = clamp(input.mileage, 0, 500_000);

  const brandTier = getBrandTier(input.make);
  const brandMultiplier = BRAND_TIER_MULTIPLIER[brandTier];

  const items: any[] = [];

  function addItem(item: any) {
    const low = Math.round(item.base_low * item.multiplier * brandMultiplier);
    const high = Math.round(item.base_high * item.multiplier * brandMultiplier);

    items.push({
      ...item,
      cost_low: low,
      cost_high: high,
    });
  }

  // ---------------------
  // Timing belt
  // ---------------------
  if (input.timing_type !== "chain" && (age >= 5 || miles >= 60000)) {
    addItem({
      label: "Timing belt / cam belt replacement",
      item_id: "timing_belt",
      category: "engine",
      base_low: 450,
      base_high: 900,
      multiplier: 1,
      status: "likely_due_or_unverified",
      why_flagged:
        "Timing type is belt/unknown AND vehicle is 5+ years old or 60k+ miles.",
      why_it_matters:
        "Many belt-driven engines require replacement on time/mileage intervals. Belt failure can cause severe internal engine damage.",
      questions_to_ask: [
        "When was the belt last replaced (date + mileage)?",
        "Do you have an invoice showing the work?",
      ],
      red_flags: ["No documentation", "Seller unsure"],
      driverWeight: 10,
    });
  }

  // ---------------------
  // Brake fluid
  // ---------------------
  if (age >= 5) {
    addItem({
      label: "Brake fluid change",
      item_id: "brake_fluid",
      category: "brakes",
      base_low: 60,
      base_high: 120,
      multiplier: 1,
      status: "likely_overdue",
      why_flagged: "Vehicle is 5+ years old.",
      why_it_matters:
        "Brake fluid absorbs moisture and should be replaced regularly.",
      questions_to_ask: ["When was brake fluid last changed?"],
      red_flags: ["No service evidence"],
      driverWeight: 3,
    });
  }

  // ---------------------
  // Brakes wear
  // ---------------------
  if (miles >= 70000) {
    addItem({
      label: "Brake discs & pads (verification)",
      item_id: "brakes",
      category: "brakes",
      base_low: 300,
      base_high: 600,
      multiplier: 0.5,
      status: "due_soon_or_verify",
      why_flagged: "Mileage 70k+ (wear items likely nearing replacement).",
      why_it_matters:
        "Brake components are consumables and negotiable if replacement is near.",
      questions_to_ask: ["When were discs/pads last replaced?"],
      red_flags: ["Pulsing under braking"],
      driverWeight: 6,
    });
  }

  // ---------------------
  // Suspension
  // ---------------------
  if (miles >= 80000) {
    addItem({
      label: "Suspension wear (risk)",
      item_id: "suspension",
      category: "suspension",
      base_low: 300,
      base_high: 900,
      multiplier: 0.5,
      status: "risk_due_soon",
      why_flagged: "Mileage 80k+ (wear risk increases).",
      why_it_matters:
        "Suspension wear is common at higher mileage and may show in MOT advisories.",
      questions_to_ask: ["Any suspension advisories on MOT?"],
      red_flags: ["Knocking noises"],
      driverWeight: 7,
    });
  }

  // ---------------------
  // Diesel DPF
  // ---------------------
  if (input.fuel === "diesel" && miles >= 70000) {
    addItem({
      label: "DPF cleaning (risk)",
      item_id: "dpf",
      category: "engine",
      base_low: 150,
      base_high: 400,
      multiplier: 0.5,
      status: "risk_due_to_age_mileage",
      why_flagged: "Diesel + 70k+ miles.",
      why_it_matters:
        "DPF clogging risk increases with mileage and short journeys.",
      questions_to_ask: ["Mostly short trips or motorway driving?"],
      red_flags: ["DPF warning lights"],
      driverWeight: 5,
    });
  }

  if (items.length === 0) {
    addItem({
      label: "Service history verification",
      item_id: "service_history",
      category: "service",
      base_low: 0,
      base_high: 0,
      multiplier: 1,
      status: "ok",
      why_flagged: "No major interval items triggered.",
      why_it_matters:
        "Even if no items are flagged, verifying service history reduces risk.",
      questions_to_ask: ["Is there full service history?"],
      red_flags: [],
      driverWeight: 1,
    });
  }

  const exposure_low = round10(
    items.reduce((sum, i) => sum + i.cost_low, 0)
  );
  const exposure_high = round10(
    items.reduce((sum, i) => sum + i.cost_high, 0)
  );

  const risk_level = computeRiskLevel(exposure_high);

  const primary_drivers = [...items]
    .sort((a, b) => b.driverWeight - a.driverWeight)
    .slice(0, 3)
    .map((d) => ({
      label: d.label,
      reason_short: d.why_flagged,
    }));

  const negotiation_suggested = round10(
    clamp(Math.round(exposure_high * 0.6), 150, 10000)
  );

  const summary = {
    risk_level,
    exposure_low,
    exposure_high,
    primary_drivers,
    negotiation_suggested,
  };

  return {
    preview: { summary },
    full: {
      items,
      summary,
      disclaimer: {
        text:
          "AutoAudit provides cost guidance based on typical UK maintenance intervals and independent garage pricing. It is not a mechanical inspection.",
      },
      negotiation: {
        tip: "Set £X as asking price minus the suggested reduction.",
        script: `Based on the vehicle’s age and mileage, I’d need to budget roughly ${money(
          negotiation_suggested
        )} for potential near-term maintenance unless there’s documented proof these items were recently done. I’m happy to proceed at £X.`,
        suggested_reduction: negotiation_suggested,
      },
    },
  };
}