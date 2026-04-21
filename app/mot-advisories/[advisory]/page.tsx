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
    pushIfExists(
      (row) => row.make_slug === "bmw" && row.model_slug === "3-series",
      "See broader ownership risks and negotiation points"
    );
    pushIfExists(
      (row) => row.make_slug === "vauxhall" && row.model_slug === "corsa",
      "Helpful for buyers checking common brake-related warnings on everyday cars"
    );
  } else if (
    normalized.includes("oil") ||
    normalized.includes("leak") ||
    normalized.includes("engine")
  ) {
    pushIfExists(
      (row) => row.make_slug === "bmw" && row.model_slug === "3-series",
      "Useful when checking engine bay issues and ownership risk"
    );
    pushIfExists(
      (row) => row.make_slug === "audi" && row.model_slug === "a3",
      "Read the broader used buying guide for a high-volume premium model"
    );
    pushIfExists(
      (row) => row.make_slug === "volkswagen" && row.model_slug === "golf",
      "Helpful for comparing leak-related warnings on a popular used hatchback"
    );
    pushIfExists(
      (row) => row.make_slug === "ford" && row.model_slug === "focus",
      "A useful benchmark for common used-car engine warning signs"
    );
  } else if (
    normalized.includes("suspension") ||
    normalized.includes("steering") ||
    normalized.includes("bush") ||
    normalized.includes("shock")
  ) {
    pushIfExists(
      (row) => row.make_slug === "ford" && row.model_slug === "fiesta",
      "Suspension and wear-related issues are common on urban-driven examples"
    );
    pushIfExists(
      (row) => row.make_slug === "nissan" && row.model_slug === "qashqai",
      "Useful if you are comparing advisory patterns on a popular family car"
    );
    pushIfExists(
      (row) => row.make_slug === "kia" && row.model_slug === "sportage",
      "Helpful for broader context on wear, mileage and repair exposure"
    );
    pushIfExists(
      (row) => row.make_slug === "volkswagen" && row.model_slug === "golf",
      "Read the wider buyer guide for a common used model"
    );
  } else if (
    normalized.includes("tyre") ||
    normalized.includes("wheel") ||
    normalized.includes("alignment")
  ) {
    pushIfExists(
      (row) => row.make_slug === "vauxhall" && row.model_slug === "corsa",
      "Tyre wear and alignment issues often matter on hard-used everyday cars"
    );
    pushIfExists(
      (row) => row.make_slug === "ford" && row.model_slug === "focus",
      "Useful for comparing broader wear patterns on a popular hatchback"
    );
    pushIfExists(
      (row) => row.make_slug === "nissan" && row.model_slug === "qashqai",
      "Helpful where larger vehicles may show tyre and alignment-related wear"
    );
    pushIfExists(
      (row) => row.make_slug === "volkswagen" && row.model_slug === "polo",
      "A good comparison point for common smaller-car buying risks"
    );
  } else {
    pushIfExists(
      (row) => row.make_slug === "volkswagen" && row.model_slug === "golf",
      "See the wider used buying guide for a mainstream high-volume model"
    );
    pushIfExists(
      (row) => row.make_slug === "ford" && row.model_slug === "fiesta",
      "A useful benchmark for common used-car buying risks"
    );
    pushIfExists(
      (row) => row.make_slug === "bmw" && row.model_slug === "3-series",
      "Helpful for understanding ownership risk on a popular used model"
    );
    pushIfExists(
      (row) => row.make_slug === "nissan" && row.model_slug === "qashqai",
      "Useful if you are comparing broader family-car warning signs"
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

  const normalized = current.advisory_label.toLowerCase();

  if (normalized.includes("brake")) {
    pushFirstMatch(
      ["brake", "pad", "disc"],
      "Compare another brake-related advisory and its likely buyer impact"
    );
    pushFirstMatch(
      ["tyre", "wheel", "alignment"],
      "Tyre and brake wear often appear together on used cars"
    );
    pushFirstMatch(
      ["suspension", "bush", "shock", "strut"],
      "Suspension wear can sit alongside repeated braking and handling issues"
    );
    pushFirstMatch(
      ["steering", "joint", "rack", "track rod"],
      "Steering-related wear can affect safety, feel and negotiation"
    );
  } else if (
    normalized.includes("oil") ||
    normalized.includes("leak") ||
    normalized.includes("engine")
  ) {
    pushFirstMatch(
      ["oil", "leak", "engine"],
      "Compare another engine or leak-related warning sign"
    );
    pushFirstMatch(
      ["emission", "exhaust"],
      "Engine issues can sometimes sit alongside exhaust or emissions warnings"
    );
    pushFirstMatch(
      ["brake", "pad", "disc"],
      "See another common advisory buyers often compare during research"
    );
    pushFirstMatch(
      ["suspension", "bush", "shock", "strut"],
      "Check another common wear-related advisory for context"
    );
  } else if (
    normalized.includes("suspension") ||
    normalized.includes("steering") ||
    normalized.includes("bush") ||
    normalized.includes("shock")
  ) {
    pushFirstMatch(
      ["suspension", "bush", "shock", "strut"],
      "Compare another suspension-related advisory"
    );
    pushFirstMatch(
      ["steering", "joint", "rack", "track rod"],
      "Steering and suspension wear often overlap in buyer research"
    );
    pushFirstMatch(
      ["tyre", "wheel", "alignment"],
      "Alignment and tyre wear can be linked to suspension condition"
    );
    pushFirstMatch(
      ["brake", "pad", "disc"],
      "Brake and handling issues are often reviewed together"
    );
  } else if (
    normalized.includes("tyre") ||
    normalized.includes("wheel") ||
    normalized.includes("alignment")
  ) {
    pushFirstMatch(
      ["tyre", "wheel", "alignment"],
      "Compare another tyre or alignment-related advisory"
    );
    pushFirstMatch(
      ["suspension", "bush", "shock", "strut"],
      "Suspension wear can contribute to abnormal tyre wear"
    );
    pushFirstMatch(
      ["steering", "joint", "rack", "track rod"],
      "Steering condition often affects tyre wear and road feel"
    );
    pushFirstMatch(
      ["brake", "pad", "disc"],
      "Brake wear is another common cost item buyers often compare"
    );
  }

  if (cards.length < 4) {
    for (const advisory of allMotAdvisoryTypes) {
      if (usedSlugs.has(advisory.advisory_slug)) continue;

      usedSlugs.add(advisory.advisory_slug);
      cards.push(
        buildAdvisoryGuideCard(
          advisory,
          "Read another MOT advisory guide and compare the likely buyer impact"
        )
      );

      if (cards.length === 4) break;
    }
  }

  return cards;
}

function getRelatedRoutes(advisoryLabel: string): RelatedRouteCard[] {
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
        "See how advisory warnings fit into wider used-car buying risk on popular models",
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

  if (!row) {
    return {
      title: "Not found | AutoAudit",
    };
  }

  const title = `${row.advisory_label} MOT Advisory Meaning | AutoAudit`;
  const description = `Understand what ${row.advisory_label} means on an MOT, why it matters, likely repair impact and how to check the exact car by registration.`;
  const path = buildAdvisoryHubPath(advisory);
  const canonicalUrl = absoluteUrl(path);

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
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
  const buyerGuidance = getBuyerGuidance(row.advisory_label);
  const relatedModelGuides = getRelatedModelGuides(row.advisory_label);
  const relatedAdvisoryGuides = getRelatedAdvisoryGuides(row.advisory_slug);
  const relatedRoutes = getRelatedRoutes(row.advisory_label);

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
        <Link href="/mot-advisories" className="transition hover:text-slate-900">
          MOT advisories
        </Link>
        <span>/</span>
        <span className="text-slate-900">{row.advisory_label}</span>
      </nav>

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

      <section className="mt-6 rounded-2xl border bg-slate-50 p-4">
        <h2 className="text-lg font-semibold text-slate-900">
          Continue your used car research
        </h2>
        <p className="mt-2 text-sm text-slate-700">
          Use this advisory page as one step in the buying journey: understand
          the warning, compare model guides, then run a registration check on
          the exact car.
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
        <h2 className="text-2xl font-semibold">Why people land on this page</h2>
        <p className="text-slate-700">
          Most buyers search an MOT advisory after spotting it on a listing, an
          MOT history report or a seller screenshot. The real question is not
          just what the advisory means in theory, but whether the exact car you
          are considering looks like a maintenance risk.
        </p>
        <p className="text-slate-700">
          The next sensible step is usually to compare this warning with other{" "}
          <Link
            href="/mot-advisories"
            className="font-medium underline underline-offset-2"
          >
            MOT advisory guides
          </Link>{" "}
          and then move on to a{" "}
          <Link
            href="/check-car-by-registration"
            className="font-medium underline underline-offset-2"
          >
            registration-based check
          </Link>{" "}
          on the specific vehicle.
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

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">Related advisory guides</h2>
        <p className="text-slate-700">
          Browse other advisory explainers to compare likely causes, buyer risk
          and what different MOT warning signs can mean in practice.
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
        <h2 className="text-2xl font-semibold">Buyer research path</h2>
        <p className="text-slate-700">
          A sensible used car buying journey is usually: understand the MOT
          warning, compare likely model-level risks, then run a registration
          check on the exact vehicle before relying on seller reassurance alone.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <Link
            href="/mot-advisories"
            className="rounded-xl border p-4 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <h3 className="font-medium">Compare advisory meanings</h3>
            <p className="mt-1 text-sm text-slate-600">
              Read more MOT warning guides before deciding how serious this looks
            </p>
          </Link>
          <Link
            href="/cars"
            className="rounded-xl border p-4 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <h3 className="font-medium">Compare model problem guides</h3>
            <p className="mt-1 text-sm text-slate-600">
              See how advisory warnings connect with broader ownership risks
            </p>
          </Link>
          <Link
            href="/check-car-by-registration"
            className="rounded-xl border p-4 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <h3 className="font-medium">Check the exact car</h3>
            <p className="mt-1 text-sm text-slate-600">
              Move from generic explanation to vehicle-specific risk checks
            </p>
          </Link>
        </div>
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
    </div>
  );
}