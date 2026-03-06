export type MotSignals = {
  hasRecentFailures: boolean;
  recentFailureCount: number;
  recentAdvisoryCount: number;
  repeatAdvisories: string[];
  corrosionFlag: boolean;
  brakeFlag: boolean;
  tyreFlag: boolean;
  suspensionFlag: boolean;
  mileageConcern: boolean;
};

function normaliseText(value: string): string {
  return value.trim().toLowerCase();
}

function includesAny(text: string, phrases: string[]): boolean {
  return phrases.some((p) => text.includes(p));
}

function extractAdvisoryTexts(test: any): string[] {
  if (!Array.isArray(test?.rfrAndComments)) return [];

  return test.rfrAndComments
    .filter((item: any) => item?.type === "ADVISORY" || item?.type === "FAIL")
    .map((item: any) => String(item?.text ?? "").trim())
    .filter(Boolean);
}

function extractMileageValues(tests: any[]): number[] {
  return tests
    .map((t) => Number(t?.odometerValue))
    .filter((n) => Number.isFinite(n));
}

export function extractMotSignals(motPayload: any): MotSignals {
  const empty: MotSignals = {
    hasRecentFailures: false,
    recentFailureCount: 0,
    recentAdvisoryCount: 0,
    repeatAdvisories: [],
    corrosionFlag: false,
    brakeFlag: false,
    tyreFlag: false,
    suspensionFlag: false,
    mileageConcern: false,
  };

  if (!motPayload || motPayload?._error) return empty;

  const vehicle = Array.isArray(motPayload) ? motPayload[0] : motPayload;
  const tests: any[] = Array.isArray(vehicle?.motTests) ? vehicle.motTests : [];

  if (!tests.length) return empty;

  const advisoryCounter = new Map<string, number>();
  let recentFailureCount = 0;
  let recentAdvisoryCount = 0;
  let corrosionFlag = false;
  let brakeFlag = false;
  let tyreFlag = false;
  let suspensionFlag = false;

  const recentTests = tests.slice(0, 3);

  for (const test of recentTests) {
    const result = String(test?.testResult ?? "").toUpperCase();
    if (result === "FAILED" || result === "FAIL") {
      recentFailureCount += 1;
    }

    const comments = Array.isArray(test?.rfrAndComments) ? test.rfrAndComments : [];

    for (const item of comments) {
      const type = String(item?.type ?? "").toUpperCase();
      const text = normaliseText(String(item?.text ?? ""));
      if (!text) continue;

      if (type === "ADVISORY") {
        recentAdvisoryCount += 1;
        advisoryCounter.set(text, (advisoryCounter.get(text) ?? 0) + 1);
      }

      if (includesAny(text, ["corrosion", "corroded", "excessively corroded"])) {
        corrosionFlag = true;
      }

      if (includesAny(text, ["brake", "disc", "pad", "drum", "handbrake"])) {
        brakeFlag = true;
      }

      if (includesAny(text, ["tyre", "tire", "tread"])) {
        tyreFlag = true;
      }

      if (includesAny(text, ["suspension", "shock", "spring", "strut", "arm", "bush"])) {
        suspensionFlag = true;
      }
    }
  }

  const repeatAdvisories = Array.from(advisoryCounter.entries())
    .filter(([, count]) => count > 1)
    .map(([text]) => text);

  const mileages = extractMileageValues(tests);
  let mileageConcern = false;

  for (let i = 1; i < mileages.length; i += 1) {
    if (mileages[i] > mileages[i - 1]) {
      mileageConcern = true;
      break;
    }
  }

  return {
    hasRecentFailures: recentFailureCount > 0,
    recentFailureCount,
    recentAdvisoryCount,
    repeatAdvisories,
    corrosionFlag,
    brakeFlag,
    tyreFlag,
    suspensionFlag,
    mileageConcern,
  };
}