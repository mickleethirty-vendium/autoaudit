"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AnalyticsEvents, trackEvent } from "@/lib/analytics";

export default function SampleReportAnalytics() {
  useEffect(() => {
    trackEvent(AnalyticsEvents.SAMPLE_REPORT_VIEWED, {
      page: "sample-report",
    });
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[70] border-t border-slate-300 bg-white/95 px-3 py-2.5 backdrop-blur sm:bottom-5 sm:left-auto sm:right-5 sm:w-auto sm:rounded-2xl sm:border sm:shadow-lg">
      <Link
        href="/check-car-by-registration"
        onClick={() =>
          trackEvent(AnalyticsEvents.SAMPLE_REPORT_CTA_CLICKED, {
            page: "sample-report",
            source: "sticky_cta",
          })
        }
        className="btn-primary block w-full text-center sm:w-auto"
      >
        Check a real car
      </Link>
    </div>
  );
}