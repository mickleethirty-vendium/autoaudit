"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { beginAnalyticsVisit, initialiseAnalytics } from "@/lib/analytics";

export default function AnalyticsProvider() {
  const pathname = usePathname();
  const params = useSearchParams();
  useEffect(() => {
    beginAnalyticsVisit();
    initialiseAnalytics();
  }, [pathname, params]);
  return null;
}
