import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ResearchArticle from "@/components/seo/ResearchArticle";
import { diagnosticGuides, diagnosticSymptoms, getDiagnosticGuide } from "@/data/seo/diagnostic-guides";
import { isPublishableGuide } from "@/lib/seo/research";
import { absoluteUrl } from "@/lib/seo/routes";

type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = false;

export function generateStaticParams() {
  return diagnosticGuides.filter(isPublishableGuide).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = getDiagnosticGuide(slug);
  if (!guide || !isPublishableGuide(guide)) return { title: "Not found | AutoAudit", robots: { index: false } };
  const url = absoluteUrl(`/diagnostics/${slug}`);
  return {
    title: `${guide.title} | AutoAudit`, description: guide.description,
    alternates: { canonical: url }, robots: { index: true, follow: true },
    openGraph: { title: guide.title, description: guide.description, url, type: "article" },
  };
}

export default async function DiagnosticPage({ params }: Props) {
  const { slug } = await params;
  const guide = getDiagnosticGuide(slug);
  if (!guide || !isPublishableGuide(guide)) notFound();
  const parent = guide.hub ? getDiagnosticGuide(guide.hub) : undefined;
  const path = `/diagnostics/${slug}`;
  const breadcrumbs = [
    { name: "Home", item: "/" },
    { name: "Car research", item: "/cars" },
    ...(parent ? [{ name: parent.title, item: `/diagnostics/${parent.slug}` }] : []),
    { name: guide.title, item: path },
  ];
  const children = diagnosticSymptoms.filter((symptom) => symptom.hub === slug && isPublishableGuide(symptom));
  return (
    <ResearchArticle guide={guide} path={path} breadcrumbs={breadcrumbs} intent="diagnostic">
      {children.length > 0 && (
        <section className="mt-9">
          <h2 className="text-2xl font-semibold">Choose the symptom you are seeing</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {children.map((child) => (
              <Link key={child.slug} href={`/diagnostics/${child.slug}`} className="rounded-xl border border-slate-200 p-5 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-700">
                <h3 className="font-semibold">{child.title}</h3>
                <p className="mt-2 leading-6 text-slate-600">{child.intro}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </ResearchArticle>
  );
}
