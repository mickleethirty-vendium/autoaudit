import type { Metadata } from "next";
import Link from "next/link";
import HeroCtaTextPanel from "@/components/seo/HeroCtaTextPanel";
import RegLookupCta from "@/components/seo/RegLookupCta";
import { absoluteUrl } from "@/lib/seo/routes";

export const metadata: Metadata = {
  title: "Best Used Cars Under £20,000 UK | AutoAudit",
  description:
    "Browse the best used cars under £20,000 in the UK, compare ownership risks, and check the exact car by registration before you buy.",
  alternates: {
    canonical: absoluteUrl("/best-cars-under-20000"),
  },
  openGraph: {
    title: "Best Used Cars Under £20,000 UK | AutoAudit",
    description:
      "Browse the best used cars under £20,000 in the UK, compare ownership risks, and check the exact car by registration before you buy.",
    url: absoluteUrl("/best-cars-under-20000"),
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Best used cars under £20,000 UK | AutoAudit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Used Cars Under £20,000 UK | AutoAudit",
    description:
      "Browse the best used cars under £20,000 in the UK, compare ownership risks, and check the exact car by registration before you buy.",
    images: ["/og-image.png"],
  },
};

const recommendedCars = [
  {
    name: "BMW 3 Series",
    href: "/cars/bmw/3-series/common-problems",
    summary:
      "A strong premium option with newer examples available at this budget, but maintenance history and running costs remain important.",
  },
  {
    name: "Audi A4",
    href: "/cars/audi/a4/common-problems",
    summary:
      "Comfortable and refined, especially for motorway use, but check for suspension wear, oil leaks and unresolved advisories.",
  },
  {
    name: "Volkswagen Tiguan",
    href: "/cars/volkswagen/tiguan/common-problems",
    summary:
      "A popular family SUV with strong practicality, but weight and use can lead to brake, tyre and suspension wear.",
  },
  {
    name: "Mercedes-Benz C-Class",
    href: "/cars/mercedes-benz/c-class/common-problems",
    summary:
      "A premium saloon with strong appeal at this price, but always check maintenance evidence and repeated MOT advisories.",
  },
  {
    name: "Toyota Corolla",
    href: "/cars/toyota/corolla/common-problems",
    summary:
      "A reliability-focused choice, often with hybrid options available. Still check servicing, usage patterns and MOT history.",
  },
  {
    name: "Ford Kuga",
    href: "/cars/ford/kuga/common-problems",
    summary:
      "A practical SUV with broad availability, but family use can lead to wear on tyres, brakes and suspension components.",
  },
];

export default function BestCarsUnder20000Page() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <HeroCtaTextPanel
        heroImageSrc="/hero-car-road.png"
        heroAlt="Used cars under £20,000 in the UK"
        title="Best used cars under £20,000 in the UK"
        subtitle="Used car buying guide"
        ctaComponent={
          <RegLookupCta
            title="Found a car under £20,000?"
            subtitle="Check the exact registration for MOT history, repeated advisories and hidden repair-cost risks before you buy."
            variant="light"
          />
        }
        bodyContent={
          <div className="space-y-3">
            <p>
              A £20,000 budget gives access to newer used cars, better
              specifications and a wider mix of premium and family-focused
              vehicles.
            </p>
            <p>
              But even at this level, the biggest risk is still the individual
              car. Use this guide to compare options, then check the exact
              registration before viewing or buying.
            </p>
          </div>
        }
      />

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">
          Good used cars to consider under £20,000
        </h2>
        <p className="text-slate-700">
          These cars are popular at this budget because they offer a strong mix
          of comfort, performance and practicality. The best choice is still the
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
          What to expect at this budget
        </h2>
        <p className="mt-3 text-slate-700">
          At £20,000, buyers can often choose between nearly-new mainstream cars
          and slightly older premium models. Both can make sense, but condition,
          servicing and MOT history still matter.
        </p>
        <ul className="mt-3 list-disc pl-6 text-slate-700">
          <li>Newer cars and lower mileage are more common</li>
          <li>Premium cars may still carry higher repair costs</li>
          <li>Service history should be clear and complete</li>
          <li>Repeated advisories still indicate future expense</li>
        </ul>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">
          How to choose the right car under £20,000
        </h2>
        <p className="text-slate-700">
          At this level, it is easy to focus on specification, styling or brand.
          But the safest purchase is still the car with strong maintenance
          history and no concerning MOT patterns.
        </p>
        <p className="text-slate-700">
          Before committing, check whether the vehicle has repeat advisories,
          whether past issues were resolved and whether the price reflects any
          potential repair work.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">Useful next steps</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Link
            href="/best-cars-under-15000"
            className="rounded-xl border p-4 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <h3 className="font-medium">Cars under £15,000</h3>
            <p className="mt-1 text-sm text-slate-600">
              Compare slightly cheaper options
            </p>
          </Link>
          <Link
            href="/cars"
            className="rounded-xl border p-4 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <h3 className="font-medium">Browse all car guides</h3>
            <p className="mt-1 text-sm text-slate-600">
              Compare common problems by make and model
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