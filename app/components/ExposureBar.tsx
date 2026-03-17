"use client";

import React from "react";

function money(n: number) {
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `£${Math.round(n)}`;
  }
}

function titleCase(s: string) {
  return s
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function normaliseRiskLevel(value?: string | null): "low" | "medium" | "high" | null {
  const v = String(value ?? "").trim().toLowerCase();
  if (v === "low" || v === "medium" || v === "high") return v;
  return null;
}

function riskColor(risk: "low" | "medium" | "high") {
  if (risk === "low") return "bg-emerald-50 border-emerald-200 text-emerald-900";
  if (risk === "medium") return "bg-amber-50 border-amber-200 text-amber-900";
  return "bg-rose-50 border-rose-200 text-rose-900";
}

function fillColor(risk: "low" | "medium" | "high") {
  if (risk === "low") return "bg-gradient-to-r from-emerald-500 to-emerald-400";
  if (risk === "medium") return "bg-gradient-to-r from-amber-500 to-amber-400";
  return "bg-gradient-to-r from-rose-600 to-rose-400";
}

function glowColor(risk: "low" | "medium" | "high") {
  if (risk === "low") return "shadow-[0_0_0_4px_rgba(16,185,129,0.12)]";
  if (risk === "medium") return "shadow-[0_0_0_4px_rgba(245,158,11,0.14)]";
  return "shadow-[0_0_0_4px_rgba(225,29,72,0.16)]";
}

function markerInnerColor(risk: "low" | "medium" | "high") {
  if (risk === "low") return "bg-emerald-500";
  if (risk === "medium") return "bg-amber-500";
  return "bg-rose-600";
}

function verdictCopy(risk: "low" | "medium" | "high") {
  if (risk === "low") {
    return {
      label: "Lower repair exposure",
      helper: "Fewer immediate warning signs in the snapshot.",
    };
  }

  if (risk === "medium") {
    return {
      label: "Moderate repair exposure",
      helper: "Some near-term cost risk is worth checking in detail.",
    };
  }

  return {
    label: "Higher repair exposure",
    helper: "This looks more likely to carry meaningful near-term cost risk.",
  };
}

/**
 * Risk score mapping:
 * - up to EXPOSURE_P50: 0..50
 * - EXPOSURE_P50..EXPOSURE_P90: 50..90
 * - above EXPOSURE_P90: 90..100
 */
const EXPOSURE_P50 = 1200;
const EXPOSURE_P90 = 3000;

function computeRiskScoreFromExposureHigh(exposureHigh: number) {
  if (exposureHigh <= 0) return 0;

  if (exposureHigh <= EXPOSURE_P50) {
    return clamp(Math.round((exposureHigh / EXPOSURE_P50) * 50), 0, 50);
  }

  if (exposureHigh <= EXPOSURE_P90) {
    const t = (exposureHigh - EXPOSURE_P50) / (EXPOSURE_P90 - EXPOSURE_P50);
    return clamp(Math.round(50 + t * 40), 50, 90);
  }

  const extra = exposureHigh - EXPOSURE_P90;
  const bump = Math.round(10 * (1 - Math.exp(-extra / 4000)));
  return clamp(90 + bump, 90, 100);
}

function computeRiskLevelFromScore(score: number): "low" | "medium" | "high" {
  if (score >= 70) return "high";
  if (score >= 35) return "medium";
  return "low";
}

export default function ExposureBar({
  low,
  high,
  riskLevel,
}: {
  low: number;
  high: number;
  riskLevel?: string | null;
}) {
  const computedRiskScore = computeRiskScoreFromExposureHigh(high);
  const computedRiskLevel = computeRiskLevelFromScore(computedRiskScore);

  const resolvedRiskLevel = normaliseRiskLevel(riskLevel) ?? computedRiskLevel;
  const riskScore =
    normaliseRiskLevel(riskLevel) !== null
      ? computedRiskScore
      : computedRiskScore;

  const mid = Math.round((low + high) / 2);
  const verdict = verdictCopy(resolvedRiskLevel);
  const markerLeft = clamp(riskScore, 2, 98);

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
            {money(low)} – {money(high)}
          </div>
          <div className="mt-2 text-sm text-slate-600">
            Estimated near-term repair exposure
          </div>
        </div>

        <div
          className={[
            "inline-flex flex-col rounded-2xl border px-4 py-3 shadow-sm",
            riskColor(resolvedRiskLevel),
          ].join(" ")}
        >
          <span className="text-xs font-bold uppercase tracking-[0.16em] opacity-80">
            Snapshot verdict
          </span>
          <span className="mt-1 text-sm font-semibold">
            {verdict.label}
          </span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
        <span>
          <span className="font-semibold text-slate-800">Most likely:</span>{" "}
          {money(mid)}
        </span>
        <span>
          <span className="font-semibold text-slate-800">Upper estimate:</span>{" "}
          {money(high)}
        </span>
        <span className="text-slate-500">
          Typical parts + labour estimate
        </span>
      </div>

      <div className="mt-5">
        <div className="relative h-4 w-full overflow-hidden rounded-full border border-slate-200 bg-gradient-to-r from-emerald-100 via-amber-100 to-rose-100">
          <div
            className={[
              "absolute left-0 top-0 h-full rounded-full transition-all duration-700 ease-out",
              fillColor(resolvedRiskLevel),
            ].join(" ")}
            style={{ width: `${riskScore}%` }}
            aria-label={`Risk score ${riskScore} out of 100`}
          />

          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-full bg-[linear-gradient(90deg,rgba(255,255,255,0.22)_0%,rgba(255,255,255,0)_20%,rgba(255,255,255,0.10)_40%,rgba(255,255,255,0)_60%,rgba(255,255,255,0.08)_100%)]"
            aria-hidden="true"
          />

          <div
            className={[
              "absolute top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border-2 border-white bg-white transition-all duration-700 ease-out",
              glowColor(resolvedRiskLevel),
            ].join(" ")}
            style={{ left: `calc(${markerLeft}% - 12px)` }}
            aria-hidden="true"
          >
            <div
              className={[
                "absolute inset-1 rounded-full",
                markerInnerColor(resolvedRiskLevel),
              ].join(" ")}
            />
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
          <span>Lower risk</span>
          <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 font-semibold text-slate-800 shadow-sm">
            {riskScore}/100
          </span>
          <span>Higher risk</span>
        </div>
      </div>

      <div className="mt-3 text-sm text-slate-700">
        {verdict.helper}
      </div>
    </div>
  );
}