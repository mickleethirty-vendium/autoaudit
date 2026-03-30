"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ExposureBar from "@/app/components/ExposureBar";

type RiskItem = {
  item_id?: string;
  label?: string;
  category?: string;
  cost_low?: number;
  cost_high?: number;
  why_flagged?: string;
  why_it_matters?: string;
  questions_to_ask?: string[];
  red_flags?: string[];
};

type KnownModelIssue = RiskItem & {
  issue_code?: string;
  severity?: "low" | "medium" | "high";
  match_confidence?: "high" | "medium" | "low";
  match_basis?:
    | "exact_derivative"
    | "engine_family"
    | "model_generation"
    | "make_model_only";
  probability_score?: number;
};

type HpiCheck = {
  label: string;
  value: any;
};

type MotRepeatAdvisoryDetail = {
  text?: string;
  count?: number;
  patternType?: string;
  patternLabel?: string;
};

type VehicleIdentity = {
  registration?: string | null;
  make?: string | null;
  model?: string | null;
  derivative?: string | null;
  generation?: string | null;
  engine?: string | null;
  engine_family?: string | null;
  engine_code?: string | null;
  engine_size?: string | null;
  power?: string | null;
  power_bhp?: number | null;
  fuel?: string | null;
  transmission?: string | null;
  year?: number | null;
  mileage?: number | null;
};

type MotDefect = {
  text?: string;
  type?: string;
  dangerous?: boolean;
};

type MotTest = {
  completedDate?: string | null;
  testResult?: string | null;
  odometerValue?: string | number | null;
  odometerUnit?: string | null;
  expiryDate?: string | null;
  defects?: MotDefect[];
};

type ReportTab = "overview" | "priority" | "mot" | "history" | "all";

function money(value?: number | null) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(value);
}

function titleCase(s: string) {
  return s
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

function formatDate(value?: string | null) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function itemTone(item: RiskItem, addressed: boolean) {
  if (addressed) {
    return "border-emerald-200 bg-emerald-50/70";
  }

  const high = Number(item?.cost_high ?? 0);
  if (high >= 1000) {
    return "border-red-200 bg-red-50/60";
  }
  if (high >= 400) {
    return "border-amber-200 bg-amber-50/60";
  }
  return "border-slate-200 bg-white";
}

function getRepeatPatternLabels(fullSummary: any): string[] {
  const raw =
    fullSummary?.mot_summary?.repeat_advisory_categories ??
    fullSummary?.mot_summary?.repeat_advisory_pattern_labels ??
    [];

  if (!Array.isArray(raw)) return [];

  return raw.filter(
    (value: unknown) => typeof value === "string" && value.trim()
  );
}

function getRepeatPatternDetails(fullSummary: any): MotRepeatAdvisoryDetail[] {
  const raw =
    fullSummary?.mot_summary?.repeat_advisory_details ??
    fullSummary?.mot_summary?.repeat_advisory_detail ??
    [];

  if (!Array.isArray(raw)) return [];

  return raw.filter(
    (item: unknown) => item && typeof item === "object"
  ) as MotRepeatAdvisoryDetail[];
}

function renderHpiDisplayValue(value: any) {
  if (typeof value === "boolean") {
    return value ? "Flag found" : "No issue shown";
  }
  if (typeof value === "number") {
    return String(value);
  }
  if (typeof value === "string" && value.trim()) {
    return value;
  }
  if (Array.isArray(value)) {
    return value.length ? `${value.length} record(s)` : "None shown";
  }
  if (value && typeof value === "object") {
    if (typeof value.status === "string") return value.status;
    if (typeof value.result === "string") return value.result;
    if (typeof value.value === "string") return value.value;
    return "Available";
  }
  return "Unavailable";
}

function parseConfidenceDisplay(confidenceDisplay: string | null) {
  if (!confidenceDisplay) {
    return {
      score: null as number | null,
      label: null as string | null,
    };
  }

  const scoreMatch = confidenceDisplay.match(/(\d{1,3})\s*\/\s*100/);
  const labelMatch = confidenceDisplay.match(/^(High|Medium|Low)/i);

  return {
    score: scoreMatch ? Number(scoreMatch[1]) : null,
    label: labelMatch ? titleCase(labelMatch[1].toLowerCase()) : null,
  };
}

function confidenceLabelFromScore(score: number) {
  if (score >= 80) return "High";
  if (score >= 60) return "Medium";
  return "Low";
}

function valuePillStyles(position?: string | null) {
  if (position === "good") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  if (position === "high") {
    return "border-red-200 bg-red-50 text-red-700";
  }
  if (position === "fair") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }
  return "border-slate-300 bg-slate-50 text-slate-700";
}

function valuePillLabel(position?: string | null) {
  if (position === "good") return "Below market";
  if (position === "high") return "Above market";
  if (position === "fair") return "Fair value";
  return "Value insight pending";
}

function matchConfidencePill(confidence?: string | null) {
  if (confidence === "high") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  if (confidence === "medium") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }
  return "border-slate-200 bg-slate-50 text-slate-700";
}

function matchConfidenceLabel(confidence?: string | null) {
  if (!confidence) return "Confidence not stated";
  return `${titleCase(confidence)} confidence`;
}

function matchBasisLabel(basis?: string | null) {
  if (!basis) return "General vehicle match";
  if (basis === "exact_derivative") return "Exact derivative match";
  if (basis === "engine_family") return "Engine family match";
  if (basis === "model_generation") return "Model generation match";
  return "Make / model match";
}

function parseKnownModelIssues(fullSummary: any): KnownModelIssue[] {
  const direct = fullSummary?.known_model_issues;

  if (Array.isArray(direct)) {
    return direct as KnownModelIssue[];
  }

  if (Array.isArray(direct?.items)) {
    return direct.items as KnownModelIssue[];
  }

  return [];
}

function parseKnownModelIssueExposure(
  fullSummary: any,
  knownModelIssues: KnownModelIssue[]
) {
  const direct = fullSummary?.known_model_issues;

  if (
    direct &&
    !Array.isArray(direct) &&
    typeof direct === "object" &&
    (typeof direct.exposure_low === "number" ||
      typeof direct.exposure_high === "number")
  ) {
    return {
      low:
        typeof direct.exposure_low === "number" ? direct.exposure_low : null,
      high:
        typeof direct.exposure_high === "number" ? direct.exposure_high : null,
    };
  }

  if (!knownModelIssues.length) {
    return { low: null, high: null };
  }

  return {
    low: knownModelIssues.reduce(
      (sum, item) => sum + Number(item?.cost_low ?? 0),
      0
    ),
    high: knownModelIssues.reduce(
      (sum, item) => sum + Number(item?.cost_high ?? 0),
      0
    ),
  };
}

function firstNonEmptyString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function parseVehicleIdentityNode(value: any): VehicleIdentity | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as VehicleIdentity;
}

function buildVehicleIdentity(fullSummary: any): {
  baseIdentity: VehicleIdentity | null;
  enrichedIdentity: VehicleIdentity | null;
  displayIdentity: VehicleIdentity | null;
  matchExplainer: string | null;
  identityStatusLabel: string | null;
} {
  const baseIdentity = parseVehicleIdentityNode(fullSummary?.vehicle_identity);
  const enrichedIdentity = parseVehicleIdentityNode(
    fullSummary?.vehicle_identity_enriched
  );
  const ukvdEnrichment = parseVehicleIdentityNode(fullSummary?.ukvd?.enrichment);

  const displayIdentity =
    enrichedIdentity ?? ukvdEnrichment ?? baseIdentity ?? null;

  let matchExplainer: string | null = null;
  let identityStatusLabel: string | null = null;

  if (enrichedIdentity || ukvdEnrichment) {
    matchExplainer =
      "Model-specific matching was tightened using richer vehicle details where available, including derivative, engine data and drivetrain.";
    identityStatusLabel = "Enriched match";
  } else if (baseIdentity) {
    matchExplainer =
      "Model-specific matching used the best available make, model and vehicle details.";
    identityStatusLabel = "Base match";
  }

  return {
    baseIdentity,
    enrichedIdentity,
    displayIdentity,
    matchExplainer,
    identityStatusLabel,
  };
}

function buildIdentityRows(identity: VehicleIdentity | null) {
  if (!identity) return [];

  const powerDisplay =
    firstNonEmptyString(
      identity.power,
      typeof identity.power_bhp === "number"
        ? `${Math.round(identity.power_bhp)} bhp`
        : null
    ) ?? null;

  return [
    { label: "Model", value: firstNonEmptyString(identity.model) },
    { label: "Derivative", value: firstNonEmptyString(identity.derivative) },
    { label: "Generation", value: firstNonEmptyString(identity.generation) },
    { label: "Engine", value: firstNonEmptyString(identity.engine) },
    { label: "Engine family", value: firstNonEmptyString(identity.engine_family) },
    { label: "Engine code", value: firstNonEmptyString(identity.engine_code) },
    { label: "Engine size", value: firstNonEmptyString(identity.engine_size) },
    { label: "Power", value: powerDisplay },
    { label: "Fuel", value: firstNonEmptyString(identity.fuel) },
    {
      label: "Transmission",
      value: firstNonEmptyString(identity.transmission),
    },
    {
      label: "Model year",
      value:
        typeof identity.year === "number" && Number.isFinite(identity.year)
          ? String(identity.year)
          : null,
    },
  ].filter((row) => row.value);
}

function buildKnownIssueSummary(knownModelIssues: KnownModelIssue[]) {
  if (!knownModelIssues.length) {
    return {
      strongestBasis: null as string | null,
      strongestConfidence: null as string | null,
      exactDerivativeCount: 0,
      engineFamilyCount: 0,
      generationCount: 0,
      broadCount: 0,
    };
  }

  let exactDerivativeCount = 0;
  let engineFamilyCount = 0;
  let generationCount = 0;
  let broadCount = 0;

  const confidenceRank = { high: 3, medium: 2, low: 1 } as const;
  let strongestBasis: string | null = null;
  let strongestConfidence: string | null = null;
  let strongestBasisRank = 0;
  let strongestConfidenceRank = 0;

  for (const issue of knownModelIssues) {
    const basis = issue.match_basis ?? "make_model_only";
    const confidence = issue.match_confidence ?? null;

    const basisRank =
      basis === "exact_derivative"
        ? 4
        : basis === "engine_family"
          ? 3
          : basis === "model_generation"
            ? 2
            : 1;

    if (basis === "exact_derivative") exactDerivativeCount += 1;
    else if (basis === "engine_family") engineFamilyCount += 1;
    else if (basis === "model_generation") generationCount += 1;
    else broadCount += 1;

    if (basisRank > strongestBasisRank) {
      strongestBasisRank = basisRank;
      strongestBasis = basis;
    }

    if (confidence && confidenceRank[confidence] > strongestConfidenceRank) {
      strongestConfidenceRank = confidenceRank[confidence];
      strongestConfidence = confidence;
    }
  }

  return {
    strongestBasis,
    strongestConfidence,
    exactDerivativeCount,
    engineFamilyCount,
    generationCount,
    broadCount,
  };
}

function buildKnownIssueExplainer(
  summary: ReturnType<typeof buildKnownIssueSummary>
) {
  if (summary.exactDerivativeCount > 0) {
    return "At least one issue was matched at exact derivative level, which is the strongest match type in the current dataset.";
  }

  if (summary.engineFamilyCount > 0) {
    return "At least one issue was matched using engine-family data, which is more precise than a broad make / model match.";
  }

  if (summary.generationCount > 0) {
    return "At least one issue was matched at model-generation level, giving more context than a broad make / model pattern alone.";
  }

  if (summary.broadCount > 0) {
    return "These model-specific issues were matched at make / model level. They remain useful checks, but they are broader than derivative or engine-specific matches.";
  }

  return null;
}

function getUkvdStatus(fullSummary: any) {
  const ukvd = fullSummary?.ukvd;
  const status =
    typeof ukvd?.enrichment_status === "string"
      ? ukvd.enrichment_status
      : null;
  const error =
    typeof ukvd?.error === "string" && ukvd.error.trim()
      ? ukvd.error.trim()
      : null;

  return { status, error };
}

function parseMotTests(motPayload: any, fullSummary: any): MotTest[] {
  const candidates = [
    motPayload?.motTests,
    fullSummary?.mot_payload?.motTests,
    fullSummary?.motTests,
    fullSummary?.mot_history?.tests,
    fullSummary?.mot_history,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate.filter(
        (item): item is MotTest => !!item && typeof item === "object"
      );
    }
  }

  return [];
}

function getMotBadgeStyles(result?: string | null) {
  const value = String(result ?? "").toUpperCase();

  if (value === "PASSED" || value === "PASS") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (value === "FAILED" || value === "FAIL") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-700";
}

function getMotBadgeLabel(result?: string | null) {
  const value = String(result ?? "").toUpperCase();

  if (value === "PASSED" || value === "PASS") return "Pass";
  if (value === "FAILED" || value === "FAIL") return "Fail";
  return titleCase(String(result ?? "Unknown").toLowerCase());
}

function parseMotMileage(test: MotTest) {
  const raw = test?.odometerValue;

  if (typeof raw === "number" && Number.isFinite(raw)) {
    return `${raw.toLocaleString()} ${test?.odometerUnit ?? "miles"}`;
  }

  if (typeof raw === "string" && raw.trim()) {
    const digits = Number(raw.replace(/,/g, ""));
    if (Number.isFinite(digits)) {
      return `${digits.toLocaleString()} ${test?.odometerUnit ?? "miles"}`;
    }
    return `${raw.trim()} ${test?.odometerUnit ?? ""}`.trim();
  }

  return null;
}

function groupMotDefects(defects?: MotDefect[]) {
  const safeDefects = Array.isArray(defects) ? defects : [];

  return {
    dangerous: safeDefects.filter(
      (defect) =>
        String(defect?.type ?? "").toUpperCase() === "DANGEROUS" ||
        defect?.dangerous === true
    ),
    major: safeDefects.filter(
      (defect) => String(defect?.type ?? "").toUpperCase() === "MAJOR"
    ),
    minor: safeDefects.filter(
      (defect) => String(defect?.type ?? "").toUpperCase() === "MINOR"
    ),
    advisory: safeDefects.filter(
      (defect) => String(defect?.type ?? "").toUpperCase() === "ADVISORY"
    ),
    other: safeDefects.filter((defect) => {
      const type = String(defect?.type ?? "").toUpperCase();
      return !["DANGEROUS", "MAJOR", "MINOR", "ADVISORY"].includes(type);
    }),
  };
}

function defectTypeLabel(type: string) {
  const upper = type.toUpperCase();
  if (upper === "DANGEROUS") return "Dangerous";
  if (upper === "MAJOR") return "Major";
  if (upper === "MINOR") return "Minor";
  if (upper === "ADVISORY") return "Advisory";
  return titleCase(type.toLowerCase());
}

function defectTone(type?: string | null) {
  const upper = String(type ?? "").toUpperCase();

  if (upper === "DANGEROUS" || upper === "MAJOR") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (upper === "MINOR") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (upper === "ADVISORY") {
    return "border-slate-200 bg-white text-slate-700";
  }

  return "border-slate-200 bg-white text-slate-700";
}

function getDecisionCall(args: {
  adjustedHigh: number | null;
  adjustedLow: number | null;
  marketPosition: string | null;
  hpiUnlocked: boolean;
  hpiChecks: HpiCheck[];
  hpiStatus: string | null;
  addressedCount: number;
  baseExposureHigh: number | null;
}) {
  const {
    adjustedHigh,
    marketPosition,
    hpiUnlocked,
    hpiChecks,
    hpiStatus,
    addressedCount,
    baseExposureHigh,
  } = args;

  const hpiFlagged =
    hpiUnlocked &&
    hpiStatus === "success" &&
    hpiChecks.some((item) => {
      if (typeof item.value === "boolean") return item.value === true;
      if (typeof item.value === "number") return item.value > 0;
      if (Array.isArray(item.value)) return item.value.length > 0;
      if (typeof item.value === "string") {
        const v = item.value.toLowerCase();
        return (
          v.includes("flag") ||
          v.includes("stolen") ||
          v.includes("write") ||
          v.includes("finance") ||
          v.includes("anomaly")
        );
      }
      return false;
    });

  const reductionRatio =
    typeof adjustedHigh === "number" &&
    typeof baseExposureHigh === "number" &&
    baseExposureHigh > 0
      ? 1 - adjustedHigh / baseExposureHigh
      : 0;

  if (hpiFlagged) {
    return {
      badgeClass: "border-red-200 bg-red-50 text-red-700",
      badgeLabel: "Higher caution advised",
      body:
        "Vehicle history signals add extra downside risk here. Only proceed if the seller can clearly explain and evidence the issues.",
    };
  }

  if (adjustedHigh !== null && adjustedHigh >= 2600) {
    return {
      badgeClass: "border-red-200 bg-red-50 text-red-700",
      badgeLabel: "Higher caution advised",
      body:
        "This profile still carries heavier downside risk. You should only proceed with strong evidence that the key issues have already been addressed.",
    };
  }

  if (
    adjustedHigh !== null &&
    adjustedHigh >= 1400 &&
    reductionRatio < 0.3 &&
    addressedCount < 2
  ) {
    return {
      badgeClass: "border-amber-200 bg-amber-50 text-amber-700",
      badgeLabel: "Negotiate carefully",
      body:
        "There is enough repair or pricing risk here to justify a firmer negotiation position and careful evidence checks.",
    };
  }

  if (
    marketPosition === "high" ||
    (adjustedHigh !== null && adjustedHigh >= 900)
  ) {
    return {
      badgeClass: "border-amber-200 bg-amber-50 text-amber-700",
      badgeLabel: "Check carefully before buying",
      body:
        "Some of the risk looks more manageable now, but there is still enough uncertainty to justify careful checks and a stronger buying position.",
    };
  }

  return {
    badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
    badgeLabel: "Looks more manageable",
    body:
      "The profile now looks more manageable, but you should still verify service records, review the MoT trail and inspect the known weak points before buying.",
  };
}

function SummaryMetric({
  label,
  value,
  subtext,
}: {
  label: string;
  value: string;
  subtext?: string | null;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2.5">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-0.5 break-words text-sm font-semibold text-slate-950">
        {value}
      </div>
      {subtext ? (
        <div className="mt-0.5 break-words text-[11px] leading-4 text-slate-500">
          {subtext}
        </div>
      ) : null}
    </div>
  );
}

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
      <div className="text-sm font-bold text-slate-950">{value}</div>
      <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
        active
          ? "border-black bg-slate-950 text-white"
          : "border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100"
      }`}
    >
      {children}
    </button>
  );
}

function RiskCard({
  item,
  addressed,
  onToggle,
  badgeLabel,
  extraTop,
}: {
  item: RiskItem;
  addressed: boolean;
  onToggle: () => void;
  badgeLabel: string;
  extraTop?: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-xl border px-3 py-3 shadow-sm transition ${itemTone(
        item,
        addressed
      )}`}
    >
      <div className="mb-3 flex flex-col gap-2.5">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div
              className={`text-sm font-bold tracking-tight ${
                addressed ? "text-emerald-900" : "text-slate-950"
              }`}
            >
              {item?.label ?? "Flagged item"}
            </div>
            <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              {badgeLabel}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-left sm:text-right">
            <div className="break-words text-sm font-semibold text-slate-950">
              {money(Number(item?.cost_low ?? 0))} –{" "}
              {money(Number(item?.cost_high ?? 0))}
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              likely exposure
            </div>
          </div>
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-white/80 px-3 py-2.5">
          <input
            type="checkbox"
            checked={addressed}
            onChange={onToggle}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          />
          <div>
            <div className="text-sm font-semibold text-slate-950">
              Mark as addressed by seller
            </div>
            <div className="text-[11px] leading-5 text-slate-600">
              Tick this if the seller has proof this item was fixed, completed or
              clearly checked.
            </div>
          </div>
        </label>

        {addressed ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800">
            This item has been excluded from the live exposure total.
          </div>
        ) : null}
      </div>

      {extraTop ? <div className="mb-3">{extraTop}</div> : null}

      {item?.why_flagged ? (
        <p className="mt-2 text-sm leading-5 text-slate-700">
          <span className="font-semibold text-slate-950">Why flagged:</span>{" "}
          {item.why_flagged}
        </p>
      ) : null}

      {item?.why_it_matters ? (
        <p className="mt-2 text-sm leading-5 text-slate-700">
          <span className="font-semibold text-slate-950">Why it matters:</span>{" "}
          {item.why_it_matters}
        </p>
      ) : null}

      {Array.isArray(item?.questions_to_ask) && item.questions_to_ask.length ? (
        <div className="mt-3">
          <div className="text-sm font-semibold text-slate-950">
            Questions to ask
          </div>
          <ul className="mt-1.5 space-y-1.5 text-sm leading-5 text-slate-700">
            {item.questions_to_ask.map((q: string, i: number) => (
              <li key={i}>• {q}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {Array.isArray(item?.red_flags) && item.red_flags.length ? (
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3">
          <div className="text-sm font-semibold text-slate-950">Red flags</div>
          <ul className="mt-1.5 space-y-1.5 text-sm leading-5 text-slate-700">
            {item.red_flags.map((rf: string, i: number) => (
              <li key={i}>• {rf}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export default function ReportClient({
  reg,
  make,
  year,
  mileage,
  fuel,
  transmission,
  fullSummary,
  confidenceDisplay,
  baseExposureLow,
  baseExposureHigh,
  negotiationSuggested,
  motPanel,
  motPayload,
  hpiUnlocked,
  hpiStatus,
  hpiChecks,
  hpiUpgradeCheckoutUrl,
  hpiUpgradePriceLabel,
  justUnlockedReport,
  justUnlockedHpi,
  ownerUserId,
  userId,
  registerUrl,
  loginUrl,
  expiresAtLabel,
  serviceRiskItems,
  motRiskItems,
  askingPrice,
  marketValue,
}: {
  reg: string | null;
  make: string | null;
  year: number | null;
  mileage: number | null;
  fuel: string | null;
  transmission: string | null;
  fullSummary: any;
  confidenceDisplay: string | null;
  baseExposureLow: number | null;
  baseExposureHigh: number | null;
  negotiationSuggested: number | null;
  motPanel: {
    available: boolean;
    latestResult: string | null;
    latestDate: string | null;
    latestAdvisoryCount: number;
    passCount: number;
    failCount: number;
    advisoryCount: number;
    repeatAdvisoryCount: number;
  };
  motPayload?: any;
  hpiUnlocked: boolean;
  hpiStatus: string | null;
  hpiChecks: HpiCheck[];
  hpiUpgradeCheckoutUrl: string;
  hpiUpgradePriceLabel: string;
  justUnlockedReport: boolean;
  justUnlockedHpi: boolean;
  ownerUserId: string | null;
  userId?: string | null;
  registerUrl: string;
  loginUrl: string;
  expiresAtLabel: string | null;
  serviceRiskItems: RiskItem[];
  motRiskItems: RiskItem[];
  askingPrice: number | null;
  marketValue: any;
}) {
  const [activeTab, setActiveTab] = useState<ReportTab>("overview");

  const knownModelIssues = useMemo<KnownModelIssue[]>(
    () => parseKnownModelIssues(fullSummary),
    [fullSummary]
  );

  const knownModelIssueExposure = useMemo(
    () => parseKnownModelIssueExposure(fullSummary, knownModelIssues),
    [fullSummary, knownModelIssues]
  );

  const vehicleIdentityData = useMemo(
    () => buildVehicleIdentity(fullSummary),
    [fullSummary]
  );

  const identityRows = useMemo(
    () => buildIdentityRows(vehicleIdentityData.displayIdentity),
    [vehicleIdentityData.displayIdentity]
  );

  const knownIssueSummary = useMemo(
    () => buildKnownIssueSummary(knownModelIssues),
    [knownModelIssues]
  );

  const knownIssueExplainer = useMemo(
    () => buildKnownIssueExplainer(knownIssueSummary),
    [knownIssueSummary]
  );

  const ukvdStatus = useMemo(() => getUkvdStatus(fullSummary), [fullSummary]);

  const allItems = useMemo(
    () => [...serviceRiskItems, ...motRiskItems, ...knownModelIssues],
    [serviceRiskItems, motRiskItems, knownModelIssues]
  );

  const repeatPatternLabels = useMemo(
    () => getRepeatPatternLabels(fullSummary),
    [fullSummary]
  );

  const repeatPatternDetails = useMemo(
    () => getRepeatPatternDetails(fullSummary),
    [fullSummary]
  );

  const motTests = useMemo(
    () => parseMotTests(motPayload, fullSummary),
    [motPayload, fullSummary]
  );

  const parsedConfidence = useMemo(
    () => parseConfidenceDisplay(confidenceDisplay),
    [confidenceDisplay]
  );

  const marketLow =
    typeof marketValue?.low === "number" ? marketValue.low : null;
  const marketHigh =
    typeof marketValue?.high === "number" ? marketValue.high : null;
  const marketBenchmark =
    typeof marketValue?.benchmark_value === "number"
      ? marketValue.benchmark_value
      : null;
  const marketDelta =
    typeof marketValue?.delta === "number" ? marketValue.delta : null;
  const marketPosition =
    typeof marketValue?.position === "string" ? marketValue.position : null;
  const marketSummaryText =
    typeof marketValue?.summary === "string" ? marketValue.summary : null;
  const valuationDate =
    typeof marketValue?.valuation_date === "string"
      ? marketValue.valuation_date
      : null;
  const valuationMileage =
    typeof marketValue?.valuation_mileage === "number"
      ? marketValue.valuation_mileage
      : null;

  const hasValuationNumbers =
    marketBenchmark !== null || marketLow !== null || marketHigh !== null;
  const valuationUnavailable =
    !hasValuationNumbers && ukvdStatus.status === "error";
  const valuationPending =
    !hasValuationNumbers && ukvdStatus.status === "pending";

  const pricePositionSummary =
    hasValuationNumbers
      ? marketSummaryText ||
        "We compared the asking price with typical market value for this vehicle."
      : valuationUnavailable
        ? "Market valuation was temporarily unavailable for this vehicle. The rest of the paid report remains valid."
        : valuationPending
          ? "Market valuation is still being prepared for this vehicle."
          : askingPrice !== null
            ? "An asking price was captured, but a comparable market benchmark was not available in this report."
            : "No asking price was provided, so price position could not be assessed.";

  const [addressedIds, setAddressedIds] = useState<Record<string, boolean>>({});

  function getItemKey(item: RiskItem, index: number) {
    return item.item_id ? `item-${item.item_id}` : `item-${index}`;
  }

  const adjustedTotals = useMemo(() => {
    let lowReduction = 0;
    let highReduction = 0;

    allItems.forEach((item, index) => {
      const key = getItemKey(item, index);
      if (addressedIds[key]) {
        lowReduction += Number(item.cost_low ?? 0);
        highReduction += Number(item.cost_high ?? 0);
      }
    });

    const adjustedLow =
      typeof baseExposureLow === "number"
        ? Math.max(0, baseExposureLow - lowReduction)
        : null;

    const adjustedHigh =
      typeof baseExposureHigh === "number"
        ? Math.max(0, baseExposureHigh - highReduction)
        : null;

    const addressedCount = Object.values(addressedIds).filter(Boolean).length;

    const adjustedMidpoint =
      adjustedLow !== null && adjustedHigh !== null
        ? (adjustedLow + adjustedHigh) / 2
        : null;

    const adjustedNegotiation =
      adjustedMidpoint !== null
        ? clamp(Math.round(adjustedMidpoint * 0.65), 0, 25000)
        : negotiationSuggested;

    const negotiationReduction =
      typeof negotiationSuggested === "number" &&
      typeof adjustedNegotiation === "number"
        ? Math.max(0, negotiationSuggested - adjustedNegotiation)
        : null;

    let adjustedConfidenceScore = parsedConfidence.score;

    if (parsedConfidence.score !== null) {
      const exposureReductionRatio =
        typeof baseExposureHigh === "number" && baseExposureHigh > 0
          ? highReduction / baseExposureHigh
          : 0;

      const confidenceLift = Math.round(
        addressedCount * 2 + Math.min(8, exposureReductionRatio * 12)
      );

      adjustedConfidenceScore = clamp(
        parsedConfidence.score + confidenceLift,
        30,
        95
      );
    }

    const adjustedConfidenceLabel =
      adjustedConfidenceScore !== null
        ? confidenceLabelFromScore(adjustedConfidenceScore)
        : parsedConfidence.label;

    const adjustedConfidenceDisplay =
      adjustedConfidenceScore !== null
        ? `${adjustedConfidenceLabel} (${adjustedConfidenceScore}/100)`
        : confidenceDisplay;

    return {
      adjustedLow,
      adjustedHigh,
      addressedCount,
      lowReduction,
      highReduction,
      adjustedNegotiation,
      negotiationReduction,
      adjustedConfidenceScore,
      adjustedConfidenceDisplay,
    };
  }, [
    allItems,
    addressedIds,
    baseExposureLow,
    baseExposureHigh,
    negotiationSuggested,
    parsedConfidence.score,
    parsedConfidence.label,
    confidenceDisplay,
  ]);

  const decisionCall = useMemo(
    () =>
      getDecisionCall({
        adjustedHigh: adjustedTotals.adjustedHigh,
        adjustedLow: adjustedTotals.adjustedLow,
        marketPosition,
        hpiUnlocked,
        hpiChecks,
        hpiStatus,
        addressedCount: adjustedTotals.addressedCount,
        baseExposureHigh,
      }),
    [
      adjustedTotals.adjustedHigh,
      adjustedTotals.adjustedLow,
      adjustedTotals.addressedCount,
      marketPosition,
      hpiUnlocked,
      hpiChecks,
      hpiStatus,
      baseExposureHigh,
    ]
  );

  const priorityFindings = useMemo(() => {
    return [...allItems]
      .sort((a, b) => Number(b?.cost_high ?? 0) - Number(a?.cost_high ?? 0))
      .slice(0, 5);
  }, [allItems]);

  function toggleAddressed(key: string) {
    setAddressedIds((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-3 py-3 sm:px-4 sm:py-4 lg:px-5">
      <div className="mb-4 hidden border-b border-slate-300 pb-2 print:block">
        <div className="text-base font-bold text-slate-950">
          AutoAudit Vehicle Report
        </div>
        <div className="text-xs text-slate-600">
          Generated: {new Date().toLocaleDateString("en-GB")}
        </div>
        {reg ? (
          <div className="mt-1 text-xs text-slate-600">
            Registration: <span className="font-semibold">{reg}</span>
            {make ? <> · {make}</> : null}
            {year ? <> · {year}</> : null}
          </div>
        ) : null}
      </div>

      {justUnlockedReport || justUnlockedHpi ? (
        <div className="mb-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2.5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-emerald-900">
                {justUnlockedHpi
                  ? "History & provenance check unlocked"
                  : "Core report unlocked"}
              </div>
              <div className="mt-0.5 text-xs text-emerald-900/80">
                {justUnlockedHpi
                  ? "Your report now includes the HPI-style history panel."
                  : "You now have repair risk, price context and MoT analysis."}
              </div>
            </div>

            {!ownerUserId ? (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Link
                  href={registerUrl}
                  className="inline-flex items-center justify-center rounded-lg border border-emerald-700 bg-emerald-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
                >
                  Create account to save
                </Link>
                <Link
                  href={loginUrl}
                  className="inline-flex items-center justify-center rounded-lg border border-emerald-300 bg-white px-3 py-2 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-50"
                >
                  Log in to save
                </Link>
              </div>
            ) : userId === ownerUserId ? (
              <div className="inline-flex items-center rounded-full border border-emerald-300 bg-white px-3 py-1 text-xs font-medium text-emerald-800">
                This report is linked to your account
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="relative overflow-hidden rounded-[1.25rem] border border-[var(--aa-silver)] bg-[var(--aa-black)] shadow-[0_16px_48px_rgba(15,23,42,0.12)] sm:rounded-[1.5rem]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/hero-car-road.png')" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(255,255,255,0.96)_46%,rgba(255,255,255,0.90)_100%)] lg:bg-[linear-gradient(90deg,rgba(255,255,255,0.96)_0%,rgba(255,255,255,0.94)_44%,rgba(255,255,255,0.38)_72%,rgba(255,255,255,0.14)_100%)]" />

        <div className="relative px-3 py-3 sm:px-4 sm:py-4 lg:px-5 lg:py-5">
          <div className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center rounded-full border border-[var(--aa-silver)] bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-700 shadow-sm">
                Paid report
              </div>

              {adjustedTotals.addressedCount > 0 ? (
                <div className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700">
                  {adjustedTotals.addressedCount} addressed
                </div>
              ) : null}

              {reg ? (
                <div className="inline-flex items-center rounded-full border border-slate-300 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                  {reg}
                </div>
              ) : null}
            </div>

            <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 max-w-3xl">
                <h1 className="text-[1.45rem] font-extrabold leading-none tracking-tight text-black sm:text-[1.8rem] lg:text-[2.1rem]">
                  What should you do next?
                </h1>

                <div className="mt-1.5 text-xs leading-5 text-slate-600">
                  {make ? `${make} · ` : ""}
                  {year ? `${year} · ` : ""}
                  {fuel ? `${fuel} · ` : ""}
                  {transmission ? `${transmission} · ` : ""}
                  {typeof mileage === "number"
                    ? `${mileage.toLocaleString()} miles`
                    : ""}
                </div>

                {fullSummary?.headline ? (
                  <p className="mt-2 max-w-3xl text-sm leading-5 text-slate-700">
                    {fullSummary.headline}
                    {fullSummary?.summary_text ? ` ${fullSummary.summary_text}` : ""}
                  </p>
                ) : null}
              </div>

              <div
                className={`inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${decisionCall.badgeClass}`}
              >
                {decisionCall.badgeLabel}
              </div>
            </div>
          </div>

          <div className="mt-3 rounded-2xl border border-white/50 bg-white/94 p-3 shadow-[0_10px_28px_rgba(0,0,0,0.08)] backdrop-blur">
            <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.2fr_1fr]">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                  Decision signal
                </div>
                <div className="mt-1 text-sm leading-5 text-slate-700">
                  {decisionCall.body}
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <SummaryMetric
                    label="Exposure"
                    value={`${money(adjustedTotals.adjustedLow)} – ${money(
                      adjustedTotals.adjustedHigh
                    )}`}
                    subtext={
                      adjustedTotals.addressedCount > 0 &&
                      baseExposureLow !== null &&
                      baseExposureHigh !== null
                        ? `Original ${money(baseExposureLow)} – ${money(baseExposureHigh)}`
                        : null
                    }
                  />

                  <SummaryMetric
                    label="Negotiation"
                    value={money(adjustedTotals.adjustedNegotiation)}
                    subtext={
                      adjustedTotals.addressedCount > 0 &&
                      typeof negotiationSuggested === "number"
                        ? `Original ${money(negotiationSuggested)}`
                        : null
                    }
                  />

                  <SummaryMetric
                    label="Confidence"
                    value={adjustedTotals.adjustedConfidenceDisplay ?? "Unavailable"}
                    subtext={confidenceDisplay ? `Original ${confidenceDisplay}` : null}
                  />

                  <SummaryMetric
                    label="Price view"
                    value={
                      valuationUnavailable
                        ? "Unavailable"
                        : valuationPending
                          ? "Pending"
                          : valuePillLabel(marketPosition)
                    }
                    subtext={askingPrice !== null ? `Asking ${money(askingPrice)}` : null}
                  />
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                  What to do next
                </div>
                <div className="mt-1 grid gap-1.5 text-sm leading-5 text-slate-800">
                  <div>1. Start with the Priority checks tab.</div>
                  <div>2. Tick anything the seller can prove is resolved.</div>
                  <div>3. Review MoT and vehicle history before committing.</div>
                  <div>4. Use the overview totals to negotiate or walk away.</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 overflow-x-auto rounded-2xl border border-slate-200 bg-white/95 px-2 py-2 shadow-sm backdrop-blur print:hidden">
            <div className="flex min-w-max items-center gap-2">
              <TabButton
                active={activeTab === "overview"}
                onClick={() => setActiveTab("overview")}
              >
                Overview
              </TabButton>
              <TabButton
                active={activeTab === "priority"}
                onClick={() => setActiveTab("priority")}
              >
                Priority checks
              </TabButton>
              <TabButton
                active={activeTab === "mot"}
                onClick={() => setActiveTab("mot")}
              >
                MoT
              </TabButton>
              <TabButton
                active={activeTab === "history"}
                onClick={() => setActiveTab("history")}
              >
                Vehicle history
              </TabButton>
              <TabButton
                active={activeTab === "all"}
                onClick={() => setActiveTab("all")}
              >
                All findings
              </TabButton>
            </div>
          </div>

          {activeTab === "overview" ? (
            <div className="mt-3 space-y-3">
              <section className="grid grid-cols-1 gap-3 xl:grid-cols-3">
                <div className="rounded-2xl border border-white/40 bg-white/92 p-3 shadow-[0_10px_28px_rgba(0,0,0,0.08)] backdrop-blur">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      Repair risk forecast
                    </div>
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      Live
                    </div>
                  </div>

                  <div className="mt-3 overflow-hidden">
                    {adjustedTotals.adjustedLow !== null &&
                    adjustedTotals.adjustedHigh !== null ? (
                      <ExposureBar
                        low={adjustedTotals.adjustedLow}
                        high={adjustedTotals.adjustedHigh}
                      />
                    ) : (
                      <div className="text-sm text-slate-600">
                        Exposure estimate unavailable.
                      </div>
                    )}
                  </div>

                  <div className="mt-3 grid grid-cols-1 gap-2">
                    <SummaryMetric
                      label="Current range"
                      value={`${money(adjustedTotals.adjustedLow)} – ${money(
                        adjustedTotals.adjustedHigh
                      )}`}
                    />
                    <SummaryMetric
                      label="Reduction"
                      value={`${money(adjustedTotals.lowReduction)} – ${money(
                        adjustedTotals.highReduction
                      )}`}
                      subtext="From items marked addressed"
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-white/40 bg-white/92 p-3 shadow-[0_10px_28px_rgba(0,0,0,0.08)] backdrop-blur">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      Asking price vs market
                    </div>
                    <div
                      className={`inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${valuePillStyles(
                        marketPosition
                      )}`}
                    >
                      {valuationUnavailable
                        ? "Unavailable"
                        : valuationPending
                          ? "Pending"
                          : valuePillLabel(marketPosition)}
                    </div>
                  </div>

                  <div className="mt-2 text-xs leading-5 text-slate-700">
                    {pricePositionSummary}
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <SummaryMetric label="Asking" value={money(askingPrice)} />
                    <SummaryMetric label="Typical" value={money(marketBenchmark)} />
                    <SummaryMetric
                      label="Range"
                      value={
                        marketLow !== null && marketHigh !== null
                          ? `${money(marketLow)} – ${money(marketHigh)}`
                          : "—"
                      }
                    />
                  </div>

                  {(valuationDate || valuationMileage !== null || marketDelta !== null) ? (
                    <div className="mt-2 text-[11px] leading-5 text-slate-500">
                      {valuationDate ? `Basis ${formatDate(valuationDate)}` : ""}
                      {valuationDate && valuationMileage !== null ? " · " : ""}
                      {valuationMileage !== null
                        ? `${valuationMileage.toLocaleString()} miles`
                        : ""}
                      {marketDelta !== null
                        ? ` · Delta ${marketDelta > 0 ? "+" : ""}${money(marketDelta)}`
                        : ""}
                    </div>
                  ) : null}
                </div>

                <div className="rounded-2xl border border-white/40 bg-white/92 p-3 shadow-[0_10px_28px_rgba(0,0,0,0.08)] backdrop-blur">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Vehicle history
                  </div>

                  {!hpiUnlocked ? (
                    <div className="mt-2 rounded-xl border border-[var(--aa-red)]/20 bg-[var(--aa-red)]/5 p-3">
                      <div className="text-sm font-semibold text-slate-950">
                        Add vehicle history
                      </div>
                      <p className="mt-1 text-xs leading-5 text-slate-700">
                        Finance, write-off, stolen, mileage anomaly, keeper and plate checks.
                      </p>
                      <div className="mt-3">
                        <a
                          href={hpiUpgradeCheckoutUrl}
                          className="btn-primary block w-full text-center sm:inline-flex sm:w-auto"
                        >
                          Add HPI check · {hpiUpgradePriceLabel}
                        </a>
                      </div>
                    </div>
                  ) : hpiStatus === "error" ? (
                    <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-slate-700">
                      History was unlocked, but there was a temporary loading issue.
                    </div>
                  ) : (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {hpiChecks.length ? (
                        hpiChecks.slice(0, 6).map((item) => (
                          <SummaryMetric
                            key={item.label}
                            label={item.label}
                            value={renderHpiDisplayValue(item.value)}
                          />
                        ))
                      ) : (
                        <div className="col-span-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700">
                          Vehicle history summary available.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </section>

              <section className="grid grid-cols-1 gap-3 xl:grid-cols-[1.15fr_0.85fr]">
                <div className="rounded-2xl border border-white/40 bg-white/92 p-3 shadow-[0_10px_28px_rgba(0,0,0,0.08)] backdrop-blur">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Vehicle identity used for matching
                      </div>
                      <div className="mt-1 text-xs leading-5 text-slate-700">
                        {vehicleIdentityData.matchExplainer ||
                          "Vehicle details available for this report."}
                      </div>
                    </div>

                    {vehicleIdentityData.identityStatusLabel ? (
                      <div
                        className={`inline-flex w-fit rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${
                          vehicleIdentityData.enrichedIdentity
                            ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border border-slate-200 bg-slate-50 text-slate-700"
                        }`}
                      >
                        {vehicleIdentityData.identityStatusLabel}
                      </div>
                    ) : null}
                  </div>

                  {identityRows.length ? (
                    <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-3">
                      {identityRows.map((row) => (
                        <SummaryMetric
                          key={row.label}
                          label={row.label}
                          value={row.value as string}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="mt-3 text-sm text-slate-600">
                      Detailed vehicle identity was not available for this report.
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-white/40 bg-white/92 p-3 shadow-[0_10px_28px_rgba(0,0,0,0.08)] backdrop-blur">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    MoT summary
                  </div>

                  {motPanel.available ? (
                    <>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="inline-flex items-center rounded-full border border-slate-300 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                          Latest {motPanel.latestResult ? titleCase(motPanel.latestResult) : "—"}
                        </span>

                        <span className="inline-flex items-center rounded-full border border-slate-300 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                          {motPanel.latestAdvisoryCount} latest advisories
                        </span>
                      </div>

                      <div className="mt-2 text-xs text-slate-600">
                        Latest test:{" "}
                        <span className="font-semibold text-slate-900">
                          {formatDate(motPanel.latestDate) ?? "—"}
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <MiniStat label="Passes" value={motPanel.passCount} />
                        <MiniStat label="Fails" value={motPanel.failCount} />
                        <MiniStat label="Advisories" value={motPanel.advisoryCount} />
                        <MiniStat
                          label="Repeat patterns"
                          value={motPanel.repeatAdvisoryCount}
                        />
                      </div>

                      {repeatPatternLabels.length ? (
                        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50/70 p-3">
                          <div className="text-[10px] font-semibold uppercase tracking-wide text-amber-800">
                            Repeated pattern categories
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {repeatPatternLabels.map((label) => (
                              <span
                                key={label}
                                className="inline-flex items-center rounded-full border border-amber-200 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-900"
                              >
                                {label}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <div className="mt-3 text-sm text-slate-600">
                      MoT history was not available for this vehicle.
                    </div>
                  )}
                </div>
              </section>
            </div>
          ) : null}

          {activeTab === "priority" ? (
            <div className="mt-3 space-y-3">
              <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                      Start here
                    </div>
                    <div className="mt-0.5 text-sm font-semibold text-slate-950">
                      Priority checks
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Highest estimated downside first
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
                  {priorityFindings.length ? (
                    priorityFindings.map((item, index) => {
                      const key = getItemKey(item, allItems.indexOf(item));
                      const addressed = !!addressedIds[key];

                      return (
                        <RiskCard
                          key={`${item.item_id ?? item.label ?? "priority"}-${index}`}
                          item={item}
                          addressed={addressed}
                          onToggle={() => toggleAddressed(key)}
                          badgeLabel={String(item.category ?? "priority").replace(
                            /_/g,
                            " "
                          )}
                        />
                      );
                    })
                  ) : (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                      No priority findings were available for this report.
                    </div>
                  )}
                </div>
              </section>

              {knownModelIssues.length ? (
                <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                  <div className="text-sm font-semibold text-slate-950">
                    Known issue matching notes
                  </div>
                  <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm leading-5 text-slate-700">
                    {vehicleIdentityData.matchExplainer ? (
                      <div>{vehicleIdentityData.matchExplainer}</div>
                    ) : null}
                    {knownIssueExplainer ? (
                      <div className={vehicleIdentityData.matchExplainer ? "mt-2" : ""}>
                        {knownIssueExplainer}
                      </div>
                    ) : null}
                    {knownModelIssueExposure.low !== null &&
                    knownModelIssueExposure.high !== null ? (
                      <div className="mt-2 font-semibold text-slate-950">
                        Weighted exposure included above:{" "}
                        {money(knownModelIssueExposure.low)} –{" "}
                        {money(knownModelIssueExposure.high)}
                      </div>
                    ) : null}
                  </div>
                </section>
              ) : null}
            </div>
          ) : null}

          {activeTab === "mot" ? (
            <div className="mt-3 space-y-3">
              <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                <div className="mb-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                    History-derived checks
                  </div>
                  <div className="mt-0.5 text-base font-bold text-slate-950">
                    MoT-derived risks
                  </div>
                  <p className="mt-0.5 text-xs leading-5 text-slate-700">
                    These findings are based on patterns and warning signals found
                    in the recorded MoT history.
                  </p>
                </div>

                {motRiskItems.length ? (
                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                    {motRiskItems.map((item, index) => {
                      const key = getItemKey(item, serviceRiskItems.length + index);
                      const addressed = !!addressedIds[key];
                      const isRepeatPatternItem =
                        item.item_id === "mot_repeat_advisories" ||
                        String(item.label ?? "")
                          .toLowerCase()
                          .includes("recurring advisory pattern");

                      return (
                        <RiskCard
                          key={`${item?.item_id ?? "mot"}-${index}`}
                          item={item}
                          addressed={addressed}
                          onToggle={() => toggleAddressed(key)}
                          badgeLabel="MoT-derived risk"
                          extraTop={
                            isRepeatPatternItem && repeatPatternLabels.length ? (
                              <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-3">
                                <div className="text-sm font-semibold text-slate-950">
                                  Pattern categories identified
                                </div>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {repeatPatternLabels.map((label) => (
                                    <span
                                      key={label}
                                      className="inline-flex items-center rounded-full border border-amber-200 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-900"
                                    >
                                      {label}
                                    </span>
                                  ))}
                                </div>

                                {repeatPatternDetails.length ? (
                                  <div className="mt-3 space-y-2">
                                    {repeatPatternDetails.map((detail, detailIndex) => (
                                      <div
                                        key={`${detail.text ?? "repeat"}-${detailIndex}`}
                                        className="rounded-lg border border-amber-100 bg-white px-3 py-2.5"
                                      >
                                        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between">
                                          <div className="text-sm font-semibold text-slate-950">
                                            {detail.patternLabel ?? "Pattern"}
                                          </div>
                                          <div className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                                            Seen {detail.count ?? 0} times
                                          </div>
                                        </div>
                                        <div className="mt-1.5 text-sm leading-5 text-slate-700">
                                          {detail.text ?? "Repeated advisory wording detected."}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : null}
                              </div>
                            ) : null
                          }
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                    No additional MoT-derived risks were listed in this report.
                  </div>
                )}
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                <div className="mb-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                    Full record
                  </div>
                  <div className="mt-0.5 text-base font-bold text-slate-950">
                    Full MoT history
                  </div>
                </div>

                {motTests.length ? (
                  <div className="space-y-3">
                    {motTests.map((test, index) => {
                      const defectGroups = groupMotDefects(test.defects);
                      const allDefects = [
                        ...defectGroups.dangerous,
                        ...defectGroups.major,
                        ...defectGroups.minor,
                        ...defectGroups.advisory,
                        ...defectGroups.other,
                      ];
                      const mileageDisplay = parseMotMileage(test);

                      return (
                        <div
                          key={`${test.completedDate ?? "mot-test"}-${index}`}
                          className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                        >
                          <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <div className="text-sm font-bold tracking-tight text-slate-950">
                                {formatDate(test.completedDate) ?? "Unknown test date"}
                              </div>

                              <div className="mt-2 flex flex-wrap gap-2">
                                <span
                                  className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${getMotBadgeStyles(
                                    test.testResult
                                  )}`}
                                >
                                  {getMotBadgeLabel(test.testResult)}
                                </span>

                                {mileageDisplay ? (
                                  <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-700">
                                    {mileageDisplay}
                                  </span>
                                ) : null}

                                {test.expiryDate ? (
                                  <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-700">
                                    Expiry {formatDate(test.expiryDate)}
                                  </span>
                                ) : null}
                              </div>
                            </div>

                            <div className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-left sm:text-right">
                              <div className="text-sm font-semibold text-slate-950">
                                {allDefects.length}
                              </div>
                              <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                                defect{allDefects.length === 1 ? "" : "s"}
                              </div>
                            </div>
                          </div>

                          {allDefects.length ? (
                            <div className="mt-3 space-y-2">
                              {allDefects.map((defect, defectIndex) => (
                                <div
                                  key={`${defect.text ?? "defect"}-${defectIndex}`}
                                  className="rounded-lg border border-slate-200 bg-white p-3"
                                >
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span
                                      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${defectTone(
                                        defect?.type
                                      )}`}
                                    >
                                      {defectTypeLabel(String(defect?.type ?? "Other"))}
                                    </span>
                                  </div>

                                  <div className="mt-1.5 break-words text-sm leading-5 text-slate-700">
                                    {defect?.text ?? "No defect text provided."}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50/70 p-3 text-sm text-emerald-900">
                              No defects or advisories were recorded for this test.
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                    Full MoT test history was not available in this report payload.
                  </div>
                )}
              </section>
            </div>
          ) : null}

          {activeTab === "history" ? (
            <div className="mt-3 space-y-3">
              <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                <div className="mb-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                    Vehicle history
                  </div>
                  <div className="mt-0.5 text-base font-bold text-slate-950">
                    History & provenance
                  </div>
                </div>

                {!hpiUnlocked ? (
                  <div className="rounded-xl border border-[var(--aa-red)]/20 bg-[var(--aa-red)]/5 p-3">
                    <div className="text-sm font-semibold text-slate-950">
                      Upgrade to add vehicle history
                    </div>
                    <p className="mt-1 text-sm leading-5 text-slate-700">
                      Add finance markers, write-off records, stolen checks,
                      mileage anomalies, keeper history and plate changes.
                    </p>
                    <div className="mt-3">
                      <a
                        href={hpiUpgradeCheckoutUrl}
                        className="btn-primary block w-full text-center sm:inline-flex sm:w-auto"
                      >
                        Add HPI check · {hpiUpgradePriceLabel}
                      </a>
                    </div>
                  </div>
                ) : hpiStatus === "error" ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-slate-700">
                    We unlocked the vehicle history section, but there was a
                    temporary issue loading the latest response. The rest of the
                    report is still available.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {hpiChecks.length ? (
                      hpiChecks.map((item) => (
                        <SummaryMetric
                          key={item.label}
                          label={item.label}
                          value={renderHpiDisplayValue(item.value)}
                        />
                      ))
                    ) : (
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                        Vehicle history summary available.
                      </div>
                    )}
                  </div>
                )}
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                <div className="mb-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                    Save access
                  </div>
                  <div className="mt-0.5 text-base font-bold text-slate-950">
                    Save this report to your account
                  </div>
                </div>

                <div className="text-xs leading-5 text-slate-700">
                  Create an account after purchase to keep access to this report for 30
                  days
                  {expiresAtLabel ? (
                    <>
                      {" "}
                      — until <span className="font-semibold">{expiresAtLabel}</span>
                    </>
                  ) : (
                    <> from the date of payment</>
                  )}
                  .
                </div>

                <div className="mt-1 text-xs leading-5 text-slate-700">
                  If you do not register or download your report, you may not be able to
                  access it again after that 30-day period has ended.
                </div>

                {!ownerUserId ? (
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                    <Link href={registerUrl} className="btn-primary w-full text-center sm:w-auto">
                      Create account to save report
                    </Link>

                    <Link href={loginUrl} className="btn-outline w-full text-center sm:w-auto">
                      Log in to save report
                    </Link>
                  </div>
                ) : userId === ownerUserId ? (
                  <div className="mt-3 inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
                    This report is linked to your account
                  </div>
                ) : null}
              </section>
            </div>
          ) : null}

          {activeTab === "all" ? (
            <div className="mt-3 space-y-3">
              <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                <div className="mb-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                    Practical checks
                  </div>
                  <div className="mt-0.5 text-base font-bold text-slate-950">
                    Service and maintenance risks
                  </div>
                </div>

                {serviceRiskItems.length ? (
                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                    {serviceRiskItems.map((item, index) => {
                      const key = getItemKey(item, index);
                      const addressed = !!addressedIds[key];

                      return (
                        <RiskCard
                          key={`${item?.item_id ?? "service"}-${index}`}
                          item={item}
                          addressed={addressed}
                          onToggle={() => toggleAddressed(key)}
                          badgeLabel={String(item?.category ?? "service").replace(
                            /_/g,
                            " "
                          )}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                    No additional service or maintenance risks were listed in this
                    report.
                  </div>
                )}
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                <div className="mb-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                    Known weak points
                  </div>
                  <div className="mt-0.5 text-base font-bold text-slate-950">
                    Model-specific issues
                  </div>
                </div>

                {knownModelIssues.length ? (
                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                    {knownModelIssues.map((item, index) => {
                      const key = getItemKey(
                        item,
                        serviceRiskItems.length + motRiskItems.length + index
                      );
                      const addressed = !!addressedIds[key];

                      return (
                        <RiskCard
                          key={`${item?.issue_code ?? item?.item_id ?? "known"}-${index}`}
                          item={item}
                          addressed={addressed}
                          onToggle={() => toggleAddressed(key)}
                          badgeLabel={String(item?.category ?? "known issue").replace(
                            /_/g,
                            " "
                          )}
                          extraTop={
                            <div className="flex flex-wrap gap-2">
                              <span
                                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${matchConfidencePill(
                                  item.match_confidence
                                )}`}
                              >
                                {matchConfidenceLabel(item.match_confidence)}
                              </span>

                              <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                                {matchBasisLabel(item.match_basis)}
                              </span>

                              {typeof item?.probability_score === "number" ? (
                                <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                                  Relevance {Math.round(item.probability_score * 100)}%
                                </span>
                              ) : null}
                            </div>
                          }
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                    No additional model-specific issues were identified from the
                    available vehicle profile.
                  </div>
                )}
              </section>
            </div>
          ) : null}
        </div>
      </div>

      {!justUnlockedReport && !justUnlockedHpi ? (
        <section className="mt-3 rounded-2xl border border-red-200 bg-red-50/50 p-3 print:hidden">
          <div className="text-sm font-semibold text-slate-950">
            Save access to this report
          </div>

          <div className="mt-1 text-xs leading-5 text-slate-700">
            Create an account after purchase to keep access to this report for 30
            days
            {expiresAtLabel ? (
              <>
                {" "}
                — until <span className="font-semibold">{expiresAtLabel}</span>
              </>
            ) : (
              <> from the date of payment</>
            )}
            .
          </div>

          <div className="mt-1 text-xs leading-5 text-slate-700">
            If you do not register or download your report, you may not be able to
            access it again after that 30-day period has ended.
          </div>

          {!ownerUserId ? (
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Link href={registerUrl} className="btn-primary w-full text-center sm:w-auto">
                Create account to save report
              </Link>

              <Link href={loginUrl} className="btn-outline w-full text-center sm:w-auto">
                Log in to save report
              </Link>
            </div>
          ) : userId === ownerUserId ? (
            <div className="mt-3 inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
              This report is linked to your account
            </div>
          ) : null}
        </section>
      ) : null}

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3 text-xs leading-5 text-slate-600">
        AutoAudit provides guidance only and is not a substitute for a
        mechanical inspection.
      </div>
    </div>
  );
}