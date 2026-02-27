import Stripe from "stripe";
import { NextResponse } from "next/server";
import { mustGetEnv } from "@/lib/env";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

const stripe = new Stripe(mustGetEnv("STRIPE_SECRET_KEY"), {
  apiVersion: "2024-06-20",
});

export async function POST(req: Request) {
  try {
    const { reportId } = await req.json();
    if (!reportId) return NextResponse.json({ error: "Missing reportId" }, { status: 400 });

    const { data: report, error } = await supabaseAdmin
      .from("reports")
      .select("id,is_paid")
      .eq("id", reportId)
      .single();

    if (error || !report) return NextResponse.json({ error: "Report not found" }, { status: 404 });
    if (report.is_paid) {
      return NextResponse.json({ url: `${mustGetEnv("NEXT_PUBLIC_APP_URL")}/report/${reportId}` });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: mustGetEnv("STRIPE_PRICE_ID"), quantity: 1 }],
      success_url: `${mustGetEnv("NEXT_PUBLIC_APP_URL")}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${mustGetEnv("NEXT_PUBLIC_APP_URL")}/preview/${reportId}`,
      metadata: { report_id: reportId },
    });

    await supabaseAdmin
      .from("reports")
      .update({ stripe_session_id: session.id })
      .eq("id", reportId);

    return NextResponse.json({ url: session.url });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
  }
}
