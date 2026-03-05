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
 * Risk score mapping:
 * We want a slider that doesn't hit 100/100 too easily for typical UK used-car cases.
 * This is a piecewise curve:
 * - up to EXPOSURE_P50: 0..50
 * - EXPOSURE_P50..EXPOSURE_P90: 50..90
 * - above EXPOSURE_P90: 90..100 (slowly)
 */
const EXPOSURE_P50 = 1200; // ~50/100 around £1.2k
const EXPOSURE_P90 = 3000; // ~90/100 around £3k

function computeRiskScoreFromExposureHigh(exposureHigh: number) {
  if (exposureHigh <= 0) return 0;

  if (exposureHigh <= EXPOSURE_P50) {
    return clamp(Math.round((exposureHigh / EXPOSURE_P50) * 50), 0, 50);
  }

  if (exposureHigh <= EXPOSURE_P90) {
    const t = (exposureHigh - EXPOSURE_P50) / (EXPOSURE_P90 - EXPOSURE_P50); // 0..1
    return clamp(Math.round(50 + t * 40), 50, 90);
  }

  // Above P90, asymptotically approach 100
  const extra = exposureHigh - EXPOSURE_P90;
  const bump = Math.round(10 * (1 - Math.exp(-extra / 4000))); // 0..10
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
  // Backwards compatible: older pages may still pass riskLevel; we ignore it on purpose.
  // (Keeping this prevents build failures while you remove the prop from call-sites.)
  riskLevel: _ignoredRiskLevel,
}: {
  low: number;
  high: number;
  riskLevel?: string | null;
}) {
  const riskScore = computeRiskScoreFromExposureHigh(high);
  const riskLevel = computeRiskLevelFromScore(riskScore);
  const mid = Math.round((low + high) / 2);

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

      {/* Credibility line (small tweak) */}
      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
        <span>
          <span className="font-semibold text-slate-700">Most likely:</span>{" "}
          {money(mid)}
        </span>
        <span>
          <span className="font-semibold text-slate-700">Worst-case:</span>{" "}
          {money(high)}
        </span>
        <span className="text-slate-500">Near-term estimate (typical parts + labour)</span>
      </div>

      {/* Slider with marker */}
      <div className="mt-3">
        <div className="relative h-2 w-full rounded-full bg-slate-200">
          {/* Fill */}
          <div
            className="absolute left-0 top-0 h-2 rounded-full bg-slate-900 transition-all"
            style={{ width: `${riskScore}%` }}
            aria-label={`Risk score ${riskScore} out of 100`}
          />

          {/* Marker / thumb */}
          <div
            className="absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-white border border-slate-400 shadow-sm"
            style={{ left: `calc(${riskScore}% - 8px)` }} // 8px = half thumb width
            aria-hidden="true"
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