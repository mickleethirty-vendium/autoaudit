import {
  MatchBasis,
  MatchConfidence,
  MatcherInput,
  ScoredVehicleFailureMatch,
  VehicleFailureMapEntry,
} from "./types";

function norm(value?: string | null) {
  return value ? value.trim().toLowerCase() : null;
}

function includesLoose(a?: string | null, b?: string | null) {
  const na = norm(a);
  const nb = norm(b);
  if (!na || !nb) return false;
  return na === nb || na.includes(nb) || nb.includes(na);
}

function yearMatches(
  year: number | null | undefined,
  entry: VehicleFailureMapEntry
) {
  if (!year) return true;
  if (entry.year_from && year < entry.year_from) return false;
  if (entry.year_to && year > entry.year_to) return false;
  return true;
}

function getMatchBasis(
  input: MatcherInput,
  entry: VehicleFailureMapEntry
): MatchBasis | null {
  if (
    entry.derivative &&
    includesLoose(input.derivative, entry.derivative)
  ) {
    return "exact_derivative";
  }

  if (
    entry.engine_family &&
    includesLoose(input.engine_family, entry.engine_family)
  ) {
    return "engine_family";
  }

  if (
    entry.generation &&
    includesLoose(input.generation, entry.generation)
  ) {
    return "model_generation";
  }

  if (
    includesLoose(input.make, entry.make) &&
    includesLoose(input.model, entry.model)
  ) {
    return "make_model_only";
  }

  return null;
}

function getMatchConfidence(score: number): MatchConfidence {
  if (score >= 85) return "high";
  if (score >= 60) return "medium";
  return "low";
}

function getProbabilityScore(
  score: number,
  basis: MatchBasis
): number {
  const basisCap =
    basis === "exact_derivative"
      ? 0.95
      : basis === "engine_family"
        ? 0.85
        : basis === "model_generation"
          ? 0.72
          : 0.58;

  const scaled = score / 100;
  return Math.max(0.2, Math.min(basisCap, Math.round(scaled * 100) / 100));
}

export function scoreVehicleFailureMatch(
  input: MatcherInput,
  entry: VehicleFailureMapEntry
): ScoredVehicleFailureMatch | null {
  if (
    !includesLoose(input.make, entry.make) ||
    !includesLoose(input.model, entry.model)
  ) {
    return null;
  }

  if (!yearMatches(input.year, entry)) {
    return null;
  }

  const reasons: string[] = [];
  let score = 35;

  reasons.push("Make and model matched.");

  if (entry.derivative && includesLoose(input.derivative, entry.derivative)) {
    score += 30;
    reasons.push("Derivative matched.");
  }

  if (
    entry.engine_family &&
    includesLoose(input.engine_family, entry.engine_family)
  ) {
    score += 24;
    reasons.push("Engine family matched.");
  }

  if (entry.engine && includesLoose(input.engine, entry.engine)) {
    score += 18;
    reasons.push("Engine description matched.");
  }

  if (
    entry.engine_code &&
    includesLoose(input.engine_code, entry.engine_code)
  ) {
    score += 18;
    reasons.push("Engine code matched.");
  }

  if (
    entry.engine_size &&
    includesLoose(input.engine_size, entry.engine_size)
  ) {
    score += 10;
    reasons.push("Engine size matched.");
  }

  if (entry.generation && includesLoose(input.generation, entry.generation)) {
    score += 12;
    reasons.push("Generation matched.");
  }

  if (entry.power && includesLoose(input.power, entry.power)) {
    score += 8;
    reasons.push("Power output matched.");
  }

  if (entry.fuel && includesLoose(input.fuel, entry.fuel)) {
    score += 8;
    reasons.push("Fuel type matched.");
  }

  if (
    entry.transmission &&
    includesLoose(input.transmission, entry.transmission)
  ) {
    score += 10;
    reasons.push("Transmission matched.");
  }

  if (input.year && entry.year_from && entry.year_to) {
    const withinRange = input.year >= entry.year_from && input.year <= entry.year_to;
    if (withinRange) {
      score += 6;
      reasons.push("Year falls within mapped range.");
    }
  }

  score = Math.max(0, Math.min(100, score));

  const match_basis = getMatchBasis(input, entry) ?? "make_model_only";
  const match_confidence = getMatchConfidence(score);
  const probability_score = getProbabilityScore(score, match_basis);

  return {
    entry,
    score,
    match_confidence,
    match_basis,
    probability_score,
    reasons,
  };
}

export function scoreVehicleFailureMatches(
  input: MatcherInput,
  entries: VehicleFailureMapEntry[]
): ScoredVehicleFailureMatch[] {
  return entries
    .map((entry) => scoreVehicleFailureMatch(input, entry))
    .filter((match): match is ScoredVehicleFailureMatch => !!match)
    .sort((a, b) => b.score - a.score);
}