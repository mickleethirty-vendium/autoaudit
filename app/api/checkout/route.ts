import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function mustGetEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

function appUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    "http://localhost:3000"
  );
}

const stripe = new Stripe(mustGetEnv("STRIPE_SECRET_KEY"), {
  apiVersion: "2024-06-20",
});

type CheckoutTier = "report" | "hpi_upgrade";

function parseTier(value: string | null): CheckoutTier {
  return value === "hpi_upgrade" ? "hpi_upgrade" : "report";
}

function getStripePriceIdForTier(tier: CheckoutTier) {
  if (tier === "hpi_upgrade") {
    return mustGetEnv("STRIPE_HPI_UPGRADE_PRICE_ID");
  }

  return mustGetEnv("STRIPE_REPORT_PRICE_ID");
}

function getSuccessUrl(reportId: string, tier: CheckoutTier) {
  return `${appUrl()}/report/${reportId}?session_id={CHECKOUT_SESSION_ID}&tier=${tier}`;
}

function getCancelUrl(reportId: string, tier: CheckoutTier) {
  if (tier === "hpi_upgrade") {
    return `${appUrl()}/report/${reportId}`;
  }

  return `${appUrl()}/preview/${reportId}`;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const reportId = searchParams.get("report_id");
    const tier = parseTier(searchParams.get("tier"));

    if (!reportId) {
      return NextResponse.json(
        { error: "Missing report_id" },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price: getStripePriceIdForTier(tier),
          quantity: 1,
        },
      ],
      success_url: getSuccessUrl(reportId, tier),
      cancel_url: getCancelUrl(reportId, tier),
      metadata: {
        report_id: reportId,
        checkout_tier: tier,
      },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Failed to create Stripe checkout session" },
        { status: 500 }
      );
    }

    return NextResponse.redirect(session.url);
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Unable to start checkout" },
      { status: 500 }
    );
  }
}