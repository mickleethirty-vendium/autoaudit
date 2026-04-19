import type { MetadataRoute } from "next";
import {
  absoluteUrl,
  buildAdvisoryHubPath,
  buildModelCommonProblemsPath,
} from "@/lib/seo/routes";
import { allMakesModels, allMotAdvisoryTypes, wave1Models } from "@/lib/seo/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/check-car-by-registration"),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: absoluteUrl("/cars"),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/mot-advisories"),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.88,
    },
  ];

  const makeSlugs = [...new Set(allMakesModels.map((row) => row.make_slug))];

  const makePages: MetadataRoute.Sitemap = makeSlugs.map((makeSlug) => ({
    url: absoluteUrl(`/cars/${makeSlug}`),
    lastModified,
    changeFrequency: "weekly" as const,
    priority: 0.72,
  }));

  const modelPages: MetadataRoute.Sitemap = wave1Models.map((row) => ({
    url: absoluteUrl(
      buildModelCommonProblemsPath(row.make_slug, row.model_slug)
    ),
    lastModified,
    changeFrequency: "monthly" as const,
    priority:
      row.priority_tier === 1 || row.launch_wave === 1
        ? 0.8
        : row.priority_tier === 2 || row.launch_wave === 2
          ? 0.66
          : 0.55,
  }));

  const advisoryPages: MetadataRoute.Sitemap = allMotAdvisoryTypes.map(
    (row) => ({
      url: absoluteUrl(buildAdvisoryHubPath(row.advisory_slug)),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.68,
    })
  );

  return [
    ...staticPages,
    ...makePages,
    ...modelPages,
    ...advisoryPages,
  ];
}