import { failureLibrary } from "./failureLibrary";
import {
  FailureCategory,
  KnownModelIssue,
  ScoredVehicleFailureMatch,
  VehicleIdentity,
} from "./types";

function uniqueStrings(values: Array<string | undefined | null>) {
  return Array.from(
    new Set(values.filter((value): value is string => !!value && !!value.trim()))
  );
}

function inferCategoryFromIssue(
  code?: string | null,
  title?: string | null
): FailureCategory {
  const text = `${code ?? ""} ${title ?? ""}`.toLowerCase();

  if (
    text.includes("timing") ||
    text.includes("chain") ||
    text.includes("belt") ||
    text.includes("camshaft")
  ) {
    return "timing";
  }

  if (text.includes("turbo") || text.includes("boost")) {
    return "turbo";
  }

  if (
    text.includes("coolant") ||
    text.includes("water pump") ||
    text.includes("thermostat") ||
    text.includes("overheat")
  ) {
    return "cooling";
  }

  if (
    text.includes("gearbox") ||
    text.includes("dsg") ||
    text.includes("dct") ||
    text.includes("cvt") ||
    text.includes("powershift") ||
    text.includes("easytronic") ||
    text.includes("transmission")
  ) {
    return "transmission";
  }

  if (
    text.includes("dpf") ||
    text.includes("egr") ||
    text.includes("emission")
  ) {
    return "emissions";
  }

  if (
    text.includes("injector") ||
    text.includes("fuel") ||
    text.includes("diesel smell")
  ) {
    return "fuel_system";
  }

  if (
    text.includes("electrical") ||
    text.includes("sensor") ||
    text.includes("module") ||
    text.includes("abs") ||
    text.includes("esp")
  ) {
    return "electrical";
  }

  if (
    text.includes("clutch") ||
    text.includes("dmf") ||
    text.includes("flywheel") ||
    text.includes("drivetrain")
  ) {
    return "drivetrain";
  }

  if (text.includes("hybrid")) return "hybrid_system";
  if (text.includes("ev") || text.includes("battery")) return "ev_system";

  return "engine";
}

export function buildVehicleIdentityFromMatch(
  match: ScoredVehicleFailureMatch | null
): VehicleIdentity | null {
  if (!match) return null;

  const entry = match.entry;

  return {
    make: entry.make ?? null,
    model: entry.model ?? null,
    derivative: entry.derivative ?? null,
    generation: entry.generation ?? null,
    engine: entry.engine ?? null,
    engine_family: entry.engine_family ?? null,
    engine_code: entry.engine_code ?? null,
    engine_size: entry.engine_size ?? null,
    power: entry.power ?? null,
    fuel: entry.fuel ?? null,
    transmission: entry.transmission ?? null,
    year: null,
  };
}

export function mapScoredMatchToKnownIssues(
  match: ScoredVehicleFailureMatch
): KnownModelIssue[] {
  const directIssues = Array.isArray(match.entry.issues) ? match.entry.issues : [];

  if (directIssues.length > 0) {
    const parsedDirect = directIssues.map((issue): KnownModelIssue => {
      const reasons = uniqueStrings([match.reasons.join(" "), issue.title]);

      return {
        issue_code: issue.code,
        label: issue.title,
        category: inferCategoryFromIssue(issue.code, issue.title),
        severity: issue.severity,
        cost_low: issue.repairCostMin,
        cost_high: issue.repairCostMax,
        why_flagged:
          reasons[0] ??
          "Matched against known model-specific issue patterns for this vehicle.",
        why_it_matters: issue.title,
        questions_to_ask: issue.questionsToAskSeller ?? [],
        red_flags: issue.warningSigns ?? [],
        match_confidence: match.match_confidence,
        match_basis: match.match_basis,
        probability_score: match.probability_score,
      };
    });

    return parsedDirect;
  }

  const failureCodes = Array.isArray(match.entry.failure_codes)
    ? match.entry.failure_codes
    : [];

  const parsedFromLibrary = failureCodes.map(
    (failureCode): KnownModelIssue | null => {
      const pattern = failureLibrary[failureCode];
      if (!pattern) return null;

      const reasons = uniqueStrings([
        match.reasons.join(" "),
        pattern.description,
      ]);

      return {
        issue_code: pattern.code,
        label: pattern.label,
        category: pattern.category,
        severity: pattern.severity,
        cost_low: pattern.cost_low,
        cost_high: pattern.cost_high,
        why_flagged:
          reasons[0] ??
          "Matched against known model-specific issue patterns for this vehicle.",
        why_it_matters: pattern.why_it_matters,
        questions_to_ask: pattern.questions_to_ask,
        red_flags: pattern.red_flags,
        match_confidence: match.match_confidence,
        match_basis: match.match_basis,
        probability_score: match.probability_score,
      };
    }
  );

  return parsedFromLibrary.filter(
    (issue): issue is KnownModelIssue => issue !== null
  );
}

export function dedupeKnownModelIssues(
  issues: KnownModelIssue[]
): KnownModelIssue[] {
  const byCode = new Map<string, KnownModelIssue>();

  for (const issue of issues) {
    const existing = byCode.get(issue.issue_code);

    if (!existing) {
      byCode.set(issue.issue_code, issue);
      continue;
    }

    const existingScore = existing.probability_score ?? 0;
    const nextScore = issue.probability_score ?? 0;

    if (nextScore > existingScore) {
      byCode.set(issue.issue_code, issue);
      continue;
    }

    if (nextScore === existingScore) {
      const existingConfidenceRank =
        existing.match_confidence === "high"
          ? 3
          : existing.match_confidence === "medium"
            ? 2
            : 1;

      const nextConfidenceRank =
        issue.match_confidence === "high"
          ? 3
          : issue.match_confidence === "medium"
            ? 2
            : 1;

      if (nextConfidenceRank > existingConfidenceRank) {
        byCode.set(issue.issue_code, issue);
      }
    }
  }

  return [...byCode.values()].sort((a, b) => {
    const aScore = a.probability_score ?? 0;
    const bScore = b.probability_score ?? 0;
    if (bScore !== aScore) return bScore - aScore;
    return (b.cost_high ?? 0) - (a.cost_high ?? 0);
  });
}