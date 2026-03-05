import Stripe from "stripe";
import { NextResponse } from "next/server";
import { mustGetEnv } from "@/lib/env";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

const stripe = new Stripe(mustGetEnv("STRIPE_SECRET_KEY"), {
  apiVersion: "2024-06-20",
});

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const session_id = url.searchParams.get("session_id");

    if (!session_id) {
      return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);

    const reportId = session?.metadata?.report_id;
    if (!reportId) {
      return NextResponse.json(
        { error: "Missing report_id in Stripe session metadata" },
        { status: 400 }
      );
    }

    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: `Session not paid: ${session.payment_status}`, report_id: reportId },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("reports")
      .update({ is_paid: true })
      .eq("id", reportId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ report_id: reportId });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Server error" },
      { status: 500 }
    );
  }
}