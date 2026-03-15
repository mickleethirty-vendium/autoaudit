import Stripe from "stripe";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { mustGetEnv } from "@/lib/env";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

const stripe = new Stripe(mustGetEnv("STRIPE_SECRET_KEY"), {
  apiVersion: "2024-06-20",
});

type CheckoutTier = "report" | "hpi_upgrade";

function thirtyDaysFrom(date: Date) {
  return new Date(date.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
}

function parseCheckoutTier(value: string | undefined): CheckoutTier {
  return value === "hpi_upgrade" ? "hpi_upgrade" : "report";
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
      const checkoutTier = parseCheckoutTier(session.metadata?.checkout_tier);

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

      const paymentIntentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : null;

      const { data: existingReport, error: existingReportError } =
        await supabaseAdmin
          .from("reports")
          .select(
            `
              id,
              is_paid,
              paid_at,
              expires_at,
              hpi_unlocked,
              hpi_paid_at,
              stripe_session_id,
              stripe_payment_intent_id,
              hpi_stripe_session_id,
              hpi_stripe_payment_intent_id
            `
          )
          .eq("id", reportId)
          .maybeSingle();

      if (existingReportError) {
        return NextResponse.json(
          {
            error: `Failed to load existing report: ${existingReportError.message}`,
          },
          { status: 500 }
        );
      }

      if (!existingReport) {
        return NextResponse.json(
          { error: "Report not found" },
          { status: 404 }
        );
      }

      const now = new Date();
      const nowIso = now.toISOString();

      const existingPaidAt =
        existingReport.paid_at &&
        !Number.isNaN(new Date(existingReport.paid_at).getTime())
          ? existingReport.paid_at
          : null;

      const existingExpiresAt =
        existingReport.expires_at &&
        !Number.isNaN(new Date(existingReport.expires_at).getTime())
          ? existingReport.expires_at
          : null;

      const reportPaidAt = existingPaidAt ?? nowIso;
      const reportExpiresAt =
        existingExpiresAt ?? thirtyDaysFrom(new Date(reportPaidAt));

      const updatePayload: Record<string, any> = {};

      if (checkoutTier === "report") {
        updatePayload.is_paid = true;
        updatePayload.paid_at = reportPaidAt;
        updatePayload.expires_at = reportExpiresAt;
        updatePayload.stripe_session_id = session.id;
        updatePayload.stripe_payment_intent_id = paymentIntentId;
      }

      if (checkoutTier === "hpi_upgrade") {
        updatePayload.is_paid = true;
        updatePayload.paid_at = reportPaidAt;
        updatePayload.expires_at = reportExpiresAt;
        updatePayload.hpi_unlocked = true;
        updatePayload.hpi_paid_at =
          existingReport.hpi_paid_at &&
          !Number.isNaN(new Date(existingReport.hpi_paid_at).getTime())
            ? existingReport.hpi_paid_at
            : nowIso;
        updatePayload.hpi_stripe_session_id = session.id;
        updatePayload.hpi_stripe_payment_intent_id = paymentIntentId;
      }

      const { data, error } = await supabaseAdmin
        .from("reports")
        .update(updatePayload)
        .eq("id", reportId)
        .select(
          `
            id,
            is_paid,
            paid_at,
            expires_at,
            hpi_unlocked,
            hpi_paid_at
          `
        )
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
        checkout_tier: checkoutTier,
        report_id: data.id,
        is_paid: data.is_paid,
        paid_at: data.paid_at,
        expires_at: data.expires_at,
        hpi_unlocked: data.hpi_unlocked ?? false,
        hpi_paid_at: data.hpi_paid_at ?? null,
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