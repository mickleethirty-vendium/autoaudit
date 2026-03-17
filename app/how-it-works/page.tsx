import Link from "next/link";

export default function HowItWorks() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:py-12">
      <div className="rounded-2xl border border-[var(--aa-silver)] bg-white p-8 shadow-sm">
        <div className="inline-flex items-center rounded-full border border-[var(--aa-silver)] bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700">
          How it works
        </div>

        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-black sm:text-4xl">
          How AutoAudit works
        </h1>

        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-700">
          AutoAudit helps you assess likely used-car risk before you buy.
          Start with a free snapshot, then unlock the full report only if you
          want more detail.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-[var(--aa-silver)] bg-slate-50/60 p-5">
            <div className="text-sm font-semibold uppercase tracking-wide text-black">
              1. Start a vehicle check
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              Enter the registration or basic vehicle details such as year,
              mileage, fuel type and transmission.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--aa-silver)] bg-slate-50/60 p-5">
            <div className="text-sm font-semibold uppercase tracking-wide text-black">
              2. Review the free snapshot
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              See estimated near-term repair exposure, confidence indicators and
              MoT-backed warning signals straight away.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--aa-silver)] bg-slate-50/60 p-5">
            <div className="text-sm font-semibold uppercase tracking-wide text-black">
              3. Unlock more detail if needed
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              Get the core report for detailed findings and MoT analysis, or
              choose the full bundle for added HPI-style history checks.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-black bg-white p-5">
            <div className="text-sm font-semibold uppercase tracking-wide text-black">
              Core Report
            </div>
            <div className="mt-2 text-3xl font-extrabold tracking-tight text-black">
              £4.99
            </div>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              <li>✔ Detailed findings and likely cost drivers</li>
              <li>✔ Itemised repair exposure guidance</li>
              <li>✔ Seller questions and negotiation guidance</li>
              <li>✔ MoT failures and advisory analysis</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-[var(--aa-red)] bg-red-50/40 p-5">
            <div className="text-sm font-semibold uppercase tracking-wide text-[var(--aa-red)]">
              Full Bundle
            </div>
            <div className="mt-2 text-3xl font-extrabold tracking-tight text-black">
              £9.99
            </div>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              <li>✔ Everything in the Core Report</li>
              <li>✔ Finance marker checks</li>
              <li>✔ Write-off and stolen history markers</li>
              <li>✔ Mileage anomaly and keeper history checks</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-[var(--aa-red)] bg-red-50 p-4 text-sm text-slate-700">
          <div className="font-semibold text-[var(--aa-red)]">Important</div>
          <p className="mt-1 leading-6">
            AutoAudit is guidance, not a physical mechanical inspection. Always
            verify service history and consider an independent inspection before
            purchasing a vehicle.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/check"
            className="inline-flex items-center justify-center rounded-xl border border-black bg-black px-5 py-3 font-semibold text-white transition hover:bg-[#111111]"
          >
            Start a check
          </Link>

          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-[var(--aa-silver)] bg-white px-5 py-3 font-semibold text-slate-900 transition hover:bg-slate-50"
          >
            Back home
          </Link>
        </div>
      </div>
    </div>
  );
}