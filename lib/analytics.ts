"use client";

import { track } from "@vercel/analytics";

// Centralised event tracking
export function trackEvent(
  event: string,
  data?: Record<string, string | number | boolean>
) {
  try {
    track(event, data);
  } catch (err) {
    // Fail silently — never break UX for analytics
    console.error("Analytics error:", err);
  }
}

/**
 * Standardised events (so we don’t end up with messy naming later)
 */

export const AnalyticsEvents = {
  // Funnel
  SAMPLE_REPORT_VIEWED: "sample_report_viewed",
  SAMPLE_REPORT_CTA_CLICKED: "sample_report_cta_clicked",

  HOMEPAGE_REG_SUBMITTED: "homepage_reg_submitted",
  SEO_REG_SUBMITTED: "seo_reg_submitted",

  SNAPSHOT_VIEWED: "snapshot_viewed",

  CHECKOUT_STARTED_CORE: "checkout_started_core",
  CHECKOUT_STARTED_BUNDLE: "checkout_started_bundle",

  PAYMENT_COMPLETED: "payment_completed",
  PAID_REPORT_VIEWED: "paid_report_viewed",

  // Engagement
  MANUAL_CHECK_CLICKED: "manual_check_clicked",
  PRICING_VIEWED: "pricing_viewed",

  HPI_UPGRADE_CLICKED: "hpi_upgrade_clicked",
  PDF_DOWNLOADED: "pdf_downloaded",
};