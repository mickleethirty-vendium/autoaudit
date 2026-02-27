import Link from "next/link";

export default function HowItWorks() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-extrabold">How AutoAudit works</h1>
      <ol className="mt-6 list-decimal space-y-3 pl-6 text-slate-700">
        <li>Enter year, mileage, fuel type, transmission, and timing type (if known).</li>
        <li>We generate an instant “maintenance exposure” estimate using conservative heuristics.</li>
        <li>You can pay to unlock a full report: itemised costs, seller questions, and a negotiation script.</li>
      </ol>

      <div className="mt-8 rounded-lg border bg-white p-4 text-sm text-slate-700">
        <div className="font-semibold">Important</div>
        <p className="mt-1">
          AutoAudit is not a mechanical inspection. Always verify service history and consider an independent inspection.
        </p>
      </div>

      <div className="mt-6">
        <Link href="/check" className="font-semibold text-emerald-700 hover:underline">
          Start a check →
        </Link>
      </div>
    </div>
  );
}
