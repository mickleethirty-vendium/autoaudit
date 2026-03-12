import Stripe from "stripe";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { mustGetEnv } from "@/lib/env";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

const stripe = new Stripe(mustGetEnv("STRIPE_SECRET_KEY"), {
  apiVersion: "2024-06-20",
});

function thirtyDaysFrom(date: Date) {
  return new Date(date.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
}

export async function POST(req: Request) {
  const body = await req.text();

  const sig = (await headers()).get("stripe-signature");
  if (!sig) {
    return NextResponse.json(
      { error: "Missing Stripe signature" },
      { status: 400 }
    );
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
        return NextResponse.json(
          { error: "Missing report_id in session metadata" },
          { status: 400 }
        );
      }

      const isSessionPaid =
        session.payment_status === "paid" || session.status === "complete";

      if (!isSessionPaid) {
        return NextResponse.json({
          received: true,
          unlocked: false,
          reason:
            "Session completed event received but payment not marked paid",
        });
      }

      const paidAt = new Date();
      const paidAtIso = paidAt.toISOString();
      const expiresAtIso = thirtyDaysFrom(paidAt);

      const paymentIntentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : null;

      const { data, error } = await supabaseAdmin
        .from("reports")
        .update({
          is_paid: true,
          paid_at: paidAtIso,
          expires_at: expiresAtIso,
          stripe_session_id: session.id,
          stripe_payment_intent_id: paymentIntentId,
        })
        .eq("id", reportId)
        .select("id,is_paid,paid_at,expires_at")
        .single();

      if (error) {
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
        paid_at: data.paid_at,
        expires_at: data.expires_at,
      });
    }

    return NextResponse.json({ received: true, ignored: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: `Webhook handler error: ${err.message}` },
      { status: 500 }
    );
  }
}