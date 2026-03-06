import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const reportId = searchParams.get("report_id");

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
          price: mustGetEnv("STRIPE_PRICE_ID"),
          quantity: 1,
        },
      ],
      success_url: `${appUrl()}/report/${reportId}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl()}/preview/${reportId}`,
      metadata: { report_id: reportId },
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