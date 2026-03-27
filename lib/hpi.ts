// lib/hpi.ts

import { mustGetEnv } from "@/lib/env";

function cleanRegistration(reg: string): string {
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

function asArray<T = any>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function asBoolean(value: unknown): boolean {
  return value === true;
}

function asNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function hasOwnKeys(value: unknown): value is Record<string, any> {
  return !!value && typeof value === "object" && Object.keys(value).length > 0;
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

  const hasMeaningfulHpiData =
    !!results?.FinanceDetails ||
    !!results?.MiaftrDetails ||
    !!results?.PncDetails ||
    !!results?.MileageCheckDetails ||
    !!results?.VehicleDetails;

  return {
    ok: (topLevelSuccess || hasResultsObject) && hasMeaningfulHpiData,
    results,
  };
}

export type HpiSummary = {
  finance: boolean;
  financeCount: number;
  stolen: boolean;
  writeOff: boolean;
  writeOffCount: number;
  writeOffCategories: string[];
  mileageFlag: boolean;
  importFlag: boolean;
  exportFlag: boolean;
  scrappedFlag: boolean;
  keeperChanges: number;
  plateChanges: number;
  colourChanges: number;
  caution: boolean;
  headline: string;
  notes: string[];
};

export async function fetchUkvdHpiByVrm(registration: string) {
  const apiKey = mustGetEnv("UKVD_API_KEY");
  const packageName = mustGetEnv("UKVD_PACKAGE_NAME");
  const baseUrl =
    process.env.UKVD_BASE_URL || "https://uk.api.vehicledataglobal.com";

  const vrm = cleanRegistration(registration);

  if (!vrm) {
    throw new Error("UKVD lookup failed: missing registration");
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
    throw new Error(`UKVD fetch failed: ${error?.message ?? "unknown error"}`);
  }

  const text = await res.text();

  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }

  if (!res.ok) {
    throw new Error(`UKVD HTTP ${res.status}: ${getErrorMessage(json)}`);
  }

  const responseCheck = isSuccessfulUkvdResponse(json);

  if (!responseCheck.ok) {
    throw new Error(`UKVD lookup failed: ${getErrorMessage(json)}`);
  }

  if (!json?.Results && responseCheck.results) {
    return {
      ...json,
      Results: responseCheck.results,
    };
  }

  return json;
}

export function buildUkvdHpiSummary(payload: any): HpiSummary {
  const results = getResultsNode(payload) ?? {};

  const financeRecords = asArray(results?.FinanceDetails?.FinanceRecordList);
  const writeOffRecords = asArray(results?.MiaftrDetails?.WriteOffRecordList);

  const stolen = asBoolean(results?.PncDetails?.IsStolen);
  const mileageFlag = asBoolean(
    results?.MileageCheckDetails?.MileageAnomalyDetected
  );

  const vehicleStatus = results?.VehicleDetails?.VehicleStatus ?? {};
  const vehicleHistory = results?.VehicleDetails?.VehicleHistory ?? {};
  const colourDetails = vehicleHistory?.ColourDetails ?? {};

  const writeOffCategories: string[] = Array.from(
    new Set(
      writeOffRecords
        .map((record: any) => String(record?.Category ?? "").trim())
        .filter((value: string) => value.length > 0)
    )
  );

  const importFlag =
    asBoolean(vehicleStatus?.IsImported) ||
    asBoolean(vehicleStatus?.IsImportedFromNi) ||
    asBoolean(vehicleStatus?.IsImportedFromOutsideEu);

  const exportFlag = asBoolean(vehicleStatus?.IsExported);
  const scrappedFlag = asBoolean(vehicleStatus?.IsScrapped);

  const keeperChanges = asArray(vehicleHistory?.KeeperChangeList).length;
  const plateChanges = asArray(vehicleHistory?.PlateChangeList).length;

  const colourChanges =
    asNumber(colourDetails?.NumberOfColourChanges) ||
    asArray(colourDetails?.ColourChangeList).length;

  const finance = financeRecords.length > 0;
  const writeOff = writeOffRecords.length > 0;

  const notes: string[] = [];

  if (finance) {
    notes.push(
      `${financeRecords.length} finance record${financeRecords.length === 1 ? "" : "s"} found`
    );
  }

  if (stolen) {
    notes.push("Police stolen marker found");
  }

  if (writeOff) {
    notes.push(
      writeOffCategories.length
        ? `Insurance write-off categories: ${writeOffCategories.join(", ")}`
        : "Insurance write-off history found"
    );
  }

  if (mileageFlag) {
    notes.push("Mileage anomaly detected");
  }

  if (importFlag) {
    notes.push("Import marker found");
  }

  if (exportFlag) {
    notes.push("Export marker found");
  }

  if (scrappedFlag) {
    notes.push("Scrapped marker found");
  }

  if (plateChanges > 0) {
    notes.push(
      `${plateChanges} plate change${plateChanges === 1 ? "" : "s"} recorded`
    );
  }

  if (colourChanges > 0) {
    notes.push(
      `${colourChanges} colour change${colourChanges === 1 ? "" : "s"} recorded`
    );
  }

  if (keeperChanges > 0) {
    notes.push(
      `${keeperChanges} keeper history entr${keeperChanges === 1 ? "y" : "ies"} recorded`
    );
  }

  const caution =
    finance || stolen || writeOff || mileageFlag || exportFlag || scrappedFlag;

  let headline = "HPI clear";
  if (caution) {
    headline = "HPI flags found";
  }

  return {
    finance,
    financeCount: financeRecords.length,
    stolen,
    writeOff,
    writeOffCount: writeOffRecords.length,
    writeOffCategories,
    mileageFlag,
    importFlag,
    exportFlag,
    scrappedFlag,
    keeperChanges,
    plateChanges,
    colourChanges,
    caution,
    headline,
    notes,
  };
}