import type { Metadata } from "next";
import Link from "next/link";
import HeroCtaTextPanel from "@/components/seo/HeroCtaTextPanel";
import RegLookupCta from "@/components/seo/RegLookupCta";
import { absoluteUrl } from "@/lib/seo/routes";

export const metadata: Metadata = {
  title: "Best Used Cars Under £7,000 UK | AutoAudit",
  description:
    "Browse sensible used cars under £7,000 in the UK, compare ownership risks, and check the exact car by registration before you buy.",
  alternates: {
    canonical: absoluteUrl("/best-cars-under-7000"),
  },
  openGraph: {
    title: "Best Used Cars Under £7,000 UK | AutoAudit",
    description:
      "Browse sensible used cars under £7,000 in the UK, compare ownership risks, and check the exact car by registration before you buy.",
    url: absoluteUrl("/best-cars-under-7000"),
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Best used cars under £7,000 UK | AutoAudit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Used Cars Under £7,000 UK | AutoAudit",
    description:
      "Browse sensible used cars under £7,000 in the UK, compare ownership risks, and check the exact car by registration before you buy.",
    images: ["/og-image.png"],
  },
};

const recommendedCars = [
  {
    name: "Ford Focus",
    href: "/cars/ford/focus/common-problems",
    summary:
      "A practical family hatchback with plenty of choice under £7,000. Check clutch condition, suspension wear and repeated MOT advisories.",
  },
  {
    name: "Volkswagen Golf",
    href: "/cars/volkswagen/golf/common-problems",
    summary:
      "A popular all-rounder with strong appeal, but higher-mileage examples need careful checks for suspension, brakes, oil leaks and service history.",
  },
  {
    name: "Toyota Yaris",
    href: "/cars/toyota/yaris/common-problems",
    summary:
      "A sensible small-car option if you value reliability and lower running costs. Check older examples for age-related MOT advisories.",
  },
  {
    name: "Vauxhall Astra",
    href: "/cars/vauxhall/astra/common-problems",
    summary:
      "Often good value at this price with lots of choice, but check tyres, brakes, suspension wear and whether advisories have been resolved.",
  },
  {
    name: "Nissan Qashqai",
    href: "/cars/nissan/qashqai/common-problems",
    summary:
      "A practical SUV option under £7,000, but family use can mean brake, tyre and suspension wear. MOT history matters.",
  },
  {
    name: "Audi A3",
    href: "/cars/audi/a3/common-problems",
    summary:
      "A more premium hatchback option, but running costs can be higher. Check maintenance evidence, oil leaks and repeat advisories.",
  },
];

export default function BestCarsUnder7000Page() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <HeroCtaTextPanel
        heroImageSrc="/hero-car-road.png"
        heroAlt="Used cars under £7,000 in the UK"
        title="Best used cars under £7,000 in the UK"
        subtitle="Used car buying guide"
        ctaComponent={
          <RegLookupCta
            title="Found a car under £7,000?"
            subtitle="Check the exact registration for MOT history, repeated advisories and hidden repair-cost risks before you buy."
            variant="light"
          />
        }
        bodyContent={
          <div className="space-y-3">
            <p>
              A £7,000 budget gives UK buyers more flexibility than the cheapest
              end of the market, with stronger options across small cars,
              hatchbacks and family cars.
            </p>
            <p>
              Even so, the individual car matters more than the badge. Use this
              guide to shortlist sensible models, then check the exact
              registration before viewing or buying.
            </p>
          </div>
        }
      />

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">
          Good used cars to consider under £7,000
        </h2>
        <p className="text-slate-700">
          These cars are common in the UK used market and can make sense at this
          budget if you find a clean, well-maintained example.
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
          Under £7,000, you may find newer examples than at the £3,000–£5,000
          level, but mileage, maintenance and MOT history still decide whether a
          car is a good buy.
        </p>
        <ul className="mt-3 list-disc pl-6 text-slate-700">
          <li>Expect a wide mix of mileage and condition</li>
          <li>Check whether repeated advisories have been fixed</li>
          <li>Premium models may cost more to maintain</li>
          <li>Tyres, brakes and suspension can still add immediate cost</li>
        </ul>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">
          How to choose the right car under £7,000
        </h2>
        <p className="text-slate-700">
          At this budget, it is worth comparing several models before committing.
          A clean, well-maintained example is usually a better buy than a more
          desirable badge with patchy history.
        </p>
        <p className="text-slate-700">
          Always check the MOT history before viewing. Repeated warnings around
          tyres, brakes, suspension or leaks can change what looks like a fair
          price.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">Useful next steps</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Link
            href="/best-cars-under-5000"
            className="rounded-xl border p-4 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <h3 className="font-medium">Cars under £5,000</h3>
            <p className="mt-1 text-sm text-slate-600">
              Compare cheaper options if budget is tighter
            </p>
          </Link>
          <Link
            href="/best-cars-under-10000"
            className="rounded-xl border p-4 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <h3 className="font-medium">Cars under £10,000</h3>
            <p className="mt-1 text-sm text-slate-600">
              Compare newer or better-equipped options
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