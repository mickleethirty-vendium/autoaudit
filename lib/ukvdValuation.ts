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

function firstNumber(...values: unknown[]) {
  for (const value of values) {
    const parsed = parseNumber(value);
    if (parsed !== null) return parsed;
  }
  return null;
}

export type UkvdValuationSummary = {
  available: boolean;
  source: string;
  tradeLow: number | null;
  tradeAverage: number | null;
  tradeHigh: number | null;
  retailLow: number | null;
  retailAverage: number | null;
  retailHigh: number | null;
  mileage: number | null;
  valuationDate: string | null;
};

export async function fetchUkvdValuationByVrm(registration: string) {
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
    throw new Error(`UKVD valuation HTTP ${res.status}: ${getErrorMessage(json)}`);
  }

  const responseInfo = json?.ResponseInformation ?? {};
  const results = getResultsNode(json);

  const topLevelSuccess =
    responseInfo?.IsSuccessStatusCode === true ||
    responseInfo?.StatusCode === 200 ||
    responseInfo?.StatusCode === "200" ||
    responseInfo?.StatusCode === "Success" ||
    responseInfo?.StatusMessage === "Success";

  const hasResultsObject =
    !!results && typeof results === "object" && Object.keys(results).length > 0;

  if (!topLevelSuccess && !hasResultsObject) {
    throw new Error(`UKVD valuation lookup failed: ${getErrorMessage(json)}`);
  }

  if (!json?.Results && results) {
    return {
      ...json,
      Results: results,
    };
  }

  return json;
}

export function buildUkvdValuationSummary(payload: any): UkvdValuationSummary {
  const results = getResultsNode(payload) ?? {};

  const valuation =
    results?.ValuationDetails ||
    results?.Valuation ||
    results?.VehicleValuation ||
    results?.GlassValuation ||
    results?.CapValuation ||
    results;

  const tradeLow = firstNumber(
    valuation?.TradeLow,
    valuation?.Below,
    valuation?.CleanLow,
    valuation?.PartExchangeLow
  );

  const tradeAverage = firstNumber(
    valuation?.TradeAverage,
    valuation?.Trade,
    valuation?.Clean,
    valuation?.PartExchange
  );

  const tradeHigh = firstNumber(
    valuation?.TradeHigh,
    valuation?.Above,
    valuation?.CleanHigh,
    valuation?.PartExchangeHigh
  );

  const retailLow = firstNumber(
    valuation?.RetailLow,
    valuation?.RetailBelow,
    valuation?.ForecourtLow
  );

  const retailAverage = firstNumber(
    valuation?.RetailAverage,
    valuation?.Retail,
    valuation?.Forecourt,
    valuation?.DealerRetail
  );

  const retailHigh = firstNumber(
    valuation?.RetailHigh,
    valuation?.RetailAbove,
    valuation?.ForecourtHigh
  );

  const mileage = firstNumber(
    valuation?.Mileage,
    valuation?.ValuationMileage,
    results?.Mileage
  );

  const valuationDate =
    valuation?.ValuationDate ||
    valuation?.Date ||
    results?.ValuationDate ||
    null;

  const available =
    tradeLow !== null ||
    tradeAverage !== null ||
    tradeHigh !== null ||
    retailLow !== null ||
    retailAverage !== null ||
    retailHigh !== null;

  return {
    available,
    source: "ukvd",
    tradeLow,
    tradeAverage,
    tradeHigh,
    retailLow,
    retailAverage,
    retailHigh,
    mileage,
    valuationDate,
  };
}