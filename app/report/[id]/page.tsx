import Link from "next/link";
import { supabasePublic } from "@/lib/supabase";

export default async function ReportPage({ params }: { params: { id: string } }) {
  const { data: report } = await supabasePublic
    .from("reports")
    .select("id,is_paid,full_payload,preview_payload")
    .eq("id", params.id)
    .single();

  if (!report) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-bold">Report not found</h1>
        <Link className="mt-4 inline-block text-emerald-700 hover:underline" href="/check">
          Start a new check →
        </Link>
      </div>
    );
  }

  if (!report.is_paid) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-extrabold">This report is locked</h1>
        <p className="mt-2 text-slate-700">
          You&apos;re viewing the preview. Unlock to see itemised costs, questions, and negotiation script.
        </p>
        <Link
          href={`/preview/${report.id}`}
          className="mt-6 inline-flex items-center justify-center rounded-md bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700"
        >
          Go to preview →
        </Link>
      </div>
    );
  }

  const payload = (report.full_payload ?? report.preview_payload) as any;
  const s = payload.summary;
  const items = payload.items ?? [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-extrabold">AutoAudit Full Report</h1>

      <div className="mt-6 rounded-xl border bg-white p-6">
        <div className="text-sm font-semibold text-amber-700">
          Estimated Immediate Maintenance Exposure
        </div>
        <div className="mt-1 text-4xl font-extrabold">
          £{s.exposure_low} – £{s.exposure_high}
        </div>

        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <span className="rounded-full bg-slate-100 px-3 py-1">
            <b>Risk:</b> {s.risk_level}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1">
            <b>Suggested negotiation:</b> ~£{s.negotiation_suggested}
          </span>
        </div>
      </div>

      <h2 className="mt-8 text-xl font-bold">Itemised cost exposure</h2>
      <div className="mt-3 overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Cost range</th>
              <th className="px-4 py-3">Why flagged</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it: any) => (
              <tr key={it.item_id} className="border-t">
                <td className="px-4 py-3 font-semibold">{it.label}</td>
                <td className="px-4 py-3">{it.status}</td>
                <td className="px-4 py-3">£{it.cost_low}–£{it.cost_high}</td>
                <td className="px-4 py-3 text-slate-700">{it.why_flagged}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-8 text-xl font-bold">Details</h2>
      <div className="mt-4 grid gap-4">
        {items.map((it: any) => (
          <section key={it.item_id} className="rounded-xl border bg-white p-6">
            <div className="text-lg font-extrabold">{it.label}</div>
            <div className="mt-2 text-sm text-slate-700">
              <b>Estimated cost:</b> £{it.cost_low}–£{it.cost_high} · <b>Status:</b> {it.status}
            </div>

            <div className="mt-4 font-semibold">Why this matters</div>
            <p className="mt-1 text-slate-700">{it.why_it_matters}</p>

            <div className="mt-4 font-semibold">What to ask</div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-700">
              {it.questions_to_ask?.map((q: string, idx: number) => (
                <li key={idx}>{q}</li>
              ))}
            </ul>

            {it.red_flags?.length ? (
              <>
                <div className="mt-4 font-semibold">Red flags</div>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-700">
                  {it.red_flags.map((r: string, idx: number) => (
                    <li key={idx}>{r}</li>
                  ))}
                </ul>
              </>
            ) : null}
          </section>
        ))}
      </div>

      <h2 className="mt-8 text-xl font-bold">Negotiation script</h2>
      <div className="mt-3 rounded-xl border bg-white p-6">
        <p className="text-slate-800">{payload.negotiation?.script}</p>
        <p className="mt-2 text-sm text-slate-600">{payload.negotiation?.tip}</p>
      </div>

      <div className="mt-8 text-xs text-slate-600">
        {payload.disclaimer?.text}
      </div>
    </div>
  );
}
