import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import RegLookupCta from "@/components/seo/RegLookupCta";
import HeroCtaTextPanel from "@/components/seo/HeroCtaTextPanel";
import {
  allMotAdvisoryTypes,
  getModelByParams,
  wave1Models,
} from "@/lib/seo/data";
import {
  absoluteUrl,
  buildAdvisoryHubPath,
  buildModelCommonProblemsPath,
} from "@/lib/seo/routes";

type Props = {
  params: Promise<{
    make: string;
    model: string;
  }>;
};

type RelatedModel = {
  href: string;
  label: string;
  description: string;
};

type RelatedAdvisory = {
  href: string;
  label: string;
  description: string;
};

function getGenericIssueBullets(make: string, model: string) {
  const normalizedMake = make.toLowerCase();
  const normalizedModel = model.toLowerCase();

  const premiumMakes = [
    "audi",
    "bmw",
    "mercedes-benz",
    "mercedes",
    "jaguar",
    "land rover",
    "lexus",
    "volvo",
  ];

  const cityCarsAndSuperminis = [
    "a1",
    "a3",
    "fiesta",
    "corsa",
    "polo",
    "yaris",
    "micra",
    "208",
    "clio",
    "fabia",
    "ibiza",
    "aygo",
    "hatch",
  ];

  const suvKeywords = [
    "qashqai",
    "tucson",
    "sportage",
    "kuga",
    "tiguan",
    "xc40",
    "xc60",
    "x1",
    "x3",
    "q3",
    "q5",
    "range rover",
    "discovery",
    "captur",
    "2008",
    "3008",
  ];

  if (premiumMakes.includes(normalizedMake)) {
    return [
      "Suspension wear, knocks or bush deterioration on higher-mileage examples",
      "Brake disc and pad wear showing up repeatedly in MOT history",
      "Oil leaks, coolant seepage or age-related engine bay issues",
      "Electrical or sensor faults becoming more common as the vehicle ages",
    ];
  }

  if (cityCarsAndSuperminis.includes(normalizedModel)) {
    return [
      "Brake wear and tyre wear from stop-start town driving",
      "Suspension knocks or worn drop links on rough urban roads",
      "Clutch wear on hard-used manual examples",
      "Exhaust corrosion or minor oil leaks on older cars",
    ];
  }

  if (suvKeywords.includes(normalizedModel)) {
    return [
      "Suspension wear and alignment-related tyre wear on heavier vehicles",
      "Brake wear due to extra vehicle weight and family use",
      "Advisories around bushes, links and steering components",
      "General wear linked to towing, load carrying or mixed road use",
    ];
  }

  return [
    "Suspension wear or knocking noises as the vehicle ages",
    "Brake disc or brake pad wear appearing during MOT tests",
    "Oil leaks or damp engine components on older examples",
    "Exhaust, tyre or steering advisories building up over time",
  ];
}

function getRelatedModels(makeSlug: string, modelSlug: string): RelatedModel[] {
  return wave1Models
    .filter((item) => item.make_slug === makeSlug && item.model_slug !== modelSlug)
    .sort((a, b) => {
      const aPriority = a.priority_tier === 1 || a.launch_wave === 1 ? 0 : 1;
      const bPriority = b.priority_tier === 1 || b.launch_wave === 1 ? 0 : 1;

      if (aPriority !== bPriority) return aPriority - bPriority;

      return a.model.localeCompare(b.model);
    })
    .slice(0, 6)
    .map((item) => ({
      href: buildModelCommonProblemsPath(item.make_slug, item.model_slug),
      label: `${item.make} ${item.model} common problems`,
      description:
        "Compare another model from the same make before narrowing your shortlist.",
    }));
}

function getRelatedAdvisories(): RelatedAdvisory[] {
  return allMotAdvisoryTypes.slice(0, 6).map((item) => ({
    href: buildAdvisoryHubPath(item.advisory_slug),
    label: `${item.advisory_label} advisory meaning`,
    description:
      "Understand how this MOT advisory can affect used car buying risk.",
  }));
}

export async function generateStaticParams() {
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

  const path = buildModelCommonProblemsPath(make, model);
  const title = `${row.make} ${row.model} Common Problems | AutoAudit`;
  const description = `Browse common issues, recurring MOT advisories and repair-cost patterns for the ${row.make} ${row.model}.`;

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
          alt: `${row.make} ${row.model} common problems | AutoAudit`,
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

export default async function ModelCommonProblemsPage({ params }: Props) {
  const { make, model } = await params;
  const row = getModelByParams(make, model);

  if (!row) notFound();

  const issueBullets = getGenericIssueBullets(row.make, row.model);
  const relatedModels = getRelatedModels(row.make_slug, row.model_slug);
  const relatedAdvisories = getRelatedAdvisories();

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <HeroCtaTextPanel
        heroImageSrc="/hero-car-road.png"
        heroAlt={`${row.make} ${row.model} common problems`}
        title={`${row.make} ${row.model} Common Problems`}
        subtitle="Used car buyer guide"
        ctaComponent={
          <RegLookupCta
            title={`Check this ${row.make} ${row.model} before you buy`}
            subtitle="See MOT history, recurring advisories and hidden repair-cost risks for the exact car you’re considering."
            variant="light"
          />
        }
        bodyContent={
          <div className="space-y-3">
            <p>
              If you’re considering a used {row.make} {row.model}, understanding
              the most common faults and MOT warning signs can help you avoid
              expensive surprises.
            </p>
            <p>
              This guide highlights typical issues, repair-cost risks and
              patterns seen across MOT history — but the most important step is
              checking the exact car you’re about to buy.
            </p>
          </div>
        }
      />

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">
          Common {row.make} {row.model} problems
        </h2>

        <p className="text-slate-700">
          Like many used cars, the {row.make} {row.model} tends to develop
          certain patterns of wear and faults over time. These often show up
          first as MOT advisories before becoming more serious issues.
        </p>

        <ul className="list-disc pl-6 text-slate-700">
          {issueBullets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">What this means for buyers</h2>

        <p className="text-slate-700">
          A single issue is rarely a deal-breaker. The real risk comes from
          repeated advisories, multiple related faults or signs that maintenance
          has been delayed.
        </p>

        <p className="text-slate-700">
          When viewing a used {row.make} {row.model}, always compare the asking
          price with the condition, MOT history and whether these common issues
          have already been addressed.
        </p>
      </section>

      {relatedModels.length ? (
        <section className="mt-10 space-y-4">
          <h2 className="text-2xl font-semibold">
            Compare other {row.make} model guides
          </h2>
          <p className="text-slate-700">
            If you are still building a shortlist, compare the {row.make}{" "}
            {row.model} with other {row.make} models before checking the exact
            car by registration.
          </p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedModels.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl border p-4 transition hover:border-slate-400 hover:bg-slate-50"
              >
                <h3 className="font-medium">{item.label}</h3>
                <p className="mt-1 text-sm text-slate-600">
                  {item.description}
                </p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">Related MOT advisory guides</h2>
        <p className="text-slate-700">
          MOT advisories are often where early warning signs first appear. These
          guides help explain what common advisory wording can mean before you
          buy.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {relatedAdvisories.map((item) => (
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
        <h2 className="text-xl font-semibold">
          Ready to check a specific {row.make} {row.model}?
        </h2>
        <p className="mt-2 text-slate-700">
          Model guides are useful for research, but the exact registration tells
          you far more about the car in front of you. Use the checker above to
          review MOT history, advisory patterns and vehicle-specific risk.
        </p>
      </section>
    </div>
  );
}