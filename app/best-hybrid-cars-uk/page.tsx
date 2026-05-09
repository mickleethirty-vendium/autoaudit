import type { Metadata } from "next";
import Link from "next/link";
import HeroCtaTextPanel from "@/components/seo/HeroCtaTextPanel";
import RegLookupCta from "@/components/seo/RegLookupCta";
import { absoluteUrl } from "@/lib/seo/routes";

export const metadata: Metadata = {
  title: "Best Hybrid Cars UK | AutoAudit",
  description:
    "Browse the best used hybrid cars in the UK, compare ownership risks, and check the exact car by registration before you buy.",
  alternates: {
    canonical: absoluteUrl("/best-hybrid-cars-uk"),
  },
  openGraph: {
    title: "Best Hybrid Cars UK | AutoAudit",
    description:
      "Browse the best used hybrid cars in the UK, compare ownership risks, and check the exact car by registration before you buy.",
    url: absoluteUrl("/best-hybrid-cars-uk"),
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Best hybrid cars UK | AutoAudit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Hybrid Cars UK | AutoAudit",
    description:
      "Browse the best used hybrid cars in the UK, compare ownership risks, and check the exact car by registration before you buy.",
    images: ["/og-image.png"],
  },
};

const recommendedCars = [
  {
    name: "Toyota Yaris Hybrid",
    href: "/cars/toyota/yaris/common-problems",
    summary:
      "A strong small hybrid option with sensible running costs, but still check servicing, MOT history, tyres, brakes and age-related advisories.",
  },
  {
    name: "Toyota Corolla Hybrid",
    href: "/cars/toyota/corolla/common-problems",
    summary:
      "A practical hybrid family car with strong buyer appeal. Check servicing, brake wear, tyres and MOT advisory patterns before buying.",
  },
  {
    name: "Toyota Prius",
    href: "/cars/toyota/prius/common-problems",
    summary:
      "One of the best-known hybrid choices, but older examples need careful checks for mileage, servicing, brakes and MOT history.",
  },
  {
    name: "Honda Jazz Hybrid",
    href: "/cars/honda/jazz/common-problems",
    summary:
      "A practical compact hybrid option, often appealing to cautious buyers. Check age-related advisories, brakes and service evidence.",
  },
  {
    name: "Hyundai Tucson Hybrid",
    href: "/cars/hyundai/tucson/common-problems",
    summary:
      "A practical hybrid SUV option, but heavier use can mean tyres, brakes and suspension wear. Check MOT history carefully.",
  },
  {
    name: "Kia Sportage Hybrid",
    href: "/cars/kia/sportage/common-problems",
    summary:
      "A popular hybrid SUV choice with strong practicality, but check servicing, tyres, brakes, suspension and repeated advisories.",
  },
];

export default function BestHybridCarsUkPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <HeroCtaTextPanel
        heroImageSrc="/hero-car-road.png"
        heroAlt="Best hybrid cars in the UK"
        title="Best hybrid cars in the UK"
        subtitle="Used car buying guide"
        ctaComponent={
          <RegLookupCta
            title="Found a possible hybrid car?"
            subtitle="Check the exact registration for MOT history, repeated advisories and hidden repair-cost risks before you buy."
            variant="light"
          />
        }
        bodyContent={
          <div className="space-y-3">
            <p>
              Hybrid cars are popular with UK buyers who want lower fuel use,
              smoother driving and reduced running costs. But when buying used,
              the exact car, its service history and its MOT pattern still
              matter.
            </p>
            <p>
              Use this guide to shortlist sensible hybrid cars, then check the
              exact registration before viewing, negotiating or paying a deposit.
            </p>
          </div>
        }
      />

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">
          Good hybrid cars to consider in the UK
        </h2>
        <p className="text-slate-700">
          These models are common hybrid choices because they offer a useful mix
          of economy, practicality and buyer confidence. The safest choice is
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
          What to check on a used hybrid car
        </h2>
        <p className="mt-3 text-slate-700">
          A used hybrid can make a lot of sense, but it should still be judged
          like any other used car. MOT history, servicing, brakes, tyres and
          suspension condition all matter before you buy.
        </p>
        <ul className="mt-3 list-disc pl-6 text-slate-700">
          <li>Check service history and evidence of regular maintenance</li>
          <li>Look for repeat MOT advisories around brakes, tyres and suspension</li>
          <li>Be cautious with high-mileage cars with patchy history</li>
          <li>Judge the exact vehicle, not just the hybrid badge</li>
        </ul>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">
          Hybrid car buying mistakes to avoid
        </h2>
        <p className="text-slate-700">
          Do not assume a hybrid is automatically a low-risk buy. A poorly
          maintained car can still need tyres, brakes, suspension work or other
          repairs, even if fuel costs are lower.
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
            href="/best-cheap-to-run-cars-uk"
            className="rounded-xl border p-4 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <h3 className="font-medium">Cheap to run cars</h3>
            <p className="mt-1 text-sm text-slate-600">
              Compare low-cost used cars
            </p>
          </Link>
          <Link
            href="/best-family-cars-uk"
            className="rounded-xl border p-4 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <h3 className="font-medium">Best family cars</h3>
            <p className="mt-1 text-sm text-slate-600">
              Compare practical family-friendly options
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