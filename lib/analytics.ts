"use client";

import { inject, track } from "@vercel/analytics";
import { AnalyticsEvents, AnalyticsEvent, EventData, safeEventData, safeAnalyticsUrl } from "./analyticsPolicy";
import { funnelParams, pageTypeForPath, pageTypes } from "./vehicleCheck";
export { AnalyticsEvents };

let initialised = false;
let visit = "";
const impressions = new Set<string>();

export function landingType(fallback: string) {
  try {
    const stored = sessionStorage.getItem("aa_landing_type");
    if (stored && (pageTypes as readonly string[]).includes(stored)) return stored;
    sessionStorage.setItem("aa_landing_type", fallback);
  } catch {}
  return fallback;
}

export function beginAnalyticsVisit() {
  if (typeof window === "undefined") return;
  const next = window.location.pathname + window.location.search;
  if (visit !== next) {
    visit = next;
    impressions.clear();
    landingType(pageTypeForPath(window.location.pathname));
  }
}

export function claimImpression(key: string) {
  beginAnalyticsVisit();
  if (impressions.has(key)) return false;
  impressions.add(key);
  return true;
}

export function initialiseAnalytics() {
  if (initialised || typeof window === "undefined") return;
  try {
    inject({ beforeSend: (event) => {
      try { return { ...event, url: safeAnalyticsUrl(event.url) }; }
      catch { return null; }
    } });
    initialised = true;
  } catch {
    // An unavailable or failing SDK must not escape into React's lifecycle.
  }
}

// Journey categories live in the current URL, not a mutable last-check record.
// No registration, record ID or personal data is stored as analytics context.
export function readFunnel(input?: URLSearchParams): EventData {
  if (!input && typeof window === "undefined") return {};
  const params = funnelParams(input || new URLSearchParams(window.location.search));
  const data: EventData = {};
  for (const [key, field] of [["f_source", "funnel_source"], ["f_landing", "landing_type"], ["f_variant", "cta_variant"], ["f_position", "cta_position"]]) {
    const value = params.get(key);
    if (value) data[field] = value;
  }
  return data;
}

export function trackEvent(event: AnalyticsEvent, data: EventData = {}) {
  if (typeof window === "undefined") return;
  try {
    initialiseAnalytics();
    const journey = readFunnel();
    const context: EventData = {};
    if (journey.funnel_source) context.funnel_source = journey.funnel_source;
    if (journey.cta_variant) context.entry_variant = journey.cta_variant;
    if (journey.cta_position) context.entry_position = journey.cta_position;
    const landing = journey.landing_type || landingType(pageTypeForPath(window.location.pathname));
    track(event, safeEventData({ landing_type: landing, ...context, ...data }));
  } catch {
    // Telemetry is best-effort, never a dependency of conversion.
  }
}
