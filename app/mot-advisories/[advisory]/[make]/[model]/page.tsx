import type { Metadata } from "next";
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
  ];

  const breadcrumbs = breadcrumbSchema([
    { name: "Home", item: "/" },
    { name: "MOT advisories", item: "/mot-advisories" },
    { name: advisoryRow.advisory_label, item: `/mot-advisories/${advisory}` },
    {
      name: `${modelRow.make} ${modelRow.model}`,
      item: `/cars/${modelRow.make_slug}/${modelRow.model_slug}`,
    },
  ]);

  const article = articleSchema({
    headline: `${modelRow.make} ${modelRow.model} ${advisoryRow.advisory_label} Advisory`,
    description: `Understanding ${advisoryRow.advisory_label} advisories on the ${modelRow.make} ${modelRow.model}.`,
    path,
  });

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
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

      <h1 className="text-3xl font-bold tracking-tight">
        {modelRow.make} {modelRow.model}: {advisoryRow.advisory_label} Advisory
      </h1>

      <p className="mt-4 text-lg text-slate-700">
        This page explains what the{" "}
        <span className="font-medium">{advisoryRow.advisory_label}</span> MOT
        advisory means when it appears on a {modelRow.make} {modelRow.model}.
      </p>

      <section className="mt-8 rounded-2xl border p-6">
        <h2 className="text-xl font-semibold">
          Check a specific {modelRow.make} {modelRow.model}
        </h2>

        <p className="mt-2 text-slate-700">
          Enter the registration to check the exact vehicle history rather than
          relying on general model guidance.
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
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base uppercase"
          />

          <button
            type="submit"
            className="rounded-xl bg-slate-900 px-6 py-3 text-white"
          >
            Check this car
          </button>
        </form>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">Why this advisory appears</h2>

        <p className="text-slate-700">
          MOT advisories highlight developing problems that could become more
          serious over time. They often appear before a part reaches the point
          of failure.
        </p>

        <p className="text-slate-700">
          On the {modelRow.make} {modelRow.model}, this advisory can indicate
          age-related wear, environmental exposure or repeated stress on the
          affected component.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">Buyer guidance</h2>

        <ul className="list-disc pl-6 text-slate-700">
          <li>Ask the seller whether this issue has already been repaired.</li>
          <li>Check whether the same advisory appears on multiple MOT tests.</li>
          <li>Estimate the likely repair cost and factor it into your offer.</li>
        </ul>
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