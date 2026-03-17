export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import ExposureBar from "@/app/components/ExposureBar";

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

  const tests: any[] = Array.isArray(motPayload?.motTests)
    ? motPayload.motTests
    : [];
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
    credibilityTitle: hasFlags
      ? "MoT history flags found"
      : "MoT history included",
    credibilityText: hasFlags
      ? "Repeated advisories or recent defects may affect near-term costs."
      : "Advisories and recent test history used in this estimate.",
  };
}

function getSnapshotVerdict(
  exposureHigh: number | null,
  riskLevel: string | null
) {
  const normalised = String(riskLevel ?? "").toLowerCase();

  if (normalised === "high" || (typeof exposureHigh === "number" && exposureHigh >= 2500)) {
    return {
      badgeClass: "border-rose-200 bg-rose-50 text-rose-700",
      badgeLabel: "Higher repair exposure",
      title: "This vehicle may carry meaningful near-term repair risk",
      description:
        "The snapshot suggests elevated maintenance exposure. Unlock the full report before you commit.",
    };
  }

  if (normalised === "medium" || (typeof exposureHigh === "number" && exposureHigh >= 1000)) {
    return {
      badgeClass: "border-amber-200 bg-amber-50 text-amber-700",
      badgeLabel: "Moderate repair exposure",
      title: "There are some warning signs worth checking before you buy",
      description:
        "The snapshot shows enough risk to justify a closer look at the detailed findings and MoT analysis.",
    };
  }

  return {
    badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
    badgeLabel: "Lower repair exposure",
    title: "This vehicle looks less exposed, but hidden issues can still matter",
    description:
      "The initial signals look lighter, but the full report helps rule out expensive surprises and history issues.",
  };
}

function confidenceDisplay(confidence: any) {
  if (!confidence) return null;

  const label =
    typeof confidence.label === "string" && confidence.label.trim()
      ? confidence.label
      : null;

  const score =
    typeof confidence.score === "number"
      ? confidence.score
      : typeof confidence.score === "string" && confidence.score.trim()
      ? confidence.score
      : null;

  if (!label && score === null) return null;
  if (label && score !== null) return `${label} (${score}/100)`;
  return label ?? `${score}/100`;
}

export default async function Page({
  params,
}: {
  params: { id: string };
}) {
  const { data, error } = await supabaseAdmin
    .from("reports")
    .select(
      `
        id,
        registration,
        make,
        car_year,
        mileage,
        fuel,
        transmission,
        mot_payload,
        preview_payload,
        is_paid,
        owner_user_id,
        expires_at
      `
    )
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

  if (data.is_paid === true) {
    redirect(`/report/${data.id}`);
  }

  const reg = (data.registration as string | null) ?? null;
  const make = (data.make as string | null) ?? null;
  const year = (data.car_year as number | null) ?? null;
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
  const confidenceText = confidenceDisplay(confidence);

  const reportCheckoutUrl = `/api/checkout?report_id=${data.id}&tier=report`;
  const reportPlusHpiCheckoutUrl = `/api/checkout?report_id=${data.id}&tier=report_plus_hpi`;

  const reportPriceLabel = "£4.99";
  const hpiUpgradePriceLabel = "£5";
  const tier2TotalLabel = "£9.99";

  const motPayload: any = data.mot_payload ?? null;
  const mot = getMotSummary(motPayload);

  const motFlags = [
    mot.recentFailureCount > 0
      ? `${mot.recentFailureCount} recent fail${
          mot.recentFailureCount === 1 ? "" : "ures"
        }`
      : null,
    mot.recentAdvisoryCount > 0
      ? `${mot.recentAdvisoryCount} recent advisory${
          mot.recentAdvisoryCount === 1 ? "" : "ies"
        }`
      : null,
    mot.repeatAdvisories.length > 0 ? "Repeated advisory patterns" : null,
    mot.corrosionFlag ? "Corrosion wording in history" : null,
    mot.brakeFlag ? "Brake-related history" : null,
    mot.tyreFlag ? "Tyre-related history" : null,
    mot.suspensionFlag ? "Suspension / steering history" : null,
  ].filter(Boolean);

  const verdict = getSnapshotVerdict(exposureHigh, riskLevel);

  return (
    <>
      <div className="mx-auto w-full max-w-5xl px-4 pb-36 pt-4">
        <div className="rounded-2xl border border-black bg-white px-5 py-5 shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <div
              className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${verdict.badgeClass}`}
            >
              {verdict.badgeLabel}
            </div>

            <div className="inline-flex items-center rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-700">
              Free snapshot
            </div>
          </div>

          {reg ? (
            <h1 className="text-3xl font-extrabold tracking-tight text-black sm:text-4xl">
              {reg}
              {make ? (
                <span className="ml-2 font-normal text-slate-600">
                  · {make}
                </span>
              ) : null}
            </h1>
          ) : (
            <h1 className="text-3xl font-extrabold tracking-tight text-black sm:text-4xl">
              AutoAudit Snapshot
            </h1>
          )}

          <div className="mt-2 text-sm text-slate-600">
            {year ? `${year} · ` : ""}
            {fuel ? `${fuel} · ` : ""}
            {transmission ? `${transmission} · ` : ""}
            {typeof mileage === "number"
              ? `${mileage.toLocaleString()} miles`
              : ""}
          </div>

          <h2 className="mt-5 text-2xl font-extrabold tracking-tight text-slate-950">
            {verdict.title}
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700 sm:text-base">
            {verdict.description}
          </p>

          <div className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-2xl border-2 border-black bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Service risk
                  </div>
                  <div className="mt-1 text-sm text-slate-600">
                    Estimated near-term maintenance exposure based on age, mileage
                    and known signals.
                  </div>
                </div>

                <div className="hidden sm:inline-flex items-center rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                  Predicted
                </div>
              </div>

              <div className="mt-3">
                {exposureLow !== null && exposureHigh !== null ? (
                  <ExposureBar
                    low={exposureLow}
                    high={exposureHigh}
                    riskLevel={riskLevel}
                  />
                ) : (
                  <div className="mt-2 text-sm text-slate-700">
                    Exposure estimate unavailable.
                  </div>
                )}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {riskLevel ? (
                  <span className="inline-flex items-center rounded-full border border-slate-300 bg-white px-3 py-1 text-sm">
                    <span className="font-semibold">Risk:</span>
                    <span className="ml-2">{titleCase(String(riskLevel))}</span>
                  </span>
                ) : null}

                {confidenceText ? (
                  <span className="inline-flex items-center rounded-full border border-slate-300 bg-white px-3 py-1 text-sm">
                    <span className="font-semibold">Confidence:</span>
                    <span className="ml-2">{confidenceText}</span>
                  </span>
                ) : null}
              </div>
            </div>

            <div className="rounded-2xl border border-black bg-slate-950 p-5 text-white shadow-sm">
              <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white/85">
                Unlock full findings
              </div>

              <h3 className="mt-4 text-xl font-extrabold tracking-tight">
                Don’t buy blind
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-300">
                Unlock the full report to see detailed findings, itemised repair
                costs, seller questions, negotiation guidance and MoT analysis.
              </p>

              <div className="mt-5 space-y-3">
                <a href={reportCheckoutUrl} className="btn-primary block text-center">
                  Unlock full report · {reportPriceLabel}
                </a>

                <a
                  href={reportPlusHpiCheckoutUrl}
                  className="block rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  Get full bundle · {tier2TotalLabel}
                </a>
              </div>

              <div className="mt-4 text-xs leading-5 text-slate-400">
                Full bundle includes the full report plus HPI-style history data
                for finance, write-off, theft, mileage and keeper history checks.
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border-2 border-[var(--aa-red)] bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  MoT history
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  Real DVSA test history used to strengthen this estimate.
                </div>
              </div>

              <div className="hidden sm:inline-flex items-center rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                DVSA data
              </div>
            </div>

            {mot.available ? (
              <>
                <div className="mt-4 rounded-xl border border-[var(--aa-red)] bg-red-50 p-4">
                  <div className="font-semibold text-[var(--aa-red)]">
                    {mot.credibilityTitle}
                  </div>
                  <div className="mt-1 text-sm text-red-900/80">
                    {mot.credibilityText}
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="text-xs uppercase tracking-wide text-slate-500">
                      Latest test
                    </div>
                    <div className="mt-1 text-lg font-semibold text-slate-900">
                      {mot.latestResult ? titleCase(mot.latestResult) : "—"}
                    </div>
                    <div className="mt-1 text-sm text-slate-600">
                      {mot.latestDate
                        ? `Completed ${formatDate(mot.latestDate)}`
                        : "—"}
                    </div>
                    <div className="text-sm text-slate-600">
                      {mot.latestExpiry
                        ? `Expires ${formatDate(mot.latestExpiry)}`
                        : ""}
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
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
                          className="inline-flex items-center rounded-full border border-slate-300 bg-white px-3 py-1 text-sm text-slate-700"
                        >
                          {flag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-2 text-sm text-slate-600">
                      No standout MoT warning themes detected in the most recent
                      history.
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                MoT history not available for this report yet.
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-base font-semibold text-black">
              Detailed findings locked
            </div>
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
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800"
                  >
                    <span className="select-none blur-sm">{t}</span>
                  </div>
                ))}
            </div>

            <div className="mt-4 space-y-2 text-sm text-slate-700">
              <div>✔ Itemised repair costs</div>
              <div>✔ Seller questions and red flags</div>
              <div>✔ Negotiation strategy</div>
              <div>✔ MoT advisory analysis</div>
            </div>

            <div className="mt-5">
              <a href={reportCheckoutUrl} className="btn-primary block text-center">
                Unlock full report · {reportPriceLabel}
              </a>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <h2 className="text-lg font-semibold text-black">
            Risk breakdown by system
          </h2>

          <div className="mt-3 space-y-2">
            {buckets.length ? (
              buckets.map((b: any) => (
                <div
                  key={b.key}
                  className="rounded-xl border border-slate-200 bg-white p-3"
                >
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
              <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
                No category breakdown available.
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-black bg-white p-5 shadow-sm">
          <div className="mb-4">
            <div className="inline-flex items-center rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-700">
              Choose your report
            </div>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-950">
              Unlock the level of detail you need
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              Start with the core AutoAudit report for service risk and MoT
              analysis, or go straight to the full bundle with added HPI-style
              history checks.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-black bg-white p-5">
              <div className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Core report
              </div>
              <div className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">
                {reportPriceLabel}
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-900">
                Full report + MoT analysis
              </div>

              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                <li>✔ Full itemised findings</li>
                <li>✔ Repair cost estimates</li>
                <li>✔ Seller questions and negotiation guidance</li>
                <li>✔ MoT failures and advisory analysis</li>
              </ul>

              <div className="mt-5">
                <a href={reportCheckoutUrl} className="btn-primary">
                  Unlock core report · {reportPriceLabel}
                </a>
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--aa-red)] bg-red-50/40 p-5">
              <div className="text-sm font-semibold uppercase tracking-wide text-[var(--aa-red)]">
                Full bundle
              </div>
              <div className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">
                {tier2TotalLabel}
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-900">
                Core report + HPI history check
              </div>

              <div className="mt-2 text-sm text-slate-700">
                Includes everything in the core report, plus added HPI-style
                checks for finance, write-off, theft, mileage anomalies and
                keeper history.
              </div>

              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                <li>✔ Outstanding finance markers</li>
                <li>✔ Insurance write-off records</li>
                <li>✔ Stolen vehicle markers</li>
                <li>✔ Mileage anomaly checks</li>
                <li>✔ Keeper, plate and colour history</li>
              </ul>

              <div className="mt-5 rounded-xl border border-red-200 bg-white p-3 text-sm text-slate-700">
                Or buy the core report now, then add the history upgrade later
                for {hpiUpgradePriceLabel}.
              </div>

              <div className="mt-5">
                <a href={reportPlusHpiCheckoutUrl} className="btn-primary">
                  Get full bundle · {tier2TotalLabel}
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-xs text-slate-500">
          AutoAudit provides guidance only and is not a substitute for a
          mechanical inspection.
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-[9999] border-t border-slate-300 bg-white/95 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="text-sm">
            <div className="font-semibold text-black">
              Core report {reportPriceLabel} · Full bundle {tier2TotalLabel}
            </div>
            <div className="text-xs text-slate-600">
              Unlock the report now or go straight to the full bundle
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <a href={reportCheckoutUrl} className="btn-primary">
              Unlock core · {reportPriceLabel}
            </a>

            <a
              href={reportPlusHpiCheckoutUrl}
              className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Full bundle · {tier2TotalLabel}
            </a>
          </div>
        </div>
      </div>
    </>
  );
}