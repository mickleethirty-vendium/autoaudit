import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdvisoryBySlug, getModelByParams } from "@/lib/seo/data";
import { absoluteUrl } from "@/lib/seo/routes";
import {
  articleSchema,
  breadcrumbSchema,
  faqSchema,
} from "@/lib/seo/schema";

type Props = {
  params: Promise<{
    advisory: string;
    make: string;
    model: string;
  }>;
};

function getBuyerGuidance(advisoryLabel: string, make: string, model: string) {
  const normalized = advisoryLabel.toLowerCase();

  if (normalized.includes("brake")) {
    return [
      `Ask whether the brake-related issue on this ${make} ${model} has already been repaired.`,
      "Check whether the same brake advisory appears on more than one MOT.",
      "Budget for likely brake work and use that cost in your negotiation.",
    ];
  }

  if (
    normalized.includes("oil") ||
    normalized.includes("leak") ||
    normalized.includes("engine")
  ) {
    return [
      `Ask what was diagnosed on this ${make} ${model} and whether any repair invoice exists.`,
      "Check for repeat advisories or signs that the issue was ignored.",
      "Treat active leaks or vague seller explanations as a negotiation point.",
    ];
  }

  if (
    normalized.includes("suspension") ||
    normalized.includes("steering") ||
    normalized.includes("bush") ||
    normalized.includes("shock")
  ) {
    return [
      `Ask whether the worn suspension or steering parts on this ${make} ${model} have been changed.`,
      "Look for repeat advisories that suggest long-term neglect.",
      "Budget for alignment and any related follow-on work if needed.",
    ];
  }

  return [
    `Ask whether this advisory on the ${make} ${model} has already been repaired.`,
    "Check whether the same issue appears on multiple MOT tests.",
    "Estimate the likely repair cost and factor it into your offer.",
  ];
}

export async function generateStaticParams() {
  const { wave1Models, allMotAdvisoryTypes } = await import("@/lib/seo/data");

  const params = [];

  for (const advisory of allMotAdvisoryTypes) {
    for (const model of wave1Models) {
      params.push({
        advisory: advisory.advisory_slug,
        make: model.make_slug,
        model: model.model_slug,
      });
    }
  }

  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { advisory, make, model } = await params;

  const advisoryRow = getAdvisoryBySlug(advisory);
  const modelRow = getModelByParams(make, model);

  if (!advisoryRow || !modelRow) {
    return {
      title: "Not found | AutoAudit",
    };
  }

  const title = `${modelRow.make} ${modelRow.model} ${advisoryRow.advisory_label} Advisory | AutoAudit`;
  const description = `Understand what ${advisoryRow.advisory_label} means when it appears on a ${modelRow.make} ${modelRow.model} MOT history. Learn the likely cause, repair impact and how to check the exact car by registration.`;
  const path = `/mot-advisories/${advisory}/${make}/${model}`;

  return {
    title,
    description,
    alternates: { canonical: absoluteUrl(path) },
    openGraph: {
      title,
      description,
      url: absoluteUrl(path),
      type: "article",
    },
  };
}

export default async function AdvisoryModelPage({ params }: Props) {
  const { advisory, make, model } = await params;

  const advisoryRow = getAdvisoryBySlug(advisory);
  const modelRow = getModelByParams(make, model);

  if (!advisoryRow || !modelRow) notFound();

  const path = `/mot-advisories/${advisory}/${make}/${model}`;
  const buyerGuidance = getBuyerGuidance(
    advisoryRow.advisory_label,
    modelRow.make,
    modelRow.model
  );

  const faqs = [
    {
      question: `What does ${advisoryRow.advisory_label} mean on a ${modelRow.make} ${modelRow.model}?`,
      answer: `It means the MOT tester has identified a developing issue related to ${advisoryRow.advisory_label.toLowerCase()}. The car can still pass the MOT, but the problem may worsen if ignored.`,
    },
    {
      question: `Should I avoid buying a ${modelRow.make} ${modelRow.model} with this advisory?`,
      answer:
        "Not necessarily. The key is understanding severity, likely repair cost and whether the issue appears repeatedly across MOT tests.",
    },
    {
      question: `Why should I run a registration check on this ${modelRow.make} ${modelRow.model}?`,
      answer: `Because general advisory guidance is not enough on its own. A registration check helps you see the exact MOT pattern, price context and risk signals for the specific ${modelRow.make} ${modelRow.model} you are considering.`,
    },
  ];

  const breadcrumbs = breadcrumbSchema([
    { name: "Home", item: "/" },
    { name: "MOT advisories", item: "/mot-advisories" },
    { name: advisoryRow.advisory_label, item: `/mot-advisories/${advisory}` },
    {
      name: `${modelRow.make} ${modelRow.model}`,
      item: `/cars/${modelRow.make_slug}/${modelRow.model_slug}`,
    },
    {
      name: `${modelRow.make} ${modelRow.model} advisory`,
      item: path,
    },
  ]);

  const article = articleSchema({
    headline: `${modelRow.make} ${modelRow.model} ${advisoryRow.advisory_label} Advisory`,
    description: `Understanding ${advisoryRow.advisory_label} advisories on the ${modelRow.make} ${modelRow.model}.`,
    path,
  });

  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }}
      />

      <section className="overflow-hidden rounded-3xl border bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-2">
          <div className="relative min-h-[260px] lg:min-h-full">
            <Image
              src="/hero-car-road.png"
              alt={`${modelRow.make} ${modelRow.model} ${advisoryRow.advisory_label} advisory guide`}
              fill
              priority
              className="object-cover"
            />
          </div>

          <div className="p-5 sm:p-6 lg:p-7">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {modelRow.make} {modelRow.model}: {advisoryRow.advisory_label}
            </h1>

            <p className="mt-3 text-base text-slate-700">
              If you have seen this advisory on a {modelRow.make} {modelRow.model},
              this page explains what it usually means, why it matters to a used
              car buyer and why you should check the exact registration before
              making a decision.
            </p>

            <div className="mt-4 rounded-2xl border-2 border-slate-900 bg-slate-50 p-4">
              <h2 className="text-lg font-semibold sm:text-xl">
                Check this {modelRow.make} {modelRow.model} now
              </h2>
              <p className="mt-2 text-sm text-slate-700 sm:text-base">
                Do not rely on a generic advisory description alone. Enter the
                registration to see whether this issue appears once, repeatedly
                or alongside other warning signs.
              </p>

              <form
                action="/check"
                method="GET"
                className="mt-4 flex flex-col gap-3 sm:flex-row"
              >
                <input
                  type="text"
                  name="registration"
                  placeholder={`Enter ${modelRow.make} ${modelRow.model} registration`}
                  required
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base uppercase tracking-[0.2em]"
                />

                <button
                  type="submit"
                  className="rounded-xl bg-slate-900 px-6 py-3 text-base font-semibold text-white shadow-sm"
                >
                  Check this car
                </button>
              </form>

              <p className="mt-3 text-sm font-medium text-slate-600">
                Free preview • MOT history • Repair risk estimate • Market value
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">Why people land on this page</h2>
        <p className="text-slate-700">
          Most buyers reach a page like this after spotting an MOT advisory on a
          listing, MOT history report or seller screenshot. The real question is
          not just what the advisory means in theory, but whether the exact{" "}
          {modelRow.make} {modelRow.model} you are considering looks like a
          maintenance risk.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">Why this advisory matters</h2>

        <p className="text-slate-700">
          MOT advisories highlight developing problems that could become more
          serious over time. They often appear before a part reaches the point
          of failure.
        </p>

        <p className="text-slate-700">
          On the {modelRow.make} {modelRow.model}, this advisory can indicate
          age-related wear, environmental exposure or repeated stress on the
          affected component. A one-off advisory may be manageable. Repeated
          advisories can be a stronger warning sign.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">What buyers should do next</h2>

        <ul className="list-disc pl-6 text-slate-700">
          {buyerGuidance.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="mt-10 rounded-3xl border bg-slate-900 p-6 text-white">
        <h2 className="text-2xl font-semibold">
          Found this on a car already? Run the registration check now.
        </h2>
        <p className="mt-3 max-w-2xl text-slate-200">
          One advisory line is not enough to judge a used car properly. Enter
          the registration to see MOT history, repeat issues, pricing context
          and whether this {modelRow.make} {modelRow.model} looks riskier than
          it first appears.
        </p>

        <form
          action="/check"
          method="GET"
          className="mt-5 flex flex-col gap-3 sm:flex-row"
        >
          <input
            type="text"
            name="registration"
            placeholder={`Enter ${modelRow.make} ${modelRow.model} registration`}
            required
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base uppercase tracking-[0.2em] text-slate-900"
          />
          <button
            type="submit"
            className="rounded-xl bg-white px-6 py-3 text-base font-semibold text-slate-900"
          >
            Start free check
          </button>
        </form>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">Related guides</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href={`/mot-advisories/${advisory}`}
            className="rounded-xl border p-4 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <h3 className="font-medium">
              {advisoryRow.advisory_label}: general advisory guide
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Read the broader meaning and buyer impact of this advisory
            </p>
          </Link>

          <Link
            href={`/cars/${modelRow.make_slug}/${modelRow.model_slug}/common-problems`}
            className="rounded-xl border p-4 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <h3 className="font-medium">
              {modelRow.make} {modelRow.model} common problems
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Read the model guide and common used buying risks
            </p>
          </Link>
        </div>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">FAQ</h2>

        {faqs.map((faq) => (
          <div key={faq.question} className="rounded-xl border p-4">
            <h3 className="font-medium">{faq.question}</h3>
            <p className="mt-2 text-slate-700">{faq.answer}</p>
          </div>
        ))}
      </section>
    </main>
  );
}