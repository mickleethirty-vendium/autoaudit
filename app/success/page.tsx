import Link from "next/link";

export const dynamic = "force-dynamic";

function appUrl() {
  // IMPORTANT: use the env var you already rely on in checkout
  return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "";
}

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  const sessionId = searchParams?.session_id;

  if (!sessionId) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="text-2xl font-bold">Payment received</h1>
        <p className="mt-2 text-slate-700">
          We couldn’t verify your payment (missing session_id). Please contact support.
        </p>
        <div className="mt-6">
          <Link href="/" className="btn-outline">
            Back home
          </Link>
        </div>
      </div>
    );
  }

  const base = appUrl();
  const verifyUrl = base
    ? `${base}/api/session-report?session_id=${encodeURIComponent(sessionId)}`
    : `/api/session-report?session_id=${encodeURIComponent(sessionId)}`;

  const res = await fetch(verifyUrl, { cache: "no-store" });
  const json = await res.json();

  if (!res.ok || !json?.report_id) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="text-2xl font-bold">Payment received</h1>
        <p className="mt-2 text-slate-700">
          We received your payment, but couldn’t unlock the report automatically.
        </p>
        <div className="mt-4 rounded-xl border bg-slate-50 p-4 text-sm text-slate-700">
          <b>Error:</b> {json?.error ?? "Unknown error"}
        </div>
        <div className="mt-6 flex gap-3">
          <Link href="/" className="btn-outline">
            Back home
          </Link>
        </div>
      </div>
    );
  }

  // Now it SHOULD be paid
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold">Unlocked ✅</h1>
      <p className="mt-2 text-slate-700">Your full report is ready.</p>
      <div className="mt-6">
        <Link href={`/report/${json.report_id}`} className="btn-primary">
          View full report
        </Link>
      </div>
    </div>
  );
}