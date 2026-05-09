import type { Metadata } from "next";
import Link from "next/link";
import HeroCtaTextPanel from "@/components/seo/HeroCtaTextPanel";
import RegLookupCta from "@/components/seo/RegLookupCta";
import { absoluteUrl } from "@/lib/seo/routes";

export const metadata: Metadata = {
  title: "Best Used Cars Under £3,000 UK | AutoAudit",
  description:
    "Browse sensible used cars under £3,000 in the UK, understand common risks, and check the exact car by registration before you buy.",
  alternates: {
    canonical: absoluteUrl("/best-cars-under-3000"),
  },
  openGraph: {
    title: "Best Used Cars Under £3,000 UK | AutoAudit",
    description:
      "Browse sensible used cars under £3,000 in the UK, understand common risks, and check the exact car by registration before you buy.",
    url: absoluteUrl("/best-cars-under-3000"),
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Best used cars under £3,000 UK | AutoAudit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Used Cars Under £3,000 UK | AutoAudit",
    description:
      "Browse sensible used cars under £3,000 in the UK, understand common risks, and check the exact car by registration before you buy.",
    images: ["/og-image.png"],
  },
};

const recommendedCars = [
  {
    name: "Ford Fiesta",
    href: "/cars/ford/fiesta/common-problems",
    summary:
      "A very common choice at this budget with strong parts availability, but most examples will be high mileage. Check clutch, suspension and MOT history carefully.",
  },
  {
    name: "Vauxhall Corsa",
    href: "/cars/vauxhall/corsa/common-problems",
    summary:
      "Easy to find and usually cheap to run, but many have had heavy use. Pay close attention to tyres, brakes, suspension and repeat advisories.",
  },
  {
    name: "Toyota Yaris",
    href: "/cars/toyota/yaris/common-problems",
    summary:
      "Often chosen for reliability, but at this price most cars are older. Check for corrosion, maintenance history and age-related issues.",
  },
  {
    name: "Nissan Micra",
    href: "/cars/nissan/micra/common-problems",
    summary:
      "Simple and practical, often with lower running costs, but condition varies widely. Look for MOT patterns and signs of neglect.",
  },
  {
    name: "Volkswagen Polo",
    href: "/cars/volkswagen/polo/common-problems",
    summary:
      "A popular small car with a more premium feel, but older examples may have higher maintenance needs. Condition matters more than badge.",
  },
  {
    name: "Peugeot 207",
    href: "/cars/peugeot/207/common-problems",
    summary:
      "Affordable and widely available, but check electrical issues, service history and MOT advisories before committing.",
  },
];

export default function BestCarsUnder3000Page() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <HeroCtaTextPanel
        heroImageSrc="/hero-car-road.png"
        heroAlt="Used cars under £3,000 in the UK"
        title="Best used cars under £3,000 in the UK"
        subtitle="Used car buying guide"
        ctaComponent={
          <RegLookupCta
            title="Found a car under £3,000?"
            subtitle="Check the exact registration for MOT history, repeated advisories and hidden repair-cost risks before you buy."
            variant="light"
          />
        }
        bodyContent={
          <div className="space-y-3">
            <p>
              A £3,000 budget sits at the lower end of the used car market, where
              condition matters far more than the model name. At this price, many
              cars will be older or higher mileage.
            </p>
            <p>
              That doesn’t mean you can’t find a good car — but it does mean you
              need to check carefully. Use this guide to shortlist options, then
              check the exact car by registration before buying.
            </p>
          </div>
        }
      />

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">
          Good used cars to consider under £3,000
        </h2>
        <p className="text-slate-700">
          These cars are common at this budget and can still be sensible choices
          if you find a well-maintained example with a clean MOT history.
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
          Cars under £3,000 often come with higher mileage, more wear and a
          greater chance of needing repairs. The key is finding one that has been
          maintained properly.
        </p>
        <ul className="mt-3 list-disc pl-6 text-slate-700">
          <li>Higher mileage is normal at this price</li>
          <li>Maintenance history is critical</li>
          <li>Tyres, brakes and suspension can add immediate cost</li>
          <li>Repeated advisories may signal ongoing issues</li>
        </ul>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">
          How to avoid a bad £3,000 car
        </h2>
        <p className="text-slate-700">
          At this level, the biggest risk is buying a car that looks cheap but
          needs immediate repairs. Always check MOT history before viewing and
          look for patterns of repeated advisories.
        </p>
        <p className="text-slate-700">
          A slightly more expensive car with better history can often be cheaper
          overall than a bargain that needs tyres, brakes and suspension work
          straight away.
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
              Compare slightly newer or lower mileage options
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