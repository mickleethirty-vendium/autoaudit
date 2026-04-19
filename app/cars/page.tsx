import type { Metadata } from "next";
import Link from "next/link";
import { wave1Models, allMotAdvisoryTypes } from "@/lib/seo/data";
import {
  absoluteUrl,
  buildAdvisoryHubPath,
  buildModelCommonProblemsPath,
} from "@/lib/seo/routes";
import {
  breadcrumbSchema,
  faqSchema,
  productSchema,
} from "@/lib/seo/schema";

export const metadata: Metadata = {
  title: "Common Car Problems by Make and Model | AutoAudit",
  description:
    "Browse common car problems by make and model, compare used car risk patterns, and check a specific vehicle by registration before you buy.",
  alternates: {
    canonical: absoluteUrl("/cars"),
  },
  openGraph: {
    title: "Common Car Problems by Make and Model | AutoAudit",
    description:
      "Browse common car problems by make and model, compare used car risk patterns, and check a specific vehicle by registration before you buy.",
    url: absoluteUrl("/cars"),
    type: "website",
  },
};

type ModelCard = {
  href: string;
  label: string;
  description: string;
};

type AdvisoryCard = {
  href: string;
  label: string;
  description: string;
};

function getPriorityModels(): ModelCard[] {
  const priorityRows = wave1Models
    .filter((row) => row.priority_tier === 1 || row.launch_wave === 1)
    .slice(0, 24);

  return priorityRows.map((row) => ({
    href: buildModelCommonProblemsPath(row.make_slug, row.model_slug),
    label: `${row.make} ${row.model} common problems`,
    description:
      "Used buyer guide covering reliability pointers, likely warning signs and ownership risk.",
  }));
}

function getPopularAdvisories(): AdvisoryCard[] {
  return allMotAdvisoryTypes.slice(0, 8).map((row) => ({
    href: buildAdvisoryHubPath(row.advisory_slug),
    label: `${row.advisory_label} advisory meaning`,
    description:
      "Understand what this MOT advisory means and why it matters before you buy.",
  }));
}

function getGroupedModels() {
  const priorityRows = wave1Models.filter(
    (row) => row.priority_tier === 1 || row.launch_wave === 1
  );

  const grouped = new Map<string, typeof priorityRows>();

  for (const row of priorityRows) {
    const existing = grouped.get(row.make) || [];
    existing.push(row);
    grouped.set(row.make, existing);
  }

  return [...grouped.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([make, rows]) => ({
      make,
      models: rows
        .sort((a, b) => a.model.localeCompare(b.model))
        .slice(0, 12),
    }));
}

export default function CarsHubPage() {
  const priorityModels = getPriorityModels();
  const popularAdvisories = getPopularAdvisories();
  const groupedModels = getGroupedModels();

  const faqs = [
    {
      question: "What is this cars page for?",
      answer:
        "This page helps you browse common car problems by make and model so you can research likely weak points before buying used.",
    },
    {
      question: "Does this replace checking a car by registration?",
      answer:
        "No. Model-level guides are useful for research, but a registration check is still the best way to assess the exact car you are considering.",
    },
    {
      question: "Why browse by make and model first?",
      answer:
        "Because it helps you spot common risk patterns, likely maintenance themes and areas to question before you commit to a viewing or purchase.",
    },
  ];

  const breadcrumbs = breadcrumbSchema([
    { name: "Home", item: "/" },
    { name: "Cars", item: "/cars" },
  ]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema()) }}
      />

      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-600"
      >
        <Link href="/" className="transition hover:text-slate-900">
          Home
        </Link>
        <span>/</span>
        <span className="text-slate-900">Cars</span>
      </nav>

      <section className="rounded-3xl border bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Common car problems by make and model
        </h1>
        <p className="mt-4 max-w-3xl text-base text-slate-700">
          Browse used car guides by make and model to see common warning signs,
          likely ownership risks and buying points worth checking before you
          commit.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/check-car-by-registration"
            className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Check a car by registration
          </Link>
          <Link
            href="/mot-advisories"
            className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-50"
          >
            Browse MOT advisory guides
          </Link>
        </div>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">Start with popular car guides</h2>
        <p className="text-slate-700">
          These are strong starting points if you want to compare common used
          car problem pages before drilling into a specific vehicle.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {priorityModels.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-xl border p-4 transition hover:border-slate-400 hover:bg-slate-50"
            >
              <h3 className="font-medium">{item.label}</h3>
              <p className="mt-1 text-sm text-slate-600">{item.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">Popular MOT advisory guides</h2>
        <p className="text-slate-700">
          These advisory pages help explain the warning signs that often sit
          alongside model-specific buying risks.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {popularAdvisories.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-xl border p-4 transition hover:border-slate-400 hover:bg-slate-50"
            >
              <h3 className="font-medium">{item.label}</h3>
              <p className="mt-1 text-sm text-slate-600">{item.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10 space-y-6">
        <h2 className="text-2xl font-semibold">Browse by make</h2>
        <p className="text-slate-700">
          Explore model-level used car guides grouped by manufacturer.
        </p>

        <div className="space-y-6">
          {groupedModels.map((group) => (
            <section key={group.make} className="rounded-2xl border bg-white p-5">
              <h3 className="text-xl font-semibold">{group.make}</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {group.models.map((model) => (
                  <Link
                    key={model.full_slug}
                    href={buildModelCommonProblemsPath(
                      model.make_slug,
                      model.model_slug
                    )}
                    className="rounded-xl border p-4 transition hover:border-slate-400 hover:bg-slate-50"
                  >
                    <span className="font-medium">
                      {model.make} {model.model} common problems
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-3xl border bg-slate-900 p-6 text-white">
        <h2 className="text-2xl font-semibold">
          Research is useful. Checking the exact car is better.
        </h2>
        <p className="mt-3 max-w-2xl text-slate-200">
          Model guides can help you understand typical risks, but they cannot
          tell you whether the exact car you are viewing has repeat advisories,
          suspicious gaps or price risk. Use the registration check for that.
        </p>

        <form
          action="/check"
          method="GET"
          className="mt-5 flex flex-col gap-3 sm:flex-row"
        >
          <input
            type="text"
            name="registration"
            placeholder="Enter registration"
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