import type { Metadata } from "next";
import Image from "next/image";
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
    <main className="mx-auto max-w-5xl px-4 py-10">
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

      <section className="overflow-hidden rounded-3xl border bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-2">
          <div className="relative min-h-[280px] lg:min-h-full">
            <Image
              src="/hero-car-road.png"
              alt="Used car driving on an open road"
              fill
              priority
              className="object-cover"
            />
          </div>

          <div className="p-6 sm:p-8 lg:p-10">
            <div className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
              UK used car check
            </div>

            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Check a Car by Registration Before You Buy
            </h1>

            <p className="mt-4 text-lg text-slate-700">
              Run a UK car check by registration to spot MOT warning signs,
              repair risk, market value issues and hidden buying mistakes before
              you hand over any money.
            </p>

            <div className="mt-6 rounded-2xl border-2 border-slate-900 bg-slate-50 p-5">
              <h2 className="text-xl font-semibold">
                Enter the registration now
              </h2>
              <p className="mt-2 text-slate-700">
                Get a free snapshot first. If the car looks risky or overpriced,
                you will know before you commit.
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
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base uppercase tracking-[0.2em]"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-slate-900 px-6 py-3 text-base font-semibold text-white shadow-sm"
                >
                  Check this car
                </button>
              </form>

              <p className="mt-3 text-sm font-medium text-slate-600">
                Free preview • MOT history • Repair risk estimate • Market value
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">Why people land on this page</h2>
        <p className="text-slate-700">
          Most buyers search for a car check when they are already looking at a
          specific vehicle and want to know one thing: is this car likely to be
          a mistake? AutoAudit helps answer that before you buy.
        </p>
        <ul className="list-disc pl-6 text-slate-700">
          <li>Check whether the MOT history suggests repeat problems</li>
          <li>See whether the price looks sensible for the car</li>
          <li>Spot likely repair exposure before viewing or buying</li>
          <li>Use evidence to negotiate more confidently with the seller</li>
        </ul>
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

      <section className="mt-10 rounded-3xl border bg-slate-900 p-6 text-white">
        <h2 className="text-2xl font-semibold">
          Found a car already? Run the check now.
        </h2>
        <p className="mt-3 max-w-2xl text-slate-200">
          If you have the registration, you already have enough to start.
          Check the car before the viewing, before the deposit and before you
          talk yourself into a bad deal.
        </p>

        <form
          action="/check"
          method="GET"
          className="mt-5 flex flex-col gap-3 sm:flex-row"
        >
          <input
            type="text"
            name="registration"
            placeholder="Enter registration"
            required
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base uppercase tracking-[0.2em] text-slate-900"
          />
          <button
            type="submit"
            className="rounded-xl bg-white px-6 py-3 text-base font-semibold text-slate-900"
          >
            Start free check
          </button>
        </form>
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