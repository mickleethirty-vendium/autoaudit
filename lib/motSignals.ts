export type MotPatternType =
  | "brakes"
  | "suspension"
  | "tyres"
  | "corrosion"
  | "steering"
  | "emissions"
  | "lighting"
  | "general";

export type MotRepeatAdvisory = {
  text: string;
  count: number;
  patternType: MotPatternType;
  patternLabel: string;
};

export type MotSignals = {
  hasRecentFailures: boolean;
  recentFailureCount: number;
  recentAdvisoryCount: number;
  repeatAdvisories: string[];
  repeatAdvisoryDetails: MotRepeatAdvisory[];
  repeatAdvisoryPatternLabels: string[];
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

function extractMileageValues(tests: any[]): number[] {
  return tests
    .map((t) => Number(t?.odometerValue))
    .filter((n) => Number.isFinite(n));
}

function classifyAdvisoryPattern(
  text: string
): { patternType: MotPatternType; patternLabel: string } {
  if (includesAny(text, ["corrosion", "corroded", "excessively corroded"])) {
    return {
      patternType: "corrosion",
      patternLabel: "Corrosion",
    };
  }

  if (includesAny(text, ["brake", "disc", "pad", "drum", "handbrake"])) {
    return {
      patternType: "brakes",
      patternLabel: "Brakes",
    };
  }

  if (includesAny(text, ["tyre", "tire", "tread"])) {
    return {
      patternType: "tyres",
      patternLabel: "Tyres",
    };
  }

  if (
    includesAny(text, [
      "suspension",
      "shock",
      "spring",
      "strut",
      "arm",
      "bush",
    ])
  ) {
    return {
      patternType: "suspension",
      patternLabel: "Suspension",
    };
  }

  if (includesAny(text, ["steering", "track rod", "rack", "column"])) {
    return {
      patternType: "steering",
      patternLabel: "Steering",
    };
  }

  if (
    includesAny(text, [
      "emissions",
      "exhaust",
      "dpf",
      "smoke",
      "catalytic",
      "lambda",
    ])
  ) {
    return {
      patternType: "emissions",
      patternLabel: "Emissions",
    };
  }

  if (
    includesAny(text, [
      "lamp",
      "light",
      "headlamp",
      "headlight",
      "indicator",
      "rear light",
      "number plate light",
    ])
  ) {
    return {
      patternType: "lighting",
      patternLabel: "Lighting",
    };
  }

  return {
    patternType: "general",
    patternLabel: "General wear / other",
  };
}

export function extractMotSignals(motPayload: any): MotSignals {
  const empty: MotSignals = {
    hasRecentFailures: false,
    recentFailureCount: 0,
    recentAdvisoryCount: 0,
    repeatAdvisories: [],
    repeatAdvisoryDetails: [],
    repeatAdvisoryPatternLabels: [],
    corrosionFlag: false,
    brakeFlag: false,
    tyreFlag: false,
    suspensionFlag: false,
    mileageConcern: false,
  };

  if (!motPayload || motPayload?._error) return empty;

  const tests: any[] = Array.isArray(motPayload?.motTests)
    ? motPayload.motTests
    : [];
  if (!tests.length) return empty;

  const advisoryCounter = new Map<string, number>();
  let recentFailureCount = 0;
  let recentAdvisoryCount = 0;
  let corrosionFlag = false;
  let brakeFlag = false;
  let tyreFlag = false;
  let suspensionFlag = false;

  // Most recent 3 tests only
  const recentTests = tests.slice(0, 3);

  for (const test of recentTests) {
    const result = String(test?.testResult ?? "").toUpperCase();
    if (result === "FAILED" || result === "FAIL") {
      recentFailureCount += 1;
    }

    const defects = Array.isArray(test?.defects) ? test.defects : [];

    for (const defect of defects) {
      const type = String(defect?.type ?? "").toUpperCase();
      const text = normaliseText(String(defect?.text ?? ""));
      if (!text) continue;

      if (type === "ADVISORY" || type === "MINOR") {
        recentAdvisoryCount += 1;
        advisoryCounter.set(text, (advisoryCounter.get(text) ?? 0) + 1);
      }

      if (type === "FAIL" || type === "MAJOR" || type === "DANGEROUS") {
        recentFailureCount += 1;
      }

      if (
        includesAny(text, ["corrosion", "corroded", "excessively corroded"])
      ) {
        corrosionFlag = true;
      }

      if (includesAny(text, ["brake", "disc", "pad", "drum", "handbrake"])) {
        brakeFlag = true;
      }

      if (includesAny(text, ["tyre", "tire", "tread"])) {
        tyreFlag = true;
      }

      if (
        includesAny(text, [
          "suspension",
          "shock",
          "spring",
          "strut",
          "arm",
          "bush",
          "steering",
        ])
      ) {
        suspensionFlag = true;
      }
    }
  }

  const repeatAdvisoryDetails = Array.from(advisoryCounter.entries())
    .filter(([, count]) => count > 1)
    .map(([text, count]) => {
      const classified = classifyAdvisoryPattern(text);

      return {
        text,
        count,
        patternType: classified.patternType,
        patternLabel: classified.patternLabel,
      };
    });

  const repeatAdvisories = repeatAdvisoryDetails.map((item) => item.text);

  const repeatAdvisoryPatternLabels = Array.from(
    new Set(repeatAdvisoryDetails.map((item) => item.patternLabel))
  );

  // Tests come newest first. Mileage should generally go down as you go through older tests.
  const mileages = extractMileageValues(tests);
  let mileageConcern = false;

  for (let i = 1; i < mileages.length; i += 1) {
    if (mileages[i] >= mileages[i - 1]) {
      mileageConcern = true;
      break;
    }
  }

  return {
    hasRecentFailures: recentFailureCount > 0,
    recentFailureCount,
    recentAdvisoryCount,
    repeatAdvisories,
    repeatAdvisoryDetails,
    repeatAdvisoryPatternLabels,
    corrosionFlag,
    brakeFlag,
    tyreFlag,
    suspensionFlag,
    mileageConcern,
  };
}