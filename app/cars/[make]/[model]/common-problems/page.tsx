import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
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

function getRelatedAdvisoryGuides(make: string, model: string) {
  const normalizedMake = make.toLowerCase();
  const normalizedModel = model.toLowerCase();

  const defaultGuides = [
    {
      href: "/mot-advisories/brake-wear",
      label: "Brake wear advisory meaning",
      description: "Understand how brake-related advisories affect buying risk",
    },
    {
      href: "/mot-advisories/oil-leak",
      label: "Oil leak advisory meaning",
      description: "See why oil leaks matter before you buy a used car",
    },
    {
      href: "/mot-advisories/suspension-wear",
      label: "Suspension wear advisory meaning",
      description: "Check what suspension-related advisories usually signal",
    },
    {
      href: "/mot-advisories/steering-component-wear",
      label: "Steering advisory meaning",
      description: "Learn what steering-related advisories can mean for safety",
    },
  ];

  if (["audi", "bmw", "mercedes-benz", "mercedes"].includes(normalizedMake)) {
    return [
      {
        href: "/mot-advisories/oil-leak",
        label: "Oil leak advisory meaning",
        description: "Useful where engine bay seepage or leaks can become costly",
      },
      {
        href: "/mot-advisories/brake-wear",
        label: "Brake wear advisory meaning",
        description: "Brake advisories are common and can affect negotiation",
      },
      {
        href: "/mot-advisories/suspension-wear",
        label: "Suspension wear advisory meaning",
        description: "Helpful for spotting age and mileage-related wear",
      },
      {
        href: "/mot-advisories/electrical-fault",
        label: "Electrical fault advisory meaning",
        description: "Understand what electrical warnings can imply",
      },
    ];
  }

  if (
    ["a1", "a3", "fiesta", "corsa", "polo", "yaris", "micra"].includes(
      normalizedModel
    )
  ) {
    return [
      {
        href: "/mot-advisories/brake-wear",
        label: "Brake wear advisory meaning",
        description: "Town-driven cars often pick up repeated brake-related notes",
      },
      {
        href: "/mot-advisories/tyre-wear",
        label: "Tyre wear advisory meaning",
        description: "Helpful for spotting alignment or usage issues",
      },
      {
        href: "/mot-advisories/suspension-wear",
        label: "Suspension wear advisory meaning",
        description: "Useful for knocks, links and worn suspension components",
      },
      {
        href: "/mot-advisories/exhaust-corrosion",
        label: "Exhaust corrosion advisory meaning",
        description: "Common on older cars and worth checking before purchase",
      },
    ];
  }

  if (
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
    return [
      {
        href: "/mot-advisories/suspension-wear",
        label: "Suspension wear advisory meaning",
        description: "Heavier family cars often show suspension-related wear",
      },
      {
        href: "/mot-advisories/tyre-wear",
        label: "Tyre wear advisory meaning",
        description: "Useful for spotting alignment and load-related wear",
      },
      {
        href: "/mot-advisories/brake-wear",
        label: "Brake wear advisory meaning",
        description: "Brake work can be more expensive on larger vehicles",
      },
      {
        href: "/mot-advisories/steering-component-wear",
        label: "Steering advisory meaning",
        description: "Check for bushes, joints and steering-related wear",
      },
    ];
  }

  return defaultGuides;
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
  const issueBullets = getGenericIssueBullets(row.make, row.model);
  const buyerSummary = getBuyerSummary(row.make, row.model);
  const negotiationPoints = getNegotiationPoints(row.make, row.model);
  const relatedAdvisoryGuides = getRelatedAdvisoryGuides(row.make, row.model);

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
              Research the common problems, ownership risks and buying warning
              signs for the {row.make} {row.model}, then check the exact car by
              registration before you commit.
            </p>

            <div className="mt-4 rounded-2xl border-2 border-slate-900 bg-slate-50 p-4">
              <h2 className="text-lg font-semibold sm:text-xl">
                Check a specific {row.make} {row.model} now
              </h2>
              <p className="mt-2 text-sm text-slate-700 sm:text-base">
                General model advice is useful, but the real question is whether
                the exact car you are viewing looks like a risk.
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

      <section className="mt-10 rounded-3xl border bg-slate-900 p-6 text-white">
        <h2 className="text-2xl font-semibold">
          Looking at one right now? Run the registration check.
        </h2>
        <p className="mt-3 max-w-2xl text-slate-200">
          A model guide can only take you so far. Enter the registration to see
          whether the exact {row.make} {row.model} you are considering shows MOT
          warning signs, price risk or likely repair exposure.
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
    </main>
  );
}