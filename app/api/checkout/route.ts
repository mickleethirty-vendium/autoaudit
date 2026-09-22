import { checkoutReturnPath, checkoutSource } from "@/lib/checkout";
import { funnelParams } from "@/lib/vehicleCheck";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase";
import { checkoutEligibility } from "@/lib/paymentPolicy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function mustGetEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

function appUrl() {
  const explicit =
    process.env.NEXT_PUBLIC_APP_URL?.trim() || process.env.APP_URL?.trim();

  if (explicit) {
    return explicit.replace(/\/+$/, "");
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) {
    return `https://${vercelUrl.replace(/\/+$/, "")}`;
  }

  return "http://localhost:3000";
}

const stripe = new Stripe(mustGetEnv("STRIPE_SECRET_KEY"), {
  apiVersion: "2024-06-20",
  timeout: 20000,
  maxNetworkRetries: 0,
});

type CheckoutTier = "report" | "hpi_upgrade" | "report_plus_hpi";

function parseTier(value: string | null): CheckoutTier {
  if (value === "hpi_upgrade") return "hpi_upgrade";
  if (value === "report_plus_hpi") return "report_plus_hpi";
  return "report";
}

function isLikelyValidReportId(value: string | null): value is string {
  if (!value) return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  return /^[a-zA-Z0-9_-]{6,}$/.test(trimmed);
}

function assertValidStripePriceId(value: string, envName: string) {
  if (!/^price_[a-zA-Z0-9]+$/.test(value)) {
    throw new Error(`Invalid Stripe price ID in ${envName}`);
  }
  return value;
}

function getStripePriceIdForTier(tier: CheckoutTier) {
  if (tier === "hpi_upgrade") {
    return assertValidStripePriceId(
      mustGetEnv("STRIPE_HPI_UPGRADE_PRICE_ID"),
      "STRIPE_HPI_UPGRADE_PRICE_ID",
    );
  }

  if (tier === "report_plus_hpi") {
    return assertValidStripePriceId(
      mustGetEnv("STRIPE_REPORT_PLUS_HPI_PRICE_ID"),
      "STRIPE_REPORT_PLUS_HPI_PRICE_ID",
    );
  }

  return assertValidStripePriceId(
    mustGetEnv("STRIPE_REPORT_PRICE_ID"),
    "STRIPE_REPORT_PRICE_ID",
  );
}

function getSuccessUrl(reportId: string, tier: CheckoutTier) {
  return `${appUrl()}/report/${reportId}?session_id={CHECKOUT_SESSION_ID}&tier=${tier}`;
}

function getCancelUrl(reportId: string, tier: CheckoutTier) {
  return `${appUrl()}${checkoutReturnPath(reportId, tier)}`;
}

function getProductName(tier: CheckoutTier) {
  if (tier === "hpi_upgrade") return "HPI Upgrade";
  if (tier === "report_plus_hpi") return "Report + HPI Bundle";
  return "Core Report";
}

function getFunnelProductKey(tier: CheckoutTier) {
  if (tier === "hpi_upgrade") return "hpi_upgrade";
  if (tier === "report_plus_hpi") return "full_bundle";
  return "core_report";
}

function getUnlockFlags(tier: CheckoutTier) {
  return {
    unlock_report:
      tier === "report" ||
      tier === "hpi_upgrade" ||
      tier === "report_plus_hpi",
    unlock_hpi: tier === "hpi_upgrade" || tier === "report_plus_hpi",
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const reportId = searchParams.get("report_id")?.trim() ?? null;
    const tier = parseTier(searchParams.get("tier"));
    const source = checkoutSource(searchParams.get("source"));
    const funnel = funnelParams(searchParams);

    if (!isLikelyValidReportId(reportId)) {
      return NextResponse.json(
        { error: "Missing or invalid report_id" },
        { status: 400 },
      );
    }

    const { data: report, error: reportError } = await supabaseAdmin
      .from("reports")
      .select("registration, is_paid")
      .eq("id", reportId)
      .abortSignal(AbortSignal.timeout(10000))
      .maybeSingle();
    if (reportError) return NextResponse.json({ error: "Unable to check report eligibility. Please try again." }, { status: 503 });
    if (!report) return NextResponse.json({ error: "Report not found" }, { status: 404 });
    const eligibilityError = checkoutEligibility(tier, report);
    if (eligibilityError) return NextResponse.json({ error: eligibilityError }, { status: 400 });

    const suffix = funnel.size ? `&${funnel}` : "";
    const successUrl = getSuccessUrl(reportId, tier) + suffix;
    const cancelUrl = getCancelUrl(reportId, tier) + suffix;
    const priceId = getStripePriceIdForTier(tier);
    const flags = getUnlockFlags(tier);
    const productName = getProductName(tier);
    const funnelProductKey = getFunnelProductKey(tier);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_creation: "if_required",
      metadata: {
        report_id: reportId,
        checkout_tier: tier,
        product_name: productName,
        funnel_product_key: funnelProductKey,
        checkout_source: source,
        funnel_source: funnel.get("f_source") || "unknown",
        landing_type: funnel.get("f_landing") || "unknown",
        entry_variant: funnel.get("f_variant") || "unknown",
        entry_position: funnel.get("f_position") || "unknown",
        unlock_report: String(flags.unlock_report),
        unlock_hpi: String(flags.unlock_hpi),
      },
    });

    if (!session.url) {
      console.error("Stripe checkout session created without URL", {
        reportId,
        tier,
        source,
        sessionId: session.id,
      });

      return NextResponse.json(
        { error: "Failed to create Stripe checkout session" },
        { status: 500 },
      );
    }

    if (req.headers.get("accept")?.includes("application/json")) {
      return NextResponse.json({ url: session.url, created: true }, { headers: { "Cache-Control": "no-store" } });
    }
    return NextResponse.redirect(session.url);
  } catch (error: any) {
    console.error("Stripe checkout error:", {
      message: error?.message ?? "Unknown error",
      type: error?.type ?? null,
      code: error?.code ?? null,
      raw: error,
    });

    return NextResponse.json(
      { error: "Unable to start checkout" },
      { status: 500 },
    );
  }
}
