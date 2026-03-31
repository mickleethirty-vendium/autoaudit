import type { MetadataRoute } from "next";
import { absoluteUrl, buildAdvisoryHubPath, buildModelCommonProblemsPath } from "@/lib/seo/routes";
import { allMotAdvisoryTypes, wave1Models } from "@/lib/seo/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/check-car-by-registration"),
      changeFrequency: "weekly",
      priority: 0.95,
    },
  ];

  const modelPages: MetadataRoute.Sitemap = wave1Models.map((row) => ({
    url: absoluteUrl(buildModelCommonProblemsPath(row.make_slug, row.model_slug)),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const advisoryPages: MetadataRoute.Sitemap = allMotAdvisoryTypes.map((row) => ({
    url: absoluteUrl(buildAdvisoryHubPath(row.advisory_slug)),
    changeFrequency: "monthly" as const,
    priority: 0.65,
  }));

  return [...staticPages, ...modelPages, ...advisoryPages];
}
