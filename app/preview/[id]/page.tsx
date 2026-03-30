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

function snapshotTone(exposureHigh: number | null) {
  if (exposureHigh === null) {
    return {
      badgeClass: "border-slate-300 bg-slate-50 text-slate-700",
      badgeLabel: "Snapshot ready",
      title: "Your initial used car risk snapshot",
      description:
        "This gives you a quick view of likely near-term repair exposure before you decide whether to dig deeper.",
    };
  }

  if (exposureHigh >= 2500) {
    return {
      badgeClass: "border-red-200 bg-red-50 text-red-700",
      badgeLabel: "Higher repair exposure",
      title: "This car may carry meaningful near-term repair risk",
      description:
        "The current signals suggest more downside than usual. Check the breakdown and MoT context carefully before buying.",
    };
  }

  if (exposureHigh >= 1000) {
    return {
      badgeClass: "border-amber-200 bg-amber-50 text-amber-700",
      badgeLabel: "Moderate repair exposure",
      title: "There are some costs worth checking before you commit",
      description:
        "The snapshot shows enough risk to justify a closer look at the detailed findings and seller evidence.",
    };
  }

  return {
    badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
    badgeLabel: "Lower repair exposure",
    title: "This one looks more manageable at first glance",
    description:
      "The early signals look lighter, but a full report can still help rule out expensive surprises.",
  };
}

function CompactStat({
  label,
  value,
  subtext,
}: {
  label: string;
  value: string;
  subtext?: string | null;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-0.5 text-sm font-bold text-black">{value}</div>
      {subtext ? (
        <div className="mt-0.5 text-[11px] leading-4 text-slate-500">
          {subtext}
        </div>
      ) : null}
    </div>
  );
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

  const valuationDate: string | null =
    typeof marketValue?.valuation_date === "string"
      ? marketValue.valuation_date
      : null;

  const valuationMileage: number | null =
    typeof marketValue?.valuation_mileage === "number"
      ? marketValue.valuation_mileage
      : null;

  const reportCheckoutUrl = `/api/checkout?report_id=${data.id}&tier=report`;
  const reportPlusHpiCheckoutUrl = `/api/checkout?report_id=${data.id}&tier=report_plus_hpi`;

  const reportPriceLabel = "£4.99";
  const tier2TotalLabel = "£9.99";

  const motPayload: any = data.mot_payload ?? null;
  const mot = getMotSummary(motPayload);
  const tone = snapshotTone(exposureHigh);

  return (
    <div className="mx-auto w-full max-w-6xl px-3 py-3 sm:px-4 sm:py-4 lg:px-5">
      <section
        id="summary"
        className="relative overflow-hidden rounded-[1.5rem] border border-[var(--aa-silver)] bg-[var(--aa-black)] shadow-[0_16px_48px_rgba(15,23,42,0.12)]"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/hero-car-road.png')" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(255,255,255,0.95)_46%,rgba(255,255,255,0.91)_100%)] lg:bg-[linear-gradient(90deg,rgba(255,255,255,0.96)_0%,rgba(255,255,255,0.94)_48%,rgba(255,255,255,0.34)_74%,rgba(255,255,255,0.12)_100%)]" />

        <div className="relative px-3 py-3 sm:px-4 sm:py-4 lg:px-5 lg:py-5">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center rounded-full border border-[var(--aa-silver)] bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-700 shadow-sm">
              Free snapshot
            </div>
            <div
              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${tone.badgeClass}`}
            >
              {tone.badgeLabel}
            </div>
          </div>

          <div className="mt-3 grid gap-3 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
            <div className="min-w-0">
              <h1 className="text-[1.7rem] font-extrabold leading-none tracking-tight text-black sm:text-[2rem]">
                {reg ? reg : "Vehicle snapshot"}
                {make ? (
                  <span className="ml-0 mt-1 block text-base font-medium text-slate-500 sm:ml-2 sm:mt-0 sm:inline">
                    · {make}
                  </span>
                ) : null}
              </h1>

              <div className="mt-1.5 text-xs leading-5 text-slate-600">
                {year ? `${year} · ` : ""}
                {fuel ? `${fuel} · ` : ""}
                {transmission ? `${transmission} · ` : ""}
                {typeof mileage === "number" ? `${mileage.toLocaleString()} miles` : ""}
              </div>

              <h2 className="mt-3 text-lg font-extrabold leading-tight tracking-tight text-slate-950 sm:text-xl">
                {tone.title}
              </h2>

              <p className="mt-1.5 max-w-3xl text-sm leading-5 text-slate-700">
                {tone.description}
              </p>

              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <CompactStat
                  label="Estimated repairs"
                  value={
                    exposureLow !== null && exposureHigh !== null
                      ? `${money(exposureLow)} – ${money(exposureHigh)}`
                      : "Unavailable"
                  }
                />
                <CompactStat
                  label="Price view"
                  value={valuePillLabel(marketPosition)}
                />
                <CompactStat
                  label="Latest MoT"
                  value={mot.latestResult ? titleCase(mot.latestResult) : "—"}
                />
                <CompactStat
                  label="Latest advisories"
                  value={String(mot.latestAdvisoryCount)}
                />
              </div>

              <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
                <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-800">
                  What to look at first
                </div>
                <div className="mt-1 text-sm leading-5 text-amber-950">
                  Start with the estimated repair range and price position, then
                  check the risk breakdown and MoT history before deciding whether
                  to unlock the full report.
                </div>
              </div>

              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <a href={reportCheckoutUrl} className="btn-primary w-full text-center sm:w-auto">
                  Unlock core report · {reportPriceLabel}
                </a>

                <a
                  href={reportPlusHpiCheckoutUrl}
                  className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                >
                  Full bundle · {tier2TotalLabel}
                </a>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <div className="rounded-[1.6rem] border border-white/45 bg-white/88 px-4 py-4 shadow-[0_14px_36px_rgba(0,0,0,0.10)] backdrop-blur">
                <RiskGauge riskLevel={riskLevel} exposureHigh={exposureHigh} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="sticky top-2 z-20 mt-3">
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white/95 px-2 py-2 shadow-sm backdrop-blur">
          <div className="flex min-w-max items-center gap-2">
            <a
              href="#summary"
              className="rounded-full border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Summary
            </a>
            <a
              href="#price"
              className="rounded-full border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Price
            </a>
            <a
              href="#breakdown"
              className="rounded-full border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Breakdown
            </a>
            <a
              href="#mot"
              className="rounded-full border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              MoT
            </a>
            <a
              href="#unlock"
              className="rounded-full border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Unlock
            </a>
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-3">
          {(askingPrice !== null || marketLow !== null || marketHigh !== null) && (
            <section
              id="price"
              className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-black">Price position</div>
                  <div className="mt-0.5 text-xs leading-5 text-slate-600">
                    {marketSummaryText ||
                      "We’ve compared the asking price with typical market value."}
                  </div>
                </div>

                <div
                  className={`inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${valuePillStyles(
                    marketPosition
                  )}`}
                >
                  {valuePillLabel(marketPosition)}
                </div>
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                <CompactStat
                  label="Asking price"
                  value={askingPrice !== null ? money(askingPrice) : "—"}
                />
                <CompactStat
                  label="Typical value"
                  value={marketBenchmark !== null ? money(marketBenchmark) : "—"}
                />
                <CompactStat
                  label="Market range"
                  value={
                    marketLow !== null && marketHigh !== null
                      ? `${money(marketLow)} – ${money(marketHigh)}`
                      : "—"
                  }
                />
              </div>

              {(valuationDate || valuationMileage !== null || marketDelta !== null) && (
                <div className="mt-2 text-[11px] leading-5 text-slate-500">
                  {valuationDate ? `Valuation date: ${formatDate(valuationDate)}` : ""}
                  {valuationDate && valuationMileage !== null ? " · " : ""}
                  {valuationMileage !== null
                    ? `Valuation mileage: ${valuationMileage.toLocaleString()}`
                    : ""}
                  {marketDelta !== null ? " · " : ""}
                  {marketDelta !== null
                    ? `Difference vs typical value: ${marketDelta > 0 ? "+" : ""}${money(marketDelta)}`
                    : ""}
                </div>
              )}
            </section>
          )}

          <section
            id="breakdown"
            className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-black">Risk breakdown</div>
                <div className="mt-0.5 text-xs leading-5 text-slate-600">
                  Where the estimated repair exposure is most likely to sit.
                </div>
              </div>
            </div>

            <div className="mt-3 space-y-2">
              {buckets.length ? (
                buckets.map((bucket: any) => {
                  const high = Number(bucket.exposure_high || 0);
                  const width = Math.max(18, Math.min(100, Math.round(high / 18)));

                  return (
                    <div
                      key={bucket.key}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-slate-900">
                            {bucket.label ?? "Category"}
                          </div>
                        </div>
                        <div className="shrink-0 text-right text-sm font-semibold text-slate-800">
                          {money(Number(bucket.exposure_low || 0))} – {money(high)}
                        </div>
                      </div>

                      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-200">
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
          </section>
        </div>

        <div className="space-y-3">
          <section
            id="mot"
            className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4"
          >
            <div className="text-sm font-semibold text-black">
              {mot.available ? mot.credibilityTitle : "MoT history"}
            </div>

            <div className="mt-1 text-xs leading-5 text-slate-700">
              {mot.available
                ? mot.credibilityText
                : "MoT history not available for this vehicle yet."}
            </div>

            {mot.available ? (
              <>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <CompactStat
                    label="Latest result"
                    value={mot.latestResult ? titleCase(mot.latestResult) : "—"}
                  />
                  <CompactStat
                    label="Latest test"
                    value={formatDate(mot.latestDate)}
                  />
                  <CompactStat
                    label="Passes"
                    value={String(mot.totalPassCount)}
                  />
                  <CompactStat
                    label="Fails"
                    value={String(mot.totalFailCount)}
                  />
                  <CompactStat
                    label="Advisories"
                    value={String(mot.totalAdvisoryCount)}
                  />
                  <CompactStat
                    label="Recent advisories"
                    value={String(mot.recentAdvisoryCount)}
                  />
                </div>

                {mot.repeatAdvisories.length ? (
                  <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
                    <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-800">
                      Repeat advisory patterns
                    </div>
                    <div className="mt-1 text-sm leading-5 text-amber-950">
                      Repeated wording appears in the MoT history, which can point
                      to recurring unresolved issues.
                    </div>
                  </div>
                ) : null}
              </>
            ) : null}
          </section>

          <section
            id="unlock"
            className="scroll-mt-24 rounded-2xl border border-black bg-slate-950 p-3.5 text-white shadow-sm sm:p-4"
          >
            <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/85">
              Unlock more detail
            </div>

            <h3 className="mt-3 text-lg font-extrabold tracking-tight">
              See what’s actually driving the risk
            </h3>

            <p className="mt-1.5 text-sm leading-5 text-slate-300">
              Unlock the full report to view the detailed findings, likely repair
              items, seller questions, negotiation guidance, full MoT analysis and
              optional vehicle history checks.
            </p>

            <div className="mt-3 grid grid-cols-1 gap-2">
              <a href={reportCheckoutUrl} className="btn-primary block w-full text-center">
                Core report · {reportPriceLabel}
              </a>

              <a
                href={reportPlusHpiCheckoutUrl}
                className="block w-full rounded-lg border border-white/15 bg-white/10 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/15"
              >
                Full bundle · {tier2TotalLabel}
              </a>
            </div>

            <div className="mt-3 grid gap-1 text-xs text-slate-300">
              <div>• Detailed findings and itemised repair exposure</div>
              <div>• Seller questions and negotiation guidance</div>
              <div>• Known model issues and fuller MoT context</div>
              <div>• Full bundle adds finance, write-off, stolen and mileage checks</div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}