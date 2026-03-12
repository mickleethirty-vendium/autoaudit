import Link from "next/link";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="grid gap-8 md:grid-cols-2 md:items-start">
        <div>
          <div className="inline-flex items-center rounded-full border border-[var(--aa-silver)] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#b91c1c] shadow-sm">
            AutoAudit
          </div>

          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-black sm:text-5xl">
            Don&apos;t overpay for your next used car.
          </h1>

          <p className="mt-4 max-w-xl text-base leading-7 text-slate-700">
            Enter basic vehicle details to get an instant maintenance and repair
            exposure estimate. Unlock the full report for deeper risk signals,
            seller questions, and a clearer negotiation position.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/check"
              className="inline-flex items-center justify-center rounded-xl border border-[#b91c1c] bg-[#b91c1c] px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-[#991b1b] hover:shadow-md"
            >
              Start a check
            </Link>

            <Link
              href="/how-it-works"
              className="inline-flex items-center justify-center rounded-xl border border-[var(--aa-silver)] bg-white px-5 py-3 font-semibold text-slate-900 transition hover:bg-slate-50"
            >
              How it works
            </Link>
          </div>

          <div className="mt-8 rounded-2xl border border-black bg-white p-5 text-sm text-slate-700 shadow-sm">
            <div className="font-semibold uppercase tracking-wide text-black">
              MVP note
            </div>
            <p className="mt-2 leading-6">
              This v1 uses simple heuristics and rules of thumb. You can improve
              accuracy later. Right now, the goal is fast validation, real
              usage, and paid demand.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--aa-silver)] bg-white p-6 shadow-sm">
          <div className="inline-flex items-center rounded-full border border-[var(--aa-silver)] bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
            Included in every check
          </div>

          <h2 className="mt-4 text-2xl font-bold text-black">What you get</h2>

          <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-700">
            <li>Estimated immediate maintenance and repair exposure</li>
            <li>Top likely cost drivers</li>
            <li>Simple risk signal for fast decision-making</li>
            <li>Suggested negotiation figure</li>
            <li>Full report unlock via one-time payment</li>
          </ul>

          <div className="mt-6 rounded-2xl border border-[#b91c1c]/20 bg-[#b91c1c]/5 p-4 text-sm text-slate-700">
            <div className="font-semibold uppercase tracking-wide text-[#b91c1c]">
              What comes next
            </div>
            <p className="mt-2 leading-6">
              Add listing URL parsing, DVLA and MoT enrichment, HPI depth,
              better valuation signals, and extension-based overlays once paid
              demand is proven.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}