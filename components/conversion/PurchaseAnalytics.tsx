"use client";
import { useEffect } from "react";
import { AnalyticsEvents, trackEvent } from "@/lib/analytics";
import { CheckoutTier } from "@/lib/checkout";
// Local deduplication only. Neither session ID nor its digest goes to analytics.
const seen = new Set<string>();
export default function PurchaseAnalytics({ sessionId, tier, context = {} }: { sessionId: string; tier: CheckoutTier; context?: Record<string, string> }) {
  const serializedContext = JSON.stringify(context);
  useEffect(() => {
    let cancelled = false;
    async function record() {
      const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(sessionId));
      const key = `aa_purchase_${Array.from(new Uint8Array(digest), (n) => n.toString(16).padStart(2, "0")).join("")}`;
      if (cancelled || seen.has(key)) return;
      try { if (localStorage.getItem(key)) return; } catch {}
      seen.add(key);
      trackEvent(AnalyticsEvents.PURCHASE_COMPLETED, { page_type: "report", tier, ...JSON.parse(serializedContext) });
      try { localStorage.setItem(key, "1"); } catch {}
    }
    void record().catch(() => {});
    return () => { cancelled = true; };
  }, [sessionId, tier, serializedContext]);
  return null;
}
