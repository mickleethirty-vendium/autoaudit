import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
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
import {
  articleSchema,
  breadcrumbSchema,
  faqSchema,
} from "@/lib/seo/schema";

type Props = {
  params: Promise<{
    make: string;
    model: string;
  }>;
};

type AdvisoryGuideCard = {
  href: string;
  label: string;
  description: string;
};

type RelatedModelGuideCard = {
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

function getBuyerSummary(make: string, model: string) {
  return `The ${make} ${model} can be a sensible used buy, but condition matters far more than badge reputation alone. A clean MOT record, consistent maintenance and sensible pricing are usually stronger buying signals than general forum chatter or seller claims.`;
}

function getNegotiationPoints(make: string, model: string) {
  return [
    `Ask whether the ${make} ${model} has had any recent brake, tyre or suspension work.`,
    "Check whether repeated MOT advisories point to a pattern rather than a one-off repair.",
    "Compare the asking price with condition, mileage and visible maintenance evidence.",
    "Use unresolved advisories or warning signs as a negotiation lever before purchase.",
  ];
}

function getUsedBuyerVerdict(make: string, model: string) {
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
    return {
      summary: `A used ${make} ${model} can be a strong buy if it has clear maintenance history and a sensible asking price, but neglected premium cars can become expensive quickly.`,
      bullets: [
        "Favour cars with evidence of servicing, brake work and suspension upkeep",
        "Be more cautious where there are repeat MOT advisories or electrical warnings",
        "Budget-sensitive buyers should be careful with cheap examples that look under-maintained",
      ],
    };
  }

  if (cityCarsAndSuperminis.includes(normalizedModel)) {
    return {
      summary: `A used ${make} ${model} often makes sense as a practical buy, especially if the MOT history is clean and consumable items have been looked after.`,
      bullets: [
        "Usually a safer buy where tyres, brakes and clutch condition all look consistent",
        "Be cautious of heavily town-driven examples with repeated brake, tyre or suspension notes",
        "Small used cars can still become poor value if the price does not reflect upcoming maintenance",
      ],
    };
  }

  if (suvKeywords.includes(normalizedModel)) {
    return {
      summary: `A used ${make} ${model} can be a good family buy, but heavier vehicles tend to hide more expensive brake, tyre and suspension costs if maintenance has been delayed.`,
      bullets: [
        "Check for repeat suspension, alignment and steering-related advisories",
        "Make sure the asking price reflects tyre, brake and servicing condition",
        "Load carrying, towing and mixed use can make the exact vehicle history especially important",
      ],
    };
  }

  return {
    summary: `A used ${make} ${model} can still be a sensible purchase if the exact car shows a clean pattern of maintenance, sensible mileage and no obvious unresolved warning signs.`,
    bullets: [
      "A tidy MOT history is usually a better signal than reputation alone",
      "Repeated advisories matter more than one isolated note",
      "Always compare condition and maintenance evidence with the asking price",
    ],
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

function buildAdvisoryCard(
  advisory: (typeof allMotAdvisoryTypes)[number],
  description: string
): AdvisoryGuideCard {
  return {
    href: buildAdvisoryHubPath(advisory.advisory_slug),
    label: `${advisory.advisory_label} advisory meaning`,
    description,
  };
}

function getRelatedAdvisoryGuides(make: string, model: string) {
  const normalizedMake = make.toLowerCase();
  const normalizedModel = model.toLowerCase();

  const cards: AdvisoryGuideCard[] = [];
  const usedSlugs = new Set<string>();

  const pushFirstMatch = (keywords: string[], description: string) => {
    const match = allMotAdvisoryTypes.find(
      (advisory) =>
        !usedSlugs.has(advisory.advisory_slug) &&
        matchesKeywords(advisory, keywords)
    );

    if (!match) return;

    usedSlugs.add(match.advisory_slug);
    cards.push(buildAdvisoryCard(match, description));
  };

  if (["audi", "bmw", "mercedes-benz", "mercedes"].includes(normalizedMake)) {
    pushFirstMatch(
      ["oil", "leak", "engine"],
      "Useful where engine bay seepage or leaks can become costly"
    );
    pushFirstMatch(
      ["brake", "disc", "pad"],
      "Brake advisories are common and can affect negotiation"
    );
    pushFirstMatch(
      ["suspension", "bush", "shock", "strut"],
      "Helpful for spotting age and mileage-related wear"
    );
    pushFirstMatch(
      ["electrical", "lamp", "wiring", "battery"],
      "Understand what electrical warnings can imply"
    );
  } else if (
    ["a1", "a3", "fiesta", "corsa", "polo", "yaris", "micra", "aygo"].includes(
      normalizedModel
    )
  ) {
    pushFirstMatch(
      ["brake", "disc", "pad"],
      "Town-driven cars often pick up repeated brake-related notes"
    );
    pushFirstMatch(
      ["tyre", "wheel", "alignment"],
      "Helpful for spotting alignment or usage issues"
    );
    pushFirstMatch(
      ["suspension", "drop link", "bush", "shock"],
      "Useful for knocks, links and worn suspension components"
    );
    pushFirstMatch(
      ["exhaust", "corrosion", "emission"],
      "Common on older cars and worth checking before purchase"
    );
  } else if (
    [
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
    ].includes(normalizedModel)
  ) {
    pushFirstMatch(
      ["suspension", "bush", "shock", "strut"],
      "Heavier family cars often show suspension-related wear"
    );
    pushFirstMatch(
      ["tyre", "wheel", "alignment"],
      "Useful for spotting alignment and load-related wear"
    );
    pushFirstMatch(
      ["brake", "disc", "pad"],
      "Brake work can be more expensive on larger vehicles"
    );
    pushFirstMatch(
      ["steering", "joint", "rack", "track rod"],
      "Check for bushes, joints and steering-related wear"
    );
  } else {
    pushFirstMatch(
      ["brake", "disc", "pad"],
      "Understand how brake-related advisories affect buying risk"
    );
    pushFirstMatch(
      ["oil", "leak", "engine"],
      "See why oil and engine-related warnings matter before you buy"
    );
    pushFirstMatch(
      ["suspension", "bush", "shock", "strut"],
      "Check what suspension-related advisories usually signal"
    );
    pushFirstMatch(
      ["steering", "joint", "rack", "track rod"],
      "Learn what steering-related advisories can mean for safety"
    );
  }

  if (cards.length < 4) {
    for (const advisory of allMotAdvisoryTypes) {
      if (usedSlugs.has(advisory.advisory_slug)) continue;

      usedSlugs.add(advisory.advisory_slug);
      cards.push(
        buildAdvisoryCard(
          advisory,
          "Read the broader meaning and buyer impact of this advisory"
        )
      );

      if (cards.length === 4) break;
    }
  }

  return cards;
}

function getRelatedModelGuides(
  currentMakeSlug: string,
  currentModelSlug: string
): RelatedModelGuideCard[] {
  const sameMake = wave1Models.filter(
    (item) =>
      item.make_slug === currentMakeSlug &&
      item.model_slug !== currentModelSlug &&
      (item.priority_tier === 1 || item.launch_wave === 1)
  );

  const fallback = wave1Models.filter(
    (item) =>
      !(item.make_slug === currentMakeSlug &&
        item.model_slug === currentModelSlug) &&
      (item.priority_tier === 1 || item.launch_wave === 1)
  );

  const selected = [...sameMake, ...fallback].slice(0, 4);

  return selected.map((item) => ({
    href: buildModelCommonProblemsPath(item.make_slug, item.model_slug),
    label: `${item.make} ${item.model} common problems`,
    description:
      item.make_slug === currentMakeSlug
        ? `See how other used ${item.make} models compare on common issues and buyer risk`
        : `Compare this guide with another popular used car problem page`,
  }));
}

export async function generateStaticParams() {
  const { wave1Models } = await import("@/lib/seo/data");

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

  const title = `${row.make} ${row.model} Common Problems – What to Check Before Buying Used | AutoAudit`;
  const description = `Read common problems, reliability pointers and used buyer warning signs for the ${row.make} ${row.model}, then check a specific car by registration.`;
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
  const issueBullets = getGenericIssueBullets(row.make, row.model);
  const buyerSummary = getBuyerSummary(row.make, row.model);
  const negotiationPoints = getNegotiationPoints(row.make, row.model);
  const relatedAdvisoryGuides = getRelatedAdvisoryGuides(row.make, row.model);
  const relatedModelGuides = getRelatedModelGuides(
    row.make_slug,
    row.model_slug
  );
  const usedBuyerVerdict = getUsedBuyerVerdict(row.make, row.model);

  const faqs = [
    {
      question: `Is the ${row.make} ${row.model} reliable?`,
      answer: `Reliability depends on age, maintenance history, mileage and MOT pattern. A well-maintained ${row.make} ${row.model} can be a better buy than a neglected example with a stronger reputation on paper.`,
    },
    {
      question: `Should I check a ${row.make} ${row.model} by registration?`,
      answer: `Yes. A registration check lets you inspect the history of the exact car you are considering, including MOT patterns, pricing context and repair risk indicators.`,
    },
    {
      question: `What should I look for when buying a used ${row.make} ${row.model}?`,
      answer: `Focus on MOT history, repeat advisories, maintenance evidence, tyre and brake condition, signs of leaks and whether the asking price reflects the car's condition and history.`,
    },
    {
      question: `Should I buy a used ${row.make} ${row.model}?`,
      answer: `That depends on the exact car rather than the model name alone. A used ${row.make} ${row.model} with a clean MOT pattern, sensible maintenance evidence and realistic pricing can be a much better buy than a cheaper example with repeated warnings or unresolved advisories.`,
    },
  ];

  const breadcrumbs = breadcrumbSchema([
    { name: "Home", item: "/" },
    { name: "Cars", item: "/cars" },
    { name: `${row.make} ${row.model}`, item: path },
  ]);

  const article = articleSchema({
    headline: `${row.make} ${row.model} Common Problems – What to Check Before Buying Used`,
    description: `Common problems, reliability pointers and buyer guidance for the ${row.make} ${row.model}.`,
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
        <Link href="/cars" className="transition hover:text-slate-900">
          Cars
        </Link>
        <span>/</span>
        <span className="text-slate-900">
          {row.make} {row.model} common problems
        </span>
      </nav>

      <section className="overflow-hidden rounded-3xl border bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-2">
          <div className="relative min-h-[260px] lg:min-h-full">
            <Image
              src="/hero-car-road.png"
              alt={`${row.make} ${row.model} used car buying guide`}
              fill
              priority
              className="object-cover"
            />
          </div>

          <div className="p-5 sm:p-6 lg:p-7">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {row.make} {row.model} Common Problems
            </h1>

            <p className="mt-3 text-base text-slate-700">
              Research the common problems, ownership risks and used-car warning
              signs for the {row.make} {row.model}, then check the exact car by
              registration before you commit.
            </p>

            <div className="mt-4 rounded-2xl border-2 border-slate-900 bg-slate-50 p-4">
              <h2 className="text-lg font-semibold sm:text-xl">
                Check a specific used {row.make} {row.model} now
              </h2>
              <p className="mt-2 text-sm text-slate-700 sm:text-base">
                General model advice is useful, but the real question is whether
                the exact used car you are viewing looks like a risk.
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
          Browse more used car research
        </h2>
        <p className="mt-2 text-sm text-slate-700">
          Explore other model problem guides, MOT advisory explainers, or run a
          registration check on the exact car you are considering.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/cars"
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:border-slate-400 hover:bg-slate-100"
          >
            Browse all car guides
          </Link>
          <Link
            href="/mot-advisories"
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:border-slate-400 hover:bg-slate-100"
          >
            Browse MOT advisory guides
          </Link>
          <Link
            href="/check-car-by-registration"
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:border-slate-400 hover:bg-slate-100"
          >
            Check a car by registration
          </Link>
        </div>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">
          Why people land on this page
        </h2>
        <p className="text-slate-700">
          Most buyers searching for {row.make} {row.model} common problems are
          already looking at a specific used car and want to know whether it is
          likely to become expensive, troublesome or overpriced. This page helps
          you spot the usual warning signs before you buy.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">
          Common issues seen on the {row.make} {row.model}
        </h2>
        <p className="text-slate-700">
          Like many used cars, the {row.make} {row.model} can develop age and
          mileage-related faults over time. These often show up first as MOT
          advisories, repeat maintenance items or negotiation points during a
          viewing.
        </p>
        <ul className="list-disc pl-6 text-slate-700">
          {issueBullets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="text-slate-700">
          That does not mean every {row.make} {row.model} is risky. It means the
          exact vehicle history matters much more than the badge alone.
        </p>
        <p className="text-slate-700">
          These issues can show up on used hatchbacks, estates, saloons and SUVs
          alike. Body style matters far less than maintenance history, mileage
          and how the exact car has been looked after.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">Buyer summary</h2>
        <p className="text-slate-700">{buyerSummary}</p>
        <p className="text-slate-700">
          The best used examples are usually the ones with steady servicing,
          clean MOT patterns and an asking price that makes sense against age,
          mileage and condition.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">
          Should you buy a used {row.make} {row.model}?
        </h2>
        <p className="text-slate-700">{usedBuyerVerdict.summary}</p>
        <ul className="list-disc pl-6 text-slate-700">
          {usedBuyerVerdict.bullets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="text-slate-700">
          In practice, most buyers are better off judging the exact used{" "}
          {row.make} {row.model} in front of them rather than relying on generic
          reputation alone. Clean history and sensible maintenance usually
          matter more than forum noise.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">What to check before buying</h2>
        <ul className="list-disc pl-6 text-slate-700">
          {negotiationPoints.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">Related MOT advisory guides</h2>
        <p className="text-slate-700">
          These advisory guides help explain the kinds of warning signs buyers
          often see alongside common ownership issues on used {row.make}{" "}
          {row.model} examples.
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

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">Related model guides</h2>
        <p className="text-slate-700">
          Compare this guide with other popular model pages to build a better
          view of used car risk, ownership patterns and common buyer concerns.
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
          Looking at one right now? Run the registration check.
        </h2>
        <p className="mt-3 max-w-2xl text-slate-200">
          A used {row.make} {row.model} guide can only take you so far. Enter
          the registration to see whether the exact {row.make} {row.model} you
          are considering shows MOT warning signs, price risk or likely repair
          exposure.
        </p>

        <form
          action="/check"
          method="GET"
          className="mt-5 flex flex-col gap-3 sm:flex-row"
        >
          <input
            type="text"
            name="registration"
            placeholder={`Enter ${row.make} ${row.model} registration`}
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
        <h2 className="text-2xl font-semibold">
          Why a registration check helps more
        </h2>
        <p className="text-slate-700">
          General reliability guides are useful, but they cannot tell you
          whether a specific car has repeated advisories, suspicious gaps,
          pricing risk or signs of neglected maintenance. That is where an
          AutoAudit check becomes more useful than a generic article.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">Related checks</h2>
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