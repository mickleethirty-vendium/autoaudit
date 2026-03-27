import Stripe from "stripe";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { mustGetEnv } from "@/lib/env";
import { supabaseAdmin } from "@/lib/supabase";
import { matchKnownModelIssues } from "@/lib/commonFailures";
import {
  fetchUkvdValuationByVrm,
  buildUkvdValuationSummary,
  buildUkvdVehicleEnrichment,
  buildUkvdMarketValue,
} from "@/lib/ukvdValuation";

export const runtime = "nodejs";

const stripe = new Stripe(mustGetEnv("STRIPE_SECRET_KEY"), {
  apiVersion: "2024-06-20",
});

type CheckoutTier = "report" | "hpi_upgrade" | "report_plus_hpi";

function thirtyDaysFrom(date: Date) {
  return new Date(date.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
}

function parseCheckoutTier(value: string | undefined): CheckoutTier {
  if (value === "hpi_upgrade") return "hpi_upgrade";
  if (value === "report_plus_hpi") return "report_plus_hpi";
  return "report";
}

function isValidIsoDate(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(new Date(value).getTime());
}

function isLikelyValidReportId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.trim().length >= 6 &&
    /^[a-zA-Z0-9_-]+$/.test(value.trim())
  );
}

function isPlainObject(value: unknown): value is Record<string, any> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function mergeObjects<T extends Record<string, any>>(
  base: T | null | undefined,
  patch: Record<string, any>
): T {
  return {
    ...((isPlainObject(base) ? base : {}) as T),
    ...patch,
  };
}

function shouldUnlockHpi(tier: CheckoutTier) {
  return tier === "hpi_upgrade" || tier === "report_plus_hpi";
}

function shouldUnlockPaidReport(tier: CheckoutTier) {
  return (
    tier === "report" || tier === "hpi_upgrade" || tier === "report_plus_hpi"
  );
}

function parseNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function parseString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function firstObject(...values: unknown[]) {
  for (const value of values) {
    if (isPlainObject(value)) return value;
  }
  return null;
}

function firstString(...values: unknown[]) {
  for (const value of values) {
    const parsed = parseString(value);
    if (parsed) return parsed;
  }
  return null;
}

function firstNumber(...values: unknown[]) {
  for (const value of values) {
    const parsed = parseNumber(value);
    if (parsed !== null) return parsed;
  }
  return null;
}

function normalizeFuel(value: unknown) {
  const raw = parseString(value)?.toLowerCase();
  if (!raw) return null;

  if (raw.includes("petrol")) return "petrol";
  if (raw.includes("diesel")) return "diesel";
  if (raw.includes("hybrid")) return "hybrid";
  if (raw.includes("electric") || raw === "ev") return "ev";

  return raw;
}

function normalizeTransmission(value: unknown) {
  const raw = parseString(value)?.toLowerCase();
  if (!raw) return null;

  if (raw.includes("manual")) return "manual";
  if (raw.includes("cvt")) return "cvt";
  if (
    raw.includes("dct") ||
    raw.includes("dsg") ||
    raw.includes("dual clutch") ||
    raw.includes("dual-clutch")
  ) {
    return "dct";
  }
  if (
    raw.includes("automatic") ||
    raw.includes("auto") ||
    raw.includes("semi-auto") ||
    raw.includes("semi automatic")
  ) {
    return "automatic";
  }

  return raw;
}

function getPreviewSummary(previewPayload: any) {
  return isPlainObject(previewPayload?.summary) ? previewPayload.summary : {};
}

function getFullSummary(fullPayload: any) {
  return isPlainObject(fullPayload?.summary) ? fullPayload.summary : {};
}

function getExistingVehicleIdentity(previewPayload: any, fullPayload: any) {
  return (
    firstObject(
      fullPayload?.vehicle_identity,
      fullPayload?.summary?.vehicle_identity,
      previewPayload?.vehicle_identity,
      previewPayload?.summary?.vehicle_identity
    ) ?? null
  );
}

function getExistingKnownModelIssues(fullPayload: any) {
  if (Array.isArray(fullPayload?.known_model_issues)) {
    return fullPayload.known_model_issues;
  }
  if (Array.isArray(fullPayload?.summary?.known_model_issues)) {
    return fullPayload.summary.known_model_issues;
  }
  return [];
}

function buildBaseMatcherIdentity(existingReport: any) {
  const previewPayload = isPlainObject(existingReport.preview_payload)
    ? existingReport.preview_payload
    : {};
  const fullPayload = isPlainObject(existingReport.full_payload)
    ? existingReport.full_payload
    : {};
  const previewSummary = getPreviewSummary(previewPayload);
  const fullSummary = getFullSummary(fullPayload);
  const existingVehicleIdentity = getExistingVehicleIdentity(
    previewPayload,
    fullPayload
  );

  return {
    registration: parseString(existingReport.registration),
    make: firstString(
      existingVehicleIdentity?.make,
      fullPayload?.make,
      previewPayload?.make,
      existingReport.make
    ),
    model: firstString(
      existingVehicleIdentity?.model,
      fullPayload?.model,
      previewPayload?.model,
      fullSummary?.model,
      previewSummary?.model
    ),
    derivative: firstString(
      existingVehicleIdentity?.derivative,
      fullPayload?.derivative,
      previewPayload?.derivative
    ),
    generation: firstString(
      existingVehicleIdentity?.generation,
      fullPayload?.generation,
      previewPayload?.generation
    ),
    engine: firstString(
      existingVehicleIdentity?.engine,
      fullPayload?.engine,
      previewPayload?.engine
    ),
    engine_family: firstString(
      existingVehicleIdentity?.engine_family,
      fullPayload?.engine_family,
      previewPayload?.engine_family
    ),
    engine_code: firstString(
      existingVehicleIdentity?.engine_code,
      fullPayload?.engine_code,
      previewPayload?.engine_code
    ),
    engine_size: firstString(
      existingVehicleIdentity?.engine_size,
      fullPayload?.engine_size,
      previewPayload?.engine_size
    ),
    power: firstString(
      existingVehicleIdentity?.power,
      fullPayload?.power,
      previewPayload?.power
    ),
    fuel: normalizeFuel(
      firstString(
        existingVehicleIdentity?.fuel,
        fullPayload?.fuel,
        previewPayload?.fuel,
        existingReport.fuel
      )
    ),
    transmission: normalizeTransmission(
      firstString(
        existingVehicleIdentity?.transmission,
        fullPayload?.transmission,
        previewPayload?.transmission,
        existingReport.transmission
      )
    ),
    year: firstNumber(
      existingVehicleIdentity?.year,
      fullPayload?.year,
      previewPayload?.year,
      existingReport.car_year
    ),
    mileage: firstNumber(
      existingVehicleIdentity?.mileage,
      fullPayload?.mileage,
      previewPayload?.mileage,
      existingReport.mileage
    ),
  };
}

function buildEnrichedMatcherIdentity(baseIdentity: Record<string, any>, enrichment: any) {
  return {
    ...baseIdentity,
    make: firstString(enrichment?.make, baseIdentity.make),
    model: firstString(enrichment?.model, baseIdentity.model),
    derivative: firstString(enrichment?.derivative, baseIdentity.derivative),
    generation: firstString(enrichment?.generation, baseIdentity.generation),
    engine: firstString(enrichment?.engine, baseIdentity.engine),
    engine_family: firstString(
      enrichment?.engine_family,
      baseIdentity.engine_family
    ),
    engine_code: firstString(enrichment?.engine_code, baseIdentity.engine_code),
    engine_size: firstString(enrichment?.engine_size, baseIdentity.engine_size),
    power: firstString(enrichment?.power, baseIdentity.power),
    fuel: normalizeFuel(enrichment?.fuel) ?? baseIdentity.fuel ?? null,
    transmission:
      normalizeTransmission(enrichment?.transmission) ??
      baseIdentity.transmission ??
      null,
    year: firstNumber(enrichment?.year, baseIdentity.year),
    mileage: firstNumber(baseIdentity.mileage),
  };
}

export async function POST(req: Request) {
  const body = await req.text();

  const sig = (await headers()).get("stripe-signature");
  if (!sig) {
    console.error("Stripe webhook missing signature header");
    return NextResponse.json(
      { error: "Missing Stripe signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      mustGetEnv("STRIPE_WEBHOOK_SECRET")
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed", err?.message);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${err.message}` },
      { status: 400 }
    );
  }

  try {
    if (event.type !== "checkout.session.completed") {
      return NextResponse.json({ received: true, ignored: true });
    }

    const session = event.data.object as Stripe.Checkout.Session;
    const reportId = session.metadata?.report_id;
    const checkoutTier = parseCheckoutTier(session.metadata?.checkout_tier);

    if (!isLikelyValidReportId(reportId)) {
      console.error("Invalid or missing report_id in metadata", {
        reportId,
        metadata: session.metadata,
      });
      return NextResponse.json(
        { error: "Missing or invalid report_id in session metadata" },
        { status: 400 }
      );
    }

    const isSessionPaid =
      session.payment_status === "paid" || session.status === "complete";

    if (!isSessionPaid) {
      return NextResponse.json({
        received: true,
        unlocked: false,
        reason:
          "Session completed event received but payment not marked paid",
      });
    }

    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : null;

    const { data: existingReport, error: existingReportError } =
      await supabaseAdmin
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
            asking_price,
            is_paid,
            paid_at,
            expires_at,
            hpi_unlocked,
            hpi_paid_at,
            stripe_session_id,
            stripe_payment_intent_id,
            hpi_stripe_session_id,
            hpi_stripe_payment_intent_id,
            preview_payload,
            full_payload
          `
        )
        .eq("id", reportId)
        .maybeSingle();

    if (existingReportError) {
      return NextResponse.json(
        {
          error: `Failed to load existing report: ${existingReportError.message}`,
        },
        { status: 500 }
      );
    }

    if (!existingReport) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const nowIso = new Date().toISOString();

    const existingPaidAt = isValidIsoDate(existingReport.paid_at)
      ? existingReport.paid_at
      : null;

    const existingExpiresAt = isValidIsoDate(existingReport.expires_at)
      ? existingReport.expires_at
      : null;

    const existingHpiPaidAt = isValidIsoDate(existingReport.hpi_paid_at)
      ? existingReport.hpi_paid_at
      : null;

    const reportPaidAt = existingPaidAt ?? nowIso;
    const reportExpiresAt =
      existingExpiresAt ?? thirtyDaysFrom(new Date(reportPaidAt));

    const previewPayload = isPlainObject(existingReport.preview_payload)
      ? existingReport.preview_payload
      : {};

    const fullPayload = isPlainObject(existingReport.full_payload)
      ? existingReport.full_payload
      : {};

    const existingUkvd = isPlainObject(fullPayload.ukvd) ? fullPayload.ukvd : {};

    const unlockReport = shouldUnlockPaidReport(checkoutTier);
    const unlockHpi = shouldUnlockHpi(checkoutTier);

    const updatePayload: Record<string, any> = {
      is_paid: unlockReport ? true : existingReport.is_paid === true,
      paid_at: unlockReport ? reportPaidAt : existingReport.paid_at,
      expires_at: unlockReport ? reportExpiresAt : existingReport.expires_at,
    };

    if (checkoutTier === "report") {
      updatePayload.stripe_session_id =
        existingReport.stripe_session_id ?? session.id;
      updatePayload.stripe_payment_intent_id =
        existingReport.stripe_payment_intent_id ?? paymentIntentId;
    }

    if (checkoutTier === "hpi_upgrade") {
      updatePayload.hpi_unlocked = true;
      updatePayload.hpi_paid_at = existingHpiPaidAt ?? nowIso;
      updatePayload.hpi_stripe_session_id =
        existingReport.hpi_stripe_session_id ?? session.id;
      updatePayload.hpi_stripe_payment_intent_id =
        existingReport.hpi_stripe_payment_intent_id ?? paymentIntentId;
    }

    if (checkoutTier === "report_plus_hpi") {
      updatePayload.stripe_session_id =
        existingReport.stripe_session_id ?? session.id;
      updatePayload.stripe_payment_intent_id =
        existingReport.stripe_payment_intent_id ?? paymentIntentId;
      updatePayload.hpi_unlocked = true;
      updatePayload.hpi_paid_at = existingHpiPaidAt ?? nowIso;
      updatePayload.hpi_stripe_session_id =
        existingReport.hpi_stripe_session_id ?? session.id;
      updatePayload.hpi_stripe_payment_intent_id =
        existingReport.hpi_stripe_payment_intent_id ?? paymentIntentId;
    }

    let nextFullPayload: Record<string, any> = {
      ...fullPayload,
      paid_unlocked_at: unlockReport
        ? reportPaidAt
        : fullPayload.paid_unlocked_at ?? null,
      hpi_unlocked_at: unlockHpi
        ? existingHpiPaidAt ?? nowIso
        : fullPayload.hpi_unlocked_at ?? null,
      payment: {
        checkout_tier: checkoutTier,
        stripe_session_id: session.id,
        stripe_payment_intent_id: paymentIntentId,
        unlocked_report: unlockReport,
        unlocked_hpi: unlockHpi,
        unlocked_at: nowIso,
      },
    };

    let ukvdPatch: Record<string, any> = {
      enrichment_applied: false,
      enrichment_requested: unlockReport,
      enrichment_status: unlockReport
        ? existingUkvd.enrichment_applied === true
          ? "success"
          : "pending"
        : existingUkvd.enrichment_status ?? "not_requested",
      enrichment_requested_at: unlockReport
        ? existingUkvd.enrichment_requested_at ?? nowIso
        : existingUkvd.enrichment_requested_at ?? null,
      valuation: existingUkvd.valuation ?? null,
      enrichment: existingUkvd.enrichment ?? null,
      hpi: unlockHpi
        ? mergeObjects(existingUkvd.hpi, {
            unlocked: true,
            unlocked_at:
              existingUkvd?.hpi?.unlocked_at ?? existingHpiPaidAt ?? nowIso,
          })
        : existingUkvd.hpi ?? null,
    };

    if (unlockReport && parseString(existingReport.registration)) {
      try {
        const baseMatcherIdentity = buildBaseMatcherIdentity(existingReport);

        const rawUkvd = await fetchUkvdValuationByVrm(
          existingReport.registration,
          firstNumber(existingReport.mileage)
        );

        const valuationSummary = buildUkvdValuationSummary(rawUkvd);
        const vehicleEnrichment = buildUkvdVehicleEnrichment(rawUkvd);
        const marketValue = buildUkvdMarketValue({
          valuation: valuationSummary,
          askingPrice: firstNumber(existingReport.asking_price),
        });

        const enrichedMatcherIdentity = buildEnrichedMatcherIdentity(
          baseMatcherIdentity,
          vehicleEnrichment
        );

        const matchedCommonFailures = await matchKnownModelIssues(
          enrichedMatcherIdentity
        );

        const enrichedVehicleIdentity = mergeObjects(
          firstObject(
            nextFullPayload.vehicle_identity_enriched,
            matchedCommonFailures?.vehicleIdentity,
            vehicleEnrichment,
            baseMatcherIdentity
          ) ?? {},
          enrichedMatcherIdentity
        );

        const knownModelIssues =
          matchedCommonFailures?.knownModelIssues ??
          getExistingKnownModelIssues(fullPayload);

        nextFullPayload = {
          ...nextFullPayload,
          vehicle_identity:
            firstObject(
              nextFullPayload.vehicle_identity,
              getExistingVehicleIdentity(previewPayload, fullPayload),
              baseMatcherIdentity
            ) ?? baseMatcherIdentity,
          vehicle_identity_enriched: enrichedVehicleIdentity,
          known_model_issues: knownModelIssues,
          valuation: marketValue,
        };

        nextFullPayload.summary = {
          ...(isPlainObject(nextFullPayload.summary) ? nextFullPayload.summary : {}),
          market_value: marketValue,
        };

        ukvdPatch = {
          ...ukvdPatch,
          enrichment_applied: true,
          enrichment_status: "success",
          enrichment_completed_at: nowIso,
          valuation: valuationSummary,
          enrichment: vehicleEnrichment,
          raw: rawUkvd,
        };
      } catch (error: any) {
        console.error("UKVD paid enrichment failed", {
          reportId,
          error: error?.message ?? error,
        });

        ukvdPatch = {
          ...ukvdPatch,
          enrichment_applied: false,
          enrichment_status: "error",
          enrichment_completed_at: nowIso,
          error: error?.message ?? "UKVD enrichment failed",
        };
      }
    }

    nextFullPayload.ukvd = mergeObjects(existingUkvd, ukvdPatch);

    updatePayload.full_payload = nextFullPayload;

    updatePayload.preview_payload = {
      ...previewPayload,
      payment: {
        checkout_tier: checkoutTier,
        unlocked_report: unlockReport,
        unlocked_hpi: unlockHpi,
        unlocked_at: nowIso,
      },
    };

    const { data, error } = await supabaseAdmin
      .from("reports")
      .update(updatePayload)
      .eq("id", reportId)
      .select(
        `
          id,
          is_paid,
          paid_at,
          expires_at,
          hpi_unlocked,
          hpi_paid_at,
          full_payload
        `
      )
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Supabase update failed: ${error.message}` },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Supabase update returned no data (report not found?)" },
        { status: 500 }
      );
    }

    console.log("Stripe webhook processed", {
      reportId: data.id,
      checkoutTier,
      unlockReport,
      unlockHpi,
      ukvdEnrichmentStatus:
        isPlainObject(data.full_payload) && isPlainObject(data.full_payload.ukvd)
          ? data.full_payload.ukvd.enrichment_status ?? null
          : null,
    });

    return NextResponse.json({
      received: true,
      unlocked: true,
      checkout_tier: checkoutTier,
      report_id: data.id,
      is_paid: data.is_paid,
      paid_at: data.paid_at,
      expires_at: data.expires_at,
      hpi_unlocked: data.hpi_unlocked ?? false,
      hpi_paid_at: data.hpi_paid_at ?? null,
      ukvd_enrichment_status:
        isPlainObject(data.full_payload) && isPlainObject(data.full_payload.ukvd)
          ? data.full_payload.ukvd.enrichment_status ?? null
          : null,
    });
  } catch (err: any) {
    console.error("Webhook handler error", err);
    return NextResponse.json(
      { error: `Webhook handler error: ${err.message}` },
      { status: 500 }
    );
  }
}