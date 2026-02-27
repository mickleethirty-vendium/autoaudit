import Link from "next/link";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="grid gap-8 md:grid-cols-2 md:items-start">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Don&apos;t overpay for your next used car.
          </h1>
          <p className="mt-3 text-slate-700">
            Enter basic vehicle details to get an instant maintenance exposure
            estimate. Pay to unlock the full report with seller questions and a
            negotiation script.
          </p>

          <div className="mt-6 flex gap-3">
            <Link
              href="/check"
              className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700"
            >
              Start a check
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-900 hover:bg-slate-50"
            >
              How it works
            </Link>
          </div>

          <div className="mt-8 rounded-lg border bg-white p-4 text-sm text-slate-700">
            <div className="font-semibold">MVP note</div>
            <p className="mt-1">
              This v1 uses simple heuristics (rules of thumb). You can refine
              accuracy later. The goal is fast revenue validation.
            </p>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-6">
          <h2 className="text-xl font-bold">What you get</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-700">
            <li>Estimated immediate maintenance exposure (range)</li>
            <li>Top cost drivers (timing belt, gearbox service, etc.)</li>
            <li>Risk level (low → very high)</li>
            <li>Suggested negotiation figure</li>
            <li>Full report unlock via Stripe (one-time payment)</li>
          </ul>

          <div className="mt-6 rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
            <div className="font-semibold">Next steps after MVP</div>
            <p className="mt-1">
              Add listing URL parsing, DVLA/MOT lookups, and a Chrome extension
              overlay once you have proven paid demand.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
