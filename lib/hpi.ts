// lib/hpi.ts

import { mustGetEnv } from "@/lib/env";

function cleanRegistration(reg: string): string {
  return reg.replace(/\s/g, "").toUpperCase();
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

  const url = new URL("/r2/lookup", baseUrl);
  url.searchParams.set("ApiKey", apiKey);
  url.searchParams.set("PackageName", packageName);
  url.searchParams.set("Vrm", vrm);

  let res: Response;

  try {
    res = await fetch(url.toString(), {
      method: "GET",
      cache: "no-store",
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
    throw new Error(`UKVD HTTP ${res.status}: ${JSON.stringify(json)}`);
  }

  const topLevelSuccess = json?.ResponseInformation?.IsSuccessStatusCode === true;
  const hasResults = !!json?.Results;

  if (!topLevelSuccess || !hasResults) {
    throw new Error(
      `UKVD lookup failed: ${
        json?.ResponseInformation?.StatusMessage ??
        json?.ResponseInformation?.StatusCode ??
        "unknown status"
      }`
    );
  }

  return json;
}

export function buildUkvdHpiSummary(payload: any): HpiSummary {
  const financeRecords = Array.isArray(payload?.Results?.FinanceDetails?.FinanceRecordList)
    ? payload.Results.FinanceDetails.FinanceRecordList
    : [];

  const writeOffRecords = Array.isArray(payload?.Results?.MiaftrDetails?.WriteOffRecordList)
    ? payload.Results.MiaftrDetails.WriteOffRecordList
    : [];

  const stolen = payload?.Results?.PncDetails?.IsStolen === true;
  const mileageFlag =
    payload?.Results?.MileageCheckDetails?.MileageAnomalyDetected === true;

  const vehicleStatus = payload?.Results?.VehicleDetails?.VehicleStatus ?? {};
  const vehicleHistory = payload?.Results?.VehicleDetails?.VehicleHistory ?? {};
  const colourDetails = vehicleHistory?.ColourDetails ?? {};

  const writeOffCategories: string[] = Array.from(
    new Set<string>(
      writeOffRecords
        .map((r: any): string => String(r?.Category ?? "").trim())
        .filter((value: string) => value.length > 0)
    )
  );

  const importFlag =
    vehicleStatus?.IsImported === true ||
    vehicleStatus?.IsImportedFromNi === true ||
    vehicleStatus?.IsImportedFromOutsideEu === true;

  const exportFlag = vehicleStatus?.IsExported === true;
  const scrappedFlag = vehicleStatus?.IsScrapped === true;

  const keeperChanges = Array.isArray(vehicleHistory?.KeeperChangeList)
    ? vehicleHistory.KeeperChangeList.length
    : 0;

  const plateChanges = Array.isArray(vehicleHistory?.PlateChangeList)
    ? vehicleHistory.PlateChangeList.length
    : 0;

  const colourChanges =
    typeof colourDetails?.NumberOfColourChanges === "number"
      ? colourDetails.NumberOfColourChanges
      : 0;

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
  if (stolen) {
    headline = "HPI flags found";
  } else if (writeOff || finance || mileageFlag || exportFlag || scrappedFlag) {
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