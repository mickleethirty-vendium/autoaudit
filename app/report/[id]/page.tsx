export const dynamic = "force-dynamic";

import { supabasePublic } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";

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

export default async function ReportPage({
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

  // Locked view
  if (!data.is_paid) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-6 border-b pb-4">
          {reg ? (
            <h1 className="text-2xl font-bold">
              {reg}
              {make ? (
                <span className="text-slate-600 font-normal ml-2">· {make}</span>
              ) : null}
            </h1>
          ) : (
            <h1 className="text-2xl font-bold">Full Report</h1>
          )}

          <div className="text-sm text-slate-600 mt-2">
            {year ? `${year} · ` : ""}
            {fuel ? `${fuel} · ` : ""}
            {transmission ? `${transmission} · ` : ""}
            {typeof mileage === "number" ? `${mileage.toLocaleString()} miles` : ""}
          </div>
        </div>

        <div className="rounded-xl border bg-slate-50 p-6">
          <div className="text-lg font-semibold">Report locked</div>
          <p className="mt-2 text-sm text-slate-700">
            This detailed report is available after payment.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href={`/api/create-checkout-session?report_id=${data.id}`}
              className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700"
            >
              Unlock Full Report
            </a>

            <Link
              href={`/preview/${data.id}`}
              className="inline-flex items-center justify-center rounded-md border px-4 py-2 font-semibold text-slate-900 hover:bg-white"
            >
              Back to Snapshot
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const full: any = data.full_payload ?? {};
  const summary: any = full.summary ?? {};
  const items: any[] = Array.isArray(full.items) ? full.items : [];
  const negotiation: any = full.negotiation ?? {};
  const disclaimerText: string | null = full?.disclaimer?.text ?? null;

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
      : typeof negotiation.suggested_reduction === "number"
      ? negotiation.suggested_reduction
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
          <h1 className="text-2xl font-bold">Full Report</h1>
        )}

        <div className="text-sm text-slate-600 mt-2">
          {year ? `${year} · ` : ""}
          {fuel ? `${fuel} · ` : ""}
          {transmission ? `${transmission} · ` : ""}
          {typeof mileage === "number" ? `${mileage.toLocaleString()} miles` : ""}
        </div>
      </div>

      {/* Executive Summary */}
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

        {primaryDrivers.length ? (
          <div className="mt-5">
            <div className="text-sm font-semibold">Primary drivers</div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
              {primaryDrivers.map((d: any, i: number) => (
                <li key={i}>
                  <b>{d.label ?? "Item"}:</b> {d.reason_short ?? ""}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      {/* Negotiation Script */}
      {(negotiation?.script || negotiationSuggested !== null) && (
        <div className="mt-8 rounded-2xl border bg-white p-6">
          <div className="text-lg font-semibold">Negotiation pack</div>

          {negotiationSuggested !== null ? (
            <div className="mt-2 text-sm text-slate-700">
              Target reduction: <b>{money(negotiationSuggested)}</b>
            </div>
          ) : null}

          {negotiation?.tip ? (
            <div className="mt-2 text-sm text-slate-700">
              <b>Tip:</b> {negotiation.tip}
            </div>
          ) : null}

          {negotiation?.script ? (
            <div className="mt-4 rounded-lg bg-slate-50 p-4 text-sm text-slate-800">
              <div className="font-semibold text-slate-900">Suggested script</div>
              <p className="mt-2 whitespace-pre-line">{negotiation.script}</p>
            </div>
          ) : null}
        </div>
      )}

      {/* Itemised checks */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold">Itemised checks</h2>
        <p className="mt-1 text-sm text-slate-600">
          Verify with invoices. If proof is missing, assume the cost for negotiation.
        </p>

        <div className="mt-4 space-y-4">
          {items.length ? (
            items.map((item: any, idx: number) => (
              <div key={idx} className="rounded-2xl border bg-white p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-lg font-semibold text-slate-900">
                      {item.label ?? "Service item"}
                    </div>
                    {item.status ? (
                      <div className="mt-1 text-xs text-slate-600">
                        Status: <b>{String(item.status)}</b>
                        {item.category ? (
                          <>
                            {" "}
                            · Category: <b>{String(item.category)}</b>
                          </>
                        ) : null}
                      </div>
                    ) : null}
                  </div>

                  {typeof item.cost_low === "number" &&
                  typeof item.cost_high === "number" ? (
                    <div className="text-right">
                      <div className="text-lg font-semibold text-slate-900">
                        {money(item.cost_low)} – {money(item.cost_high)}
                      </div>
                      <div className="text-xs text-slate-600">estimated</div>
                    </div>
                  ) : null}
                </div>

                {item.why_flagged ? (
                  <div className="mt-4 text-sm text-slate-700">
                    <b>Why flagged:</b> {item.why_flagged}
                  </div>
                ) : null}

                {item.why_it_matters ? (
                  <div className="mt-3 rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
                    <div className="font-semibold text-slate-900">Why it matters</div>
                    <div className="mt-1">{item.why_it_matters}</div>
                  </div>
                ) : null}

                {Array.isArray(item.red_flags) && item.red_flags.length ? (
                  <div className="mt-4">
                    <div className="text-sm font-semibold">Red flags</div>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                      {item.red_flags.map((rf: string, i: number) => (
                        <li key={i}>{rf}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {Array.isArray(item.questions_to_ask) && item.questions_to_ask.length ? (
                  <div className="mt-4">
                    <div className="text-sm font-semibold">Questions to ask</div>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                      {item.questions_to_ask.map((q: string, i: number) => (
                        <li key={i}>{q}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ))
          ) : (
            <div className="rounded-xl border bg-slate-50 p-6 text-sm text-slate-700">
              No items found in this report payload.
            </div>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      {disclaimerText ? (
        <div className="mt-10 text-xs text-slate-500">{disclaimerText}</div>
      ) : (
        <div className="mt-10 text-xs text-slate-500">
          AutoAudit provides guidance only and is not a substitute for a mechanical inspection.
        </div>
      )}
    </div>
  );
}