export const dynamic = "force-dynamic";

import Link from "next/link";
import { supabasePublic } from "@/lib/supabase";
import ExposureBar from "@/app/components/ExposureBar";
import SnapshotShareCard from "./SnapshotShareCard";

function titleCase(s: string) {
  return s
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

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

export default async function Page({
  params,
}: {
  params: { id: string };
}) {
  const { data, error } = await supabasePublic
    .from("reports")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (error || !data) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-6">
        <h1 className="text-2xl font-bold">Snapshot not found</h1>
        <p className="mt-2 text-sm text-slate-600">
          We couldn’t load that report. Please go back and try again.
        </p>

        <div className="mt-4">
          <Link href="/" className="btn-outline">
            Back home
          </Link>
        </div>
      </div>
    );
  }

  const reg = (data.registration as string | null) ?? null;
  const make = (data.make as string | null) ?? null;

  const year =
    (data.car_year as number | null) ??
    (data.year as number | null) ??
    null;

  const mileage = (data.mileage as number | null) ?? null;
  const fuel = (data.fuel as string | null) ?? null;
  const transmission = (data.transmission as string | null) ?? null;

  const preview: any = data.preview_payload ?? {};
  const summary: any = preview.summary ?? {};

  const buckets: any[] = Array.isArray(preview.buckets) ? preview.buckets : [];

  const teaser: any = preview.teaser ?? {};
  const blurredLabels: string[] = Array.isArray(teaser.blurred_labels)
    ? teaser.blurred_labels
    : [];

  const hiddenCount: number =
    typeof teaser.hidden_count === "number"
      ? teaser.hidden_count
      : blurredLabels.length;

  const riskLevel: string | null = summary.risk_level ?? null;

  const exposureLow: number | null =
    typeof summary.exposure_low === "number" ? summary.exposure_low : null;

  const exposureHigh: number | null =
    typeof summary.exposure_high === "number" ? summary.exposure_high : null;

  const confidence: any = summary.confidence ?? null;

  const checkoutUrl = `/api/checkout?report_id=${data.id}`;
  const priceLabel = "£4.99";

  const motPayload: any = data.mot_payload ?? null;
  const mot = getMotSummary(motPayload);

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
      <div className="mx-auto w-full max-w-5xl px-4 pt-2 pb-28">
        {/* Header */}
        <div className="mb-4 border-b pb-2">
          {reg ? (
            <h1 className="text-2xl font-extrabold tracking-tight">
              {reg}
              {make ? (
                <span className="ml-2 font-normal text-slate-600">
                  · {make}
                </span>
              ) : null}
            </h1>
          ) : (
            <h1 className="text-2xl font-extrabold tracking-tight">
              AutoAudit Snapshot
            </h1>
          )}

          <div className="mt-1 text-sm text-slate-600">
            {year ? `${year} · ` : ""}
            {fuel ? `${fuel} · ` : ""}
            {transmission ? `${transmission} · ` : ""}
            {typeof mileage === "number"
              ? `${mileage.toLocaleString()} miles`
              : ""}
          </div>
        </div>

        {/* Service risk + MOT side by side */}
        <div className="grid gap-5 md:grid-cols-2">
          {/* Service risk */}
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Service risk
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  Estimated near-term maintenance exposure based on age, mileage and known signals.
                </div>
              </div>

              <div className="hidden sm:inline-flex items-center rounded-full border bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                Predicted
              </div>
            </div>

            <div className="mt-3">
              {exposureLow !== null && exposureHigh !== null ? (
                <ExposureBar low={exposureLow} high={exposureHigh} />
              ) : (
                <div className="mt-2 text-sm text-slate-700">
                  Exposure estimate unavailable.
                </div>
              )}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {riskLevel ? (
                <span className="inline-flex items-center rounded-full border px-3 py-1 text-sm bg-white">
                  <span className="font-semibold">Risk:</span>
                  <span className="ml-2">{titleCase(String(riskLevel))}</span>
                </span>
              ) : null}

              {confidence ? (
                <span className="inline-flex items-center rounded-full border px-3 py-1 text-sm bg-white">
                  <span className="font-semibold">Confidence:</span>
                  <span className="ml-2">
                    {confidence.label ?? "—"} ({confidence.score ?? "—"}/100)
                  </span>
                </span>
              ) : null}
            </div>
          </div>

          {/* MOT history */}
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  MoT history
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  Real DVSA test history used to strengthen this estimate.
                </div>
              </div>

              <div className="hidden sm:inline-flex items-center rounded-full border bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                DVSA data
              </div>
            </div>

            {mot.available ? (
              <>
                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <div className="font-semibold text-emerald-900">
                    {mot.credibilityTitle}
                  </div>
                  <div className="mt-1 text-sm text-emerald-900/80">
                    {mot.credibilityText}
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border bg-slate-50 p-3">
                    <div className="text-xs uppercase tracking-wide text-slate-500">
                      Latest test
                    </div>
                    <div className="mt-1 text-lg font-semibold text-slate-900">
                      {mot.latestResult ? titleCase(mot.latestResult) : "—"}
                    </div>
                    <div className="mt-1 text-sm text-slate-600">
                      {mot.latestDate ? `Completed ${formatDate(mot.latestDate)}` : "—"}
                    </div>
                    <div className="text-sm text-slate-600">
                      {mot.latestExpiry ? `Expires ${formatDate(mot.latestExpiry)}` : ""}
                    </div>
                  </div>

                  <div className="rounded-xl border bg-slate-50 p-3">
                    <div className="text-xs uppercase tracking-wide text-slate-500">
                      Recent history
                    </div>
                    <div className="mt-1 text-lg font-semibold text-slate-900">
                      {mot.recentAdvisoryCount} advisories
                    </div>
                    <div className="mt-1 text-sm text-slate-600">
                      {mot.recentFailureCount} recent failures
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-sm font-semibold text-slate-900">
                    Standout MoT signals
                  </div>

                  {motFlags.length ? (
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

        {/* Message user can send to seller */}
        {exposureLow !== null && exposureHigh !== null ? (
          <div className="mt-5">
            <SnapshotShareCard
              exposureLow={exposureLow}
              exposureHigh={exposureHigh}
              checkoutUrl={checkoutUrl}
              priceLabel={priceLabel}
            />
          </div>
        ) : null}

        {/* Buckets */}
        <div className="mt-5">
          <h2 className="text-lg font-semibold">Risk breakdown by system</h2>

          <div className="mt-3 space-y-2">
            {buckets.length ? (
              buckets.map((b: any) => (
                <div key={b.key} className="rounded-xl border bg-white p-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold">
                        {b.label ?? "Category"}
                      </div>
                      <div className="mt-1 text-xs text-slate-600">
                        {typeof b.item_count === "number"
                          ? `${b.item_count} checks flagged`
                          : ""}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-semibold">
                        £{Number(b.exposure_low || 0).toLocaleString()} – £
                        {Number(b.exposure_high || 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-600">estimated</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border bg-white p-4 text-sm text-slate-700">
                No category breakdown available.
              </div>
            )}
          </div>
        </div>

        {/* Locked Teaser */}
        <div className="mt-5 rounded-xl border bg-white p-4">
          <div className="text-base font-semibold">Detailed findings locked</div>
          <div className="mt-1 text-sm text-slate-600">
            {hiddenCount
              ? `${hiddenCount} detailed checks detected`
              : "Detailed checks detected"}
          </div>

          <div className="mt-4 space-y-2">
            {(blurredLabels.length
              ? blurredLabels
              : [
                  "Timing belt replacement",
                  "Brake system wear",
                  "Suspension component wear",
                ])
              .slice(0, 5)
              .map((t, i) => (
                <div
                  key={i}
                  className="rounded-lg border bg-slate-50 px-3 py-2 text-sm text-slate-800"
                >
                  <span className="select-none blur-sm">{t}</span>
                </div>
              ))}
          </div>

          <div className="mt-4 grid gap-1 text-sm text-slate-700">
            <div>✔ Itemised repair costs</div>
            <div>✔ Seller questions and red flags</div>
            <div>✔ Negotiation strategy</div>
            <div>✔ MoT advisory analysis</div>
          </div>
        </div>

        <div className="mt-6 text-xs text-slate-500">
          AutoAudit provides guidance only and is not a substitute for a
          mechanical inspection.
        </div>
      </div>

      {/* FIXED CTA BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-[9999] border-t bg-white/95 backdrop-blur px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3">
          <div className="text-sm">
            <div className="font-semibold">
              Unlock full report · {priceLabel}
            </div>
            <div className="text-xs text-slate-600">
              Reveal all checks and potential costs
            </div>
          </div>

          <a href={checkoutUrl} className="btn-primary">
            View full report
          </a>
        </div>
      </div>
    </>
  );
}