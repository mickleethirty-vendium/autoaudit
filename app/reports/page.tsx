import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { mustGetEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";

  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getReportTitle(report: any) {
  const reg =
    typeof report?.registration === "string" && report.registration.trim()
      ? report.registration.trim().toUpperCase()
      : "Unknown registration";

  const make =
    typeof report?.make === "string" && report.make.trim()
      ? report.make.trim()
      : null;

  const year =
    typeof report?.car_year === "number"
      ? report.car_year
      : typeof report?.year === "number"
        ? report.year
        : null;

  if (make && year) return `${reg} · ${make} · ${year}`;
  if (make) return `${reg} · ${make}`;
  if (year) return `${reg} · ${year}`;
  return reg;
}

function getAccessMeta(report: any) {
  const hasCore =
    report?.is_paid === true ||
    !!report?.paid_at ||
    !!report?.stripe_session_id;

  const hasHpi =
    report?.hpi_unlocked === true ||
    !!report?.hpi_paid_at ||
    !!report?.hpi_stripe_session_id;

  if (hasCore && hasHpi) {
    return {
      text: "Full bundle",
      shortText: "Bundle",
      className: "border-red-200 bg-red-50 text-red-700",
      accentClass: "bg-red-500",
      sortWeight: 3,
    };
  }

  if (hasCore) {
    return {
      text: "Paid report",
      shortText: "Paid",
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
      accentClass: "bg-emerald-500",
      sortWeight: 2,
    };
  }

  return {
    text: "Snapshot",
    shortText: "Snapshot",
    className: "border-slate-200 bg-slate-50 text-slate-700",
    accentClass: "bg-slate-400",
    sortWeight: 1,
  };
}

export default async function ReportsPage() {
  const cookieStore = cookies();

  const supabase = createServerClient(
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
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth?mode=login&next=/reports");
  }

  const { data: reports, error } = await supabase
    .from("reports")
    .select(
      `
        id,
        registration,
        make,
        car_year,
        year,
        created_at,
        is_paid,
        paid_at,
        stripe_session_id,
        hpi_unlocked,
        hpi_paid_at,
        hpi_stripe_session_id,
        expires_at
      `
    )
    .eq("owner_user_id", user.id)
    .order("created_at", { ascending: false });

  const safeReports = Array.isArray(reports) ? reports : [];

  const stats = {
    total: safeReports.length,
    paid: safeReports.filter((report) => {
      const access = getAccessMeta(report);
      return access.sortWeight >= 2;
    }).length,
    hpi: safeReports.filter((report) => {
      const access = getAccessMeta(report);
      return access.sortWeight >= 3;
    }).length,
  };

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="relative overflow-hidden rounded-[1.75rem] border border-black bg-slate-950 shadow-[0_18px_60px_rgba(15,23,42,0.14)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(185,28,28,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_28%)]" />

        <div className="relative px-5 py-6 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white/85">
                My reports dashboard
              </div>

              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Pick up where you left off
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                Reopen your saved AutoAudit checks, compare recent vehicles and
                jump straight back into the reports you’ve already unlocked.
              </p>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href="/check"
                  className="btn-primary w-full text-center sm:w-auto"
                >
                  Start a new check
                </Link>
                <Link
                  href="/"
                  className="w-full rounded-lg border border-white/15 bg-white/10 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/15 sm:w-auto"
                >
                  Back home
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:min-w-[420px]">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">
                  Reports saved
                </div>
                <div className="mt-2 text-3xl font-extrabold tracking-tight text-white">
                  {stats.total}
                </div>
                <div className="mt-1 text-sm text-slate-300">
                  Linked to your account
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">
                  Paid reports
                </div>
                <div className="mt-2 text-3xl font-extrabold tracking-tight text-white">
                  {stats.paid}
                </div>
                <div className="mt-1 text-sm text-slate-300">
                  Core or bundle access
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">
                  HPI unlocked
                </div>
                <div className="mt-2 text-3xl font-extrabold tracking-tight text-white">
                  {stats.hpi}
                </div>
                <div className="mt-1 text-sm text-slate-300">
                  Full bundle reports
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
            We couldn’t load your saved reports right now. Please try again.
          </div>
        ) : safeReports.length ? (
          <>
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  Saved checks
                </div>
                <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950">
                  Your recent reports
                </h2>
              </div>

              <div className="text-sm text-slate-600">
                {safeReports.length} saved report
                {safeReports.length === 1 ? "" : "s"}
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {safeReports.map((report: any) => {
                const access = getAccessMeta(report);

                return (
                  <div
                    key={report.id}
                    className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_14px_30px_rgba(15,23,42,0.08)]"
                  >
                    <div
                      className={`absolute inset-y-0 left-0 w-1 ${access.accentClass}`}
                    />

                    <div className="pl-1">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <div
                              className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${access.className}`}
                            >
                              {access.text}
                            </div>

                            {report?.expires_at ? (
                              <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                                Access until {formatDate(report.expires_at)}
                              </div>
                            ) : null}
                          </div>

                          <h3 className="mt-4 text-xl font-extrabold tracking-tight text-slate-950">
                            {getReportTitle(report)}
                          </h3>

                          <div className="mt-3 grid gap-3 sm:grid-cols-2">
                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                Created
                              </div>
                              <div className="mt-1 text-sm font-semibold text-slate-950">
                                {formatDate(report.created_at)}
                              </div>
                            </div>

                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                Access level
                              </div>
                              <div className="mt-1 text-sm font-semibold text-slate-950">
                                {access.shortText}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="sm:shrink-0">
                          <Link
                            href={`/report/${report.id}`}
                            className="btn-primary block w-full text-center sm:w-auto"
                          >
                            Open report
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="inline-flex items-center rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-700">
              Nothing saved yet
            </div>

            <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-950">
              Your saved reports will appear here
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-700 sm:text-base">
              Once you unlock a paid AutoAudit report and link it to your
              account, you’ll be able to return to it from this dashboard.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/check"
                className="btn-primary w-full text-center sm:w-auto"
              >
                Run a vehicle check
              </Link>
              <Link
                href="/how-it-works"
                className="btn-outline w-full text-center sm:w-auto"
              >
                See how AutoAudit works
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}