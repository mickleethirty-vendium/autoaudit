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

function parsePower(value?: string | null): number | null {
  const v = norm(value);
  if (!v) return null;

  const numeric = v.replace(/[^\d.]/g, "");
  if (!numeric) return null;

  const parsed = Number(numeric);
  if (!Number.isFinite(parsed)) return null;

  return Math.round(parsed);
}

function powerMatches(a?: string | null, b?: string | null) {
  const pa = parsePower(a);
  const pb = parsePower(b);

  if (pa !== null && pb !== null) {
    return Math.abs(pa - pb) <= 8;
  }

  return includesLoose(a, b);
}

function hasPower(value?: string | null) {
  return parsePower(value) !== null;
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

function derivativeMatched(
  input: MatcherInput,
  entry: VehicleFailureMapEntry
) {
  return !!entry.derivative && includesLoose(input.derivative, entry.derivative);
}

function engineCodeMatched(
  input: MatcherInput,
  entry: VehicleFailureMapEntry
) {
  return !!entry.engine_code && includesLoose(input.engine_code, entry.engine_code);
}

function engineFamilyMatched(
  input: MatcherInput,
  entry: VehicleFailureMapEntry
) {
  return !!entry.engine_family &&
    (includesLoose(input.engine_family, entry.engine_family) ||
      includesLoose(input.engine, entry.engine_family));
}

function generationMatched(
  input: MatcherInput,
  entry: VehicleFailureMapEntry
) {
  return !!entry.generation && includesLoose(input.generation, entry.generation);
}

function getMatchBasis(
  input: MatcherInput,
  entry: VehicleFailureMapEntry
): MatchBasis | null {
  if (derivativeMatched(input, entry)) {
    return "exact_derivative";
  }

  if (engineCodeMatched(input, entry) || engineFamilyMatched(input, entry)) {
    return "engine_family";
  }

  if (
    generationMatched(input, entry) &&
    includesLoose(input.make, entry.make) &&
    includesLoose(input.model, entry.model)
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
  if (score >= 84) return "high";
  if (score >= 58) return "medium";
  return "low";
}

function getProbabilityScore(score: number, basis: MatchBasis): number {
  const basisCap =
    basis === "exact_derivative"
      ? 0.96
      : basis === "engine_family"
        ? 0.9
        : basis === "model_generation"
          ? 0.78
          : 0.62;

  const scaled = score / 100;
  return Math.max(0.2, Math.min(basisCap, Math.round(scaled * 100) / 100));
}

function isBroadEntry(entry: VehicleFailureMapEntry) {
  return (
    !entry.derivative &&
    !entry.engine &&
    !entry.engine_family &&
    !entry.engine_code &&
    !entry.generation
  );
}

function isSpecificPowerEntry(entry: VehicleFailureMapEntry) {
  return hasPower(entry.power);
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
  const inputHasPower = hasPower(input.power);
  const broadEntry = isBroadEntry(entry);

  const reasons: string[] = [];
  let score = 40;

  reasons.push("Make and model matched.");

  if (derivativeMatched(input, entry)) {
    score += 30;
    reasons.push("Derivative matched.");
  } else if (entry.derivative && input.derivative && !includesLoose(input.derivative, entry.derivative)) {
    score -= 10;
    reasons.push("Derivative differs from mapped pattern.");
  }

  if (engineCodeMatched(input, entry)) {
    score += 28;
    reasons.push("Engine code matched.");
  } else if (entry.engine_code && input.engine_code) {
    score -= 12;
    reasons.push("Engine code differs from mapped pattern.");
  }

  if (engineFamilyMatched(input, entry)) {
    score += 22;
    reasons.push("Engine family matched.");
  } else if (entry.engine_family && (input.engine_family || input.engine)) {
    score -= broadEntry ? 0 : 8;
    reasons.push("Engine family differs from mapped pattern.");
  }

  if (entry.engine && includesLoose(input.engine, entry.engine)) {
    score += 14;
    reasons.push("Engine description matched.");
  } else if (entry.engine && input.engine && !broadEntry) {
    score -= 4;
    reasons.push("Engine description differs from mapped pattern.");
  }

  if (entryHasEngineSize && inputHasEngineSize) {
    if (engineSizeMatches(input.engine_size, entry.engine_size)) {
      score += 10;
      reasons.push("Engine size matched.");
    } else if (!broadEntry) {
      score -= 10;
      reasons.push("Engine size differs from mapped pattern.");
    }
  } else if (entryHasEngineSize && !inputHasEngineSize) {
    score += 2;
    reasons.push("Engine size not provided, so broad fallback scoring used.");
  }

  if (generationMatched(input, entry)) {
    score += 14;
    reasons.push("Generation matched.");
  } else if (entry.generation && input.generation && !broadEntry) {
    score -= 4;
    reasons.push("Generation differs from mapped pattern.");
  }

  if (entry.power && input.power) {
    if (powerMatches(input.power, entry.power)) {
      score += 6;
      reasons.push("Power output matched.");
    } else if (isSpecificPowerEntry(entry)) {
      score -= 4;
      reasons.push("Power output differs from mapped pattern.");
    }
  } else if (entry.power && !inputHasPower) {
    score += 1;
    reasons.push("Power not provided, so power-specific scoring was limited.");
  }

  if (entry.fuel && includesLoose(input.fuel, entry.fuel)) {
    score += 10;
    reasons.push("Fuel type matched.");
  } else if (!entry.fuel && input.fuel) {
    score += 1;
    reasons.push("Broad fuel-agnostic pattern used.");
  }

  if (
    entry.transmission &&
    input.transmission &&
    includesLoose(input.transmission, entry.transmission)
  ) {
    score += 8;
    reasons.push("Transmission matched.");
  } else if (!entry.transmission && input.transmission) {
    score += 1;
    reasons.push("Broad transmission-agnostic pattern used.");
  }

  if (input.year && entry.year_from && entry.year_to) {
    const withinRange =
      input.year >= entry.year_from && input.year <= entry.year_to;
    if (withinRange) {
      score += 10;
      reasons.push("Year falls within mapped range.");
    }
  } else if (input.year && (entry.year_from || entry.year_to)) {
    score += 4;
    reasons.push("Broad year-range pattern matched.");
  }

  if (
    !entry.engine &&
    !entry.engine_family &&
    !entry.engine_code &&
    entryHasEngineSize &&
    inputHasEngineSize &&
    engineSizeMatches(input.engine_size, entry.engine_size)
  ) {
    score += 4;
    reasons.push("Broad engine-size fallback applied.");
  }

  if (
    broadEntry &&
    input.fuel &&
    entry.fuel &&
    includesLoose(input.fuel, entry.fuel)
  ) {
    score += 3;
    reasons.push("Broad fuel-specific pattern matched.");
  }

  if (
    broadEntry &&
    input.transmission &&
    entry.transmission &&
    includesLoose(input.transmission, entry.transmission)
  ) {
    score += 3;
    reasons.push("Broad transmission-specific pattern matched.");
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
    .filter((match) => match.score >= 45)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;

      const basisWeight = (basis: MatchBasis) =>
        basis === "exact_derivative"
          ? 4
          : basis === "engine_family"
            ? 3
            : basis === "model_generation"
              ? 2
              : 1;

      return basisWeight(b.match_basis) - basisWeight(a.match_basis);
    });
}