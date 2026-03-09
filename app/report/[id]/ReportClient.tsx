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

function sourceBadgeClasses(source: "mot" | "service" | "mixed") {
  if (source === "mot") {
    return "border-rose-200 bg-rose-50 text-rose-900";
  }
  if (source === "mixed") {
    return "border-amber-200 bg-amber-50 text-amber-900";
  }
  return "border-emerald-200 bg-emerald-50 text-emerald-900";
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

export default function ReportClient({
  summary,
  items,
  negotiationSuggested,
  justUnlocked = false,
  reportUrl,
  previewUrl,
  motPayload,
}: {
  summary: any;
  items: Item[];
  negotiationSuggested: number | null;
  justUnlocked?: boolean;
  reportUrl?: string;
  previewUrl?: string;
  motPayload?: any;
}) {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [sellerCopied, setSellerCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [selectedMotIndex, setSelectedMotIndex] = useState(0);

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

      <div className="grid gap-5 md:grid-cols-2">
        {/* Left column: Service risk + itemised checks */}
        <div className="space-y-5">
          <div className="rounded-2xl border bg-white p-6 break-inside-avoid">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Service risk
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  Estimated immediate exposure, adjustable as you tick off items already done.
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

          <div className="rounded-2xl border bg-white p-6 break-inside-avoid">
            <h2 className="text-xl font-semibold">Itemised checks</h2>

            <div className="mt-4 space-y-4">
              {items.map((item, idx) => {
                const key = String(item.item_id ?? item.label ?? `item-${idx}`);
                const isDone = !!done[key];
                const source = itemSource(item);

                return (
                  <div key={key} className="rounded-2xl border bg-white p-6 break-inside-avoid">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-[220px]">
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

                      <div className="flex items-center gap-3">
                        {typeof item.cost_low === "number" && typeof item.cost_high === "number" ? (
                          <div className="text-right">
                            <div className="text-lg font-semibold text-slate-900">
                              {money(item.cost_low)} – {money(item.cost_high)}
                            </div>
                            <div className="text-xs text-slate-600">estimated</div>
                          </div>
                        ) : null}

                        <label className="inline-flex items-center gap-2 rounded-lg border bg-slate-50 px-3 py-2 text-sm print:hidden">
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

        {/* Right column: MOT history */}
        <div className="rounded-2xl border bg-white p-6 break-inside-avoid self-start">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                MoT history
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
                      Test history by year
                    </div>

                    <div className="overflow-x-auto pb-1">
                      <div className="grid min-w-full grid-flow-col auto-cols-[calc((100%-1rem)/3)] gap-2">
                        {motTests.map((test, idx) => {
                          const yearLabel = test.completedDate
                            ? new Date(test.completedDate).getFullYear()
                            : `Test ${idx + 1}`;

                          const active = idx === selectedMotIndex;
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
                                  ? "border-slate-900 bg-slate-900 text-white"
                                  : hasAdvisories
                                  ? "border-rose-200 bg-white text-rose-700 hover:bg-rose-50"
                                  : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50",
                              ].join(" ")}
                            >
                              <div>{yearLabel}</div>
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
      </div>

      {/* Seller message moved to bottom full-width */}
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