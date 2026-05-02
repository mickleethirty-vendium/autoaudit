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

function getAdvisoryTheme(advisoryLabel: string) {
  const normalized = advisoryLabel.toLowerCase();

  if (
    normalized.includes("oil") ||
    normalized.includes("leak") ||
    normalized.includes("engine")
  ) {
    return "oil-leak";
  }

  if (
    normalized.includes("brake") ||
    normalized.includes("pad") ||
    normalized.includes("disc")
  ) {
    return "brakes";
  }

  if (
    normalized.includes("corrosion") ||
    normalized.includes("rust") ||
    normalized.includes("underseal") ||
    normalized.includes("underbody")
  ) {
    return "corrosion";
  }

  if (
    normalized.includes("tyre") ||
    normalized.includes("tire") ||
    normalized.includes("wheel") ||
    normalized.includes("alignment")
  ) {
    return "tyres";
  }

  if (
    normalized.includes("suspension") ||
    normalized.includes("bush") ||
    normalized.includes("shock") ||
    normalized.includes("spring") ||
    normalized.includes("strut")
  ) {
    return "suspension";
  }

  if (
    normalized.includes("exhaust") ||
    normalized.includes("emission") ||
    normalized.includes("silencer")
  ) {
    return "exhaust";
  }

  return "general";
}

function getPlainEnglishMeaning(advisoryLabel: string) {
  const theme = getAdvisoryTheme(advisoryLabel);

  if (theme === "oil-leak") {
    return "It usually means the tester has seen signs of oil, fluid seepage or engine-bay contamination. It may be minor, but repeated leak advisories can point to a developing repair bill.";
  }

  if (theme === "brakes") {
    return "It usually means part of the braking system is worn, close to needing replacement, corroded or showing reduced condition. Brake advisories are common, but they matter because repair costs can arrive quickly.";
  }

  if (theme === "corrosion") {
    return "It usually means rust, underbody deterioration or previous protection has been spotted. Minor surface corrosion may not be urgent, but structural corrosion can become expensive and safety-critical.";
  }

  if (theme === "tyres") {
    return "It usually means a tyre, wheel or alignment-related issue has been spotted. Uneven wear can point to tracking, suspension or usage problems, not just tyres needing replacement.";
  }

  if (theme === "suspension") {
    return "It usually means a suspension component is worn, deteriorated, knocking or close to needing replacement. Repeated suspension advisories can suggest the car has been run with deferred maintenance.";
  }

  if (theme === "exhaust") {
    return "It usually means the exhaust or emissions system is deteriorating, corroded, leaking or showing early signs of failure. Older used cars often pick this up before repair becomes unavoidable.";
  }

  return "It means the MOT tester has spotted a developing issue that was not serious enough to fail the test at that time, but still matters when judging the car’s condition and future repair risk.";
}

function getFailVsAdvisoryGuidance(advisoryLabel: string) {
  const theme = getAdvisoryTheme(advisoryLabel);

  if (theme === "oil-leak") {
    return {
      answer:
        "An oil leak does not always fail an MOT. It may be recorded as an advisory if it is minor, but it can become a fail if the leak is excessive, presents a safety risk, contaminates components or creates a serious environmental issue.",
      bullets: [
        "Minor dampness or seepage may appear as an advisory",
        "A significant active leak can become an MOT failure",
        "Repeat oil leak advisories suggest the issue may not have been fixed",
        "For buyers, the key question is whether the leak is minor, repaired or getting worse",
      ],
    };
  }

  if (theme === "brakes") {
    return {
      answer:
        "Brake wear may be an advisory if the parts are worn but still pass the minimum test standard. It can become a fail if braking performance, condition, imbalance or safety is below the required level.",
      bullets: [
        "Thin pads or worn discs may be advisory-level if still serviceable",
        "Poor brake performance, severe wear or unsafe condition can fail",
        "Repeat brake advisories often mean repair has been delayed",
        "Buyers should price in likely brake work if the advisory is unresolved",
      ],
    };
  }

  if (theme === "corrosion") {
    return {
      answer:
        "Corrosion may be advisory-level if it is not yet structurally serious. It can become an MOT failure if it affects prescribed structural areas, safety-critical mounting points or important components.",
      bullets: [
        "Surface corrosion may be recorded as an advisory",
        "Structural corrosion close to key mounting points can fail",
        "Underseal can sometimes hide the true condition underneath",
        "Repeat corrosion advisories deserve careful inspection before buying",
      ],
    };
  }

  if (theme === "tyres") {
    return {
      answer:
        "Tyre wear may be an advisory if the tyre is legal but wearing unevenly or approaching the limit. It can become a fail if tread depth, damage or condition falls below MOT requirements.",
      bullets: [
        "Uneven or inner-edge wear may point to alignment problems",
        "A tyre near the legal limit may pass but still need replacing soon",
        "Cuts, cords, bulges or illegal tread depth can fail",
        "Repeated tyre advisories may suggest suspension or tracking issues",
      ],
    };
  }

  if (theme === "suspension") {
    return {
      answer:
        "Suspension wear may be an advisory if the component is deteriorating but still functioning. It can become a fail if there is excessive play, serious damage, breakage or a safety-critical defect.",
      bullets: [
        "Minor wear or deterioration may be advisory-level",
        "Excessive play, broken springs or unsafe components can fail",
        "Suspension advisories often get worse if ignored",
        "Buyers should check for repeat notes, knocks and uneven tyre wear",
      ],
    };
  }

  if (theme === "exhaust") {
    return {
      answer:
        "Exhaust deterioration may be an advisory if corrosion or wear is present but the system is still secure and functional. It can become a fail if there is a serious leak, emissions problem or unsafe mounting.",
      bullets: [
        "Minor corrosion may be advisory-level",
        "Leaks, insecure mounting or emissions issues can fail",
        "Older cars can move quickly from advisory to repair needed",
        "Buyers should check whether the exhaust has already been repaired",
      ],
    };
  }

  return {
    answer:
      "An MOT advisory means the car passed at the time, but the tester spotted something worth monitoring. It can become a failure if the issue worsens, becomes unsafe or falls below MOT standards.",
    bullets: [
      "An advisory is not the same as a fail",
      "Repeat advisories can reveal a pattern of deferred maintenance",
      "Some issues become expensive if ignored",
      "The exact MOT history matters more than one isolated note",
    ],
  };
}

function getTypicalCostRisk(advisoryLabel: string) {
  const theme = getAdvisoryTheme(advisoryLabel);

  if (theme === "oil-leak") {
    return {
      level: "Medium to high",
      summary:
        "A minor seep may be cheap to monitor, but a proper leak diagnosis can uncover gasket, seal, sump, turbo or engine-related work. The risk rises when the same leak appears repeatedly.",
      bullets: [
        "Low risk: minor historic seepage with evidence of repair",
        "Medium risk: active leak with unclear source",
        "High risk: repeat leak advisories or visible oil contamination",
      ],
    };
  }

  if (theme === "brakes") {
    return {
      level: "Low to medium",
      summary:
        "Brake work is usually predictable, but costs rise if discs, pads, calipers, pipes or tyres are due together. It is also one of the easiest issues to use in negotiation.",
      bullets: [
        "Low risk: pads or discs already replaced",
        "Medium risk: multiple brake advisories still unresolved",
        "Higher risk: corrosion, imbalance or repeated brake system notes",
      ],
    };
  }

  if (theme === "corrosion") {
    return {
      level: "Medium to high",
      summary:
        "Corrosion can be minor or serious. The risk depends on where it is, whether it affects structural areas and whether underseal is hiding the real condition.",
      bullets: [
        "Low risk: light surface corrosion only",
        "Medium risk: repeat underbody corrosion advisories",
        "High risk: corrosion near structural or safety-critical areas",
      ],
    };
  }

  if (theme === "tyres") {
    return {
      level: "Low to medium",
      summary:
        "A tyre replacement may be straightforward, but uneven wear can point to tracking, suspension or accident-related issues. Repeated inner-edge wear is worth taking seriously.",
      bullets: [
        "Low risk: one tyre near replacement",
        "Medium risk: uneven wear across multiple MOTs",
        "Higher risk: tyre wear plus suspension or steering advisories",
      ],
    };
  }

  if (theme === "suspension") {
    return {
      level: "Medium",
      summary:
        "Suspension advisories are common on used cars, but costs can build if bushes, links, springs, shocks and alignment all need attention.",
      bullets: [
        "Low risk: single minor advisory with repair evidence",
        "Medium risk: repeat suspension notes",
        "Higher risk: suspension issues plus uneven tyre wear or steering notes",
      ],
    };
  }

  if (theme === "exhaust") {
    return {
      level: "Low to medium",
      summary:
        "Exhaust corrosion is common on older cars. Costs are usually manageable, but emissions-related or catalytic converter issues can become more expensive.",
      bullets: [
        "Low risk: minor corrosion only",
        "Medium risk: repeat exhaust deterioration notes",
        "Higher risk: exhaust issues linked to emissions warnings",
      ],
    };
  }

  return {
    level: "Depends on the exact wording",
    summary:
      "The cost risk depends on severity, whether the same issue appears repeatedly and whether the seller can prove it has been repaired.",
    bullets: [
      "Low risk: isolated advisory with evidence of repair",
      "Medium risk: repeated advisory with no invoice",
      "Higher risk: multiple related advisories across several MOTs",
    ],
  };
}

function getBuyerGuidance(advisoryLabel: string) {
  const theme = getAdvisoryTheme(advisoryLabel);

  if (theme === "brakes") {
    return [
      "Ask whether the brake parts mentioned have already been replaced.",
      "Check whether the issue appeared on more than one MOT.",
      "Factor likely brake work into your offer before buying.",
    ];
  }

  if (theme === "oil-leak") {
    return [
      "Ask the seller what was diagnosed and whether any repair invoice exists.",
      "Check for repeat advisories or signs the leak was ignored.",
      "Treat active leaks or unclear explanations as a negotiation point.",
    ];
  }

  if (theme === "suspension") {
    return [
      "Ask whether the worn suspension or steering parts have been changed.",
      "Look for repeat advisories that suggest long-term neglect.",
      "Budget for alignment and related follow-on work where relevant.",
    ];
  }

  if (theme === "corrosion") {
    return [
      "Ask whether the car has been inspected underneath, not just from above.",
      "Check whether corrosion appears repeatedly across MOT history.",
      "Be cautious where underseal may be hiding rather than solving the issue.",
    ];
  }

  if (theme === "tyres") {
    return [
      "Check whether tyre wear is even or concentrated on one edge.",
      "Ask whether tracking or suspension work has been carried out.",
      "Use worn tyres or uneven wear as a negotiation point.",
    ];
  }

  if (theme === "exhaust") {
    return [
      "Ask whether any exhaust sections have already been replaced.",
      "Check whether the advisory appears repeatedly across MOTs.",
      "Be more cautious if exhaust notes appear alongside emissions warnings.",
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

function getPriorityBuyerModels(advisoryLabel: string) {
  const theme = getAdvisoryTheme(advisoryLabel);
  const cards: ModelGuideCard[] = [];
  const usedFullSlugs = new Set<string>();

  const pushIfExists = (
    makeSlug: string,
    modelSlug: string,
    description: string
  ) => {
    const match = highPriorityModels.find(
      (row) =>
        !usedFullSlugs.has(row.full_slug) &&
        row.make_slug === makeSlug &&
        row.model_slug === modelSlug
    );

    if (!match) return;

    usedFullSlugs.add(match.full_slug);
    cards.push(buildModelGuideCard(match, description));
  };

  if (theme === "oil-leak") {
    pushIfExists(
      "audi",
      "a3",
      "Oil leak and engine-bay advisories can matter more on premium used cars"
    );
    pushIfExists(
      "toyota",
      "aygo",
      "A useful small-car comparison where repeat MOT patterns can affect value"
    );
    pushIfExists(
      "mercedes-benz",
      "a-class",
      "Helpful for comparing leak and maintenance risk on a used premium hatchback"
    );
    pushIfExists(
      "vauxhall",
      "insignia",
      "Useful when checking older used cars for leak, wear and repair-cost risk"
    );
  } else if (theme === "brakes") {
    pushIfExists(
      "ford",
      "fiesta",
      "A high-volume used model where brake advisories often affect buyer confidence"
    );
    pushIfExists(
      "volkswagen",
      "golf",
      "Useful if you are comparing brake wear on a mainstream used hatchback"
    );
    pushIfExists(
      "toyota",
      "aygo",
      "Town-driven small cars can show repeated brake and tyre wear"
    );
    pushIfExists(
      "citroen",
      "berlingo",
      "Useful for checking brake and load-related wear on practical used cars"
    );
  } else if (theme === "corrosion" || theme === "exhaust") {
    pushIfExists(
      "vauxhall",
      "insignia",
      "Useful when checking older used cars for underbody or exhaust deterioration"
    );
    pushIfExists(
      "ford",
      "fiesta",
      "A common used model where age-related MOT advisories can affect value"
    );
    pushIfExists(
      "citroen",
      "berlingo",
      "Helpful for practical vans and MPVs where underbody condition matters"
    );
    pushIfExists(
      "volkswagen",
      "golf",
      "Useful for comparing older mainstream cars with repeat MOT notes"
    );
  } else if (theme === "suspension" || theme === "tyres") {
    pushIfExists(
      "volkswagen",
      "golf",
      "Useful for comparing suspension, tyre and alignment-related warning signs"
    );
    pushIfExists(
      "audi",
      "a3",
      "Helpful when checking suspension and tyre wear on a popular used model"
    );
    pushIfExists(
      "ford",
      "fiesta",
      "Useful for town-driven cars where suspension and tyre wear can repeat"
    );
    pushIfExists(
      "citroen",
      "berlingo",
      "Helpful for heavier practical cars where suspension and tyre wear matter"
    );
  }

  if (cards.length < 6) {
    for (const model of highPriorityModels) {
      if (usedFullSlugs.has(model.full_slug)) continue;

      usedFullSlugs.add(model.full_slug);
      cards.push(
        buildModelGuideCard(
          model,
          "Read the buyer guide and broader used-car warning signs"
        )
      );

      if (cards.length === 6) break;
    }
  }

  return cards;
}

function getRelatedModelGuides(advisoryLabel: string) {
  return getPriorityBuyerModels(advisoryLabel).slice(0, 4);
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

  pushFirstMatch(
    ["oil", "leak", "engine"],
    "Compare engine, leak and fluid-related warning signs"
  );
  pushFirstMatch(
    ["brake", "pad", "disc"],
    "Compare another brake-related advisory"
  );
  pushFirstMatch(
    ["suspension", "bush", "shock", "spring"],
    "Compare suspension-related wear"
  );
  pushFirstMatch(
    ["tyre", "wheel", "alignment"],
    "Compare tyre wear and alignment-related warnings"
  );

  if (cards.length < 4) {
    for (const advisory of allMotAdvisoryTypes) {
      if (usedSlugs.has(advisory.advisory_slug)) continue;

      usedSlugs.add(advisory.advisory_slug);
      cards.push(
        buildAdvisoryGuideCard(
          advisory,
          "Read another MOT advisory meaning and buyer impact guide"
        )
      );

      if (cards.length === 4) break;
    }
  }

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
  const failVsAdvisory = getFailVsAdvisoryGuidance(row.advisory_label);
  const costRisk = getTypicalCostRisk(row.advisory_label);
  const buyerGuidance = getBuyerGuidance(row.advisory_label);
  const plainEnglishMeaning = getPlainEnglishMeaning(row.advisory_label);
  const priorityBuyerModels = getPriorityBuyerModels(row.advisory_label);
  const relatedModelGuides = getRelatedModelGuides(row.advisory_label);
  const relatedAdvisoryGuides = getRelatedAdvisoryGuides(row.advisory_slug);
  const relatedRoutes = getRelatedRoutes();
  const primaryModel = relatedModelGuides[0];
  const secondaryModel = relatedModelGuides[1];

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
        "It depends on whether the issue was repaired, whether it appears repeatedly and whether the asking price reflects the risk. A single historic advisory is less worrying than repeated unresolved notes.",
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

      <section className="overflow-hidden rounded-3xl border bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-2">
          <div className="relative min-h-[240px] lg:min-h-full">
            <Image
              src="/hero-car-road.png"
              alt={`${row.advisory_label} MOT advisory meaning`}
              fill
              priority
              className="object-cover"
            />
          </div>

          <div className="p-5 sm:p-6 lg:p-7">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              MOT advisory guide
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              {row.advisory_label}: MOT advisory meaning
            </h1>

            <p className="mt-3 text-base text-slate-700">
              Understand what this MOT advisory means, whether it could become a
              fail, how serious it is for a used-car buyer and what to check
              before money changes hands.
            </p>

            <div className="mt-4 rounded-2xl border-2 border-slate-900 bg-slate-50 p-4">
              <h2 className="text-lg font-semibold sm:text-xl">
                Check the exact car behind this advisory
              </h2>
              <p className="mt-2 text-sm text-slate-700 sm:text-base">
                One advisory does not tell the full story. Run the registration
                to see the wider MOT pattern, repair risk and pricing context.
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

      <section className="mt-6 rounded-2xl border bg-slate-50 p-5">
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

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">What it means mechanically</h2>
        <p className="text-slate-700">
          MOT advisories are often early warning signs. The car passed at the
          time of the test, but the tester saw something that may need
          monitoring, repair or further investigation.
        </p>
        <p className="text-slate-700">
          For this advisory, the risk depends on severity, whether related items
          appear elsewhere in the MOT history and whether there is evidence that
          the issue was repaired properly after the test.
        </p>

        {primaryModel ? (
          <p className="text-slate-700">
            Buyers often see advisories like this while researching used cars
            such as{" "}
            <Link
              href={primaryModel.href}
              className="font-medium underline underline-offset-2"
            >
              {primaryModel.label}
            </Link>
            {secondaryModel ? (
              <>
                {" "}
                or{" "}
                <Link
                  href={secondaryModel.href}
                  className="font-medium underline underline-offset-2"
                >
                  {secondaryModel.label}
                </Link>
              </>
            ) : null}
            . Model-specific guides help put the advisory into wider buying
            context.
          </p>
        ) : null}
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
          This warning can appear across many used cars, but it is especially
          useful to compare it against model-specific buying guides where MOT
          patterns, repair risk and value concerns come together.
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
        <h2 className="text-2xl font-semibold">What buyers should do next</h2>
        <p className="text-slate-700">
          Treat this advisory as one data point. Check whether the same warning
          appears across multiple MOT tests, whether related advisories appear
          nearby and whether the seller has evidence of repair.
        </p>
        <p className="text-slate-700">
          If the issue is unresolved, use it as a negotiation point before
          purchase rather than discovering the cost after you own the car.
        </p>
      </section>

      <section className="mt-10 rounded-3xl border bg-slate-900 p-6 text-white">
        <h2 className="text-2xl font-semibold">
          Looking at a car with this advisory?
        </h2>
        <p className="mt-3 max-w-2xl text-slate-200">
          Enter the registration to see whether the car has repeat advisories,
          pricing risk or signs that this issue is part of a wider maintenance
          pattern.
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
        <h2 className="text-2xl font-semibold">Related model guides</h2>
        <p className="text-slate-700">
          Compare this advisory with model-specific buying guides to understand
          how MOT warnings fit into wider used-car risk.
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

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">Related MOT advisory guides</h2>
        <p className="text-slate-700">
          These guides help explain other warning signs that often appear in MOT
          histories before a used car becomes expensive.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
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
        <h2 className="text-2xl font-semibold">Related buyer checks</h2>
        <p className="mt-3 text-slate-700">
          Use the advisory explanation, model guides and registration check
          together. That gives you a stronger view of whether the warning is a
          small maintenance note or part of a larger buying risk.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {relatedRoutes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className="rounded-xl border border-slate-300 bg-white p-4 transition hover:border-slate-400 hover:bg-slate-100"
            >
              <h3 className="text-sm font-semibold text-slate-900">
                {route.label}
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                {route.description}
              </p>
            </Link>
          ))}
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