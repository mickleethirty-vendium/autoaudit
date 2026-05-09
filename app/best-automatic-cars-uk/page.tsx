import type { Metadata } from "next";
import Link from "next/link";
import HeroCtaTextPanel from "@/components/seo/HeroCtaTextPanel";
import RegLookupCta from "@/components/seo/RegLookupCta";
import { absoluteUrl } from "@/lib/seo/routes";

export const metadata: Metadata = {
  title: "Best Automatic Cars UK | AutoAudit",
  description:
    "Browse sensible automatic used cars in the UK, compare ownership risks, and check the exact car by registration before you buy.",
  alternates: {
    canonical: absoluteUrl("/best-automatic-cars-uk"),
  },
  openGraph: {
    title: "Best Automatic Cars UK | AutoAudit",
    description:
      "Browse sensible automatic used cars in the UK, compare ownership risks, and check the exact car by registration before you buy.",
    url: absoluteUrl("/best-automatic-cars-uk"),
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Best automatic cars UK | AutoAudit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Automatic Cars UK | AutoAudit",
    description:
      "Browse sensible automatic used cars in the UK, compare ownership risks, and check the exact car by registration before you buy.",
    images: ["/og-image.png"],
  },
};

const recommendedCars = [
  {
    name: "Toyota Yaris",
    href: "/cars/toyota/yaris/common-problems",
    summary:
      "A sensible small automatic option, especially for town use. Check MOT history, servicing and whether age-related advisories have been resolved.",
  },
  {
    name: "Toyota Corolla",
    href: "/cars/toyota/corolla/common-problems",
    summary:
      "A strong automatic family-car choice, often with hybrid options. Check servicing, brakes, tyres and MOT patterns before buying.",
  },
  {
    name: "Volkswagen Golf",
    href: "/cars/volkswagen/golf/common-problems",
    summary:
      "A popular automatic hatchback with wide availability, but gearbox history, servicing and repeat advisories need careful checking.",
  },
  {
    name: "BMW 3 Series",
    href: "/cars/bmw/3-series/common-problems",
    summary:
      "A premium automatic option with strong appeal, but maintenance history and repair-cost exposure matter more than badge value.",
  },
  {
    name: "Audi A3",
    href: "/cars/audi/a3/common-problems",
    summary:
      "A refined automatic hatchback, but check servicing, oil leaks, suspension wear and unresolved MOT advisories before committing.",
  },
  {
    name: "Nissan Qashqai",
    href: "/cars/nissan/qashqai/common-problems",
    summary:
      "A practical automatic SUV option, but family use can mean brake, tyre and suspension wear. MOT history matters.",
  },
];

export default function BestAutomaticCarsUkPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <HeroCtaTextPanel
        heroImageSrc="/hero-car-road.png"
        heroAlt="Best automatic cars in the UK"
        title="Best automatic cars in the UK"
        subtitle="Used car buying guide"
        ctaComponent={
          <RegLookupCta
            title="Found a possible automatic car?"
            subtitle="Check the exact registration for MOT history, repeated advisories and hidden repair-cost risks before you buy."
            variant="light"
          />
        }
        bodyContent={
          <div className="space-y-3">
            <p>
              Automatic cars are popular with UK buyers who want easier driving,
              especially in traffic or around town. But when buying used, the
              exact car and its maintenance history matter more than the gearbox
              type alone.
            </p>
            <p>
              Use this guide to shortlist sensible automatic cars, then check
              the exact registration before viewing, negotiating or paying a
              deposit.
            </p>
          </div>
        }
      />

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">
          Good automatic cars to consider in the UK
        </h2>
        <p className="text-slate-700">
          These models are common automatic choices because they offer a useful
          mix of availability, practicality and buyer appeal. The safest choice
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
          What makes a good used automatic car?
        </h2>
        <p className="mt-3 text-slate-700">
          A good used automatic should feel smooth, have clear maintenance
          history and show no worrying MOT patterns. Gearbox repairs can be
          expensive, so history and condition matter.
        </p>
        <ul className="mt-3 list-disc pl-6 text-slate-700">
          <li>Check for smooth gear changes during a test drive</li>
          <li>Look for service history and evidence of maintenance</li>
          <li>Repeated advisories may point to wider neglect</li>
          <li>Premium automatics can carry higher repair costs</li>
        </ul>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">
          Automatic car buying mistakes to avoid
        </h2>
        <p className="text-slate-700">
          Do not assume an automatic is safer just because it feels easy to
          drive. Gearbox issues, delayed servicing and neglected wear items can
          quickly turn a good-looking car into an expensive mistake.
        </p>
        <p className="text-slate-700">
          Before viewing, check whether the MOT history shows repeat warnings,
          whether past advisories were fixed and whether the seller can explain
          the car’s maintenance history.
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
              Compare practical used family cars
            </p>
          </Link>
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