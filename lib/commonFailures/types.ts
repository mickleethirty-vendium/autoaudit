export type MatchConfidence = "high" | "medium" | "low";

export type MatchBasis =
  | "exact_derivative"
  | "engine_family"
  | "model_generation"
  | "make_model_only";

export type FailureSeverity = "low" | "medium" | "high";

export type FailureCategory =
  | "engine"
  | "timing"
  | "turbo"
  | "cooling"
  | "drivetrain"
  | "transmission"
  | "electrical"
  | "electronics"
  | "suspension"
  | "steering"
  | "brakes"
  | "emissions"
  | "fuel_system"
  | "hybrid_system"
  | "ev_system"
  | "body"
  | "interior"
  | "general_maintenance_risk";

export type VehicleIdentity = {
  make?: string | null;
  model?: string | null;
  derivative?: string | null;
  generation?: string | null;
  engine?: string | null;
  engine_family?: string | null;
  engine_code?: string | null;
  engine_size?: string | null;
  power?: string | null;
  fuel?: string | null;
  transmission?: string | null;
  year?: number | null;
};

export type FailurePattern = {
  code: string;
  label: string;
  category: FailureCategory;
  severity: FailureSeverity;
  cost_low: number;
  cost_high: number;
  description: string;
  why_it_matters?: string;
  questions_to_ask?: string[];
  red_flags?: string[];
};

export type VehicleFailureMapIssue = {
  code: string;
  title: string;
  severity: FailureSeverity;
  repairCostMin: number;
  repairCostMax: number;
  warningSigns?: string[];
  questionsToAskSeller?: string[];
};

export type VehicleFailureMapEntry = {
  id: string;
  make: string;
  model: string;

  derivative?: string | null;
  generation?: string | null;
  engine?: string | null;
  engine_family?: string | null;
  engine_code?: string | null;
  engine_size?: string | null;
  power?: string | null;
  fuel?: string | null;
  transmission?: string | null;

  year_from?: number | null;
  year_to?: number | null;

  issues?: VehicleFailureMapIssue[];
  failure_codes?: string[];
};

export type KnownModelIssue = {
  issue_code: string;
  label: string;
  category: FailureCategory;
  severity?: FailureSeverity;
  cost_low: number;
  cost_high: number;
  why_flagged: string;
  why_it_matters?: string;
  questions_to_ask?: string[];
  red_flags?: string[];
  match_confidence: MatchConfidence;
  match_basis: MatchBasis;
  probability_score?: number;
};

export type MatchResult = {
  vehicleIdentity: VehicleIdentity | null;
  knownModelIssues: KnownModelIssue[];
};

export type MatcherInput = {
  registration?: string | null;
  make?: string | null;
  model?: string | null;
  derivative?: string | null;
  generation?: string | null;
  engine?: string | null;
  engine_family?: string | null;
  engine_code?: string | null;
  engine_size?: string | null;
  power?: string | null;
  fuel?: string | null;
  transmission?: string | null;
  year?: number | null;
  mileage?: number | null;
};

export type ScoredVehicleFailureMatch = {
  entry: VehicleFailureMapEntry;
  score: number;
  match_confidence: MatchConfidence;
  match_basis: MatchBasis;
  probability_score: number;
  reasons: string[];
};