import type { Metadata } from "next";
import Link from "next/link";
import HeroCtaTextPanel from "@/components/seo/HeroCtaTextPanel";
import RegLookupCta from "@/components/seo/RegLookupCta";
import { absoluteUrl } from "@/lib/seo/routes";

export const metadata: Metadata = {
  title: "Best Cheap to Run Cars UK | AutoAudit",
  description:
    "Browse cheap to run used cars in the UK, compare ownership risks, and check the exact car by registration before you buy.",
  alternates: {
    canonical: absoluteUrl("/best-cheap-to-run-cars-uk"),
  },
  openGraph: {
    title: "Best Cheap to Run Cars UK | AutoAudit",
    description:
      "Browse cheap to run used cars in the UK, compare ownership risks, and check the exact car by registration before you buy.",
    url: absoluteUrl("/best-cheap-to-run-cars-uk"),
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Best cheap to run cars UK | AutoAudit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Cheap to Run Cars UK | AutoAudit",
    description:
      "Browse cheap to run used cars in the UK, compare ownership risks, and check the exact car by registration before you buy.",
    images: ["/og-image.png"],
  },
};

const recommendedCars = [
  {
    name: "Toyota Yaris",
    href: "/cars/toyota/yaris/common-problems",
    summary:
      "A strong cheap-to-run option with sensible running costs and a good reliability reputation. Still check MOT history, tyres, brakes and servicing.",
  },
  {
    name: "Ford Fiesta",
    href: "/cars/ford/fiesta/common-problems",
    summary:
      "Common, affordable and easy to repair, with plenty of parts availability. Check clutch wear, suspension advisories and repeat MOT warnings.",
  },
  {
    name: "Vauxhall Corsa",
    href: "/cars/vauxhall/corsa/common-problems",
    summary:
      "Usually affordable to buy and run, but many examples have had hard town use. Check tyres, brakes, clutch and suspension carefully.",
  },
  {
    name: "Volkswagen Polo",
    href: "/cars/volkswagen/polo/common-problems",
    summary:
      "A popular small car that can be economical to own, but maintenance history matters more than badge appeal.",
  },
  {
    name: "Nissan Micra",
    href: "/cars/nissan/micra/common-problems",
    summary:
      "Simple, compact and often affordable to maintain. Check older examples for corrosion, brakes, tyres and MOT advisory patterns.",
  },
  {
    name: "Honda Jazz",
    href: "/cars/honda/jazz/common-problems",
    summary:
      "Practical and often bought by careful owners, but older cars still need checks for age-related brakes, suspension and corrosion issues.",
  },
];

export default function BestCheapToRunCarsUkPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <HeroCtaTextPanel
        heroImageSrc="/hero-car-road.png"
        heroAlt="Cheap to run used cars in the UK"
        title="Best cheap to run used cars in the UK"
        subtitle="Used car buying guide"
        ctaComponent={
          <RegLookupCta
            title="Found a cheap-to-run car?"
            subtitle="Check the exact registration for MOT history, repeated advisories and hidden repair-cost risks before you buy."
            variant="light"
          />
        }
        bodyContent={
          <div className="space-y-3">
            <p>
              A cheap-to-run car is not just about fuel economy or insurance.
              The real cost of ownership also depends on tyres, brakes,
              servicing, MOT history and whether repair issues have been
              ignored.
            </p>
            <p>
              Use this guide to shortlist sensible low-cost options, then check
              the exact registration before viewing, negotiating or paying a
              deposit.
            </p>
          </div>
        }
      />

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">
          Cheap to run cars to consider in the UK
        </h2>
        <p className="text-slate-700">
          These cars are sensible starting points if you want lower running
          costs. The best choice is still the individual car with the cleanest
          MOT history and strongest evidence of maintenance.
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
          What makes a car cheap to run?
        </h2>
        <p className="mt-3 text-slate-700">
          Running costs are not only monthly fuel and insurance. A car with
          neglected tyres, brakes, suspension or unresolved advisories can become
          expensive quickly, even if it looks cheap on paper.
        </p>
        <ul className="mt-3 list-disc pl-6 text-slate-700">
          <li>Look for simple, common models with good parts availability</li>
          <li>Check tyres, brakes and suspension before buying</li>
          <li>Repeated MOT advisories may point to delayed maintenance</li>
          <li>Service history can reduce the risk of surprise costs</li>
        </ul>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">
          Cheap-to-run car buying mistakes to avoid
        </h2>
        <p className="text-slate-700">
          Do not assume the cheapest car in the advert will be cheapest to own.
          A slightly more expensive car with better history can cost less overall
          than a neglected bargain.
        </p>
        <p className="text-slate-700">
          Before viewing, check whether the MOT history shows repeat warnings,
          whether old advisories were fixed and whether normal wear items look
          due soon.
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
            href="/best-cars-under-5000"
            className="rounded-xl border p-4 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <h3 className="font-medium">Cars under £5,000</h3>
            <p className="mt-1 text-sm text-slate-600">
              Compare affordable used cars by budget
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