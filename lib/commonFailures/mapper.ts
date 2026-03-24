import { failureLibrary } from "./failureLibrary";
import {
  KnownModelIssue,
  ScoredVehicleFailureMatch,
  VehicleIdentity,
} from "./types";

function uniqueStrings(values: Array<string | undefined | null>) {
  return Array.from(
    new Set(values.filter((value): value is string => !!value && !!value.trim()))
  );
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
  const parsed = match.entry.failure_codes.map(
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

  return parsed.filter((issue): issue is KnownModelIssue => issue !== null);
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