import {
  MatchResult,
  MatcherInput,
  ScoredVehicleFailureMatch,
  VehicleFailureMapEntry,
} from "./types";
import { scoreVehicleFailureMatches } from "./scorer";
import {
  buildVehicleIdentityFromMatch,
  dedupeKnownModelIssues,
  mapScoredMatchToKnownIssues,
} from "./mapper";
import { commonFailureDataset } from "./dataset";

let vehicleFailureMapCache: VehicleFailureMapEntry[] | null = null;

async function getVehicleFailureMap(): Promise<VehicleFailureMapEntry[]> {
  if (!vehicleFailureMapCache) {
    vehicleFailureMapCache = commonFailureDataset;
  }

  return vehicleFailureMapCache;
}

function cleanText(value?: string | null) {
  if (!value) return null;

  const cleaned = value
    .trim()
    .toLowerCase()
    .replace(/[\/_,]+/g, " ")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned || null;
}

function normMake(value?: string | null) {
  const cleaned = cleanText(value);
  if (!cleaned) return null;

  const aliasMap: Record<string, string> = {
    vw: "volkswagen",
    mercedes: "mercedes-benz",
    "mercedes benz": "mercedes-benz",
    mercedesbenz: "mercedes-benz",
    merc: "mercedes-benz",
    "range rover": "range rover",
  };

  return aliasMap[cleaned] ?? cleaned;
}

function stripCommonTrimWords(value: string) {
  return value
    .replace(
      /\b(zetec|titanium|st line|st-line|m sport|msport|sport|amg line|s line|se|sel|match|gt|gti|r line|r-line|black edition|edition|design|tech|business edition|m sport shadow edition|shadow edition|exclusive|lux|premium|plus|nav|line|xdrive|quattro|s tronic|stronic|dsg)\b/g,
      " "
    )
    .replace(/\s+/g, " ")
    .trim();
}

function normModel(value?: string | null) {
  const cleaned = cleanText(value);
  if (!cleaned) return null;

  const model = stripCommonTrimWords(cleaned);

  const exactMap: Record<string, string> = {
    "1 series": "1 series",
    "1 series 5dr": "1 series",
    "2 series": "2 series",
    "3 series": "3 series",
    "4 series": "4 series",
    "5 series": "5 series",
    "a class": "a class",
    "a class hatchback": "a class",
    aclass: "a class",
    "a-class": "a class",
    "c class": "c class",
    "c class saloon": "c class",
    "c class estate": "c class",
    "e class": "e class",
    "e class saloon": "e class",
    "e class estate": "e class",
    crv: "cr-v",
    "cr v": "cr-v",
    "range rover evoque": "evoque",
    evoque: "evoque",
    "freelander 2": "freelander",
    freelander2: "freelander",
    "mini hatch": "hatch",
    cooper: "hatch",
  };

  if (exactMap[model]) return exactMap[model];

  if (model.includes("1 series")) return "1 series";
  if (model.includes("2 series")) return "2 series";
  if (model.includes("3 series")) return "3 series";
  if (model.includes("4 series")) return "4 series";
  if (model.includes("5 series")) return "5 series";
  if (/^a\s?\d{3}/.test(model)) return "a class";
  if (model.includes("a class") || model.includes("aclass")) return "a class";
  if (model.includes("c class")) return "c class";
  if (model.includes("e class")) return "e class";
  if (model.includes("cr v") || model.includes("crv")) return "cr-v";
  if (model.includes("range rover evoque")) return "evoque";
  if (model.includes("freelander 2")) return "freelander";
  if (model.includes("golf")) return "golf";
  if (model.includes("fiesta")) return "fiesta";
  if (model.includes("focus")) return "focus";
  if (model.includes("octavia")) return "octavia";
  if (model.includes("leon")) return "leon";
  if (model.includes("passat")) return "passat";
  if (model.includes("a3")) return "a3";
  if (model.includes("a4")) return "a4";
  if (model.includes("astra")) return "astra";
  if (model.includes("corsa")) return "corsa";
  if (model.includes("insignia")) return "insignia";
  if (model.includes("208")) return "208";
  if (model.includes("308")) return "308";
  if (model.includes("c4")) return "c4";
  if (model.includes("mazda 3") || model === "3") return "3";
  if (model.includes("qashqai")) return "qashqai";
  if (model.includes("clio")) return "clio";
  if (model.includes("megane")) return "megane";
  if (model.includes("cooper") || model.includes("mini hatch")) return "hatch";
  if (model.includes("avensis")) return "avensis";
  if (model.includes("civic")) return "civic";
  if (model.includes("ix35")) return "ix35";
  if (model.includes("sportage")) return "sportage";
  if (model.includes("yaris")) return "yaris";

  return model;
}

function normEngine(value?: string | null) {
  const cleaned = cleanText(value);
  if (!cleaned) return null;

  return cleaned
    .replace(/\bcc\b/g, "")
    .replace(/\blitre\b/g, "")
    .replace(/\bliter\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normEngineFamily(value?: string | null) {
  const cleaned = cleanText(value);
  if (!cleaned) return null;

  if (cleaned.includes("ecoboost")) return "ecoboost";
  if (cleaned.includes("n47")) return "n47";
  if (cleaned.includes("ea888")) return "ea888";
  if (cleaned.includes("ea189")) return "ea189";
  if (cleaned.includes("om651")) return "om651";
  if (cleaned.includes("puretech")) return "puretech";
  if (cleaned.includes("prince")) return "prince";

  return cleaned;
}

function normEngineSize(value?: string | null) {
  const cleaned = cleanText(value);
  if (!cleaned) return null;

  const numeric = cleaned.replace(/[^\d.]/g, "");
  if (!numeric) return cleaned;

  const asNumber = Number(numeric);
  if (!Number.isFinite(asNumber)) return cleaned;

  if (asNumber >= 700 && asNumber <= 7000) {
    return (Math.round((asNumber / 1000) * 10) / 10).toFixed(1);
  }

  if (asNumber > 0 && asNumber < 10) {
    return asNumber.toFixed(1);
  }

  return cleaned;
}

function normPower(value?: string | null) {
  const cleaned = cleanText(value);
  if (!cleaned) return null;

  const numeric = cleaned.replace(/[^\d.]/g, "");
  if (!numeric) return cleaned;

  const asNumber = Number(numeric);
  if (!Number.isFinite(asNumber)) return cleaned;

  return String(Math.round(asNumber));
}

function normFuel(value?: string | null) {
  const cleaned = cleanText(value);
  if (!cleaned) return null;

  if (cleaned.includes("petrol")) return "petrol";
  if (cleaned.includes("diesel")) return "diesel";
  if (cleaned.includes("hybrid")) return "hybrid";
  if (cleaned.includes("electric") || cleaned === "ev") return "ev";

  return cleaned;
}

function normTransmission(value?: string | null) {
  const cleaned = cleanText(value);
  if (!cleaned) return null;

  if (cleaned === "manual") return "manual";
  if (cleaned === "automatic") return "automatic";
  if (cleaned === "auto") return "automatic";
  if (cleaned === "cvt") return "cvt";
  if (cleaned === "dsg") return "dct";
  if (cleaned === "dct") return "dct";
  if (
    cleaned === "semi automatic" ||
    cleaned === "semi automatic transmission" ||
    cleaned === "semi-automatic"
  ) {
    return "automatic";
  }

  return cleaned;
}

function normaliseMatcherInput(input: MatcherInput): MatcherInput {
  const normalisedEngineSize = normEngineSize(input.engine_size);
  const normalisedEngine = normEngine(input.engine) ?? normalisedEngineSize;

  return {
    registration: input.registration ?? null,
    make: normMake(input.make),
    model: normModel(input.model),
    derivative: cleanText(input.derivative),
    generation: cleanText(input.generation),
    engine: normalisedEngine,
    engine_family: normEngineFamily(input.engine_family),
    engine_code: cleanText(input.engine_code),
    engine_size: normalisedEngineSize,
    power: normPower(input.power),
    fuel: normFuel(input.fuel),
    transmission: normTransmission(input.transmission),
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

function buildFallbackVehicleIdentity(input: MatcherInput) {
  return {
    make: input.make ?? null,
    model: input.model ?? null,
    derivative: input.derivative ?? null,
    generation: input.generation ?? null,
    engine: input.engine ?? null,
    engine_family: input.engine_family ?? null,
    engine_code: input.engine_code ?? null,
    engine_size: input.engine_size ?? null,
    power: input.power ?? null,
    fuel: input.fuel ?? null,
    transmission: input.transmission ?? null,
    year: input.year ?? null,
  };
}

function matchBasisWeight(basis?: string | null) {
  if (basis === "exact_derivative") return 4;
  if (basis === "engine_family") return 3;
  if (basis === "model_generation") return 2;
  return 1;
}

function entrySpecificity(entry: VehicleFailureMapEntry) {
  let score = 0;
  if (entry.derivative) score += 5;
  if (entry.engine_code) score += 4;
  if (entry.engine_family) score += 3;
  if (entry.generation) score += 2;
  if (entry.engine) score += 2;
  if (entry.engine_size) score += 1;
  if (entry.power) score += 1;
  if (entry.fuel) score += 1;
  if (entry.transmission) score += 1;
  return score;
}

function getIssueIdentityKey(match: ScoredVehicleFailureMatch, issue: any) {
  const issueCode =
    typeof issue?.issue_code === "string" && issue.issue_code.trim()
      ? issue.issue_code.trim().toLowerCase()
      : null;

  if (issueCode) return issueCode;

  const label =
    typeof issue?.label === "string" && issue.label.trim()
      ? issue.label.trim().toLowerCase()
      : "unknown";

  const category =
    typeof issue?.category === "string" && issue.category.trim()
      ? issue.category.trim().toLowerCase()
      : "unknown";

  return `${category}::${label}::${match.entry.make}::${match.entry.model}`;
}

function selectBestMatches(
  scoredMatches: ScoredVehicleFailureMatch[]
): ScoredVehicleFailureMatch[] {
  if (!scoredMatches.length) return [];

  const selected = new Map<string, ScoredVehicleFailureMatch>();

  for (const match of scoredMatches) {
    const mappedIssues = mapScoredMatchToKnownIssues(match);
    if (!mappedIssues.length) continue;

    for (const issue of mappedIssues) {
      const key = getIssueIdentityKey(match, issue);
      const existing = selected.get(key);

      if (!existing) {
        selected.set(key, match);
        continue;
      }

      const currentBasisWeight = matchBasisWeight(match.match_basis);
      const existingBasisWeight = matchBasisWeight(existing.match_basis);

      const currentSpecificity = entrySpecificity(match.entry);
      const existingSpecificity = entrySpecificity(existing.entry);

      const shouldReplace =
        match.score > existing.score + 6 ||
        (currentBasisWeight > existingBasisWeight &&
          match.score >= existing.score - 4) ||
        (currentSpecificity > existingSpecificity &&
          match.score >= existing.score - 3);

      if (shouldReplace) {
        selected.set(key, match);
      }
    }
  }

  return Array.from(new Set(selected.values())).sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;

    const basisDelta =
      matchBasisWeight(b.match_basis) - matchBasisWeight(a.match_basis);
    if (basisDelta !== 0) return basisDelta;

    return entrySpecificity(b.entry) - entrySpecificity(a.entry);
  });
}

export async function matchKnownModelIssues(
  input: MatcherInput
): Promise<MatchResult> {
  const normalisedInput = normaliseMatcherInput(input);

  if (!normalisedInput.make || !normalisedInput.model) {
    return {
      vehicleIdentity: null,
      knownModelIssues: [],
    };
  }

  const vehicleFailureMap = await getVehicleFailureMap();

  const scoredMatches = scoreVehicleFailureMatches(
    normalisedInput,
    vehicleFailureMap
  );

  const bestMatch = chooseBestMatch(scoredMatches);

  if (!bestMatch) {
    return {
      vehicleIdentity: buildFallbackVehicleIdentity(normalisedInput),
      knownModelIssues: [],
    };
  }

  const selectedMatches = selectBestMatches(scoredMatches).slice(0, 8);

  const candidateIssues = selectedMatches.flatMap((match) =>
    mapScoredMatchToKnownIssues(match)
  );

  const dedupedIssues = dedupeKnownModelIssues(candidateIssues).filter(
    (issue) => (issue.probability_score ?? 0) >= 0.45
  );

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