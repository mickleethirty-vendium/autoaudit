// Preserve the lookup API's permissive check; DVLA resolves actual validity,
// including older, personalised and Northern Irish registrations.
export function normaliseRegistration(value: string) {
  return value.replace(/\s+/g, "").toUpperCase();
}
export function isLikelyUkRegistration(value: string) {
  return /^[A-Z0-9]{2,8}$/.test(normaliseRegistration(value));
}
export function formatRegistration(value: string) {
  const reg = normaliseRegistration(value);
  return /^[A-Z]{2}\d{2}[A-Z]{3}$/.test(reg) ? `${reg.slice(0, 4)} ${reg.slice(4)}` : reg;
}
export const pageTypes = ["homepage", "common_problems", "model_guide", "make_hub", "cars_hub", "mot_advisory", "mot_model", "mot_hub", "buying_guide", "diagnostic", "registration", "check", "manual_check", "pricing", "how_it_works", "sample_report", "preview", "report", "success", "other"] as const;
export type PageType = typeof pageTypes[number];
export const intents = ["general", "common-problems", "mot-advisory", "buying-guide", "diagnostic"] as const;
export type Intent = typeof intents[number];
export const positions = ["early", "midpoint", "end", "hero", "inline", "sticky", "unlock_panel", "lookup", "upgrade", "overview_upgrade", "history_upgrade", "exposure", "core_card", "bundle_card", "report_end", "report_sticky"] as const;
export type Position = typeof positions[number];
export function pageTypeForPath(path: string): PageType {
  if (path === "/") return "homepage";
  if (path.endsWith("/common-problems")) return "common_problems";
  if (path.startsWith("/cars/")) return path.split("/").length === 4 ? "model_guide" : "make_hub";
  if (path === "/cars") return "cars_hub";
  if (path.startsWith("/mot-advisories/")) return path.split("/").length > 3 ? "mot_model" : "mot_advisory";
  if (path === "/mot-advisories") return "mot_hub";
  if (/^\/(best-|cheap|most-economical|lowest-road|used-car-buying|questions-to-ask)/.test(path)) return "buying_guide";
  if (path.startsWith("/preview/")) return "preview";
  if (path.startsWith("/report/")) return "report";
  const known: Record<string, PageType> = { "/check-car-by-registration": "registration", "/check": "check", "/manual-check": "manual_check", "/pricing": "pricing", "/how-it-works": "how_it_works", "/sample-report": "sample_report", "/success": "success" };
  return known[path] || "other";
}
// Categories only: never forward arbitrary URLs or marketing query strings.
export function funnelParams(input: URLSearchParams) {
  const result = new URLSearchParams();
  const allowed: Record<string, readonly string[]> = { f_source: pageTypes, f_landing: pageTypes, f_variant: intents, f_position: positions };
  for (const [key, values] of Object.entries(allowed)) {
    const value = input.get(key);
    if (value && values.includes(value)) result.set(key, value);
  }
  return result;
}
export function buildCheckUrl(registration: string, input = new URLSearchParams()) {
  const params = funnelParams(input);
  params.set("registration", normaliseRegistration(registration));
  const price = input.get("asking_price")?.replace(/,/g, "");
  if (price && /^\d+(\.\d{1,2})?$/.test(price) && Number(price) <= 1000000) params.set("asking_price", price);
  return `/check?${params}`;
}
