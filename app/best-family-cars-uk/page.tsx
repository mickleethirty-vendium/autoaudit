import type { Metadata } from "next";
import Link from "next/link";
import HeroCtaTextPanel from "@/components/seo/HeroCtaTextPanel";
import RegLookupCta from "@/components/seo/RegLookupCta";
import { absoluteUrl } from "@/lib/seo/routes";

export const metadata: Metadata = {
  title: "Best Family Cars UK | AutoAudit",
  description:
    "Browse sensible family cars in the UK, compare common ownership risks, and check the exact car by registration before you buy.",
  alternates: {
    canonical: absoluteUrl("/best-family-cars-uk"),
  },
  openGraph: {
    title: "Best Family Cars UK | AutoAudit",
    description:
      "Browse sensible family cars in the UK, compare common ownership risks, and check the exact car by registration before you buy.",
    url: absoluteUrl("/best-family-cars-uk"),
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Best family cars UK | AutoAudit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Family Cars UK | AutoAudit",
    description:
      "Browse sensible family cars in the UK, compare common ownership risks, and check the exact car by registration before you buy.",
    images: ["/og-image.png"],
  },
};

const recommendedCars = [
  {
    name: "Ford Focus",
    href: "/cars/ford/focus/common-problems",
    summary:
      "A practical family hatchback with lots of choice in the UK used market. Check clutch condition, suspension wear, tyres and repeated MOT advisories.",
  },
  {
    name: "Volkswagen Golf",
    href: "/cars/volkswagen/golf/common-problems",
    summary:
      "A strong all-round family car with good comfort and practicality, but higher-mileage examples need careful MOT and service history checks.",
  },
  {
    name: "Nissan Qashqai",
    href: "/cars/nissan/qashqai/common-problems",
    summary:
      "A popular family SUV with useful space and high availability. Check brakes, tyres, suspension and signs of heavy family use.",
  },
  {
    name: "Ford Kuga",
    href: "/cars/ford/kuga/common-problems",
    summary:
      "A practical SUV option for families, but heavier use can mean wear on tyres, brakes and suspension components.",
  },
  {
    name: "Toyota Corolla",
    href: "/cars/toyota/corolla/common-problems",
    summary:
      "A sensible reliability-focused family option, especially if you want lower ownership stress. Check servicing and MOT history carefully.",
  },
  {
    name: "Volkswagen Tiguan",
    href: "/cars/volkswagen/tiguan/common-problems",
    summary:
      "A larger SUV choice with strong family appeal, but check suspension, brakes, tyres and repeated advisory patterns before buying.",
  },
];

export default function BestFamilyCarsUkPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <HeroCtaTextPanel
        heroImageSrc="/hero-car-road.png"
        heroAlt="Best family cars in the UK"
        title="Best family cars in the UK"
        subtitle="Used car buying guide"
        ctaComponent={
          <RegLookupCta
            title="Found a possible family car?"
            subtitle="Check the exact registration for MOT history, repeated advisories and hidden repair-cost risks before you buy."
            variant="light"
          />
        }
        bodyContent={
          <div className="space-y-3">
            <p>
              A good family car needs to be practical, safe, affordable to run
              and dependable enough for daily use. But when buying used, the
              exact car matters more than the model name.
            </p>
            <p>
              Use this guide to shortlist sensible family cars, then check the
              exact registration before viewing, negotiating or paying a
              deposit.
            </p>
          </div>
        }
      />

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">
          Good family cars to consider in the UK
        </h2>
        <p className="text-slate-700">
          These models are common family-car choices because they offer useful
          space, strong availability and practical ownership. The safest choice
          is still the individual car with the cleanest history and condition.
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
          What makes a good used family car?
        </h2>
        <p className="mt-3 text-slate-700">
          The best used family cars usually balance space, comfort, running
          costs and reliability. But family use can be hard on a car, so MOT
          history and maintenance evidence are especially important.
        </p>
        <ul className="mt-3 list-disc pl-6 text-slate-700">
          <li>Look for clean MOT history and evidence of regular servicing</li>
          <li>Check tyres, brakes and suspension for family-use wear</li>
          <li>Repeated advisories may suggest delayed maintenance</li>
          <li>Practicality matters, but condition matters more</li>
        </ul>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">
          Family-car buying mistakes to avoid
        </h2>
        <p className="text-slate-700">
          Do not buy only on boot size, seating position or monthly cost. A
          family car with neglected tyres, brakes or suspension can become
          expensive quickly.
        </p>
        <p className="text-slate-700">
          Before viewing, check whether the MOT history shows repeat warnings,
          whether previous issues were fixed and whether the asking price still
          makes sense after likely repair costs.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">Useful next steps</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Link
            href="/best-cars-under-10000"
            className="rounded-xl border p-4 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <h3 className="font-medium">Cars under £10,000</h3>
            <p className="mt-1 text-sm text-slate-600">
              Compare sensible family options by budget
            </p>
          </Link>
          <Link
            href="/cars"
            className="rounded-xl border p-4 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <h3 className="font-medium">Browse car problem guides</h3>
            <p className="mt-1 text-sm text-slate-600">
              Compare common issues by make and model
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