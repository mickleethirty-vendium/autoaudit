import CheckForm from "./ui/CheckForm";

export default function CheckPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:py-12">
      <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-start">
        <div>
          <div className="inline-flex items-center rounded-full border border-[var(--aa-silver)] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#b91c1c] shadow-sm">
            AutoAudit
          </div>

          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-black sm:text-5xl">
            Start a used-car risk check
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-700 sm:text-lg">
            Enter the registration or a few vehicle details to generate a free
            snapshot. You’ll see estimated near-term repair exposure, key risk
            signals and MoT-backed warnings before deciding whether to unlock the
            full report.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-[var(--aa-silver)] bg-white p-4">
              <div className="text-sm font-semibold text-black">
                Free snapshot
              </div>
              <div className="mt-1 text-sm leading-6 text-slate-700">
                Instant repair exposure range and top risk signals.
              </div>
            </div>

            <div className="rounded-xl border border-[var(--aa-silver)] bg-white p-4">
              <div className="text-sm font-semibold text-black">
                MoT-backed view
              </div>
              <div className="mt-1 text-sm leading-6 text-slate-700">
                Use recent test history and advisory patterns to judge risk.
              </div>
            </div>

            <div className="rounded-xl border border-[var(--aa-silver)] bg-white p-4">
              <div className="text-sm font-semibold text-black">
                Unlock if needed
              </div>
              <div className="mt-1 text-sm leading-6 text-slate-700">
                Get detailed findings and optional HPI-style history checks.
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-[var(--aa-silver)] bg-slate-50/70 p-5 text-sm text-slate-700">
            <div className="font-semibold uppercase tracking-wide text-black">
              What happens next
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div>
                <div className="font-semibold text-black">1. Enter details</div>
                <div className="mt-1 leading-6">
                  Start with the registration and basic vehicle information.
                </div>
              </div>

              <div>
                <div className="font-semibold text-black">2. See snapshot</div>
                <div className="mt-1 leading-6">
                  Review the free estimate and key warning signs.
                </div>
              </div>

              <div>
                <div className="font-semibold text-black">3. Unlock report</div>
                <div className="mt-1 leading-6">
                  Buy only if you want the full findings and deeper checks.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--aa-silver)] bg-white p-6 shadow-sm">
          <div className="mb-4">
            <div className="inline-flex items-center rounded-full border border-[var(--aa-silver)] bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
              Vehicle check
            </div>

            <h2 className="mt-4 text-2xl font-bold text-black">
              Enter vehicle details
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-700">
              Start with the registration to generate your snapshot. No subscription,
              just a one-time report unlock if you want the full detail.
            </p>
          </div>

          <CheckForm />

          <div className="mt-5 rounded-xl border border-[#b91c1c]/20 bg-[#b91c1c]/5 p-4 text-sm text-slate-700">
            <div className="font-semibold text-black">
              Core report from £4.99
            </div>
            <div className="mt-1 leading-6">
              Includes detailed findings, repair cost guidance and MoT analysis.
              Full bundle available if you also want HPI-style history checks.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}