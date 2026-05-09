import type { Metadata } from "next";
import Link from "next/link";
import HeroCtaTextPanel from "@/components/seo/HeroCtaTextPanel";
import RegLookupCta from "@/components/seo/RegLookupCta";
import { absoluteUrl } from "@/lib/seo/routes";

export const metadata: Metadata = {
  title: "Questions to Ask When Buying a Used Car UK | AutoAudit",
  description:
    "Use this guide to know what questions to ask when buying a used car in the UK, avoid hidden risks, and check the exact car by registration before you buy.",
  alternates: {
    canonical: absoluteUrl("/questions-to-ask-when-buying-a-used-car-uk"),
  },
  openGraph: {
    title: "Questions to Ask When Buying a Used Car UK | AutoAudit",
    description:
      "Use this guide to know what questions to ask when buying a used car in the UK, avoid hidden risks, and check the exact car by registration before you buy.",
    url: absoluteUrl("/questions-to-ask-when-buying-a-used-car-uk"),
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Questions to ask when buying a used car UK | AutoAudit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Questions to Ask When Buying a Used Car UK | AutoAudit",
    description:
      "Use this guide to know what questions to ask when buying a used car in the UK, avoid hidden risks, and check the exact car by registration before you buy.",
    images: ["/og-image.png"],
  },
};

export default function QuestionsToAskUsedCarUkPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <HeroCtaTextPanel
        heroImageSrc="/hero-car-road.png"
        heroAlt="Questions to ask when buying a used car UK"
        title="Questions to ask when buying a used car (UK)"
        subtitle="Used car buyer guide"
        ctaComponent={
          <RegLookupCta
            title="Checking a car right now?"
            subtitle="Enter the registration to see MOT history, repeat advisories and hidden repair-cost risks before you buy."
            variant="light"
          />
        }
        bodyContent={
          <div className="space-y-3">
            <p>
              Asking the right questions when buying a used car can help you
              uncover hidden issues, understand how the car has been used and
              avoid overpaying.
            </p>
            <p>
              This guide gives you practical questions to ask — but the most
              important step is checking the actual vehicle history, not just the
              seller’s answers.
            </p>
          </div>
        }
      />

      <section className="mt-10 space-y-6">
        <h2 className="text-2xl font-semibold">
          Questions about the car’s history
        </h2>

        <ul className="list-disc pl-6 text-slate-700 space-y-2">
          <li>How long have you owned the car?</li>
          <li>Why are you selling it?</li>
          <li>Has the car been in any accidents?</li>
          <li>Is there full service history?</li>
          <li>Do you have invoices for recent work?</li>
        </ul>

        <p className="text-slate-700">
          These questions help you understand how the car has been treated and
          whether anything important is being hidden.
        </p>
      </section>

      <section className="mt-10 space-y-6">
        <h2 className="text-2xl font-semibold">
          Questions about condition and maintenance
        </h2>

        <ul className="list-disc pl-6 text-slate-700 space-y-2">
          <li>Have any parts recently been replaced?</li>
          <li>Are there any current faults or warnings?</li>
          <li>Have any MOT advisories been repaired?</li>
          <li>When were the tyres and brakes last changed?</li>
          <li>Has the clutch or suspension had work done?</li>
        </ul>

        <p className="text-slate-700">
          Answers here should match what you see and what appears in the MOT
          history.
        </p>
      </section>

      <section className="mt-10 space-y-6">
        <h2 className="text-2xl font-semibold">
          Questions about usage
        </h2>

        <ul className="list-disc pl-6 text-slate-700 space-y-2">
          <li>Was the car used for commuting or short trips?</li>
          <li>Has it done mainly motorway or town driving?</li>
          <li>How often was it driven?</li>
          <li>Has it been used for towing or heavy loads?</li>
        </ul>

        <p className="text-slate-700">
          Usage patterns can explain wear and help you interpret MOT advisories.
        </p>
      </section>

      <section className="mt-10 space-y-6">
        <h2 className="text-2xl font-semibold">
          Questions about price and negotiation
        </h2>

        <ul className="list-disc pl-6 text-slate-700 space-y-2">
          <li>Is the price negotiable?</li>
          <li>Have you considered recent repairs in the price?</li>
          <li>Are there any known issues reflected in the price?</li>
          <li>Would you accept an offer based on repairs needed?</li>
        </ul>

        <p className="text-slate-700">
          This helps you understand whether the seller is realistic and whether
          there is room to negotiate.
        </p>
      </section>

      <section className="mt-10 rounded-2xl border bg-slate-50 p-5">
        <h2 className="text-2xl font-semibold">
          Important: do not rely on answers alone
        </h2>
        <p className="mt-3 text-slate-700">
          Sellers may not always know the full history — or may not disclose
          everything. The most reliable way to assess risk is by checking the
          actual MOT history and patterns for the exact car.
        </p>
      </section>

      <section className="mt-10">
        <RegLookupCta
          title="Check the car’s real history"
          subtitle="Enter the registration to uncover MOT patterns, repeated advisories and hidden repair-cost risks."
        />
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">Useful next steps</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Link
            href="/used-car-buying-checklist-uk"
            className="rounded-xl border p-4 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <h3 className="font-medium">Buying checklist</h3>
            <p className="mt-1 text-sm text-slate-600">
              Follow a full step-by-step guide
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
            <h3 className="font-medium">Browse car guides</h3>
            <p className="mt-1 text-sm text-slate-600">
              Explore make and model problems
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}