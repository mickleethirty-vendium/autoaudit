import type { Metadata } from "next";
import Link from "next/link";
import HeroCtaTextPanel from "@/components/seo/HeroCtaTextPanel";
import RegLookupCta from "@/components/seo/RegLookupCta";
import { absoluteUrl } from "@/lib/seo/routes";

export const metadata: Metadata = {
  title: "Best Small Cars UK | AutoAudit",
  description:
    "Browse sensible small cars in the UK, compare common ownership risks, and check the exact car by registration before you buy.",
  alternates: {
    canonical: absoluteUrl("/best-small-cars-uk"),
  },
  openGraph: {
    title: "Best Small Cars UK | AutoAudit",
    description:
      "Browse sensible small cars in the UK, compare common ownership risks, and check the exact car by registration before you buy.",
    url: absoluteUrl("/best-small-cars-uk"),
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Best small cars UK | AutoAudit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Small Cars UK | AutoAudit",
    description:
      "Browse sensible small cars in the UK, compare common ownership risks, and check the exact car by registration before you buy.",
    images: ["/og-image.png"],
  },
};

const recommendedCars = [
  {
    name: "Ford Fiesta",
    href: "/cars/ford/fiesta/common-problems",
    summary:
      "One of the UK’s most popular small cars, with strong parts availability and plenty of choice. Check clutch wear, suspension advisories and MOT history carefully.",
  },
  {
    name: "Vauxhall Corsa",
    href: "/cars/vauxhall/corsa/common-problems",
    summary:
      "Affordable, common and easy to compare, but many examples have had hard town use. Look closely at tyres, brakes, clutch and repeat advisories.",
  },
  {
    name: "Volkswagen Polo",
    href: "/cars/volkswagen/polo/common-problems",
    summary:
      "A solid small car with a more premium feel than some rivals, but condition and service history matter more than badge reputation.",
  },
  {
    name: "Toyota Yaris",
    href: "/cars/toyota/yaris/common-problems",
    summary:
      "A sensible small-car option with a reputation for reliability. Older examples still need checks for brakes, corrosion, tyres and MOT patterns.",
  },
  {
    name: "Nissan Micra",
    href: "/cars/nissan/micra/common-problems",
    summary:
      "Simple, compact and often affordable to run. Check MOT history for corrosion, brakes, tyres and suspension wear before buying.",
  },
  {
    name: "Peugeot 208",
    href: "/cars/peugeot/208/common-problems",
    summary:
      "A popular small hatchback with good availability, but check service history, electrical issues and repeat MOT advisories before committing.",
  },
];

export default function BestSmallCarsUkPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <HeroCtaTextPanel
        heroImageSrc="/hero-car-road.png"
        heroAlt="Best small cars in the UK"
        title="Best small cars in the UK"
        subtitle="Used car buying guide"
        ctaComponent={
          <RegLookupCta
            title="Found a possible small car?"
            subtitle="Check the exact registration for MOT history, repeated advisories and hidden repair-cost risks before you buy."
            variant="light"
          />
        }
        bodyContent={
          <div className="space-y-3">
            <p>
              Small cars are popular in the UK because they are usually cheaper
              to run, easier to park and simpler to live with. But when buying
              used, the exact car matters more than the model name.
            </p>
            <p>
              Use this guide to shortlist sensible small cars, then check the
              exact registration before viewing, negotiating or paying a
              deposit.
            </p>
          </div>
        }
      />

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">
          Good small cars to consider in the UK
        </h2>
        <p className="text-slate-700">
          These models are common small-car choices because they are practical,
          widely available and usually manageable to own. The best choice is
          still the individual car with the cleanest history and condition.
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
          What makes a good used small car?
        </h2>
        <p className="mt-3 text-slate-700">
          A good used small car should be cheap enough to run, easy to maintain
          and reliable enough for daily use. Town driving can be hard on small
          cars, so clutch, tyres, brakes and suspension checks matter.
        </p>
        <ul className="mt-3 list-disc pl-6 text-slate-700">
          <li>Check clutch wear on manual cars used mainly around town</li>
          <li>Look for repeat advisories around tyres, brakes and suspension</li>
          <li>Service history matters more as mileage increases</li>
          <li>Low insurance does not guarantee low repair risk</li>
        </ul>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">
          Small-car buying mistakes to avoid
        </h2>
        <p className="text-slate-700">
          Do not assume every small car is cheap to own. A neglected example can
          quickly need tyres, brakes, suspension work or clutch repairs.
        </p>
        <p className="text-slate-700">
          Before viewing, check whether the MOT history shows repeat warnings,
          whether old advisories were fixed and whether the asking price still
          makes sense after likely repair costs.
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
              Compare sensible beginner-friendly used cars
            </p>
          </Link>
          <Link
            href="/best-cars-under-5000"
            className="rounded-xl border p-4 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <h3 className="font-medium">Cars under £5,000</h3>
            <p className="mt-1 text-sm text-slate-600">
              Compare small and affordable used cars by budget
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