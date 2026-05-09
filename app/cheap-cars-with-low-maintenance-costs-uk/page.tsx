import type { Metadata } from "next";
import Link from "next/link";
import HeroCtaTextPanel from "@/components/seo/HeroCtaTextPanel";
import RegLookupCta from "@/components/seo/RegLookupCta";
import { absoluteUrl } from "@/lib/seo/routes";

export const metadata: Metadata = {
  title: "Cheap Cars with Low Maintenance Costs UK | AutoAudit",
  description:
    "Browse cheap used cars with low maintenance costs in the UK, compare ownership risks, and check the exact car by registration before you buy.",
  alternates: {
    canonical: absoluteUrl("/cheap-cars-with-low-maintenance-costs-uk"),
  },
  openGraph: {
    title: "Cheap Cars with Low Maintenance Costs UK | AutoAudit",
    description:
      "Browse cheap used cars with low maintenance costs in the UK, compare ownership risks, and check the exact car by registration before you buy.",
    url: absoluteUrl("/cheap-cars-with-low-maintenance-costs-uk"),
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Cheap cars with low maintenance costs UK | AutoAudit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cheap Cars with Low Maintenance Costs UK | AutoAudit",
    description:
      "Browse cheap used cars with low maintenance costs in the UK, compare ownership risks, and check the exact car by registration before you buy.",
    images: ["/og-image.png"],
  },
};

const recommendedCars = [
  {
    name: "Toyota Yaris",
    href: "/cars/toyota/yaris/common-problems",
    summary:
      "A sensible low-maintenance option if well looked after, but still check servicing, tyres and MOT history.",
  },
  {
    name: "Honda Jazz",
    href: "/cars/honda/jazz/common-problems",
    summary:
      "Often associated with careful ownership, but check brakes, suspension and age-related advisories.",
  },
  {
    name: "Hyundai i10",
    href: "/cars/hyundai/i10/common-problems",
    summary:
      "A simple small car that can be cheap to maintain, but still check servicing and MOT patterns.",
  },
  {
    name: "Kia Picanto",
    href: "/cars/kia/picanto/common-problems",
    summary:
      "A compact option with potentially low maintenance costs, but condition matters more than model reputation.",
  },
  {
    name: "Toyota Corolla",
    href: "/cars/toyota/corolla/common-problems",
    summary:
      "A practical and sensible choice, but still check tyres, brakes and servicing carefully.",
  },
  {
    name: "Ford Fiesta",
    href: "/cars/ford/fiesta/common-problems",
    summary:
      "Widely available and affordable to repair, but check clutch wear, suspension and repeated advisories.",
  },
];

export default function CheapCarsWithLowMaintenanceCostsUkPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <HeroCtaTextPanel
        heroImageSrc="/hero-car-road.png"
        heroAlt="Cheap cars with low maintenance costs in the UK"
        title="Cheap cars with low maintenance costs in the UK"
        subtitle="Used car buying guide"
        ctaComponent={
          <RegLookupCta
            title="Found a low-maintenance car?"
            subtitle="Check the exact registration for MOT history, repeated advisories and hidden repair-cost risks before you buy."
            variant="light"
          />
        }
        bodyContent={
          <div className="space-y-3">
            <p>
              Some used cars are known for being simpler and cheaper to maintain,
              but the actual cost depends on how the individual car has been
              looked after.
            </p>
            <p>
              Use this guide to shortlist low-maintenance options, then check the
              exact registration before viewing, negotiating or paying a deposit.
            </p>
          </div>
        }
      />

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">
          Cheap cars with low maintenance costs
        </h2>
        <p className="text-slate-700">
          These models are often considered lower-risk from a maintenance point
          of view, but the safest choice is still the individual car with the
          best history and condition.
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
          Maintenance cost depends on the individual car
        </h2>
        <p className="mt-3 text-slate-700">
          Even cars known for reliability can become expensive if they have been
          poorly maintained. MOT history and servicing records are often more
          important than model reputation.
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
          Do not assume a “reliable” car will automatically be cheap to run. A
          neglected example can cost more than a well-maintained alternative from
          a less “reliable” brand.
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
            href="/most-economical-cars-uk"
            className="rounded-xl border p-4 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <h3 className="font-medium">Most economical cars</h3>
            <p className="mt-1 text-sm text-slate-600">
              Compare fuel-efficient options
            </p>
          </Link>
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