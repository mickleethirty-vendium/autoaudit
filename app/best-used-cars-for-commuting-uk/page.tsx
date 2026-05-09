import type { Metadata } from "next";
import Link from "next/link";
import HeroCtaTextPanel from "@/components/seo/HeroCtaTextPanel";
import RegLookupCta from "@/components/seo/RegLookupCta";
import { absoluteUrl } from "@/lib/seo/routes";

export const metadata: Metadata = {
  title: "Best Used Cars for Commuting UK | AutoAudit",
  description:
    "Browse the best used cars for commuting in the UK, compare ownership risks, and check the exact car by registration before you buy.",
  alternates: {
    canonical: absoluteUrl("/best-used-cars-for-commuting-uk"),
  },
  openGraph: {
    title: "Best Used Cars for Commuting UK | AutoAudit",
    description:
      "Browse the best used cars for commuting in the UK, compare ownership risks, and check the exact car by registration before you buy.",
    url: absoluteUrl("/best-used-cars-for-commuting-uk"),
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Best used cars for commuting UK | AutoAudit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Used Cars for Commuting UK | AutoAudit",
    description:
      "Browse the best used cars for commuting in the UK, compare ownership risks, and check the exact car by registration before you buy.",
    images: ["/og-image.png"],
  },
};

const recommendedCars = [
  {
    name: "Volkswagen Golf",
    href: "/cars/volkswagen/golf/common-problems",
    summary:
      "A balanced commuting option for mixed driving, but check tyres, brakes, suspension and service history.",
  },
  {
    name: "Ford Focus",
    href: "/cars/ford/focus/common-problems",
    summary:
      "A practical daily driver with strong availability, but check clutch wear, suspension and repeated MOT advisories.",
  },
  {
    name: "Toyota Corolla",
    href: "/cars/toyota/corolla/common-problems",
    summary:
      "A sensible commuting choice with strong reliability appeal, but still check servicing and MOT patterns carefully.",
  },
  {
    name: "BMW 1 Series",
    href: "/cars/bmw/1-series/common-problems",
    summary:
      "A premium compact option for commuting, but maintenance costs and MOT history should be reviewed carefully.",
  },
  {
    name: "Audi A3",
    href: "/cars/audi/a3/common-problems",
    summary:
      "A refined commuter car with strong appeal, but condition and servicing matter more than badge.",
  },
  {
    name: "Hyundai i30",
    href: "/cars/hyundai/i30/common-problems",
    summary:
      "A practical and sensible commuting option, but check tyres, brakes and suspension wear on used examples.",
  },
];

export default function BestUsedCarsForCommutingUkPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <HeroCtaTextPanel
        heroImageSrc="/hero-car-road.png"
        heroAlt="Best used cars for commuting in the UK"
        title="Best used cars for commuting in the UK"
        subtitle="Used car buying guide"
        ctaComponent={
          <RegLookupCta
            title="Found a commuting car?"
            subtitle="Check the exact registration for MOT history, repeated advisories and hidden repair-cost risks before you buy."
            variant="light"
          />
        }
        bodyContent={
          <div className="space-y-3">
            <p>
              Commuting puts regular, repeated stress on a car. Whether your
              journey is short and urban or longer and motorway-based, reliability
              and running costs matter.
            </p>
            <p>
              Use this guide to shortlist sensible commuting cars, then check the
              exact registration before viewing, negotiating or paying a deposit.
            </p>
          </div>
        }
      />

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">
          Good commuting cars to consider in the UK
        </h2>
        <p className="text-slate-700">
          These models are popular commuting choices because they balance comfort,
          practicality and availability. The safest choice is still the individual
          car with the cleanest history and condition.
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
          What to expect from a commuting car
        </h2>
        <p className="mt-3 text-slate-700">
          Daily commuting increases wear on key components such as tyres, brakes
          and suspension. Stop-start traffic can also accelerate clutch wear and
          general wear over time.
        </p>
        <ul className="mt-3 list-disc pl-6 text-slate-700">
          <li>Check tyres, brakes and suspension condition</li>
          <li>Look for repeated MOT advisories</li>
          <li>Frequent use increases wear over time</li>
          <li>Maintenance history matters more than mileage alone</li>
        </ul>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">
          Commuting car buying mistakes to avoid
        </h2>
        <p className="text-slate-700">
          Do not assume a common model is automatically a safe buy. Many commuter
          cars have had heavy use, which can lead to hidden maintenance costs.
        </p>
        <p className="text-slate-700">
          Before viewing, check whether the MOT history shows repeat warnings,
          whether issues were repaired and whether the asking price reflects the
          likely condition.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">Useful next steps</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Link
            href="/best-cars-for-city-driving-uk"
            className="rounded-xl border p-4 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <h3 className="font-medium">City cars</h3>
            <p className="mt-1 text-sm text-slate-600">
              Compare urban-friendly used cars
            </p>
          </Link>
          <Link
            href="/best-cars-for-motorway-driving-uk"
            className="rounded-xl border p-4 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <h3 className="font-medium">Motorway cars</h3>
            <p className="mt-1 text-sm text-slate-600">
              Compare long-distance options
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