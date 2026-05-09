import type { Metadata } from "next";
import Link from "next/link";
import HeroCtaTextPanel from "@/components/seo/HeroCtaTextPanel";
import RegLookupCta from "@/components/seo/RegLookupCta";
import { absoluteUrl } from "@/lib/seo/routes";

export const metadata: Metadata = {
  title: "Best Used Cars for Dog Owners UK | AutoAudit",
  description:
    "Browse the best used cars for dog owners in the UK, compare ownership risks, and check the exact car by registration before you buy.",
  alternates: {
    canonical: absoluteUrl("/best-used-cars-for-dog-owners-uk"),
  },
  openGraph: {
    title: "Best Used Cars for Dog Owners UK | AutoAudit",
    description:
      "Browse the best used cars for dog owners in the UK, compare ownership risks, and check the exact car by registration before you buy.",
    url: absoluteUrl("/best-used-cars-for-dog-owners-uk"),
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Best used cars for dog owners UK | AutoAudit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Used Cars for Dog Owners UK | AutoAudit",
    description:
      "Browse the best used cars for dog owners in the UK, compare ownership risks, and check the exact car by registration before you buy.",
    images: ["/og-image.png"],
  },
};

const recommendedCars = [
  {
    name: "Skoda Octavia Estate",
    href: "/cars/skoda/octavia/common-problems",
    summary:
      "A practical estate with a large boot, ideal for dogs, but check tyres, brakes and suspension wear.",
  },
  {
    name: "Volkswagen Golf Estate",
    href: "/cars/volkswagen/golf/common-problems",
    summary:
      "A popular estate with good space, but check servicing history and repeat MOT advisories.",
  },
  {
    name: "Ford Kuga",
    href: "/cars/ford/kuga/common-problems",
    summary:
      "A practical SUV with good boot height for dogs, but heavier use can mean suspension and tyre wear.",
  },
  {
    name: "Nissan Qashqai",
    href: "/cars/nissan/qashqai/common-problems",
    summary:
      "A common SUV choice with good practicality, but check brakes, tyres and suspension carefully.",
  },
  {
    name: "Volkswagen Tiguan",
    href: "/cars/volkswagen/tiguan/common-problems",
    summary:
      "A spacious SUV option, but maintenance history and MOT patterns matter more than model reputation.",
  },
  {
    name: "Toyota RAV4",
    href: "/cars/toyota/rav4/common-problems",
    summary:
      "A reliable SUV choice with good practicality, but still check servicing, tyres and MOT advisories.",
  },
];

export default function BestUsedCarsForDogOwnersUkPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <HeroCtaTextPanel
        heroImageSrc="/hero-car-road.png"
        heroAlt="Best used cars for dog owners in the UK"
        title="Best used cars for dog owners in the UK"
        subtitle="Used car buying guide"
        ctaComponent={
          <RegLookupCta
            title="Found a dog-friendly car?"
            subtitle="Check the exact registration for MOT history, repeated advisories and hidden repair-cost risks before you buy."
            variant="light"
          />
        }
        bodyContent={
          <div className="space-y-3">
            <p>
              Dog owners often need more space, practicality and easy access when
              choosing a car. Boot size, loading height and durability all
              matter.
            </p>
            <p>
              Use this guide to shortlist suitable cars, then check the exact
              registration before viewing, negotiating or paying a deposit.
            </p>
          </div>
        }
      />

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">
          Good used cars for dog owners in the UK
        </h2>
        <p className="text-slate-700">
          These models are popular with dog owners because they offer space,
          practicality and ease of use. The safest choice is still the individual
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
          What to look for as a dog owner
        </h2>
        <p className="mt-3 text-slate-700">
          Space and practicality matter, but condition still matters more. Cars
          used for carrying dogs can show more interior wear and heavier usage.
        </p>
        <ul className="mt-3 list-disc pl-6 text-slate-700">
          <li>Check boot space and loading height</li>
          <li>Look for signs of interior wear and damage</li>
          <li>Review MOT history for repeat advisories</li>
          <li>Focus on overall condition and maintenance</li>
        </ul>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">
          Buying mistakes to avoid
        </h2>
        <p className="text-slate-700">
          Do not assume a large boot guarantees a good buy. A poorly maintained
          car can still lead to expensive repairs regardless of practicality.
        </p>
        <p className="text-slate-700">
          Before viewing, check whether the MOT history shows repeated warnings,
          whether previous issues were fixed and whether the price reflects the
          condition.
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
              Compare practical, spacious vehicles
            </p>
          </Link>
          <Link
            href="/best-family-cars-uk"
            className="rounded-xl border p-4 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <h3 className="font-medium">Best family cars</h3>
            <p className="mt-1 text-sm text-slate-600">
              Compare larger used cars
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