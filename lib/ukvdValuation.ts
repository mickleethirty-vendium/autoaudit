import { mustGetEnv } from "@/lib/env";

function cleanRegistration(reg: string) {
  return reg.replace(/\s/g, "").toUpperCase();
}

function getErrorMessage(payload: any) {
  return (
    payload?.ResponseInformation?.StatusMessage ||
    payload?.ResponseInformation?.Message ||
    payload?.Message ||
    payload?.error ||
    payload?.raw ||
    "unknown status"
  );
}

function getResultsNode(payload: any) {
  return (
    payload?.Results ||
    payload?.results ||
    payload?.Data?.Results ||
    payload?.data?.Results ||
    payload?.Data?.results ||
    payload?.data?.results ||
    null
  );
}

function parseNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  if (typeof value === "string") {
    const cleaned = value.replace(/[^0-9.-]/g, "").trim();
    if (!cleaned) return null;
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function parseString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function firstNumber(...values: unknown[]) {
  for (const value of values) {
    const parsed = parseNumber(value);
    if (parsed !== null) return parsed;
  }
  return null;
}

function firstString(...values: unknown[]) {
  for (const value of values) {
    const parsed = parseString(value);
    if (parsed) return parsed;
  }
  return null;
}

function hasOwnKeys(value: unknown): value is Record<string, any> {
  return !!value && typeof value === "object" && Object.keys(value).length > 0;
}

function normaliseFuel(value: unknown): string | null {
  const raw = parseString(value)?.toLowerCase();
  if (!raw) return null;

  if (raw.includes("petrol")) return "petrol";
  if (raw.includes("diesel")) return "diesel";
  if (raw.includes("hybrid")) return "hybrid";
  if (raw.includes("electric") || raw === "ev") return "ev";

  return raw;
}

function normaliseTransmission(value: unknown): string | null {
  const raw = parseString(value)?.toLowerCase();
  if (!raw) return null;

  if (raw.includes("manual")) return "manual";
  if (raw.includes("cvt")) return "cvt";
  if (
    raw.includes("dsg") ||
    raw.includes("dct") ||
    raw.includes("dual clutch") ||
    raw.includes("dual-clutch")
  ) {
    return "dct";
  }
  if (
    raw.includes("auto") ||
    raw.includes("automatic") ||
    raw.includes("semi-auto") ||
    raw.includes("semi automatic")
  ) {
    return "automatic";
  }

  return raw;
}

function normaliseEngineSizeLitres(value: unknown): string | null {
  const parsed = parseNumber(value);
  if (parsed === null) return null;

  if (parsed > 20) {
    return (parsed / 1000).toFixed(1).replace(/\.0$/, "");
  }

  return parsed.toFixed(1).replace(/\.0$/, "");
}

function isSuccessfulUkvdResponse(payload: any) {
  const responseInfo = payload?.ResponseInformation ?? {};
  const results = getResultsNode(payload);

  const topLevelSuccess =
    responseInfo?.IsSuccessStatusCode === true ||
    responseInfo?.StatusCode === 200 ||
    responseInfo?.StatusCode === "200" ||
    responseInfo?.StatusCode === "Success" ||
    responseInfo?.StatusMessage === "Success";

  const hasResultsObject = hasOwnKeys(results);

  return {
    ok: topLevelSuccess || hasResultsObject,
    results,
  };
}

function getVehicleDetailsNode(results: any) {
  return (
    results?.VehicleDetails ||
    results?.Vehicle ||
    results?.VehicleRecord ||
    results?.DvlaDetails ||
    results?.Dvla ||
    results
  );
}

function getValuationNode(results: any) {
  return (
    results?.ValuationDetails ||
    results?.Valuation ||
    results?.VehicleValuation ||
    results?.GlassValuation ||
    results?.CapValuation ||
    results?.Valuations ||
    results
  );
}

function getValuationFiguresNode(valuation: any) {
  return (
    valuation?.ValuationFigures ||
    valuation?.Figures ||
    valuation?.Values ||
    valuation?.Pricing ||
    valuation?.PriceGuide ||
    valuation
  );
}

export type UkvdValuationSummary = {
  available: boolean;
  source: string;
  below: number | null;
  low: number | null;
  average: number | null;
  median: number | null;
  high: number | null;
  above: number | null;
  retail: number | null;
  private: number | null;
  trade: number | null;
  retailLow: number | null;
  retailAverage: number | null;
  retailHigh: number | null;
  tradeLow: number | null;
  tradeAverage: number | null;
  tradeHigh: number | null;
  mileage: number | null;
  valuationDate: string | null;
  raw?: any;
};

export type UkvdVehicleEnrichment = {
  make: string | null;
  model: string | null;
  derivative: string | null;
  generation: string | null;
  engine: string | null;
  engine_family: string | null;
  engine_code: string | null;
  engine_size: string | null;
  power: string | null;
  power_bhp: number | null;
  fuel: string | null;
  transmission: string | null;
  year: number | null;
  raw?: any;
};

export type UkvdMarketValue = {
  source: "ukvd";
  asking_price: number | null;
  benchmark_label: string | null;
  benchmark_value: number | null;
  low: number | null;
  high: number | null;
  delta: number | null;
  delta_percent: number | null;
  position: "good" | "fair" | "high" | "unknown";
  summary: string;
  valuation_date: string | null;
  valuation_mileage: number | null;
  teaser_only: false;
  raw?: any;
};

export async function fetchUkvdValuationByVrm(
  registration: string,
  mileage?: number | null
) {
  const apiKey = mustGetEnv("UKVD_API_KEY");
  const packageName = mustGetEnv("UKVD_VALUATION_PACKAGE_NAME");
  const baseUrl =
    process.env.UKVD_BASE_URL || "https://uk.api.vehicledataglobal.com";

  const vrm = cleanRegistration(registration);

  if (!vrm) {
    throw new Error("UKVD valuation lookup failed: missing registration");
  }

  const url = new URL("/r2/lookup", baseUrl);
  url.searchParams.set("ApiKey", apiKey);
  url.searchParams.set("PackageName", packageName);
  url.searchParams.set("Vrm", vrm);

  if (typeof mileage === "number" && Number.isFinite(mileage) && mileage >= 0) {
    url.searchParams.set("Mileage", String(Math.round(mileage)));
  }

  let res: Response;

  try {
    res = await fetch(url.toString(), {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });
  } catch (error: any) {
    throw new Error(
      `UKVD valuation fetch failed: ${error?.message ?? "unknown error"}`
    );
  }

  const text = await res.text();

  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }

  if (!res.ok) {
    throw new Error(
      `UKVD valuation HTTP ${res.status}: ${getErrorMessage(json)}`
    );
  }

  const responseCheck = isSuccessfulUkvdResponse(json);

  if (!responseCheck.ok) {
    throw new Error(`UKVD valuation lookup failed: ${getErrorMessage(json)}`);
  }

  if (!json?.Results && responseCheck.results) {
    return {
      ...json,
      Results: responseCheck.results,
    };
  }

  return json;
}

export function buildUkvdValuationSummary(payload: any): UkvdValuationSummary {
  const results = getResultsNode(payload) ?? {};

  const valuation = getValuationNode(results);
  const figures = getValuationFiguresNode(valuation) ?? {};

  const retail = firstNumber(
    figures?.DealerForecourt,
    figures?.Retail,
    figures?.RetailValue,
    figures?.TradeRetail,
    figures?.Forecourt,
    figures?.ForecourtPrice,
    valuation?.Retail,
    valuation?.RetailValue
  );

  const privateValue = firstNumber(
    figures?.PrivateAverage,
    figures?.Private,
    figures?.PrivateValue,
    figures?.PrivateClean,
    valuation?.Private,
    valuation?.PrivateValue
  );

  const trade = firstNumber(
    figures?.TradeAverage,
    figures?.Trade,
    figures?.TradeValue,
    figures?.PartExchange,
    figures?.Auction,
    valuation?.Trade,
    valuation?.TradeValue
  );

  const retailLow = firstNumber(
    figures?.RetailLow,
    figures?.ForecourtLow,
    figures?.TradeRetail,
    figures?.PrivateClean,
    valuation?.RetailLow
  );

  const retailAverage = firstNumber(
    figures?.RetailAverage,
    figures?.DealerForecourt,
    figures?.Retail,
    figures?.RetailValue,
    figures?.TradeRetail,
    valuation?.RetailAverage
  );

  const retailHigh = firstNumber(
    figures?.RetailHigh,
    figures?.ForecourtHigh,
    figures?.OnTheRoad,
    figures?.DealerForecourt,
    valuation?.RetailHigh
  );

  const tradeLow = firstNumber(
    figures?.TradeLow,
    figures?.TradePoor,
    figures?.Auction,
    valuation?.TradeLow
  );

  const tradeAverage = firstNumber(
    figures?.TradeAverage,
    figures?.Trade,
    figures?.TradeValue,
    figures?.PartExchange,
    valuation?.TradeAverage
  );

  const tradeHigh = firstNumber(
    figures?.TradeHigh,
    figures?.PartExchange,
    figures?.PrivateClean,
    valuation?.TradeHigh
  );

  const below = firstNumber(
    figures?.Below,
    figures?.TradePoor,
    tradeLow,
    retailLow
  );

  const low = firstNumber(
    figures?.Low,
    figures?.Auction,
    tradeLow,
    retailLow
  );

  const average = firstNumber(
    figures?.Average,
    figures?.Mid,
    figures?.Median,
    figures?.PrivateAverage,
    figures?.TradeRetail,
    figures?.DealerForecourt,
    figures?.Retail,
    figures?.RetailValue,
    retailAverage,
    tradeAverage
  );

  const median = firstNumber(
    figures?.Median,
    figures?.Mid,
    figures?.PrivateAverage,
    average
  );

  const high = firstNumber(
    figures?.High,
    figures?.DealerForecourt,
    figures?.Retail,
    figures?.RetailValue,
    figures?.OnTheRoad,
    retailHigh
  );

  const above = firstNumber(
    figures?.Above,
    figures?.OnTheRoad,
    retailHigh
  );

  const mileage = firstNumber(
    valuation?.ValuationMileage,
    valuation?.Mileage,
    results?.Mileage
  );

  const valuationDate =
    firstString(
      valuation?.ValuationTime,
      valuation?.GeneratedAt,
      valuation?.ValuationDate,
      valuation?.Date,
      results?.ValuationDate
    ) ?? null;

  const available =
    below !== null ||
    low !== null ||
    average !== null ||
    median !== null ||
    high !== null ||
    above !== null ||
    retail !== null ||
    privateValue !== null ||
    trade !== null ||
    retailLow !== null ||
    retailAverage !== null ||
    retailHigh !== null ||
    tradeLow !== null ||
    tradeAverage !== null ||
    tradeHigh !== null;

  return {
    available,
    source: "ukvd",
    below,
    low,
    average,
    median,
    high,
    above,
    retail,
    private: privateValue,
    trade,
    retailLow,
    retailAverage,
    retailHigh,
    tradeLow,
    tradeAverage,
    tradeHigh,
    mileage,
    valuationDate,
    raw: valuation,
  };
}

export function buildUkvdVehicleEnrichment(
  payload: any
): UkvdVehicleEnrichment {
  const results = getResultsNode(payload) ?? {};
  const vehicle = getVehicleDetailsNode(results) ?? {};

  const make = firstString(
    vehicle?.Make,
    vehicle?.DvlaMake,
    results?.Make
  );

  const model = firstString(
    vehicle?.Model,
    vehicle?.Range,
    vehicle?.DvlaModel,
    results?.Model
  );

  const derivative = firstString(
    vehicle?.Derivative,
    vehicle?.DerivativeDescription,
    vehicle?.Version,
    vehicle?.Variant,
    vehicle?.Trim,
    vehicle?.SeriesDescription
  );

  const generation = firstString(
    vehicle?.Generation,
    vehicle?.GenerationDescription,
    vehicle?.Series,
    vehicle?.ModelSeries
  );

  const engineFamily = firstString(
    vehicle?.EngineFamily,
    vehicle?.EngineFamilyDescription,
    vehicle?.EngineSeries
  );

  const engineCode = firstString(
    vehicle?.EngineCode,
    vehicle?.EngineNumberCode,
    vehicle?.EngineIdentifier
  );

  const engineSize = firstString(
    normaliseEngineSizeLitres(vehicle?.EngineCapacityCc),
    normaliseEngineSizeLitres(vehicle?.EngineCapacity),
    normaliseEngineSizeLitres(vehicle?.EngineSize),
    parseString(vehicle?.EngineSizeDescription)
  );

  const powerBhp = firstNumber(
    vehicle?.PowerBhp,
    vehicle?.PowerHP,
    vehicle?.BrakeHorsePower,
    vehicle?.Bhp
  );

  const power = firstString(
    powerBhp !== null ? `${Math.round(powerBhp)} bhp` : null,
    parseString(vehicle?.PowerDescription),
    parseString(vehicle?.Power)
  );

  const fuel = normaliseFuel(
    firstString(
      vehicle?.FuelType,
      vehicle?.Fuel,
      vehicle?.FuelDescription
    )
  );

  const transmission = normaliseTransmission(
    firstString(
      vehicle?.Transmission,
      vehicle?.TransmissionType,
      vehicle?.Gearbox,
      vehicle?.GearboxType
    )
  );

  const year =
    firstNumber(
      vehicle?.ModelYear,
      vehicle?.Year,
      vehicle?.ManufactureYear,
      results?.Year
    ) ?? null;

  const engine = firstString(
    [engineSize, fuel, power].filter(Boolean).join(" ").trim(),
    parseString(vehicle?.EngineDescription),
    parseString(vehicle?.Engine)
  );

  return {
    make: make ?? null,
    model: model ?? null,
    derivative: derivative ?? null,
    generation: generation ?? null,
    engine: engine ?? null,
    engine_family: engineFamily ?? null,
    engine_code: engineCode ?? null,
    engine_size: engineSize ?? null,
    power: power ?? null,
    power_bhp: powerBhp,
    fuel: fuel ?? null,
    transmission: transmission ?? null,
    year: typeof year === "number" ? Math.round(year) : null,
    raw: vehicle,
  };
}

export function buildUkvdMarketValue(params: {
  valuation: UkvdValuationSummary;
  askingPrice?: number | null;
}): UkvdMarketValue | null {
  const { valuation, askingPrice = null } = params;

  const benchmarkValue =
    firstNumber(
      valuation.average,
      valuation.median,
      valuation.retailAverage,
      valuation.retail,
      valuation.private,
      valuation.trade
    ) ?? null;

  const low =
    firstNumber(
      valuation.low,
      valuation.tradeLow,
      valuation.retailLow,
      valuation.trade,
      benchmarkValue !== null ? Math.round(benchmarkValue * 0.9) : null
    ) ?? null;

  const high =
    firstNumber(
      valuation.high,
      valuation.retailHigh,
      valuation.retail,
      valuation.above,
      benchmarkValue !== null ? Math.round(benchmarkValue * 1.1) : null
    ) ?? null;

  if (benchmarkValue === null && low === null && high === null) {
    return null;
  }

  const delta =
    askingPrice !== null && benchmarkValue !== null
      ? Math.round(askingPrice - benchmarkValue)
      : null;

  const deltaPercent =
    delta !== null && benchmarkValue && benchmarkValue > 0
      ? Math.round((delta / benchmarkValue) * 100)
      : null;

  let position: "good" | "fair" | "high" | "unknown" = "unknown";

  if (askingPrice !== null && benchmarkValue !== null) {
    if (askingPrice <= benchmarkValue * 0.95) {
      position = "good";
    } else if (askingPrice >= benchmarkValue * 1.1) {
      position = "high";
    } else {
      position = "fair";
    }
  }

  let summary = "UK vehicle market data was available for this vehicle.";

  if (askingPrice !== null && benchmarkValue !== null) {
    if (position === "good") {
      summary =
        "The asking price appears below typical market value for this vehicle.";
    } else if (position === "high") {
      summary =
        "The asking price appears above typical market value for this vehicle.";
    } else if (position === "fair") {
      summary =
        "The asking price appears broadly in line with typical market value for this vehicle.";
    }
  } else if (benchmarkValue !== null) {
    summary =
      "We found market valuation data for this vehicle, but no asking price was provided for comparison.";
  }

  return {
    source: "ukvd",
    asking_price: askingPrice,
    benchmark_label: "Typical market value",
    benchmark_value: benchmarkValue,
    low,
    high,
    delta,
    delta_percent: deltaPercent,
    position,
    summary,
    valuation_date: valuation.valuationDate,
    valuation_mileage: valuation.mileage,
    teaser_only: false,
    raw: valuation.raw,
  };
}