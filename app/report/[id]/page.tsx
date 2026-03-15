export const dynamic = "force-dynamic";

import Link from "next/link";
import Stripe from "stripe";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabaseAdmin } from "@/lib/supabase";
import { mustGetEnv } from "@/lib/env";
import { buildUkvdHpiSummary, fetchUkvdHpiByVrm } from "@/lib/hpi";
import ExposureBar from "@/app/components/ExposureBar";
import ReportClient from "./ReportClient";

const stripe = new Stripe(mustGetEnv("STRIPE_SECRET_KEY"), {
  apiVersion: "2024-06-20",
});

type CheckoutTier = "report" | "hpi_upgrade";

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

function isExpired(value?: string | null) {
  if (!value) return false;
  const t = new Date(value).getTime();
  if (Number.isNaN(t)) return false;
  return t < Date.now();
}

function parseCheckoutTier(value?: string | null): CheckoutTier {
  return value === "hpi_upgrade" ? "hpi_upgrade" : "report";
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

        if (sessionCheckoutTier === "hpi_upgrade") {
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

  if (isPaid && ownerUserId && ownerUserId !== user?.id && !paymentJustVerified) {
    const loginReturnUrl = encodeURIComponent(`/report/${data.id}`);
    const loginUrl = `/auth?mode=login&next=${loginReturnUrl}`;

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

  const reportCheckoutUrl = `/api/checkout?report_id=${data.id}&tier=report`;
  const hpiUpgradeCheckoutUrl = `/api/checkout?report_id=${data.id}&tier=hpi_upgrade`;
  const priceLabel = "£4.99";
  const hpiUpgradePriceLabel = "£5";

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
  const justUnlockedHpi = justUnlockedTier === "hpi_upgrade";

  const motPayload: any = data.mot_payload ?? null;

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

  const reportUrl = `/report/${data.id}`;
  const previewUrl = `/preview/${data.id}`;
  const authReturnUrl = encodeURIComponent(reportUrl);
  const claimReportId = encodeURIComponent(data.id);
  const registerUrl = `/auth?mode=signup&next=${authReturnUrl}&claim_report=${claimReportId}`;
  const loginUrl = `/auth?mode=login&next=${authReturnUrl}&claim_report=${claimReportId}`;

  if (isPaid) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-6">
        <div className="hidden print:block mb-6 border-b border-slate-300 pb-3">
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

        <div className="mb-6 rounded-2xl border border-black bg-white px-5 py-4 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
          <div className="mb-2 inline-flex items-center rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-red-700">
            AutoAudit report
          </div>

          {reg ? (
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">
              {reg}
              {make ? (
                <span className="ml-2 font-medium text-slate-500">
                  · {make}
                </span>
              ) : null}
            </h1>
          ) : (
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">
              AutoAudit Report
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
        </div>

        {(justUnlockedReport || justUnlockedHpi) ? (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="text-sm font-semibold text-emerald-900">
              {justUnlockedHpi
                ? "HPI upgrade unlocked"
                : "Tier 1 report unlocked"}
            </div>
            <div className="mt-1 text-sm text-emerald-900/80">
              {justUnlockedHpi
                ? "Your HPI panel is now included in this report."
                : "You now have service risk, detailed findings and MoT analysis."}
            </div>
          </div>
        ) : null}

        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50/50 p-4">
          <div className="text-sm font-semibold text-slate-950">
            Save access to this report
          </div>

          <div className="mt-1 text-sm text-slate-700">
            Create an account after purchase to keep access to this report for
            30 days
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
            If you do not register or download your report, you may not be able
            to access it again after that 30-day period has ended.
          </div>

          {!ownerUserId ? (
            <div className="mt-4 flex flex-wrap gap-3 print:hidden">
              <Link href={registerUrl} className="btn-primary">
                Create account to save report
              </Link>

              <Link href={loginUrl} className="btn-outline">
                Log in to save report
              </Link>
            </div>
          ) : user?.id === ownerUserId ? (
            <div className="mt-4 inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-800 print:hidden">
              This report is linked to your account
            </div>
          ) : null}
        </div>

        {!hpiUnlocked ? (
          <div className="mb-6 rounded-2xl border border-black bg-white p-5 shadow-sm print:hidden">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="inline-flex items-center rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-700">
                  Optional upgrade
                </div>

                <h2 className="mt-3 text-xl font-extrabold tracking-tight text-slate-950">
                  Add HPI history check · {hpiUpgradePriceLabel}
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-700">
                  Upgrade this report to include HPI-style history data such as
                  finance markers, insurance write-off records, stolen markers,
                  mileage anomalies, keeper history and plate changes.
                </p>
              </div>

              <div className="flex-shrink-0">
                <a href={hpiUpgradeCheckoutUrl} className="btn-primary">
                  Upgrade with HPI · {hpiUpgradePriceLabel}
                </a>
              </div>
            </div>
          </div>
        ) : null}

        <ReportClient
          summary={fullSummary}
          items={fullItems}
          negotiationSuggested={negotiationSuggested}
          justUnlocked={justUnlockedReport}
          reportUrl={reportUrl}
          previewUrl={previewUrl}
          motPayload={motPayload}
          hpiPayload={hpiPayload}
          hpiSummary={hpiSummary}
          hpiStatus={hpiStatus}
          hpiUnlocked={hpiUnlocked}
          hpiUpgradeUrl={hpiUpgradeCheckoutUrl}
          hpiUpgradePriceLabel={hpiUpgradePriceLabel}
          expiresAt={expiresAt}
          expiresAtLabel={expiresAtLabel}
        />
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto w-full max-w-3xl px-4 pt-2 pb-28">
        <div className="mb-4 rounded-2xl border border-black bg-white px-5 py-4 shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
          <div className="mb-2 inline-flex items-center rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-700">
            AutoAudit snapshot
          </div>

          {reg ? (
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">
              {reg}
              {make ? (
                <span className="ml-2 font-medium text-slate-500">
                  · {make}
                </span>
              ) : null}
            </h1>
          ) : (
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">
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
        </div>

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
            {confidence ? (
              <span className="inline-flex items-center rounded-full border border-slate-300 bg-white px-3 py-1 text-sm">
                <span className="font-semibold">Confidence:</span>
                <span className="ml-2">
                  {confidence.label ?? "—"} ({confidence.score ?? "—"}/100)
                </span>
              </span>
            ) : null}

            <span className="inline-flex items-center rounded-full border border-slate-300 bg-white px-3 py-1 text-sm text-slate-600">
              Best with service history + latest MoT
            </span>
          </div>
        </div>

        <div className="mt-5">
          <h2 className="text-lg font-semibold text-slate-950">
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

        <div className="mt-5 rounded-xl border border-red-200 bg-white p-4">
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

          <div className="mt-4 grid gap-1 text-sm text-slate-700">
            <div>✔ Itemised repair costs</div>
            <div>✔ Seller questions and red flags</div>
            <div>✔ Negotiation strategy</div>
            <div>✔ MoT advisory analysis</div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-black bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-950">
                Tier 1 report · {priceLabel}
              </div>
              <div className="mt-2 text-sm text-slate-700">
                Service risk, detailed findings, seller questions, negotiation
                guidance and MoT analysis.
              </div>
              <div className="mt-4">
                <a href={reportCheckoutUrl} className="btn-primary">
                  Unlock Tier 1 · {priceLabel}
                </a>
              </div>
            </div>

            <div className="rounded-xl border border-red-200 bg-red-50/40 p-4">
              <div className="text-sm font-semibold text-slate-950">
                Tier 2 bundle · £9.99 total
              </div>
              <div className="mt-2 text-sm text-slate-700">
                Everything in Tier 1, plus HPI-style history checks including
                finance markers, write-off records, stolen markers and mileage
                anomalies.
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <a href={reportCheckoutUrl} className="btn-outline">
                  Start with Tier 1
                </a>
                <span className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700">
                  Add HPI later for {hpiUpgradePriceLabel}
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

      <div className="fixed bottom-0 left-0 right-0 z-[9999] border-t border-slate-300 bg-white/95 backdrop-blur px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3">
          <div className="text-sm">
            <div className="font-semibold text-slate-950">
              Unlock Tier 1 report · {priceLabel}
            </div>
            <div className="text-xs text-slate-600">
              Service risk, MoT analysis and full report findings
            </div>
          </div>

          <a href={reportCheckoutUrl} className="btn-primary">
            Unlock report
          </a>
        </div>
      </div>
    </>
  );
}