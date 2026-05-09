import type { Metadata } from "next";
import Link from "next/link";
import HeroCtaTextPanel from "@/components/seo/HeroCtaTextPanel";
import RegLookupCta from "@/components/seo/RegLookupCta";
import { absoluteUrl } from "@/lib/seo/routes";

export const metadata: Metadata = {
  title: "Best Used Cars for New Drivers UK | AutoAudit",
  description:
    "Browse the best used cars for new drivers in the UK, compare ownership risks, and check the exact car by registration before you buy.",
  alternates: {
    canonical: absoluteUrl("/best-used-cars-for-new-drivers-uk"),
  },
  openGraph: {
    title: "Best Used Cars for New Drivers UK | AutoAudit",
    description:
      "Browse the best used cars for new drivers in the UK, compare ownership risks, and check the exact car by registration before you buy.",
    url: absoluteUrl("/best-used-cars-for-new-drivers-uk"),
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Best used cars for new drivers UK | AutoAudit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Used Cars for New Drivers UK | AutoAudit",
    description:
      "Browse the best used cars for new drivers in the UK, compare ownership risks, and check the exact car by registration before you buy.",
    images: ["/og-image.png"],
  },
};

const recommendedCars = [
  {
    name: "Ford Fiesta",
    href: "/cars/ford/fiesta/common-problems",
    summary:
      "A popular first car with strong availability, but check clutch wear, tyres, brakes and MOT history carefully.",
  },
  {
    name: "Vauxhall Corsa",
    href: "/cars/vauxhall/corsa/common-problems",
    summary:
      "Affordable and easy to drive, but many examples have had hard use. Check suspension, clutch and repeated advisories.",
  },
  {
    name: "Toyota Yaris",
    href: "/cars/toyota/yaris/common-problems",
    summary:
      "A sensible and reliable choice for new drivers, but still check servicing, tyres and MOT patterns.",
  },
  {
    name: "Volkswagen Polo",
    href: "/cars/volkswagen/polo/common-problems",
    summary:
      "A compact and refined option, but condition and maintenance history matter more than badge.",
  },
  {
    name: "Hyundai i10",
    href: "/cars/hyundai/i10/common-problems",
    summary:
      "A simple and easy-to-drive small car, but check brakes, tyres and servicing history on older examples.",
  },
  {
    name: "Kia Picanto",
    href: "/cars/kia/picanto/common-problems",
    summary:
      "A compact and practical city-friendly car, but still check MOT advisories and maintenance records carefully.",
  },
];

export default function BestUsedCarsForNewDriversUkPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <HeroCtaTextPanel
        heroImageSrc="/hero-car-road.png"
        heroAlt="Best used cars for new drivers in the UK"
        title="Best used cars for new drivers in the UK"
        subtitle="Used car buying guide"
        ctaComponent={
          <RegLookupCta
            title="Found a possible first car?"
            subtitle="Check the exact registration for MOT history, repeated advisories and hidden repair-cost risks before you buy."
            variant="light"
          />
        }
        bodyContent={
          <div className="space-y-3">
            <p>
              Choosing a first car is about more than just price. New drivers
              often need something easy to drive, affordable to run and low risk
              when it comes to repairs and maintenance.
            </p>
            <p>
              Use this guide to shortlist sensible options, then check the exact
              registration before viewing, negotiating or paying a deposit.
            </p>
          </div>
        }
      />

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">
          Good used cars for new drivers in the UK
        </h2>
        <p className="text-slate-700">
          These models are popular first-car choices because they are widely
          available, relatively simple to drive and easier to compare. The safest
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
          What matters most for a new driver car
        </h2>
        <p className="mt-3 text-slate-700">
          First cars often get used heavily in town driving, which increases wear
          on clutches, brakes and tyres. Condition and history matter more than
          the model name.
        </p>
        <ul className="mt-3 list-disc pl-6 text-slate-700">
          <li>Check clutch wear and driving condition</li>
          <li>Look for repeat MOT advisories</li>
          <li>Ensure servicing has been carried out regularly</li>
          <li>Focus on condition over mileage alone</li>
        </ul>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">
          First car buying mistakes to avoid
        </h2>
        <p className="text-slate-700">
          Do not choose purely on price or insurance group. A cheap car with
          hidden issues can quickly become expensive if it needs repairs soon
          after purchase.
        </p>
        <p className="text-slate-700">
          Before viewing, check whether the MOT history shows repeated warnings,
          whether past issues were repaired and whether the price reflects the
          condition.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">Useful next steps</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Link
            href="/best-first-car-uk"
            className="rounded-xl border p-4 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <h3 className="font-medium">Best first cars</h3>
            <p className="mt-1 text-sm text-slate-600">
              Compare entry-level used cars
            </p>
          </Link>
          <Link
            href="/best-cheap-to-run-cars-uk"
            className="rounded-xl border p-4 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <h3 className="font-medium">Cheap to run cars</h3>
            <p className="mt-1 text-sm text-slate-600">
              Compare low-cost ownership options
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