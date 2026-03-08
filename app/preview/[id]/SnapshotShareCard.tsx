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
  previewUrl,
}: {
  exposureLow: number;
  exposureHigh: number;
  checkoutUrl: string;
  priceLabel: string;
  previewUrl: string;
}) {
  const [copied, setCopied] = useState(false);

  const shareMessage = useMemo(() => {
    const absolutePreviewUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}${previewUrl}`
        : previewUrl;

    return `Hi — I ran a quick AutoAudit snapshot for this vehicle.

It suggests around ${money(
      exposureLow
    )}–${money(
      exposureHigh
    )} of potential near-term maintenance risk based on age, mileage and MOT history.

Here’s the snapshot:
${absolutePreviewUrl}

Would you consider adjusting the price to reflect that?`;
  }, [exposureLow, exposureHigh, previewUrl]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
      <div className="text-base font-semibold text-emerald-900">
        Message you can send to the seller
      </div>

      <div className="mt-2 text-sm text-emerald-900/90 whitespace-pre-line">
        {shareMessage}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center rounded-lg border bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
        >
          {copied ? "Copied" : "Send snapshot to seller"}
        </button>

        <a href={checkoutUrl} className="btn-primary">
          Unlock full report · {priceLabel}
        </a>
      </div>
    </div>
  );
}