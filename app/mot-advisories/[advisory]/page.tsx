import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import HeroCtaTextPanel from "@/components/seo/HeroCtaTextPanel";
import RegLookupCta from "@/components/seo/RegLookupCta";
import {
  allMotAdvisoryTypes,
  getAdvisoryBySlug,
  highPriorityModels,
} from "@/lib/seo/data";
import {
  absoluteUrl,
  buildAdvisoryHubPath,
  buildModelCommonProblemsPath,
} from "@/lib/seo/routes";
import { articleSchema, breadcrumbSchema, faqSchema } from "@/lib/seo/schema";

type Props = {
  params: Promise<{
    advisory: string;
  }>;
};

function getPlainEnglishMeaning(label: string) {
  return `This MOT advisory means the tester spotted a developing issue with ${label.toLowerCase()}. The car may have passed at the time, but the warning still matters when judging condition, future repair risk and whether the asking price is fair.`;
}

function getFailVsAdvisoryGuidance(label: string) {
  return {
    answer: `${label} may not fail an MOT immediately, but it can become a failure if the issue worsens, becomes unsafe or falls below MOT standards.`,
    bullets: [
      "An advisory is not the same as a fail",
      "Repeat advisories are more concerning than one isolated note",
      "Related advisories can suggest a wider maintenance pattern",
      "The exact vehicle history matters more than the wording alone",
    ],
  };
}

function getTypicalCostRisk(label: string) {
  return {
    level: "Medium",
    summary: `The repair-cost risk for ${label.toLowerCase()} depends on severity, repetition and whether the seller can prove the issue has already been repaired.`,
    bullets: [
      "Lower risk: one historic advisory with repair evidence",
      "Medium risk: repeated advisory with no clear invoice",
      "Higher risk: multiple related advisories across several MOTs",
    ],
  };
}

function getBuyerGuidance(label: string) {
  return [
    `Ask whether the ${label.toLowerCase()} issue has already been repaired.`,
    "Check whether the same warning appears across multiple MOT tests.",
    "Look for related advisories that may point to a bigger problem.",
    "Use unresolved issues as negotiation leverage before buying.",
  ];
}

function getPriorityBuyerModels() {
  return highPriorityModels.slice(0, 6).map((model) => ({
    href: buildModelCommonProblemsPath(model.make_slug, model.model_slug),
    label: `${model.make} ${model.model} common problems`,
    description:
      "Compare this advisory with model-specific used-car warning signs.",
  }));
}

function getRelatedAdvisoryGuides(currentSlug: string) {
  return allMotAdvisoryTypes
    .filter((item) => item.advisory_slug !== currentSlug)
    .slice(0, 6)
    .map((item) => ({
      href: buildAdvisoryHubPath(item.advisory_slug),
      label: `${item.advisory_label} advisory meaning`,
      description:
        "Understand another MOT warning that may affect used-car buying risk.",
    }));
}

export async function generateStaticParams() {
  return allMotAdvisoryTypes.map((row) => ({
    advisory: row.advisory_slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { advisory } = await params;
  const row = getAdvisoryBySlug(advisory);

  if (!row) return { title: "Not found | AutoAudit" };

  const path = buildAdvisoryHubPath(advisory);
  const title = `${row.advisory_label} MOT Advisory Meaning – Fail Risk, Costs & Buyer Advice`;
  const description = `Understand what ${row.advisory_label} means on an MOT, whether it could become a fail, likely repair-cost risk and what to check before buying.`;

  return {
    title,
    description,
    alternates: {
      canonical: absoluteUrl(path),
    },
    openGraph: {
      title,
      description,
      url: absoluteUrl(path),
      type: "article",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: `${row.advisory_label} MOT advisory meaning | AutoAudit`,
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

export default async function AdvisoryHubPage({ params }: Props) {
  const { advisory } = await params;
  const row = getAdvisoryBySlug(advisory);

  if (!row) notFound();

  const path = buildAdvisoryHubPath(advisory);
  const plainEnglishMeaning = getPlainEnglishMeaning(row.advisory_label);
  const failVsAdvisory = getFailVsAdvisoryGuidance(row.advisory_label);
  const costRisk = getTypicalCostRisk(row.advisory_label);
  const buyerGuidance = getBuyerGuidance(row.advisory_label);
  const priorityBuyerModels = getPriorityBuyerModels();
  const relatedAdvisoryGuides = getRelatedAdvisoryGuides(advisory);

  const faqs = [
    {
      question: `What does ${row.advisory_label} mean on an MOT?`,
      answer: plainEnglishMeaning,
    },
    {
      question: `Will ${row.advisory_label} fail an MOT?`,
      answer: failVsAdvisory.answer,
    },
    {
      question: `Is ${row.advisory_label} expensive to fix?`,
      answer: `The cost risk is ${costRisk.level.toLowerCase()}. ${costRisk.summary}`,
    },
    {
      question: `Should I buy a car with ${row.advisory_label} on its MOT history?`,
      answer:
        "It depends on whether the issue was repaired, whether it appears repeatedly and whether the asking price reflects the risk.",
    },
  ];

  const breadcrumbs = breadcrumbSchema([
    { name: "Home", item: "/" },
    { name: "MOT advisories", item: "/mot-advisories" },
    { name: row.advisory_label, item: path },
  ]);

  const article = articleSchema({
    headline: `${row.advisory_label} MOT Advisory Meaning – Fail Risk, Costs & Buyer Advice`,
    description: `Plain-English explanation of ${row.advisory_label}, including MOT fail risk, repair-cost risk and used-car buyer guidance.`,
    path,
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
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

      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-600"
      >
        <Link href="/" className="transition hover:text-slate-900">
          Home
        </Link>
        <span>/</span>
        <Link
          href="/mot-advisories"
          className="transition hover:text-slate-900"
        >
          MOT advisories
        </Link>
        <span>/</span>
        <span className="text-slate-900">{row.advisory_label}</span>
      </nav>

      <HeroCtaTextPanel
        heroImageSrc="/hero-car-road.png"
        heroAlt={`${row.advisory_label} MOT advisory meaning`}
        title={`${row.advisory_label}: MOT advisory meaning`}
        subtitle="MOT advisory guide"
        ctaComponent={
          <RegLookupCta
            title="Check the exact car behind this advisory"
            subtitle="See whether this warning is isolated, repeated or part of a bigger repair-risk pattern."
            variant="light"
          />
        }
        bodyContent={
          <div className="space-y-3">
            <p>{plainEnglishMeaning}</p>
            <p>
              One advisory does not tell the full story. A registration check
              helps you see the wider MOT pattern, related warnings and whether
              the seller’s asking price reflects the risk.
            </p>
          </div>
        }
      />

      <section className="mt-10 rounded-2xl border bg-slate-50 p-5">
        <h2 className="text-2xl font-semibold">Quick answer</h2>
        <p className="mt-3 text-slate-700">{plainEnglishMeaning}</p>
        <p className="mt-3 text-slate-700">
          The important buyer question is not just whether this advisory exists.
          It is whether it appears repeatedly, whether the seller can prove it
          was repaired and whether the price reflects the risk.
        </p>
      </section>

      <section className="mt-10 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border bg-white p-5">
          <h2 className="text-2xl font-semibold">Will this fail an MOT?</h2>
          <p className="mt-3 text-slate-700">{failVsAdvisory.answer}</p>
          <ul className="mt-3 list-disc pl-6 text-slate-700">
            {failVsAdvisory.bullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border bg-white p-5">
          <h2 className="text-2xl font-semibold">Typical repair-cost risk</h2>
          <p className="mt-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Risk level: {costRisk.level}
          </p>
          <p className="mt-3 text-slate-700">{costRisk.summary}</p>
          <ul className="mt-3 list-disc pl-6 text-slate-700">
            {costRisk.bullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-10 rounded-2xl border bg-slate-50 p-5">
        <h2 className="text-2xl font-semibold">Used-car buyer risk</h2>
        <p className="mt-3 text-slate-700">
          This advisory should not automatically make you walk away, but it
          should make you ask better questions. The real concern is a pattern of
          unresolved issues, vague seller explanations or a price that does not
          reflect likely repair work.
        </p>
        <ul className="mt-3 list-disc pl-6 text-slate-700">
          {buyerGuidance.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">
          Common cars where this advisory appears
        </h2>
        <p className="text-slate-700">
          This warning can appear across many used cars. Compare it with
          model-specific buying guides to understand how MOT warnings fit into
          wider ownership risk.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {priorityBuyerModels.map((guide) => (
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

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">Related MOT advisory guides</h2>
        <p className="text-slate-700">
          Used cars often show more than one advisory over time. These related
          guides help you understand other warning signs that may appear in the
          same MOT history.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {relatedAdvisoryGuides.map((guide) => (
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

      <section className="mt-10 rounded-2xl border bg-slate-50 p-5">
        <h2 className="text-xl font-semibold">
          Ready to check a car with this advisory?
        </h2>
        <p className="mt-2 text-slate-700">
          Advisory guides explain the wording, but the exact registration shows
          whether the warning is isolated, repeated or part of a wider pattern.
          Use the checker above before you buy.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">Buyer research path</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Link
            href="/mot-advisories"
            className="rounded-xl border p-4 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <h3 className="font-medium">Browse all MOT advisories</h3>
            <p className="mt-1 text-sm text-slate-600">
              Understand more common MOT warning signs
            </p>
          </Link>
          <Link
            href="/cars"
            className="rounded-xl border p-4 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <h3 className="font-medium">Browse car problem guides</h3>
            <p className="mt-1 text-sm text-slate-600">
              Compare common problems by make and model
            </p>
          </Link>
          <Link
            href="/check-car-by-registration"
            className="rounded-xl border p-4 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <h3 className="font-medium">Check the exact car</h3>
            <p className="mt-1 text-sm text-slate-600">
              Move from advisory research to vehicle-specific risk
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
    </div>
  );
}