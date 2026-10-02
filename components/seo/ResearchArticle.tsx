import Link from "next/link";
import RegLookupCta from "./RegLookupCta";
import { researchSources, type ResearchGuide } from "@/lib/seo/research";
import { articleSchema, breadcrumbSchema } from "@/lib/seo/schema";

type Props = {
  guide: ResearchGuide;
  path: string;
  breadcrumbs: { name: string; item: string }[];
  intent: "common-problems" | "mot-advisory" | "diagnostic";
  make?: string;
  model?: string;
  children?: React.ReactNode;
};

export default function ResearchArticle({ guide, path, breadcrumbs, intent, make, model, children }: Props) {
  const sources = [...new Set(guide.sections.flatMap((section) => section.sources))];
  return (
    <article className="mx-auto max-w-4xl px-4 py-6 sm:py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(breadcrumbs)).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        ...articleSchema({ headline: guide.title, description: guide.description, path }),
        dateModified: guide.reviewed,
      }).replace(/</g, "\\u003c") }} />
      <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap gap-2 text-sm text-slate-600">
        {breadcrumbs.map((crumb, index) => (
          <span key={crumb.item}>
            {index > 0 && <span aria-hidden="true" className="mr-2">/</span>}
            {index === breadcrumbs.length - 1 ? <span aria-current="page">{crumb.name}</span> : (
              <Link className="underline underline-offset-4 focus-visible:outline focus-visible:outline-2" href={crumb.item}>{crumb.name}</Link>
            )}
          </span>
        ))}
      </nav>
      <header>
        <p className="text-sm font-medium text-slate-600">AutoAudit buyer research · Reviewed <time dateTime={guide.reviewed}>{guide.reviewed}</time></p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{guide.title}</h1>
        <p data-research-intro className="mt-5 text-lg leading-8 text-slate-700">{guide.intro}</p>
      </header>
      {guide.sections.map((section, index) => (
        <div key={section.heading}>
          <section data-research-section className="mt-9 space-y-3">
            {section.kind && <p className="text-sm font-semibold text-slate-600">{section.kind}</p>}
            <h2 className="text-2xl font-semibold text-slate-950">{section.heading}</h2>
            {section.paragraphs.map((paragraph) => <p key={paragraph} className="leading-7 text-slate-700">{paragraph}</p>)}
            <p className="text-sm leading-6 text-slate-600">
              References:{" "}
              {section.sources.map((id, index) => <span key={id}>{index > 0 ? "; " : ""}<a href={`#source-${id}`} className="underline underline-offset-4 focus-visible:outline focus-visible:outline-2">{researchSources[id].title}</a></span>)}
            </p>
          </section>
          {index === 0 && <RegLookupCta intent={intent} position="early" make={make} model={model} className="mt-8" />}
        </div>
      ))}
      {intent === "common-problems" && (
        <section className="mt-9 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h2 className="text-xl font-semibold">Check the actual car, not just the model name</h2>
          <p className="mt-3 leading-7 text-slate-700">Compare service invoices, the current inspection and the recorded MOT history. AutoAudit can show available history and buyer-risk signals; it cannot diagnose a mechanical fault, verify every service item or prove that a manufacturer campaign is complete. Confirm recall work with the manufacturer.</p>
          <p className="mt-3 leading-7 text-slate-700">The sources establish the stated specifications, instructions or campaigns. Inspection advice is a practical buying checklist, not a measured failure rate. No reliability score or universal “avoid this year” claim is inferred.</p>
        </section>
      )}
      {intent === "mot-advisory" && (
        <section className="mt-9 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h2 className="text-xl font-semibold">Read the recorded category, not just the short description</h2>
          <p className="mt-3 leading-7 text-slate-700">An advisory is distinct from a formal Minor defect. Major and Dangerous defects fail the test. A historic pass does not establish current roadworthiness. Follow the <a className="underline underline-offset-4" href={researchSources.results.url}>official guidance on MOT results and driving after a failure</a>.</p>
        </section>
      )}
      {children}
      {guide.links.length > 0 && (
        <section className="mt-9">
          <h2 className="text-2xl font-semibold">Continue your research</h2>
          <ul className="mt-4 space-y-4">
            {guide.links.map((link) => <li key={link.href}><Link href={link.href} className="font-semibold underline underline-offset-4 focus-visible:outline focus-visible:outline-2">{link.label}</Link><p className="mt-1 leading-6 text-slate-600">{link.reason}</p></li>)}
          </ul>
        </section>
      )}
      <RegLookupCta intent={intent} position="end" make={make} model={model} className="mt-9" />
      <section className="mt-10 border-t pt-6">
        <h2 className="text-xl font-semibold">Sources and applicability</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">Reviewed on {guide.reviewed}. Manufacturer instructions must match the vehicle, model year and market. Campaign eligibility needs an individual manufacturer check. Sources below support the relevant sections; they are not evidence that every possible concern occurs on every vehicle.</p>
        <ul className="mt-4 space-y-3 text-sm leading-6">
          {sources.map((id) => <li key={id} id={`source-${id}`} className="scroll-mt-24"><a href={researchSources[id].url} className="break-words underline underline-offset-4 focus-visible:outline focus-visible:outline-2">{researchSources[id].title}</a></li>)}
        </ul>
      </section>
    </article>
  );
}
