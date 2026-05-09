import type { Metadata } from "next";
import Link from "next/link";
import HeroCtaTextPanel from "@/components/seo/HeroCtaTextPanel";
import RegLookupCta from "@/components/seo/RegLookupCta";
import { absoluteUrl } from "@/lib/seo/routes";

export const metadata: Metadata = {
  title: "Best Reliable Used Cars UK | AutoAudit",
  description:
    "Browse reliable used cars in the UK, compare ownership risks, and check the exact car by registration before you buy.",
  alternates: {
    canonical: absoluteUrl("/best-reliable-cars-uk"),
  },
  openGraph: {
    title: "Best Reliable Used Cars UK | AutoAudit",
    description:
      "Browse reliable used cars in the UK, compare ownership risks, and check the exact car by registration before you buy.",
    url: absoluteUrl("/best-reliable-cars-uk"),
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Best reliable used cars UK | AutoAudit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Reliable Used Cars UK | AutoAudit",
    description:
      "Browse reliable used cars in the UK, compare ownership risks, and check the exact car by registration before you buy.",
    images: ["/og-image.png"],
  },
};

const recommendedCars = [
  {
    name: "Toyota Yaris",
    href: "/cars/toyota/yaris/common-problems",
    summary:
      "A sensible small-car choice with a strong reputation for durability. Still check older examples for MOT advisories, corrosion and maintenance gaps.",
  },
  {
    name: "Toyota Corolla",
    href: "/cars/toyota/corolla/common-problems",
    summary:
      "A practical reliability-focused option, often popular with buyers who want lower ownership stress. Check servicing and MOT history before buying.",
  },
  {
    name: "Honda Jazz",
    href: "/cars/honda/jazz/common-problems",
    summary:
      "Often bought by careful owners and known for practicality, but older cars can still show age-related brakes, suspension and corrosion issues.",
  },
  {
    name: "Volkswagen Golf",
    href: "/cars/volkswagen/golf/common-problems",
    summary:
      "A strong all-rounder with good availability, but reliability depends heavily on maintenance history, mileage and unresolved advisories.",
  },
  {
    name: "Ford Focus",
    href: "/cars/ford/focus/common-problems",
    summary:
      "A common family hatchback with easy parts availability. A well-maintained example can make sense, but check clutch, suspension and MOT patterns.",
  },
  {
    name: "Nissan Micra",
    href: "/cars/nissan/micra/common-problems",
    summary:
      "A simple, compact option that can be affordable to run. Check MOT history for corrosion, brakes, tyres and suspension wear.",
  },
];

export default function BestReliableCarsUkPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <HeroCtaTextPanel
        heroImageSrc="/hero-car-road.png"
        heroAlt="Reliable used cars in the UK"
        title="Best reliable used cars in the UK"
        subtitle="Used car buying guide"
        ctaComponent={
          <RegLookupCta
            title="Found a car that looks reliable?"
            subtitle="Check the exact registration for MOT history, repeated advisories and hidden repair-cost risks before you buy."
            variant="light"
          />
        }
        bodyContent={
          <div className="space-y-3">
            <p>
              Reliability is one of the biggest priorities for used car buyers,
              but no model is automatically safe. The exact car, its maintenance
              history and its MOT pattern matter more than reputation alone.
            </p>
            <p>
              Use this guide to shortlist sensible, lower-risk options, then
              check the exact registration before viewing, negotiating or paying
              a deposit.
            </p>
          </div>
        }
      />

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">
          Reliable used cars to consider in the UK
        </h2>
        <p className="text-slate-700">
          These cars are sensible starting points if you want dependable used
          ownership. The safest choice is still the individual car with the best
          evidence of maintenance and the cleanest MOT history.
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
          What actually makes a used car reliable?
        </h2>
        <p className="mt-3 text-slate-700">
          Reliability is not just about brand reputation. A car with regular
          servicing, clean MOT history and evidence of repairs is usually a
          safer bet than a supposedly reliable model that has been neglected.
        </p>
        <ul className="mt-3 list-disc pl-6 text-slate-700">
          <li>Clean MOT history can be more useful than reputation alone</li>
          <li>Repeated advisories may suggest poor maintenance</li>
          <li>Service records matter more as mileage increases</li>
          <li>Tyres, brakes and suspension reveal how the car has been used</li>
        </ul>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">
          Reliable car buying mistakes to avoid
        </h2>
        <p className="text-slate-700">
          Do not assume a car is safe just because the model has a good
          reputation. Even reliable cars can become expensive if they have missed
          services, repeated advisories or unresolved wear.
        </p>
        <p className="text-slate-700">
          Before viewing, check whether the MOT history shows a clean pattern or
          repeated warnings. A well-maintained mainstream car can be a better buy
          than a neglected model with a stronger badge or reputation.
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
              Compare sensible compact used cars
            </p>
          </Link>
          <Link
            href="/best-family-cars-uk"
            className="rounded-xl border p-4 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <h3 className="font-medium">Best family cars</h3>
            <p className="mt-1 text-sm text-slate-600">
              Compare practical family-friendly used cars
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