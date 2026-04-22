import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { allMotAdvisoryTypes, wave1Models } from "@/lib/seo/data";
import {
  absoluteUrl,
  buildAdvisoryHubPath,
  buildModelCommonProblemsPath,
} from "@/lib/seo/routes";
import { breadcrumbSchema, faqSchema } from "@/lib/seo/schema";

type Props = {
  params: Promise<{
    make: string;
  }>;
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

function getMakeRows(makeSlug: string) {
  return wave1Models
    .filter((row) => row.make_slug === makeSlug)
    .sort((a, b) => a.model.localeCompare(b.model));
}

function getPriorityModels(makeSlug: string): ModelCard[] {
  const rows = getMakeRows(makeSlug);

  const priorityRows = rows.filter(
    (row) => row.priority_tier === 1 || row.launch_wave === 1
  );

  const selected = (priorityRows.length ? priorityRows : rows).slice(0, 18);

  return selected.map((row) => ({
    href: buildModelCommonProblemsPath(row.make_slug, row.model_slug),
    label: `${row.make} ${row.model} common problems`,
    description:
      "Used buyer guide covering common warning signs, ownership risks and what to check before you buy.",
  }));
}

function getRelatedAdvisories(): AdvisoryCard[] {
  return allMotAdvisoryTypes.slice(0, 8).map((row) => ({
    href: buildAdvisoryHubPath(row.advisory_slug),
    label: `${row.advisory_label} advisory meaning`,
    description:
      "Understand what this MOT advisory means and how it can affect buying risk.",
  }));
}

function getMakeIntro(makeName: string) {
  const normalized = makeName.toLowerCase();

  if (
    ["audi", "bmw", "mercedes-benz", "jaguar", "land rover", "volvo"].includes(
      normalized
    )
  ) {
    return `${makeName} buyers often care just as much about maintenance history and MOT patterns as they do about badge appeal. A tidy, well-maintained example can still be a good used buy, but neglected cars can become expensive quickly.`;
  }

  if (
    [
      "ford",
      "vauxhall",
      "toyota",
      "hyundai",
      "kia",
      "renault",
      "peugeot",
      "nissan",
    ].includes(normalized)
  ) {
    return `${makeName} covers a wide mix of popular used cars, so the exact model, mileage and maintenance history matter more than the make name alone. This hub helps you compare common issues before checking a specific car by registration.`;
  }

  return `${makeName} includes a range of used cars with different ownership risks, common warning signs and maintenance patterns. Use this page to compare model guides before deciding whether a specific car looks like a good buy.`;
}

export async function generateStaticParams() {
  const uniqueMakeSlugs = [...new Set(wave1Models.map((row) => row.make_slug))];

  return uniqueMakeSlugs.map((make) => ({
    make,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { make } = await params;
  const rows = getMakeRows(make);

  if (!rows.length) {
    return {
      title: "Not found | AutoAudit",
    };
  }

  const makeName = rows[0].make;
  const title = `${makeName} Common Problems by Model | AutoAudit`;
  const description = `Browse ${makeName} common problems by model, compare used car warning signs, and check a specific ${makeName} by registration before you buy.`;
  const path = `/cars/${make}`;
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
      type: "website",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: `${makeName} common problems by model | AutoAudit`,
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

export default async function MakeHubPage({ params }: Props) {
  const { make } = await params;
  const rows = getMakeRows(make);

  if (!rows.length) notFound();

  const makeName = rows[0].make;
  const modelCards = getPriorityModels(make);
  const relatedAdvisories = getRelatedAdvisories();
  const intro = getMakeIntro(makeName);
  const primaryModel = modelCards[0];
  const secondaryModel = modelCards[1];
  const primaryAdvisory = relatedAdvisories[0];
  const secondaryAdvisory = relatedAdvisories[1];

  const faqs = [
    {
      question: `What is this ${makeName} page for?`,
      answer: `This page helps you browse ${makeName} common problems by model so you can compare likely ownership risks and warning signs before buying used.`,
    },
    {
      question: `Does this replace checking a ${makeName} by registration?`,
      answer:
        "No. Model-level research is useful, but a registration check is still the best way to assess the exact car you are considering.",
    },
    {
      question: `Why browse ${makeName} models together?`,
      answer: `Because it helps you compare how different ${makeName} models stack up for likely weak points, maintenance themes and used buyer risk.`,
    },
  ];

  const breadcrumbs = breadcrumbSchema([
    { name: "Home", item: "/" },
    { name: "Cars", item: "/cars" },
    { name: makeName, item: `/cars/${make}` },
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
        <Link href="/cars" className="transition hover:text-slate-900">
          Cars
        </Link>
        <span>/</span>
        <span className="text-slate-900">{makeName}</span>
      </nav>

      <section className="rounded-3xl border bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {makeName} common problems by model
        </h1>
        <p className="mt-4 max-w-3xl text-base text-slate-700">{intro}</p>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">
          Use this make hub to compare likely weak points across popular{" "}
          {makeName} models, then move from general research to a{" "}
          <Link
            href="/check-car-by-registration"
            className="font-medium underline underline-offset-2"
          >
            registration-based vehicle check
          </Link>{" "}
          once you are looking at a specific car.
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
        <h2 className="text-2xl font-semibold">
          Popular {makeName} model guides
        </h2>
        <p className="text-slate-700">
          Compare common problems, likely weak points and used buyer warnings
          across the most relevant {makeName} models.
        </p>

        {primaryModel ? (
          <p className="text-slate-700">
            Good starting points are usually guides such as{" "}
            <Link
              href={primaryModel.href}
              className="font-medium underline underline-offset-2"
            >
              {primaryModel.label}
            </Link>
            {secondaryModel ? (
              <>
                {" "}
                and{" "}
                <Link
                  href={secondaryModel.href}
                  className="font-medium underline underline-offset-2"
                >
                  {secondaryModel.label}
                </Link>
              </>
            ) : null}
            , especially if you are narrowing a shortlist before checking the
            exact car.
          </p>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modelCards.map((item) => (
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
        <h2 className="text-2xl font-semibold">Why this make hub helps</h2>
        <p className="text-slate-700">
          Used buyers often start with broad research before narrowing down to
          one exact car. This {makeName} hub lets you compare model-level
          warning signs first, then move into a registration check when you are
          looking at a specific vehicle.
        </p>
        <p className="text-slate-700">
          The exact car still matters more than brand reputation alone, but
          comparing model guides can help you understand what issues are more
          likely to matter during a viewing or negotiation.
        </p>
        <p className="text-slate-700">
          It also helps to cross-reference model research with{" "}
          <Link
            href="/mot-advisories"
            className="font-medium underline underline-offset-2"
          >
            MOT advisory guides
          </Link>{" "}
          so you can understand how issues first show up in real test history
          before they become expensive ownership problems.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">Related MOT advisory guides</h2>
        <p className="text-slate-700">
          These MOT advisory pages help explain warning signs that often appear
          alongside common used car buying risks.
        </p>

        {primaryAdvisory ? (
          <p className="text-slate-700">
            For example, issues covered in guides like{" "}
            <Link
              href={primaryAdvisory.href}
              className="font-medium underline underline-offset-2"
            >
              {primaryAdvisory.label}
            </Link>
            {secondaryAdvisory ? (
              <>
                {" "}
                and{" "}
                <Link
                  href={secondaryAdvisory.href}
                  className="font-medium underline underline-offset-2"
                >
                  {secondaryAdvisory.label}
                </Link>
              </>
            ) : null}
            {" "}
            can add useful context when you are deciding whether a used {makeName}{" "}
            looks like a sensible buy.
          </p>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

      <section className="mt-10 rounded-3xl border bg-slate-900 p-6 text-white">
        <h2 className="text-2xl font-semibold">
          Research is useful. Checking the exact {makeName} is better.
        </h2>
        <p className="mt-3 max-w-2xl text-slate-200">
          Model guides can help you compare likely risks, but they cannot tell
          you whether the exact {makeName} you are viewing has repeat
          advisories, suspicious gaps or price risk. Use the registration check
          for that.
        </p>

        <form
          action="/check"
          method="GET"
          className="mt-5 flex flex-col gap-3 sm:flex-row"
        >
          <input
            type="text"
            name="registration"
            placeholder={`Enter ${makeName} registration`}
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
          A sensible used car buying journey is usually: compare make-level
          guides, narrow down to a few models, understand likely MOT warning
          signs, then run a registration check on the exact vehicle before money
          changes hands.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <Link
            href="/cars"
            className="rounded-xl border p-4 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <h3 className="font-medium">Browse all makes</h3>
            <p className="mt-1 text-sm text-slate-600">
              Compare more used car guides across other manufacturers
            </p>
          </Link>
          <Link
            href="/mot-advisories"
            className="rounded-xl border p-4 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <h3 className="font-medium">Read MOT advisory explainers</h3>
            <p className="mt-1 text-sm text-slate-600">
              Learn what repeated advisories can mean before you buy
            </p>
          </Link>
          <Link
            href="/check-car-by-registration"
            className="rounded-xl border p-4 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <h3 className="font-medium">Check the exact car</h3>
            <p className="mt-1 text-sm text-slate-600">
              Move from model research to vehicle-specific risk checks
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