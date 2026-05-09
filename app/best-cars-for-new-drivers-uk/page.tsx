import type { Metadata } from "next";
import Link from "next/link";
import HeroCtaTextPanel from "@/components/seo/HeroCtaTextPanel";
import RegLookupCta from "@/components/seo/RegLookupCta";
import { absoluteUrl } from "@/lib/seo/routes";

export const metadata: Metadata = {
  title: "Best Cars for New Drivers UK | AutoAudit",
  description:
    "Discover the best cars for new drivers in the UK, focusing on safety, reliability, low running costs, and check the exact car by registration before you buy.",
  alternates: {
    canonical: absoluteUrl("/best-cars-for-new-drivers-uk"),
  },
  openGraph: {
    title: "Best Cars for New Drivers UK | AutoAudit",
    description:
      "Discover the best cars for new drivers in the UK, focusing on safety, reliability, low running costs, and check the exact car by registration before you buy.",
    url: absoluteUrl("/best-cars-for-new-drivers-uk"),
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Best cars for new drivers UK | AutoAudit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Cars for New Drivers UK | AutoAudit",
    description:
      "Discover the best cars for new drivers in the UK, focusing on safety, reliability, low running costs, and check the exact car by registration before you buy.",
    images: ["/og-image.png"],
  },
};

const recommendedCars = [
  {
    name: "Ford Fiesta",
    href: "/cars/ford/fiesta/common-problems",
    summary:
      "A popular entry-level car with relatively low insurance and running costs; check clutch and suspension wear.",
  },
  {
    name: "Volkswagen Polo",
    href: "/cars/volkswagen/polo/common-problems",
    summary:
      "Small, safe, and reliable if well maintained; check brake wear and MOT history carefully.",
  },
  {
    name: "Toyota Yaris",
    href: "/cars/toyota/yaris/common-problems",
    summary:
      "Compact and low-maintenance option, ideal for new drivers; inspect tyres, brakes, and advisory patterns.",
  },
  {
    name: "Honda Jazz",
    href: "/cars/honda/jazz/common-problems",
    summary:
      "Good reliability and manageable running costs, but check clutch, brakes and MOT history.",
  },
  {
    name: "Hyundai i20",
    href: "/cars/hyundai/i20/common-problems",
    summary:
      "Reasonably priced, safe small car; verify MOT advisories and condition before purchase.",
  },
  {
    name: "Kia Picanto",
    href: "/cars/kia/picanto/common-problems",
    summary:
      "Compact, easy to drive, and low-cost; inspect past advisories and service history.",
  },
];

export default function BestCarsForNewDriversUkPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <HeroCtaTextPanel
        heroImageSrc="/hero-car-road.png"
        heroAlt="Best cars for new drivers UK"
        title="Best cars for new drivers in the UK"
        subtitle="Used car buyer guide"
        ctaComponent={
          <RegLookupCta
            title="Found a car you like?"
            subtitle="Check the exact registration to see MOT history, repeated advisories and hidden repair-cost risks."
            variant="light"
          />
        }
        bodyContent={
          <div className="space-y-3">
            <p>
              Choosing the right car as a new driver is about safety, reliability,
              low insurance and manageable running costs. This guide highlights
              practical options and what to check before you buy.
            </p>
            <p>
              Even recommended models need careful inspection of the exact vehicle
              using its registration.
            </p>
          </div>
        }
      />

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">Recommended cars for new drivers</h2>
        <p className="text-slate-700">
          These models are frequently chosen by first-time drivers for safety,
          reliability, and low running costs. Always check the exact car’s history
          before purchase.
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
          Even cars considered ideal for new drivers may have hidden issues.
          Checking the exact registration helps you see MOT history, repeated advisories,
          and likely repair costs.
        </p>
      </section>

      <section className="mt-10">
        <RegLookupCta
          title="Check the registration for peace of mind"
          subtitle="Enter the car’s registration to uncover advisories, MOT history, and repair-cost risk."
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