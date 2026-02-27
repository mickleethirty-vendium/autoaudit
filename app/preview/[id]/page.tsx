export const dynamic = "force-dynamic";

import { supabasePublic } from "@/lib/supabase";
import { notFound } from "next/navigation";

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

  const reg = data.registration as string | null;
  const make = data.make as string | null;

  const year =
    (data.car_year as number | null) ??
    (data.year as number | null) ??
    (data.year_of_manufacture as number | null) ??
    null;

  const mileage = (data.mileage as number | null) ?? null;
  const fuel = (data.fuel as string | null) ?? null;
  const transmission = (data.transmission as string | null) ?? null;

  const preview: any = data.preview_payload ?? {};
  const items: any[] = Array.isArray(preview.items) ? preview.items : [];

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

      <h2 className="text-xl font-semibold mb-4">Risk Snapshot</h2>

      <div className="space-y-4">
        {items.length ? (
          items.map((item: any, idx: number) => (
            <div key={idx} className="border rounded-lg p-4 bg-white">
              <div className="font-semibold">{item.title ?? "Item"}</div>
              <div className="text-sm text-slate-700 mt-1">
                {item.summary ?? ""}
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-lg border bg-slate-50 p-4 text-sm text-slate-700">
            Snapshot generated, but no items were returned by the engine payload.
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