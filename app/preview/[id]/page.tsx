export const dynamic = "force-dynamic";

import { supabasePublic } from "@/lib/supabase";
import { notFound } from "next/navigation";

function pickItems(preview: any): any[] {
  if (!preview || typeof preview !== "object") return [];

  const candidates = [
    preview.items,
    preview.checks,
    preview.drivers,
    preview.top_items,
    preview.topItems,
    preview.risks,
    preview.findings,
    preview.recommendations,
  ];

  for (const c of candidates) {
    if (Array.isArray(c) && c.length) return c;
  }

  // Some payloads nest under sections
  if (Array.isArray(preview.sections)) {
    for (const s of preview.sections) {
      const nested =
        s?.items || s?.checks || s?.drivers || s?.risks || s?.findings;
      if (Array.isArray(nested) && nested.length) return nested;
    }
  }

  return [];
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
    (data.year_of_manufacture as number | null) ??
    null;

  const mileage = (data.mileage as number | null) ?? null;
  const fuel = (data.fuel as string | null) ?? null;
  const transmission = (data.transmission as string | null) ?? null;

  const preview: any = data.preview_payload ?? {};
  const items = pickItems(preview);

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

      {/* Headline numbers (if present) */}
      {(typeof preview.exposure_low === "number" ||
        typeof preview.exposure_high === "number" ||
        preview.risk_band) && (
        <div className="mb-6 rounded-xl border bg-white p-5">
          <div className="text-sm text-slate-600">Snapshot</div>

          {typeof preview.exposure_low === "number" &&
          typeof preview.exposure_high === "number" ? (
            <div className="mt-1 text-3xl font-extrabold">
              £{Math.round(preview.exposure_low).toLocaleString()} – £
              {Math.round(preview.exposure_high).toLocaleString()}
            </div>
          ) : null}

          {preview.risk_band ? (
            <div className="mt-2 text-sm text-slate-700">
              Risk band: <b>{String(preview.risk_band)}</b>
            </div>
          ) : null}
        </div>
      )}

      <h2 className="text-xl font-semibold mb-4">Top checks</h2>

      <div className="space-y-4">
        {items.length ? (
          items.map((item: any, idx: number) => (
            <div key={idx} className="border rounded-lg p-4 bg-white">
              <div className="font-semibold">
                {item.title ?? item.name ?? item.label ?? "Item"}
              </div>
              <div className="text-sm text-slate-700 mt-1">
                {item.summary ??
                  item.reason ??
                  item.description ??
                  item.detail ??
                  ""}
              </div>

              {(typeof item.cost_low === "number" &&
                typeof item.cost_high === "number") ||
              typeof item.cost === "number" ? (
                <div className="mt-2 text-sm text-slate-900">
                  Estimated cost:{" "}
                  <b>
                    {typeof item.cost === "number"
                      ? `£${Math.round(item.cost).toLocaleString()}`
                      : `£${Math.round(item.cost_low).toLocaleString()} – £${Math.round(
                          item.cost_high
                        ).toLocaleString()}`}
                  </b>
                </div>
              ) : null}
            </div>
          ))
        ) : (
          <div className="rounded-lg border bg-slate-50 p-4 text-sm text-slate-700">
            Snapshot generated, but I couldn’t find an items list in the engine
            payload.
            <div className="mt-2 text-xs text-slate-600">
              Payload keys:{" "}
              {preview && typeof preview === "object"
                ? Object.keys(preview).join(", ")
                : "(not an object)"}
            </div>
          </div>
        )}
      </div>

      {!data.is_paid ? (
        <div className="mt-8 p-6 border rounded-lg bg-slate-50">
          <div className="font-semibold mb-2">
            Unlock full report for detailed cost breakdown
          </div>
          <a
            href={`/api/create-checkout-session?report_id=${data.id}`}
            className="inline-block mt-2 rounded-md bg-emerald-600 px-4 py-2 text-white font-semibold hover:bg-emerald-700"
          >
            Unlock Full Report
          </a>
        </div>
      ) : null}
    </div>
  );
}