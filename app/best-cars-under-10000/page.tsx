import type { Metadata } from "next";
import Link from "next/link";
import HeroCtaTextPanel from "@/components/seo/HeroCtaTextPanel";
import RegLookupCta from "@/components/seo/RegLookupCta";
import { absoluteUrl } from "@/lib/seo/routes";

export const metadata: Metadata = {
  title: "Best Used Cars Under £10,000 UK | AutoAudit",
  description:
    "Browse the best used cars under £10,000 in the UK, compare reliability and ownership risks, and check the exact car by registration before you buy.",
  alternates: {
    canonical: absoluteUrl("/best-cars-under-10000"),
  },
  openGraph: {
    title: "Best Used Cars Under £10,000 UK | AutoAudit",
    description:
      "Browse the best used cars under £10,000 in the UK, compare reliability and ownership risks, and check the exact car by registration before you buy.",
    url: absoluteUrl("/best-cars-under-10000"),
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Best used cars under £10,000 UK | AutoAudit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Used Cars Under £10,000 UK | AutoAudit",
    description:
      "Browse the best used cars under £10,000 in the UK, compare reliability and ownership risks, and check the exact car by registration before you buy.",
    images: ["/og-image.png"],
  },
};

const recommendedCars = [
  {
    name: "Ford Focus",
    href: "/cars/ford/focus/common-problems",
    summary:
      "A strong all-round family hatchback with good availability, but check suspension wear, clutch condition and MOT advisory patterns.",
  },
  {
    name: "Volkswagen Golf",
    href: "/cars/volkswagen/golf/common-problems",
    summary:
      "Still a popular choice at this budget with newer examples available, but condition, mileage and maintenance history are key.",
  },
  {
    name: "BMW 3 Series",
    href: "/cars/bmw/3-series/common-problems",
    summary:
      "Offers more premium feel and driving experience, but higher running costs and maintenance history matter more at this price.",
  },
  {
    name: "Audi A3",
    href: "/cars/audi/a3/common-problems",
    summary:
      "A refined hatchback with strong appeal, but watch for suspension wear, oil leaks and repeated advisories on higher-mileage cars.",
  },
  {
    name: "Toyota Corolla",
    href: "/cars/toyota/corolla/common-problems",
    summary:
      "A sensible reliability-focused option with newer examples appearing under £10k, but still check MOT history and servicing.",
  },
  {
    name: "Nissan Qashqai",
    href: "/cars/nissan/qashqai/common-problems",
    summary:
      "A practical SUV choice at this price, but heavier use means suspension, brakes and tyre wear deserve close attention.",
  },
];

export default function BestCarsUnder10000Page() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <HeroCtaTextPanel
        heroImageSrc="/hero-car-road.png"
        heroAlt="Used cars under £10,000 in the UK"
        title="Best used cars under £10,000 in the UK"
        subtitle="Used car buying guide"
        ctaComponent={
          <RegLookupCta
            title="Found a car under £10,000?"
            subtitle="Check the exact registration for MOT history, repeated advisories and hidden repair-cost risks before you buy."
            variant="light"
          />
        }
        bodyContent={
          <div className="space-y-3">
            <p>
              A £10,000 budget opens up a much wider range of used cars,
              including newer models, lower mileage examples and better-equipped
              vehicles.
            </p>
            <p>
              But even at this price, the wrong car can still lead to expensive
              repairs. Always compare options carefully and check the exact
              vehicle by registration before committing.
            </p>
          </div>
        }
      />

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">
          Good used cars to consider under £10,000
        </h2>
        <p className="text-slate-700">
          These cars are popular with UK buyers because they offer a balance of
          practicality, availability and ownership costs. The best choice still
          depends on condition, history and how the car has been used.
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
          What changes at the £10,000 level?
        </h2>
        <p className="mt-3 text-slate-700">
          At this budget, you can often find newer cars, better specifications
          and lower mileage, but that does not remove risk. Maintenance history
          and MOT patterns still matter.
        </p>
        <ul className="mt-3 list-disc pl-6 text-slate-700">
          <li>Lower mileage does not always mean lower risk</li>
          <li>Premium cars can have higher running costs</li>
          <li>Service history becomes more important as cars age</li>
          <li>Advisories still indicate future repair costs</li>
        </ul>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">
          How to choose the right car under £10,000
        </h2>
        <p className="text-slate-700">
          At this level, buyers often compare multiple models before deciding.
          Use model guides to narrow your shortlist, then check the exact car’s
          MOT history and condition before viewing.
        </p>
        <p className="text-slate-700">
          A well-maintained car with clear history is usually a better choice
          than a newer-looking car with gaps, repeated advisories or unclear
          maintenance.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">Useful next steps</h2>
        <div className="grid gap-4 sm:grid-cols-3">
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