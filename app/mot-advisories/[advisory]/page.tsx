import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAdvisoryBySlug } from "@/lib/seo/data";
import { absoluteUrl, buildAdvisoryHubPath } from "@/lib/seo/routes";
import {
  articleSchema,
  breadcrumbSchema,
  faqSchema,
  productSchema,
} from "@/lib/seo/schema";

type Props = {
  params: Promise<{
    advisory: string;
  }>;
};

export async function generateStaticParams() {
  const { allMotAdvisoryTypes } = await import("@/lib/seo/data");
  return allMotAdvisoryTypes.map((row) => ({
    advisory: row.advisory_slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { advisory } = await params;
  const row = getAdvisoryBySlug(advisory);

  if (!row) return { title: "Not found | AutoAudit" };

  const title = `${row.advisory_label} MOT Advisory Meaning | AutoAudit`;
  const description = `Understand what "${row.advisory_label}" means on an MOT, why it matters, likely repair impact and how to check the exact car by registration.`;
  const path = buildAdvisoryHubPath(advisory);

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

export default async function AdvisoryHubPage({ params }: Props) {
  const { advisory } = await params;
  const row = getAdvisoryBySlug(advisory);

  if (!row) notFound();

  const path = buildAdvisoryHubPath(advisory);
  const faqs = [
    {
      question: "Does an MOT advisory mean the car has failed?",
      answer:
        "No. An advisory flags something to watch, but the car can still pass the MOT. It can still be useful evidence of likely near-term maintenance.",
    },
    {
      question: "Should I avoid a car with this advisory?",
      answer:
        "Not always. The key is understanding severity, likely repair cost and whether the same issue appears repeatedly in the car's history.",
    },
  ];

  const breadcrumbs = breadcrumbSchema([
    { name: "Home", item: "/" },
    { name: "MOT advisories", item: "/mot-advisories" },
    { name: row.advisory_label, item: path },
  ]);

  const article = articleSchema({
    headline: `${row.advisory_label} MOT Advisory Meaning`,
    description: `What ${row.advisory_label} means, likely causes and buyer impact.`,
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema()) }}
      />

      <h1 className="text-3xl font-bold tracking-tight">
        {row.advisory_label}: what it means
      </h1>
      <p className="mt-4 text-lg text-slate-700">
        MOT section: {row.mot_section}. Category: {row.category}.
      </p>

      <section className="mt-8 rounded-2xl border p-6">
        <h2 className="text-xl font-semibold">
          Check the exact car by registration
        </h2>
        <p className="mt-2 text-slate-700">
          An MOT advisory is only useful in context. Enter the registration to
          check the exact car.
        </p>

        <form
          action="/check"
          method="GET"
          className="mt-4 flex flex-col gap-3 sm:flex-row"
        >
          <input
            type="text"
            name="registration"
            placeholder="Enter registration"
            required
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base uppercase tracking-wide"
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
          {row.notes || "Add a normalised explanation here."}
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">What to include here next</h2>
        <ul className="list-disc pl-6 text-slate-700">
          <li>Typical repair cost range</li>
          <li>Buyer impact explanation</li>
          <li>When to negotiate versus walk away</li>
          <li>Links to related advisories and problem pages</li>
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