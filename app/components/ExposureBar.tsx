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

function riskColor(risk: "low" | "medium" | "high") {
  if (risk === "low") return "bg-emerald-50 border-emerald-200 text-emerald-900";
  if (risk === "medium") return "bg-amber-50 border-amber-200 text-amber-900";
  return "bg-rose-50 border-rose-200 text-rose-900";
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/**
 * Single source of truth:
 * - Risk score drives the slider width
 * - Risk level is derived from that same score (so pill + slider cannot disagree)
 *
 * Tune MAX_EXPOSURE if you want the slider to feel “full” at a different £ amount.
 */
const MAX_EXPOSURE_FOR_100 = 2000; // <-- adjust if you want (e.g. 2500)

function computeRiskScoreFromExposureHigh(exposureHigh: number) {
  // 0..100 score based on high-end exposure
  return clamp(Math.round((exposureHigh / MAX_EXPOSURE_FOR_100) * 100), 0, 100);
}

function computeRiskLevelFromScore(score: number): "low" | "medium" | "high" {
  if (score >= 70) return "high";
  if (score >= 35) return "medium";
  return "low";
}

export default function ExposureBar({
  low,
  high,
}: {
  low: number;
  high: number;
  // NOTE: we intentionally do NOT trust an external riskLevel prop here,
  // because that’s how pill/slider drift happens.
}) {
  const riskScore = computeRiskScoreFromExposureHigh(high);
  const riskLevel = computeRiskLevelFromScore(riskScore);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="text-3xl font-extrabold text-slate-900">
          {money(low)} – {money(high)}
        </div>

        <span
          className={[
            "inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold bg-white",
            riskColor(riskLevel),
          ].join(" ")}
        >
          Risk: {titleCase(riskLevel)}
        </span>
      </div>

      {/* Slider */}
      <div className="mt-3">
        <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
          <div
            className="h-full bg-slate-900 transition-all"
            style={{ width: `${riskScore}%` }}
            aria-label={`Risk score ${riskScore} out of 100`}
          />
        </div>

        <div className="mt-2 flex justify-between text-xs text-slate-500">
          <span>Lower</span>
          <span>{riskScore}/100</span>
          <span>Higher</span>
        </div>
      </div>
    </div>
  );
}