"use client";

import { useMemo, useState } from "react";

function money(n: number) {
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `£${Math.round(n)}`;
  }
}

function titleCase(s: string) {
  return s
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

function riskColor(risk: string | null) {
  if (risk === "low") return "bg-emerald-50 border-emerald-200 text-emerald-900";
  if (risk === "medium") return "bg-amber-50 border-amber-200 text-amber-900";
  if (risk === "high") return "bg-rose-50 border-rose-200 text-rose-900";
  return "bg-slate-50 border-slate-200 text-slate-900";
}

type ActiveTab = "service" | "mot" | "hpi";

type Item = {
  item_id?: string;
  label?: string;
  status?: string;
  category?: string;
  cost_low?: number;
  cost_high?: number;
  why_flagged?: string;
  why_it_matters?: string;
  questions_to_ask?: string[];
  source?: string;
};

type MotDefect = {
  text?: string;
  type?: string;
  dangerous?: boolean;
};

type MotTest = {
  completedDate?: string | null;
  expiryDate?: string | null;
  testResult?: string | null;
  odometerValue?: string | null;
  odometerUnit?: string | null;
  defects?: MotDefect[];
};

type HpiSummary = {
  finance?: boolean;
  financeCount?: number;
  stolen?: boolean;
  writeOff?: boolean;
  writeOffCount?: number;
  writeOffCategories?: string[];
  mileageFlag?: boolean;
  importFlag?: boolean;
  exportFlag?: boolean;
  scrappedFlag?: boolean;
  keeperChanges?: number;
  plateChanges?: number;
  colourChanges?: number;
  caution?: boolean;
  headline?: string;
  notes?: string[];
};

type HpiFinanceRecord = {
  AgreementDate?: string | null;
  AgreementType?: string | null;
  AgreementTerm?: number | null;
  AgreementNumber?: string | null;
  FinanceCompany?: string | null;
  ContactNumber?: string | null;
  VehicleDescription?: string | null;
};

type HpiWriteOffRecord = {
  Category?: string | null;
  Status?: string | null;
  LossDate?: string | null;
  InsurerName?: string | null;
  InsurerBranch?: string | null;
  ClaimNumber?: string | null;
};

type HpiPncDetails = {
  IsStolen?: boolean;
  CurrentStatusOnRecord?: string | null;
  PoliceForceName?: string | null;
  DateReportedStolen?: string | null;
  DateRecordAddedToPnc?: string | null;
};

type HpiMileageResult = {
  Mileage?: number | null;
  DateRecorded?: string | null;
  InSequence?: boolean;
  DataSource?: string | null;
};

function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function normaliseText(value: string) {
  return value.trim().toLowerCase();
}

function includesAny(text: string, phrases: string[]) {
  return phrases.some((p) => text.includes(p));
}

function safeText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function safeNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function maskAgreementNumber(value?: string | null) {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  if (raw.length <= 4) return raw;
  return `••••${raw.slice(-4)}`;
}

function itemSource(item: Item): "mot" | "service" | "mixed" {
  const explicit = String(item.source ?? "").toLowerCase();
  const id = String(item.item_id ?? "").toLowerCase();
  const status = String(item.status ?? "").toLowerCase();
  const why = String(item.why_flagged ?? "").toLowerCase();

  if (explicit.includes("mot") && explicit.includes("service")) return "mixed";
  if (explicit.includes("mot")) return "mot";
  if (explicit.includes("service")) return "service";

  const motSignals =
    id.startsWith("mot_") ||
    status.includes("mot") ||
    why.includes("mot history");

  return motSignals ? "mot" : "service";
}

function sourceBadgeClasses(_source: "mot" | "service" | "mixed") {
  return "border-rose-200 bg-rose-50 text-rose-900";
}

function sourceLabel(source: "mot" | "service" | "mixed") {
  if (source === "mot") return "MoT history";
  if (source === "mixed") return "MoT + service risk";
  return "Service risk";
}

function categoryLabel(category?: string) {
  const c = String(category ?? "").toLowerCase();

  if (c === "service" || c === "general_maintenance_risk") {
    return "General Maintenance Risk";
  }
  if (c === "mot" || c === "mot_history") {
    return "MoT History";
  }
  if (c === "engine") return "Engine";
  if (c === "drivetrain") return "Drivetrain";
  if (c === "timing") return "Timing";
  if (c === "brakes") return "Brakes";
  if (c === "safety") return "Safety";
  if (c === "suspension") return "Suspension";
  if (c === "steering") return "Steering";
  if (c === "chassis") return "Chassis";
  if (c === "electrical") return "Electrical";
  if (c === "electronics") return "Electronics";
  if (c === "fluids") return "Fluids";
  if (c === "filters") return "Filters";
  if (!c) return "";
  return titleCase(c.replace(/_/g, " "));
}

function getMotSummary(motPayload: any) {
  const empty = {
    available: false,
    latestResult: null as string | null,
    latestDate: null as string | null,
    latestExpiry: null as string | null,
    recentAdvisoryCount: 0,
    recentFailureCount: 0,
    repeatAdvisories: [] as string[],
    corrosionFlag: false,
    brakeFlag: false,
    tyreFlag: false,
    suspensionFlag: false,
    credibilityTitle: "MoT history included",
    credibilityText: "Advisories and recent test history used in this estimate.",
  };

  if (!motPayload || motPayload?._error) return empty;

  const tests: any[] = Array.isArray(motPayload?.motTests) ? motPayload.motTests : [];
  if (!tests.length) {
    return {
      ...empty,
      available: true,
    };
  }

  const latest = tests[0];
  const recentTests = tests.slice(0, 3);

  let recentAdvisoryCount = 0;
  let recentFailureCount = 0;
  let corrosionFlag = false;
  let brakeFlag = false;
  let tyreFlag = false;
  let suspensionFlag = false;

  const advisoryCounter = new Map<string, number>();

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

      if (includesAny(text, ["corrosion", "corroded", "excessively corroded"])) {
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

  const repeatAdvisories = Array.from(advisoryCounter.entries())
    .filter(([, count]) => count > 1)
    .map(([text]) => text);

  const hasFlags =
    recentFailureCount > 0 ||
    recentAdvisoryCount > 0 ||
    repeatAdvisories.length > 0 ||
    corrosionFlag ||
    brakeFlag ||
    tyreFlag ||
    suspensionFlag;

  return {
    available: true,
    latestResult: String(latest?.testResult ?? "Unknown"),
    latestDate: latest?.completedDate ?? null,
    latestExpiry: latest?.expiryDate ?? null,
    recentAdvisoryCount,
    recentFailureCount,
    repeatAdvisories,
    corrosionFlag,
    brakeFlag,
    tyreFlag,
    suspensionFlag,
    credibilityTitle: hasFlags ? "MoT history flags found" : "MoT history included",
    credibilityText: hasFlags
      ? "Repeated advisories or recent defects may affect near-term costs."
      : "Advisories and recent test history used in this estimate.",
  };
}

function normaliseMotTests(motPayload: any): MotTest[] {
  if (!motPayload || motPayload?._error) return [];

  const tests: MotTest[] = Array.isArray(motPayload?.motTests) ? motPayload.motTests : [];

  return [...tests].sort((a, b) => {
    const aTime = a?.completedDate ? new Date(a.completedDate).getTime() : 0;
    const bTime = b?.completedDate ? new Date(b.completedDate).getTime() : 0;
    return bTime - aTime;
  });
}

function resultBadgeClasses(result?: string | null) {
  const r = String(result ?? "").toUpperCase();
  if (r === "PASSED" || r === "PASS") return "border-emerald-200 bg-emerald-50 text-emerald-900";
  if (r === "FAILED" || r === "FAIL") return "border-rose-200 bg-rose-50 text-rose-900";
  return "border-slate-200 bg-slate-50 text-slate-900";
}

function defectBadgeClasses(type?: string | null) {
  const t = String(type ?? "").toUpperCase();
  if (t === "DANGEROUS" || t === "MAJOR" || t === "FAIL") {
    return "border-rose-200 bg-rose-50 text-rose-900";
  }
  if (t === "ADVISORY" || t === "MINOR") {
    return "border-amber-200 bg-amber-50 text-amber-900";
  }
  return "border-slate-200 bg-slate-50 text-slate-900";
}

function advisoryCountForTest(test?: MotTest | null) {
  if (!test || !Array.isArray(test.defects)) return 0;
  return test.defects.filter((defect) => {
    const type = String(defect?.type ?? "").toUpperCase();
    return type === "ADVISORY" || type === "MINOR";
  }).length;
}

function yearlyMotSummaryLine(test: MotTest, idx: number) {
  const yearLabel = test.completedDate
    ? new Date(test.completedDate).getFullYear()
    : `Test ${idx + 1}`;
  const result = test.testResult ? titleCase(String(test.testResult)) : "Unknown";
  const advisoryCount = advisoryCountForTest(test);
  return `${yearLabel}: ${result} · ${advisoryCount} advis${advisoryCount === 1 ? "ory" : "ories"}`;
}

function hpiStatusRow(label: string, value: string, isFlagged = false) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border bg-white p-3">
      <div className="text-sm font-medium text-slate-700">{label}</div>
      <div
        className={[
          "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold",
          isFlagged
            ? "border-rose-200 bg-rose-50 text-rose-900"
            : "border-emerald-200 bg-emerald-50 text-emerald-900",
        ].join(" ")}
      >
        {value}
      </div>
    </div>
  );
}

function tabClasses(tab: ActiveTab, activeTab: ActiveTab, idx: number) {
  const active = tab === activeTab;

  const activeTone =
    tab === "service"
      ? "border-black border-b-white bg-white text-black shadow-[0_-4px_14px_rgba(0,0,0,0.12)]"
      : tab === "mot"
      ? "border-red-600 border-b-white bg-white text-red-700 shadow-[0_-4px_14px_rgba(220,38,38,0.12)]"
      : "border-slate-400 border-b-white bg-white text-slate-700 shadow-[0_-4px_14px_rgba(148,163,184,0.18)]";

  const inactiveTone =
    tab === "service"
      ? "border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-50 hover:text-black"
      : tab === "mot"
      ? "border-slate-300 bg-slate-100 text-slate-700 hover:bg-red-50 hover:text-red-700"
      : "border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-50 hover:text-slate-700";

  return [
    "relative -mr-2 min-w-[140px] rounded-t-2xl border px-5 py-3 text-sm font-bold uppercase tracking-wide transition-all duration-200",
    idx === 0 ? "ml-0" : "",
    active ? `z-20 ${activeTone}` : `z-10 mt-2 ${inactiveTone} hover:z-20 hover:-translate-y-0.5`,
  ].join(" ");
}

function panelToneClasses(tone: "black" | "red" | "silver") {
  if (tone === "black") {
    return "border-black bg-white";
  }
  if (tone === "red") {
    return "border-red-600 bg-white";
  }
  return "border-slate-300 bg-white";
}

function hpiStatusLabel(label: string, hasDetails = false) {
  return hasDetails ? `${label} (scroll down for details)` : label;
}

function getHpiValueImpact(summary?: HpiSummary | null) {
  const notes: string[] = [];

  if (!summary) {
    return {
      title: "Value impact not available yet",
      tone: "border-slate-200 bg-slate-50 text-slate-900",
      body: "A value impact summary will appear once HPI data has been returned.",
      bullets: [] as string[],
    };
  }

  if (summary.stolen || summary.scrappedFlag) {
    if (summary.stolen) {
      notes.push("A stolen marker can make the vehicle effectively unbuyable until fully resolved.");
    }
    if (summary.scrappedFlag) {
      notes.push("A scrapped marker can severely affect legality, insurability and resale value.");
    }

    return {
      title: "Severe value impact",
      tone: "border-rose-200 bg-rose-50 text-rose-900",
      body: "This HPI result suggests a serious value and ownership risk.",
      bullets: notes,
    };
  }

  if (summary.writeOff) {
    notes.push("Insurance write-off history usually reduces resale value materially.");
    if (summary.writeOffCategories?.length) {
      notes.push(`Category recorded: ${summary.writeOffCategories.join(", ")}.`);
    }
    if (summary.finance) {
      notes.push("Outstanding finance adds a further transaction risk until settled.");
    }

    return {
      title: "Major value impact",
      tone: "border-rose-200 bg-rose-50 text-rose-900",
      body: "Write-off history is likely to reduce buyer confidence and resale value.",
      bullets: notes,
    };
  }

  if (summary.finance || summary.mileageFlag) {
    if (summary.finance) {
      notes.push("Outstanding finance should normally be cleared before purchase completes.");
    }
    if (summary.mileageFlag) {
      notes.push("A mileage anomaly can materially affect trust, valuation and resale.");
    }

    return {
      title: "Moderate value impact",
      tone: "border-amber-200 bg-amber-50 text-amber-900",
      body: "The HPI result contains issues that can affect negotiation and buyer confidence.",
      bullets: notes,
    };
  }

  if (
    summary.importFlag ||
    summary.exportFlag ||
    (summary.plateChanges ?? 0) > 0 ||
    (summary.colourChanges ?? 0) > 0
  ) {
    if (summary.importFlag) notes.push("Import history can affect buyer pool and pricing.");
    if (summary.exportFlag) notes.push("Export history can raise questions that reduce confidence.");
    if ((summary.plateChanges ?? 0) > 0) notes.push("Plate changes may prompt additional history checks.");
    if ((summary.colourChanges ?? 0) > 0) notes.push("Colour changes can prompt closer inspection and questions.");

    return {
      title: "Limited to moderate value impact",
      tone: "border-amber-200 bg-amber-50 text-amber-900",
      body: "The HPI result is not necessarily a deal-breaker, but it may influence resale and negotiation.",
      bullets: notes,
    };
  }

  return {
    title: "Minimal value impact",
    tone: "border-emerald-200 bg-emerald-50 text-emerald-900",
    body: "No major HPI warning markers were returned in this lookup.",
    bullets: ["This should support cleaner resale positioning, subject to condition and service history."],
  };
}

export default function ReportClient({
  summary,
  items,
  negotiationSuggested,
  justUnlocked = false,
  reportUrl,
  previewUrl,
  motPayload,
  hpiPayload,
  hpiSummary,
  hpiStatus,
}: {
  summary: any;
  items: Item[];
  negotiationSuggested: number | null;
  justUnlocked?: boolean;
  reportUrl?: string;
  previewUrl?: string;
  motPayload?: any;
  hpiPayload?: any;
  hpiSummary?: HpiSummary | null;
  hpiStatus?: string | null;
}) {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [sellerCopied, setSellerCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [selectedMotIndex, setSelectedMotIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<ActiveTab>("service");

  const adjusted = useMemo(() => {
    let low = 0;
    let high = 0;

    const remaining = items.filter((it) => {
      const key = String(it.item_id ?? it.label ?? "");
      return !done[key];
    });

    for (const it of remaining) {
      if (typeof it.cost_low === "number") low += it.cost_low;
      if (typeof it.cost_high === "number") high += it.cost_high;
    }

    let risk: "low" | "medium" | "high" = "low";
    if (high >= 1500) risk = "high";
    else if (high >= 700) risk = "medium";

    return { low, high, risk, remainingCount: remaining.length };
  }, [items, done]);

  const negotiationAdjusted = useMemo(() => {
    if (negotiationSuggested === null) return null;

    let totalHigh = 0;
    for (const it of items) {
      if (typeof it.cost_high === "number") totalHigh += it.cost_high;
    }

    if (totalHigh <= 0) return negotiationSuggested;

    const ratio = adjusted.high / totalHigh;
    return Math.max(0, Math.round(negotiationSuggested * ratio));
  }, [items, adjusted.high, negotiationSuggested]);

  const sellerMessage = useMemo(() => {
    if (!previewUrl || negotiationAdjusted === null) return "";

    const absolutePreviewUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}${previewUrl}`
        : previewUrl;

    return `Hi — I ran a detailed AutoAudit report for this vehicle.

Based on the vehicle’s age, mileage and MOT history it suggests around ${money(adjusted.low)}–${money(adjusted.high)} of potential near-term maintenance exposure.

I’d be comfortable proceeding at around ${money(negotiationAdjusted)} less than the asking price unless there’s proof some of these items have already been addressed.

You can view the shared snapshot here:
${absolutePreviewUrl}

If you want, you can unlock the full report from that page, tick off anything already done, and come back with a counter-offer.`;
  }, [adjusted.low, adjusted.high, negotiationAdjusted, previewUrl]);

  async function handleCopySellerMessage() {
    if (!sellerMessage) return;

    try {
      await navigator.clipboard.writeText(sellerMessage);
      setSellerCopied(true);
      setTimeout(() => setSellerCopied(false), 2000);
    } catch {
      setSellerCopied(false);
    }
  }

  async function handleCopyLink() {
    if (!reportUrl) return;

    try {
      const absoluteUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}${reportUrl}`
          : reportUrl;

      await navigator.clipboard.writeText(absoluteUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 1500);
    } catch {
      setLinkCopied(false);
    }
  }

  function handleDownloadPdf() {
    window.print();
  }

  const mot = useMemo(() => getMotSummary(motPayload), [motPayload]);
  const motTests = useMemo(() => normaliseMotTests(motPayload), [motPayload]);
  const selectedMotTest = motTests[selectedMotIndex] ?? null;

  const motFlags = [
    mot.recentFailureCount > 0
      ? `${mot.recentFailureCount} recent fail${mot.recentFailureCount === 1 ? "" : "ures"}`
      : null,
    mot.recentAdvisoryCount > 0
      ? `${mot.recentAdvisoryCount} recent advisory${mot.recentAdvisoryCount === 1 ? "" : "ies"}`
      : null,
    mot.repeatAdvisories.length > 0 ? "Repeated advisory patterns" : null,
    mot.corrosionFlag ? "Corrosion wording in history" : null,
    mot.brakeFlag ? "Brake-related history" : null,
    mot.tyreFlag ? "Tyre-related history" : null,
    mot.suspensionFlag ? "Suspension / steering history" : null,
  ].filter(Boolean);

  const hpiNotes = Array.isArray(hpiSummary?.notes) ? hpiSummary.notes : [];
  const hpiWriteOffCategories = Array.isArray(hpiSummary?.writeOffCategories)
    ? hpiSummary.writeOffCategories.filter(Boolean)
    : [];

  const financeRecords = useMemo(() => {
    const list = hpiPayload?.Results?.FinanceDetails?.FinanceRecordList;
    return Array.isArray(list) ? (list as HpiFinanceRecord[]) : [];
  }, [hpiPayload]);

  const writeOffRecords = useMemo(() => {
    const list = hpiPayload?.Results?.MiaftrDetails?.WriteOffRecordList;
    return Array.isArray(list) ? (list as HpiWriteOffRecord[]) : [];
  }, [hpiPayload]);

  const pncDetails = useMemo(() => {
    const value = hpiPayload?.Results?.PncDetails;
    return value ? (value as HpiPncDetails) : null;
  }, [hpiPayload]);

  const mileageResults = useMemo(() => {
    const list = hpiPayload?.Results?.MileageCheckDetails?.MileageResultList;
    return Array.isArray(list) ? (list as HpiMileageResult[]) : [];
  }, [hpiPayload]);

  const mileageSummary = useMemo(() => {
    const details = hpiPayload?.Results?.MileageCheckDetails;
    return {
      anomaly: details?.MileageAnomalyDetected === true,
      calculatedAverageAnnualMileage: safeNumber(details?.CalculatedAverageAnnualMileage),
      averageMileageForAge: safeNumber(details?.AverageMileageForAge),
    };
  }, [hpiPayload]);

  const hpiValueImpact = useMemo(() => getHpiValueImpact(hpiSummary), [hpiSummary]);

  const topTabs: { key: ActiveTab; label: string }[] = [
    { key: "service", label: "Service risk" },
    { key: "mot", label: "MoT history" },
    { key: "hpi", label: "HPI summary" },
  ];

  return (
    <>
      {justUnlocked ? (
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="font-semibold text-emerald-900">Full report unlocked</div>
          <div className="mt-1 text-sm text-emerald-900/80">
            You now have access to all findings, costs, and negotiation guidance.
          </div>
        </div>
      ) : null}

      <div className="mb-6 flex flex-wrap gap-3 print:hidden">
        {reportUrl ? (
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center rounded-lg border bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            {linkCopied ? "Link copied" : "Copy report link"}
          </button>
        ) : null}

        <button
          type="button"
          onClick={handleDownloadPdf}
          className="inline-flex items-center rounded-lg border bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
        >
          Download PDF
        </button>
      </div>

      <div className="mb-6">
        <div className="relative flex flex-wrap items-end gap-0 overflow-x-auto pb-0">
          {topTabs.map((tab, idx) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={tabClasses(tab.key, activeTab, idx)}
            >
              <span className="block">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="-mt-px border-t border-slate-200" />
      </div>

      <div
        className={[
          "rounded-b-2xl rounded-tr-2xl border p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)] break-inside-avoid",
          activeTab === "service"
            ? panelToneClasses("black")
            : activeTab === "mot"
            ? panelToneClasses("red")
            : panelToneClasses("silver"),
        ].join(" ")}
      >
        {activeTab === "service" ? (
          <div className="space-y-5">
            <div className="rounded-2xl border border-black bg-white p-6 break-inside-avoid">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-lg font-bold uppercase tracking-wide text-slate-900">
                    Service risk
                  </div>
                  <div className="mt-1 text-sm text-slate-600">
                    Estimated immediate exposure, adjustable as you tick off items already done. Scroll down for full details.
                  </div>
                </div>

                <div className="hidden sm:inline-flex items-center rounded-full border bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                  Predicted
                </div>
              </div>

              <div className="mt-4 text-4xl font-extrabold text-slate-900">
                {money(adjusted.low)} – {money(adjusted.high)}
              </div>

              <div
                className={[
                  "mt-3 inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold border",
                  riskColor(adjusted.risk),
                ].join(" ")}
              >
                Risk: {titleCase(adjusted.risk)}
              </div>

              <div className="mt-3 text-sm text-slate-600">
                Tick items you can prove are already done to reduce the estimate.
              </div>

              {negotiationAdjusted !== null ? (
                <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 break-inside-avoid">
                  <div className="font-semibold text-emerald-900">
                    Suggested negotiation: ~{money(negotiationAdjusted)}
                  </div>
                  <div className="mt-1 text-sm text-emerald-900/80">
                    (Based on remaining items not ticked as done)
                  </div>
                  <div className="mt-1 text-sm font-medium text-emerald-900">
                    Scroll down for details
                  </div>
                </div>
              ) : null}
            </div>

            <div className="rounded-2xl border border-black bg-white p-6 break-inside-avoid">
              <h2 className="text-xl font-semibold text-slate-900">Itemised checks</h2>

              <div className="mt-4 space-y-4">
                {items.map((item, idx) => {
                  const key = String(item.item_id ?? item.label ?? `item-${idx}`);
                  const isDone = !!done[key];
                  const source = itemSource(item);

                  return (
                    <div key={key} className="rounded-2xl border bg-white p-6 break-inside-avoid">
                      <div className="flex flex-wrap items-start gap-4">
                        <div className="min-w-[220px] flex-1">
                          <div className="text-lg font-semibold text-slate-900">
                            {item.label ?? "Service item"}
                          </div>

                          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                            <span
                              className={[
                                "inline-flex items-center rounded-full border px-2.5 py-1 font-semibold",
                                sourceBadgeClasses(source),
                              ].join(" ")}
                            >
                              Source: {sourceLabel(source)}
                            </span>

                            {item.status ? (
                              <span className="text-slate-600">
                                Status: <b>{String(item.status)}</b>
                              </span>
                            ) : null}

                            {item.category ? (
                              <span className="text-slate-600">
                                Category: <b>{categoryLabel(item.category)}</b>
                              </span>
                            ) : null}
                          </div>
                        </div>

                        <div className="flex w-full items-start justify-between gap-3 sm:w-auto sm:min-w-[340px]">
                          {typeof item.cost_low === "number" && typeof item.cost_high === "number" ? (
                            <div className="text-left">
                              <div className="text-lg font-semibold text-slate-900">
                                {money(item.cost_low)} – {money(item.cost_high)}
                              </div>
                              <div className="text-xs text-slate-600">estimated</div>
                            </div>
                          ) : (
                            <div className="min-h-[1px]" />
                          )}

                          <label className="ml-auto inline-flex items-center gap-2 rounded-lg border bg-slate-50 px-3 py-2 text-sm print:hidden">
                            <input
                              type="checkbox"
                              checked={isDone}
                              onChange={(e) =>
                                setDone((prev) => ({ ...prev, [key]: e.target.checked }))
                              }
                            />
                            <span className="font-semibold text-slate-800">Already done</span>
                          </label>
                        </div>
                      </div>

                      {isDone ? (
                        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
                          Marked as done — removed from exposure estimate.
                        </div>
                      ) : null}

                      {item.why_flagged ? (
                        <div className="mt-4 text-sm text-slate-700">
                          <b>Why flagged:</b> {item.why_flagged}
                        </div>
                      ) : null}

                      {item.why_it_matters ? (
                        <div className="mt-3 rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
                          <div className="font-semibold text-slate-900">Why it matters</div>
                          <div className="mt-1">{item.why_it_matters}</div>
                        </div>
                      ) : null}

                      {Array.isArray(item.questions_to_ask) && item.questions_to_ask.length ? (
                        <div className="mt-4">
                          <div className="text-sm font-semibold">Questions to ask</div>
                          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                            {item.questions_to_ask.map((q: string, i: number) => (
                              <li key={i}>{q}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}

        {activeTab === "mot" ? (
          <div className="rounded-2xl border border-red-600 bg-white p-6 break-inside-avoid self-start">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-lg font-bold uppercase tracking-wide text-red-700">
                  Mot history
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  Real DVSA test history used to strengthen this report.
                </div>
              </div>

              <div className="hidden sm:inline-flex items-center rounded-full border bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                DVSA data
              </div>
            </div>

            {mot.available ? (
              <>
                <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4">
                  <div className="font-semibold text-rose-900">
                    {mot.credibilityTitle}
                  </div>
                  <div className="mt-1 text-sm text-rose-900/80">
                    {mot.credibilityText}
                  </div>
                </div>

                {motTests.length ? (
                  <>
                    <div className="mt-4">
                      <div className="mb-2 text-sm font-semibold text-slate-900">
                        Test history by year · Advisories
                      </div>

                      <div className="overflow-x-auto pb-1">
                        <div className="grid min-w-full grid-flow-col auto-cols-[calc((100%-1rem)/3)] gap-2">
                          {motTests.map((test, idx) => {
                            const yearLabel = test.completedDate
                              ? new Date(test.completedDate).getFullYear()
                              : `Test ${idx + 1}`;

                            const active = idx === selectedMotIndex;
                            const result = String(test.testResult ?? "").toUpperCase();
                            const isFail = result === "FAILED" || result === "FAIL";
                            const hasAdvisories =
                              Array.isArray(test.defects) &&
                              test.defects.some((defect) => {
                                const type = String(defect?.type ?? "").toUpperCase();
                                return type === "ADVISORY" || type === "MINOR";
                              });

                            return (
                              <button
                                key={`${test.completedDate ?? "mot"}-${idx}`}
                                type="button"
                                onClick={() => setSelectedMotIndex(idx)}
                                className={[
                                  "rounded-lg border px-3 py-2 text-left text-sm font-semibold transition",
                                  active
                                    ? isFail
                                      ? "border-rose-700 bg-rose-700 text-white"
                                      : "border-slate-900 bg-slate-900 text-white"
                                    : isFail
                                    ? "border-rose-700 bg-rose-700 text-white hover:bg-rose-800"
                                    : hasAdvisories
                                    ? "border-rose-200 bg-white text-rose-700 hover:bg-rose-50"
                                    : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50",
                                ].join(" ")}
                              >
                                <div className={hasAdvisories && !active && !isFail ? "text-rose-700" : ""}>
                                  {yearLabel}
                                </div>
                                <div className="mt-0.5 text-xs opacity-80">
                                  {test.testResult ? titleCase(String(test.testResult)) : "Result unknown"}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {selectedMotTest ? (
                      <div className="mt-4 rounded-xl border bg-slate-50 p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="text-xs uppercase tracking-wide text-slate-500">
                              Selected test
                            </div>
                            <div className="mt-1 text-lg font-semibold text-slate-900">
                              {selectedMotTest.completedDate
                                ? formatDate(selectedMotTest.completedDate)
                                : "Unknown date"}
                            </div>
                          </div>

                          <span
                            className={[
                              "inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold",
                              resultBadgeClasses(selectedMotTest.testResult),
                            ].join(" ")}
                          >
                            {selectedMotTest.testResult
                              ? titleCase(String(selectedMotTest.testResult))
                              : "Unknown"}
                          </span>
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          <div className="rounded-lg border bg-white p-3">
                            <div className="text-xs uppercase tracking-wide text-slate-500">
                              Expiry
                            </div>
                            <div className="mt-1 text-sm font-semibold text-slate-900">
                              {selectedMotTest.expiryDate
                                ? formatDate(selectedMotTest.expiryDate)
                                : "—"}
                            </div>
                          </div>

                          <div className="rounded-lg border bg-white p-3">
                            <div className="text-xs uppercase tracking-wide text-slate-500">
                              Mileage at test
                            </div>
                            <div className="mt-1 text-sm font-semibold text-slate-900">
                              {selectedMotTest.odometerValue
                                ? `${selectedMotTest.odometerValue}${
                                    selectedMotTest.odometerUnit
                                      ? ` ${selectedMotTest.odometerUnit}`
                                      : ""
                                  }`
                                : "—"}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4">
                          <div className="text-sm font-semibold text-slate-900">
                            Recorded advisories / defects
                          </div>

                          {Array.isArray(selectedMotTest.defects) && selectedMotTest.defects.length ? (
                            <div className="mt-3 space-y-2">
                              {selectedMotTest.defects.map((defect, idx) => (
                                <div
                                  key={`${defect.text ?? "defect"}-${idx}`}
                                  className="rounded-lg border bg-white p-3"
                                >
                                  <div className="flex flex-wrap items-start justify-between gap-2">
                                    <span
                                      className={[
                                        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
                                        defectBadgeClasses(defect.type),
                                      ].join(" ")}
                                    >
                                      {defect.type ? titleCase(String(defect.type)) : "Recorded"}
                                    </span>

                                    {defect.dangerous ? (
                                      <span className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-900">
                                        Dangerous
                                      </span>
                                    ) : null}
                                  </div>

                                  <div className="mt-2 text-sm text-slate-700">
                                    {defect.text ?? "No description available."}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="mt-2 text-sm text-slate-600">
                              No advisories or defects were recorded for this test.
                            </div>
                          )}
                        </div>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <div className="mt-4 rounded-xl border bg-slate-50 p-4 text-sm text-slate-700">
                    MoT history is available, but no test entries were returned for display.
                  </div>
                )}

                <div className="mt-4">
                  <div className="text-sm font-semibold text-slate-900">
                    Standout MoT signals
                  </div>

                  {motTests.length ? (
                    <div className="mt-2 rounded-lg border bg-slate-50 p-4">
                      <ul className="space-y-2 text-sm text-slate-700">
                        {motTests.map((test, idx) => (
                          <li key={`${test.completedDate ?? "summary"}-${idx}`}>
                            {yearlyMotSummaryLine(test, idx)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : motFlags.length ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {motFlags.map((flag) => (
                        <span
                          key={flag}
                          className="inline-flex items-center rounded-full border bg-white px-3 py-1 text-sm text-slate-700"
                        >
                          {flag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-2 text-sm text-slate-600">
                      No standout MoT warning themes detected in the most recent history.
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="mt-4 rounded-xl border bg-slate-50 p-4 text-sm text-slate-700">
                MoT history not available for this report yet.
              </div>
            )}
          </div>
        ) : null}

        {activeTab === "hpi" ? (
          <div className="rounded-2xl border border-slate-300 bg-white p-6 break-inside-avoid">
            <div className="text-lg font-bold uppercase tracking-wide text-slate-700">
              Hpi summary
            </div>
            <div className="mt-1 text-sm text-slate-600">
              Provenance, finance, write-off and theft markers from the paid HPI lookup.
            </div>

            {hpiStatus === "error" ? (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <div className="font-semibold text-amber-900">
                  HPI data temporarily unavailable
                </div>
                <div className="mt-1 text-sm text-amber-900/80">
                  The report is still available, but the HPI provider did not return a usable result for this lookup.
                </div>
              </div>
            ) : hpiSummary ? (
              <>
                <div
                  className={[
                    "mt-4 rounded-xl border p-4",
                    hpiSummary.caution
                      ? "border-rose-200 bg-rose-50"
                      : "border-emerald-200 bg-emerald-50",
                  ].join(" ")}
                >
                  <div
                    className={[
                      "font-semibold",
                      hpiSummary.caution ? "text-rose-900" : "text-emerald-900",
                    ].join(" ")}
                  >
                    {hpiSummary.headline ?? "HPI summary"}
                  </div>
                  <div
                    className={[
                      "mt-1 text-sm",
                      hpiSummary.caution ? "text-rose-900/80" : "text-emerald-900/80",
                    ].join(" ")}
                  >
                    {hpiSummary.caution
                      ? "Finance, theft, write-off, mileage or status markers may materially affect value and risk."
                      : "No major HPI warning markers were returned in this lookup."}
                  </div>
                </div>

                <div className={`mt-4 rounded-xl border p-4 ${hpiValueImpact.tone}`}>
                  <div className="font-semibold">{hpiValueImpact.title}</div>
                  <div className="mt-1 text-sm">{hpiValueImpact.body}</div>

                  {hpiValueImpact.bullets.length ? (
                    <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
                      {hpiValueImpact.bullets.map((bullet, idx) => (
                        <li key={`${bullet}-${idx}`}>{bullet}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>

                <div className="mt-4 space-y-3">
                  {hpiStatusRow(
                    hpiStatusLabel("Outstanding finance", financeRecords.length > 0),
                    hpiSummary.finance
                      ? `${hpiSummary.financeCount ?? 1} record${(hpiSummary.financeCount ?? 1) === 1 ? "" : "s"} found`
                      : "Clear",
                    !!hpiSummary.finance
                  )}

                  {hpiStatusRow(
                    hpiStatusLabel("Stolen marker", !!pncDetails?.IsStolen),
                    hpiSummary.stolen ? "Recorded" : "Clear",
                    !!hpiSummary.stolen
                  )}

                  {hpiStatusRow(
                    hpiStatusLabel("Insurance write-off", writeOffRecords.length > 0),
                    hpiSummary.writeOff
                      ? hpiWriteOffCategories.length
                        ? hpiWriteOffCategories.join(", ")
                        : `${hpiSummary.writeOffCount ?? 1} record found`
                      : "Clear",
                    !!hpiSummary.writeOff
                  )}

                  {hpiStatusRow(
                    hpiStatusLabel(
                      "Mileage anomaly",
                      mileageSummary.anomaly || mileageResults.length > 0
                    ),
                    hpiSummary.mileageFlag ? "Flagged" : "Clear",
                    !!hpiSummary.mileageFlag
                  )}

                  {hpiStatusRow(
                    "Import marker",
                    hpiSummary.importFlag ? "Recorded" : "Clear",
                    !!hpiSummary.importFlag
                  )}

                  {hpiStatusRow(
                    "Export marker",
                    hpiSummary.exportFlag ? "Recorded" : "Clear",
                    !!hpiSummary.exportFlag
                  )}

                  {hpiStatusRow(
                    "Scrapped marker",
                    hpiSummary.scrappedFlag ? "Recorded" : "Clear",
                    !!hpiSummary.scrappedFlag
                  )}
                </div>

                {financeRecords.length ? (
                  <div className="mt-4">
                    <div className="text-sm font-semibold text-slate-900">
                      Outstanding finance details
                    </div>
                    <div className="mt-2 space-y-3">
                      {financeRecords.map((record, idx) => (
                        <div
                          key={`finance-${idx}`}
                          className="rounded-lg border bg-slate-50 p-4"
                        >
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                              <div className="text-xs uppercase tracking-wide text-slate-500">
                                Finance company
                              </div>
                              <div className="mt-1 text-sm font-semibold text-slate-900">
                                {safeText(record.FinanceCompany) ?? "—"}
                              </div>
                            </div>

                            <div>
                              <div className="text-xs uppercase tracking-wide text-slate-500">
                                Agreement type
                              </div>
                              <div className="mt-1 text-sm font-semibold text-slate-900">
                                {safeText(record.AgreementType) ?? "—"}
                              </div>
                            </div>

                            <div>
                              <div className="text-xs uppercase tracking-wide text-slate-500">
                                Agreement start date
                              </div>
                              <div className="mt-1 text-sm font-semibold text-slate-900">
                                {formatDate(record.AgreementDate)}
                              </div>
                            </div>

                            <div>
                              <div className="text-xs uppercase tracking-wide text-slate-500">
                                Agreement term
                              </div>
                              <div className="mt-1 text-sm font-semibold text-slate-900">
                                {typeof record.AgreementTerm === "number"
                                  ? `${record.AgreementTerm} months`
                                  : "—"}
                              </div>
                            </div>

                            <div>
                              <div className="text-xs uppercase tracking-wide text-slate-500">
                                Agreement reference
                              </div>
                              <div className="mt-1 text-sm font-semibold text-slate-900">
                                {maskAgreementNumber(record.AgreementNumber) ?? "—"}
                              </div>
                            </div>

                            <div>
                              <div className="text-xs uppercase tracking-wide text-slate-500">
                                Contact number
                              </div>
                              <div className="mt-1 text-sm font-semibold text-slate-900">
                                {safeText(record.ContactNumber) ?? "—"}
                              </div>
                            </div>
                          </div>

                          {safeText(record.VehicleDescription) ? (
                            <div className="mt-3 rounded-lg border bg-white p-3 text-sm text-slate-700">
                              <b>Vehicle description on finance record:</b>{" "}
                              {safeText(record.VehicleDescription)}
                            </div>
                          ) : null}

                          <div className="mt-3 text-sm text-rose-900">
                            Ask the seller to confirm this finance has been fully settled before purchase.
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {pncDetails?.IsStolen ? (
                  <div className="mt-4">
                    <div className="text-sm font-semibold text-slate-900">
                      Stolen marker details
                    </div>
                    <div className="mt-2 rounded-lg border bg-slate-50 p-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <div className="text-xs uppercase tracking-wide text-slate-500">
                            Status on record
                          </div>
                          <div className="mt-1 text-sm font-semibold text-slate-900">
                            {safeText(pncDetails.CurrentStatusOnRecord) ?? "—"}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs uppercase tracking-wide text-slate-500">
                            Police force
                          </div>
                          <div className="mt-1 text-sm font-semibold text-slate-900">
                            {safeText(pncDetails.PoliceForceName) ?? "—"}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs uppercase tracking-wide text-slate-500">
                            Date reported stolen
                          </div>
                          <div className="mt-1 text-sm font-semibold text-slate-900">
                            {formatDate(pncDetails.DateReportedStolen)}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs uppercase tracking-wide text-slate-500">
                            Date added to record
                          </div>
                          <div className="mt-1 text-sm font-semibold text-slate-900">
                            {formatDate(pncDetails.DateRecordAddedToPnc)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}

                {writeOffRecords.length ? (
                  <div className="mt-4">
                    <div className="text-sm font-semibold text-slate-900">
                      Insurance write-off details
                    </div>
                    <div className="mt-2 space-y-3">
                      {writeOffRecords.map((record, idx) => (
                        <div
                          key={`writeoff-${idx}`}
                          className="rounded-lg border bg-slate-50 p-4"
                        >
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                              <div className="text-xs uppercase tracking-wide text-slate-500">
                                Category
                              </div>
                              <div className="mt-1 text-sm font-semibold text-slate-900">
                                {safeText(record.Category) ?? "—"}
                              </div>
                            </div>

                            <div>
                              <div className="text-xs uppercase tracking-wide text-slate-500">
                                Status
                              </div>
                              <div className="mt-1 text-sm font-semibold text-slate-900">
                                {safeText(record.Status) ?? "—"}
                              </div>
                            </div>

                            <div>
                              <div className="text-xs uppercase tracking-wide text-slate-500">
                                Loss date
                              </div>
                              <div className="mt-1 text-sm font-semibold text-slate-900">
                                {formatDate(record.LossDate)}
                              </div>
                            </div>

                            <div>
                              <div className="text-xs uppercase tracking-wide text-slate-500">
                                Insurer
                              </div>
                              <div className="mt-1 text-sm font-semibold text-slate-900">
                                {safeText(record.InsurerName) ??
                                  safeText(record.InsurerBranch) ??
                                  "—"}
                              </div>
                            </div>
                          </div>

                          {safeText(record.ClaimNumber) ? (
                            <div className="mt-3 rounded-lg border bg-white p-3 text-sm text-slate-700">
                              <b>Claim reference:</b> {safeText(record.ClaimNumber)}
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {mileageSummary.anomaly || mileageResults.length ? (
                  <div className="mt-4">
                    <div className="text-sm font-semibold text-slate-900">
                      Mileage check details
                    </div>
                    <div className="mt-2 rounded-lg border bg-slate-50 p-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <div className="text-xs uppercase tracking-wide text-slate-500">
                            Mileage anomaly
                          </div>
                          <div className="mt-1 text-sm font-semibold text-slate-900">
                            {mileageSummary.anomaly ? "Flagged" : "No anomaly returned"}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs uppercase tracking-wide text-slate-500">
                            Average annual mileage
                          </div>
                          <div className="mt-1 text-sm font-semibold text-slate-900">
                            {typeof mileageSummary.calculatedAverageAnnualMileage === "number"
                              ? `${mileageSummary.calculatedAverageAnnualMileage.toLocaleString()} miles`
                              : "—"}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs uppercase tracking-wide text-slate-500">
                            Typical mileage for age
                          </div>
                          <div className="mt-1 text-sm font-semibold text-slate-900">
                            {typeof mileageSummary.averageMileageForAge === "number"
                              ? `${mileageSummary.averageMileageForAge.toLocaleString()} miles`
                              : "—"}
                          </div>
                        </div>
                      </div>

                      {mileageResults.length ? (
                        <div className="mt-4">
                          <div className="text-sm font-semibold text-slate-900">
                            Recorded mileage history
                          </div>
                          <div className="mt-2 space-y-2">
                            {mileageResults.slice(0, 8).map((row, idx) => {
                              const outOfSequence = row.InSequence === false;
                              return (
                                <div
                                  key={`mileage-${idx}`}
                                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-white p-3"
                                >
                                  <div className="text-sm text-slate-700">
                                    <b>{typeof row.Mileage === "number" ? row.Mileage.toLocaleString() : "—"}</b>
                                    {" · "}
                                    {formatDate(row.DateRecorded)}
                                    {safeText(row.DataSource) ? ` · ${safeText(row.DataSource)}` : ""}
                                  </div>

                                  <span
                                    className={[
                                      "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
                                      outOfSequence
                                        ? "border-rose-200 bg-rose-50 text-rose-900"
                                        : "border-slate-200 bg-slate-50 text-slate-700",
                                    ].join(" ")}
                                  >
                                    {outOfSequence ? "Out of sequence" : "In sequence"}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-lg border bg-slate-50 p-3">
                    <div className="text-xs uppercase tracking-wide text-slate-500">
                      Keeper history
                    </div>
                    <div className="mt-1 text-lg font-semibold text-slate-900">
                      {typeof hpiSummary.keeperChanges === "number" ? hpiSummary.keeperChanges : 0}
                    </div>
                  </div>

                  <div className="rounded-lg border bg-slate-50 p-3">
                    <div className="text-xs uppercase tracking-wide text-slate-500">
                      Plate changes
                    </div>
                    <div className="mt-1 text-lg font-semibold text-slate-900">
                      {typeof hpiSummary.plateChanges === "number" ? hpiSummary.plateChanges : 0}
                    </div>
                  </div>

                  <div className="rounded-lg border bg-slate-50 p-3">
                    <div className="text-xs uppercase tracking-wide text-slate-500">
                      Colour changes
                    </div>
                    <div className="mt-1 text-lg font-semibold text-slate-900">
                      {typeof hpiSummary.colourChanges === "number" ? hpiSummary.colourChanges : 0}
                    </div>
                  </div>
                </div>

                {hpiNotes.length ? (
                  <div className="mt-4">
                    <div className="text-sm font-semibold text-slate-900">
                      HPI notes
                    </div>
                    <div className="mt-2 rounded-lg border bg-slate-50 p-4">
                      <ul className="space-y-2 text-sm text-slate-700">
                        {hpiNotes.map((note, idx) => (
                          <li key={`${note}-${idx}`}>{note}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <div className="font-semibold text-amber-900">
                  HPI lookup pending
                </div>
                <div className="mt-1 text-sm text-amber-900/80">
                  The report is ready. HPI data will appear here once a successful lookup has been stored.
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {sellerMessage ? (
        <div className="mt-6 rounded-2xl border bg-white p-6 break-inside-avoid">
          <div className="text-lg font-semibold text-slate-900">
            Share with the seller
          </div>
          <div className="mt-1 text-sm text-slate-600">
            Send this message so the seller lands on the snapshot page, can review the
            risk summary, and unlock the report themselves if they want to respond with a
            counter-offer.
          </div>

          <div className="mt-4 rounded-lg border bg-slate-50 p-4 text-sm whitespace-pre-line text-slate-800">
            {sellerMessage}
          </div>

          <button
            type="button"
            onClick={handleCopySellerMessage}
            className="mt-4 inline-flex items-center rounded-lg border bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 print:hidden"
          >
            {sellerCopied ? "Copied" : "Copy message for seller"}
          </button>
        </div>
      ) : null}
    </>
  );
}