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
  const knownModelIssues = useMemo<KnownModelIssue[]>(
    () =>
      Array.isArray(fullSummary?.known_model_issues?.items)
        ? fullSummary.known_model_issues.items
        : [],
    [fullSummary]
  );

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

  const knownModelIssueExposureLow =
    typeof fullSummary?.known_model_issues?.exposure_low === "number"
      ? fullSummary.known_model_issues.exposure_low
      : null;

  const knownModelIssueExposureHigh =
    typeof fullSummary?.known_model_issues?.exposure_high === "number"
      ? fullSummary.known_model_issues.exposure_high
      : null;

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

  function toggleAddressed(key: string) {
    setAddressedIds((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:py-8">
      <div className="mb-6 hidden border-b border-slate-300 pb-3 print:block">
        <div className="text-lg font-bold text-slate-950">
          AutoAudit Vehicle Report
        </div>
        <div className="text-sm text-slate-600">
          Generated: {new Date().toLocaleDateString("en-GB")}
        </div>
        {reg ? (
          <div className="mt-1 text-sm text-slate-600">
            Registration: <span className="font-semibold">{reg}</span>
            {make ? <> · {make}</> : null}
            {year ? <> · {year}</> : null}
          </div>
        ) : null}
      </div>

      {justUnlockedReport || justUnlockedHpi ? (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="text-sm font-semibold text-emerald-900">
            {justUnlockedHpi
              ? "History & provenance check unlocked"
              : "Core report unlocked"}
          </div>
          <div className="mt-1 text-sm text-emerald-900/80">
            {justUnlockedHpi
              ? "Your report now includes the HPI-style history panel."
              : "You now have service risk, detailed findings, pricing context and MoT analysis."}
          </div>
        </div>
      ) : null}

      <div className="relative overflow-hidden rounded-[2rem] border border-[var(--aa-silver)] bg-[var(--aa-black)] shadow-[0_18px_60px_rgba(15,23,42,0.14)]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/hero-car-road.png')" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.95)_0%,rgba(255,255,255,0.93)_42%,rgba(255,255,255,0.28)_72%,rgba(255,255,255,0.10)_100%)]" />

        <div className="relative px-5 py-6 sm:px-8 sm:py-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center rounded-full border border-[var(--aa-silver)] bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-700 shadow-sm">
              Paid report
            </div>

            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-black sm:text-4xl">
              Full Vehicle Report for {reg ?? "this vehicle"}
            </h1>

            <div className="mt-2 text-sm text-slate-600">
              {make ? `${make} · ` : ""}
              {year ? `${year} · ` : ""}
              {fuel ? `${fuel} · ` : ""}
              {transmission ? `${transmission} · ` : ""}
              {typeof mileage === "number"
                ? `${mileage.toLocaleString()} miles`
                : ""}
            </div>

            {fullSummary?.headline ? (
              <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-700 sm:text-base">
                {fullSummary.headline}
                {fullSummary?.summary_text ? ` ${fullSummary.summary_text}` : ""}
              </p>
            ) : null}
          </div>

          <div className="mt-8 grid gap-4 xl:grid-cols-3">
            <div className="rounded-2xl border border-white/40 bg-white/92 p-5 shadow-[0_12px_32px_rgba(0,0,0,0.10)] backdrop-blur">
              <div className="flex items-start justify-between gap-4">
                <div className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Service Risk
                </div>
                {adjustedTotals.addressedCount > 0 ? (
                  <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">
                    {adjustedTotals.addressedCount} addressed
                  </div>
                ) : null}
              </div>

              <div className="mt-4">
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

              <div className="mt-4 grid gap-3">
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Confidence
                  </div>
                  <div className="mt-1 text-sm font-semibold text-slate-950">
                    {adjustedTotals.adjustedConfidenceDisplay ?? "Unavailable"}
                  </div>
                  {adjustedTotals.addressedCount > 0 && confidenceDisplay ? (
                    <div className="mt-1 text-xs text-slate-500">
                      Original: {confidenceDisplay}
                    </div>
                  ) : null}
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Negotiation guide
                  </div>
                  <div className="mt-1 text-sm font-semibold text-slate-950">
                    {money(adjustedTotals.adjustedNegotiation)}
                  </div>
                  {adjustedTotals.addressedCount > 0 &&
                  typeof negotiationSuggested === "number" ? (
                    <>
                      <div className="mt-1 text-xs text-slate-500">
                        Original: {money(negotiationSuggested)}
                      </div>
                      {adjustedTotals.negotiationReduction !== null ? (
                        <div className="mt-1 text-xs font-medium text-emerald-700">
                          Reduced by {money(adjustedTotals.negotiationReduction)}
                        </div>
                      ) : null}
                    </>
                  ) : null}
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Estimated exposure
                  </div>
                  <div className="mt-1 text-sm font-semibold text-slate-950">
                    {money(adjustedTotals.adjustedLow)} –{" "}
                    {money(adjustedTotals.adjustedHigh)}
                  </div>
                  {adjustedTotals.addressedCount > 0 &&
                  baseExposureLow !== null &&
                  baseExposureHigh !== null ? (
                    <>
                      <div className="mt-1 text-xs text-slate-500">
                        Original: {money(baseExposureLow)} –{" "}
                        {money(baseExposureHigh)}
                      </div>
                      <div className="mt-1 text-xs font-medium text-emerald-700">
                        Reduced by {money(adjustedTotals.lowReduction)} –{" "}
                        {money(adjustedTotals.highReduction)}
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/40 bg-white/92 p-5 shadow-[0_12px_32px_rgba(0,0,0,0.10)] backdrop-blur">
              <div className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Price Position
              </div>

              {askingPrice !== null || marketLow !== null || marketHigh !== null ? (
                <>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-sm text-slate-700">
                      {marketSummaryText ||
                        "We’ve compared the asking price with typical market value."}
                    </div>

                    <div
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${valuePillStyles(
                        marketPosition
                      )}`}
                    >
                      {valuePillLabel(marketPosition)}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Asking price
                      </div>
                      <div className="mt-1 text-lg font-extrabold text-slate-950">
                        {money(askingPrice)}
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Typical value
                      </div>
                      <div className="mt-1 text-lg font-extrabold text-slate-950">
                        {money(marketBenchmark)}
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Market range
                      </div>
                      <div className="mt-1 text-lg font-extrabold text-slate-950">
                        {marketLow !== null && marketHigh !== null
                          ? `${money(marketLow)} – ${money(marketHigh)}`
                          : "—"}
                      </div>
                    </div>
                  </div>

                  {(valuationDate || valuationMileage !== null) && (
                    <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3">
                      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Valuation basis
                      </div>
                      <div className="mt-1 text-sm font-semibold text-slate-950">
                        {valuationDate ? formatDate(valuationDate) : "—"}
                        {valuationDate && valuationMileage !== null ? " · " : ""}
                        {valuationMileage !== null
                          ? `${valuationMileage.toLocaleString()} miles`
                          : ""}
                      </div>
                    </div>
                  )}

                  {marketDelta !== null ? (
                    <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3">
                      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Difference vs typical value
                      </div>
                      <div className="mt-1 text-sm font-semibold text-slate-950">
                        {marketDelta > 0 ? "+" : ""}
                        {money(marketDelta)}
                      </div>
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="mt-4 text-sm text-slate-600">
                  Value comparison was not available for this report.
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-white/40 bg-white/92 p-5 shadow-[0_12px_32px_rgba(0,0,0,0.10)] backdrop-blur">
              <div className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                MoT History
              </div>

              {motPanel.available ? (
                <>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-800">
                      Latest:{" "}
                      {motPanel.latestResult
                        ? titleCase(motPanel.latestResult)
                        : "—"}
                    </span>

                    <span className="inline-flex items-center rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-800">
                      Latest advisories: {motPanel.latestAdvisoryCount}
                    </span>
                  </div>

                  <div className="mt-3 text-sm text-slate-600">
                    Latest test date:{" "}
                    <span className="font-semibold text-slate-900">
                      {formatDate(motPanel.latestDate) ?? "—"}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                      <div className="text-lg font-extrabold text-slate-950">
                        {motPanel.passCount}
                      </div>
                      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Passes
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                      <div className="text-lg font-extrabold text-slate-950">
                        {motPanel.failCount}
                      </div>
                      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Fails
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                      <div className="text-lg font-extrabold text-slate-950">
                        {motPanel.advisoryCount}
                      </div>
                      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Advisories
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                      <div className="text-lg font-extrabold text-slate-950">
                        {motPanel.repeatAdvisoryCount}
                      </div>
                      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Repeat patterns
                      </div>
                    </div>
                  </div>

                  {repeatPatternLabels.length ? (
                    <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/70 p-4">
                      <div className="text-xs font-semibold uppercase tracking-wide text-amber-800">
                        Repeated pattern categories
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {repeatPatternLabels.map((label) => (
                          <span
                            key={label}
                            className="inline-flex items-center rounded-full border border-amber-200 bg-white px-3 py-1 text-xs font-semibold text-amber-900"
                          >
                            {label}
                          </span>
                        ))}
                      </div>

                      {repeatPatternDetails.length ? (
                        <div className="mt-4 space-y-2">
                          {repeatPatternDetails.slice(0, 4).map((detail, index) => (
                            <div
                              key={`${detail.text ?? "detail"}-${index}`}
                              className="rounded-lg border border-amber-100 bg-white px-3 py-3"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="text-sm font-medium text-slate-900">
                                  {detail.patternLabel ?? "Pattern"}
                                </div>
                                <div className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                                  Seen {detail.count ?? 0} times
                                </div>
                              </div>
                              <div className="mt-2 text-sm leading-6 text-slate-700">
                                {detail.text ?? "Repeated advisory wording detected."}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="mt-4 text-sm text-slate-600">
                  MoT history was not available for this vehicle.
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-3">
            <div className="xl:col-span-2" />

            <div className="rounded-2xl border border-white/40 bg-white/92 p-5 shadow-[0_12px_32px_rgba(0,0,0,0.10)] backdrop-blur">
              <div className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                HPI Check
              </div>

              {!hpiUnlocked ? (
                <div className="mt-4 rounded-xl border border-[var(--aa-red)]/20 bg-[var(--aa-red)]/5 p-4">
                  <div className="text-base font-semibold text-slate-950">
                    Upgrade to add vehicle history
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    Add finance markers, write-off records, stolen checks,
                    mileage anomalies, keeper history and plate changes.
                  </p>
                  <div className="mt-4">
                    <a href={hpiUpgradeCheckoutUrl} className="btn-primary">
                      Add HPI check · {hpiUpgradePriceLabel}
                    </a>
                  </div>
                </div>
              ) : hpiStatus === "error" ? (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-slate-700">
                  We unlocked the HPI section, but there was a temporary issue
                  loading the latest history response.
                </div>
              ) : (
                <div className="mt-4 grid gap-3">
                  {hpiChecks.length ? (
                    hpiChecks.map((item) => (
                      <div
                        key={item.label}
                        className="rounded-xl border border-slate-200 bg-white p-3"
                      >
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          {item.label}
                        </div>
                        <div className="mt-1 text-sm font-semibold text-slate-950">
                          {renderHpiDisplayValue(item.value)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
                      HPI summary available.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-red-200 bg-red-50/50 p-4 print:hidden">
        <div className="text-sm font-semibold text-slate-950">
          Save access to this report
        </div>

        <div className="mt-1 text-sm text-slate-700">
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

        <div className="mt-2 text-sm text-slate-700">
          If you do not register or download your report, you may not be able to
          access it again after that 30-day period has ended.
        </div>

        {!ownerUserId ? (
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href={registerUrl} className="btn-primary">
              Create account to save report
            </Link>

            <Link href={loginUrl} className="btn-outline">
              Log in to save report
            </Link>
          </div>
        ) : userId === ownerUserId ? (
          <div className="mt-4 inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-800">
            This report is linked to your account
          </div>
        ) : null}
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-950">
          Specific Risks
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-700">
          Tick an item if the seller can prove it has already been addressed.
          The exposure total above will update automatically.
        </p>
      </div>

      <div className="mt-5 space-y-8">
        <section>
          <div className="mb-4 flex items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-slate-950">
              Service exposure items
            </h3>
            <div className="text-sm text-slate-600">
              {serviceRiskItems.length} item
              {serviceRiskItems.length === 1 ? "" : "s"}
            </div>
          </div>

          {serviceRiskItems.length ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {serviceRiskItems.map((item, index) => {
                const key = getItemKey(item, index);
                const addressed = !!addressedIds[key];

                return (
                  <div
                    key={`${item?.item_id ?? "service"}-${index}`}
                    className={`rounded-2xl border p-5 shadow-sm transition ${itemTone(
                      item,
                      addressed
                    )}`}
                  >
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div>
                        <div
                          className={`text-lg font-bold tracking-tight ${
                            addressed ? "text-emerald-900" : "text-slate-950"
                          }`}
                        >
                          {item?.label ?? "Flagged item"}
                        </div>
                        <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          {String(item?.category ?? "service").replace(
                            /_/g,
                            " "
                          )}
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-right">
                        <div className="text-sm font-semibold text-slate-950">
                          {money(Number(item?.cost_low ?? 0))} –{" "}
                          {money(Number(item?.cost_high ?? 0))}
                        </div>
                        <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                          likely exposure
                        </div>
                      </div>
                    </div>

                    <label className="mb-4 flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white/80 px-3 py-3">
                      <input
                        type="checkbox"
                        checked={addressed}
                        onChange={() => toggleAddressed(key)}
                        className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div>
                        <div className="text-sm font-semibold text-slate-950">
                          Mark as addressed by seller
                        </div>
                        <div className="text-xs text-slate-600">
                          Tick this if the seller has proof this item was fixed
                          or completed.
                        </div>
                      </div>
                    </label>

                    {addressed ? (
                      <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">
                        This item has been excluded from the live exposure total.
                      </div>
                    ) : null}

                    {item?.why_flagged ? (
                      <p className="mt-4 text-sm leading-6 text-slate-700">
                        <span className="font-semibold text-slate-950">
                          Why flagged:
                        </span>{" "}
                        {item.why_flagged}
                      </p>
                    ) : null}

                    {item?.why_it_matters ? (
                      <p className="mt-3 text-sm leading-6 text-slate-700">
                        <span className="font-semibold text-slate-950">
                          Why it matters:
                        </span>{" "}
                        {item.why_it_matters}
                      </p>
                    ) : null}

                    {Array.isArray(item?.questions_to_ask) &&
                    item.questions_to_ask.length ? (
                      <div className="mt-4">
                        <div className="text-sm font-semibold text-slate-950">
                          Questions to ask
                        </div>
                        <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-700">
                          {item.questions_to_ask.map((q: string, i: number) => (
                            <li key={i}>• {q}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {Array.isArray(item?.red_flags) && item.red_flags.length ? (
                      <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3">
                        <div className="text-sm font-semibold text-slate-950">
                          Red flags
                        </div>
                        <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-700">
                          {item.red_flags.map((rf: string, i: number) => (
                            <li key={i}>• {rf}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-700">
              No service exposure items were listed in this report.
            </div>
          )}
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-slate-950">
              MoT advisory and history risks
            </h3>
            <div className="text-sm text-slate-600">
              {motRiskItems.length} item
              {motRiskItems.length === 1 ? "" : "s"}
            </div>
          </div>

          {motRiskItems.length ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {motRiskItems.map((item, index) => {
                const key = getItemKey(item, serviceRiskItems.length + index);
                const addressed = !!addressedIds[key];
                const isRepeatPatternItem =
                  item.item_id === "mot_repeat_advisories" ||
                  String(item.label ?? "")
                    .toLowerCase()
                    .includes("recurring advisory pattern");

                return (
                  <div
                    key={`${item?.item_id ?? "mot"}-${index}`}
                    className={`rounded-2xl border p-5 shadow-sm transition ${itemTone(
                      item,
                      addressed
                    )}`}
                  >
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div>
                        <div
                          className={`text-lg font-bold tracking-tight ${
                            addressed ? "text-emerald-900" : "text-slate-950"
                          }`}
                        >
                          {item?.label ?? "MoT history item"}
                        </div>
                        <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          MoT-derived risk
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-right">
                        <div className="text-sm font-semibold text-slate-950">
                          {money(Number(item?.cost_low ?? 0))} –{" "}
                          {money(Number(item?.cost_high ?? 0))}
                        </div>
                        <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                          likely exposure
                        </div>
                      </div>
                    </div>

                    <label className="mb-4 flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white/80 px-3 py-3">
                      <input
                        type="checkbox"
                        checked={addressed}
                        onChange={() => toggleAddressed(key)}
                        className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div>
                        <div className="text-sm font-semibold text-slate-950">
                          Mark as addressed by seller
                        </div>
                        <div className="text-xs text-slate-600">
                          Tick this if the seller has proof this issue was
                          repaired or resolved.
                        </div>
                      </div>
                    </label>

                    {addressed ? (
                      <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">
                        This item has been excluded from the live exposure total.
                      </div>
                    ) : null}

                    {item?.why_flagged ? (
                      <p className="mt-4 text-sm leading-6 text-slate-700">
                        <span className="font-semibold text-slate-950">
                          Why flagged:
                        </span>{" "}
                        {item.why_flagged}
                      </p>
                    ) : null}

                    {isRepeatPatternItem && repeatPatternLabels.length ? (
                      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/70 p-4">
                        <div className="text-sm font-semibold text-slate-950">
                          Pattern categories identified
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {repeatPatternLabels.map((label) => (
                            <span
                              key={label}
                              className="inline-flex items-center rounded-full border border-amber-200 bg-white px-3 py-1 text-xs font-semibold text-amber-900"
                            >
                              {label}
                            </span>
                          ))}
                        </div>

                        {repeatPatternDetails.length ? (
                          <div className="mt-4 space-y-2">
                            {repeatPatternDetails.map((detail, detailIndex) => (
                              <div
                                key={`${detail.text ?? "repeat"}-${detailIndex}`}
                                className="rounded-lg border border-amber-100 bg-white px-3 py-3"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="text-sm font-semibold text-slate-950">
                                    {detail.patternLabel ?? "Pattern"}
                                  </div>
                                  <div className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                                    Seen {detail.count ?? 0} times
                                  </div>
                                </div>
                                <div className="mt-2 text-sm leading-6 text-slate-700">
                                  {detail.text ?? "Repeated advisory wording detected."}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ) : null}

                    {item?.why_it_matters ? (
                      <p className="mt-3 text-sm leading-6 text-slate-700">
                        <span className="font-semibold text-slate-950">
                          Why it matters:
                        </span>{" "}
                        {item.why_it_matters}
                      </p>
                    ) : null}

                    {Array.isArray(item?.questions_to_ask) &&
                    item.questions_to_ask.length ? (
                      <div className="mt-4">
                        <div className="text-sm font-semibold text-slate-950">
                          Questions to ask
                        </div>
                        <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-700">
                          {item.questions_to_ask.map((q: string, i: number) => (
                            <li key={i}>• {q}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {Array.isArray(item?.red_flags) && item.red_flags.length ? (
                      <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3">
                        <div className="text-sm font-semibold text-slate-950">
                          Red flags
                        </div>
                        <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-700">
                          {item.red_flags.map((rf: string, i: number) => (
                            <li key={i}>• {rf}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-700">
              No MoT advisory pattern risks were listed in this report.
            </div>
          )}
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-slate-950">
              Known model issues
            </h3>
            <div className="text-sm text-slate-600">
              {knownModelIssues.length} item
              {knownModelIssues.length === 1 ? "" : "s"}
            </div>
          </div>

          {knownModelIssues.length ? (
            <>
              <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-700">
                These are model-specific risks associated with this vehicle type,
                engine family or drivetrain. They do not necessarily mean the
                issue is present on this car, but they are worth checking before
                purchase.
                {knownModelIssueExposureLow !== null &&
                knownModelIssueExposureHigh !== null ? (
                  <div className="mt-2 font-semibold text-slate-950">
                    Weighted exposure included above:{" "}
                    {money(knownModelIssueExposureLow)} –{" "}
                    {money(knownModelIssueExposureHigh)}
                  </div>
                ) : null}
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                {knownModelIssues.map((item, index) => {
                  const key = getItemKey(
                    item,
                    serviceRiskItems.length + motRiskItems.length + index
                  );
                  const addressed = !!addressedIds[key];

                  return (
                    <div
                      key={`${item?.issue_code ?? item?.item_id ?? "known"}-${index}`}
                      className={`rounded-2xl border p-5 shadow-sm transition ${itemTone(
                        item,
                        addressed
                      )}`}
                    >
                      <div className="mb-4 flex items-start justify-between gap-4">
                        <div>
                          <div
                            className={`text-lg font-bold tracking-tight ${
                              addressed ? "text-emerald-900" : "text-slate-950"
                            }`}
                          >
                            {item?.label ?? "Known issue"}
                          </div>

                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-700">
                              {String(item?.category ?? "known issue").replace(
                                /_/g,
                                " "
                              )}
                            </span>

                            <span
                              className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${matchConfidencePill(
                                item.match_confidence
                              )}`}
                            >
                              {matchConfidenceLabel(item.match_confidence)}
                            </span>

                            <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                              {matchBasisLabel(item.match_basis)}
                            </span>
                          </div>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-right">
                          <div className="text-sm font-semibold text-slate-950">
                            {money(Number(item?.cost_low ?? 0))} –{" "}
                            {money(Number(item?.cost_high ?? 0))}
                          </div>
                          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                            indicative cost range
                          </div>
                        </div>
                      </div>

                      <label className="mb-4 flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white/80 px-3 py-3">
                        <input
                          type="checkbox"
                          checked={addressed}
                          onChange={() => toggleAddressed(key)}
                          className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <div>
                          <div className="text-sm font-semibold text-slate-950">
                            Mark as addressed by seller
                          </div>
                          <div className="text-xs text-slate-600">
                            Tick this if the seller has proof this known issue
                            has already been repaired, prevented or checked.
                          </div>
                        </div>
                      </label>

                      {addressed ? (
                        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">
                          This item has been excluded from the live exposure total.
                        </div>
                      ) : null}

                      {item?.why_flagged ? (
                        <p className="mt-4 text-sm leading-6 text-slate-700">
                          <span className="font-semibold text-slate-950">
                            Why flagged:
                          </span>{" "}
                          {item.why_flagged}
                        </p>
                      ) : null}

                      {item?.why_it_matters ? (
                        <p className="mt-3 text-sm leading-6 text-slate-700">
                          <span className="font-semibold text-slate-950">
                            Why it matters:
                          </span>{" "}
                          {item.why_it_matters}
                        </p>
                      ) : null}

                      {typeof item?.probability_score === "number" ? (
                        <div className="mt-3 text-xs font-medium text-slate-600">
                          Relevance score: {Math.round(item.probability_score * 100)}%
                        </div>
                      ) : null}

                      {Array.isArray(item?.questions_to_ask) &&
                      item.questions_to_ask.length ? (
                        <div className="mt-4">
                          <div className="text-sm font-semibold text-slate-950">
                            Questions to ask
                          </div>
                          <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-700">
                            {item.questions_to_ask.map((q: string, i: number) => (
                              <li key={i}>• {q}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}

                      {Array.isArray(item?.red_flags) && item.red_flags.length ? (
                        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3">
                          <div className="text-sm font-semibold text-slate-950">
                            Red flags
                          </div>
                          <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-700">
                            {item.red_flags.map((rf: string, i: number) => (
                              <li key={i}>• {rf}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-700">
              No model-specific issues were listed in this report.
            </div>
          )}
        </section>
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
        AutoAudit provides guidance only and is not a substitute for a
        mechanical inspection.
      </div>
    </div>
  );
}