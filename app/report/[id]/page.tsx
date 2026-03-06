export const dynamic = "force-dynamic";

import Link from "next/link";
import Stripe from "stripe";
import { supabasePublic } from "@/lib/supabase";
import { mustGetEnv } from "@/lib/env";
import ExposureBar from "@/app/components/ExposureBar";
import ReportClient from "./ReportClient";

const stripe = new Stripe(mustGetEnv("STRIPE_SECRET_KEY"), {
  apiVersion: "2024-06-20",
});

export default async function Page({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { session_id?: string };
}) {
  const { data, error } = await supabasePublic
    .from("reports")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (error || !data) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-6">
        <h1 className="text-2xl font-bold">Snapshot not found</h1>
        <p className="mt-2 text-sm text-slate-600">
          We couldn’t load that report. Please go back and try again.
        </p>

        <div className="mt-4">
          <Link href="/" className="btn-outline">
            Back home
          </Link>
        </div>
      </div>
    );
  }

  const reg = (data.registration as string | null) ?? null;
  const make = (data.make as string | null) ?? null;

  const year =
    (data.car_year as number | null) ??
    (data.year as number | null) ??
    null;

  const mileage = (data.mileage as number | null) ?? null;
  const fuel = (data.fuel as string | null) ?? null;
  const transmission = (data.transmission as string | null) ?? null;

  let isPaid = data.is_paid === true;

  // Fallback for webhook race condition:
  // if Stripe has redirected back with a paid session, unlock the UI immediately
  // even if the webhook has not updated Supabase yet.
  const sessionId = searchParams?.session_id;
  if (!isPaid && sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      const sessionReportId = session.metadata?.report_id;
      const isSessionPaid =
        session.payment_status === "paid" || session.status === "complete";

      if (isSessionPaid && sessionReportId === params.id) {
        isPaid = true;
      }
    } catch (e) {
      console.error("Failed to verify Stripe session on report page:", e);
    }
  }

  const preview: any = data.preview_payload ?? {};
  const previewSummary: any = preview.summary ?? {};

  const buckets: any[] = Array.isArray(preview.buckets) ? preview.buckets : [];

  const teaser: any = preview.teaser ?? {};
  const blurredLabels: string[] = Array.isArray(teaser.blurred_labels)
    ? teaser.blurred_labels
    : [];

  const hiddenCount: number =
    typeof teaser.hidden_count === "number"
      ? teaser.hidden_count
      : blurredLabels.length;

  const exposureLow: number | null =
    typeof previewSummary.exposure_low === "number"
      ? previewSummary.exposure_low
      : null;

  const exposureHigh: number | null =
    typeof previewSummary.exposure_high === "number"
      ? previewSummary.exposure_high
      : null;

  const confidence: any = previewSummary.confidence ?? null;

  const checkoutUrl = `/api/checkout?report_id=${data.id}`;
  const priceLabel = "£4.99";

  const fullPayload: any = data.full_payload ?? {};
  const fullSummary: any = fullPayload.summary ?? {};
  const fullItems: any[] = Array.isArray(fullPayload.items)
    ? fullPayload.items
    : [];

  const negotiationSuggested: number | null =
  typeof fullPayload.negotiation_suggested === "number"
    ? fullPayload.negotiation_suggested
    : typeof fullPayload.negotiationSuggested === "number"
    ? fullPayload.negotiationSuggested
    : typeof fullSummary.negotiation_suggested === "number"
    ? fullSummary.negotiation_suggested
    : typeof fullSummary.negotiationSuggested === "number"
    ? fullSummary.negotiationSuggested
    : null;

  if (isPaid) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-6">
        <div className="mb-6 border-b pb-3">
          {reg ? (
            <h1 className="text-2xl font-extrabold tracking-tight">
              {reg}
              {make ? (
                <span className="ml-2 font-normal text-slate-600">
                  · {make}
                </span>
              ) : null}
            </h1>
          ) : (
            <h1 className="text-2xl font-extrabold tracking-tight">
              AutoAudit Report
            </h1>
          )}

          <div className="mt-1 text-sm text-slate-600">
            {year ? `${year} · ` : ""}
            {fuel ? `${fuel} · ` : ""}
            {transmission ? `${transmission} · ` : ""}
            {typeof mileage === "number"
              ? `${mileage.toLocaleString()} miles`
              : ""}
          </div>
        </div>

        <ReportClient
          summary={fullSummary}
          items={fullItems}
          negotiationSuggested={negotiationSuggested}
        />
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto w-full max-w-3xl px-4 pt-2 pb-28">
        <div className="mb-4 border-b pb-2">
          {reg ? (
            <h1 className="text-2xl font-extrabold tracking-tight">
              {reg}
              {make ? (
                <span className="ml-2 font-normal text-slate-600">
                  · {make}
                </span>
              ) : null}
            </h1>
          ) : (
            <h1 className="text-2xl font-extrabold tracking-tight">
              AutoAudit Snapshot
            </h1>
          )}

          <div className="mt-1 text-sm text-slate-600">
            {year ? `${year} · ` : ""}
            {fuel ? `${fuel} · ` : ""}
            {transmission ? `${transmission} · ` : ""}
            {typeof mileage === "number"
              ? `${mileage.toLocaleString()} miles`
              : ""}
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Estimated near-term maintenance exposure
              </div>
              <div className="mt-1 text-sm text-slate-600">
                Use this to budget and negotiate before you buy.
              </div>
            </div>

            <div className="hidden sm:inline-flex items-center rounded-full border bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
              Instant snapshot
            </div>
          </div>

          <div className="mt-3">
            {exposureLow !== null && exposureHigh !== null ? (
              <ExposureBar low={exposureLow} high={exposureHigh} />
            ) : (
              <div className="mt-2 text-sm text-slate-700">
                Exposure estimate unavailable.
              </div>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {confidence ? (
              <span className="inline-flex items-center rounded-full border px-3 py-1 text-sm bg-white">
                <span className="font-semibold">Confidence:</span>
                <span className="ml-2">
                  {confidence.label ?? "—"} ({confidence.score ?? "—"}/100)
                </span>
              </span>
            ) : null}

            <span className="inline-flex items-center rounded-full border px-3 py-1 text-sm bg-white text-slate-600">
              Best with service history + latest MoT
            </span>
          </div>
        </div>

        <div className="mt-5">
          <h2 className="text-lg font-semibold">Risk breakdown by system</h2>

          <div className="mt-3 space-y-2">
            {buckets.length ? (
              buckets.map((b: any) => (
                <div key={b.key} className="rounded-xl border bg-white p-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold">
                        {b.label ?? "Category"}
                      </div>
                      <div className="mt-1 text-xs text-slate-600">
                        {typeof b.item_count === "number"
                          ? `${b.item_count} checks flagged`
                          : ""}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-semibold">
                        £{Number(b.exposure_low || 0).toLocaleString()} – £
                        {Number(b.exposure_high || 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-600">estimated</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border bg-white p-4 text-sm text-slate-700">
                No category breakdown available.
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 rounded-xl border bg-white p-4">
          <div className="text-base font-semibold">Detailed findings locked</div>
          <div className="mt-1 text-sm text-slate-600">
            {hiddenCount
              ? `${hiddenCount} detailed checks detected`
              : "Detailed checks detected"}
          </div>

          <div className="mt-4 space-y-2">
            {(blurredLabels.length
              ? blurredLabels
              : [
                  "Timing belt replacement",
                  "Brake system wear",
                  "Suspension component wear",
                ])
              .slice(0, 5)
              .map((t, i) => (
                <div
                  key={i}
                  className="rounded-lg border bg-slate-50 px-3 py-2 text-sm text-slate-800"
                >
                  <span className="select-none blur-sm">{t}</span>
                </div>
              ))}
          </div>

          <div className="mt-4 grid gap-1 text-sm text-slate-700">
            <div>✔ Itemised repair costs</div>
            <div>✔ Seller questions and red flags</div>
            <div>✔ Negotiation strategy</div>
            <div>✔ MoT advisory analysis</div>
          </div>
        </div>

        <div className="mt-6 text-xs text-slate-500">
          AutoAudit provides guidance only and is not a substitute for a
          mechanical inspection.
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-[9999] border-t bg-white/95 backdrop-blur px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3">
          <div className="text-sm">
            <div className="font-semibold">
              Unlock full report · {priceLabel}
            </div>
            <div className="text-xs text-slate-600">
              Reveal all checks and potential costs
            </div>
          </div>

          <a href={checkoutUrl} className="btn-primary">
            View full report
          </a>
        </div>
      </div>
    </>
  );
}