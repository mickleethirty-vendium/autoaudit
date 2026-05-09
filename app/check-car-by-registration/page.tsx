import type { Metadata } from "next";
import HeroCtaTextPanel from "@/components/seo/HeroCtaTextPanel";
import RegLookupCta from "@/components/seo/RegLookupCta";
import { absoluteUrl } from "@/lib/seo/routes";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Check a Car by Registration | AutoAudit";
  const description =
    "Enter a UK registration to see MOT history, recurring advisories and hidden repair-cost risks before buying a used car.";

  return {
    title,
    description,
    alternates: {
      canonical: absoluteUrl("/check-car-by-registration"),
    },
    openGraph: {
      title,
      description,
      url: absoluteUrl("/check-car-by-registration"),
      type: "website",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: "Check car by registration | AutoAudit",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.png"],
    },
  };
}

export default function CheckCarByRegistrationPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <HeroCtaTextPanel
        heroImageSrc="/hero-car-road.png"
        heroAlt="Check a used car by registration"
        title="Check a car by registration"
        subtitle="Used car risk check"
        ctaComponent={
          <RegLookupCta
            title="Enter the registration"
            subtitle="See MOT history, recurring advisories and hidden repair-cost risks instantly."
            variant="light"
          />
        }
        bodyContent={
          <div className="space-y-3">
            <p>
              Enter a UK registration to get an instant snapshot of MOT history,
              recurring advisory patterns and likely repair-cost risks before
              buying a used car.
            </p>
            <p>
              Use the check to spot warning signs, compare the asking price with
              the car’s condition and negotiate with more confidence.
            </p>
          </div>
        }
      />

      <section className="mt-10 rounded-2xl border bg-slate-50 p-5">
        <h2 className="text-2xl font-semibold">
          Why use the registration check?
        </h2>
        <ul className="mt-4 list-disc pl-6 text-slate-700">
          <li>Check MOT history before you buy</li>
          <li>Spot repeat advisories and warning patterns</li>
          <li>Identify likely repair-cost risks</li>
          <li>Use the findings during negotiation</li>
        </ul>
      </section>

      <section className="mt-10 rounded-2xl border bg-white p-5">
        <h2 className="text-2xl font-semibold">How it works</h2>
        <p className="mt-3 text-slate-700">
          AutoAudit uses MOT history, advisory patterns, known model issues and
          repair-risk signals to help you understand whether a used car looks
          sensible before money changes hands.
        </p>
        <p className="mt-3 text-slate-700">
          A general model guide can help with research, but a registration check
          gives you a more useful view of the exact car you are considering.
        </p>
      </section>
    </div>
  );
}