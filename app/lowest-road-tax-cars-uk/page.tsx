import type { Metadata } from "next";
import Link from "next/link";
import HeroCtaTextPanel from "@/components/seo/HeroCtaTextPanel";
import RegLookupCta from "@/components/seo/RegLookupCta";
import { absoluteUrl } from "@/lib/seo/routes";

export const metadata: Metadata = {
  title: "Lowest Road Tax Cars UK | AutoAudit",
  description:
    "Browse the lowest road tax cars in the UK, compare ownership risks, and check the exact car by registration before you buy.",
  alternates: {
    canonical: absoluteUrl("/lowest-road-tax-cars-uk"),
  },
  openGraph: {
    title: "Lowest Road Tax Cars UK | AutoAudit",
    description:
      "Browse the lowest road tax cars in the UK, compare ownership risks, and check the exact car by registration before you buy.",
    url: absoluteUrl("/lowest-road-tax-cars-uk"),
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Lowest road tax cars UK | AutoAudit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lowest Road Tax Cars UK | AutoAudit",
    description:
      "Browse the lowest road tax cars in the UK, compare ownership risks, and check the exact car by registration before you buy.",
    images: ["/og-image.png"],
  },
};

const recommendedCars = [
  {
    name: "Toyota Yaris",
    href: "/cars/toyota/yaris/common-problems",
    summary:
      "Many models fall into low or zero road tax bands, but still check tyres, brakes, servicing and MOT advisories.",
  },
  {
    name: "Hyundai i10",
    href: "/cars/hyundai/i10/common-problems",
    summary:
      "A compact city car often with low tax costs, but check maintenance history and MOT patterns carefully.",
  },
  {
    name: "Kia Picanto",
    href: "/cars/kia/picanto/common-problems",
    summary:
      "A small car that can be cheap to tax, but still check servicing, tyres and repeat advisories.",
  },
  {
    name: "Volkswagen Polo",
    href: "/cars/volkswagen/polo/common-problems",
    summary:
      "Some variants offer low tax costs, but condition and maintenance matter more than tax band alone.",
  },
  {
    name: "Ford Fiesta",
    href: "/cars/ford/fiesta/common-problems",
    summary:
      "Widely available with low tax variants, but check clutch wear, tyres and suspension history.",
  },
  {
    name: "Nissan Micra",
    href: "/cars/nissan/micra/common-problems",
    summary:
      "Often found in low tax brackets, but check corrosion, brakes and MOT advisory history.",
  },
];

export default function LowestRoadTaxCarsUkPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <HeroCtaTextPanel
        heroImageSrc="/hero-car-road.png"
        heroAlt="Lowest road tax cars in the UK"
        title="Lowest road tax cars in the UK"
        subtitle="Used car buying guide"
        ctaComponent={
          <RegLookupCta
            title="Found a low-tax car?"
            subtitle="Check the exact registration for MOT history, repeated advisories and hidden repair-cost risks before you buy."
            variant="light"
          />
        }
        bodyContent={
          <div className="space-y-3">
            <p>
              Low road tax can make a used car more affordable to run, but it is
              only one part of the total ownership cost. Repairs, maintenance and
              condition matter just as much.
            </p>
            <p>
              Use this guide to shortlist low-tax cars, then check the exact
              registration before viewing, negotiating or paying a deposit.
            </p>
          </div>
        }
      />

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">
          Low road tax cars to consider in the UK
        </h2>
        <p className="text-slate-700">
          These models are often chosen for lower road tax costs, but the safest
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
          Road tax is only part of the cost
        </h2>
        <p className="mt-3 text-slate-700">
          A low-tax car can still become expensive if it needs repairs. Tyres,
          brakes, suspension work and unresolved MOT advisories can quickly
          outweigh any road tax savings.
        </p>
        <ul className="mt-3 list-disc pl-6 text-slate-700">
          <li>Check MOT history before viewing</li>
          <li>Look for repeated advisories</li>
          <li>Ask for service and repair records</li>
          <li>Compare price with likely repair costs</li>
        </ul>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">
          Buying mistakes to avoid
        </h2>
        <p className="text-slate-700">
          Do not focus only on tax bands. A slightly higher-tax car in better
          condition can be far cheaper overall than a low-tax car with hidden
          issues.
        </p>
        <p className="text-slate-700">
          Before buying, check whether the MOT history shows repeated warnings,
          whether issues were repaired and whether the seller can justify the
          condition.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">Useful next steps</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Link
            href="/cheapest-cars-to-insure-uk"
            className="rounded-xl border p-4 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <h3 className="font-medium">Cheapest cars to insure</h3>
            <p className="mt-1 text-sm text-slate-600">
              Compare low insurance options
            </p>
          </Link>
          <Link
            href="/best-cheap-to-run-cars-uk"
            className="rounded-xl border p-4 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <h3 className="font-medium">Cheap to run cars</h3>
            <p className="mt-1 text-sm text-slate-600">
              Compare overall ownership costs
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