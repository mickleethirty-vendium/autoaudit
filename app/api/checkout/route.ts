import Stripe from "stripe";
import { NextResponse } from "next/server";
import { mustGetEnv } from "@/lib/env";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

const stripe = new Stripe(mustGetEnv("STRIPE_SECRET_KEY"), {
  apiVersion: "2024-06-20",
});

function appUrl() {
  return mustGetEnv("NEXT_PUBLIC_APP_URL").replace(/\/$/, "");
}

async function getReport(reportId: string) {
  const { data: report, error } = await supabaseAdmin
    .from("reports")
    .select("id,is_paid")
    .eq("id", reportId)
    .single();

  if (error || !report) return { report: null as any, status: 404 as const };
  return { report, status: 200 as const };
}

async function createCheckoutUrl(reportId: string) {
  const { report, status } = await getReport(reportId);
  if (!report) return { error: "Report not found", status };

  // If already paid, send them to the report
  if (report.is_paid) {
    return { url: `${appUrl()}/report/${reportId}`, status: 200 as const };
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: mustGetEnv("STRIPE_PRICE_ID"), quantity: 1 }],
    success_url: `${appUrl()}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl()}/preview/${reportId}`,
    metadata: { report_id: reportId },
  });

  await supabaseAdmin
    .from("reports")
    .update({ stripe_session_id: session.id })
    .eq("id", reportId);

  if (!session.url) {
    return { error: "Stripe did not return a checkout URL", status: 500 as const };
  }

  return { url: session.url, status: 200 as const };
}

// ✅ Supports <a href="/api/checkout?report_id=..."> (GET)
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const reportId = url.searchParams.get("report_id") || url.searchParams.get("reportId");

    if (!reportId) {
      return NextResponse.json({ error: "Missing report_id" }, { status: 400 });
    }

    const result = await createCheckoutUrl(reportId);

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    // Redirect user straight to Stripe Checkout (or report if already paid)
    return NextResponse.redirect(result.url, { status: 303 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Server error" },
      { status: 500 }
    );
  }
}

// ✅ Keeps compatibility with your existing POST JSON flow
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const reportId = body?.reportId || body?.report_id;

    if (!reportId) {
      return NextResponse.json({ error: "Missing reportId" }, { status: 400 });
    }

    const result = await createCheckoutUrl(reportId);

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    // For POST, return JSON (front-end can redirect)
    return NextResponse.json({ url: result.url });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Server error" },
      { status: 500 }
    );
  }
}