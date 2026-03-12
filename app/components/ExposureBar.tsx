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
  if (risk === "low") return "bg-white border-slate-300 text-slate-900";
  if (risk === "medium") return "bg-slate-50 border-slate-400 text-slate-900";
  return "bg-red-50 border-red-200 text-red-900";
}

function fillColor(risk: "low" | "medium" | "high") {
  if (risk === "low") return "bg-black";
  if (risk === "medium") return "bg-gradient-to-r from-black to-slate-500";
  return "bg-gradient-to-r from-black via-red-700 to-red-500";
}

function glowColor(risk: "low" | "medium" | "high") {
  if (risk === "low") return "shadow-[0_0_0_4px_rgba(15,23,42,0.08)]";
  if (risk === "medium") return "shadow-[0_0_0_4px_rgba(100,116,139,0.10)]";
  return "shadow-[0_0_0_4px_rgba(185,28,28,0.16)]";
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
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
        <div className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
          {money(low)} – {money(high)}
        </div>

        <span
          className={[
            "inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold shadow-sm",
            riskColor(riskLevel),
          ].join(" ")}
        >
          Risk: {titleCase(riskLevel)}
        </span>
      </div>

      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
        <span>
          <span className="font-semibold text-slate-800">Most likely:</span>{" "}
          {money(mid)}
        </span>
        <span>
          <span className="font-semibold text-slate-800">Worst-case:</span>{" "}
          {money(high)}
        </span>
        <span className="text-slate-500">
          Near-term estimate (typical parts + labour)
        </span>
      </div>

      <div className="mt-4">
        <div className="relative h-3 w-full overflow-hidden rounded-full border border-slate-200 bg-slate-100">
          <div
            className={[
              "absolute left-0 top-0 h-full rounded-full transition-all duration-700 ease-out",
              fillColor(riskLevel),
            ].join(" ")}
            style={{ width: `${riskScore}%` }}
            aria-label={`Risk score ${riskScore} out of 100`}
          />

          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-full bg-[linear-gradient(90deg,rgba(255,255,255,0.14)_0%,rgba(255,255,255,0)_20%,rgba(255,255,255,0.10)_40%,rgba(255,255,255,0)_60%,rgba(255,255,255,0.08)_100%)]"
            aria-hidden="true"
          />

          <div
            className={[
              "absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-2 border-white bg-white transition-all duration-700 ease-out",
              glowColor(riskLevel),
            ].join(" ")}
            style={{ left: `calc(${riskScore}% - 10px)` }}
            aria-hidden="true"
          >
            <div
              className={[
                "absolute inset-1 rounded-full",
                riskLevel === "high"
                  ? "bg-red-600"
                  : riskLevel === "medium"
                  ? "bg-slate-500"
                  : "bg-black",
              ].join(" ")}
            />
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
          <span>Lower</span>
          <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 font-semibold text-slate-800 shadow-sm">
            {riskScore}/100
          </span>
          <span>Higher</span>
        </div>
      </div>
    </div>
  );
}