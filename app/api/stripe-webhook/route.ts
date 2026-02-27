import Stripe from "stripe";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { mustGetEnv } from "@/lib/env";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

const stripe = new Stripe(mustGetEnv("STRIPE_SECRET_KEY"), {
  apiVersion: "2024-06-20",
});

export async function POST(req: Request) {
  const body = await req.text();
  const sig = (await headers()).get("stripe-signature");

  if (!sig) return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, mustGetEnv("STRIPE_WEBHOOK_SECRET"));
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook signature verification failed: ${err.message}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const reportId = session.metadata?.report_id;

    if (reportId) {
      await supabaseAdmin.from("reports").update({ is_paid: true }).eq("id", reportId);
    }
  }

  return NextResponse.json({ received: true });
}
