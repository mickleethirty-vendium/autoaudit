import type { Metadata } from "next";
import Link from "next/link";
import HeroCtaTextPanel from "@/components/seo/HeroCtaTextPanel";
import RegLookupCta from "@/components/seo/RegLookupCta";
import { absoluteUrl } from "@/lib/seo/routes";

export const metadata: Metadata = {
  title: "Best Used Cars Under £15,000 UK | AutoAudit",
  description:
    "Browse the best used cars under £15,000 in the UK, compare ownership risks, and check the exact car by registration before you buy.",
  alternates: {
    canonical: absoluteUrl("/best-cars-under-15000"),
  },
  openGraph: {
    title: "Best Used Cars Under £15,000 UK | AutoAudit",
    description:
      "Browse the best used cars under £15,000 in the UK, compare ownership risks, and check the exact car by registration before you buy.",
    url: absoluteUrl("/best-cars-under-15000"),
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Best used cars under £15,000 UK | AutoAudit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Used Cars Under £15,000 UK | AutoAudit",
    description:
      "Browse the best used cars under £15,000 in the UK, compare ownership risks, and check the exact car by registration before you buy.",
    images: ["/og-image.png"],
  },
};

const recommendedCars = [
  {
    name: "Volkswagen Golf",
    href: "/cars/volkswagen/golf/common-problems",
    summary:
      "A well-rounded hatchback with strong demand and availability, but always check service history, suspension wear and repeat advisories.",
  },
  {
    name: "BMW 3 Series",
    href: "/cars/bmw/3-series/common-problems",
    summary:
      "A popular premium option at this budget, offering newer examples, but maintenance costs and history matter more than badge appeal.",
  },
  {
    name: "Audi A4",
    href: "/cars/audi/a4/common-problems",
    summary:
      "A refined saloon with strong motorway comfort, but watch for suspension wear, oil leaks and unresolved MOT warnings.",
  },
  {
    name: "Ford Kuga",
    href: "/cars/ford/kuga/common-problems",
    summary:
      "A practical SUV with good availability, but family use can mean wear on brakes, tyres and suspension components.",
  },
  {
    name: "Toyota Corolla",
    href: "/cars/toyota/corolla/common-problems",
    summary:
      "A reliability-focused choice with newer hybrid options appearing at this budget. Still check MOT history and servicing carefully.",
  },
  {
    name: "Mercedes-Benz A-Class",
    href: "/cars/mercedes-benz/a-class/common-problems",
    summary:
      "A premium hatchback option with strong appeal, but check maintenance evidence, suspension wear and repeat advisories.",
  },
];

export default function BestCarsUnder15000Page() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <HeroCtaTextPanel
        heroImageSrc="/hero-car-road.png"
        heroAlt="Used cars under £15,000 in the UK"
        title="Best used cars under £15,000 in the UK"
        subtitle="Used car buying guide"
        ctaComponent={
          <RegLookupCta
            title="Found a car under £15,000?"
            subtitle="Check the exact registration for MOT history, repeated advisories and hidden repair-cost risks before you buy."
            variant="light"
          />
        }
        bodyContent={
          <div className="space-y-3">
            <p>
              A £15,000 budget gives access to newer used cars, better
              specifications and a wider mix of premium and mainstream options.
            </p>
            <p>
              But even at this level, the biggest risk is still the individual
              car. Use this guide to compare models, then check the exact
              registration before making a decision.
            </p>
          </div>
        }
      />

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">
          Good used cars to consider under £15,000
        </h2>
        <p className="text-slate-700">
          These cars are popular with UK buyers because they offer a strong mix
          of comfort, practicality and availability at this budget level.
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
          At £15,000, buyers often compare newer mainstream cars against older
          premium models. Both can make sense, but maintenance history and
          condition still matter more than badge or specification.
        </p>
        <ul className="mt-3 list-disc pl-6 text-slate-700">
          <li>Lower mileage and newer models become more common</li>
          <li>Premium cars may bring higher running costs</li>
          <li>Service history should be clearer and more complete</li>
          <li>Repeated advisories still indicate potential future cost</li>
        </ul>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">
          How to choose the right car under £15,000
        </h2>
        <p className="text-slate-700">
          It can be tempting to prioritise badge, specification or styling at
          this level, but the safer approach is still to focus on maintenance,
          condition and MOT history.
        </p>
        <p className="text-slate-700">
          Before viewing, check whether the car has repeat advisories, whether
          previous issues were fixed and whether the price reflects any likely
          repair work.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">Useful next steps</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Link
            href="/best-cars-under-12000"
            className="rounded-xl border p-4 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <h3 className="font-medium">Cars under £12,000</h3>
            <p className="mt-1 text-sm text-slate-600">
              Compare slightly cheaper options
            </p>
          </Link>
          <Link
            href="/best-cars-under-20000"
            className="rounded-xl border p-4 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <h3 className="font-medium">Cars under £20,000</h3>
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