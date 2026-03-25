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

function parseEngineSize(value?: string | null): number | null {
  const v = norm(value);
  if (!v) return null;

  const numeric = v.replace(/[^\d.]/g, "");
  if (!numeric) return null;

  const parsed = Number(numeric);
  if (!Number.isFinite(parsed)) return null;

  if (parsed >= 700 && parsed <= 7000) {
    return Math.round((parsed / 1000) * 10) / 10;
  }

  if (parsed > 0 && parsed < 10) {
    return Math.round(parsed * 10) / 10;
  }

  return null;
}

function numericEngineSizeMatches(a?: string | null, b?: string | null) {
  const pa = parseEngineSize(a);
  const pb = parseEngineSize(b);

  if (pa === null || pb === null) return false;

  return Math.abs(pa - pb) <= 0.1;
}

function engineSizeMatches(a?: string | null, b?: string | null) {
  return includesLoose(a, b) || numericEngineSizeMatches(a, b);
}

function hasEngineSize(value?: string | null) {
  return parseEngineSize(value) !== null;
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
  if (entry.derivative && includesLoose(input.derivative, entry.derivative)) {
    return "exact_derivative";
  }

  if (
    entry.engine_family &&
    (includesLoose(input.engine_family, entry.engine_family) ||
      includesLoose(input.engine, entry.engine_family))
  ) {
    return "engine_family";
  }

  if (entry.generation && includesLoose(input.generation, entry.generation)) {
    return "model_generation";
  }

  if (
    includesLoose(input.make, entry.make) &&
    includesLoose(input.model, entry.model)
  ) {
    if (
      entry.engine &&
      includesLoose(input.engine, entry.engine)
    ) {
      return "model_generation";
    }

    if (
      entry.engine_size &&
      engineSizeMatches(input.engine_size, entry.engine_size)
    ) {
      return "model_generation";
    }

    return "make_model_only";
  }

  return null;
}

function getMatchConfidence(score: number): MatchConfidence {
  if (score >= 82) return "high";
  if (score >= 55) return "medium";
  return "low";
}

function getProbabilityScore(score: number, basis: MatchBasis): number {
  const basisCap =
    basis === "exact_derivative"
      ? 0.95
      : basis === "engine_family"
        ? 0.88
        : basis === "model_generation"
          ? 0.76
          : 0.62;

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

  if (entry.fuel && input.fuel && !includesLoose(input.fuel, entry.fuel)) {
    return null;
  }

  if (
    entry.transmission &&
    input.transmission &&
    !includesLoose(input.transmission, entry.transmission)
  ) {
    return null;
  }

  const inputHasEngineSize = hasEngineSize(input.engine_size);
  const entryHasEngineSize = hasEngineSize(entry.engine_size);

  const reasons: string[] = [];
  let score = 45;

  reasons.push("Make and model matched.");

  if (entry.derivative && includesLoose(input.derivative, entry.derivative)) {
    score += 28;
    reasons.push("Derivative matched.");
  }

  if (
    entry.engine_family &&
    (includesLoose(input.engine_family, entry.engine_family) ||
      includesLoose(input.engine, entry.engine_family))
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

  if (entryHasEngineSize && inputHasEngineSize) {
    if (engineSizeMatches(input.engine_size, entry.engine_size)) {
      score += 16;
      reasons.push("Engine size matched.");
    } else {
      score -= 10;
      reasons.push("Engine size differs from mapped pattern.");
    }
  } else if (entryHasEngineSize && !inputHasEngineSize) {
    score += 4;
    reasons.push("Engine size not provided, so broad fallback scoring used.");
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
    score += 10;
    reasons.push("Fuel type matched.");
  }

  if (
    entry.transmission &&
    input.transmission &&
    includesLoose(input.transmission, entry.transmission)
  ) {
    score += 8;
    reasons.push("Transmission matched.");
  }

  if (input.year && entry.year_from && entry.year_to) {
    const withinRange =
      input.year >= entry.year_from && input.year <= entry.year_to;
    if (withinRange) {
      score += 8;
      reasons.push("Year falls within mapped range.");
    }
  }

  if (
    !entry.engine &&
    !entry.engine_family &&
    entryHasEngineSize &&
    inputHasEngineSize &&
    engineSizeMatches(input.engine_size, entry.engine_size)
  ) {
    score += 6;
    reasons.push("Broad engine-size fallback applied.");
  }

  if (
    !entry.engine &&
    !entry.engine_family &&
    entryHasEngineSize &&
    !inputHasEngineSize
  ) {
    score += 6;
    reasons.push("Make/model/fuel/year fallback applied without engine-size input.");
  }

  if (
    entry.fuel &&
    !entry.transmission &&
    includesLoose(input.fuel, entry.fuel)
  ) {
    score += 2;
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