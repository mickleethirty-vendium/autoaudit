import Link from "next/link";

export default function HowItWorks() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="rounded-2xl border border-[var(--aa-silver)] bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-extrabold text-black">How AutoAudit works</h1>

        <ol className="mt-6 list-decimal space-y-4 pl-6 text-slate-700">
          <li>
            Enter year, mileage, fuel type, transmission, and timing type
            (if known).
          </li>
          <li>
            We generate an instant maintenance exposure estimate using
            conservative heuristics.
          </li>
          <li>
            You can pay to unlock a full report with itemised costs, seller
            questions, negotiation guidance, MoT context and HPI detail.
          </li>
        </ol>

        <div className="mt-8 rounded-xl border-2 border-[var(--aa-red)] bg-red-50 p-4 text-sm text-slate-700">
          <div className="font-semibold text-[var(--aa-red)]">Important</div>
          <p className="mt-1">
            AutoAudit is not a mechanical inspection. Always verify service
            history and consider an independent inspection before purchase.
          </p>
        </div>

        <div className="mt-6">
          <Link
            href="/check"
            className="inline-flex items-center justify-center rounded-xl border border-black bg-black px-5 py-3 font-semibold text-white transition hover:bg-[#111111]"
          >
            Start a check
          </Link>
        </div>
      </div>
    </div>
  );
}