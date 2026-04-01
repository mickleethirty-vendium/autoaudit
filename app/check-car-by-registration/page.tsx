import type { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl } from "@/lib/seo/routes";
import { breadcrumbSchema, faqSchema, productSchema } from "@/lib/seo/schema";

export const metadata: Metadata = {
  title: "Check a Car by Registration | AutoAudit",
  description:
    "Check a used car by registration to see MOT history, repair risk, market value and buyer warnings before you buy.",
  alternates: {
    canonical: absoluteUrl("/check-car-by-registration"),
  },
  openGraph: {
    title: "Check a Car by Registration | AutoAudit",
    description:
      "Run a UK car check by registration and see MOT history, repair risk and market value.",
    url: absoluteUrl("/check-car-by-registration"),
    type: "website",
  },
};

const faqs = [
  {
    question: "What do I see in the free preview?",
    answer:
      "The free preview is designed to show a snapshot of risk, including repair exposure, pricing context and selected report highlights before you unlock the full report.",
  },
  {
    question: "What is included in the paid report?",
    answer:
      "The paid report adds a fuller breakdown of repair risks, known model issues, MOT advisory patterns, negotiation guidance and seller questions.",
  },
  {
    question: "Do you offer HPI-style checks?",
    answer:
      "Yes. AutoAudit offers a full bundle that adds finance, write-off and related history checks.",
  },
];

const popularGuides = [
  {
    href: "/cars/audi/a1/common-problems",
    label: "Audi A1 common problems",
  },
  {
    href: "/cars/audi/a3/common-problems",
    label: "Audi A3 common problems",
  },
  {
    href: "/cars/bmw/3-series/common-problems",
    label: "BMW 3 Series common problems",
  },
  {
    href: "/cars/ford/fiesta/common-problems",
    label: "Ford Fiesta common problems",
  },
];

const advisoryGuides = [
  {
    href: "/mot-advisories",
    label: "MOT advisory guides",
  },
  {
    href: "/mot-history-check",
    label: "MOT history check",
  },
];

export default function CheckCarByRegistrationPage() {
  const breadcrumbs = breadcrumbSchema([
    { name: "Home", item: "/" },
    { name: "Check car by registration", item: "/check-car-by-registration" },
  ]);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbs),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema(faqs)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productSchema()),
        }}
      />

      <section className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Check a Car by Registration
          </h1>
          <p className="mt-4 text-lg text-slate-700">
            Enter a UK registration to see MOT history, repair risk, market
            value and buyer warnings before you commit to a used car.
          </p>
        </div>

        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Run a check now</h2>
          <p className="mt-2 text-slate-700">
            Enter a registration to check MOT history, repair risk and market
            value before you buy.
          </p>

          <form
            action="/check"
            method="GET"
            className="mt-4 flex flex-col gap-3 sm:flex-row"
          >
            <input
              type="text"
              name="registration"
              placeholder="Enter registration"
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base uppercase tracking-wide"
            />
            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-6 py-3 text-white"
            >
              Check car
            </button>
          </form>

          <div className="mt-4 flex flex-wrap gap-2 text-sm text-slate-600">
            <span className="rounded-full bg-slate-100 px-3 py-1">
              Free preview
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1">
              MOT history
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1">
              Repair risk estimate
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1">
              Market value context
            </span>
          </div>
        </section>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">What AutoAudit checks</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border p-4">
            <h3 className="font-medium">MOT history and advisories</h3>
            <p className="mt-2 text-slate-700">
              Surface patterns in test history, repeat advisories and warning
              signs that matter before purchase.
            </p>
          </div>
          <div className="rounded-2xl border p-4">
            <h3 className="font-medium">Repair exposure estimate</h3>
            <p className="mt-2 text-slate-700">
              Show likely near-term repair risk so buyers can budget and
              negotiate with more confidence.
            </p>
          </div>
          <div className="rounded-2xl border p-4">
            <h3 className="font-medium">Market value context</h3>
            <p className="mt-2 text-slate-700">
              Compare the asking price with broader pricing signals to help spot
              overpayment risk.
            </p>
          </div>
          <div className="rounded-2xl border p-4">
            <h3 className="font-medium">Known issues and history checks</h3>
            <p className="mt-2 text-slate-700">
              Highlight known model issues, plus finance and write-off checks on
              the bundle plan.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">How it works</h2>
        <ol className="grid gap-4 sm:grid-cols-3">
          <li className="rounded-2xl border p-4">
            <span className="text-sm font-medium text-slate-500">Step 1</span>
            <h3 className="mt-1 font-medium">Enter the registration</h3>
            <p className="mt-2 text-slate-700">
              Start with the UK number plate of the car you are considering.
            </p>
          </li>
          <li className="rounded-2xl border p-4">
            <span className="text-sm font-medium text-slate-500">Step 2</span>
            <h3 className="mt-1 font-medium">See the free snapshot</h3>
            <p className="mt-2 text-slate-700">
              Review the initial risk picture before deciding whether to unlock
              more detail.
            </p>
          </li>
          <li className="rounded-2xl border p-4">
            <span className="text-sm font-medium text-slate-500">Step 3</span>
            <h3 className="mt-1 font-medium">Use the full report</h3>
            <p className="mt-2 text-slate-700">
              Get negotiation support, deeper warnings and extra history checks
              where needed.
            </p>
          </li>
        </ol>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">Why buyers use it</h2>
        <p className="text-slate-700">
          The goal is simple: help you avoid overpaying, spot repair risks early
          and ask better questions before purchase.
        </p>
        <ul className="list-disc pl-6 text-slate-700">
          <li>Check whether the MOT history suggests recurring issues</li>
          <li>Understand whether the asking price looks sensible</li>
          <li>Spot warning signs before viewing or buying</li>
          <li>Use evidence to negotiate with more confidence</li>
        </ul>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">Popular reliability guides</h2>
        <p className="text-slate-700">
          Explore some of the most searched model reliability guides, then check
          the exact car by registration.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {popularGuides.map((guide) => (
            <Link
              key={guide.href}
              href={guide.href}
              className="rounded-xl border p-4 transition hover:border-slate-400 hover:bg-slate-50"
            >
              <h3 className="font-medium">{guide.label}</h3>
              <p className="mt-1 text-sm text-slate-600">
                View common problems and buyer warnings
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">Related checks and guides</h2>
        <ul className="list-disc pl-6 text-slate-700">
          {advisoryGuides.map((guide) => (
            <li key={guide.href}>
              <Link href={guide.href} className="underline">
                {guide.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">FAQ</h2>
        {faqs.map((faq) => (
          <div key={faq.question} className="rounded-xl border p-4">
            <h3 className="font-medium">{faq.question}</h3>
            <p className="mt-2 text-slate-700">{faq.answer}</p>
          </div>
        ))}
      </section>
    </main>
  );
}