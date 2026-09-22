import { pageTypeForPath } from "./vehicleCheck";
export const AnalyticsEvents = {
  CTA_VIEW: "cta_view", CTA_CLICK: "cta_click", VRM_SUBMITTED: "vrm_submitted",
  VEHICLE_FOUND: "vehicle_found", SNAPSHOT_VIEWED: "snapshot_viewed",
  CORE_CHECKOUT_STARTED: "core_report_checkout_started", BUNDLE_CHECKOUT_STARTED: "bundle_checkout_started",
  HPI_CHECKOUT_STARTED: "hpi_upgrade_checkout_started", CHECKOUT_FAILED: "checkout_failed",
  PURCHASE_COMPLETED: "purchase_completed", PAID_REPORT_VIEWED: "paid_report_viewed",
  SAMPLE_REPORT_VIEWED: "sample_report_viewed", SAMPLE_REPORT_CTA_CLICKED: "sample_report_cta_clicked",
  MANUAL_CHECK_CLICKED: "manual_check_clicked", PRICING_VIEWED: "pricing_viewed",
  LOOKUP_DETAILS_VIEWED: "lookup_details_viewed", LOOKUP_STARTED: "lookup_started", LOOKUP_FAILED: "lookup_failed",
  LOOKUP_DETAILS_FAILED: "lookup_details_failed", LOOKUP_DETAILS_SUBMITTED: "lookup_details_submitted",
  FREE_PREVIEW_CREATED: "free_preview_created", LOOKUP_VEHICLE_RESET: "lookup_vehicle_reset",
  SELLER_SUMMARY_CLICKED: "seller_summary_clicked", PRINT_REQUESTED: "print_requested",
  PAYMENT_SUCCESS_MISSING_SESSION: "payment_success_missing_session", PAYMENT_SUCCESS_PAGE_VIEWED: "payment_success_page_viewed",
  PAYMENT_UNLOCK_FAILED: "payment_unlock_failed", PAYMENT_UNLOCK_SUCCEEDED: "payment_unlock_succeeded",
  PAID_REPORT_VIEW_CLICKED: "paid_report_view_clicked",
} as const;
export type AnalyticsEvent = typeof AnalyticsEvents[keyof typeof AnalyticsEvents];
export type EventData = Record<string, string | number | boolean>;
const keys = new Set(["page_type", "landing_type", "funnel_source", "entry_variant", "entry_position", "entry_make", "entry_model", "cta_variant", "cta_position", "make", "model", "tier", "source", "location", "reason", "sample", "hpi_unlocked", "has_prefilled_reg", "has_prefilled_asking_price", "has_make", "has_model", "has_year", "has_mot_status", "has_asking_price", "has_engine_size", "transmission", "fuel"]);
export function safeEventData(data: EventData = {}): EventData {
  if (data.page) { data = { ...data, page_type: data.page_type || data.page }; }
  return Object.fromEntries(Object.entries(data).filter(([key, value]) => keys.has(key) &&
    (typeof value === "boolean" || typeof value === "number" && Number.isFinite(value) || typeof value === "string" && value.length <= 80 && /^[a-zA-Z0-9 _.-]+$/.test(value))));
}
export function safeAnalyticsUrl(raw: string) {
  const url = new URL(raw, "https://autoaudit.uk");
  const type = pageTypeForPath(url.pathname);
  if (["preview", "report", "other"].includes(type)) url.pathname = `/${type}`;
  url.search = ""; url.hash = "";
  return url.toString();
}
