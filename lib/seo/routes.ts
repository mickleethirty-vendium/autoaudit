export function titleCase(input: string) {
  return input
    .split(/[-\s]+/)
    .filter(Boolean)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");
}

// Public SEO identity is independent of checkout/auth return URL configuration.
export const SEO_SITE_URL = "https://autoaudit.uk";

export function absoluteUrl(path: string) {
  return `${SEO_SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildMakeHubPath(make: string) {
  return `/cars/${make}`;
}

export function buildModelHubPath(make: string, model: string) {
  return `/cars/${make}/${model}`;
}

export function buildModelCommonProblemsPath(make: string, model: string) {
  return `/cars/${make}/${model}/common-problems`;
}

export function buildAdvisoryHubPath(advisory: string) {
  return `/mot-advisories/${advisory}`;
}