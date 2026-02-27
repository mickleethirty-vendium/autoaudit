import Stripe from "stripe";
import { NextResponse } from "next/server";
import { mustGetEnv } from "@/lib/env";

export const runtime = "nodejs";

const stripe = new Stripe(mustGetEnv("STRIPE_SECRET_KEY"), {
  apiVersion: "2024-06-20",
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sessionId = url.searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);

  const reportId = session.metadata?.report_id;
  if (!reportId) {
    return NextResponse.json({ error: "Missing report_id in session metadata" }, { status: 400 });
  }

  return NextResponse.json({ report_id: reportId });
}