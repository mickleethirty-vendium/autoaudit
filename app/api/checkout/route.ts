import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

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
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.APP_URL?.trim();

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
      "STRIPE_HPI_UPGRADE_PRICE_ID"
    );
  }

  if (tier === "report_plus_hpi") {
    return assertValidStripePriceId(
      mustGetEnv("STRIPE_REPORT_PLUS_HPI_PRICE_ID"),
      "STRIPE_REPORT_PLUS_HPI_PRICE_ID"
    );
  }

  return assertValidStripePriceId(
    mustGetEnv("STRIPE_REPORT_PRICE_ID"),
    "STRIPE_REPORT_PRICE_ID"
  );
}

function getSuccessUrl(reportId: string, tier: CheckoutTier) {
  return `${appUrl()}/report/${reportId}?session_id={CHECKOUT_SESSION_ID}&tier=${tier}`;
}

function getCancelUrl(reportId: string) {
  return `${appUrl()}/report/${reportId}`;
}

function getProductName(tier: CheckoutTier) {
  if (tier === "hpi_upgrade") return "HPI Upgrade";
  if (tier === "report_plus_hpi") return "Report + HPI Bundle";
  return "Core Report";
}

function getUnlockFlags(tier: CheckoutTier) {
  return {
    unlock_report:
      tier === "report" ||
      tier === "hpi_upgrade" ||
      tier === "report_plus_hpi",
    unlock_hpi:
      tier === "hpi_upgrade" || tier === "report_plus_hpi",
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const reportId = searchParams.get("report_id")?.trim() ?? null;
    const tier = parseTier(searchParams.get("tier"));

    if (!isLikelyValidReportId(reportId)) {
      return NextResponse.json(
        { error: "Missing or invalid report_id" },
        { status: 400 }
      );
    }

    const successUrl = getSuccessUrl(reportId, tier);
    const cancelUrl = getCancelUrl(reportId);
    const priceId = getStripePriceIdForTier(tier);
    const flags = getUnlockFlags(tier);

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
        product_name: getProductName(tier),
        unlock_report: String(flags.unlock_report),
        unlock_hpi: String(flags.unlock_hpi),
      },
    });

    if (!session.url) {
      console.error("Stripe checkout session created without URL", {
        reportId,
        tier,
        sessionId: session.id,
      });

      return NextResponse.json(
        { error: "Failed to create Stripe checkout session" },
        { status: 500 }
      );
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
      { status: 500 }
    );
  }
}