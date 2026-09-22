import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import HeroCtaTextPanel from "@/components/seo/HeroCtaTextPanel";
import RegLookupCta from "@/components/seo/RegLookupCta";
import {
  allMotAdvisoryTypes,
  getModelByParams,
  wave1Models,
} from "@/lib/seo/data";
import {
  absoluteUrl,
  buildAdvisoryHubPath,
  buildMakeHubPath,
  buildModelCommonProblemsPath,
  buildModelHubPath,
} from "@/lib/seo/routes";
import { breadcrumbSchema, faqSchema } from "@/lib/seo/schema";

type Props = {
  params: Promise<{
    make: string;
    model: string;
  }>;
};

type LinkCard = {
  href: string;
  label: string;
  description: string;
};

function getRelatedAdvisories(): LinkCard[] {
  return allMotAdvisoryTypes.slice(0, 8).map((row) => ({
    href: buildAdvisoryHubPath(row.advisory_slug),
    label: `${row.advisory_label} advisory meaning`,
    description:
      "Understand what this MOT advisory can mean for used car buying risk.",
  }));
}

function getReliabilityIntro(make: string, model: string) {
  return `The ${make} ${model} can be a sensible used buy, but the exact car matters more than the badge or model name alone. Mileage, maintenance history, MOT advisory patterns and how previous owners dealt with repairs all affect the real buying risk.`;
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

  const title = `${row.make} ${row.model} Used Buying Guide | AutoAudit`;
  const description = `Research ${row.make} ${row.model} reliability, common problems, MOT advisory patterns and used buyer checks before checking a specific car by registration.`;
  const path = buildModelHubPath(row.make_slug, row.model_slug);
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
          alt: `${row.make} ${row.model} used buying guide | AutoAudit`,
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

export default async function ModelHubPage({ params }: Props) {
  const { make, model } = await params;
  const row = getModelByParams(make, model);

  if (!row) notFound();

  const modelName = `${row.make} ${row.model}`;
  const makeHubPath = buildMakeHubPath(row.make_slug);
  const modelHubPath = buildModelHubPath(row.make_slug, row.model_slug);
  const commonProblemsPath = buildModelCommonProblemsPath(
    row.make_slug,
    row.model_slug,
  );
  const relatedAdvisories = getRelatedAdvisories();
  const primaryAdvisory = relatedAdvisories[0];
  const secondaryAdvisory = relatedAdvisories[1];

  const faqs = [
    {
      question: `Is the ${modelName} reliable?`,
      answer: `The ${modelName} can be reliable if it has been maintained properly, but the real risk depends on the exact car, its MOT history, mileage, advisories and evidence of previous repairs.`,
    },
    {
      question: `What should I check before buying a used ${modelName}?`,
      answer:
        "Check the MOT history, repeated advisories, service evidence, tyre and brake condition, suspension wear, warning lights, fluid leaks and whether known model issues have already been repaired.",
    },
    {
      question: `Does this page replace checking the car by registration?`,
      answer:
        "No. This page is for model-level research. A registration check helps assess the actual vehicle you are considering before you buy.",
    },
  ];

  const breadcrumbs = breadcrumbSchema([
    { name: "Home", item: "/" },
    { name: "Cars", item: "/cars" },
    { name: row.make, item: makeHubPath },
    { name: row.model, item: modelHubPath },
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
        <Link href={makeHubPath} className="transition hover:text-slate-900">
          {row.make}
        </Link>
        <span>/</span>
        <span className="text-slate-900">{row.model}</span>
      </nav>

      <HeroCtaTextPanel
        heroImageSrc="/hero-car-road.png"
        heroAlt={`${modelName} used buying guide`}
        title={`${modelName} used buying guide`}
        subtitle="Reliability, common problems and MOT risk"
        ctaComponent={
          <RegLookupCta intent="buying-guide" position="early" make={row.make} model={row.model}
            title={`Check a specific ${modelName} by registration`}
            variant="light"
          />
        }
        bodyContent={
          <div className="space-y-3">
            <p>{getReliabilityIntro(row.make, row.model)}</p>
            <p>
              Use this guide to understand the model-level risks first, then
              check the exact vehicle by registration before committing to a
              viewing, deposit or purchase.
            </p>
          </div>
        }
      />

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">
          Is the {modelName} a good used buy?
        </h2>
        <p className="text-slate-700">
          The {modelName} should be judged on condition and history, not just
          reputation. A well-maintained example with clean MOT history can be a
          much safer buy than a cheaper car with repeated advisories, neglected
          servicing or signs of deferred repairs.
        </p>
        <p className="text-slate-700">
          Before buying, look for patterns. Repeated advisories for tyres,
          brakes, suspension, corrosion, lamps or fluid leaks can suggest the
          car has been maintained reactively rather than proactively.
        </p>
      </section>

      <section className="mt-10 rounded-2xl border bg-slate-50 p-5">
        <h2 className="text-2xl font-semibold">
          Before you view one, check the actual car
        </h2>
        <p className="mt-2 text-slate-700">
          Model research tells you what can go wrong. A registration check helps
          show whether the specific {modelName} you are considering already has
          warning signs in its MOT history.
        </p>
        <div className="mt-4">
          <RegLookupCta intent="buying-guide" position="midpoint" make={row.make} model={row.model}
            title={`Run a ${modelName} registration check`}
          />
        </div>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">
          Common {modelName} problems
        </h2>
        <p className="text-slate-700">
          Common problem research is useful because it gives you a shortlist of
          things to inspect during a viewing. Pay attention to warning lights,
          engine noises, clutch or gearbox behaviour, suspension knocks, brake
          condition, uneven tyre wear and signs of leaks.
        </p>
        <p className="text-slate-700">
          For a deeper model-specific breakdown, read the dedicated{" "}
          <Link
            href={commonProblemsPath}
            className="font-medium underline underline-offset-2"
          >
            {modelName} common problems guide
          </Link>
          .
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">MOT advisory patterns to check</h2>
        <p className="text-slate-700">
          MOT advisories are useful because they can show how a car has been
          looked after over time. One minor advisory is not always a concern,
          but repeated advisories across several tests can point to neglected
          maintenance or costs waiting for the next owner.
        </p>

        {primaryAdvisory ? (
          <p className="text-slate-700">
            Useful starting points include{" "}
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
            , especially when the same issue appears more than once.
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

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">
          Used {modelName} buyer checklist
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            {
              title: "Check MOT history",
              text: "Look for repeated advisories, mileage gaps, corrosion notes, tyre wear, brake wear and suspension issues.",
            },
            {
              title: "Check servicing evidence",
              text: "Confirm oil changes, scheduled maintenance and major repair evidence. A stamped book alone is not always enough.",
            },
            {
              title: "Inspect wear items",
              text: "Tyres, brakes, suspension arms, exhaust parts and lights can quickly turn a cheap car into an expensive one.",
            },
            {
              title: "Test drive properly",
              text: "Listen for knocks, hesitation, clutch slip, gearbox issues, warning lights and braking vibration.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-xl border p-4">
              <h3 className="font-medium">{item.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">Repair-cost risk</h2>
        <p className="text-slate-700">
          The biggest risk with any used {modelName} is not usually one isolated
          defect. It is a cluster of small warning signs that suggest the car has
          been run cheaply. Tyres, brakes, suspension, leaks and repeated MOT
          advisories can add up quickly.
        </p>
        <p className="text-slate-700">
          This is where checking the actual registration matters. A model might
          have a known weakness, but the car in front of you may already have had
          the work done — or it may be showing early warning signs that are not
          obvious from the advert.
        </p>
      </section>

      <section className="mt-10 rounded-2xl border bg-slate-950 p-5 text-white">
        <h2 className="text-2xl font-semibold text-white">
          Ready to check a specific {modelName}?
        </h2>
        <p className="mt-2 text-slate-200">
          Use AutoAudit to check MOT history, recurring advisories and
          vehicle-specific repair-risk signals before you buy.
        </p>
        <div className="mt-4">
          <RegLookupCta intent="buying-guide" position="end" make={row.make} model={row.model}
            title={`Check this ${modelName} by registration`}
            variant="dark"
          />
        </div>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">Continue your research</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Link
            href={makeHubPath}
            className="rounded-xl border p-4 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <h3 className="font-medium">Back to {row.make} guides</h3>
            <p className="mt-1 text-sm text-slate-600">
              Compare other {row.make} models before narrowing your shortlist.
            </p>
          </Link>
          <Link
            href={commonProblemsPath}
            className="rounded-xl border p-4 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <h3 className="font-medium">{modelName} common problems</h3>
            <p className="mt-1 text-sm text-slate-600">
              Read the deeper common faults and warning signs guide.
            </p>
          </Link>
          <Link
            href="/check-car-by-registration"
            className="rounded-xl border p-4 transition hover:border-slate-400 hover:bg-slate-50"
          >
            <h3 className="font-medium">Check by registration</h3>
            <p className="mt-1 text-sm text-slate-600">
              Move from model research to the exact vehicle history.
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