import type { Metadata } from "next";
import Link from "next/link";
import HeroCtaTextPanel from "@/components/seo/HeroCtaTextPanel";
import RegLookupCta from "@/components/seo/RegLookupCta";
import { absoluteUrl } from "@/lib/seo/routes";

export const metadata: Metadata = {
  title: "Best Cars for Motorway Driving UK | AutoAudit",
  description:
    "Browse the best used cars for motorway driving in the UK, compare ownership risks, and check the exact car by registration before you buy.",
  alternates: {
    canonical: absoluteUrl("/best-cars-for-motorway-driving-uk"),
  },
  openGraph: {
    title: "Best Cars for Motorway Driving UK | AutoAudit",
    description:
      "Browse the best used cars for motorway driving in the UK, compare ownership risks, and check the exact car by registration before you buy.",
    url: absoluteUrl("/best-cars-for-motorway-driving-uk"),
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Best cars for motorway driving UK | AutoAudit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Cars for Motorway Driving UK | AutoAudit",
    description:
      "Browse the best used cars for motorway driving in the UK, compare ownership risks, and check the exact car by registration before you buy.",
    images: ["/og-image.png"],
  },
};

const recommendedCars = [
  {
    name: "BMW 3 Series",
    href: "/cars/bmw/3-series/common-problems",
    summary:
      "A strong motorway choice with comfort and performance, but higher running costs mean maintenance history and MOT patterns matter.",
  },
  {
    name: "Audi A4",
    href: "/cars/audi/a4/common-problems",
    summary:
      "A refined long-distance option with good motorway comfort, but check suspension, oil leaks, servicing and repeated advisories.",
  },
  {
    name: "Volkswagen Golf",
    href: "/cars/volkswagen/golf/common-problems",
    summary:
      "A practical motorway hatchback for mixed use, but check tyres, brakes, suspension and service history on higher-mileage cars.",
  },
  {
    name: "Ford Focus",
    href: "/cars/ford/focus/common-problems",
    summary:
      "A sensible mainstream motorway option with good availability, but clutch, suspension and tyre wear should be checked carefully.",
  },
  {
    name: "Toyota Corolla",
    href: "/cars/toyota/corolla/common-problems",
    summary:
      "A reliability-focused option that can work well for regular motorway use, especially if servicing and MOT history are clean.",
  },
  {
    name: "Mercedes-Benz C-Class",
    href: "/cars/mercedes-benz/c-class/common-problems",
    summary:
      "A premium motorway car with strong comfort, but repair-cost exposure means maintenance evidence is especially important.",
  },
];

export default function BestCarsForMotorwayDrivingUkPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <HeroCtaTextPanel
        heroImageSrc="/hero-car-road.png"
        heroAlt="Best cars for motorway driving in the UK"
        title="Best cars for motorway driving in the UK"
        subtitle="Used car buying guide"
        ctaComponent={
          <RegLookupCta
            title="Found a motorway car?"
            subtitle="Check the exact registration for MOT history, repeated advisories and hidden repair-cost risks before you buy."
            variant="light"
          />
        }
        bodyContent={
          <div className="space-y-3">
            <p>
              A good motorway car should be comfortable, stable, economical at
              speed and dependable over higher mileage. But when buying used,
              history matters more than the advert.
            </p>
            <p>
              Use this guide to shortlist sensible motorway cars, then check the
              exact registration before viewing, negotiating or paying a
              deposit.
            </p>
          </div>
        }
      />

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">
          Good motorway cars to consider in the UK
        </h2>
        <p className="text-slate-700">
          These models are common choices for motorway driving because they offer
          comfort, availability and strong long-distance usability. The safest
          choice is still the individual car with the cleanest history and
          condition.
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
          What makes a good used motorway car?
        </h2>
        <p className="mt-3 text-slate-700">
          Motorway cars often cover higher mileage, so servicing, tyres, brakes
          and suspension condition are especially important. A high-mileage car
          with excellent history can be safer than a lower-mileage car with gaps.
        </p>
        <ul className="mt-3 list-disc pl-6 text-slate-700">
          <li>Check service history and mileage consistency</li>
          <li>Look closely at tyres, brakes and suspension advisories</li>
          <li>Premium motorway cars can carry higher repair costs</li>
          <li>Repeated MOT warnings may suggest delayed maintenance</li>
        </ul>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">
          Motorway car buying mistakes to avoid
        </h2>
        <p className="text-slate-700">
          Do not assume lower mileage is always better. A motorway car with
          higher mileage but strong maintenance history can be a better buy than
          a lower-mileage car with repeated advisories or unclear servicing.
        </p>
        <p className="text-slate-700">
          Before viewing, check whether the MOT history shows recurring tyre,
          brake, suspension or leak warnings, and whether previous issues appear
          to have been fixed.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">Useful next steps</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Link
            href="/best-estate-cars-uk"
            className="rounded-xl border p-4 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <h3 className="font-medium">Best estate cars</h3>
            <p className="mt-1 text-sm text-slate-600">
              Compare practical long-distance used cars
            </p>
          </Link>
          <Link
            href="/best-cars-under-15000"
            className="rounded-xl border p-4 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <h3 className="font-medium">Cars under £15,000</h3>
            <p className="mt-1 text-sm text-slate-600">
              Compare motorway-friendly cars by budget
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