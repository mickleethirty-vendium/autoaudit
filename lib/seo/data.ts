import makesModels from "@/data/seo/makes_models.json";
import problemTypes from "@/data/seo/problem_types.json";
import motAdvisoryTypes from "@/data/seo/mot_advisory_types.json";

import type {
  MakeModelSeed,
  ProblemTypeSeed,
  MotAdvisorySeed,
} from "./types";

export const allMakesModels = makesModels as MakeModelSeed[];
export const allProblemTypes = problemTypes as ProblemTypeSeed[];
export const allMotAdvisoryTypes = motAdvisoryTypes as MotAdvisorySeed[];

export const wave1Models = allMakesModels.filter((row) => row.launch_wave === 1);
export const wave2Models = allMakesModels.filter((row) => row.launch_wave <= 2);
export const highPriorityModels = allMakesModels.filter((row) => row.priority_tier <= 2);

export function getModelByParams(make: string, model: string) {
  return allMakesModels.find(
    (row) => row.make_slug === make && row.model_slug === model,
  );
}

export function getAdvisoryBySlug(advisory: string) {
  return allMotAdvisoryTypes.find((row) => row.advisory_slug === advisory);
}

export function formatPriceRange(low?: number, high?: number) {
  if (!low || !high) return null;
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(low) + "–" + new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(high);
}
