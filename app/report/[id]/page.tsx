export const dynamic = "force-dynamic";

import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";
import ReportClient from "./ReportClient";

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
  // IMPORTANT: use admin client so RLS cannot interfere with is_paid
  const { data, error } = await supabaseAdmin
    .from("reports")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (error || !data) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold">Report load error</h1>
        <p className="mt-2 text-sm text-slate-700">We couldn’t load that report.</p>

        <div className="mt-6 rounded-xl border bg-slate-50 p-4 text-sm">
          <div>
            <b>Report ID:</b> {params.id}
          </div>
          <div className="mt-2">
            <b>Error:</b>{" "}
            <pre className="mt-2 whitespace-pre-wrap text-red-700">
              {JSON.stringify(error ?? { message: "Row not found" }, null, 2)}
            </pre>
          </div>
        </div>

        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md border px-4 py-2 font-semibold text-slate-900 hover:bg-white"
          >
            Back home
          </Link>
        </div>
      </div>
    );
  }

  // Read fields safely
  const reg = (data.registration as string | null) ?? null;
  const make = (data.make as string | null) ?? null;

  const year =
    (data.car_year as number | null) ??
    (data.year as number | null) ??
    null;

  const mileage = (data.mileage as number | null) ?? null;
  const fuel = (data.fuel as string | null) ?? null;
  const transmission = (data.transmission as string | null) ?? null;

  // Locked view (only unlock when explicitly true)
  if (data.is_paid !== true) {
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
              href={`/api/checkout?report_id=${data.id}`}
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

          {/* Debug line to prove what the server sees (safe to remove later) */}
          <div className="mt-4 text-xs text-slate-500">
            Debug: is_paid = {String(data.is_paid)}
          </div>
        </div>
      </div>
    );
  }

  // Paid view
  const full: any = data.full_payload ?? {};
const summary: any = full.summary ?? {};
const items: any[] = Array.isArray(full.items) ? full.items : [];
const negotiation: any = full.negotiation ?? {};
const disclaimerText: string | null = full?.disclaimer?.text ?? null;

const negotiationSuggested: number | null =
  typeof summary.negotiation_suggested === "number"
    ? summary.negotiation_suggested
    : typeof negotiation.suggested_reduction === "number"
    ? negotiation.suggested_reduction
    : null;

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

    <ReportClient
      summary={summary}
      items={items}
      negotiationSuggested={negotiationSuggested}
    />

    {disclaimerText ? (
      <div className="mt-10 text-xs text-slate-500">{disclaimerText}</div>
    ) : (
      <div className="mt-10 text-xs text-slate-500">
        AutoAudit provides guidance only and is not a substitute for a mechanical inspection.
      </div>
    )}
  </div>
);