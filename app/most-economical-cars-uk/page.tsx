import type { Metadata } from "next";
import Link from "next/link";
import HeroCtaTextPanel from "@/components/seo/HeroCtaTextPanel";
import RegLookupCta from "@/components/seo/RegLookupCta";
import { absoluteUrl } from "@/lib/seo/routes";

export const metadata: Metadata = {
  title: "Most Economical Cars UK | AutoAudit",
  description:
    "Browse the most economical cars in the UK, compare running costs, and check the exact car by registration before you buy.",
  alternates: {
    canonical: absoluteUrl("/most-economical-cars-uk"),
  },
  openGraph: {
    title: "Most Economical Cars UK | AutoAudit",
    description:
      "Browse the most economical cars in the UK, compare running costs, and check the exact car by registration before you buy.",
    url: absoluteUrl("/most-economical-cars-uk"),
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Most economical cars UK | AutoAudit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Most Economical Cars UK | AutoAudit",
    description:
      "Browse the most economical cars in the UK, compare running costs, and check the exact car by registration before you buy.",
    images: ["/og-image.png"],
  },
};

const recommendedCars = [
  {
    name: "Toyota Prius",
    href: "/cars/toyota/prius/common-problems",
    summary:
      "A well-known economical hybrid, but still check battery health, servicing and MOT advisory patterns.",
  },
  {
    name: "Toyota Corolla",
    href: "/cars/toyota/corolla/common-problems",
    summary:
      "A sensible economical option with hybrid variants, but check tyres, brakes and servicing history.",
  },
  {
    name: "Hyundai Ioniq",
    href: "/cars/hyundai/ioniq/common-problems",
    summary:
      "A strong fuel-efficient choice, but check maintenance, battery condition and MOT history.",
  },
  {
    name: "Volkswagen Golf",
    href: "/cars/volkswagen/golf/common-problems",
    summary:
      "Efficient diesel and petrol options available, but condition and maintenance matter more than fuel claims.",
  },
  {
    name: "Ford Focus",
    href: "/cars/ford/focus/common-problems",
    summary:
      "A common economical choice, but check clutch wear, suspension and repeat advisories.",
  },
  {
    name: "Skoda Octavia",
    href: "/cars/skoda/octavia/common-problems",
    summary:
      "A practical and efficient option, but check tyres, brakes and servicing carefully.",
  },
];

export default function MostEconomicalCarsUkPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <HeroCtaTextPanel
        heroImageSrc="/hero-car-road.png"
        heroAlt="Most economical cars in the UK"
        title="Most economical cars in the UK"
        subtitle="Used car buying guide"
        ctaComponent={
          <RegLookupCta
            title="Found an economical car?"
            subtitle="Check the exact registration for MOT history, repeated advisories and hidden repair-cost risks before you buy."
            variant="light"
          />
        }
        bodyContent={
          <div className="space-y-3">
            <p>
              Fuel economy is a key factor for many used car buyers, especially
              for commuting and long-distance driving. But the most economical
              car on paper is not always the cheapest to own.
            </p>
            <p>
              Use this guide to shortlist efficient cars, then check the exact
              registration before viewing, negotiating or paying a deposit.
            </p>
          </div>
        }
      />

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">
          Most economical cars to consider in the UK
        </h2>
        <p className="text-slate-700">
          These models are often chosen for their fuel efficiency, but the safest
          choice is still the individual car with the best condition and history.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recommendedCars.map((car) => (
            <Link
              key={car.href}
              href={car.href}
              className="rounded-xl border bg-white p-4 transition hover:border-slate-400 hover:bg-slate-50"
            >
              <h3 className="font-medium">{car.name}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {car.summary}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-2xl border bg-slate-50 p-5">
        <h2 className="text-2xl font-semibold">
          Fuel economy is only part of the cost
        </h2>
        <p className="mt-3 text-slate-700">
          A car with excellent fuel economy can still become expensive if it
          needs repairs. MOT advisories, worn tyres, brakes or suspension issues
          can quickly outweigh fuel savings.
        </p>
        <ul className="mt-3 list-disc pl-6 text-slate-700">
          <li>Check MOT history before viewing</li>
          <li>Look for repeated advisories</li>
          <li>Review servicing and maintenance records</li>
          <li>Compare price with likely repair costs</li>
        </ul>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">
          Buying mistakes to avoid
        </h2>
        <p className="text-slate-700">
          Do not rely purely on advertised MPG figures. Real-world driving,
          maintenance condition and past usage all affect running costs.
        </p>
        <p className="text-slate-700">
          Before buying, check whether the MOT history shows repeat warnings,
          whether issues were repaired and whether the seller can justify the
          condition.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">Useful next steps</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Link
            href="/lowest-road-tax-cars-uk"
            className="rounded-xl border p-4 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <h3 className="font-medium">Lowest road tax cars</h3>
            <p className="mt-1 text-sm text-slate-600">
              Compare low-tax options
            </p>
          </Link>
          <Link
            href="/best-cheap-to-run-cars-uk"
            className="rounded-xl border p-4 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <h3 className="font-medium">Cheap to run cars</h3>
            <p className="mt-1 text-sm text-slate-600">
              Compare total ownership costs
            </p>
          </Link>
          <Link
            href="/check-car-by-registration"
            className="rounded-xl border p-4 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <h3 className="font-medium">Check the exact car</h3>
            <p className="mt-1 text-sm text-slate-600">
              Review MOT history and risk signals by registration
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}