export function titleCase(input: string) {
  return input
    .split(/[-\s]+/)
    .filter(Boolean)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");
}

export function absoluteUrl(path: string) {
  const siteUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "https://www.autoaudit.uk";

  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildModelCommonProblemsPath(make: string, model: string) {
  return `/cars/${make}/${model}/common-problems`;
}

export function buildAdvisoryHubPath(advisory: string) {
  return `/mot-advisories/${advisory}`;
}
