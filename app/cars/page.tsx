import type { Metadata } from "next";
import Link from "next/link";
import { wave1Models, allMotAdvisoryTypes } from "@/lib/seo/data";
import {
  absoluteUrl,
  buildAdvisoryHubPath,
  buildModelCommonProblemsPath,
} from "@/lib/seo/routes";
import { breadcrumbSchema, faqSchema } from "@/lib/seo/schema";

export const metadata: Metadata = {
  title: "Common Car Problems UK by Make and Model | AutoAudit",
  description:
    "Browse common car problems by make and model in the UK, compare used car reliability patterns, and check a specific vehicle by registration before you buy.",
  alternates: {
    canonical: absoluteUrl("/cars"),
  },
  openGraph: {
    title: "Common Car Problems UK by Make and Model | AutoAudit",
    description:
      "Browse common car problems by make and model in the UK, compare used car reliability patterns, and check a specific vehicle by registration before you buy.",
    url: absoluteUrl("/cars"),
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Common car problems by make and model | AutoAudit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Common Car Problems UK by Make and Model | AutoAudit",
    description:
      "Browse common car problems by make and model in the UK, compare used car reliability patterns, and check a specific vehicle by registration before you buy.",
    images: ["/og-image.png"],
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

type MakeCard = {
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

function getPopularMakes(): MakeCard[] {
  const preferredMakeOrder = [
    "ford",
    "bmw",
    "audi",
    "volkswagen",
    "vauxhall",
    "toyota",
  ];

  const rowsByMake = new Map(
    wave1Models.map((row) => [row.make_slug, row.make] as const)
  );

  return preferredMakeOrder
    .filter((makeSlug) => rowsByMake.has(makeSlug))
    .map((makeSlug) => ({
      href: `/cars/${makeSlug}`,
      label: rowsByMake.get(makeSlug) || makeSlug,
      description: `Browse ${
        rowsByMake.get(makeSlug) || makeSlug
      } models and common used car problems.`,
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
      makeSlug: rows[0]?.make_slug,
      models: rows
        .sort((a, b) => a.model.localeCompare(b.model))
        .slice(0, 12),
    }));
}

export default function CarsHubPage() {
  const priorityModels = getPriorityModels();
  const popularAdvisories = getPopularAdvisories();
  const groupedModels = getGroupedModels();
  const popularMakes = getPopularMakes();

  const faqs = [
    {
      question: "What is this cars page for?",
      answer:
        "This page helps you browse common car problems by make and model so you can research likely weak points, reliability themes and ownership risks before buying used.",
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
    {
      question: "Can this help if I am comparing several cars?",
      answer:
        "Yes. These guides are useful when narrowing a shortlist because they help you compare common faults and reliability patterns across different makes and models.",
    },
    {
      question: "What should I do after reading a model guide?",
      answer:
        "Once you have identified a car worth looking at, use the registration check to review MOT history, likely repair exposure and price context for the exact vehicle.",
    },
  ];

  const breadcrumbs = breadcrumbSchema([
    { name: "Home", item: "/" },
    { name: "Cars", item: "/cars" },
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
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">
          This page is designed for buyers researching reliability, comparing
          shortlist vehicles and trying to understand where hidden used car
          costs often come from. Use it to explore known faults by model, then
          move to a registration check when you want to assess a specific car.
        </p>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">
          Start by exploring popular makes such as{" "}
          <Link
            href="/cars/ford"
            className="font-medium underline underline-offset-2"
          >
            Ford
          </Link>
          ,{" "}
          <Link
            href="/cars/bmw"
            className="font-medium underline underline-offset-2"
          >
            BMW
          </Link>
          ,{" "}
          <Link
            href="/cars/volkswagen"
            className="font-medium underline underline-offset-2"
          >
            Volkswagen
          </Link>{" "}
          and{" "}
          <Link
            href="/cars/audi"
            className="font-medium underline underline-offset-2"
          >
            Audi
          </Link>
          , then drill into model-level guides before checking a specific car by
          registration.
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
        <h2 className="text-2xl font-semibold">How to use this cars hub</h2>
        <p className="text-slate-700">
          Start by exploring the make and model pages most relevant to the cars
          you are considering. Each guide is intended to help you understand the
          kinds of problems that often matter to used buyers, from reliability
          concerns to recurring weak points and ownership risk themes.
        </p>
        <p className="text-slate-700">
          Once you find a car that still looks promising, move from model-level
          research to the exact vehicle by using its registration. That is where
          AutoAudit becomes more specific, helping you judge MOT history,
          repair-cost exposure and price context for the actual car in front of
          you.
        </p>
        <p className="text-slate-700">
          Many of these issues first appear as{" "}
          <Link
            href="/mot-advisories"
            className="font-medium underline underline-offset-2"
          >
            MOT advisories
          </Link>
          , which can help you spot early warning signs before buying.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">Popular makes</h2>
        <p className="text-slate-700">
          Start with high-volume manufacturers to compare common used car
          problems and reliability patterns before narrowing your shortlist.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {popularMakes.map((make) => (
            <Link
              key={make.href}
              href={make.href}
              className="rounded-xl border p-4 transition hover:border-slate-400 hover:bg-slate-50"
            >
              <h3 className="font-medium">{make.label}</h3>
              <p className="mt-1 text-sm text-slate-600">{make.description}</p>
            </Link>
          ))}
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
          alongside model-specific buying risks. They are useful when you want
          to understand what a recorded MOT issue may mean in practical buyer
          terms.
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
          Explore model-level used car guides grouped by manufacturer. This is a
          useful way to compare known faults, reliability concerns and buyer
          warnings across the makes you are considering.
        </p>

        <div className="space-y-6">
          {groupedModels.map((group) => (
            <section key={group.make} className="rounded-2xl border bg-white p-5">
              <h3 className="text-xl font-semibold">
                {group.makeSlug ? (
                  <Link
                    href={`/cars/${group.makeSlug}`}
                    className="transition hover:text-slate-700"
                  >
                    {group.make}
                  </Link>
                ) : (
                  group.make
                )}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                Browse common problems and used car warning signs for popular{" "}
                {group.makeSlug ? (
                  <Link
                    href={`/cars/${group.makeSlug}`}
                    className="font-medium underline underline-offset-2"
                  >
                    {group.make}
                  </Link>
                ) : (
                  group.make
                )}{" "}
                models.
              </p>
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
              {group.makeSlug ? (
                <div className="mt-4">
                  <Link
                    href={`/cars/${group.makeSlug}`}
                    className="text-sm font-medium text-slate-700 underline underline-offset-2 hover:text-slate-900"
                  >
                    View all {group.make} guides
                  </Link>
                </div>
              ) : null}
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
        <h2 className="text-2xl font-semibold">
          Why model guides matter for used buyers
        </h2>
        <p className="text-slate-700">
          Used car buyers often start with a make or model they like, then work
          backwards to understand whether there are recurring problems worth
          watching for. A good guide does not replace an inspection, but it does
          help you go into the buying process with better questions and more
          realistic expectations.
        </p>
        <ul className="list-disc pl-6 text-slate-700">
          <li>Understand likely weak points before you travel to view a car</li>
          <li>Spot patterns that may explain future maintenance costs</li>
          <li>Compare similar cars with a little more confidence</li>
          <li>Move to a registration check once you find a serious option</li>
        </ul>
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