// app/preview/[id]/page.tsx
export const dynamic = "force-dynamic";

import Link from "next/link";
import { supabasePublic } from "@/lib/supabase";
import ExposureBar from "@/app/components/ExposureBar";

function titleCase(s: string) {
  return s
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

export default async function Page({
  params,
}: {
  params: { id: string };
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

  const preview: any = data.preview_payload ?? {};
  const summary: any = preview.summary ?? {};
  const buckets: any[] = Array.isArray(preview.buckets) ? preview.buckets : [];
  const teaser: any = preview.teaser ?? {};
  const blurredLabels: string[] = Array.isArray(teaser.blurred_labels)
    ? teaser.blurred_labels
    : [];

  const hiddenCount: number =
    typeof teaser.hidden_count === "number"
      ? teaser.hidden_count
      : blurredLabels.length;

  const riskLevel: string | null = summary.risk_level ?? null;

  const exposureLow: number | null =
    typeof summary.exposure_low === "number" ? summary.exposure_low : null;

  const exposureHigh: number | null =
    typeof summary.exposure_high === "number" ? summary.exposure_high : null;

  const confidence: any = summary.confidence ?? null;

  const checkoutUrl = `/api/checkout?report_id=${data.id}`;

  return (
    <>
      <div className="mx-auto w-full max-w-3xl px-4 py-4">
        {/* Header */}
        <div className="mb-4 border-b pb-3">
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
            {typeof mileage === "number" ? `${mileage.toLocaleString()} miles` : ""}
          </div>
        </div>

        {/* Exposure */}
        <div className="card">
          <div className="text-sm text-slate-600">
            Estimated near-term maintenance exposure
          </div>

          {exposureLow !== null && exposureHigh !== null ? (
            <ExposureBar low={exposureLow} high={exposureHigh} riskLevel={riskLevel} />
          ) : (
            <div className="mt-2 text-sm text-slate-700">
              Exposure estimate unavailable.
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {riskLevel ? (
              <span className="inline-flex items-center rounded-full border px-3 py-1 text-sm">
                <span className="font-semibold">Risk:</span>
                <span className="ml-2">{titleCase(String(riskLevel))}</span>
              </span>
            ) : null}

            {confidence ? (
              <span className="inline-flex items-center rounded-full border px-3 py-1 text-sm">
                <span className="font-semibold">Confidence:</span>
                <span className="ml-2">
                  {confidence.label ?? "—"} ({confidence.score ?? "—"}/100)
                </span>
              </span>
            ) : null}
          </div>

          {/* Desktop CTA */}
          <div className="mt-4 hidden sm:flex gap-3">
            <a href={checkoutUrl} className="btn-primary">
              Unlock Full Report
            </a>
            <Link href="/check" className="btn-outline">
              Start another check
            </Link>
          </div>
        </div>

        {/* Buckets */}
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

        {/* Locked teaser */}
        <div className="mt-5 rounded-xl border bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-base font-semibold">Detailed findings locked</div>
              <div className="mt-1 text-sm text-slate-600">
                {hiddenCount
                  ? `${hiddenCount} detailed checks detected`
                  : "Detailed checks detected"}
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {(blurredLabels.length ? blurredLabels : ["Detailed item 1", "Detailed item 2", "Detailed item 3"])
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
            <div>✔ Itemised costs and urgency</div>
            <div>✔ Seller questions + red flags</div>
            <div>✔ Negotiation script and suggested reduction</div>
            <div>✔ MoT advisory analysis (when enabled)</div>
          </div>
        </div>

        <div className="mt-6 text-xs text-slate-500">
          AutoAudit provides guidance only and is not a substitute for a mechanical inspection.
        </div>

        {/* Spacer so sticky bar doesn't cover content */}
        <div className="h-16 sm:hidden" />
      </div>

      {/* Sticky mobile CTA */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 border-t bg-white/95 backdrop-blur px-4 py-3">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3">
          <div className="text-sm">
            <div className="font-semibold">Unlock full report</div>
            <div className="text-xs text-slate-600">See the hidden checks + costs</div>
          </div>
          <a href={checkoutUrl} className="btn-primary">
            Unlock
          </a>
        </div>
      </div>
    </>
  );
}