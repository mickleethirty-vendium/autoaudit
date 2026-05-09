import type { Metadata } from "next";
import Link from "next/link";
import HeroCtaTextPanel from "@/components/seo/HeroCtaTextPanel";
import RegLookupCta from "@/components/seo/RegLookupCta";
import { absoluteUrl } from "@/lib/seo/routes";

export const metadata: Metadata = {
  title: "Best Used Cars for Families UK | AutoAudit",
  description:
    "Explore the best used cars for families in the UK, focusing on safety, space, reliability, and running costs. Check the exact car by registration before you buy.",
  alternates: {
    canonical: absoluteUrl("/best-used-cars-for-families-uk"),
  },
  openGraph: {
    title: "Best Used Cars for Families UK | AutoAudit",
    description:
      "Explore the best used cars for families in the UK, focusing on safety, space, reliability, and running costs. Check the exact car by registration before you buy.",
    url: absoluteUrl("/best-used-cars-for-families-uk"),
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Best used cars for families UK | AutoAudit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Used Cars for Families UK | AutoAudit",
    description:
      "Explore the best used cars for families in the UK, focusing on safety, space, reliability, and running costs. Check the exact car by registration before you buy.",
    images: ["/og-image.png"],
  },
};

const recommendedCars = [
  {
    name: "Volkswagen Touran",
    href: "/cars/volkswagen/touran/common-problems",
    summary:
      "Spacious and safe, ideal for larger families. Check brakes, suspension, and MOT history.",
  },
  {
    name: "Ford S-Max",
    href: "/cars/ford/s-max/common-problems",
    summary:
      "Flexible seating and reasonable running costs; inspect suspension and advisories.",
  },
  {
    name: "Toyota Avensis",
    href: "/cars/toyota/avensis/common-problems",
    summary:
      "Reliable family saloon, good safety record; review MOT advisories carefully.",
  },
  {
    name: "Skoda Octavia Estate",
    href: "/cars/skoda/octavia/common-problems",
    summary:
      "Large boot and solid reliability; check brakes, tyres and service history.",
  },
  {
    name: "Vauxhall Zafira",
    href: "/cars/vauxhall/zafira/common-problems",
    summary:
      "Compact MPV with flexible seating, ideal for mid-sized families; inspect MOT warnings.",
  },
];

export default function BestUsedCarsForFamiliesUkPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <HeroCtaTextPanel
        heroImageSrc="/hero-car-road.png"
        heroAlt="Best used cars for families UK"
        title="Best used cars for families in the UK"
        subtitle="Used car buyer guide"
        ctaComponent={
          <RegLookupCta
            title="Found a family car you like?"
            subtitle="Check the exact registration to see MOT history, repeated advisories, and repair-cost risks."
            variant="light"
          />
        }
        bodyContent={
          <div className="space-y-3">
            <p>
              Choosing the right car for a family involves safety, space, reliability,
              and running costs. This guide highlights practical options for UK buyers.
            </p>
            <p>
              Even recommended models should be checked individually using the registration
              to verify MOT history and past issues.
            </p>
          </div>
        }
      />

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">Recommended family cars</h2>
        <p className="text-slate-700">
          These used cars are popular among families for safety, space, and value.
          Always confirm the exact vehicle’s history before buying.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recommendedCars.map((car) => (
            <Link
              key={car.href}
              href={car.href}
              className="rounded-xl border bg-white p-4 transition hover:border-slate-400 hover:bg-slate-50"
            >
              <h3 className="font-medium">{car.name}</h3>
              <p className="mt-2 text-sm text-slate-600">{car.summary}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-2xl border bg-slate-50 p-5">
        <h2 className="text-2xl font-semibold">Check the exact car</h2>
        <p className="mt-3 text-slate-700">
          Insurance ratings and safety records vary by individual car. Enter the
          registration to review MOT history, repeated advisories, and repair-cost risk.
        </p>
      </section>

      <section className="mt-10">
        <RegLookupCta
          title="Check the registration for peace of mind"
          subtitle="See MOT history, repeated advisories, and likely repair-cost risks."
        />
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">Useful next steps</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Link
            href="/best-cars-under-5000"
            className="rounded-xl border p-4 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <h3 className="font-medium">Budget cars under £5k</h3>
            <p className="mt-1 text-sm text-slate-600">Compare cheap options</p>
          </Link>
          <Link
            href="/cheap-cars-with-low-maintenance-costs-uk"
            className="rounded-xl border p-4 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <h3 className="font-medium">Low maintenance cars</h3>
            <p className="mt-1 text-sm text-slate-600">Compare cars that cost less to run</p>
          </Link>
          <Link
            href="/cars"
            className="rounded-xl border p-4 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <h3 className="font-medium">Browse all car guides</h3>
            <p className="mt-1 text-sm text-slate-600">Explore make and model problems</p>
          </Link>
        </div>
      </section>
    </div>
  );
}