import type { Metadata } from "next";
import Link from "next/link";
import HeroCtaTextPanel from "@/components/seo/HeroCtaTextPanel";
import RegLookupCta from "@/components/seo/RegLookupCta";
import { allMotAdvisoryTypes, wave1Models } from "@/lib/seo/data";
import {
  absoluteUrl,
  buildAdvisoryHubPath,
  buildModelCommonProblemsPath,
} from "@/lib/seo/routes";
import { breadcrumbSchema, faqSchema } from "@/lib/seo/schema";

export const metadata: Metadata = {
  title: "MOT Advisory Guides | AutoAudit",
  description:
    "Browse MOT advisory guides to understand what common advisory notes mean, why they matter, and how to check the exact car by registration before you buy.",
  alternates: {
    canonical: absoluteUrl("/mot-advisories"),
  },
  openGraph: {
    title: "MOT Advisory Guides | AutoAudit",
    description:
      "Browse MOT advisory guides to understand what common advisory notes mean, why they matter, and how to check the exact car by registration before you buy.",
    url: absoluteUrl("/mot-advisories"),
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "MOT advisory guides | AutoAudit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MOT Advisory Guides | AutoAudit",
    description:
      "Browse MOT advisory guides to understand what common advisory notes mean, why they matter, and how to check the exact car by registration before you buy.",
    images: ["/og-image.png"],
  },
};

type AdvisoryCard = {
  href: string;
  label: string;
  description: string;
};

type ModelCard = {
  href: string;
  label: string;
  description: string;
};

function getAdvisoryCards(): AdvisoryCard[] {
  return allMotAdvisoryTypes.slice(0, 30).map((row) => ({
    href: buildAdvisoryHubPath(row.advisory_slug),
    label: `${row.advisory_label} advisory meaning`,
    description:
      "Understand what this MOT advisory means, why it matters and what buyers should check next.",
  }));
}

function getPriorityModelCards(): ModelCard[] {
  return wave1Models
    .filter((row) => row.priority_tier === 1 || row.launch_wave === 1)
    .slice(0, 12)
    .map((row) => ({
      href: buildModelCommonProblemsPath(row.make_slug, row.model_slug),
      label: `${row.make} ${row.model} common problems`,
      description:
        "Read the broader used buyer guide for this model and compare ownership risks.",
    }));
}

function getGroupedAdvisories() {
  const grouped = new Map<string, typeof allMotAdvisoryTypes>();

  for (const advisory of allMotAdvisoryTypes) {
    const category = advisory.category || "Other";
    const existing = grouped.get(category) || [];
    existing.push(advisory);
    grouped.set(category, existing);
  }

  return [...grouped.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([category, advisories]) => ({
      category,
      advisories: advisories
        .sort((a, b) => a.advisory_label.localeCompare(b.advisory_label))
        .slice(0, 12),
    }));
}

export default function MotAdvisoriesHubPage() {
  const advisoryCards = getAdvisoryCards();
  const priorityModelCards = getPriorityModelCards();
  const groupedAdvisories = getGroupedAdvisories();

  const faqs = [
    {
      question: "What is an MOT advisory?",
      answer:
        "An MOT advisory is a note recorded during an MOT test to flag wear, deterioration or a developing issue that does not yet justify a failure.",
    },
    {
      question: "Should I avoid a car with advisories?",
      answer:
        "Not necessarily. The important thing is whether the issue looks minor, expensive, repeated or left unresolved over multiple MOT tests.",
    },
    {
      question: "Why browse advisory guides first?",
      answer:
        "Because advisory guides help you understand the likely buyer impact of common MOT notes before you decide how serious they are on a specific car.",
    },
  ];

  const breadcrumbs = breadcrumbSchema([
    { name: "Home", item: "/" },
    { name: "MOT advisories", item: "/mot-advisories" },
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
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
        <span className="text-slate-900">MOT advisories</span>
      </nav>

      <HeroCtaTextPanel
        heroImageSrc="/hero-car-road.png"
        heroAlt="MOT advisory guides"
        title="MOT advisory guides"
        subtitle="Used car buyer guide"
        ctaComponent={
          <RegLookupCta
            title="Check the exact car by registration"
            subtitle="See whether its MOT advisories are isolated, repeated or part of a bigger repair-risk pattern."
            variant="light"
          />
        }
        bodyContent={
          <div className="space-y-3">
            <p>
              Browse common MOT advisory guides to understand what warning notes
              mean, why buyers should care and when an issue may be worth
              negotiating or investigating further.
            </p>
            <p>
              Advisory guides are useful for context, but the real buying risk
              depends on the exact car. Use the registration check once you are
              looking at a specific vehicle.
            </p>
          </div>
        }
      />

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">Popular MOT advisory guides</h2>
        <p className="text-slate-700">
          Start here if you want quick explanations of common MOT warning signs
          that often matter to used car buyers.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {advisoryCards.map((item) => (
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

      <section className="mt-10 rounded-2xl border bg-slate-50 p-5">
        <h2 className="text-2xl font-semibold">
          How to use MOT advisories when buying a used car
        </h2>
        <p className="mt-3 text-slate-700">
          An MOT advisory is not automatically a reason to walk away, but it is
          a signal to look deeper. A single old advisory with repair evidence is
          very different from the same warning appearing year after year with no
          sign it was fixed.
        </p>
        <ul className="mt-3 list-disc pl-6 text-slate-700">
          <li>Check whether the advisory appears once or repeatedly</li>
          <li>Look for related warnings across the same MOT history</li>
          <li>Ask the seller for repair invoices or proof of work</li>
          <li>Use unresolved advisories as negotiation leverage</li>
        </ul>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">Popular model problem guides</h2>
        <p className="text-slate-700">
          These model guides add broader used car context around the kinds of
          issues that often show up in MOT history.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {priorityModelCards.map((item) => (
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
        <h2 className="text-2xl font-semibold">Browse advisories by category</h2>
        <p className="text-slate-700">
          Explore MOT advisory topics grouped by category.
        </p>

        <div className="space-y-6">
          {groupedAdvisories.map((group) => (
            <section
              key={group.category}
              className="rounded-2xl border bg-white p-5"
            >
              <h3 className="text-xl font-semibold">{group.category}</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {group.advisories.map((advisory) => (
                  <Link
                    key={advisory.advisory_slug}
                    href={buildAdvisoryHubPath(advisory.advisory_slug)}
                    className="rounded-xl border p-4 transition hover:border-slate-400 hover:bg-slate-50"
                  >
                    <span className="font-medium">
                      {advisory.advisory_label} advisory meaning
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-2xl border bg-slate-50 p-5">
        <h2 className="text-xl font-semibold">
          Advisory guides explain the wording. A registration check shows the
          pattern.
        </h2>
        <p className="mt-2 text-slate-700">
          The same advisory can be low risk on one car and a major warning sign
          on another. What matters is whether it is repeated, whether related
          issues appear nearby and whether the seller can prove the work has
          been done. Use the checker above when you have a specific registration.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">Buyer research path</h2>
        <div className="grid gap-4 sm:grid-cols-3">
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
              Move from advisory research to vehicle-specific risk checks
            </p>
          </Link>
          <Link
            href="/cars/ford"
            className="rounded-xl border p-4 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <h3 className="font-medium">Start with popular makes</h3>
            <p className="mt-1 text-sm text-slate-600">
              Explore high-volume used car guides
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