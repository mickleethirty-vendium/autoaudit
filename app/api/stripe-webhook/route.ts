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
  // IMPORTANT: raw body is required for signature verification
  const body = await req.text();

  const sig = (await headers()).get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      mustGetEnv("STRIPE_WEBHOOK_SECRET")
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${err.message}` },
      { status: 400 }
    );
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const reportId = session.metadata?.report_id;

      if (!reportId) {
        // If metadata is missing, that's a bug in checkout session creation
        return NextResponse.json(
          { error: "Missing report_id in session metadata" },
          { status: 400 }
        );
      }

      // Update Supabase to unlock the report
      const { data, error } = await supabaseAdmin
        .from("reports")
        .update({ is_paid: true })
        .eq("id", reportId)
        .select("id,is_paid")
        .single();

      if (error) {
        // Return non-200 so Stripe shows this delivery as failed
        return NextResponse.json(
          { error: `Supabase update failed: ${error.message}` },
          { status: 500 }
        );
      }

      if (!data) {
        return NextResponse.json(
          { error: "Supabase update returned no data (report not found?)" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        received: true,
        unlocked: true,
        report_id: data.id,
        is_paid: data.is_paid,
      });
    }

    // For other event types, just acknowledge
    return NextResponse.json({ received: true, ignored: true });
  } catch (err: any) {
    // Catch-all: if anything unexpected happens, fail loudly
    return NextResponse.json(
      { error: `Webhook handler error: ${err.message}` },
      { status: 500 }
    );
  }
}