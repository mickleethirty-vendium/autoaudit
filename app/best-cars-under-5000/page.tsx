import type { Metadata } from "next";
import Link from "next/link";
import HeroCtaTextPanel from "@/components/seo/HeroCtaTextPanel";
import RegLookupCta from "@/components/seo/RegLookupCta";
import { absoluteUrl } from "@/lib/seo/routes";

export const metadata: Metadata = {
  title: "Best Used Cars Under £5,000 UK | AutoAudit",
  description:
    "Browse sensible used cars under £5,000 in the UK, compare common risks, and check the exact car by registration before you buy.",
  alternates: {
    canonical: absoluteUrl("/best-cars-under-5000"),
  },
  openGraph: {
    title: "Best Used Cars Under £5,000 UK | AutoAudit",
    description:
      "Browse sensible used cars under £5,000 in the UK, compare common risks, and check the exact car by registration before you buy.",
    url: absoluteUrl("/best-cars-under-5000"),
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Best used cars under £5,000 UK | AutoAudit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Used Cars Under £5,000 UK | AutoAudit",
    description:
      "Browse sensible used cars under £5,000 in the UK, compare common risks, and check the exact car by registration before you buy.",
    images: ["/og-image.png"],
  },
};

const recommendedCars = [
  {
    name: "Ford Fiesta",
    href: "/cars/ford/fiesta/common-problems",
    summary:
      "A strong all-rounder with wide parts availability, good choice and easy ownership, but check for clutch, suspension and MOT advisory patterns.",
  },
  {
    name: "Volkswagen Golf",
    href: "/cars/volkswagen/golf/common-problems",
    summary:
      "A practical hatchback with broad appeal, but higher-mileage cars need careful checks for suspension wear, oil leaks and repeated advisories.",
  },
  {
    name: "Toyota Yaris",
    href: "/cars/toyota/yaris/common-problems",
    summary:
      "A sensible small-car choice with a reputation for durability, but condition, MOT history and maintenance evidence still matter at this budget.",
  },
  {
    name: "Vauxhall Corsa",
    href: "/cars/vauxhall/corsa/common-problems",
    summary:
      "Popular, affordable and easy to find, but many examples are hard-used, so check tyres, brakes, suspension and clutch wear carefully.",
  },
  {
    name: "Honda Jazz",
    href: "/cars/honda/jazz/common-problems",
    summary:
      "Practical and often bought by careful owners, but older examples can still suffer from age-related corrosion, brakes and suspension advisories.",
  },
  {
    name: "Nissan Qashqai",
    href: "/cars/nissan/qashqai/common-problems",
    summary:
      "A popular family SUV option under £5,000, but heavier use means suspension, tyres, brakes and MOT history deserve close attention.",
  },
];

export default function BestCarsUnder5000Page() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <HeroCtaTextPanel
        heroImageSrc="/hero-car-road.png"
        heroAlt="Used cars under £5,000 in the UK"
        title="Best used cars under £5,000 in the UK"
        subtitle="Used car buying guide"
        ctaComponent={
          <RegLookupCta
            title="Found a car under £5,000?"
            subtitle="Check the exact registration for MOT history, repeated advisories and hidden repair-cost risks before you buy."
            variant="light"
          />
        }
        bodyContent={
          <div className="space-y-3">
            <p>
              A £5,000 used car budget can still buy a sensible runaround,
              first car or family hatchback, but condition matters more than the
              badge. At this price, the wrong example can quickly become
              expensive.
            </p>
            <p>
              Use this guide to shortlist practical options, then check the
              exact car by registration before travelling, negotiating or paying
              a deposit.
            </p>
          </div>
        }
      />

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">
          Good used cars to consider under £5,000
        </h2>
        <p className="text-slate-700">
          These are sensible starting points for UK buyers because they are
          common, practical and usually easier to compare. The right car still
          depends on mileage, service history, MOT record and condition.
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
          What matters most at this budget?
        </h2>
        <p className="mt-3 text-slate-700">
          Under £5,000, the individual car matters more than the model name.
          Look for evidence of maintenance, clean MOT history, sensible mileage
          and a seller who can explain recent repairs.
        </p>
        <ul className="mt-3 list-disc pl-6 text-slate-700">
          <li>Repeated MOT advisories are more concerning than one-off notes</li>
          <li>Tyres, brakes and suspension can quickly change the real cost</li>
          <li>Service history matters more as cars get older</li>
          <li>Cheap cars are not always cheap once repairs are included</li>
        </ul>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">
          How to avoid buying the wrong £5,000 car
        </h2>
        <p className="text-slate-700">
          Do not judge a car only by its advert photos. Before you view it, check
          whether its MOT history shows repeat warnings, whether previous issues
          were fixed and whether the asking price still makes sense after likely
          repair costs.
        </p>
        <p className="text-slate-700">
          A slightly more expensive car with clean history can be better value
          than a cheaper one with tyres, brakes, suspension and unresolved
          advisories waiting for you.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">Useful next steps</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Link
            href="/cars"
            className="rounded-xl border p-4 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <h3 className="font-medium">Browse car problem guides</h3>
            <p className="mt-1 text-sm text-slate-600">
              Compare common issues by make and model
            </p>
          </Link>
          <Link
            href="/mot-advisories"
            className="rounded-xl border p-4 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <h3 className="font-medium">Understand MOT advisories</h3>
            <p className="mt-1 text-sm text-slate-600">
              Learn what warning notes may mean before buying
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