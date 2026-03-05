import Link from "next/link";

export const dynamic = "force-dynamic";

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
          We couldn’t verify your session (missing session_id). Please contact support.
        </p>
        <div className="mt-6">
          <Link href="/" className="btn-outline">
            Back home
          </Link>
        </div>
      </div>
    );
  }

  // Call our server endpoint to verify session + mark report paid
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/session-report?session_id=${encodeURIComponent(
      sessionId
    )}`,
    { cache: "no-store" }
  );

  const json = await res.json();

  if (!res.ok || !json?.report_id) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="text-2xl font-bold">Payment received</h1>
        <p className="mt-2 text-slate-700">
          We received your payment, but couldn’t unlock your report automatically.
        </p>

        <div className="mt-4 rounded-xl border bg-slate-50 p-4 text-sm text-slate-700">
          <b>Error:</b> {json?.error ?? "Unknown error"}
        </div>

        <div className="mt-6">
          <Link href="/" className="btn-outline">
            Back home
          </Link>
        </div>
      </div>
    );
  }

  // Server-side redirect to the unlocked report
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold">Unlocking your report…</h1>
      <p className="mt-2 text-slate-700">
        If you are not redirected automatically, click below.
      </p>
      <div className="mt-6">
        <Link href={`/report/${json.report_id}`} className="btn-primary">
          View full report
        </Link>
      </div>
    </div>
  );
}