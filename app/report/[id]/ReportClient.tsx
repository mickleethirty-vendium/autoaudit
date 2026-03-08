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
};

export default function ReportClient({
  summary,
  items,
  negotiationSuggested,
  justUnlocked = false,
  reportUrl,
  previewUrl,
}: {
  summary: any;
  items: Item[];
  negotiationSuggested: number | null;
  justUnlocked?: boolean;
  reportUrl?: string;
  previewUrl?: string;
}) {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [sellerCopied, setSellerCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

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

      {/* Top summary card */}
      <div className="rounded-2xl border bg-white p-6 break-inside-avoid">
        <div className="text-sm text-slate-600">Estimated immediate exposure (adjustable)</div>

        <div className="mt-1 text-4xl font-extrabold text-slate-900">
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
          </div>
        ) : null}
      </div>

      {/* Seller message card */}
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

      {/* Items */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold">Itemised checks</h2>

        <div className="mt-4 space-y-4">
          {items.map((item, idx) => {
            const key = String(item.item_id ?? item.label ?? `item-${idx}`);
            const isDone = !!done[key];

            return (
              <div key={key} className="rounded-2xl border bg-white p-6 break-inside-avoid">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-[220px]">
                    <div className="text-lg font-semibold text-slate-900">
                      {item.label ?? "Service item"}
                    </div>

                    {item.status ? (
                      <div className="mt-1 text-xs text-slate-600">
                        Status: <b>{String(item.status)}</b>
                        {item.category ? (
                          <>
                            {" "}
                            · Category: <b>{String(item.category)}</b>
                          </>
                        ) : null}
                      </div>
                    ) : null}
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
    </>
  );
}