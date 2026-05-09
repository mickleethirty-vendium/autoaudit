import type { Metadata } from "next";
import Link from "next/link";
import HeroCtaTextPanel from "@/components/seo/HeroCtaTextPanel";
import RegLookupCta from "@/components/seo/RegLookupCta";
import { absoluteUrl } from "@/lib/seo/routes";

export const metadata: Metadata = {
  title: "Best First Cars UK | AutoAudit",
  description:
    "Browse sensible first cars in the UK, compare common used-car risks, and check the exact car by registration before you buy.",
  alternates: {
    canonical: absoluteUrl("/best-first-car-uk"),
  },
  openGraph: {
    title: "Best First Cars UK | AutoAudit",
    description:
      "Browse sensible first cars in the UK, compare common used-car risks, and check the exact car by registration before you buy.",
    url: absoluteUrl("/best-first-car-uk"),
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Best first cars UK | AutoAudit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Best First Cars UK | AutoAudit",
    description:
      "Browse sensible first cars in the UK, compare common used-car risks, and check the exact car by registration before you buy.",
    images: ["/og-image.png"],
  },
};

const recommendedCars = [
  {
    name: "Ford Fiesta",
    href: "/cars/ford/fiesta/common-problems",
    summary:
      "One of the most common first-car choices in the UK, with good parts availability and plenty of choice. Check clutch wear, suspension advisories and MOT history carefully.",
  },
  {
    name: "Vauxhall Corsa",
    href: "/cars/vauxhall/corsa/common-problems",
    summary:
      "Affordable, common and easy to find, but many examples have had hard town use. Look closely at tyres, brakes, clutch condition and repeat advisories.",
  },
  {
    name: "Volkswagen Polo",
    href: "/cars/volkswagen/polo/common-problems",
    summary:
      "A solid small-car option with a more premium feel than some rivals, but condition and service history matter more than badge reputation.",
  },
  {
    name: "Toyota Yaris",
    href: "/cars/toyota/yaris/common-problems",
    summary:
      "A sensible first-car option for buyers who value reliability, but always check older examples for age-related advisories and maintenance gaps.",
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

export default function BestFirstCarUkPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <HeroCtaTextPanel
        heroImageSrc="/hero-car-road.png"
        heroAlt="Best first cars in the UK"
        title="Best first cars in the UK"
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
              The best first car is usually affordable to buy, simple to run and
              easy to repair. But the exact car matters more than the model
              name, especially when buying used.
            </p>
            <p>
              Use this guide to shortlist sensible first-car options, then check
              the exact registration before viewing, negotiating or paying a
              deposit.
            </p>
          </div>
        }
      />

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">
          Good first cars to consider in the UK
        </h2>
        <p className="text-slate-700">
          These models are common first-car choices because they are usually
          compact, practical and widely available. The safest choice is still
          the individual car with the best history and condition.
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
          What makes a good first car?
        </h2>
        <p className="mt-3 text-slate-700">
          A good first car should be easy to live with, affordable to maintain
          and simple enough that small issues do not become expensive surprises.
          Insurance group matters, but condition and MOT history are just as
          important.
        </p>
        <ul className="mt-3 list-disc pl-6 text-slate-700">
          <li>Simple, common models are usually easier to repair</li>
          <li>Good tyres, brakes and suspension reduce early ownership costs</li>
          <li>Clean MOT history can be more useful than low mileage alone</li>
          <li>Repeated advisories can point to poor maintenance</li>
        </ul>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">
          First-car buying mistakes to avoid
        </h2>
        <p className="text-slate-700">
          Do not buy purely on looks, colour or monthly affordability. A cheap
          first car with neglected tyres, brakes, clutch or suspension can cost
          more than a slightly more expensive car with a cleaner history.
        </p>
        <p className="text-slate-700">
          Before viewing, check whether the MOT history shows repeat warnings,
          whether previous advisories were fixed and whether the seller can
          explain recent maintenance.
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
              Compare affordable used cars on a tighter budget
            </p>
          </Link>
          <Link
            href="/mot-advisories"
            className="rounded-xl border p-4 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <h3 className="font-medium">Understand MOT advisories</h3>
            <p className="mt-1 text-sm text-slate-600">
              Learn what warning notes may mean before buying
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