import Link from "next/link";
import ShieldIcon from "@/app/components/ShieldIcon";

export default function HowItWorks() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:py-12">
      <div className="overflow-hidden rounded-3xl border border-[var(--aa-silver)] bg-white shadow-sm">
        <div className="border-b border-[var(--aa-silver)] bg-[var(--aa-black)] px-6 py-10 text-white sm:px-8 sm:py-12">
          <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/90">
            How it works
          </div>

          <h1 className="mt-4 max-w-4xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Check the risk before you commit to a used car
          </h1>

          <p className="mt-4 max-w-3xl text-base leading-7 text-white/85 sm:text-lg">
            AutoAudit helps you spot likely repair exposure, warning signs in
            the MoT history, and hidden ownership risks before you buy. Start
            with a free snapshot, then unlock more detail only if you need it.
          </p>
        </div>

        <div className="px-6 py-8 sm:px-8 sm:py-10">
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-[var(--aa-silver)] bg-slate-50/70 p-5">
              <div className="text-sm font-semibold uppercase tracking-wide text-black">
                1. Start a vehicle check
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                Enter the registration or basic vehicle details such as year,
                mileage, fuel type and transmission.
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--aa-silver)] bg-slate-50/70 p-5">
              <div className="text-sm font-semibold uppercase tracking-wide text-black">
                2. Review the free snapshot
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                See estimated near-term repair exposure, confidence indicators
                and MoT-backed warning signals straight away.
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--aa-silver)] bg-slate-50/70 p-5">
              <div className="text-sm font-semibold uppercase tracking-wide text-black">
                3. Unlock more detail if needed
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                Get the Core Report for detailed findings and MoT analysis, or
                choose the Full Bundle for added HPI-style history checks.
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <div className="flex items-start gap-4 rounded-2xl border border-[var(--aa-silver)] bg-white p-5">
              <ShieldIcon className="mt-0.5 h-10 w-10 shrink-0" />
              <div>
                <div className="text-lg font-bold text-black">Free Snapshot</div>
                <p className="mt-1 text-sm leading-6 text-slate-700">
                  Instant repair exposure range, risk indicators and confidence
                  score before paying.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-2xl border border-[var(--aa-silver)] bg-white p-5">
              <ShieldIcon className="mt-0.5 h-10 w-10 shrink-0" />
              <div>
                <div className="text-lg font-bold text-black">MoT Insights</div>
                <p className="mt-1 text-sm leading-6 text-slate-700">
                  DVSA-backed MoT history helps surface failures, advisories and
                  repeated warning patterns.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-2xl border border-[var(--aa-silver)] bg-white p-5">
              <ShieldIcon className="mt-0.5 h-10 w-10 shrink-0" />
              <div>
                <div className="text-lg font-bold text-black">History Checks</div>
                <p className="mt-1 text-sm leading-6 text-slate-700">
                  The Full Bundle adds HPI-style checks for finance, write-off,
                  theft, mileage and keeper history.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-black bg-white p-6">
              <div className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Core Report
              </div>
              <div className="mt-2 text-4xl font-extrabold tracking-tight text-black">
                £4.99
              </div>
              <div className="mt-2 text-sm font-semibold text-slate-900">
                Detailed findings and MoT analysis
              </div>

              <ul className="mt-5 space-y-2 text-sm text-slate-700">
                <li>✔ Detailed findings and likely cost drivers</li>
                <li>✔ Itemised repair exposure guidance</li>
                <li>✔ Seller questions and negotiation guidance</li>
                <li>✔ MoT failures and advisory analysis</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-[var(--aa-red)]/20 bg-[var(--aa-red)]/5 p-6">
              <div className="text-sm font-semibold uppercase tracking-wide text-[var(--aa-red)]">
                Full Bundle
              </div>
              <div className="mt-2 text-4xl font-extrabold tracking-tight text-black">
                £9.99
              </div>
              <div className="mt-2 text-sm font-semibold text-slate-900">
                Core Report plus HPI-style history checks
              </div>

              <ul className="mt-5 space-y-2 text-sm text-slate-700">
                <li>✔ Everything in the Core Report</li>
                <li>✔ Finance marker checks</li>
                <li>✔ Write-off and stolen history markers</li>
                <li>✔ Mileage anomaly and keeper history checks</li>
              </ul>
            </div>
          </div>

          <div className="mt-10 rounded-2xl border border-[var(--aa-red)]/20 bg-red-50 p-5 text-sm text-slate-700">
            <div className="font-semibold text-[var(--aa-red)]">Important</div>
            <p className="mt-2 leading-6">
              AutoAudit is guidance, not a physical mechanical inspection.
              Always verify service history and consider an independent
              inspection before purchasing a vehicle.
            </p>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/check" className="btn-primary">
              Start a check
            </Link>

            <Link href="/" className="btn-outline">
              Back home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}