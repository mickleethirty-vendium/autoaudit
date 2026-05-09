import type { MetadataRoute } from "next";
import {
  absoluteUrl,
  buildAdvisoryHubPath,
  buildModelCommonProblemsPath,
} from "@/lib/seo/routes";
import {
  allMakesModels,
  allMotAdvisoryTypes,
  wave1Models,
} from "@/lib/seo/data";

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

    // 🔥 SCALE PAGES (BUDGET CLUSTER)
    {
      url: absoluteUrl("/best-cars-under-3000"),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/best-cars-under-5000"),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.92,
    },
    {
      url: absoluteUrl("/best-cars-under-7000"),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/best-cars-under-10000"),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.93,
    },
    {
      url: absoluteUrl("/best-cars-under-12000"),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.89,
    },
    {
      url: absoluteUrl("/best-cars-under-15000"),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.91,
    },
    {
      url: absoluteUrl("/best-cars-under-20000"),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },

    // 🔥 INTENT / AUDIENCE PAGES
    {
      url: absoluteUrl("/best-first-car-uk"),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.92,
    },
    {
      url: absoluteUrl("/best-used-cars-for-families-uk"),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.91,
    },
    {
      url: absoluteUrl("/cheap-cars-with-low-maintenance-costs-uk"),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.89,
    },
    {
      url: absoluteUrl("/best-cars-for-new-drivers-uk"),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/cheapest-cars-to-insure-uk"),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/small-cars-uk"),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.88,
    },
    {
      url: absoluteUrl("/reliable-used-cars-uk"),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.88,
    },
    {
      url: absoluteUrl("/family-cars-uk"),
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