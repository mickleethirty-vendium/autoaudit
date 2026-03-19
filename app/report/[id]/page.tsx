export const dynamic = "force-dynamic";

import Link from "next/link";
import Stripe from "stripe";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabaseAdmin } from "@/lib/supabase";
import { mustGetEnv } from "@/lib/env";
import { buildUkvdHpiSummary, fetchUkvdHpiByVrm } from "@/lib/hpi";
import ExposureBar from "@/app/components/ExposureBar";

const stripe = new Stripe(mustGetEnv("STRIPE_SECRET_KEY"), {
  apiVersion: "2024-06-20",
});

type CheckoutTier = "report" | "hpi_upgrade" | "report_plus_hpi";

function formatDate(value?: string | null) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function money(value?: number | null) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(value);
}

function titleCase(s: string) {
  return s
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

function isExpired(value?: string | null) {
  if (!value) return false;
  const t = new Date(value).getTime();
  if (Number.isNaN(t)) return false;
  return t < Date.now();
}

function parseCheckoutTier(value?: string | null): CheckoutTier {
  if (value === "hpi_upgrade") return "hpi_upgrade";
  if (value === "report_plus_hpi") return "report_plus_hpi";
  return "report";
}

function getConfidenceDisplay(confidence: any) {
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

  if (label && score !== null) {
    return `${label} (${score}/100)`;
  }

  return label ?? `${score}/100`;
}

function getSnapshotVerdict(
  exposureLow: number | null,
  exposureHigh: number | null
) {
  if (exposureHigh === null) {
    return {
      badgeClass: "border-slate-300 bg-slate-50 text-slate-700",
      badgeLabel: "Snapshot ready",
      title: "Used car risk snapshot",
      description:
        "We found an initial maintenance-risk profile for this vehicle.",
    };
  }

  if (exposureHigh >= 2500) {
    return {
      badgeClass: "border-red-200 bg-red-50 text-red-700",
      badgeLabel: "Higher repair exposure",
      title: "This vehicle may carry meaningful near-term repair risk",
      description:
        "The snapshot suggests elevated maintenance exposure. Unlock the full report before you commit.",
    };
  }

  if (exposureHigh >= 1000) {
    return {
      badgeClass: "border-amber-200 bg-amber-50 text-amber-700",
      badgeLabel: "Moderate repair exposure",
      title: "There are some signs worth checking before you buy",
      description:
        "The snapshot shows enough risk to justify a closer look at detailed findings and MoT analysis.",
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

function getMotPanelSummary(motPayload: any) {
  const empty = {
    available: false,
    latestResult: null as string | null,
    latestDate: null as string | null,
    latestAdvisoryCount: 0,
    passCount: 0,
    failCount: 0,
    advisoryCount: 0,
    repeatAdvisoryCount: 0,
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

  const advisoryCounter = new Map<string, number>();
  let passCount = 0;
  let failCount = 0;
  let advisoryCount = 0;
  let latestAdvisoryCount = 0;

  tests.forEach((test, index) => {
    const result = String(test?.testResult ?? "").toUpperCase();
    const defects = Array.isArray(test?.defects) ? test.defects : [];

    if (result === "PASSED" || result === "PASS") passCount += 1;
    if (result === "FAILED" || result === "FAIL") failCount += 1;

    let advisoryCountThisTest = 0;

    for (const defect of defects) {
      const type = String(defect?.type ?? "").toUpperCase();
      const text = String(defect?.text ?? "").trim().toLowerCase();

      if (type === "ADVISORY" || type === "MINOR") {
        advisoryCount += 1;
        advisoryCountThisTest += 1;
        if (text) {
          advisoryCounter.set(text, (advisoryCounter.get(text) ?? 0) + 1);
        }
      }
    }

    if (index === 0) {
      latestAdvisoryCount = advisoryCountThisTest;
    }
  });

  const repeatAdvisoryCount = Array.from(advisoryCounter.values()).filter(
    (count) => count > 1
  ).length;

  const latest = tests[0];

  return {
    available: true,
    latestResult: String(latest?.testResult ?? "Unknown"),
    latestDate: latest?.completedDate ?? null,
    latestAdvisoryCount,
    passCount,
    failCount,
    advisoryCount,
    repeatAdvisoryCount,
  };
}

function getHpiChecks(summary: any) {
  if (!summary || typeof summary !== "object") return [];

  const candidates = [
    {
      label: "Finance",
      keys: ["finance", "has_finance", "outstanding_finance"],
    },
    {
      label: "Write-off",
      keys: ["writeOff", "write_off", "insurance_write_off"],
    },
    { label: "Stolen", keys: ["stolen", "is_stolen"] },
    { label: "Mileage", keys: ["mileageAnomaly", "mileage_anomaly"] },
    { label: "Keepers", keys: ["keeperHistory", "keeper_history", "keepers"] },
    { label: "Plate changes", keys: ["plateChanges", "plate_changes"] },
  ];

  return candidates
    .map((item) => {
      const foundKey = item.keys.find((key) => key in summary);
      if (!foundKey) return null;
      return {
        label: item.label,
        value: summary[foundKey],
      };
    })
    .filter(Boolean) as { label: string; value: any }[];
}

function renderHpiValue(value: any) {
  if (typeof value === "boolean") {
    return value ? "Flag found" : "No issue shown";
  }
  if (typeof value === "number") {
    return String(value);
  }
  if (typeof value === "string" && value.trim()) {
    return value;
  }
  if (Array.isArray(value)) {
    return value.length ? `${value.length} record(s)` : "None shown";
  }
  if (value && typeof value === "object") {
    if (typeof value.status === "string") return value.status;
    if (typeof value.result === "string") return value.result;
    if (typeof value.value === "string") return value.value;
    return "Available";
  }
  return "Unavailable";
}

function itemTone(item: any) {
  const high = Number(item?.cost_high ?? 0);
  if (high >= 1000) {
    return "border-red-200 bg-red-50/60";
  }
  if (high >= 400) {
    return "border-amber-200 bg-amber-50/60";
  }
  return "border-slate-200 bg-white";
}

export default async function Page({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { session_id?: string; tier?: string };
}) {
  const cookieStore = cookies();

  const supabaseServer = createServerClient(
    mustGetEnv("NEXT_PUBLIC_SUPABASE_URL"),
    mustGetEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set() {},
        remove() {},
      },
    }
  );

  const {
    data: { user },
  } = await supabaseServer.auth.getUser();

  const { data, error } = await supabaseAdmin
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

  let isPaid = data.is_paid === true;
  let hpiUnlocked = data.hpi_unlocked === true;

  const ownerUserId = (data.owner_user_id as string | null) ?? null;
  const expiresAt = (data.expires_at as string | null) ?? null;
  const expiresAtLabel = formatDate(expiresAt);
  const hasExpired = isExpired(expiresAt);

  const sessionId = searchParams?.session_id;
  let paymentJustVerified = false;
  let justUnlockedTier: CheckoutTier | null = null;

  if (sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      const sessionReportId = session.metadata?.report_id;
      const sessionCheckoutTier = parseCheckoutTier(
        session.metadata?.checkout_tier
      );
      const isSessionPaid =
        session.payment_status === "paid" || session.status === "complete";

      if (isSessionPaid && sessionReportId === params.id) {
        paymentJustVerified = true;
        justUnlockedTier = sessionCheckoutTier;

        if (sessionCheckoutTier === "report") {
          isPaid = true;
        }

        if (
          sessionCheckoutTier === "hpi_upgrade" ||
          sessionCheckoutTier === "report_plus_hpi"
        ) {
          isPaid = true;
          hpiUnlocked = true;
        }
      }
    } catch (e) {
      console.error("Failed to verify Stripe session on report page:", e);
    }
  }

  if (isPaid && hasExpired) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
          <div className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-red-700">
            Report expired
          </div>

          <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-950">
            This report is no longer available
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-700">
            Paid reports can be revisited for 30 days. This one expired
            {expiresAtLabel ? (
              <>
                {" "}
                on <span className="font-semibold">{expiresAtLabel}</span>
              </>
            ) : null}
            .
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-700">
            Please run a fresh check if you still want a current report for this
            vehicle.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/check" className="btn-primary">
              Start a new check
            </Link>
            <Link href="/" className="btn-outline">
              Back home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (
    isPaid &&
    ownerUserId &&
    ownerUserId !== user?.id &&
    !paymentJustVerified
  ) {
    const loginReturnUrl = encodeURIComponent(
      `/report/${data.id}?claim_report=${data.id}`
    );
    const loginUrl = `/auth?mode=login&next=${loginReturnUrl}&claim_report=${encodeURIComponent(
      data.id
    )}`;

    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <div className="rounded-2xl border border-black bg-white p-6 shadow-sm">
          <div className="inline-flex items-center rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-700">
            Account access required
          </div>

          <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-950">
            This report is saved to another account
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-700">
            This paid report has already been linked to an AutoAudit account.
            Please log in with that account to view it.
          </p>

          {expiresAtLabel ? (
            <p className="mt-2 text-sm leading-6 text-slate-700">
              Access is available until{" "}
              <span className="font-semibold">{expiresAtLabel}</span>.
            </p>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-3">
            <Link href={loginUrl} className="btn-primary">
              Log in
            </Link>
            <Link href="/" className="btn-outline">
              Back home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const preview: any = data.preview_payload ?? {};
  const previewSummary: any = preview.summary ?? {};

  const buckets: any[] = Array.isArray(preview.buckets) ? preview.buckets : [];

  const teaser: any = preview.teaser ?? {};
  const blurredLabels: string[] = Array.isArray(teaser.blurred_labels)
    ? teaser.blurred_labels
    : [];

  const hiddenCount: number =
    typeof teaser.hidden_count === "number"
      ? teaser.hidden_count
      : blurredLabels.length;

  const exposureLow: number | null =
    typeof previewSummary.exposure_low === "number"
      ? previewSummary.exposure_low
      : null;

  const exposureHigh: number | null =
    typeof previewSummary.exposure_high === "number"
      ? previewSummary.exposure_high
      : null;

  const confidence: any = previewSummary.confidence ?? null;
  const confidenceDisplay = getConfidenceDisplay(confidence);
  const snapshotVerdict = getSnapshotVerdict(exposureLow, exposureHigh);

  const reportCheckoutUrl = `/api/checkout?report_id=${data.id}&tier=report`;
  const hpiUpgradeCheckoutUrl = `/api/checkout?report_id=${data.id}&tier=hpi_upgrade`;
  const reportPlusHpiCheckoutUrl = `/api/checkout?report_id=${data.id}&tier=report_plus_hpi`;

  const priceLabel = "£4.99";
  const hpiUpgradePriceLabel = "£5";
  const reportPlusHpiPriceLabel = "£9.99";

  const fullPayload: any = data.full_payload ?? {};
  const fullSummary: any = fullPayload.summary ?? {};
  const fullItems: any[] = Array.isArray(fullPayload.items)
    ? fullPayload.items
    : [];

  const negotiationSuggested: number | null =
    typeof fullPayload.negotiation_suggested === "number"
      ? fullPayload.negotiation_suggested
      : typeof fullPayload.negotiationSuggested === "number"
        ? fullPayload.negotiationSuggested
        : typeof fullSummary.negotiation_suggested === "number"
          ? fullSummary.negotiation_suggested
          : typeof fullSummary.negotiationSuggested === "number"
            ? fullSummary.negotiationSuggested
            : null;

  const justUnlockedReport = justUnlockedTier === "report";
  const justUnlockedHpi =
    justUnlockedTier === "hpi_upgrade" ||
    justUnlockedTier === "report_plus_hpi";

  const motPayload: any = data.mot_payload ?? null;
  const motPanel = getMotPanelSummary(motPayload);

  let hpiPayload: any = hpiUnlocked ? data.hpi_payload ?? null : null;
  let hpiSummary: any = hpiUnlocked ? data.hpi_summary ?? null : null;
  let hpiChecked: boolean = hpiUnlocked ? data.hpi_checked === true : false;
  let hpiStatus: string | null = hpiUnlocked
    ? ((data.hpi_status as string | null) ?? null)
    : "locked";

  const shouldFetchHpi =
    hpiUnlocked &&
    isPaid &&
    reg &&
    (!hpiChecked || hpiStatus !== "success" || !hpiPayload || !hpiSummary);

  if (shouldFetchHpi) {
    try {
      const rawPayload = await fetchUkvdHpiByVrm(reg);
      const summary = buildUkvdHpiSummary(rawPayload);

      const { error: updateError } = await supabaseAdmin
        .from("reports")
        .update({
          hpi_checked: true,
          hpi_checked_at: new Date().toISOString(),
          hpi_status: "success",
          hpi_payload: rawPayload,
          hpi_summary: summary,
        })
        .eq("id", params.id);

      if (updateError) {
        console.error("Failed to save HPI data:", updateError);
      } else {
        hpiPayload = rawPayload;
        hpiSummary = summary;
        hpiChecked = true;
        hpiStatus = "success";
      }
    } catch (e: any) {
      console.error("HPI lookup failed:", e);

      const errorPayload = {
        message: e?.message ?? "HPI lookup failed",
      };

      const { error: updateError } = await supabaseAdmin
        .from("reports")
        .update({
          hpi_checked: true,
          hpi_checked_at: new Date().toISOString(),
          hpi_status: "error",
          hpi_payload: errorPayload,
          hpi_summary: null,
        })
        .eq("id", params.id);

      if (updateError) {
        console.error("Failed to save HPI error state:", updateError);
      }

      hpiPayload = errorPayload;
      hpiSummary = null;
      hpiChecked = true;
      hpiStatus = "error";
    }
  }

  const authNextUrl = `/report/${data.id}?claim_report=${data.id}`;
  const authReturnUrl = encodeURIComponent(authNextUrl);
  const claimReportId = encodeURIComponent(data.id);

  const registerUrl = `/auth?mode=signup&next=${authReturnUrl}&claim_report=${claimReportId}`;
  const loginUrl = `/auth?mode=login&next=${authReturnUrl}&claim_report=${claimReportId}`;

  const motRiskItems = fullItems.filter((item: any) => {
    const category = String(item?.category ?? "").toLowerCase();
    const itemId = String(item?.item_id ?? "").toLowerCase();
    return category.includes("mot") || itemId.startsWith("mot_");
  });

  const serviceRiskItems = fullItems.filter((item: any) => {
    const category = String(item?.category ?? "").toLowerCase();
    const itemId = String(item?.item_id ?? "").toLowerCase();
    return !(category.includes("mot") || itemId.startsWith("mot_"));
  });

  const hpiChecks = getHpiChecks(hpiSummary);

  if (isPaid) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:py-8">
        <div className="mb-6 hidden border-b border-slate-300 pb-3 print:block">
          <div className="text-lg font-bold text-slate-950">
            AutoAudit Vehicle Report
          </div>
          <div className="text-sm text-slate-600">
            Generated: {new Date().toLocaleDateString("en-GB")}
          </div>
          {reg ? (
            <div className="mt-1 text-sm text-slate-600">
              Registration: <span className="font-semibold">{reg}</span>
              {make ? <> · {make}</> : null}
              {year ? <> · {year}</> : null}
            </div>
          ) : null}
        </div>

        {justUnlockedReport || justUnlockedHpi ? (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="text-sm font-semibold text-emerald-900">
              {justUnlockedHpi
                ? "History & provenance check unlocked"
                : "Core report unlocked"}
            </div>
            <div className="mt-1 text-sm text-emerald-900/80">
              {justUnlockedHpi
                ? "Your report now includes the HPI-style history panel."
                : "You now have service risk, detailed findings and MoT analysis."}
            </div>
          </div>
        ) : null}

        <div className="relative overflow-hidden rounded-[2rem] border border-[var(--aa-silver)] bg-[var(--aa-black)] shadow-[0_18px_60px_rgba(15,23,42,0.14)]">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/hero-car-road.png')" }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.95)_0%,rgba(255,255,255,0.93)_42%,rgba(255,255,255,0.28)_72%,rgba(255,255,255,0.10)_100%)]" />

          <div className="relative px-5 py-6 sm:px-8 sm:py-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center rounded-full border border-[var(--aa-silver)] bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-700 shadow-sm">
                Paid report
              </div>

              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-black sm:text-4xl">
                Full Vehicle Report for {reg ?? "this vehicle"}
              </h1>

              <div className="mt-2 text-sm text-slate-600">
                {make ? `${make} · ` : ""}
                {year ? `${year} · ` : ""}
                {fuel ? `${fuel} · ` : ""}
                {transmission ? `${transmission} · ` : ""}
                {typeof mileage === "number"
                  ? `${mileage.toLocaleString()} miles`
                  : ""}
              </div>

              {fullSummary?.headline ? (
                <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-700 sm:text-base">
                  {fullSummary.headline}
                  {fullSummary?.summary_text
                    ? ` ${fullSummary.summary_text}`
                    : ""}
                </p>
              ) : null}
            </div>

            <div className="mt-8 grid gap-4 xl:grid-cols-3">
              <div className="rounded-2xl border border-white/40 bg-white/92 p-5 shadow-[0_12px_32px_rgba(0,0,0,0.10)] backdrop-blur">
                <div className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Service Risk
                </div>

                <div className="mt-4">
                  {exposureLow !== null && exposureHigh !== null ? (
                    <ExposureBar low={exposureLow} high={exposureHigh} />
                  ) : (
                    <div className="text-sm text-slate-600">
                      Exposure estimate unavailable.
                    </div>
                  )}
                </div>

                <div className="mt-4 grid gap-3">
                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Confidence
                    </div>
                    <div className="mt-1 text-sm font-semibold text-slate-950">
                      {confidenceDisplay ?? "Unavailable"}
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Negotiation guide
                    </div>
                    <div className="mt-1 text-sm font-semibold text-slate-950">
                      {money(negotiationSuggested)}
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Estimated exposure
                    </div>
                    <div className="mt-1 text-sm font-semibold text-slate-950">
                      {money(exposureLow)} – {money(exposureHigh)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/40 bg-white/92 p-5 shadow-[0_12px_32px_rgba(0,0,0,0.10)] backdrop-blur">
                <div className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  MoT History
                </div>

                {motPanel.available ? (
                  <>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="inline-flex items-center rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-800">
                        Latest:{" "}
                        {motPanel.latestResult
                          ? titleCase(motPanel.latestResult)
                          : "—"}
                      </span>

                      <span className="inline-flex items-center rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-800">
                        Latest advisories: {motPanel.latestAdvisoryCount}
                      </span>
                    </div>

                    <div className="mt-3 text-sm text-slate-600">
                      Latest test date:{" "}
                      <span className="font-semibold text-slate-900">
                        {formatDate(motPanel.latestDate) ?? "—"}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-slate-200 bg-white p-3">
                        <div className="text-lg font-extrabold text-slate-950">
                          {motPanel.passCount}
                        </div>
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Passes
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-white p-3">
                        <div className="text-lg font-extrabold text-slate-950">
                          {motPanel.failCount}
                        </div>
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Fails
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-white p-3">
                        <div className="text-lg font-extrabold text-slate-950">
                          {motPanel.advisoryCount}
                        </div>
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Advisories
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-white p-3">
                        <div className="text-lg font-extrabold text-slate-950">
                          {motPanel.repeatAdvisoryCount}
                        </div>
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Repeat patterns
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="mt-4 text-sm text-slate-600">
                    MoT history was not available for this vehicle.
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-white/40 bg-white/92 p-5 shadow-[0_12px_32px_rgba(0,0,0,0.10)] backdrop-blur">
                <div className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  HPI Check
                </div>

                {!hpiUnlocked ? (
                  <div className="mt-4 rounded-xl border border-[var(--aa-red)]/20 bg-[var(--aa-red)]/5 p-4">
                    <div className="text-base font-semibold text-slate-950">
                      Upgrade to add vehicle history
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      Add finance markers, write-off records, stolen checks,
                      mileage anomalies, keeper history and plate changes.
                    </p>
                    <div className="mt-4">
                      <a href={hpiUpgradeCheckoutUrl} className="btn-primary">
                        Add HPI check · {hpiUpgradePriceLabel}
                      </a>
                    </div>
                  </div>
                ) : hpiStatus === "error" ? (
                  <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-slate-700">
                    We unlocked the HPI section, but there was a temporary issue
                    loading the latest history response.
                  </div>
                ) : (
                  <div className="mt-4 grid gap-3">
                    {hpiChecks.length ? (
                      hpiChecks.map((item) => (
                        <div
                          key={item.label}
                          className="rounded-xl border border-slate-200 bg-white p-3"
                        >
                          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            {item.label}
                          </div>
                          <div className="mt-1 text-sm font-semibold text-slate-950">
                            {renderHpiValue(item.value)}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
                        HPI summary available.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50/50 p-4 print:hidden">
          <div className="text-sm font-semibold text-slate-950">
            Save access to this report
          </div>

          <div className="mt-1 text-sm text-slate-700">
            Create an account after purchase to keep access to this report
            for 30 days
            {expiresAtLabel ? (
              <>
                {" "}
                — until <span className="font-semibold">{expiresAtLabel}</span>
              </>
            ) : (
              <> from the date of payment</>
            )}
            .
          </div>

          <div className="mt-2 text-sm text-slate-700">
            If you do not register or download your report, you may not be
            able to access it again after that 30-day period has ended.
          </div>

          {!ownerUserId ? (
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href={registerUrl} className="btn-primary">
                Create account to save report
              </Link>

              <Link href={loginUrl} className="btn-outline">
                Log in to save report
              </Link>
            </div>
          ) : user?.id === ownerUserId ? (
            <div className="mt-4 inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-800">
              This report is linked to your account
            </div>
          ) : null}
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-950">
            Specific Risks
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            These are the service exposure items and MoT advisory pattern
            risks identified for this vehicle.
          </p>
        </div>

        <div className="mt-5 space-y-8">
          <section>
            <div className="mb-4 flex items-center justify-between gap-4">
              <h3 className="text-lg font-bold text-slate-950">
                Service exposure items
              </h3>
              <div className="text-sm text-slate-600">
                {serviceRiskItems.length} item
                {serviceRiskItems.length === 1 ? "" : "s"}
              </div>
            </div>

            {serviceRiskItems.length ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {serviceRiskItems.map((item: any, index: number) => (
                  <div
                    key={`${item?.item_id ?? "service"}-${index}`}
                    className={`rounded-2xl border p-5 shadow-sm ${itemTone(item)}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-lg font-bold tracking-tight text-slate-950">
                          {item?.label ?? "Flagged item"}
                        </div>
                        <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          {String(item?.category ?? "service").replace(
                            /_/g,
                            " "
                          )}
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-right">
                        <div className="text-sm font-semibold text-slate-950">
                          {money(Number(item?.cost_low ?? 0))} –{" "}
                          {money(Number(item?.cost_high ?? 0))}
                        </div>
                        <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                          likely exposure
                        </div>
                      </div>
                    </div>

                    {item?.why_flagged ? (
                      <p className="mt-4 text-sm leading-6 text-slate-700">
                        <span className="font-semibold text-slate-950">
                          Why flagged:
                        </span>{" "}
                        {item.why_flagged}
                      </p>
                    ) : null}

                    {item?.why_it_matters ? (
                      <p className="mt-3 text-sm leading-6 text-slate-700">
                        <span className="font-semibold text-slate-950">
                          Why it matters:
                        </span>{" "}
                        {item.why_it_matters}
                      </p>
                    ) : null}

                    {Array.isArray(item?.questions_to_ask) &&
                    item.questions_to_ask.length ? (
                      <div className="mt-4">
                        <div className="text-sm font-semibold text-slate-950">
                          Questions to ask
                        </div>
                        <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-700">
                          {item.questions_to_ask.map(
                            (q: string, i: number) => (
                              <li key={i}>• {q}</li>
                            )
                          )}
                        </ul>
                      </div>
                    ) : null}

                    {Array.isArray(item?.red_flags) &&
                    item.red_flags.length ? (
                      <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3">
                        <div className="text-sm font-semibold text-slate-950">
                          Red flags
                        </div>
                        <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-700">
                          {item.red_flags.map((rf: string, i: number) => (
                            <li key={i}>• {rf}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-700">
                No service exposure items were listed in this report.
              </div>
            )}
          </section>

          <section>
            <div className="mb-4 flex items-center justify-between gap-4">
              <h3 className="text-lg font-bold text-slate-950">
                MoT advisory and history risks
              </h3>
              <div className="text-sm text-slate-600">
                {motRiskItems.length} item
                {motRiskItems.length === 1 ? "" : "s"}
              </div>
            </div>

            {motRiskItems.length ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {motRiskItems.map((item: any, index: number) => (
                  <div
                    key={`${item?.item_id ?? "mot"}-${index}`}
                    className={`rounded-2xl border p-5 shadow-sm ${itemTone(item)}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-lg font-bold tracking-tight text-slate-950">
                          {item?.label ?? "MoT history item"}
                        </div>
                        <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          MoT-derived risk
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-right">
                        <div className="text-sm font-semibold text-slate-950">
                          {money(Number(item?.cost_low ?? 0))} –{" "}
                          {money(Number(item?.cost_high ?? 0))}
                        </div>
                        <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                          likely exposure
                        </div>
                      </div>
                    </div>

                    {item?.why_flagged ? (
                      <p className="mt-4 text-sm leading-6 text-slate-700">
                        <span className="font-semibold text-slate-950">
                          Why flagged:
                        </span>{" "}
                        {item.why_flagged}
                      </p>
                    ) : null}

                    {item?.why_it_matters ? (
                      <p className="mt-3 text-sm leading-6 text-slate-700">
                        <span className="font-semibold text-slate-950">
                          Why it matters:
                        </span>{" "}
                        {item.why_it_matters}
                      </p>
                    ) : null}

                    {Array.isArray(item?.questions_to_ask) &&
                    item.questions_to_ask.length ? (
                      <div className="mt-4">
                        <div className="text-sm font-semibold text-slate-950">
                          Questions to ask
                        </div>
                        <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-700">
                          {item.questions_to_ask.map(
                            (q: string, i: number) => (
                              <li key={i}>• {q}</li>
                            )
                          )}
                        </ul>
                      </div>
                    ) : null}

                    {Array.isArray(item?.red_flags) &&
                    item.red_flags.length ? (
                      <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3">
                        <div className="text-sm font-semibold text-slate-950">
                          Red flags
                        </div>
                        <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-700">
                          {item.red_flags.map((rf: string, i: number) => (
                            <li key={i}>• {rf}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-700">
                No MoT advisory pattern risks were listed in this report.
              </div>
            )}
          </section>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
          AutoAudit provides guidance only and is not a substitute for a
          mechanical inspection.
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto w-full max-w-4xl px-4 pb-32 pt-4">
        <div className="rounded-2xl border border-black bg-white px-5 py-5 shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <div
              className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${snapshotVerdict.badgeClass}`}
            >
              {snapshotVerdict.badgeLabel}
            </div>

            <div className="inline-flex items-center rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-700">
              AutoAudit snapshot
            </div>
          </div>

          {reg ? (
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              {reg}
              {make ? (
                <span className="ml-2 font-medium text-slate-500">
                  · {make}
                </span>
              ) : null}
            </h1>
          ) : (
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
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
            {snapshotVerdict.title}
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700 sm:text-base">
            {snapshotVerdict.description}
          </p>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.6fr_0.9fr]">
            <div className="rounded-2xl border border-black bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Estimated near-term maintenance exposure
                  </div>
                  <div className="mt-1 text-sm text-slate-600">
                    Use this to budget and negotiate before you buy.
                  </div>
                </div>

                <div className="hidden sm:inline-flex items-center rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                  Instant snapshot
                </div>
              </div>

              <div className="mt-4">
                {exposureLow !== null && exposureHigh !== null ? (
                  <ExposureBar low={exposureLow} high={exposureHigh} />
                ) : (
                  <div className="mt-2 text-sm text-slate-700">
                    Exposure estimate unavailable.
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {confidenceDisplay ? (
                  <span className="inline-flex items-center rounded-full border border-slate-300 bg-white px-3 py-1 text-sm">
                    <span className="font-semibold">Confidence:</span>
                    <span className="ml-2">{confidenceDisplay}</span>
                  </span>
                ) : null}

                <span className="inline-flex items-center rounded-full border border-slate-300 bg-white px-3 py-1 text-sm text-slate-600">
                  Best with service history + latest MoT
                </span>
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
                Unlock the full report to see detailed findings, MoT advisory
                analysis, negotiation guidance and seller red flags.
              </p>

              <div className="mt-5 space-y-3">
                <a
                  href={reportCheckoutUrl}
                  className="btn-primary block text-center"
                >
                  Unlock core report · {priceLabel}
                </a>

                <a
                  href={reportPlusHpiCheckoutUrl}
                  className="block rounded-lg border border-white/15 bg-white/10 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  Get full bundle · {reportPlusHpiPriceLabel}
                </a>
              </div>

              <div className="mt-4 text-xs leading-5 text-slate-400">
                Core report includes service risk, detailed findings and MoT
                analysis. Full bundle adds vehicle history & provenance checks.
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">
              Risk breakdown by system
            </h2>

            <div className="mt-3 space-y-2">
              {buckets.length ? (
                buckets.map((b: any) => (
                  <div
                    key={b.key}
                    className="rounded-xl border border-slate-200 bg-white p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">
                          {b.label ?? "Category"}
                        </div>
                        <div className="mt-1 text-xs text-slate-600">
                          {typeof b.item_count === "number"
                            ? `${b.item_count} checks flagged`
                            : ""}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-semibold text-slate-900">
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

          <div>
            <div className="rounded-2xl border border-red-200 bg-white p-4 shadow-sm">
              <div className="text-base font-semibold text-slate-950">
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
                <a
                  href={reportCheckoutUrl}
                  className="btn-primary block text-center"
                >
                  Unlock full report · {priceLabel}
                </a>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-950">
                Why people unlock
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                A single hidden issue can cost far more than the report. The
                full bundle adds finance, write-off, stolen, mileage and keeper
                history checks.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-black bg-white p-5 shadow-sm">
          <div className="mb-4">
            <div className="inline-flex items-center rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-700">
              Choose your report
            </div>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-950">
              Pick the level of checking you want
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              Choose the core report for service risk and MoT analysis, or go
              straight to the full bundle with the added vehicle history &
              provenance check.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-950">
                Core report · {priceLabel}
              </div>
              <div className="mt-2 text-sm text-slate-700">
                Service risk, detailed findings, seller questions, negotiation
                guidance and MoT analysis.
              </div>
              <div className="mt-4">
                <a href={reportCheckoutUrl} className="btn-primary">
                  Buy core report · {priceLabel}
                </a>
              </div>
            </div>

            <div className="rounded-xl border border-red-200 bg-red-50/40 p-4">
              <div className="text-sm font-semibold text-slate-950">
                Complete report bundle · {reportPlusHpiPriceLabel}
              </div>
              <div className="mt-2 text-sm text-slate-700">
                Everything in the core report, plus HPI-style history checks
                including finance markers, write-off records, stolen markers,
                mileage anomalies, keeper history and plate changes.
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <a href={reportPlusHpiCheckoutUrl} className="btn-primary">
                  Buy complete bundle · {reportPlusHpiPriceLabel}
                </a>
                <span className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700">
                  Or start with core report and add history later for{" "}
                  {hpiUpgradePriceLabel}
                </span>
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
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-3">
          <div className="text-sm">
            <div className="font-semibold text-slate-950">
              Unlock core report · {priceLabel}
            </div>
            <div className="text-xs text-slate-600">
              Service risk, MoT analysis and full report findings
            </div>
          </div>

          <a href={reportCheckoutUrl} className="btn-primary whitespace-nowrap">
            Unlock report
          </a>
        </div>
      </div>
    </>
  );
}