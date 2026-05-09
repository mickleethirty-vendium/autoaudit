import type { Metadata } from "next";
import Link from "next/link";
import HeroCtaTextPanel from "@/components/seo/HeroCtaTextPanel";
import RegLookupCta from "@/components/seo/RegLookupCta";
import { absoluteUrl } from "@/lib/seo/routes";

export const metadata: Metadata = {
  title: "Best Cars for Long Distance Driving UK | AutoAudit",
  description:
    "Browse the best used cars for long distance driving in the UK, compare ownership risks, and check the exact car by registration before you buy.",
  alternates: {
    canonical: absoluteUrl("/best-cars-for-long-distance-driving-uk"),
  },
  openGraph: {
    title: "Best Cars for Long Distance Driving UK | AutoAudit",
    description:
      "Browse the best used cars for long distance driving in the UK, compare ownership risks, and check the exact car by registration before you buy.",
    url: absoluteUrl("/best-cars-for-long-distance-driving-uk"),
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Best cars for long distance driving UK | AutoAudit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Cars for Long Distance Driving UK | AutoAudit",
    description:
      "Browse the best used cars for long distance driving in the UK, compare ownership risks, and check the exact car by registration before you buy.",
    images: ["/og-image.png"],
  },
};

const recommendedCars = [
  {
    name: "BMW 3 Series",
    href: "/cars/bmw/3-series/common-problems",
    summary:
      "A strong long-distance option with comfort and performance, but maintenance history and repair-cost exposure are key.",
  },
  {
    name: "Audi A4",
    href: "/cars/audi/a4/common-problems",
    summary:
      "A refined motorway cruiser with good comfort, but check servicing, suspension wear and repeated MOT advisories.",
  },
  {
    name: "Volkswagen Passat",
    href: "/cars/volkswagen/passat/common-problems",
    summary:
      "A practical long-distance choice with strong comfort, but check mileage, servicing and MOT patterns carefully.",
  },
  {
    name: "Mercedes-Benz C-Class",
    href: "/cars/mercedes-benz/c-class/common-problems",
    summary:
      "A comfortable long-distance option, but higher repair costs mean maintenance history is critical.",
  },
  {
    name: "Skoda Octavia",
    href: "/cars/skoda/octavia/common-problems",
    summary:
      "A practical and efficient long-distance car, but check tyres, brakes, suspension and service history.",
  },
  {
    name: "Toyota Corolla",
    href: "/cars/toyota/corolla/common-problems",
    summary:
      "A reliability-focused option that can work well for longer journeys, especially with clean MOT and service history.",
  },
];

export default function BestCarsForLongDistanceDrivingUkPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <HeroCtaTextPanel
        heroImageSrc="/hero-car-road.png"
        heroAlt="Best cars for long distance driving in the UK"
        title="Best cars for long distance driving in the UK"
        subtitle="Used car buying guide"
        ctaComponent={
          <RegLookupCta
            title="Found a long-distance car?"
            subtitle="Check the exact registration for MOT history, repeated advisories and hidden repair-cost risks before you buy."
            variant="light"
          />
        }
        bodyContent={
          <div className="space-y-3">
            <p>
              Long-distance driving puts different demands on a car. Comfort,
              efficiency, reliability and stability all matter when covering
              higher mileage.
            </p>
            <p>
              Use this guide to shortlist sensible long-distance cars, then check
              the exact registration before viewing, negotiating or paying a
              deposit.
            </p>
          </div>
        }
      />

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">
          Good long-distance cars to consider in the UK
        </h2>
        <p className="text-slate-700">
          These models are popular for long-distance driving because they offer
          comfort, efficiency and strong availability. The safest choice is still
          the individual car with the cleanest history and condition.
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
          What to expect from a long-distance car
        </h2>
        <p className="mt-3 text-slate-700">
          Long-distance cars often cover higher mileage, so servicing, tyres,
          brakes and suspension condition are especially important. A well-
          maintained high-mileage car can still be a good buy.
        </p>
        <ul className="mt-3 list-disc pl-6 text-slate-700">
          <li>Check service history and mileage consistency</li>
          <li>Look for repeat advisories in MOT history</li>
          <li>Higher mileage increases importance of maintenance</li>
          <li>Comfort and stability matter for long journeys</li>
        </ul>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">
          Long-distance car buying mistakes to avoid
        </h2>
        <p className="text-slate-700">
          Do not avoid higher-mileage cars automatically. A well-maintained
          example can be safer than a lower-mileage car with poor history or
          repeated advisories.
        </p>
        <p className="text-slate-700">
          Before viewing, check whether the MOT history shows recurring tyre,
          brake, suspension or leak warnings, and whether past issues were
          resolved.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">Useful next steps</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Link
            href="/best-cars-for-motorway-driving-uk"
            className="rounded-xl border p-4 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <h3 className="font-medium">Motorway cars</h3>
            <p className="mt-1 text-sm text-slate-600">
              Compare motorway-focused options
            </p>
          </Link>
          <Link
            href="/best-estate-cars-uk"
            className="rounded-xl border p-4 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <h3 className="font-medium">Best estate cars</h3>
            <p className="mt-1 text-sm text-slate-600">
              Compare practical long-distance vehicles
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