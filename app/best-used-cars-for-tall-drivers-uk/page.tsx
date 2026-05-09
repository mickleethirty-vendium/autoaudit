import type { Metadata } from "next";
import Link from "next/link";
import HeroCtaTextPanel from "@/components/seo/HeroCtaTextPanel";
import RegLookupCta from "@/components/seo/RegLookupCta";
import { absoluteUrl } from "@/lib/seo/routes";

export const metadata: Metadata = {
  title: "Best Used Cars for Tall Drivers UK | AutoAudit",
  description:
    "Browse the best used cars for tall drivers in the UK, compare ownership risks, and check the exact car by registration before you buy.",
  alternates: {
    canonical: absoluteUrl("/best-used-cars-for-tall-drivers-uk"),
  },
  openGraph: {
    title: "Best Used Cars for Tall Drivers UK | AutoAudit",
    description:
      "Browse the best used cars for tall drivers in the UK, compare ownership risks, and check the exact car by registration before you buy.",
    url: absoluteUrl("/best-used-cars-for-tall-drivers-uk"),
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Best used cars for tall drivers UK | AutoAudit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Used Cars for Tall Drivers UK | AutoAudit",
    description:
      "Browse the best used cars for tall drivers in the UK, compare ownership risks, and check the exact car by registration before you buy.",
    images: ["/og-image.png"],
  },
};

const recommendedCars = [
  {
    name: "Volkswagen Golf",
    href: "/cars/volkswagen/golf/common-problems",
    summary:
      "A well-balanced hatchback with good driving position and adjustability, but still check tyres, brakes and MOT history.",
  },
  {
    name: "Ford Focus",
    href: "/cars/ford/focus/common-problems",
    summary:
      "Often offers good legroom and seating position, but check clutch wear, suspension and repeated advisories.",
  },
  {
    name: "BMW 3 Series",
    href: "/cars/bmw/3-series/common-problems",
    summary:
      "A comfortable option for taller drivers, but maintenance history and repair-cost exposure are important.",
  },
  {
    name: "Volkswagen Tiguan",
    href: "/cars/volkswagen/tiguan/common-problems",
    summary:
      "A higher driving position with more headroom, but check suspension wear, tyres and MOT patterns.",
  },
  {
    name: "Nissan Qashqai",
    href: "/cars/nissan/qashqai/common-problems",
    summary:
      "A practical SUV-style option with good cabin space, but check brakes, tyres and suspension carefully.",
  },
  {
    name: "Ford Kuga",
    href: "/cars/ford/kuga/common-problems",
    summary:
      "A roomy SUV with good space, but heavier use can lead to tyre, brake and suspension wear.",
  },
];

export default function BestUsedCarsForTallDriversUkPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <HeroCtaTextPanel
        heroImageSrc="/hero-car-road.png"
        heroAlt="Best used cars for tall drivers in the UK"
        title="Best used cars for tall drivers in the UK"
        subtitle="Used car buying guide"
        ctaComponent={
          <RegLookupCta
            title="Found a car that fits?"
            subtitle="Check the exact registration for MOT history, repeated advisories and hidden repair-cost risks before you buy."
            variant="light"
          />
        }
        bodyContent={
          <div className="space-y-3">
            <p>
              Taller drivers often need more headroom, legroom and seat
              adjustability than average. The right driving position can make a
              big difference to comfort and safety.
            </p>
            <p>
              Use this guide to shortlist cars that typically offer more space,
              then check the exact registration before viewing, negotiating or
              paying a deposit.
            </p>
          </div>
        }
      />

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">
          Good used cars for tall drivers in the UK
        </h2>
        <p className="text-slate-700">
          These models are commonly chosen by taller drivers because they offer
          more space or a higher driving position. The safest choice is still the
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
          What to check when buying as a tall driver
        </h2>
        <p className="mt-3 text-slate-700">
          Space and comfort matter, but condition still matters more. A car that
          fits well but has poor maintenance history can quickly become
          expensive.
        </p>
        <ul className="mt-3 list-disc pl-6 text-slate-700">
          <li>Check driving position and seat adjustability in person</li>
          <li>Look for signs of heavy wear on seats and interior</li>
          <li>Review MOT history for repeat advisories</li>
          <li>Focus on condition, not just cabin size</li>
        </ul>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">
          Buying mistakes to avoid
        </h2>
        <p className="text-slate-700">
          Do not compromise too much on condition just to get more space. A poorly
          maintained car can cost far more than a slightly less spacious but
          better-maintained option.
        </p>
        <p className="text-slate-700">
          Before viewing, check whether the MOT history shows repeated warnings,
          whether previous issues were fixed and whether the price reflects the
          overall condition.
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
              Compare larger, practical vehicles
            </p>
          </Link>
          <Link
            href="/best-estate-cars-uk"
            className="rounded-xl border p-4 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <h3 className="font-medium">Best estate cars</h3>
            <p className="mt-1 text-sm text-slate-600">
              Compare spacious long-distance options
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