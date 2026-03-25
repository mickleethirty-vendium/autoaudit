import rawDataset from "@/data/commonFailures.json";

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

function normaliseMake(value?: string | null) {
  const cleaned = cleanText(value);
  if (!cleaned) return null;

  const aliasMap: Record<string, string> = {
    vw: "volkswagen",
    "mercedes benz": "mercedes-benz",
    mercedesbenz: "mercedes-benz",
    merc: "mercedes-benz",
  };

  return aliasMap[cleaned] ?? cleaned;
}

function normaliseModel(value?: string | null) {
  const cleaned = cleanText(value);
  if (!cleaned) return null;

  const exactMap: Record<string, string> = {
    "a class": "a class",
    "a class hatchback": "a class",
    aclass: "a class",
    "a-class": "a class",
    "c class": "c class",
    "c class saloon": "c class",
    "c class estate": "c class",
    "e class": "e class",
    "mini hatch": "hatch",
    cooper: "hatch",
  };

  if (exactMap[cleaned]) return exactMap[cleaned];

  if (cleaned.includes("a class") || cleaned.includes("aclass")) return "a class";
  if (cleaned.includes("c class")) return "c class";
  if (cleaned.includes("e class")) return "e class";
  if (cleaned.includes("mini hatch") || cleaned.includes("cooper")) return "hatch";

  return cleaned;
}

function normaliseFuel(value?: string | null) {
  const cleaned = cleanText(value);
  if (!cleaned) return null;

  if (cleaned.includes("petrol")) return "petrol";
  if (cleaned.includes("diesel")) return "diesel";
  if (cleaned.includes("hybrid")) return "hybrid";
  if (cleaned.includes("electric") || cleaned === "ev") return "ev";

  return cleaned;
}

function normaliseTransmission(value?: string | null) {
  const cleaned = cleanText(value);
  if (!cleaned) return null;

  if (cleaned === "manual") return "manual";
  if (cleaned === "automatic" || cleaned === "auto") return "automatic";
  if (cleaned === "cvt") return "cvt";
  if (cleaned === "dsg") return "dsg";
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

function normaliseEngineFamily(value?: string | null) {
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

function normaliseEngineSize(value?: string | null) {
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

const dataset = rawDataset as unknown as CommonFailureRecord[];

export const commonFailureDataset: CommonFailureRecord[] = dataset.map(
  (record, index) => ({
    ...record,
    id: record.id ?? `cf-${index + 1}`,
    make: normaliseMake(record.make) ?? "",
    model: normaliseModel(record.model) ?? "",
    generation: cleanText(record.generation),
    yearStart:
      typeof record.yearStart === "number" ? Math.round(record.yearStart) : null,
    yearEnd:
      typeof record.yearEnd === "number" ? Math.round(record.yearEnd) : null,
    engineFamily: normaliseEngineFamily(record.engineFamily),
    engineCode: cleanText(record.engineCode),
    engineSize: normaliseEngineSize(record.engineSize),
    fuel: normaliseFuel(record.fuel),
    transmission: normaliseTransmission(record.transmission),
    issues: Array.isArray(record.issues) ? record.issues : [],
  })
);