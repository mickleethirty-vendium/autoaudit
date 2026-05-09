import type { Metadata } from "next";
import Link from "next/link";
import HeroCtaTextPanel from "@/components/seo/HeroCtaTextPanel";
import RegLookupCta from "@/components/seo/RegLookupCta";
import { absoluteUrl } from "@/lib/seo/routes";

export const metadata: Metadata = {
  title: "Best Estate Cars UK | AutoAudit",
  description:
    "Browse the best estate cars in the UK, compare ownership risks, and check the exact car by registration before you buy.",
  alternates: {
    canonical: absoluteUrl("/best-estate-cars-uk"),
  },
  openGraph: {
    title: "Best Estate Cars UK | AutoAudit",
    description:
      "Browse the best estate cars in the UK, compare ownership risks, and check the exact car by registration before you buy.",
    url: absoluteUrl("/best-estate-cars-uk"),
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Best estate cars UK | AutoAudit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Estate Cars UK | AutoAudit",
    description:
      "Browse the best estate cars in the UK, compare ownership risks, and check the exact car by registration before you buy.",
    images: ["/og-image.png"],
  },
};

const recommendedCars = [
  {
    name: "Volkswagen Golf Estate",
    href: "/cars/volkswagen/golf/common-problems",
    summary:
      "A practical and popular estate with strong availability, but check servicing, suspension wear and repeat MOT advisories.",
  },
  {
    name: "Ford Focus Estate",
    href: "/cars/ford/focus/common-problems",
    summary:
      "A common family estate with good practicality, but check clutch wear, tyres, suspension and MOT history carefully.",
  },
  {
    name: "BMW 3 Series Touring",
    href: "/cars/bmw/3-series/common-problems",
    summary:
      "A premium estate option with strong driving appeal, but maintenance history and repair costs matter more than badge.",
  },
  {
    name: "Audi A4 Avant",
    href: "/cars/audi/a4/common-problems",
    summary:
      "A refined estate choice with good comfort, but check servicing, oil leaks, suspension and repeated advisories.",
  },
  {
    name: "Skoda Octavia Estate",
    href: "/cars/skoda/octavia/common-problems",
    summary:
      "A practical, value-focused estate with strong boot space, but check MOT history, brakes, tyres and suspension wear.",
  },
  {
    name: "Toyota Corolla Touring Sports",
    href: "/cars/toyota/corolla/common-problems",
    summary:
      "A hybrid estate option with strong practicality, but still check servicing, brakes, tyres and MOT patterns.",
  },
];

export default function BestEstateCarsUkPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <HeroCtaTextPanel
        heroImageSrc="/hero-car-road.png"
        heroAlt="Best estate cars in the UK"
        title="Best estate cars in the UK"
        subtitle="Used car buying guide"
        ctaComponent={
          <RegLookupCta
            title="Found a possible estate car?"
            subtitle="Check the exact registration for MOT history, repeated advisories and hidden repair-cost risks before you buy."
            variant="light"
          />
        }
        bodyContent={
          <div className="space-y-3">
            <p>
              Estate cars are popular with UK buyers who want maximum boot space
              without moving to an SUV. They are often used for family life,
              motorway driving and carrying heavy loads.
            </p>
            <p>
              Use this guide to shortlist sensible estate cars, then check the
              exact registration before viewing, negotiating or paying a
              deposit.
            </p>
          </div>
        }
      />

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">
          Good estate cars to consider in the UK
        </h2>
        <p className="text-slate-700">
          These models are popular estate choices because they offer space,
          practicality and strong availability. The safest choice is still the
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
          What to expect from a used estate car
        </h2>
        <p className="mt-3 text-slate-700">
          Estate cars are often used for carrying heavy loads or long motorway
          journeys. This can lead to increased wear on tyres, brakes and
          suspension components.
        </p>
        <ul className="mt-3 list-disc pl-6 text-slate-700">
          <li>Check tyres, brakes and suspension for wear</li>
          <li>Look for repeat advisories in MOT history</li>
          <li>Heavier use can affect long-term condition</li>
          <li>Condition matters more than model reputation</li>
        </ul>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">
          Estate car buying mistakes to avoid
        </h2>
        <p className="text-slate-700">
          Do not assume a large boot means a better buy. A poorly maintained
          estate car can quickly become expensive due to tyres, brakes and
          suspension costs.
        </p>
        <p className="text-slate-700">
          Before viewing, check whether the MOT history shows repeat warnings,
          whether issues were repaired and whether the price reflects likely
          maintenance work.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">Useful next steps</h2>
        <div className="grid gap-4 sm:grid-cols-3">
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
            href="/best-cars-under-10000"
            className="rounded-xl border p-4 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <h3 className="font-medium">Cars under £10,000</h3>
            <p className="mt-1 text-sm text-slate-600">
              Compare estate options by budget
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