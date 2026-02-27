import { supabasePublic } from "@/lib/supabase";
import UnlockButton from "./ui/UnlockButton";
import Link from "next/link";

export default async function PreviewPage({ params }: { params: { id: string } }) {
  const { data: report } = await supabasePublic
    .from("reports")
    .select("id,is_paid,preview_payload")
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

  const s = (report.preview_payload as any)?.summary;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-extrabold">AutoAudit Snapshot</h1>
      <p className="mt-2 text-slate-700">
        Based on typical UK independent garage pricing and age/mileage risk patterns.
      </p>

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

        <h2 className="mt-6 text-lg font-bold">Top cost drivers</h2>
        <ul className="mt-2 list-disc space-y-2 pl-5 text-slate-700">
          {s.primary_drivers?.map((d: any, idx: number) => (
            <li key={idx}>
              <b>{d.label}</b> — {d.reason_short}
            </li>
          ))}
        </ul>

        <div className="mt-6 border-t pt-5">
          {report.is_paid ? (
            <Link
              href={`/report/${report.id}`}
              className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700"
            >
              View unlocked report →
            </Link>
          ) : (
            <div className="grid gap-2">
              <UnlockButton reportId={report.id} />
              <div className="text-sm text-slate-600">
                Includes itemised breakdown, seller questions, negotiation script, and PDF (later).
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
