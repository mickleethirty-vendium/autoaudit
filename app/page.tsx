import Link from "next/link";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
        <div>
          <div className="inline-flex items-center rounded-full border border-[var(--aa-silver)] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#b91c1c] shadow-sm">
            AutoAudit
          </div>

          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-black sm:text-5xl lg:text-6xl">
            Check the risk before you buy a used car.
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-700">
            AutoAudit helps UK used-car buyers spot likely near-term repair
            exposure, warning signs in the MoT history, and hidden history risks
            before committing to a vehicle.
          </p>

          <div className="mt-6 grid max-w-2xl gap-3 text-sm text-slate-700 sm:grid-cols-2">
            <div className="rounded-xl border border-[var(--aa-silver)] bg-white p-4">
              <div className="font-semibold text-black">
                Free snapshot preview
              </div>
              <div className="mt-1 leading-6">
                See estimated repair exposure, top risk signals and confidence
                score before paying.
              </div>
            </div>

            <div className="rounded-xl border border-[var(--aa-silver)] bg-white p-4">
              <div className="font-semibold text-black">
                Paid full report
              </div>
              <div className="mt-1 leading-6">
                Unlock detailed findings, MoT analysis and optional HPI-style
                history checks.
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/check"
              className="inline-flex items-center justify-center rounded-xl border border-[#b91c1c] bg-[#b91c1c] px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-[#991b1b] hover:shadow-md"
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

          <div className="mt-4 text-sm font-medium text-slate-700">
            Core report unlock from{" "}
            <span className="font-bold text-black">£4.99 one-time</span> — no
            subscription.
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-600">
            <span className="inline-flex items-center rounded-full border border-[var(--aa-silver)] bg-white px-3 py-1">
              Repair cost estimate
            </span>
            <span className="inline-flex items-center rounded-full border border-[var(--aa-silver)] bg-white px-3 py-1">
              MoT-backed risk signals
            </span>
            <span className="inline-flex items-center rounded-full border border-[var(--aa-silver)] bg-white px-3 py-1">
              Optional HPI-style bundle
            </span>
          </div>

          <div className="mt-8 rounded-2xl border border-[#b91c1c]/20 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-[#b91c1c]">
                  Example snapshot
                </div>
                <div className="mt-2 text-2xl font-extrabold tracking-tight text-black sm:text-3xl">
                  £650 – £1,450
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  Estimated near-term repair exposure
                </div>
              </div>

              <span className="inline-flex items-center rounded-full border border-[#b91c1c]/20 bg-[#b91c1c]/5 px-3 py-1 text-xs font-semibold text-[#b91c1c]">
                Negotiation ready
              </span>
            </div>

            <div className="mt-4 grid gap-2 text-sm text-slate-700">
              <div>• Timing belt replacement risk flagged</div>
              <div>• Recent MoT advisories detected</div>
              <div>• Suggested negotiation position included</div>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-[var(--aa-silver)] bg-slate-50/70 p-5 text-sm text-slate-700">
            <div className="font-semibold uppercase tracking-wide text-black">
              Why buyers use AutoAudit
            </div>
            <p className="mt-2 leading-6">
              Hidden repairs, poor MoT history and unresolved finance can turn a
              cheap used car into an expensive mistake. AutoAudit helps you spot
              the risk early and gives you a stronger position before you agree
              a price.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--aa-silver)] bg-white p-6 shadow-sm">
          <div className="inline-flex items-center rounded-full border border-[var(--aa-silver)] bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
            How it works
          </div>

          <h2 className="mt-4 text-2xl font-bold text-black">
            Make a better used-car decision in minutes
          </h2>

          <div className="mt-6 space-y-4">
            <div className="rounded-xl border border-[var(--aa-silver)] bg-slate-50/60 p-4">
              <div className="text-sm font-semibold text-black">
                1. Run a vehicle check
              </div>
              <div className="mt-1 text-sm leading-6 text-slate-700">
                Enter the registration or basic vehicle details to generate a
                risk snapshot.
              </div>
            </div>

            <div className="rounded-xl border border-[var(--aa-silver)] bg-slate-50/60 p-4">
              <div className="text-sm font-semibold text-black">
                2. Review the free snapshot
              </div>
              <div className="mt-1 text-sm leading-6 text-slate-700">
                See estimated repair exposure, risk indicators and MoT-backed
                warning signals.
              </div>
            </div>

            <div className="rounded-xl border border-[var(--aa-silver)] bg-slate-50/60 p-4">
              <div className="text-sm font-semibold text-black">
                3. Unlock the detail you need
              </div>
              <div className="mt-1 text-sm leading-6 text-slate-700">
                Get the core report for detailed findings and MoT analysis, or
                choose the full bundle for added HPI-style history checks.
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-[#b91c1c]/20 bg-[#b91c1c]/5 p-4 text-sm text-slate-700">
            <div className="font-semibold uppercase tracking-wide text-[#b91c1c]">
              Best for
            </div>
            <div className="mt-2 grid gap-2">
              <div>• Private sale buyers</div>
              <div>• Auto Trader and Marketplace shoppers</div>
              <div>• Anyone comparing multiple used cars quickly</div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-black bg-white p-4">
            <div className="text-sm font-semibold uppercase tracking-wide text-black">
              Pricing
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-[var(--aa-silver)] bg-slate-50 p-4">
                <div className="text-sm font-semibold text-black">
                  Core Report
                </div>
                <div className="mt-1 text-2xl font-extrabold text-black">
                  £4.99
                </div>
                <div className="mt-1 text-sm text-slate-700">
                  Detailed findings, repair exposure and MoT analysis
                </div>
              </div>

              <div className="rounded-xl border border-[#b91c1c]/20 bg-[#b91c1c]/5 p-4">
                <div className="text-sm font-semibold text-black">
                  Full Bundle
                </div>
                <div className="mt-1 text-2xl font-extrabold text-black">
                  £9.99
                </div>
                <div className="mt-1 text-sm text-slate-700">
                  Core report plus HPI-style history checks
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Link
              href="/check"
              className="inline-flex w-full items-center justify-center rounded-xl border border-[#b91c1c] bg-[#b91c1c] px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-[#991b1b] hover:shadow-md"
            >
              Start a check
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}