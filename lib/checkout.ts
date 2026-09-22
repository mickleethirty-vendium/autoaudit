import { funnelParams } from "./vehicleCheck";

export type CheckoutTier = "report" | "report_plus_hpi" | "hpi_upgrade";
export function checkoutTier(value: string | null): CheckoutTier {
  return value === "report_plus_hpi" || value === "hpi_upgrade" ? value : "report";
}
export function checkoutSource(value: string | null) {
  return value && ["preview", "report", "sample_report", "pricing"].includes(value) ? value : "unknown";
}
export function checkoutReturnPath(reportId: string, tier: CheckoutTier) {
  return `/${tier === "hpi_upgrade" ? "report" : "preview"}/${encodeURIComponent(reportId)}?checkout_cancelled=1&tier=${tier}`;
}
export function checkoutStartedEvent(tier: CheckoutTier) {
  return tier === "report" ? "core_report_checkout_started" : tier === "report_plus_hpi" ? "bundle_checkout_started" : "hpi_upgrade_checkout_started";
}
export function checkoutRequestUrl(href: string, context: Record<string, string | number | boolean>) {
  const url = new URL(href, "https://autoaudit.uk");
  const input = new URLSearchParams();
  for (const [key, field] of [["f_source", "funnel_source"], ["f_landing", "landing_type"], ["f_variant", "cta_variant"], ["f_position", "cta_position"]]) {
    if (typeof context[field] === "string") input.set(key, String(context[field]));
  }
  // Explicit checkout URL context wins over any caller fallback.
  funnelParams(input).forEach((value, key) => { if (!url.searchParams.has(key)) url.searchParams.set(key, value); });
  return `${url.pathname}${url.search}`;
}
