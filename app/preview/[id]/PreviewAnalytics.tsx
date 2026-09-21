"use client";

import { useEffect } from "react";
import { AnalyticsEvents, trackEvent } from "@/lib/analytics";

type Props = {
  reportId: string;
  coreCheckoutUrl: string;
  bundleCheckoutUrl: string;
  reportPriceLabel: string;
  tier2TotalLabel: string;
  location: "hero" | "unlock_panel";
  exposureHigh: number | null;
  marketPosition: string | null;
  variant: "light" | "dark";
};

export default function PreviewAnalytics({
  reportId,
  coreCheckoutUrl,
  bundleCheckoutUrl,
  reportPriceLabel,
  tier2TotalLabel,
  location,
  exposureHigh,
  marketPosition,
  variant,
}: Props) {
  useEffect(() => {
    trackEvent("free_snapshot_viewed", {
      page: "preview",
      report_id: reportId,
      exposure_high: exposureHigh ?? -1,
      market_position: marketPosition ?? "unknown",
    });
  }, [reportId, exposureHigh, marketPosition]);

  function trackCheckout(tier: "core" | "bundle") {
    trackEvent("unlock_report_clicked", {
      page: "preview",
      location,
      tier,
      report_id: reportId,
    });

    trackEvent(
      tier === "core"
        ? AnalyticsEvents.CHECKOUT_STARTED_CORE
        : AnalyticsEvents.CHECKOUT_STARTED_BUNDLE,
      {
        page: "preview",
        location,
        report_id: reportId,
      },
    );
  }

  if (variant === "dark") {
    return (
      <div className="mt-3 grid grid-cols-1 gap-2">
        <a
          href={coreCheckoutUrl}
          onClick={() => trackCheckout("core")}
          className="btn-primary block w-full text-center"
        >
          Core report · {reportPriceLabel}
        </a>

        <a
          href={bundleCheckoutUrl}
          onClick={() => trackCheckout("bundle")}
          className="block w-full rounded-lg border border-white/15 bg-white/10 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/15"
        >
          Full bundle · {tier2TotalLabel}
        </a>
      </div>
    );
  }

  return (
    <div className="mt-3 flex flex-col gap-2 sm:flex-row">
      <a
        href={coreCheckoutUrl}
        onClick={() => trackCheckout("core")}
        className="btn-primary w-full text-center sm:w-auto"
      >
        Unlock core report · {reportPriceLabel}
      </a>

      <a
        href={bundleCheckoutUrl}
        onClick={() => trackCheckout("bundle")}
        className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
      >
        Full bundle · {tier2TotalLabel}
      </a>
    </div>
  );
}