export const dynamic = "force-dynamic";

import { supabasePublic } from "@/lib/supabase";
import { notFound } from "next/navigation";

function money(n: number) {
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `£${Math.round(n)}`;
  }
}

function titleCase(s: string) {
  return s
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

export default async function PreviewPage({
  params,
}: {
  params: { id: string };
}) {
  const { data, error } = await supabasePublic
    .from("reports")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !data) return notFound();

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

  const riskLevel: string | null = summary.risk_level ?? null;
  const exposureLow: number | null =
    typeof summary.exposure_low === "number" ? summary.exposure_low : null;
  const exposureHigh: number | null =
    typeof summary.exposure_high === "number" ? summary.exposure_high : null;

  const primaryDrivers: any[] = Array.isArray(summary.primary_drivers)
    ? summary.primary_drivers
    : [];

  const negotiationSuggested: number | null =
    typeof summary.negotiation_suggested === "number"
      ? summary.negotiation_suggested
      : null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Vehicle Header */}
      <div className="mb-6 border-b pb-4">
        {reg ? (
          <h1 className="text-2xl font-bold">
            {reg}
            {make ? (
              <span className="text-slate-600 font-normal ml-2">· {make}</span>
            ) : null}
          </h1>
        ) : (
          <h1 className="text-2xl font-bold">Vehicle Snapshot</h1>
        )}

        <div className="text-sm text-slate-600 mt-2">
          {year ? `${year} · ` : ""}
          {fuel ? `${fuel} · ` : ""}
          {transmission ? `${transmission} · ` : ""}
          {typeof mileage === "number" ? `${mileage.toLocaleString()} miles` : ""}
        </div>
      </div>

      {/* Snapshot Summary Card */}
      <div className="rounded-2xl border bg-white p-6">
        <div className="text-sm text-slate-600">Estimated immediate exposure</div>

        {exposureLow !== null && exposureHigh !== null ? (
          <div className="mt-1 text-4xl font-extrabold text-slate-900">
            {money(exposureLow)} – {money(exposureHigh)}
          </div>
        ) : (
          <div className="mt-2 text-sm text-slate-700">
            Exposure estimate unavailable.
          </div>
        )}

        {riskLevel ? (
          <div className="mt-3 inline-flex items-center rounded-full border px-3 py-1 text-sm">
            <span className="font-semibold">Risk:</span>
            <span className="ml-2">{titleCase(String(riskLevel))}</span>
          </div>
        ) : null}

        {negotiationSuggested !== null ? (
          <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <div className="font-semibold text-emerald-900">
              Suggested negotiation: ~{money(negotiationSuggested)}
            </div>
            <div className="mt-1 text-xs text-emerald-900/80">
              This is based on likely near-term maintenance exposure and uncertainty.
            </div>
          </div>
        ) : null}
      </div>

      {/* Primary Drivers */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold">Top cost drivers</h2>
        <p className="mt-1 text-sm text-slate-600">
          These are the biggest likely costs/risks based on mileage, age and typical service intervals.
          Always verify with invoices.
        </p>

        <div className="mt-4 space-y-4">
          {primaryDrivers.length ? (
            primaryDrivers.map((d: any, idx: number) => (
              <div key={idx} className="rounded-xl border bg-white p-5">
                <div className="font-semibold text-slate-900">
                  {d.label ?? "Service item"}
                </div>
                {d.reason_short ? (
                  <div className="mt-1 text-sm text-slate-700">{d.reason_short}</div>
                ) : null}
              </div>
            ))
          ) : (
            <div className="rounded-xl border bg-slate-50 p-6 text-sm text-slate-700">
              No primary drivers found in this snapshot payload.
            </div>
          )}
        </div>
      </div>

      {/* Paywall */}
      {!data.is_paid ? (
        <div className="mt-10 rounded-2xl border bg-slate-50 p-6">
          <div className="font-semibold">
            Unlock the full report for itemised costs + negotiation script
          </div>
          <a
            href={`/api/checkout?report_id=${data.id}`}
            className="inline-block mt-3 rounded-md bg-emerald-600 px-4 py-2 text-white font-semibold hover:bg-emerald-700"
          >
            Unlock Full Report
          </a>
        </div>
      ) : null}
    </div>
  );
}