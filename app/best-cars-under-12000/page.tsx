import type { Metadata } from "next";
import Link from "next/link";
import HeroCtaTextPanel from "@/components/seo/HeroCtaTextPanel";
import RegLookupCta from "@/components/seo/RegLookupCta";
import { absoluteUrl } from "@/lib/seo/routes";

export const metadata: Metadata = {
  title: "Best Used Cars Under £12,000 UK | AutoAudit",
  description:
    "Browse sensible used cars under £12,000 in the UK, compare ownership risks, and check the exact car by registration before you buy.",
  alternates: {
    canonical: absoluteUrl("/best-cars-under-12000"),
  },
  openGraph: {
    title: "Best Used Cars Under £12,000 UK | AutoAudit",
    description:
      "Browse sensible used cars under £12,000 in the UK, compare ownership risks, and check the exact car by registration before you buy.",
    url: absoluteUrl("/best-cars-under-12000"),
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Best used cars under £12,000 UK | AutoAudit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Used Cars Under £12,000 UK | AutoAudit",
    description:
      "Browse sensible used cars under £12,000 in the UK, compare ownership risks, and check the exact car by registration before you buy.",
    images: ["/og-image.png"],
  },
};

const recommendedCars = [
  {
    name: "Volkswagen Golf",
    href: "/cars/volkswagen/golf/common-problems",
    summary:
      "A strong all-rounder with good comfort and practicality, but check service history, suspension wear and repeated MOT advisories.",
  },
  {
    name: "Ford Focus",
    href: "/cars/ford/focus/common-problems",
    summary:
      "A practical family hatchback with plenty of choice under £12,000. Look closely at tyres, brakes, suspension and clutch condition.",
  },
  {
    name: "BMW 3 Series",
    href: "/cars/bmw/3-series/common-problems",
    summary:
      "A more premium option with strong appeal, but maintenance history and running costs matter more than badge value.",
  },
  {
    name: "Audi A3",
    href: "/cars/audi/a3/common-problems",
    summary:
      "A refined hatchback that can be tempting at this budget, but check for oil leaks, suspension wear and unresolved MOT warnings.",
  },
  {
    name: "Toyota Corolla",
    href: "/cars/toyota/corolla/common-problems",
    summary:
      "A sensible reliability-focused choice, especially if you want lower ownership stress. Check servicing and MOT history before buying.",
  },
  {
    name: "Nissan Qashqai",
    href: "/cars/nissan/qashqai/common-problems",
    summary:
      "A popular family SUV with broad availability, but brake, tyre and suspension wear can add cost if neglected.",
  },
];

export default function BestCarsUnder12000Page() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <HeroCtaTextPanel
        heroImageSrc="/hero-car-road.png"
        heroAlt="Used cars under £12,000 in the UK"
        title="Best used cars under £12,000 in the UK"
        subtitle="Used car buying guide"
        ctaComponent={
          <RegLookupCta
            title="Found a car under £12,000?"
            subtitle="Check the exact registration for MOT history, repeated advisories and hidden repair-cost risks before you buy."
            variant="light"
          />
        }
        bodyContent={
          <div className="space-y-3">
            <p>
              A £12,000 budget can open up newer used cars, better specifications
              and lower-mileage examples, but it does not remove buying risk.
            </p>
            <p>
              Use this guide to compare sensible options, then check the exact
              car by registration before viewing, negotiating or paying a
              deposit.
            </p>
          </div>
        }
      />

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">
          Good used cars to consider under £12,000
        </h2>
        <p className="text-slate-700">
          These models can make sense at this budget because they offer a useful
          mix of availability, practicality and buyer appeal. The best choice is
          still the individual car with the cleanest history.
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
          What to expect at this budget
        </h2>
        <p className="mt-3 text-slate-700">
          Under £12,000, you may find cars that feel much newer and cleaner than
          cheaper alternatives. But service history, MOT patterns and evidence
          of previous repairs still matter.
        </p>
        <ul className="mt-3 list-disc pl-6 text-slate-700">
          <li>Better condition is possible, but not guaranteed</li>
          <li>Premium cars may bring higher repair costs</li>
          <li>Repeated advisories still need investigating</li>
          <li>Clean history can be worth more than extra specification</li>
        </ul>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">
          How to choose the right car under £12,000
        </h2>
        <p className="text-slate-700">
          At this price, buyers often start comparing mainstream cars against
          older premium models. That can be tempting, but the safer buy is often
          the car with better maintenance evidence and fewer unresolved warnings.
        </p>
        <p className="text-slate-700">
          Before you view a car, check whether the MOT history shows recurring
          advisories, mileage gaps or signs that normal wear items have been
          neglected.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">Useful next steps</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Link
            href="/best-cars-under-10000"
            className="rounded-xl border p-4 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <h3 className="font-medium">Cars under £10,000</h3>
            <p className="mt-1 text-sm text-slate-600">
              Compare slightly cheaper options
            </p>
          </Link>
          <Link
            href="/best-cars-under-15000"
            className="rounded-xl border p-4 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <h3 className="font-medium">Cars under £15,000</h3>
            <p className="mt-1 text-sm text-slate-600">
              Compare newer or higher-spec options
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