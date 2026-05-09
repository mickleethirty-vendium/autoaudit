import type { Metadata } from "next";
import Link from "next/link";
import HeroCtaTextPanel from "@/components/seo/HeroCtaTextPanel";
import RegLookupCta from "@/components/seo/RegLookupCta";
import { absoluteUrl } from "@/lib/seo/routes";

export const metadata: Metadata = {
  title: "Best Cars for City Driving UK | AutoAudit",
  description:
    "Browse the best used cars for city driving in the UK, compare ownership risks, and check the exact car by registration before you buy.",
  alternates: {
    canonical: absoluteUrl("/best-cars-for-city-driving-uk"),
  },
  openGraph: {
    title: "Best Cars for City Driving UK | AutoAudit",
    description:
      "Browse the best used cars for city driving in the UK, compare ownership risks, and check the exact car by registration before you buy.",
    url: absoluteUrl("/best-cars-for-city-driving-uk"),
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Best cars for city driving UK | AutoAudit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Cars for City Driving UK | AutoAudit",
    description:
      "Browse the best used cars for city driving in the UK, compare ownership risks, and check the exact car by registration before you buy.",
    images: ["/og-image.png"],
  },
};

const recommendedCars = [
  {
    name: "Ford Fiesta",
    href: "/cars/ford/fiesta/common-problems",
    summary:
      "A popular small car for town driving with good availability. Check clutch wear, tyres, brakes and repeat MOT advisories.",
  },
  {
    name: "Vauxhall Corsa",
    href: "/cars/vauxhall/corsa/common-problems",
    summary:
      "Affordable and common in cities, but many examples have had hard stop-start use. Check clutch, suspension and brake wear.",
  },
  {
    name: "Toyota Yaris",
    href: "/cars/toyota/yaris/common-problems",
    summary:
      "A sensible city option with a strong reliability reputation, but still check servicing, tyres and MOT history.",
  },
  {
    name: "Volkswagen Polo",
    href: "/cars/volkswagen/polo/common-problems",
    summary:
      "A compact and refined small car, but maintenance history and condition matter more than badge.",
  },
  {
    name: "Nissan Micra",
    href: "/cars/nissan/micra/common-problems",
    summary:
      "Easy to drive and compact for tight spaces, but older cars need checks for corrosion, brakes and suspension wear.",
  },
  {
    name: "Peugeot 208",
    href: "/cars/peugeot/208/common-problems",
    summary:
      "A common small hatchback for city use, but check electrical issues, servicing and repeat MOT advisories.",
  },
];

export default function BestCarsForCityDrivingUkPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <HeroCtaTextPanel
        heroImageSrc="/hero-car-road.png"
        heroAlt="Best cars for city driving in the UK"
        title="Best cars for city driving in the UK"
        subtitle="Used car buying guide"
        ctaComponent={
          <RegLookupCta
            title="Found a city car?"
            subtitle="Check the exact registration for MOT history, repeated advisories and hidden repair-cost risks before you buy."
            variant="light"
          />
        }
        bodyContent={
          <div className="space-y-3">
            <p>
              City driving puts different demands on a car. Tight roads,
              stop-start traffic and frequent short journeys can all affect wear
              and long-term reliability.
            </p>
            <p>
              Use this guide to shortlist sensible city cars, then check the
              exact registration before viewing, negotiating or paying a
              deposit.
            </p>
          </div>
        }
      />

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">
          Good city cars to consider in the UK
        </h2>
        <p className="text-slate-700">
          These models are popular for city driving because they are compact,
          easy to drive and widely available. The safest choice is still the
          individual car with the cleanest history and condition.
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
          What to expect from a used city car
        </h2>
        <p className="mt-3 text-slate-700">
          City cars often see heavy stop-start use, which can increase wear on
          clutches, brakes and tyres. Short journeys can also affect engine
          condition over time.
        </p>
        <ul className="mt-3 list-disc pl-6 text-slate-700">
          <li>Check clutch wear on manual cars</li>
          <li>Look for brake and tyre wear in MOT history</li>
          <li>Short journeys can accelerate general wear</li>
          <li>Condition matters more than size or brand</li>
        </ul>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">
          City car buying mistakes to avoid
        </h2>
        <p className="text-slate-700">
          Do not assume all small cars are cheap to own. A poorly maintained city
          car can quickly need tyres, brakes, clutch work or suspension repairs.
        </p>
        <p className="text-slate-700">
          Before viewing, check whether the MOT history shows repeat warnings,
          whether previous issues were fixed and whether the price reflects the
          likely maintenance work needed.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">Useful next steps</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Link
            href="/best-small-cars-uk"
            className="rounded-xl border p-4 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <h3 className="font-medium">Best small cars</h3>
            <p className="mt-1 text-sm text-slate-600">
              Compare compact used cars
            </p>
          </Link>
          <Link
            href="/best-cheap-to-run-cars-uk"
            className="rounded-xl border p-4 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <h3 className="font-medium">Cheap to run cars</h3>
            <p className="mt-1 text-sm text-slate-600">
              Compare low-cost ownership options
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