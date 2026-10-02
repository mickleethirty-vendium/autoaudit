import type { MetadataRoute } from "next";
import { allMotAdvisoryTypes } from "@/lib/seo/data";
import { coreSeoPaths, editorialPages, publishedMakeSlugs, publishedModels } from "@/lib/seo/estate";
import { absoluteUrl, buildAdvisoryHubPath, buildMakeHubPath, buildModelCommonProblemsPath, buildModelHubPath } from "@/lib/seo/routes";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    ...coreSeoPaths,
    ...editorialPages.map((page) => page.path),
    ...publishedMakeSlugs.map(buildMakeHubPath),
    ...publishedModels.map((row) => buildModelHubPath(row.make_slug, row.model_slug)),
    ...publishedModels.map((row) => buildModelCommonProblemsPath(row.make_slug, row.model_slug)),
    ...allMotAdvisoryTypes.map((row) => buildAdvisoryHubPath(row.advisory_slug)),
  ];
  // Do not claim the current time is a content update. Add modification dates
  // only when real per-record editorial dates are available.
  return paths.map((path) => ({ url: absoluteUrl(path) }));
}
