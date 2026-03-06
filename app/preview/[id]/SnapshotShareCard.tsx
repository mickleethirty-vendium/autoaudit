"use client";

import { useMemo, useState } from "react";

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

export default function SnapshotShareCard({
  exposureLow,
  exposureHigh,
  checkoutUrl,
  priceLabel,
}: {
  exposureLow: number;
  exposureHigh: number;
  checkoutUrl: string;
  priceLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  const summaryText = useMemo(() => {
    return `Based on this AutoAudit snapshot, this vehicle appears to carry around ${money(
      exposureLow
    )}–${money(
      exposureHigh
    )} of near-term maintenance exposure. That may justify a price conversation before purchase.`;
  }, [exposureLow, exposureHigh]);

  async function handleCopySummary() {
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
      <div className="text-base font-semibold text-emerald-900">
        Message you can send to the seller
      </div>

      <div className="mt-2 text-sm text-emerald-900/90">
        {summaryText}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleCopySummary}
          className="inline-flex items-center rounded-lg border bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
        >
          {copied ? "Copied" : "Copy summary"}
        </button>

        <a href={checkoutUrl} className="btn-primary">
          Unlock full report · {priceLabel}
        </a>
      </div>
    </div>
  );
}