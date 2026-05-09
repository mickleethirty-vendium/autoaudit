import type { Metadata } from "next";
import Link from "next/link";
import HeroCtaTextPanel from "@/components/seo/HeroCtaTextPanel";
import RegLookupCta from "@/components/seo/RegLookupCta";
import { absoluteUrl } from "@/lib/seo/routes";

export const metadata: Metadata = {
  title: "Used Car Buying Checklist UK | AutoAudit",
  description:
    "Follow this used car buying checklist in the UK to avoid hidden risks, compare condition properly, and check the exact car by registration before you buy.",
  alternates: {
    canonical: absoluteUrl("/used-car-buying-checklist-uk"),
  },
  openGraph: {
    title: "Used Car Buying Checklist UK | AutoAudit",
    description:
      "Follow this used car buying checklist in the UK to avoid hidden risks, compare condition properly, and check the exact car by registration before you buy.",
    url: absoluteUrl("/used-car-buying-checklist-uk"),
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Used car buying checklist UK | AutoAudit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Used Car Buying Checklist UK | AutoAudit",
    description:
      "Follow this used car buying checklist in the UK to avoid hidden risks, compare condition properly, and check the exact car by registration before you buy.",
    images: ["/og-image.png"],
  },
};

export default function UsedCarBuyingChecklistUkPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <HeroCtaTextPanel
        heroImageSrc="/hero-car-road.png"
        heroAlt="Used car buying checklist UK"
        title="Used car buying checklist (UK)"
        subtitle="Step-by-step buyer guide"
        ctaComponent={
          <RegLookupCta
            title="Checking a car now?"
            subtitle="Enter the registration to see MOT history, repeated advisories and hidden repair-cost risks before you buy."
            variant="light"
          />
        }
        bodyContent={
          <div className="space-y-3">
            <p>
              Buying a used car can be good value — but only if you avoid hidden
              risks. This checklist helps you assess condition, spot warning
              signs and avoid overpaying.
            </p>
            <p>
              The most important step is checking the exact car by registration,
              not just relying on model reputation or seller claims.
            </p>
          </div>
        }
      />

      <section className="mt-10 space-y-6">
        <h2 className="text-2xl font-semibold">
          1. Before you view the car
        </h2>

        <ul className="list-disc pl-6 text-slate-700 space-y-2">
          <li>Check MOT history online</li>
          <li>Look for repeated advisories</li>
          <li>Check mileage consistency across tests</li>
          <li>Compare price with similar listings</li>
          <li>Research common problems for the model</li>
        </ul>

        <p className="text-slate-700">
          This step alone can eliminate many risky cars before you waste time
          viewing them.
        </p>
      </section>

      <section className="mt-10 space-y-6">
        <h2 className="text-2xl font-semibold">
          2. When you view the car
        </h2>

        <ul className="list-disc pl-6 text-slate-700 space-y-2">
          <li>Check tyres for uneven wear</li>
          <li>Look for brake wear or noises</li>
          <li>Inspect bodywork for damage or poor repairs</li>
          <li>Check interior condition and wear</li>
          <li>Look for warning lights on the dashboard</li>
        </ul>

        <p className="text-slate-700">
          Physical condition should match the seller’s description and asking
          price.
        </p>
      </section>

      <section className="mt-10 space-y-6">
        <h2 className="text-2xl font-semibold">
          3. Questions to ask the seller
        </h2>

        <ul className="list-disc pl-6 text-slate-700 space-y-2">
          <li>Has the car had any recent repairs?</li>
          <li>Are there invoices or service records?</li>
          <li>Why is the car being sold?</li>
          <li>Have any advisories been fixed?</li>
          <li>Has the car been used for commuting, short trips or long journeys?</li>
        </ul>
      </section>

      <section className="mt-10 space-y-6">
        <h2 className="text-2xl font-semibold">
          4. Red flags to watch for
        </h2>

        <ul className="list-disc pl-6 text-slate-700 space-y-2">
          <li>Repeated MOT advisories over multiple years</li>
          <li>Gaps in MOT or service history</li>
          <li>Seller cannot explain past issues</li>
          <li>Price seems too low for the condition</li>
          <li>Multiple issues appearing together (e.g. tyres + suspension + brakes)</li>
        </ul>

        <p className="text-slate-700">
          These often indicate higher risk and potential future costs.
        </p>
      </section>

      <section className="mt-10 space-y-6">
        <h2 className="text-2xl font-semibold">
          5. Before you buy
        </h2>

        <ul className="list-disc pl-6 text-slate-700 space-y-2">
          <li>Run a full registration check</li>
          <li>Confirm MOT history matches seller claims</li>
          <li>Factor in repair costs before agreeing price</li>
          <li>Use issues as negotiation leverage</li>
          <li>Only proceed if the condition matches the price</li>
        </ul>
      </section>

      <section className="mt-10 rounded-2xl border bg-slate-50 p-5">
        <h2 className="text-2xl font-semibold">
          The most important step
        </h2>
        <p className="mt-3 text-slate-700">
          Model guides and checklists help, but they cannot tell you the full
          story. The real risk depends on the exact car — its MOT history,
          advisories and maintenance record.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">Useful next steps</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Link
            href="/best-used-cars-for-new-drivers-uk"
            className="rounded-xl border p-4 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <h3 className="font-medium">Best cars for new drivers</h3>
            <p className="mt-1 text-sm text-slate-600">
              Compare safer entry-level cars
            </p>
          </Link>
          <Link
            href="/cheapest-cars-to-insure-uk"
            className="rounded-xl border p-4 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <h3 className="font-medium">Cheapest cars to insure</h3>
            <p className="mt-1 text-sm text-slate-600">
              Compare cost-focused options
            </p>
          </Link>
          <Link
            href="/cars"
            className="rounded-xl border p-4 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <h3 className="font-medium">Browse all car guides</h3>
            <p className="mt-1 text-sm text-slate-600">
              Explore make and model problems
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}