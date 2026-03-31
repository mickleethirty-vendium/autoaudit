import type { Metadata } from "next";
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

      <h1 className="text-3xl font-bold tracking-tight">
        Check a Car by Registration
      </h1>
      <p className="mt-4 text-lg text-slate-700">
        Enter a UK registration to see MOT history, repair risk, market value
        and buyer warnings before you commit to a used car.
      </p>

      <section className="mt-8 rounded-2xl border p-6">
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
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">What AutoAudit checks</h2>
        <ul className="list-disc pl-6 text-slate-700">
          <li>MOT history and advisory patterns</li>
          <li>Repair exposure estimate</li>
          <li>Market value context</li>
          <li>Known model issues</li>
          <li>Finance and write-off checks on the bundle plan</li>
        </ul>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">Why buyers use it</h2>
        <p className="text-slate-700">
          The goal is simple: help you avoid overpaying, spot repair risks early
          and ask better questions before purchase.
        </p>
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