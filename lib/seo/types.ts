export type MakeModelSeed = {
  make: string;
  make_slug: string;
  model: string;
  model_slug: string;
  full_slug: string;
  priority_tier: number;
  launch_wave: number;
  market_status: string;
  seed_source_type: string;
  source_url?: string;
};

export type ProblemTypeSeed = {
  problem_slug: string;
  problem_name: string;
  category: string;
  severity: "low" | "medium" | "high";
  repair_cost_low_gbp: number;
  repair_cost_high_gbp: number;
  headline_template?: string;
  symptoms_summary?: string;
  source_url?: string;
};

export type MotAdvisorySeed = {
  advisory_slug: string;
  advisory_label: string;
  mot_section: string;
  category: string;
  linked_problem_family?: string;
  notes?: string;
  source_url?: string;
};
