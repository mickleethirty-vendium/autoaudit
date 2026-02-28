export type BrandTier =
  | "budget"
  | "mass"
  | "upper_mass"
  | "premium"
  | "luxury"
  | "performance";

export const BRAND_TIER_MULTIPLIER: Record<BrandTier, number> = {
  budget: 0.9,
  mass: 1.0,
  upper_mass: 1.2,
  premium: 1.4,
  luxury: 1.8,
  performance: 3.0,
};

// Simple brand mapping by MAKE (DVLA gives uppercase make)
export function getBrandTier(make?: string | null): BrandTier {
  if (!make) return "mass";

  const m = make.toLowerCase();

  // Tier 1 – Budget
  if (["dacia", "ssangyong"].includes(m)) return "budget";

  // Tier 2 – Mass market
  if (
    [
      "ford",
      "vauxhall",
      "toyota",
      "volkswagen",
      "vw",
      "skoda",
      "seat",
      "peugeot",
      "renault",
      "mini",
      "nissan",
    ].includes(m)
  )
    return "mass";

  // Tier 3 – Upper mass
  if (
    [
      "mazda",
      "honda",
      "hyundai",
      "kia",
      "volvo",
      "subaru",
    ].includes(m)
  )
    return "upper_mass";

  // Tier 4 – Premium
  if (
    [
      "bmw",
      "audi",
      "mercedes",
      "mercedes-benz",
      "jaguar",
      "lexus",
    ].includes(m)
  )
    return "premium";

  // Tier 5 – Luxury
  if (
    [
      "porsche",
      "maserati",
      "bentley",
      "rolls-royce",
      "land rover",
      "range rover",
    ].includes(m)
  )
    return "luxury";

  // Tier 6 – Performance / Supercar
  if (
    [
      "ferrari",
      "lamborghini",
      "mclaren",
      "aston martin",
      "lotus",
    ].includes(m)
  )
    return "performance";

  return "mass";
}