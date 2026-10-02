import publishedModelSlugs from "@/data/seo/published_models.json";
import editorialRecords from "@/data/seo/editorial_pages.json";
import { allMakesModels } from "./data";
import { diagnosticGuides } from "@/data/seo/diagnostic-guides";
import { isPublishableGuide } from "./research";

export const publishedDiagnostics = diagnosticGuides.filter(isPublishableGuide);

// Preserve the existing curated estate. Changing a launch-wave label must not
// automatically publish more SEO pages. Additions need the documented review.
const published = new Set(publishedModelSlugs);
export const publishedModels = allMakesModels.filter((row) => published.has(row.full_slug));
export const publishedMakeSlugs = [...new Set(publishedModels.map((row) => row.make_slug))];
export const editorialPages = editorialRecords;
export const coreSeoPaths = [
  "/", "/check-car-by-registration", "/sample-report", "/pricing",
  "/how-it-works", "/cars", "/mot-advisories",
];

export function getMakeEstate(make: string) {
  const models = allMakesModels
    .filter((row) => row.make_slug === make)
    .sort((a, b) => a.model.localeCompare(b.model));
  const curated = models.filter((row) => published.has(row.full_slug));
  return {
    models,
    curated,
    // Later-wave children retain their previous behaviour pending GSC review.
    // Their repaired parent is navigation only, not another indexed article.
    status: curated.length ? "curated" as const : models.length ? "directory" as const : "missing" as const,
  };
}
