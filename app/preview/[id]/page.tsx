export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import RiskGauge from "@/app/components/RiskGauge";

function titleCase(s: string) {
  return s
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

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
    latestAdvisoryCount: 0,
    recentAdvisoryCount: 0,
    recentFailureCount: 0,
    totalPassCount: 0,
    totalFailCount: 0,
    totalAdvisoryCount: 0,
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

  let latestAdvisoryCount = 0;
  let recentAdvisoryCount = 0;
  let recentFailureCount = 0;
  let totalPassCount = 0;
  let totalFailCount = 0;
  let totalAdvisoryCount = 0;
  let corrosionFlag = false;
  let brakeFlag = false;
  let tyreFlag = false;
  let suspensionFlag = false;

  const advisoryCounter = new Map<string, number>();

  for (const [index, test] of tests.entries()) {
    const result = String(test?.testResult ?? "").toUpperCase();
    const defects = Array.isArray(test?.defects) ? test.defects : [];

    const isPass = result === "PASSED" || result === "PASS";
    const isFail = result === "FAILED" || result === "FAIL";

    if (isPass) totalPassCount += 1;
    if (isFail) totalFailCount += 1;

    let advisoryCountThisTest = 0;
    let failLikeCountThisTest = 0;

    for (const defect of defects) {
      const type = String(defect?.type ?? "").toUpperCase();
      const text = normaliseText(String(defect?.text ?? ""));
      if (!text) continue;

      if (type === "ADVISORY" || type === "MINOR") {
        advisoryCountThisTest += 1;
        totalAdvisoryCount += 1;
        advisoryCounter.set(text, (advisoryCounter.get(text) ?? 0) + 1);
      }

      if (type === "FAIL" || type === "MAJOR" || type === "DANGEROUS") {
        failLikeCountThisTest += 1;
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

    if (index === 0) {
      latestAdvisoryCount = advisoryCountThisTest;
    }

    if (index < 3) {
      recentAdvisoryCount += advisoryCountThisTest;
      if (isFail || failLikeCountThisTest > 0) {
        recentFailureCount += 1;
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
    latestAdvisoryCount,
    recentAdvisoryCount,
    recentFailureCount,
    totalPassCount,
    totalFailCount,
    totalAdvisoryCount,
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

function bucketBarTone(high: number) {
  if (high >= 1000) return "bg-[var(--aa-red)]";
  if (high >= 400) return "bg-amber-500";
  return "bg-black";
}

function valuePillStyles(position?: string | null) {
  if (position === "good") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  if (position === "high") {
    return "border-[var(--aa-red)]/20 bg-[var(--aa-red)]/5 text-[var(--aa-red)]";
  }
  if (position === "fair") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }
  return "border-slate-200 bg-white text-slate-700";
}

function valuePillLabel(position?: string | null) {
  if (position === "good") return "Below market";
  if (position === "high") return "Above market";
  if (position === "fair") return "Fair value";
  return "Value insight pending";
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
        is_paid
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

  const exposureLow: number | null =
    typeof summary.exposure_low === "number" ? summary.exposure_low : null;

  const exposureHigh: number | null =
    typeof summary.exposure_high === "number" ? summary.exposure_high : null;

  const riskLevel: string | null = summary.risk_level ?? summary.risk ?? null;

  const askingPrice: number | null =
    typeof summary.asking_price === "number" ? summary.asking_price : null;

  const marketValue: any =
    summary.market_value && typeof summary.market_value === "object"
      ? summary.market_value
      : null;

  const marketLow: number | null =
    typeof marketValue?.low === "number" ? marketValue.low : null;

  const marketHigh: number | null =
    typeof marketValue?.high === "number" ? marketValue.high : null;

  const marketBenchmark: number | null =
    typeof marketValue?.benchmark_value === "number"
      ? marketValue.benchmark_value
      : null;

  const marketDelta: number | null =
    typeof marketValue?.delta === "number" ? marketValue.delta : null;

  const marketPosition: string | null =
    typeof marketValue?.position === "string" ? marketValue.position : null;

  const marketSummaryText: string | null =
    typeof marketValue?.summary === "string" ? marketValue.summary : null;

  const reportCheckoutUrl = `/api/checkout?report_id=${data.id}&tier=report`;
  const reportPlusHpiCheckoutUrl = `/api/checkout?report_id=${data.id}&tier=report_plus_hpi`;

  const reportPriceLabel = "£4.99";
  const tier2TotalLabel = "£9.99";

  const motPayload: any = data.mot_payload ?? null;
  const mot = getMotSummary(motPayload);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:py-8">
      <div className="relative overflow-hidden rounded-[2rem] border border-[var(--aa-silver)] bg-[var(--aa-black)] shadow-[0_18px_60px_rgba(15,23,42,0.14)]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/hero-car-road.png')" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.94)_0%,rgba(255,255,255,0.90)_42%,rgba(255,255,255,0.18)_72%,rgba(255,255,255,0.05)_100%)]" />

        <div className="relative grid gap-8 px-5 py-6 sm:px-8 sm:py-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="max-w-2xl">
            <div className="inline-flex items-center rounded-full border border-[var(--aa-silver)] bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-700 shadow-sm">
              Free snapshot
            </div>

            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-black sm:text-4xl">
              {reg ? reg : "Vehicle snapshot"}
              {make ? (
                <span className="ml-2 font-medium text-slate-500">· {make}</span>
              ) : null}
            </h1>

            <div className="mt-2 text-sm text-slate-600">
              {year ? `${year} · ` : ""}
              {fuel ? `${fuel} · ` : ""}
              {transmission ? `${transmission} · ` : ""}
              {typeof mileage === "number" ? `${mileage.toLocaleString()} miles` : ""}
            </div>

            <div className="mt-6 rounded-2xl border border-[var(--aa-silver)] bg-white/95 p-5 shadow-sm">
              <div className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Estimated Repairs:
              </div>

              <div className="mt-2 text-4xl font-extrabold tracking-tight text-black sm:text-5xl">
                {exposureLow !== null && exposureHigh !== null
                  ? `${money(exposureLow)} – ${money(exposureHigh)}`
                  : "Unavailable"}
              </div>

              {askingPrice !== null || marketLow !== null || marketHigh !== null ? (
                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-black">
                        Price position
                      </div>
                      <div className="mt-1 text-sm text-slate-600">
                        {marketSummaryText ||
                          "We’ve compared the asking price with typical market value."}
                      </div>
                    </div>

                    <div
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${valuePillStyles(
                        marketPosition
                      )}`}
                    >
                      {valuePillLabel(marketPosition)}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-white/70 bg-white p-3">
                      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Asking price
                      </div>
                      <div className="mt-1 text-lg font-extrabold text-black">
                        {askingPrice !== null ? money(askingPrice) : "—"}
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/70 bg-white p-3">
                      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Typical value
                      </div>
                      <div className="mt-1 text-lg font-extrabold text-black">
                        {marketBenchmark !== null ? money(marketBenchmark) : "—"}
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/70 bg-white p-3">
                      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Market range
                      </div>
                      <div className="mt-1 text-lg font-extrabold text-black">
                        {marketLow !== null && marketHigh !== null
                          ? `${money(marketLow)} – ${money(marketHigh)}`
                          : "—"}
                      </div>
                    </div>
                  </div>

                  {marketDelta !== null ? (
                    <div className="mt-3 text-sm text-slate-700">
                      Difference vs typical value:{" "}
                      <span className="font-semibold text-black">
                        {marketDelta > 0 ? "+" : ""}
                        {money(marketDelta)}
                      </span>
                    </div>
                  ) : null}
                </div>
              ) : null}

              <div className="mt-5">
                <div className="text-sm font-semibold text-black">
                  Risk Breakdown
                </div>

                <div className="mt-3 space-y-3">
                  {buckets.length ? (
                    buckets.map((bucket: any) => {
                      const high = Number(bucket.exposure_high || 0);
                      const width = Math.max(
                        18,
                        Math.min(100, Math.round(high / 18))
                      );

                      return (
                        <div key={bucket.key} className="space-y-1.5">
                          <div className="flex items-center justify-between gap-4 text-sm">
                            <span className="font-semibold text-slate-900">
                              {bucket.label ?? "Category"}
                            </span>
                            <span className="text-slate-700">
                              {money(Number(bucket.exposure_low || 0))} – {money(high)}
                            </span>
                          </div>

                          <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                            <div
                              className={`h-full rounded-full ${bucketBarTone(high)}`}
                              style={{ width: `${width}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-sm text-slate-600">
                      No category breakdown available yet.
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-[var(--aa-red)]/15 bg-[var(--aa-red)]/5 p-4">
                <div className="text-lg font-bold tracking-tight text-black">
                  Unlock Full Report to Learn More
                </div>
                <div className="mt-2 text-sm leading-6 text-slate-700">
                  See detailed findings, itemised repair costs, seller questions,
                  MoT analysis, value context and optional HPI-style history checks.
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <a href={reportCheckoutUrl} className="btn-primary">
                    Core Report · {reportPriceLabel}
                  </a>

                  <a href={reportPlusHpiCheckoutUrl} className="btn-outline">
                    Full Bundle · {tier2TotalLabel}
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="relative flex min-h-[420px] flex-col items-center justify-start lg:items-end">
            <div className="mt-2 rounded-[2rem] border border-white/40 bg-white/82 px-6 py-5 shadow-[0_18px_50px_rgba(0,0,0,0.12)] backdrop-blur">
              <RiskGauge riskLevel={riskLevel} exposureHigh={exposureHigh} />
            </div>

            <div className="mt-6 w-full max-w-sm rounded-2xl border border-white/30 bg-white/70 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.10)] backdrop-blur lg:mr-4">
              <div className="text-sm font-semibold text-black">
                {mot.available ? mot.credibilityTitle : "MoT credibility"}
              </div>

              <div className="mt-2 text-sm text-slate-700">
                {mot.available
                  ? mot.credibilityText
                  : "MoT history not available for this vehicle yet."}
              </div>

              {mot.available ? (
                <>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-800">
                      Latest: {mot.latestResult ? titleCase(mot.latestResult) : "—"}
                    </span>

                    <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-800">
                      Latest advisories: {mot.latestAdvisoryCount}
                    </span>
                  </div>

                  <div className="mt-3 text-xs text-slate-600">
                    Latest test date:{" "}
                    <span className="font-semibold text-slate-800">
                      {formatDate(mot.latestDate)}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <div className="rounded-xl border border-white/50 bg-white/80 p-3 text-center">
                      <div className="text-lg font-extrabold text-black">
                        {mot.totalPassCount}
                      </div>
                      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                        Passes
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/50 bg-white/80 p-3 text-center">
                      <div className="text-lg font-extrabold text-black">
                        {mot.totalFailCount}
                      </div>
                      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                        Fails
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/50 bg-white/80 p-3 text-center">
                      <div className="text-lg font-extrabold text-black">
                        {mot.totalAdvisoryCount}
                      </div>
                      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                        Advisories
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}