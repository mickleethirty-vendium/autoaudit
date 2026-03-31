import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getModelByParams } from "@/lib/seo/data";
import {
  absoluteUrl,
  buildModelCommonProblemsPath,
} from "@/lib/seo/routes";
import {
  articleSchema,
  breadcrumbSchema,
  faqSchema,
  productSchema,
} from "@/lib/seo/schema";

type Props = {
  params: Promise<{
    make: string;
    model: string;
  }>;
};

export async function generateStaticParams() {
  const { wave1Models } = await import("@/lib/seo/data");

  console.log(
    "SEO model params sample:",
    wave1Models.slice(0, 10).map((row) => ({
      make: row.make_slug,
      model: row.model_slug,
    }))
  );

  return wave1Models.map((row) => ({
    make: row.make_slug,
    model: row.model_slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { make, model } = await params;
  const row = getModelByParams(make, model);

  if (!row) {
    return {
      title: "Not found | AutoAudit",
    };
  }

  const title = `${row.make} ${row.model} Common Problems | AutoAudit`;
  const description = `Read common problems, buyer risks and reliability pointers for the ${row.make} ${row.model}, then check a specific car by registration.`;
  const path = buildModelCommonProblemsPath(make, model);

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

export default async function ModelCommonProblemsPage({ params }: Props) {
  const { make, model } = await params;
  const row = getModelByParams(make, model);

  if (!row) notFound();

  const path = buildModelCommonProblemsPath(make, model);

  const faqs = [
    {
      question: `Is the ${row.make} ${row.model} reliable?`,
      answer:
        `Reliability depends on engine, age, maintenance history and MOT pattern. AutoAudit pages should be expanded with your real issue matches and MOT evidence over time.`,
    },
    {
      question: `Should I check a ${row.make} ${row.model} by registration?`,
      answer:
        `Yes. A registration check lets you look at that exact car rather than relying only on general model guidance.`,
    },
  ];

  const breadcrumbs = breadcrumbSchema([
    { name: "Home", item: "/" },
    { name: "Cars", item: "/cars" },
    { name: row.make, item: `/cars/${row.make_slug}` },
    { name: row.model, item: `/cars/${row.make_slug}/${row.model_slug}` },
    { name: "Common problems", item: path },
  ]);

  const article = articleSchema({
    headline: `${row.make} ${row.model} Common Problems`,
    description: `Common problems, reliability pointers and buyer guidance for the ${row.make} ${row.model}.`,
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
        {row.make} {row.model} Common Problems
      </h1>
      <p className="mt-4 text-lg text-slate-700">
        Use this page as the public SEO entry point for model-specific guidance,
        then move users into a registration lookup for the exact car.
      </p>

      <section className="mt-8 rounded-2xl border p-6">
        <h2 className="text-xl font-semibold">
          Check a specific {row.make} {row.model}
        </h2>
        <p className="mt-2 text-slate-700">
          Enter the registration to check the exact car, not just the model in
          general.
        </p>

        <form
          action="/check"
          method="GET"
          className="mt-4 flex flex-col gap-3 sm:flex-row"
        >
          <input
            type="text"
            name="registration"
            placeholder={`Enter ${row.make} ${row.model} registration`}
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
        <h2 className="text-2xl font-semibold">What to include here next</h2>
        <ul className="list-disc pl-6 text-slate-700">
          <li>Known issue matches from your failure dataset</li>
          <li>MOT advisory pattern summary for this model</li>
          <li>Repair exposure estimate band</li>
          <li>Negotiation guidance</li>
          <li>Seller questions</li>
        </ul>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">Buyer summary</h2>
        <p className="text-slate-700">
          Keep the introduction broad but useful. The real moat comes from
          blending make/model guidance with MOT signals and your paid report
          flow.
        </p>
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