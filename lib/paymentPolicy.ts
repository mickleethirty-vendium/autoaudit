import { isLikelyUkRegistration } from "./vehicleCheck";

export function historyEligible(registration: unknown): boolean {
  return typeof registration === "string" && isLikelyUkRegistration(registration);
}

type PaymentSession = {
  mode?: string | null;
  payment_status?: string;
  metadata?: Record<string, string> | null;
};

// Completion describes the checkout UI, not settlement. Only a paid payment
// session for this report and one of our products grants access.
export function paidEntitlements(session: PaymentSession, reportId: string) {
  const tier = session.metadata?.checkout_tier;
  if (session.mode !== "payment" || session.payment_status !== "paid" ||
      session.metadata?.report_id !== reportId ||
      !["report", "report_plus_hpi", "hpi_upgrade"].includes(tier || "")) {
    return null;
  }
  return { core: true, history: tier !== "report" };
}

export function checkoutEligibility(
  tier: string,
  report: { registration?: unknown; is_paid?: boolean },
) {
  if (tier !== "report" && !historyEligible(report.registration)) {
    return "History checks require a valid registration. The Core Report is still available.";
  }
  if (tier === "hpi_upgrade" && report.is_paid !== true) {
    return "The HPI upgrade requires an existing Core Report. Please open your paid report first.";
  }
  return null;
}
