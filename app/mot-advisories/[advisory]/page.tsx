import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  allMotAdvisoryTypes,
  getAdvisoryBySlug,
  highPriorityModels,
  wave1Models,
} from "@/lib/seo/data";
import {
  absoluteUrl,
  buildAdvisoryHubPath,
  buildModelCommonProblemsPath,
} from "@/lib/seo/routes";
import {
  articleSchema,
  breadcrumbSchema,
  faqSchema,
} from "@/lib/seo/schema";

type Props = {
  params: Promise<{
    advisory: string;
  }>;
};

type ModelGuideCard = {
  href: string;
  label: string;
  description: string;
};

type AdvisoryGuideCard = {
  href: string;
  label: string;
  description: string;
};

type RelatedRouteCard = {
  href: string;
  label: string;
  description: string;
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

function buildModelGuideCard(
  model: (typeof wave1Models)[number],
  description: string
): ModelGuideCard {
  return {
    href: buildModelCommonProblemsPath(model.make_slug, model.model_slug),
    label: `${model.make} ${model.model} common problems`,
    description,
  };
}

function buildAdvisoryGuideCard(
  advisory: (typeof allMotAdvisoryTypes)[number],
  description: string
): AdvisoryGuideCard {
  return {
    href: buildAdvisoryHubPath(advisory.advisory_slug),
    label: `${advisory.advisory_label} advisory meaning`,
    description,
  };
}

function matchesKeywords(
  advisory: (typeof allMotAdvisoryTypes)[number],
  keywords: string[]
) {
  const haystack = [
    advisory.advisory_label,
    advisory.advisory_slug,
    advisory.category,
    advisory.mot_section,
    advisory.notes || "",
  ]
    .join(" ")
    .toLowerCase();

  return keywords.some((keyword) => haystack.includes(keyword.toLowerCase()));
}

function getRelatedModelGuides(advisoryLabel: string) {
  const normalized = advisoryLabel.toLowerCase();
  const cards: ModelGuideCard[] = [];
  const usedFullSlugs = new Set<string>();

  const pushIfExists = (
    matcher: (row: (typeof highPriorityModels)[number]) => boolean,
    description: string
  ) => {
    const match = highPriorityModels.find(
      (row) => !usedFullSlugs.has(row.full_slug) && matcher(row)
    );

    if (!match) return;

    usedFullSlugs.add(match.full_slug);
    cards.push(buildModelGuideCard(match, description));
  };

  if (normalized.includes("brake")) {
    pushIfExists(
      (row) => row.make_slug === "ford" && row.model_slug === "fiesta",
      "A strong example of a high-volume used model where brake history matters"
    );
    pushIfExists(
      (row) => row.make_slug === "volkswagen" && row.model_slug === "golf",
      "Useful if you are comparing brake wear on a mainstream used hatchback"
    );
  }

  if (cards.length < 4) {
    for (const model of highPriorityModels) {
      if (usedFullSlugs.has(model.full_slug)) continue;

      usedFullSlugs.add(model.full_slug);
      cards.push(
        buildModelGuideCard(
          model,
          "Read the buyer guide and broader used-car warning signs"
        )
      );

      if (cards.length === 4) break;
    }
  }

  return cards;
}

function getRelatedAdvisoryGuides(currentAdvisorySlug: string) {
  const current = getAdvisoryBySlug(currentAdvisorySlug);
  if (!current) return [];

  const cards: AdvisoryGuideCard[] = [];
  const usedSlugs = new Set<string>([currentAdvisorySlug]);

  const pushFirstMatch = (keywords: string[], description: string) => {
    const match = allMotAdvisoryTypes.find(
      (advisory) =>
        !usedSlugs.has(advisory.advisory_slug) &&
        matchesKeywords(advisory, keywords)
    );

    if (!match) return;

    usedSlugs.add(match.advisory_slug);
    cards.push(buildAdvisoryGuideCard(match, description));
  };

  pushFirstMatch(["brake", "pad", "disc"], "Compare another brake-related advisory");
  pushFirstMatch(["oil", "leak", "engine"], "Compare engine-related warnings");
  pushFirstMatch(["suspension", "bush"], "Compare suspension-related wear");

  return cards;
}

function getRelatedRoutes(): RelatedRouteCard[] {
  return [
    {
      href: "/check-car-by-registration",
      label: "Check the exact car by registration",
      description:
        "Move from a generic advisory explanation to vehicle-specific risk checks",
    },
    {
      href: "/mot-advisories",
      label: "Browse more MOT advisory guides",
      description:
        "Compare other advisory meanings, likely repair impact and negotiation value",
    },
    {
      href: "/cars",
      label: "Compare model-specific car guides",
      description:
        "See how advisory warnings fit into wider used-car buying risk",
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

  const path = buildAdvisoryHubPath(advisory);

  return {
    title: `${row.advisory_label} MOT Advisory Meaning | AutoAudit`,
    description: `Understand what ${row.advisory_label} means on an MOT and why it matters.`,
    alternates: { canonical: absoluteUrl(path) },
  };
}

export default async function AdvisoryHubPage({ params }: Props) {
  const { advisory } = await params;
  const row = getAdvisoryBySlug(advisory);

  if (!row) notFound();

  const relatedModelGuides = getRelatedModelGuides(row.advisory_label);
  const primaryModel = relatedModelGuides[0];
  const secondaryModel = relatedModelGuides[1];

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">

      <h1 className="text-3xl font-bold">
        {row.advisory_label}: what it means
      </h1>

      <section className="mt-6 space-y-4">
        <h2 className="text-2xl font-semibold">Why this advisory matters</h2>

        <p className="text-slate-700">
          This type of MOT advisory is often seen on everyday used cars and can
          indicate developing wear or maintenance issues.
        </p>

        {primaryModel && (
          <p className="text-slate-700">
            For example, buyers often encounter this issue on cars like{" "}
            <Link href={primaryModel.href} className="font-medium underline">
              {primaryModel.label}
            </Link>
            {secondaryModel && (
              <>
                {" "}or{" "}
                <Link href={secondaryModel.href} className="font-medium underline">
                  {secondaryModel.label}
                </Link>
              </>
            )}
            . Looking at those model guides helps put this advisory into context.
          </p>
        )}
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">What buyers should do next</h2>
        <ul className="list-disc pl-6 text-slate-700">
          {getBuyerGuidance(row.advisory_label).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        {primaryModel && (
          <p className="text-slate-700">
            It can also help to compare this advisory against real-world examples
            in guides like{" "}
            <Link href={primaryModel.href} className="font-medium underline">
              {primaryModel.label}
            </Link>{" "}
            before deciding how serious it is.
          </p>
        )}
      </section>

    </div>
  );
}