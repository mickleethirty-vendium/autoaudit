import { vehicleFailureMap } from "./vehicleFailureMap";
import {
  MatchResult,
  MatcherInput,
  ScoredVehicleFailureMatch,
} from "./types";
import { scoreVehicleFailureMatches } from "./scorer";
import {
  buildVehicleIdentityFromMatch,
  dedupeKnownModelIssues,
  mapScoredMatchToKnownIssues,
} from "./mapper";

function norm(value?: string | null) {
  return value ? value.trim().toLowerCase() : null;
}

function normaliseMatcherInput(input: MatcherInput): MatcherInput {
  return {
    registration: input.registration ?? null,
    make: norm(input.make),
    model: norm(input.model),
    derivative: norm(input.derivative),
    generation: norm(input.generation),
    engine: norm(input.engine),
    engine_family: norm(input.engine_family),
    engine_code: norm(input.engine_code),
    engine_size: norm(input.engine_size),
    power: norm(input.power),
    fuel: norm(input.fuel),
    transmission: norm(input.transmission),
    year:
      typeof input.year === "number" && Number.isFinite(input.year)
        ? Math.round(input.year)
        : null,
    mileage:
      typeof input.mileage === "number" && Number.isFinite(input.mileage)
        ? Math.round(input.mileage)
        : null,
  };
}

function chooseBestMatch(
  matches: ScoredVehicleFailureMatch[]
): ScoredVehicleFailureMatch | null {
  if (!matches.length) return null;
  return matches[0];
}

export function matchKnownModelIssues(input: MatcherInput): MatchResult {
  const normalisedInput = normaliseMatcherInput(input);

  if (!normalisedInput.make || !normalisedInput.model) {
    return {
      vehicleIdentity: null,
      knownModelIssues: [],
    };
  }

  const scoredMatches = scoreVehicleFailureMatches(
    normalisedInput,
    vehicleFailureMap
  );

  const bestMatch = chooseBestMatch(scoredMatches);

  if (!bestMatch) {
    return {
      vehicleIdentity: {
        make: normalisedInput.make ?? null,
        model: normalisedInput.model ?? null,
        derivative: normalisedInput.derivative ?? null,
        generation: normalisedInput.generation ?? null,
        engine: normalisedInput.engine ?? null,
        engine_family: normalisedInput.engine_family ?? null,
        engine_code: normalisedInput.engine_code ?? null,
        engine_size: normalisedInput.engine_size ?? null,
        power: normalisedInput.power ?? null,
        fuel: normalisedInput.fuel ?? null,
        transmission: normalisedInput.transmission ?? null,
        year: normalisedInput.year ?? null,
      },
      knownModelIssues: [],
    };
  }

  const candidateIssues = scoredMatches.flatMap((match) =>
    mapScoredMatchToKnownIssues(match)
  );

  const dedupedIssues = dedupeKnownModelIssues(candidateIssues);

  const vehicleIdentity = {
    ...(buildVehicleIdentityFromMatch(bestMatch) ?? {}),
    make: normalisedInput.make ?? bestMatch.entry.make ?? null,
    model: normalisedInput.model ?? bestMatch.entry.model ?? null,
    derivative:
      normalisedInput.derivative ?? bestMatch.entry.derivative ?? null,
    generation:
      normalisedInput.generation ?? bestMatch.entry.generation ?? null,
    engine: normalisedInput.engine ?? bestMatch.entry.engine ?? null,
    engine_family:
      normalisedInput.engine_family ?? bestMatch.entry.engine_family ?? null,
    engine_code:
      normalisedInput.engine_code ?? bestMatch.entry.engine_code ?? null,
    engine_size:
      normalisedInput.engine_size ?? bestMatch.entry.engine_size ?? null,
    power: normalisedInput.power ?? bestMatch.entry.power ?? null,
    fuel: normalisedInput.fuel ?? bestMatch.entry.fuel ?? null,
    transmission:
      normalisedInput.transmission ?? bestMatch.entry.transmission ?? null,
    year: normalisedInput.year ?? null,
  };

  return {
    vehicleIdentity,
    knownModelIssues: dedupedIssues,
  };
}