export { failureLibrary } from "./failureLibrary";
export { vehicleFailureMap } from "./vehicleFailureMap";

export { scoreVehicleFailureMatch, scoreVehicleFailureMatches } from "./scorer";

export {
  buildVehicleIdentityFromMatch,
  mapScoredMatchToKnownIssues,
  dedupeKnownModelIssues,
} from "./mapper";

export { matchKnownModelIssues } from "./matcher";

export type {
  MatchConfidence,
  MatchBasis,
  FailureSeverity,
  FailureCategory,
  VehicleIdentity,
  FailurePattern,
  VehicleFailureMapEntry,
  KnownModelIssue,
  MatchResult,
  MatcherInput,
  ScoredVehicleFailureMatch,
} from "./types";