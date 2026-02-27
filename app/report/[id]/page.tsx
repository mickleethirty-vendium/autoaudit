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

export default async function ReportPage({
  params,
}: {
  params: { id: string };
}) {
  const { data, error } = await supabasePublic
    .from("reports")
    .select(
      `
      id,
      registration,
      make,
      car_year,
      mileage,
      fuel,
      transmission,
      full_payload,
      is_paid
      `
    )
    .eq("id", params.id)
    .single();

  if (error || !data) return notFound();

  // If not paid, show locked view
  if (!data.is_paid) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Vehicle Header */}
        <div className="mb-6 border-b pb-4">
          {data.registration ? (
            <h1 className="text-2xl font-bold">
              {data.registration}
              {data.make ? (
                <span className="text-slate-600 font-normal ml-2">
                  · {data.make}
                </span>
              ) : null}
            </h1>
          ) : (
            <h1 className="text-2xl font-bold">Full Report</h1>
          )}

          <div className="text-sm text-slate-600 mt-2">
            {data.car_year} · {data.fuel} · {data.transmission} ·{" "}
            {Number(data.mileage).toLocaleString()} miles
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
  const items: any[] = Array.isArray(full.items) ? full.items : [];
  const sections: any[] = Array.isArray(full.sections) ? full.sections : [];

  // These are optional — depends on your engine payload
  const exposureLow = full.exposure_low;
  const exposureHigh = full.exposure_high;
  const negotiation = full.negotiation;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Vehicle Header */}
      <div className="mb-6 border-b pb-4">
        {data.registration ? (
          <h1 className="text-2xl font-bold">
            {data.registration}
            {data.make ? (
              <span className="text-slate-600 font-normal ml-2">
                · {data.make}
              </span>
            ) : null}
          </h1>
        ) : (
          <h1 className="text-2xl font-bold">Full Report</h1>
        )}

        <div className="text-sm text-slate-600 mt-2">
          {data.car_year} · {data.fuel} · {data.transmission} ·{" "}
          {Number(data.mileage).toLocaleString()} miles
        </div>
      </div>

      {/* Executive Summary */}
      <div className="rounded-xl border bg-white p-6">
        <div className="text-lg font-semibold">Executive Summary</div>

        {typeof exposureLow === "number" && typeof exposureHigh === "number" ? (
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900">
              {money(exposureLow)} – {money(exposureHigh)}
            </div>
            <div className="text-sm text-slate-600">
              Estimated immediate maintenance exposure
            </div>
          </div>
        ) : null}

        {negotiation ? (
          <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <div className="font-semibold text-emerald-900">
              Suggested negotiation
              {typeof negotiation.amount === "number"
                ? `: ~${money(negotiation.amount)}`
                : ""}
            </div>
            {negotiation.script ? (
              <p className="mt-2 text-sm text-emerald-900/90">
                {negotiation.script}
              </p>
            ) : null}
          </div>
        ) : null}

        {full.summary ? (
          <p className="mt-4 text-sm text-slate-700">{full.summary}</p>
        ) : null}
      </div>

      {/* Items */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold">Itemised checks</h2>
        <p className="mt-1 text-sm text-slate-600">
          These are the most likely cost drivers based on age/mileage and typical
          service schedules. Always verify with invoices.
        </p>

        <div className="mt-4 space-y-4">
          {items.length === 0 ? (
            <div className="rounded-xl border bg-slate-50 p-6 text-sm text-slate-700">
              No items found in report payload. (This usually means the engine
              payload shape differs — we can adjust the renderer.)
            </div>
          ) : (
            items.map((item: any, idx: number) => (
              <div key={idx} className="rounded-xl border bg-white p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-semibold text-slate-900">
                      {item.title ?? item.name ?? "Service item"}
                    </div>
                    {item.summary ? (
                      <div className="mt-1 text-sm text-slate-700">
                        {item.summary}
                      </div>
                    ) : null}
                  </div>

                  {typeof item.cost_low === "number" &&
                  typeof item.cost_high === "number" ? (
                    <div className="text-right">
                      <div className="font-semibold text-slate-900">
                        {money(item.cost_low)} – {money(item.cost_high)}
                      </div>
                      <div className="text-xs text-slate-600">estimated</div>
                    </div>
                  ) : typeof item.cost === "number" ? (
                    <div className="text-right">
                      <div className="font-semibold text-slate-900">
                        {money(item.cost)}
                      </div>
                      <div className="text-xs text-slate-600">estimated</div>
                    </div>
                  ) : null}
                </div>

                {item.why_it_matters ? (
                  <div className="mt-3 rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
                    <div className="font-semibold text-slate-900">
                      Why it matters
                    </div>
                    <div className="mt-1">{item.why_it_matters}</div>
                  </div>
                ) : null}

                {item.questions && Array.isArray(item.questions) ? (
                  <div className="mt-4">
                    <div className="text-sm font-semibold">Questions to ask</div>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                      {item.questions.map((q: string, i: number) => (
                        <li key={i}>{q}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Extra sections if your engine provides them */}
      {sections.length ? (
        <div className="mt-10 space-y-6">
          {sections.map((s: any, i: number) => (
            <div key={i} className="rounded-xl border bg-white p-6">
              <div className="text-lg font-semibold">{s.title ?? "Section"}</div>
              {s.body ? (
                <p className="mt-2 text-sm text-slate-700">{s.body}</p>
              ) : null}
              {Array.isArray(s.bullets) ? (
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
                  {s.bullets.map((b: string, j: number) => (
                    <li key={j}>{b}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-10 text-xs text-slate-500">
        AutoAudit provides guidance only and is not a substitute for a mechanical
        inspection.
      </div>
    </div>
  );
}