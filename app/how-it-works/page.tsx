import type { Metadata } from "next";
import Link from "next/link";
import RegLookupCta from "@/components/seo/RegLookupCta";
import ShieldIcon from "@/app/components/ShieldIcon";
import { absoluteUrl } from "@/lib/seo/routes";
import { faqSchema } from "@/lib/seo/schema";

export const metadata: Metadata = {
  title: "How AutoAudit Works | Used Car Risk Checks",
  description:
    "See how AutoAudit checks MOT history, advisories and repair-risk signals before you buy a used car.",
  alternates: {
    canonical: absoluteUrl("/how-it-works"),
  },
  openGraph: {
    title: "How AutoAudit Works | Used Car Risk Checks",
    description:
      "See how AutoAudit checks MOT history, advisories and repair-risk signals before you buy a used car.",
    url: absoluteUrl("/how-it-works"),
    type: "website",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "How AutoAudit Works | Used Car Risk Checks",
    description:
      "See how AutoAudit checks MOT history, advisories and repair-risk signals before you buy a used car.",
    images: ["/og-image.png"],
  },
};

export default function HowItWorks() {
  const faqs = [
    {
      question: "How does AutoAudit work?",
      answer:
        "AutoAudit checks the vehicle registration, reviews MOT history and advisory patterns, then presents buyer-focused risk signals before you buy.",
    },
    {
      question: "Do I need the registration number?",
      answer:
        "Yes. The registration number allows AutoAudit to check the specific vehicle rather than only giving generic model advice.",
    },
    {
      question: "Does AutoAudit replace a mechanical inspection?",
      answer:
        "No. AutoAudit is buyer guidance based on available vehicle data and MOT signals. It does not replace a physical inspection.",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }}
      />

      <div className="overflow-hidden rounded-3xl border border-[var(--aa-silver)] bg-white shadow-sm">
        <div className="border-b border-[var(--aa-silver)] bg-[var(--aa-black)] px-6 py-10 text-white sm:px-8 sm:py-12">
          <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/90">
            How it works
          </div>

          <h1 className="mt-4 max-w-4xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Check the risk before you commit to a used car
          </h1>

          <p className="mt-4 max-w-3xl text-base leading-7 text-white/85 sm:text-lg">
            AutoAudit helps you spot likely repair exposure, warning signs in
            the MOT history and hidden ownership risks before you buy. Start
            with a free snapshot, then unlock more detail only if you need it.
          </p>

          <div className="mt-7 max-w-2xl">
            <RegLookupCta intent="general" position="early"
              title="Start with a registration check"
              subtitle="Enter the reg to see vehicle-specific MOT history, advisories and buyer-risk signals."
              variant="dark"
            />
          </div>
        </div>

        <div className="px-6 py-8 sm:px-8 sm:py-10">
          <div className="grid gap-4 lg:grid-cols-3">
            {[
              {
                title: "1. Enter the registration",
                text: "Start with the car you are actually considering, not just generic model advice.",
              },
              {
                title: "2. Review the free snapshot",
                text: "See initial MOT-backed warning signs, risk indicators and buyer confidence signals.",
              },
              {
                title: "3. Unlock more detail if needed",
                text: "Use the full report to understand advisory patterns, likely repair exposure and questions to ask the seller.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-[var(--aa-silver)] bg-slate-50/70 p-5"
              >
                <div className="text-sm font-semibold uppercase tracking-wide text-black">
                  {item.title}
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {item.text}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Free Snapshot",
                text: "Initial buyer-risk indicators before paying.",
              },
              {
                title: "MOT Insights",
                text: "MOT history helps surface failures, advisories and repeated warning patterns.",
              },
              {
                title: "History Checks",
                text: "The Full Bundle can add HPI-style checks for finance, write-off, theft, mileage and keeper history.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-4 rounded-2xl border border-[var(--aa-silver)] bg-white p-5"
              >
                <ShieldIcon className="mt-0.5 h-10 w-10 shrink-0" />
                <div>
                  <div className="text-lg font-bold text-black">
                    {item.title}
                  </div>
                  <p className="mt-1 text-sm leading-6 text-slate-700">
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-black bg-white p-6">
              <div className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Core Report
              </div>
              <div className="mt-2 text-4xl font-extrabold tracking-tight text-black">
                £4.99
              </div>
              <div className="mt-2 text-sm font-semibold text-slate-900">
                Detailed findings and MOT analysis
              </div>

              <ul className="mt-5 space-y-2 text-sm text-slate-700">
                <li>✔ Detailed findings and likely cost drivers</li>
                <li>✔ Itemised repair exposure guidance</li>
                <li>✔ Seller questions and negotiation guidance</li>
                <li>✔ MOT failures and advisory analysis</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-[var(--aa-red)]/20 bg-[var(--aa-red)]/5 p-6">
              <div className="text-sm font-semibold uppercase tracking-wide text-[var(--aa-red)]">
                Full Bundle
              </div>
              <div className="mt-2 text-4xl font-extrabold tracking-tight text-black">
                £9.99
              </div>
              <div className="mt-2 text-sm font-semibold text-slate-900">
                Core Report plus HPI-style history checks
              </div>

              <ul className="mt-5 space-y-2 text-sm text-slate-700">
                <li>✔ Everything in the Core Report</li>
                <li>✔ Finance marker checks</li>
                <li>✔ Write-off and stolen history markers</li>
                <li>✔ Mileage anomaly and keeper history checks</li>
              </ul>
            </div>
          </div>

          <div className="mt-10 rounded-2xl border border-[var(--aa-red)]/20 bg-red-50 p-5 text-sm text-slate-700">
            <div className="font-semibold text-[var(--aa-red)]">Important</div>
            <p className="mt-2 leading-6">
              AutoAudit is guidance, not a physical mechanical inspection.
              Always verify service history and consider an independent
              inspection before purchasing a vehicle.
            </p>
          </div>

          <div className="mt-10 rounded-2xl border bg-slate-950 p-6 text-white">
            <h2 className="text-2xl font-semibold text-white">
              Ready to check a specific car?
            </h2>
            <p className="mt-2 text-slate-200">
              Enter the registration and move from general research to
              vehicle-specific buyer-risk insight.
            </p>
            <div className="mt-5">
              <RegLookupCta intent="general" position="end"
                title="Start your AutoAudit check"
                subtitle="Check MOT history, advisory patterns and repair-risk signals before you buy."
                variant="dark"
              />
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/sample-report" className="btn-primary">
              View sample report
            </Link>

            <Link href="/pricing" className="btn-outline">
              View pricing
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}