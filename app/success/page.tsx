"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { trackEvent } from "@/lib/analytics";

export const dynamic = "force-dynamic";

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "";
}

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [loading, setLoading] = useState(true);
  const [reportId, setReportId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const verifyUrl = useMemo(() => {
    if (!sessionId) return null;

    const base = appUrl();

    return base
      ? `${base}/api/session-report?session_id=${encodeURIComponent(sessionId)}`
      : `/api/session-report?session_id=${encodeURIComponent(sessionId)}`;
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId || !verifyUrl) {
      setLoading(false);
      setError("Missing session_id");

      trackEvent("payment_success_missing_session", {
        page: "success",
      });

      return;
    }

    let cancelled = false;

    async function verifyPayment() {
      setLoading(true);
      setError(null);

      trackEvent("payment_success_page_viewed", {
        page: "success",
        session_present: true,
      });

      try {
        const res = await fetch(verifyUrl as string, { cache: "no-store" });
        const json = await res.json().catch(() => null);

        if (cancelled) return;

        if (!res.ok || !json?.report_id) {
          const message = json?.error ?? "Unknown error";

          setError(message);
          setReportId(null);

          trackEvent("payment_unlock_failed", {
            page: "success",
            error: message,
          });

          return;
        }

        setReportId(json.report_id);

        trackEvent("payment_unlock_succeeded", {
          page: "success",
          report_id_present: true,
        });
      } catch (err) {
        if (cancelled) return;

        const message =
          err instanceof Error
            ? err.message
            : "Unable to verify payment right now.";

        setError(message);
        setReportId(null);

        trackEvent("payment_unlock_failed", {
          page: "success",
          error: message,
        });
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    verifyPayment();

    return () => {
      cancelled = true;
    };
  }, [sessionId, verifyUrl]);

  function handleViewReportClick() {
    trackEvent("paid_report_view_clicked", {
      page: "success",
      report_id_present: !!reportId,
    });
  }

  if (!sessionId) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="text-2xl font-bold">Payment received</h1>
        <p className="mt-2 text-slate-700">
          We couldn’t verify your payment (missing session_id). Please contact support.
        </p>
        <div className="mt-6">
          <Link href="/" className="btn-outline">
            Back home
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="text-2xl font-bold">Verifying payment…</h1>
        <p className="mt-2 text-slate-700">
          We’re unlocking your report now.
        </p>
      </div>
    );
  }

  if (!reportId || error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="text-2xl font-bold">Payment received</h1>
        <p className="mt-2 text-slate-700">
          We received your payment, but couldn’t unlock the report automatically.
        </p>
        <div className="mt-4 rounded-xl border bg-slate-50 p-4 text-sm text-slate-700">
          <b>Error:</b> {error ?? "Unknown error"}
        </div>
        <div className="mt-6 flex gap-3">
          <Link href="/" className="btn-outline">
            Back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold">Unlocked ✅</h1>
      <p className="mt-2 text-slate-700">Your full report is ready.</p>
      <div className="mt-6">
        <Link
          href={`/report/${reportId}`}
          onClick={handleViewReportClick}
          className="btn-primary"
        >
          View full report
        </Link>
      </div>
    </div>
  );
}