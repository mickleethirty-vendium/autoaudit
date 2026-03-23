// lib/ukvdValuation.ts

import { mustGetEnv } from "@/lib/env";

function cleanRegistration(reg: string): string {
  return reg.replace(/\s/g, "").toUpperCase();
}

function getErrorMessage(payload: any) {
  return (
    payload?.Response?.StatusMessage ||
    payload?.ResponseInformation?.StatusMessage ||
    payload?.Response?.StatusInformation?.Lookup?.StatusMessage ||
    payload?.ResponseInformation?.Message ||
    payload?.Message ||
    payload?.error ||
    payload?.raw ||
    "unknown status"
  );
}

function pickNumber(...values: unknown[]): number | null {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string") {
      const cleaned = value.replace(/[^\d.-]/g, "").trim();
      if (!cleaned) continue;

      const parsed = Number(cleaned);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return null;
}

function objectValues(value: unknown): any[] {
  if (!value || typeof value !== "object") return [];
  return Object.values(value as Record<string, unknown>);
}

function nestedCandidates(root: any): any[] {
  const out: any[] = [];
  const seen = new Set<any>();

  function push(value: any) {
    if (!value || typeof value !== "object") return;
    if (seen.has(value)) return;
    seen.add(value);
    out.push(value);
  }

  push(root);
  push(root?.Response);
  push(root?.Response?.DataItems);
  push(root?.Response?.DataItems?.Valuation);
  push(root?.Response?.DataItems?.ValuationData);
  push(root?.Response?.DataItems?.UkvdValuation);
  push(root?.Response?.DataItems?.VehicleValuation);
  push(root?.Response?.DataItems?.CurrentValuation);
  push(root?.Results);
  push(root?.Results?.Valuation);
  push(root?.Results?.ValuationData);

  for (const value of objectValues(root?.Response?.DataItems)) push(value);
  for (const value of objectValues(root?.Results)) push(value);

  return out;
}

export type UkvdValuationSummary = {
  source: "ukvd";
  below: number | null;
  low: number | null;
  average: number | null;
  median: number | null;
  high: number | null;
  above: number | null;
  retail: number | null;
  private: number | null;
  trade: number | null;
  raw: any;
};

export async function fetchUkvdValuationByVrm(registration: string) {
  const apiKey = mustGetEnv("UKVD_API_KEY");
  const packageName = mustGetEnv("UKVD_VALUATION_PACKAGE_NAME");
  const baseUrl =
    process.env.UKVD_BASE_URL || "https://uk.api.vehicledataglobal.com";

  const vrm = cleanRegistration(registration);

  if (!vrm) {
    throw new Error("UKVD valuation failed: missing registration");
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

  const responseStatus =
    json?.Response?.StatusCode ??
    json?.ResponseInformation?.StatusCode ??
    json?.Response?.StatusInformation?.Lookup?.StatusCode;

  const responseMessage =
    json?.Response?.StatusMessage ??
    json?.ResponseInformation?.StatusMessage ??
    json?.Response?.StatusInformation?.Lookup?.StatusMessage;

  const topLevelSuccess =
    responseStatus === 200 ||
    responseStatus === "200" ||
    responseStatus === "Success" ||
    responseMessage === "Success";

  const candidates = nestedCandidates(json);

  const summary = buildUkvdValuationSummaryFromPayload(json);

  const hasValuationData =
    summary.average !== null ||
    summary.median !== null ||
    summary.low !== null ||
    summary.high !== null ||
    summary.below !== null ||
    summary.above !== null ||
    summary.private !== null ||
    summary.retail !== null ||
    summary.trade !== null;

  if (!topLevelSuccess && !hasValuationData && candidates.length === 0) {
    throw new Error(`UKVD valuation failed: ${getErrorMessage(json)}`);
  }

  if (!hasValuationData) {
    throw new Error(
      `UKVD valuation returned no usable pricing data: ${getErrorMessage(json)}`
    );
  }

  return json;
}

export function buildUkvdValuationSummaryFromPayload(
  payload: any
): UkvdValuationSummary {
  const candidates = nestedCandidates(payload);

  const below = pickNumber(
    ...candidates.map((node) => node?.Below),
    ...candidates.map((node) => node?.BelowMarket),
    ...candidates.map((node) => node?.BelowAverage),
    ...candidates.map((node) => node?.PriceBand1),
    ...candidates.map((node) => node?.Band1),
    ...candidates.map((node) => node?.VeryLow)
  );

  const low = pickNumber(
    ...candidates.map((node) => node?.Low),
    ...candidates.map((node) => node?.Lower),
    ...candidates.map((node) => node?.LowerPrice),
    ...candidates.map((node) => node?.Clean),
    ...candidates.map((node) => node?.PriceBand2),
    ...candidates.map((node) => node?.Band2)
  );

  const average = pickNumber(
    ...candidates.map((node) => node?.Average),
    ...candidates.map((node) => node?.Avg),
    ...candidates.map((node) => node?.CurrentValue),
    ...candidates.map((node) => node?.MarketValue),
    ...candidates.map((node) => node?.Valuation),
    ...candidates.map((node) => node?.PriceBand3),
    ...candidates.map((node) => node?.Band3)
  );

  const median = pickNumber(
    ...candidates.map((node) => node?.Median),
    ...candidates.map((node) => node?.Mid),
    average
  );

  const high = pickNumber(
    ...candidates.map((node) => node?.High),
    ...candidates.map((node) => node?.Higher),
    ...candidates.map((node) => node?.Retail),
    ...candidates.map((node) => node?.PriceBand4),
    ...candidates.map((node) => node?.Band4)
  );

  const above = pickNumber(
    ...candidates.map((node) => node?.Above),
    ...candidates.map((node) => node?.AboveMarket),
    ...candidates.map((node) => node?.PriceBand5),
    ...candidates.map((node) => node?.Band5),
    ...candidates.map((node) => node?.VeryHigh)
  );

  const retail = pickNumber(
    ...candidates.map((node) => node?.Retail),
    ...candidates.map((node) => node?.RetailValue)
  );

  const privateValue = pickNumber(
    ...candidates.map((node) => node?.Private),
    ...candidates.map((node) => node?.PrivateValue)
  );

  const trade = pickNumber(
    ...candidates.map((node) => node?.Trade),
    ...candidates.map((node) => node?.TradeValue)
  );

  return {
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
    raw: payload,
  };
}