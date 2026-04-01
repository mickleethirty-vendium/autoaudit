import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
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

function getBuyerGuidance(advisoryLabel: string) {
  const normalized = advisoryLabel.toLowerCase();

  if (normalized.includes("brake")) {
    return [
      "Ask whether the brake parts mentioned have already been replaced.",
      "Check whether the issue appeared on more than one MOT.",
      "Factor likely brake work into your offer before buying.",
    ];
  }

  if (
    normalized.includes("oil") ||
    normalized.includes("leak") ||
    normalized.includes("engine")
  ) {
    return [
      "Ask the seller what was diagnosed and whether any repair invoice exists.",
      "Check for repeat advisories or signs the leak was ignored.",
      "Treat active leaks or unclear explanations as a negotiation point.",
    ];
  }

  if (
    normalized.includes("suspension") ||
    normalized.includes("steering") ||
    normalized.includes("bush") ||
    normalized.includes("shock")
  ) {
    return [
      "Ask whether the worn suspension or steering parts have been changed.",
      "Look for repeat advisories that suggest long-term neglect.",
      "Budget for alignment and related follow-on work where relevant.",
    ];
  }

  return [
    "Ask the seller whether this issue has already been repaired.",
    "Check whether the same advisory appears across multiple MOT tests.",
    "Estimate the likely repair cost and factor it into your offer.",
  ];
}

function getRelatedModelGuides(advisoryLabel: string) {
  const normalized = advisoryLabel.toLowerCase();

  if (normalized.includes("brake")) {
    return [
      {
        href: "/cars/ford/fiesta/common-problems",
        label: "Ford Fiesta common problems",
        description: "A strong example of a high-volume used model where brake history matters",
      },
      {
        href: "/cars/audi/a3/common-problems",
        label: "Audi A3 common problems",
        description: "Useful if you are researching brake wear on a premium hatchback",
      },
      {
        href: "/cars/bmw/3-series/common-problems",
        label: "BMW 3 Series common problems",
        description: "See broader ownership risks and negotiation points",
      },
      {
        href: "/cars/audi/a1/common-problems",
        label: "Audi A1 common problems",
        description: "Helpful for buyers comparing brake-related warnings on smaller cars",
      },
    ];
  }

  if (
    normalized.includes("oil") ||
    normalized.includes("leak") ||
    normalized.includes("engine")
  ) {
    return [
      {
        href: "/cars/bmw/3-series/common-problems",
        label: "BMW 3 Series common problems",
        description: "Useful when checking engine bay issues and ownership risk",
      },
      {
        href: "/cars/audi/a3/common-problems",
        label: "Audi A3 common problems",
        description: "Read the broader used buying guide for a high-volume premium model",
      },
      {
        href: "/cars/audi/a1/common-problems",
        label: "Audi A1 common problems",
        description: "Helpful if you are comparing leak-related warnings on smaller cars",
      },
      {
        href: "/cars/ford/fiesta/common-problems",
        label: "Ford Fiesta common problems",
        description: "A useful benchmark for common used-car warning signs",
      },
    ];
  }

  if (
    normalized.includes("suspension") ||
    normalized.includes("steering") ||
    normalized.includes("bush") ||
    normalized.includes("shock")
  ) {
    return [
      {
        href: "/cars/ford/fiesta/common-problems",
        label: "Ford Fiesta common problems",
        description: "Suspension and wear-related issues are common on urban-driven examples",
      },
      {
        href: "/cars/audi/a1/common-problems",
        label: "Audi A1 common problems",
        description: "Useful if you are comparing advisory patterns on smaller premium cars",
      },
      {
        href: "/cars/bmw/3-series/common-problems",
        label: "BMW 3 Series common problems",
        description: "Helpful for broader context on wear, mileage and repair exposure",
      },
      {
        href: "/cars/audi/a3/common-problems",
        label: "Audi A3 common problems",
        description: "Read the wider buyer guide for a common used hatchback",
      },
    ];
  }

  return [
    {
      href: "/cars/audi/a1/common-problems",
      label: "Audi A1 common problems",
      description: "Read the used buying guide for a popular smaller premium hatchback",
    },
    {
      href: "/cars/audi/a3/common-problems",
      label: "Audi A3 common problems",
      description: "See broader reliability pointers and buyer warnings",
    },
    {
      href: "/cars/bmw/3-series/common-problems",
      label: "BMW 3 Series common problems",
      description: "Helpful for understanding ownership risk on a popular used model",
    },
    {
      href: "/cars/ford/fiesta/common-problems",
      label: "Ford Fiesta common problems",
      description: "A useful benchmark for common used-car buying risks",
    },
  ];
}

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
  const description = `Understand what ${row.advisory_label} means on an MOT, why it matters, likely repair impact and how to check the exact car by registration.`;
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
  const buyerGuidance = getBuyerGuidance(row.advisory_label);
  const relatedModelGuides = getRelatedModelGuides(row.advisory_label);

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
    {
      question: "Why does this advisory matter to a buyer?",
      answer:
        "Because it can signal future cost, deferred maintenance or a reason to negotiate. Repeated advisories are often more concerning than a single isolated mention.",
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema()) }}
      />

      <section className="overflow-hidden rounded-3xl border bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-2">
          <div className="relative min-h-[260px] lg:min-h-full">
            <Image
              src="/hero-car-road.png"
              alt={`${row.advisory_label} MOT advisory guide`}
              fill
              priority
              className="object-cover"
            />
          </div>

          <div className="p-5 sm:p-6 lg:p-7">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {row.advisory_label}: what it means
            </h1>

            <p className="mt-3 text-base text-slate-700">
              If you have seen this MOT advisory on a used car, this page
              explains what it usually means, why buyers should care and what to
              check before you commit.
            </p>

            <div className="mt-2 text-sm text-slate-600">
              MOT section: {row.mot_section}. Category: {row.category}.
            </div>

            <div className="mt-4 rounded-2xl border-2 border-slate-900 bg-slate-50 p-4">
              <h2 className="text-lg font-semibold sm:text-xl">
                Check the exact car by registration
              </h2>
              <p className="mt-2 text-sm text-slate-700 sm:text-base">
                An MOT advisory is only useful in context. Enter the registration
                to see whether this issue appears once, repeatedly or alongside
                other warning signs.
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
          Most buyers search an MOT advisory after spotting it on a listing, an
          MOT history report or a seller screenshot. The real question is not
          just what the advisory means in theory, but whether the exact car you
          are considering looks like a maintenance risk.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">Why this advisory appears</h2>
        <p className="text-slate-700">
          {row.notes ||
            "This advisory usually appears when a tester spots wear, deterioration or a developing issue that does not yet justify a failure but could become more serious over time."}
        </p>
        <p className="text-slate-700">
          Advisories matter because they often appear before a part reaches the
          point of failure. They can be early evidence of future cost, neglected
          maintenance or a pattern that should affect your buying decision.
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

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">Related model guides</h2>
        <p className="text-slate-700">
          These model guides help you see the broader ownership risks and buying
          warnings that often sit alongside this type of advisory.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {relatedModelGuides.map((guide) => (
            <Link
              key={guide.href}
              href={guide.href}
              className="rounded-xl border p-4 transition hover:border-slate-400 hover:bg-slate-50"
            >
              <h3 className="font-medium">{guide.label}</h3>
              <p className="mt-1 text-sm text-slate-600">
                {guide.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-3xl border bg-slate-900 p-6 text-white">
        <h2 className="text-2xl font-semibold">
          Found this advisory on a car already? Run the registration check.
        </h2>
        <p className="mt-3 max-w-2xl text-slate-200">
          A single advisory line does not tell the whole story. Enter the
          registration to see MOT history, repeat issues, pricing context and
          whether the car looks riskier than it first appears.
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
        <h2 className="text-2xl font-semibold">Related checks and guides</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/check-car-by-registration"
            className="rounded-xl border p-4 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <h3 className="font-medium">Check a car by registration</h3>
            <p className="mt-1 text-sm text-slate-600">
              Run a full used car risk check before you buy
            </p>
          </Link>
          <Link
            href="/mot-history-check"
            className="rounded-xl border p-4 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <h3 className="font-medium">MOT history check</h3>
            <p className="mt-1 text-sm text-slate-600">
              Review MOT records and advisory patterns
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