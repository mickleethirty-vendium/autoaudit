import type { Metadata } from "next";
import Link from "next/link";
import HeroCtaTextPanel from "@/components/seo/HeroCtaTextPanel";
import RegLookupCta from "@/components/seo/RegLookupCta";
import { absoluteUrl } from "@/lib/seo/routes";

export const metadata: Metadata = {
  title: "Cheapest Cars to Insure UK | AutoAudit",
  description:
    "Compare the cheapest cars to insure in the UK, see likely repair costs and hidden risks, and check the exact car by registration before you buy.",
  alternates: {
    canonical: absoluteUrl("/cheapest-cars-to-insure-uk"),
  },
  openGraph: {
    title: "Cheapest Cars to Insure UK | AutoAudit",
    description:
      "Compare the cheapest cars to insure in the UK, see likely repair costs and hidden risks, and check the exact car by registration before you buy.",
    url: absoluteUrl("/cheapest-cars-to-insure-uk"),
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Cheapest cars to insure UK | AutoAudit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cheapest Cars to Insure UK | AutoAudit",
    description:
      "Compare the cheapest cars to insure in the UK, see likely repair costs and hidden risks, and check the exact car by registration before you buy.",
    images: ["/og-image.png"],
  },
};

const recommendedCars = [
  {
    name: "Ford Fiesta",
    href: "/cars/ford/fiesta/common-problems",
    summary:
      "Entry-level and inexpensive to insure; check clutch, brakes, and MOT history.",
  },
  {
    name: "Volkswagen Polo",
    href: "/cars/volkswagen/polo/common-problems",
    summary:
      "Reliable and compact, insurance-friendly; inspect brake wear and MOT advisories.",
  },
  {
    name: "Toyota Yaris",
    href: "/cars/toyota/yaris/common-problems",
    summary:
      "Low insurance and running costs; check suspension, tyres and advisories.",
  },
  {
    name: "Hyundai i10",
    href: "/cars/hyundai/i10/common-problems",
    summary:
      "Small, economical, and cheap to insure; verify MOT notes and condition.",
  },
  {
    name: "Kia Picanto",
    href: "/cars/kia/picanto/common-problems",
    summary:
      "Compact and insurance-friendly; check for repeated advisories and service history.",
  },
];

export default function CheapestCarsToInsureUkPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <HeroCtaTextPanel
        heroImageSrc="/hero-car-road.png"
        heroAlt="Cheapest cars to insure UK"
        title="Cheapest cars to insure in the UK"
        subtitle="Used car buyer guide"
        ctaComponent={
          <RegLookupCta
            title="Found a car to check?"
            subtitle="Enter the registration to see MOT history, advisories, and repair-cost risks instantly."
            variant="light"
          />
        }
        bodyContent={
          <div className="space-y-3">
            <p>
              Choosing a car with low insurance costs can save hundreds per year.
              This guide highlights some of the cheapest cars to insure for UK
              drivers, along with what to check before purchase.
            </p>
            <p>
              Always verify the exact car using its registration to uncover
              MOT history, repeated advisories, and any hidden risks.
            </p>
          </div>
        }
      />

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">Recommended low-cost insurance cars</h2>
        <p className="text-slate-700">
          These vehicles typically attract lower insurance premiums for UK drivers.
          Always confirm the condition and history of the exact car.
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
          Insurance ratings and advice are based on typical models. Each car is
          unique — check its registration to review MOT history, advisories and
          repair-cost risk.
        </p>
      </section>

      <section className="mt-10">
        <RegLookupCta
          title="Check the car’s registration now"
          subtitle="See MOT history, repeat advisories, and repair-cost risk before you buy."
        />
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">Useful next steps</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Link
            href="/best-cars-for-new-drivers-uk"
            className="rounded-xl border p-4 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <h3 className="font-medium">Best cars for new drivers</h3>
            <p className="mt-1 text-sm text-slate-600">
              Ideal options for first-time buyers
            </p>
          </Link>
          <Link
            href="/best-used-cars-under-5000"
            className="rounded-xl border p-4 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <h3 className="font-medium">Budget cars under £5k</h3>
            <p className="mt-1 text-sm text-slate-600">
              Compare cheap cars and low-running-cost options
            </p>
          </Link>
          <Link
            href="/cars"
            className="rounded-xl border p-4 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <h3 className="font-medium">Browse all car guides</h3>
            <p className="mt-1 text-sm text-slate-600">
              Explore make and model problems
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}