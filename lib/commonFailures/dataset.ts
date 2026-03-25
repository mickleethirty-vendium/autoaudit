import dataset from "@/data/commonFailures.json";

export type CommonFailureIssue = {
  code: string;
  title: string;
  severity: "low" | "medium" | "high";
  repairCostMin: number;
  repairCostMax: number;
  warningSigns: string[];
  questionsToAskSeller: string[];
};

export type CommonFailureRecord = {
  id: string;
  make: string;
  model: string;
  generation?: string | null;
  yearStart?: number | null;
  yearEnd?: number | null;
  engineFamily?: string | null;
  engineCode?: string | null;
  engineSize?: string | null;
  fuel?: string | null;
  transmission?: string | null;
  issues: CommonFailureIssue[];
};

export const commonFailureDataset =
  dataset as unknown as CommonFailureRecord[];