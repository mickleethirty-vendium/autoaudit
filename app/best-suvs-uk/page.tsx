import type { Metadata } from "next";
import Link from "next/link";
import HeroCtaTextPanel from "@/components/seo/HeroCtaTextPanel";
import RegLookupCta from "@/components/seo/RegLookupCta";
import { absoluteUrl } from "@/lib/seo/routes";

export const metadata: Metadata = {
  title: "Best SUVs UK | AutoAudit",
  description:
    "Browse the best used SUVs in the UK, compare ownership risks, and check the exact car by registration before you buy.",
  alternates: {
    canonical: absoluteUrl("/best-suvs-uk"),
  },
  openGraph: {
    title: "Best SUVs UK | AutoAudit",
    description:
      "Browse the best used SUVs in the UK, compare ownership risks, and check the exact car by registration before you buy.",
    url: absoluteUrl("/best-suvs-uk"),
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Best SUVs UK | AutoAudit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Best SUVs UK | AutoAudit",
    description:
      "Browse the best used SUVs in the UK, compare ownership risks, and check the exact car by registration before you buy.",
    images: ["/og-image.png"],
  },
};

const recommendedCars = [
  {
    name: "Nissan Qashqai",
    href: "/cars/nissan/qashqai/common-problems",
    summary:
      "One of the UK’s most popular SUVs, offering practicality and availability. Check brakes, tyres, suspension and signs of heavy use.",
  },
  {
    name: "Ford Kuga",
    href: "/cars/ford/kuga/common-problems",
    summary:
      "A practical family SUV with strong availability, but heavier weight can lead to wear on brakes, tyres and suspension components.",
  },
  {
    name: "Volkswagen Tiguan",
    href: "/cars/volkswagen/tiguan/common-problems",
    summary:
      "A popular mid-size SUV with a more premium feel, but check servicing, suspension and repeated MOT advisories.",
  },
  {
    name: "Kia Sportage",
    href: "/cars/kia/sportage/common-problems",
    summary:
      "A common SUV choice with good practicality, but condition and maintenance history matter more than reputation.",
  },
  {
    name: "Hyundai Tucson",
    href: "/cars/hyundai/tucson/common-problems",
    summary:
      "A practical SUV with wide availability, but check tyres, brakes, suspension and MOT patterns before buying.",
  },
  {
    name: "BMW X3",
    href: "/cars/bmw/x3/common-problems",
    summary:
      "A premium SUV option with strong appeal, but higher repair costs mean maintenance history is critical.",
  },
];

export default function BestSuvsUkPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <HeroCtaTextPanel
        heroImageSrc="/hero-car-road.png"
        heroAlt="Best SUVs in the UK"
        title="Best SUVs in the UK"
        subtitle="Used car buying guide"
        ctaComponent={
          <RegLookupCta
            title="Found a possible SUV?"
            subtitle="Check the exact registration for MOT history, repeated advisories and hidden repair-cost risks before you buy."
            variant="light"
          />
        }
        bodyContent={
          <div className="space-y-3">
            <p>
              SUVs are popular in the UK for their practicality, driving
              position and versatility. But when buying used, the exact car and
              its maintenance history matter more than the model name.
            </p>
            <p>
              Use this guide to shortlist sensible SUVs, then check the exact
              registration before viewing, negotiating or paying a deposit.
            </p>
          </div>
        }
      />

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">
          Good SUVs to consider in the UK
        </h2>
        <p className="text-slate-700">
          These models are common SUV choices because they offer space,
          practicality and strong availability. The safest choice is still the
          individual car with the cleanest history and condition.
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
          What to expect from a used SUV
        </h2>
        <p className="mt-3 text-slate-700">
          SUVs are heavier than smaller cars, which can mean increased wear on
          tyres, brakes and suspension. Family use, towing and mixed driving can
          also affect condition.
        </p>
        <ul className="mt-3 list-disc pl-6 text-slate-700">
          <li>Check tyres, brakes and suspension for wear</li>
          <li>Look for repeat advisories in MOT history</li>
          <li>Heavier vehicles can cost more to maintain</li>
          <li>Condition matters more than model reputation</li>
        </ul>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">
          SUV buying mistakes to avoid
        </h2>
        <p className="text-slate-700">
          Do not buy an SUV just for driving position or image. A poorly
          maintained example can become expensive quickly due to tyres, brakes
          and suspension costs.
        </p>
        <p className="text-slate-700">
          Before viewing, check whether the MOT history shows repeat warnings,
          whether issues were repaired and whether the price reflects likely
          maintenance work.
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
              Compare practical family-friendly used cars
            </p>
          </Link>
          <Link
            href="/best-cars-under-15000"
            className="rounded-xl border p-4 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <h3 className="font-medium">Cars under £15,000</h3>
            <p className="mt-1 text-sm text-slate-600">
              Compare SUV options by budget
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