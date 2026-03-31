import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://www.autoaudit.co.uk";

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
