import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { mustGetEnv } from "@/lib/env";
import { supabaseAdmin } from "@/lib/supabase";

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
    typeof report?.car_year === "number" ? report.car_year : null;

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
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/auth?mode=login&next=/reports");
  }

  const { data: reports, error } = await supabaseAdmin
    .from("reports")
    .select(
      `
        id,
        registration,
        make,
        car_year,
        created_at,
        saved_at,
        owner_user_id,
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
    .order("saved_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  const safeReports = Array.isArray(reports) ? reports : [];

  const stats = {
    total: safeReports.length,
    paid: safeReports.filter((report) => getAccessMeta(report).sortWeight >= 2)
      .length,
    hpi: safeReports.filter((report) => getAccessMeta(report).sortWeight >= 3)
      .length,
  };

  return (
    <div className="mx-auto w-full max-w-6xl">
      {/* Dashboard Header */}
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
                Reopen your saved AutoAudit checks and jump straight back into the reports you’ve already unlocked.
              </p>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link href="/check" className="btn-primary w-full text-center sm:w-auto">
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
              <Stat title="Reports saved" value={stats.total} subtitle="Linked to your account" />
              <Stat title="Paid reports" value={stats.paid} subtitle="Core or bundle access" />
              <Stat title="HPI unlocked" value={stats.hpi} subtitle="Full bundle reports" />
            </div>
          </div>
        </div>
      </div>

      {/* Reports */}
      <div className="mt-6">
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
            We couldn’t load your saved reports right now. Please try again.
          </div>
        ) : safeReports.length ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {safeReports.map((report: any) => {
              const access = getAccessMeta(report);

              return (
                <div
                  key={report.id}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className={`absolute inset-y-0 left-0 w-1 ${access.accentClass}`} />

                  <div className="pl-1">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${access.className}`}>
                          {access.text}
                        </div>

                        <h3 className="mt-4 text-xl font-extrabold tracking-tight text-slate-950">
                          {getReportTitle(report)}
                        </h3>

                        <div className="mt-2 text-sm text-slate-600">
                          Saved {formatDate(report.saved_at ?? report.created_at)}
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
        ) : (
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-950">
              Your saved reports will appear here
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-700 sm:text-base">
              Once you unlock a paid AutoAudit report and link it to your account, you’ll be able to return to it here.
            </p>

            <div className="mt-6">
              <Link href="/check" className="btn-primary">
                Run a vehicle check
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ title, value, subtitle }: any) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
      <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">
        {title}
      </div>
      <div className="mt-2 text-3xl font-extrabold tracking-tight text-white">
        {value}
      </div>
      <div className="mt-1 text-sm text-slate-300">
        {subtitle}
      </div>
    </div>
  );
}