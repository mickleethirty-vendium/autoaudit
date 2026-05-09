import type { Metadata } from "next";
import Link from "next/link";
import HeroCtaTextPanel from "@/components/seo/HeroCtaTextPanel";
import RegLookupCta from "@/components/seo/RegLookupCta";
import { absoluteUrl } from "@/lib/seo/routes";

export const metadata: Metadata = {
  title: "Best Low Mileage Used Cars UK | AutoAudit",
  description:
    "Browse low mileage used cars in the UK, understand common risks, and check the exact car by registration before you buy.",
  alternates: {
    canonical: absoluteUrl("/best-low-mileage-used-cars-uk"),
  },
  openGraph: {
    title: "Best Low Mileage Used Cars UK | AutoAudit",
    description:
      "Browse low mileage used cars in the UK, understand common risks, and check the exact car by registration before you buy.",
    url: absoluteUrl("/best-low-mileage-used-cars-uk"),
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Best low mileage used cars UK | AutoAudit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Low Mileage Used Cars UK | AutoAudit",
    description:
      "Browse low mileage used cars in the UK, understand common risks, and check the exact car by registration before you buy.",
    images: ["/og-image.png"],
  },
};

const recommendedCars = [
  {
    name: "Toyota Yaris",
    href: "/cars/toyota/yaris/common-problems",
    summary:
      "A sensible low-mileage small-car option, but older examples can still suffer from age-related tyres, brakes, corrosion and MOT advisories.",
  },
  {
    name: "Honda Jazz",
    href: "/cars/honda/jazz/common-problems",
    summary:
      "Often found with lower mileage and careful ownership, but check servicing, brakes, suspension and age-related MOT warnings.",
  },
  {
    name: "Volkswagen Polo",
    href: "/cars/volkswagen/polo/common-problems",
    summary:
      "A popular low-mileage small car choice, but condition and maintenance evidence matter more than mileage alone.",
  },
  {
    name: "Ford Fiesta",
    href: "/cars/ford/fiesta/common-problems",
    summary:
      "Common and easy to compare, but low mileage does not remove the need to check clutch, tyres, brakes and suspension history.",
  },
  {
    name: "Toyota Corolla",
    href: "/cars/toyota/corolla/common-problems",
    summary:
      "A sensible family option if you find a clean low-mileage example, but still check servicing and MOT advisory patterns.",
  },
  {
    name: "Volkswagen Golf",
    href: "/cars/volkswagen/golf/common-problems",
    summary:
      "A strong all-rounder if condition is good, but low mileage cars still need checks for servicing gaps, tyres, brakes and suspension.",
  },
];

export default function BestLowMileageUsedCarsUkPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <HeroCtaTextPanel
        heroImageSrc="/hero-car-road.png"
        heroAlt="Low mileage used cars in the UK"
        title="Best low mileage used cars in the UK"
        subtitle="Used car buying guide"
        ctaComponent={
          <RegLookupCta
            title="Found a low-mileage used car?"
            subtitle="Check the exact registration for MOT history, mileage patterns, repeated advisories and hidden repair-cost risks before you buy."
            variant="light"
          />
        }
        bodyContent={
          <div className="space-y-3">
            <p>
              Low mileage can be attractive when buying used, but it does not
              automatically mean low risk. Cars can still suffer from age-related
              wear, servicing gaps and MOT advisory patterns.
            </p>
            <p>
              Use this guide to shortlist sensible low-mileage options, then
              check the exact registration before viewing, negotiating or paying
              a deposit.
            </p>
          </div>
        }
      />

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">
          Good low mileage used cars to consider in the UK
        </h2>
        <p className="text-slate-700">
          These models can make sense if you find a clean, well-maintained
          low-mileage example. The safest choice is still the individual car with
          the clearest MOT and service history.
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
          Is low mileage always better?
        </h2>
        <p className="mt-3 text-slate-700">
          Not always. A low-mileage car can still have old tyres, sticking
          brakes, servicing gaps, corrosion or wear caused by repeated short
          journeys. Mileage is useful, but history matters more.
        </p>
        <ul className="mt-3 list-disc pl-6 text-slate-700">
          <li>Check mileage consistency across MOT history</li>
          <li>Look for long gaps between services or tests</li>
          <li>Age-related tyres, brakes and corrosion can still be expensive</li>
          <li>Low mileage does not cancel out repeated advisories</li>
        </ul>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">
          Low-mileage buying mistakes to avoid
        </h2>
        <p className="text-slate-700">
          Do not pay extra for low mileage without checking the evidence. A car
          with low mileage but poor servicing or repeated advisories may be a
          worse buy than a higher-mileage car that has been maintained properly.
        </p>
        <p className="text-slate-700">
          Before viewing, check whether the mileage progression looks sensible,
          whether MOT advisories repeat and whether the seller can explain how
          the car has been used.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">Useful next steps</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Link
            href="/best-reliable-cars-uk"
            className="rounded-xl border p-4 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <h3 className="font-medium">Best reliable cars</h3>
            <p className="mt-1 text-sm text-slate-600">
              Compare lower-risk used cars
            </p>
          </Link>
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
            href="/check-car-by-registration"
            className="rounded-xl border p-4 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <h3 className="font-medium">Check the exact car</h3>
            <p className="mt-1 text-sm text-slate-600">
              Review MOT history and mileage risk signals by registration
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}