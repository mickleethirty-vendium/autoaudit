import Link from "next/link";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="grid gap-10 md:grid-cols-2 md:items-start">
        <div>
          <div className="inline-flex items-center rounded-full border border-[var(--aa-silver)] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#b91c1c] shadow-sm">
            AutoAudit
          </div>

          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-black sm:text-5xl">
            Don&apos;t overpay for your next used car.
          </h1>

          <div className="mt-5 max-w-xl space-y-3 text-base leading-7 text-slate-700">
            <p>
              Are you thinking of buying a used car but don&apos;t know what
              common faults and repairs to look for?
            </p>

            <p>Worried about MoT history?</p>

            <p>Concerned about outstanding finance and historical damage?</p>

            <p className="font-semibold text-black">
              Hit &quot;Start a check&quot;, enter the registration number or
              basic details and we will...
            </p>
          </div>

          <ul className="mt-4 max-w-xl list-disc space-y-2 pl-5 text-slate-700">
            <li>
              Expose common serviceable and replacement items, along with an
              estimated remedial repair cost
            </li>
            <li>
              Give you a full MoT history including failures and advisories
            </li>
            <li>
              Provide a FULL HPI check to confirm there is no outstanding
              finance, historical write-offs and more
            </li>
          </ul>

          <div className="mt-7 flex flex-wrap gap-3">
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

          <div className="mt-3 text-sm font-medium text-slate-700">
            Full report unlock is just <span className="font-bold text-black">£4.99 one-time</span> — no subscription.
          </div>

          <div className="mt-4 text-sm text-slate-600">
            ✓ MoT data included • ✓ HPI checks • ✓ Repair cost estimates
          </div>

          <div className="mt-6 rounded-2xl border border-[#b91c1c]/20 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-[#b91c1c]">
                  Example result
                </div>
                <div className="mt-2 text-2xl font-extrabold tracking-tight text-black">
                  £650 – £1,450
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  Estimated near-term maintenance exposure
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

          <h2 className="mt-4 text-2xl font-bold text-black">
            What you get before you buy
          </h2>

          <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-700">
            <li>Estimated immediate maintenance and repair exposure</li>
            <li>Top likely cost drivers</li>
            <li>Simple risk signal for fast decision-making</li>
            <li>Suggested negotiation figure</li>
            <li>Full report unlock via one-time payment</li>
          </ul>

          <div className="mt-6 rounded-2xl border border-[#b91c1c]/20 bg-[#b91c1c]/5 p-4 text-sm text-slate-700">
            <div className="font-semibold uppercase tracking-wide text-[#b91c1c]">
              Why this matters
            </div>
            <p className="mt-2 leading-6">
              Hidden repairs, poor MoT history and unresolved finance can
              quickly turn a cheap used car into an expensive mistake.
              AutoAudit helps you spot the risk before you buy and gives you a
              stronger position when negotiating.
            </p>
          </div>

          <div className="mt-6 rounded-2xl border border-[var(--aa-silver)] bg-slate-50/60 p-4 text-sm text-slate-700">
            <div className="font-semibold uppercase tracking-wide text-black">
              Best for
            </div>
            <div className="mt-2 grid gap-2">
              <div>• Private sale buyers</div>
              <div>• Facebook Marketplace and Auto Trader shoppers</div>
              <div>• Anyone comparing multiple used cars quickly</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}