export const dynamic = "force-dynamic";

import Link from "next/link";
import Stripe from "stripe";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabaseAdmin } from "@/lib/supabase";
import { mustGetEnv } from "@/lib/env";
import { buildUkvdHpiSummary, fetchUkvdHpiByVrm } from "@/lib/hpi";
import {
  buildUkvdMarketValue,
  buildUkvdValuationSummary,
  buildUkvdVehicleEnrichment,
  fetchUkvdValuationByVrm,
} from "@/lib/ukvdValuation";
import { matchKnownModelIssues } from "@/lib/commonFailures";
import ExposureBar from "@/app/components/ExposureBar";
import ReportClient from "./ReportClient";

const stripe = new Stripe(mustGetEnv("STRIPE_SECRET_KEY"), {
  apiVersion: "2024-06-20",
});

type CheckoutTier = "report" | "hpi_upgrade" | "report_plus_hpi";

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
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
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

function valuePillStyles(position?: string | null) {
  if (position === "good") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  if (position === "high") {
    return "border-red-200 bg-red-50 text-red-700";
  }
  if (position === "fair") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }
  return "border-slate-300 bg-slate-50 text-slate-700";
}

function valuePillLabel(position?: string | null) {
  if (position === "good") return "Below market";
  if (position === "high") return "Above market";
  if (position === "fair") return "Fair value";
  return "Value insight pending";
}

function pickFirstObject(...values: any[]) {
  for (const value of values) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return value;
    }
  }
  return null;
}

function pickNumber(...values: any[]) {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
  }
  return null;
}

function pickString(...values: any[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value;
  }
  return null;
}

function buildNormalizedMarketValue(fullPayload: any, preview: any) {
  const fullSummary = fullPayload?.summary ?? {};
  const previewSummary = preview?.summary ?? {};

  return (
    pickFirstObject(
      fullPayload?.valuation,
      fullSummary?.market_value,
      preview?.valuation,
      previewSummary?.market_value
    ) ?? null
  );
}

function buildNormalizedVehicleIdentity(fullPayload: any, preview: any) {
  return {
    vehicle_identity:
      pickFirstObject(
        fullPayload?.vehicle_identity,
        fullPayload?.summary?.vehicle_identity,
        preview?.vehicle_identity,
        preview?.summary?.vehicle_identity
      ) ?? null,
    vehicle_identity_enriched:
      pickFirstObject(
        fullPayload?.vehicle_identity_enriched,
        fullPayload?.summary?.vehicle_identity_enriched,
        preview?.vehicle_identity_enriched,
        preview?.summary?.vehicle_identity_enriched
      ) ?? null,
    ukvd: pickFirstObject(
      fullPayload?.ukvd,
      fullPayload?.summary?.ukvd,
      preview?.ukvd,
      preview?.summary?.ukvd
    ),
  };
}

function buildFallbackUkvdMatcherInput(args: {
  report: any;
  previewPayload: any;
  fullPayload: any;
}) {
  const { report, previewPayload, fullPayload } = args;

  const existingIdentity =
    pickFirstObject(
      fullPayload?.vehicle_identity_enriched,
      fullPayload?.vehicle_identity,
      previewPayload?.vehicle_identity_enriched,
      previewPayload?.vehicle_identity
    ) ?? null;

  return {
    registration:
      pickString(report?.registration, existingIdentity?.registration) ?? null,
    make: pickString(existingIdentity?.make, report?.make) ?? null,
    model:
      pickString(
        existingIdentity?.model,
        fullPayload?.model,
        previewPayload?.model
      ) ?? null,
    derivative: pickString(existingIdentity?.derivative) ?? null,
    generation: pickString(existingIdentity?.generation) ?? null,
    engine: pickString(existingIdentity?.engine) ?? null,
    engine_family: pickString(existingIdentity?.engine_family) ?? null,
    engine_code: pickString(existingIdentity?.engine_code) ?? null,
    engine_size: pickString(existingIdentity?.engine_size) ?? null,
    power: pickString(existingIdentity?.power) ?? null,
    fuel: pickString(existingIdentity?.fuel, report?.fuel) ?? null,
    transmission: pickString(
      existingIdentity?.transmission,
      report?.transmission
    ) ?? null,
    year: pickNumber(existingIdentity?.year, report?.car_year) ?? null,
    mileage: pickNumber(existingIdentity?.mileage, report?.mileage) ?? null,
  };
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
      <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:py-8">
        <h1 className="text-2xl font-bold">Snapshot not found</h1>
        <p className="mt-2 text-sm text-slate-600">
          We couldn’t load that report. Please go back and try again.
        </p>

        <div className="mt-4">
          <Link href="/" className="btn-outline w-full text-center sm:w-auto">
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
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-10">
        <div className="rounded-2xl border border-red-200 bg-white p-5 shadow-sm sm:p-6">
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

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="/check" className="btn-primary w-full text-center sm:w-auto">
              Start a new check
            </Link>
            <Link href="/" className="btn-outline w-full text-center sm:w-auto">
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
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-10">
        <div className="rounded-2xl border border-black bg-white p-5 shadow-sm sm:p-6">
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

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href={loginUrl} className="btn-primary w-full text-center sm:w-auto">
              Log in
            </Link>
            <Link href="/" className="btn-outline w-full text-center sm:w-auto">
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

  const previewExposureLow: number | null =
    typeof previewSummary.exposure_low === "number"
      ? previewSummary.exposure_low
      : null;

  const previewExposureHigh: number | null =
    typeof previewSummary.exposure_high === "number"
      ? previewSummary.exposure_high
      : null;

  const confidence: any = previewSummary.confidence ?? null;
  const confidenceDisplay = getConfidenceDisplay(confidence);
  const snapshotVerdict = getSnapshotVerdict(
    previewExposureLow,
    previewExposureHigh
  );

  const previewKnownModelIssuesTeaser =
    previewSummary?.known_model_issues_teaser &&
    typeof previewSummary.known_model_issues_teaser === "object"
      ? previewSummary.known_model_issues_teaser
      : null;

  const previewKnownModelIssueLabels: string[] = Array.isArray(
    previewKnownModelIssuesTeaser?.top_labels
  )
    ? previewKnownModelIssuesTeaser.top_labels.filter(
        (value: unknown) => typeof value === "string" && value.trim()
      )
    : [];

  const previewKnownModelIssueCount: number | null =
    typeof previewKnownModelIssuesTeaser?.count === "number"
      ? previewKnownModelIssuesTeaser.count
      : null;

  const previewKnownModelIssueMessage: string | null =
    typeof previewKnownModelIssuesTeaser?.message === "string"
      ? previewKnownModelIssuesTeaser.message
      : null;

  const reportCheckoutUrl = `/api/checkout?report_id=${data.id}&tier=report`;
  const hpiUpgradeCheckoutUrl = `/api/checkout?report_id=${data.id}&tier=hpi_upgrade`;
  const reportPlusHpiCheckoutUrl = `/api/checkout?report_id=${data.id}&tier=report_plus_hpi`;

  const priceLabel = "£4.99";
  const hpiUpgradePriceLabel = "£5";
  const reportPlusHpiPriceLabel = "£9.99";

  let fullPayload: any = data.full_payload ?? {};
  let fullSummaryData: any = fullPayload.summary ?? {};
  let fullItems: any[] = Array.isArray(fullPayload.items) ? fullPayload.items : [];

  const shouldFallbackEnrichUkvd =
    isPaid &&
    !!reg &&
    (!fullPayload?.ukvd || fullPayload?.ukvd?.enrichment_applied !== true);

  if (shouldFallbackEnrichUkvd) {
    try {
      const baseMatcherInput = buildFallbackUkvdMatcherInput({
        report: data,
        previewPayload: preview,
        fullPayload,
      });

      const rawUkvd = await fetchUkvdValuationByVrm(reg, mileage);
      const valuationSummary = buildUkvdValuationSummary(rawUkvd);
      const vehicleEnrichment = buildUkvdVehicleEnrichment(rawUkvd);
      const marketValue = buildUkvdMarketValue({
        valuation: valuationSummary,
        askingPrice: pickNumber(
          fullPayload?.asking_price,
          fullSummaryData?.asking_price,
          preview?.asking_price,
          previewSummary?.asking_price,
          data.asking_price
        ),
      });

      const enrichedMatcherInput = {
        ...baseMatcherInput,
        make: pickString(vehicleEnrichment?.make, baseMatcherInput.make),
        model: pickString(vehicleEnrichment?.model, baseMatcherInput.model),
        derivative: pickString(
          vehicleEnrichment?.derivative,
          baseMatcherInput.derivative
        ),
        generation: pickString(
          vehicleEnrichment?.generation,
          baseMatcherInput.generation
        ),
        engine: pickString(vehicleEnrichment?.engine, baseMatcherInput.engine),
        engine_family: pickString(
          vehicleEnrichment?.engine_family,
          baseMatcherInput.engine_family
        ),
        engine_code: pickString(
          vehicleEnrichment?.engine_code,
          baseMatcherInput.engine_code
        ),
        engine_size: pickString(
          vehicleEnrichment?.engine_size,
          baseMatcherInput.engine_size
        ),
        power: pickString(vehicleEnrichment?.power, baseMatcherInput.power),
        fuel: pickString(vehicleEnrichment?.fuel, baseMatcherInput.fuel),
        transmission: pickString(
          vehicleEnrichment?.transmission,
          baseMatcherInput.transmission
        ),
        year: pickNumber(vehicleEnrichment?.year, baseMatcherInput.year),
        mileage: pickNumber(baseMatcherInput.mileage, mileage),
      };

      const matchedCommonFailures = await matchKnownModelIssues(
        enrichedMatcherInput
      );

      const nextFullPayload = {
        ...fullPayload,
        vehicle_identity:
          pickFirstObject(
            fullPayload?.vehicle_identity,
            preview?.vehicle_identity,
            baseMatcherInput
          ) ?? baseMatcherInput,
        vehicle_identity_enriched: {
          ...(pickFirstObject(
            fullPayload?.vehicle_identity_enriched,
            matchedCommonFailures?.vehicleIdentity,
            vehicleEnrichment
          ) ?? {}),
          ...enrichedMatcherInput,
        },
        known_model_issues:
          matchedCommonFailures?.knownModelIssues ??
          fullPayload?.known_model_issues ??
          [],
        valuation: marketValue,
        ukvd: {
          ...(pickFirstObject(fullPayload?.ukvd) ?? {}),
          enrichment_requested: true,
          enrichment_applied: true,
          enrichment_status: "success",
          enrichment_requested_at:
            fullPayload?.ukvd?.enrichment_requested_at ??
            new Date().toISOString(),
          enrichment_completed_at: new Date().toISOString(),
          valuation: valuationSummary,
          enrichment: vehicleEnrichment,
          raw: rawUkvd,
          error: null,
        },
      };

      nextFullPayload.summary = {
        ...(pickFirstObject(nextFullPayload.summary) ?? {}),
        market_value: marketValue,
      };

      const { error: enrichUpdateError } = await supabaseAdmin
        .from("reports")
        .update({
          full_payload: nextFullPayload,
        })
        .eq("id", params.id);

      if (enrichUpdateError) {
        console.error("Failed to save fallback UKVD enrichment:", enrichUpdateError);
      } else {
        fullPayload = nextFullPayload;
        fullSummaryData = fullPayload.summary ?? {};
        fullItems = Array.isArray(fullPayload.items) ? fullPayload.items : [];
      }
    } catch (e: any) {
      console.error("Fallback UKVD enrichment failed:", e);

      const nextFullPayload = {
        ...fullPayload,
        ukvd: {
          ...(pickFirstObject(fullPayload?.ukvd) ?? {}),
          enrichment_requested: true,
          enrichment_applied: false,
          enrichment_status: "error",
          enrichment_requested_at:
            fullPayload?.ukvd?.enrichment_requested_at ??
            new Date().toISOString(),
          enrichment_completed_at: new Date().toISOString(),
          error: e?.message ?? "UKVD enrichment failed",
        },
      };

      const { error: enrichUpdateError } = await supabaseAdmin
        .from("reports")
        .update({
          full_payload: nextFullPayload,
        })
        .eq("id", params.id);

      if (enrichUpdateError) {
        console.error(
          "Failed to save fallback UKVD enrichment error state:",
          enrichUpdateError
        );
      } else {
        fullPayload = nextFullPayload;
        fullSummaryData = fullPayload.summary ?? {};
        fullItems = Array.isArray(fullPayload.items) ? fullPayload.items : [];
      }
    }
  }

  const paidExposureLow: number | null =
    typeof fullSummaryData.exposure_low === "number"
      ? fullSummaryData.exposure_low
      : previewExposureLow;

  const paidExposureHigh: number | null =
    typeof fullSummaryData.exposure_high === "number"
      ? fullSummaryData.exposure_high
      : previewExposureHigh;

  const negotiationSuggested: number | null =
    typeof fullPayload.negotiation_suggested === "number"
      ? fullPayload.negotiation_suggested
      : typeof fullPayload.negotiationSuggested === "number"
        ? fullPayload.negotiationSuggested
        : typeof fullSummaryData.negotiation_suggested === "number"
          ? fullSummaryData.negotiation_suggested
          : typeof fullSummaryData.negotiationSuggested === "number"
            ? fullSummaryData.negotiationSuggested
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

  const marketValue: any = buildNormalizedMarketValue(fullPayload, preview);

  const askingPrice: number | null = pickNumber(
    fullPayload?.asking_price,
    fullSummaryData?.asking_price,
    marketValue?.asking_price,
    preview?.asking_price,
    previewSummary?.asking_price,
    data.asking_price
  );

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

  const normalizedIdentity = buildNormalizedVehicleIdentity(fullPayload, preview);

  fullPayload = {
    ...fullPayload,
    vehicle_identity: normalizedIdentity.vehicle_identity,
    vehicle_identity_enriched: normalizedIdentity.vehicle_identity_enriched,
    valuation: marketValue,
    ukvd: {
      ...(normalizedIdentity.ukvd ?? {}),
      hpi:
        hpiUnlocked && hpiStatus === "success"
          ? {
              payload: hpiPayload,
              summary: hpiSummary,
            }
          : (normalizedIdentity.ukvd?.hpi ?? null),
    },
  };

  if (isPaid) {
    return (
      <ReportClient
        reg={reg}
        make={make}
        year={year}
        mileage={mileage}
        fuel={fuel}
        transmission={transmission}
        fullSummary={fullPayload}
        confidenceDisplay={confidenceDisplay}
        baseExposureLow={paidExposureLow}
        baseExposureHigh={paidExposureHigh}
        negotiationSuggested={negotiationSuggested}
        motPanel={motPanel}
        motPayload={motPayload}
        hpiUnlocked={hpiUnlocked}
        hpiStatus={hpiStatus}
        hpiChecks={hpiChecks}
        hpiUpgradeCheckoutUrl={hpiUpgradeCheckoutUrl}
        hpiUpgradePriceLabel={hpiUpgradePriceLabel}
        justUnlockedReport={justUnlockedReport}
        justUnlockedHpi={justUnlockedHpi}
        ownerUserId={ownerUserId}
        userId={user?.id ?? null}
        registerUrl={registerUrl}
        loginUrl={loginUrl}
        expiresAtLabel={expiresAtLabel}
        serviceRiskItems={serviceRiskItems}
        motRiskItems={motRiskItems}
        askingPrice={askingPrice}
        marketValue={marketValue}
      />
    );
  }

  return (
    <>
      <div className="mx-auto w-full max-w-4xl px-3 pb-36 pt-3 sm:px-4 sm:pb-32 sm:pt-4 lg:px-5">
        <section
          id="summary"
          className="rounded-2xl border border-black bg-white px-3 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.04)] sm:px-4 sm:py-4"
        >
          <div className="flex flex-wrap items-center gap-2">
            <div
              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${snapshotVerdict.badgeClass}`}
            >
              {snapshotVerdict.badgeLabel}
            </div>

            <div className="inline-flex items-center rounded-full border border-slate-300 bg-slate-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-700">
              AutoAudit snapshot
            </div>

            {hiddenCount ? (
              <div className="inline-flex items-center rounded-full border border-slate-300 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                {hiddenCount}+ locked findings
              </div>
            ) : null}
          </div>

          <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              {reg ? (
                <h1 className="text-[1.7rem] font-extrabold leading-none tracking-tight text-slate-950 sm:text-[1.95rem]">
                  {reg}
                  {make ? (
                    <span className="ml-0 mt-1 block text-base font-medium text-slate-500 sm:ml-2 sm:mt-0 sm:inline">
                      · {make}
                    </span>
                  ) : null}
                </h1>
              ) : (
                <h1 className="text-[1.7rem] font-extrabold leading-none tracking-tight text-slate-950 sm:text-[1.95rem]">
                  AutoAudit Snapshot
                </h1>
              )}

              <div className="mt-1.5 text-xs leading-5 text-slate-600">
                {year ? `${year} · ` : ""}
                {fuel ? `${fuel} · ` : ""}
                {transmission ? `${transmission} · ` : ""}
                {typeof mileage === "number"
                  ? `${mileage.toLocaleString()} miles`
                  : ""}
              </div>

              <h2 className="mt-3 text-lg font-extrabold leading-tight tracking-tight text-slate-950 sm:text-xl">
                {snapshotVerdict.title}
              </h2>

              <p className="mt-1.5 max-w-3xl text-sm leading-5 text-slate-700">
                {snapshotVerdict.description}
              </p>
            </div>

            <div className="grid min-w-[220px] grid-cols-2 gap-2 lg:w-[260px]">
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Exposure
                </div>
                <div className="mt-0.5 text-sm font-bold text-slate-950">
                  {previewExposureLow !== null && previewExposureHigh !== null
                    ? `${money(previewExposureLow)}–${money(previewExposureHigh)}`
                    : "Pending"}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Confidence
                </div>
                <div className="mt-0.5 truncate text-sm font-bold text-slate-950">
                  {confidenceDisplay ?? "Pending"}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Price
                </div>
                <div className="mt-0.5 text-sm font-bold text-slate-950">
                  {askingPrice !== null ? money(askingPrice) : "—"}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Value view
                </div>
                <div className="mt-0.5 text-sm font-bold text-slate-950">
                  {valuePillLabel(marketPosition)}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
            <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-amber-800">
              What to do next
            </div>
            <div className="mt-1 text-sm leading-5 text-amber-950">
              Check the exposure and price position first, then unlock the full
              report to see the exact flagged items, seller questions and
              negotiation points.
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
                href="#exposure"
                className="rounded-full border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Risk
              </a>
              <a
                href="#price"
                className="rounded-full border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Price
              </a>
              <a
                href="#locked"
                className="rounded-full border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Locked findings
              </a>
              <a
                href="#packages"
                className="rounded-full border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Unlock options
              </a>
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-[1.55fr_0.95fr]">
          <div className="space-y-3">
            <section
              id="exposure"
              className="rounded-2xl border border-black bg-white p-3 shadow-sm sm:p-4"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Estimated near-term maintenance exposure
                  </div>
                  <div className="mt-1 text-xs leading-5 text-slate-600">
                    Your fast “so what?” budget range before buying.
                  </div>
                </div>

                <div className="inline-flex w-fit items-center rounded-full border border-slate-300 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-700">
                  Snapshot
                </div>
              </div>

              <div className="mt-3 overflow-hidden">
                {previewExposureLow !== null && previewExposureHigh !== null ? (
                  <ExposureBar low={previewExposureLow} high={previewExposureHigh} />
                ) : (
                  <div className="text-sm text-slate-700">
                    Exposure estimate unavailable.
                  </div>
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {confidenceDisplay ? (
                  <span className="inline-flex max-w-full items-center rounded-full border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-700">
                    <span className="font-semibold">Confidence:</span>
                    <span className="ml-1.5 break-words">{confidenceDisplay}</span>
                  </span>
                ) : null}

                <span className="inline-flex max-w-full items-center rounded-full border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-600">
                  Best with service history + latest MoT
                </span>
              </div>
            </section>

            {(askingPrice !== null || marketLow !== null || marketHigh !== null) && (
              <section
                id="price"
                className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-950">
                      Price position
                    </div>
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

                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      Asking price
                    </div>
                    <div className="mt-0.5 break-words text-sm font-extrabold text-slate-950">
                      {askingPrice !== null ? money(askingPrice) : "—"}
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      Typical value
                    </div>
                    <div className="mt-0.5 break-words text-sm font-extrabold text-slate-950">
                      {marketBenchmark !== null ? money(marketBenchmark) : "—"}
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      Market range
                    </div>
                    <div className="mt-0.5 break-words text-sm font-extrabold text-slate-950">
                      {marketLow !== null && marketHigh !== null
                        ? `${money(marketLow)} – ${money(marketHigh)}`
                        : "—"}
                    </div>
                  </div>
                </div>

                {(valuationDate || valuationMileage !== null) && (
                  <div className="mt-2 text-[11px] leading-5 text-slate-500">
                    {valuationDate ? `Valuation date: ${formatDate(valuationDate)}` : ""}
                    {valuationDate && valuationMileage !== null ? " · " : ""}
                    {valuationMileage !== null
                      ? `Valuation mileage: ${valuationMileage.toLocaleString()}`
                      : ""}
                  </div>
                )}

                {marketDelta !== null ? (
                  <div className="mt-2 text-sm text-slate-700">
                    Difference vs typical value:{" "}
                    <span className="font-semibold text-slate-950">
                      {marketDelta > 0 ? "+" : ""}
                      {money(marketDelta)}
                    </span>
                  </div>
                ) : null}
              </section>
            )}

            <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-slate-950">
                    Risk breakdown by system
                  </h2>
                  <p className="mt-0.5 text-xs leading-5 text-slate-600">
                    Where the estimated repair exposure sits.
                  </p>
                </div>
                <a
                  href={reportCheckoutUrl}
                  className="hidden rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 sm:inline-flex"
                >
                  Unlock details
                </a>
              </div>

              <div className="mt-3 space-y-2">
                {buckets.length ? (
                  buckets.map((b: any) => (
                    <div
                      key={b.key}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-slate-900">
                            {b.label ?? "Category"}
                          </div>
                          <div className="mt-0.5 text-[11px] text-slate-600">
                            {typeof b.item_count === "number"
                              ? `${b.item_count} checks flagged`
                              : ""}
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          <div className="text-sm font-semibold text-slate-900">
                            £{Number(b.exposure_low || 0).toLocaleString()} – £
                            {Number(b.exposure_high || 0).toLocaleString()}
                          </div>
                          <div className="text-[11px] text-slate-600">estimated</div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                    No category breakdown available.
                  </div>
                )}
              </div>
            </section>

            {previewKnownModelIssuesTeaser ? (
              <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
                <div className="text-sm font-semibold text-slate-950">
                  Known model issues
                </div>
                <div className="mt-1 text-xs leading-5 text-slate-700">
                  {previewKnownModelIssueMessage ||
                    "This vehicle type is associated with model-specific issues worth checking."}
                </div>

                {previewKnownModelIssueCount !== null ? (
                  <div className="mt-2 text-[11px] font-medium text-slate-600">
                    {previewKnownModelIssueCount} model-specific issue
                    {previewKnownModelIssueCount === 1 ? "" : "s"} found in the
                    full report
                  </div>
                ) : null}

                {previewKnownModelIssueLabels.length ? (
                  <div className="mt-3 space-y-2">
                    {previewKnownModelIssueLabels.map((label, index) => (
                      <div
                        key={`${label}-${index}`}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800"
                      >
                        <span className="select-none break-words blur-sm">{label}</span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </section>
            ) : null}
          </div>

          <div className="space-y-3">
            <section className="rounded-2xl border border-black bg-slate-950 p-3.5 text-white shadow-sm sm:p-4">
              <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/85">
                Unlock full findings
              </div>

              <h3 className="mt-3 text-lg font-extrabold tracking-tight">
                Don’t buy blind
              </h3>

              <p className="mt-1.5 text-sm leading-5 text-slate-300">
                See the exact flagged items, MoT advisory analysis, seller red
                flags, value context and negotiation guidance.
              </p>

              <div className="mt-3 grid grid-cols-1 gap-2">
                <a
                  href={reportCheckoutUrl}
                  className="btn-primary block w-full text-center"
                  title="Unlock full report"
                >
                  Unlock core report · {priceLabel}
                </a>

                <a
                  href={reportPlusHpiCheckoutUrl}
                  className="block w-full rounded-lg border border-white/15 bg-white/10 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/15"
                  title="Unlock complete bundle"
                >
                  Get full bundle · {reportPlusHpiPriceLabel}
                </a>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-slate-300">
                <div>• Itemised repair costs and flagged findings</div>
                <div>• Seller questions, red flags and negotiation help</div>
                <div>• MoT analysis, value context and known model issues</div>
                <div>• Full bundle adds finance, write-off, stolen and mileage checks</div>
              </div>
            </section>

            <section
              id="locked"
              className="rounded-2xl border border-red-200 bg-white p-3 shadow-sm sm:p-4"
            >
              <div className="text-sm font-semibold text-slate-950">
                Detailed findings locked
              </div>
              <div className="mt-0.5 text-xs leading-5 text-slate-600">
                {hiddenCount
                  ? `${hiddenCount} detailed checks detected`
                  : "Detailed checks detected"}
              </div>

              <div className="mt-3 space-y-2">
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
                      <span className="select-none break-words blur-sm">{t}</span>
                    </div>
                  ))}
              </div>

              <div className="mt-3 grid grid-cols-1 gap-1.5 text-sm text-slate-700">
                <div>✔ Itemised repair costs</div>
                <div>✔ Seller questions and red flags</div>
                <div>✔ Negotiation strategy</div>
                <div>✔ MoT advisory analysis</div>
                <div>✔ Price and value context</div>
                <div>✔ Known model issues</div>
              </div>

              <div className="mt-4">
                <a
                  href={reportCheckoutUrl}
                  className="btn-primary block w-full text-center"
                >
                  Unlock full report · {priceLabel}
                </a>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
              <div className="text-sm font-semibold text-slate-950">
                Why people unlock
              </div>
              <p className="mt-1.5 text-sm leading-5 text-slate-700">
                A single hidden issue can cost far more than the report. The
                full bundle also adds vehicle history and provenance checks.
              </p>
            </section>
          </div>
        </div>

        <section
          id="packages"
          className="mt-3 rounded-2xl border border-black bg-white p-3 shadow-sm sm:p-4"
        >
          <div className="mb-3">
            <div className="inline-flex items-center rounded-full border border-slate-300 bg-slate-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-700">
              Choose your report
            </div>
            <h2 className="mt-2 text-lg font-extrabold tracking-tight text-slate-950 sm:text-xl">
              Pick the level of checking you want
            </h2>
            <p className="mt-1.5 text-sm leading-5 text-slate-700">
              Start with the core report, or go straight to the full bundle with
              added vehicle history and provenance checks.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="text-sm font-semibold text-slate-950">
                Core report · {priceLabel}
              </div>
              <div className="mt-1.5 text-sm leading-5 text-slate-700">
                Service risk, detailed findings, seller questions, negotiation
                guidance, pricing context, MoT analysis and known model issues.
              </div>
              <div className="mt-3">
                <a
                  href={reportCheckoutUrl}
                  className="btn-primary block w-full text-center sm:inline-flex sm:w-auto"
                >
                  Buy core report · {priceLabel}
                </a>
              </div>
            </div>

            <div className="rounded-xl border border-red-200 bg-red-50/40 p-3">
              <div className="text-sm font-semibold text-slate-950">
                Complete report bundle · {reportPlusHpiPriceLabel}
              </div>
              <div className="mt-1.5 text-sm leading-5 text-slate-700">
                Everything in the core report, plus HPI-style history checks
                including finance markers, write-off records, stolen markers,
                mileage anomalies, keeper history and plate changes.
              </div>
              <div className="mt-3 flex flex-col gap-2.5">
                <a
                  href={reportPlusHpiCheckoutUrl}
                  className="btn-primary block w-full text-center sm:inline-flex sm:w-auto"
                >
                  Buy complete bundle · {reportPlusHpiPriceLabel}
                </a>
                <span className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700">
                  Or start with core report and add history later for{" "}
                  {hpiUpgradePriceLabel}
                </span>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-4 text-[11px] leading-5 text-slate-500">
          AutoAudit provides guidance only and is not a substitute for a
          mechanical inspection.
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-[9999] border-t border-slate-300 bg-white/95 px-3 py-2.5 pb-[calc(0.6rem+env(safe-area-inset-bottom))] backdrop-blur sm:px-4">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 text-sm">
            <div className="font-semibold leading-5 text-slate-950">
              Unlock core report · {priceLabel}
            </div>
            <div className="text-xs text-slate-600">
              See exact flagged items, MoT analysis and seller guidance
            </div>
          </div>

          <div className="flex w-full gap-2 sm:w-auto">
            <a
              href={reportCheckoutUrl}
              className="btn-primary block w-full text-center sm:w-auto"
            >
              Unlock report
            </a>
            <a
              href={reportPlusHpiCheckoutUrl}
              className="block w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-center text-sm font-semibold text-slate-800 transition hover:bg-slate-100 sm:w-auto"
            >
              Full bundle
            </a>
          </div>
        </div>
      </div>
    </>
  );
}