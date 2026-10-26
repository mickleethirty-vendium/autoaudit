import type { MetadataRoute } from "next";
import { SEO_SITE_URL } from "@/lib/seo/routes";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = SEO_SITE_URL;

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/check-car-by-registration", "/cars/", "/mot-advisories/"],
        disallow: ["/api/", "/auth", "/reports", "/report/", "/check?"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
