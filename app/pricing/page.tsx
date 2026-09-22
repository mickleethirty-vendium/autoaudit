import ViewEvent from "@/components/conversion/ViewEvent";
import type { Metadata } from "next";
import Link from "next/link";
import RegLookupCta from "@/components/seo/RegLookupCta";
import { absoluteUrl } from "@/lib/seo/routes";
import { faqSchema } from "@/lib/seo/schema";

export const metadata: Metadata = {
  title: "Pricing | AutoAudit",
  description:
    "AutoAudit pricing for used car checks, buyer-risk reports and MOT advisory analysis before you buy.",
  alternates: {
    canonical: absoluteUrl("/pricing"),
  },
  openGraph: {
    title: "Pricing | AutoAudit",
    description:
      "AutoAudit pricing for used car checks, buyer-risk reports and MOT advisory analysis before you buy.",
    url: absoluteUrl("/pricing"),
    type: "website",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing | AutoAudit",
    description:
      "AutoAudit pricing for used car checks, buyer-risk reports and MOT advisory analysis before you buy.",
    images: ["/og-image.png"],
  },
};

export default function PricingPage() {
  const faqs = [
    {
      question: "Can I check a car for free?",
      answer:
        "Yes. AutoAudit gives you a free initial snapshot before you decide whether to unlock the full buyer-risk report.",
    },
    {
      question: "What does the paid report include?",
      answer:
        "The paid report focuses on MOT history, advisory patterns, mileage signals, likely repair-risk areas and practical buyer guidance for the specific vehicle.",
    },
    {
      question: "Is AutoAudit a replacement for a physical inspection?",
      answer:
        "No. AutoAudit helps you decide whether a car is worth viewing, questioning or negotiating on, but it does not replace a professional inspection.",
    },
  ];

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <ViewEvent event="pricing_viewed" data={{ page_type: "pricing" }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }}
      />

      <section className="rounded-3xl bg-slate-950 p-6 text-white md:p-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-red-300">
          Pricing
        </p>
        <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight md:text-5xl text-white">
          Check a used car before you buy it
        </h1>
        <p className="mt-4 max-w-3xl text-lg text-slate-200">
          Start with a free snapshot, then unlock a fuller buyer-risk report
          when you want deeper insight into MOT history, advisories and likely
          repair-cost signals.
        </p>
      </section>

      <section className="mt-10 grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border p-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Free
          </p>
          <h2 className="mt-2 text-2xl font-bold">Vehicle snapshot</h2>
          <p className="mt-2 text-slate-700">
            A quick first look to help you decide whether the car is worth
            investigating further.
          </p>
          <p className="mt-5 text-4xl font-bold">£0</p>

          <ul className="mt-5 space-y-2 text-slate-700">
            <li>Basic vehicle lookup</li>
            <li>Initial buyer-risk signals</li>
            <li>Useful before shortlisting cars</li>
            <li>Upgrade only if you want the deeper report</li>
          </ul>

          <div className="mt-6">
            <a href="#pricing-check" className="btn-outline inline-flex min-h-[48px] items-center">Start with a free snapshot →</a>
          </div>
        </div>

        <div className="rounded-2xl border-2 border-slate-950 p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-red-600">
            Most useful before buying
          </p>
          <h2 className="mt-2 text-2xl font-bold">Core Report</h2>
          <p className="mt-2 text-slate-700">
            Designed for buyers who are close to viewing, negotiating or paying
            for a used car.
          </p>
          <p className="mt-5 text-4xl font-bold">£4.99</p>

          <ul className="mt-5 space-y-2 text-slate-700">
            <li>MOT history interpretation</li>
            <li>Recurring advisory pattern checks</li>
            <li>Repair-risk warning areas</li>
            <li>Mileage and usage context</li>
            <li>Buyer checklist and negotiation prompts</li>
          </ul>

          <div className="mt-6">
            <a href="#pricing-check" className="btn-outline inline-flex min-h-[48px] items-center">Start with a free snapshot →</a>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6">
        <h2 className="text-2xl font-bold">Full Bundle including HPI · £9.99</h2>
        <p className="mt-3 text-slate-700">Everything in the £4.99 Core Report, plus available finance, write-off, stolen, mileage anomaly, keeper and plate-change checks. A one-off payment, with no subscription.</p>
        <p className="mt-2 text-sm text-slate-600">Already have Core? Add HPI for £5 from your report. History checks reflect available records and do not replace an inspection.</p>
        <a href="#pricing-check" className="mt-3 inline-flex min-h-[48px] items-center font-semibold underline">Start with the free snapshot →</a>
      </section>
      <section className="mt-12 rounded-2xl border bg-slate-50 p-6">
        <h2 className="text-2xl font-semibold">Why pay for a report?</h2>
        <p className="mt-2 text-slate-700">
          A cheap used car can become expensive quickly if it has repeated MOT
          advisories, neglected maintenance or hidden wear patterns. AutoAudit is
          designed to help you spot those warning signs before the car becomes
          your problem.
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Before viewing",
              text: "Avoid wasting time on cars that already show worrying history patterns.",
            },
            {
              title: "Before negotiating",
              text: "Use advisory and repair-risk signals to ask better questions.",
            },
            {
              title: "Before paying",
              text: "Get a clearer view of the exact car before leaving a deposit.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-xl bg-white p-4">
              <h3 className="font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12 space-y-4">
        <h2 className="text-2xl font-semibold">What the full report focuses on</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            "Whether MOT advisories look isolated or repeated",
            "Whether tyres, brakes, suspension or corrosion appear as recurring issues",
            "Whether the vehicle may need near-term repair spend",
            "What to inspect during a viewing or test drive",
            "What to question with the seller",
            "Whether general model risks appear relevant to the exact car",
          ].map((item) => (
            <div key={item} className="rounded-xl border p-4">
              {item}
            </div>
          ))}
        </div>
      </section>

      <section id="pricing-check" className="mt-12 scroll-mt-24 rounded-2xl border bg-slate-950 p-6 text-white">
        <h2 className="text-2xl font-semibold text-white">
          Check the car before you buy it
        </h2>
        <p className="mt-2 text-slate-200">
          Enter the registration and start with the free snapshot.
        </p>
        <div className="mt-5">
          <RegLookupCta intent="general" position="end"
            title="Start your AutoAudit check"
            subtitle="Move from guesswork to vehicle-specific buyer-risk insight."
            variant="dark"
          />
        </div>
      </section>

      <section className="mt-12 space-y-4">
        <h2 className="text-2xl font-semibold">FAQ</h2>
        {faqs.map((faq) => (
          <div key={faq.question} className="rounded-xl border p-4">
            <h3 className="font-medium">{faq.question}</h3>
            <p className="mt-2 text-slate-700">{faq.answer}</p>
          </div>
        ))}
      </section>

      <section className="mt-10 text-sm text-slate-600">
        <Link
          href="/sample-report"
          className="font-medium underline underline-offset-2"
        >
          View a sample report
        </Link>{" "}
        or{" "}
        <Link
          href="/how-it-works"
          className="font-medium underline underline-offset-2"
        >
          see how AutoAudit works
        </Link>
        .
      </section>
    </main>
  );
}