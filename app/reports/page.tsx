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

function isExpired(value?: string | null) {
  if (!value) return false;
  const t = new Date(value).getTime();
  if (Number.isNaN(t)) return false;
  return t < Date.now();
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

function getVehicleMeta(report: any) {
  const parts: string[] = [];

  if (typeof report?.registration === "string" && report.registration.trim()) {
    parts.push(report.registration.trim().toUpperCase());
  }

  if (typeof report?.make === "string" && report.make.trim()) {
    parts.push(report.make.trim());
  }

  if (typeof report?.car_year === "number") {
    parts.push(String(report.car_year));
  }

  return parts.join(" · ");
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

function getExpiryMeta(report: any) {
  const access = getAccessMeta(report);

  if (access.sortWeight < 2) {
    return {
      label: "Preview only",
      className: "border-slate-200 bg-slate-50 text-slate-600",
    };
  }

  if (isExpired(report?.expires_at)) {
    return {
      label: "Expired",
      className: "border-red-200 bg-red-50 text-red-700",
    };
  }

  if (report?.expires_at) {
    return {
      label: `Access until ${formatDate(report.expires_at)}`,
      className: "border-amber-200 bg-amber-50 text-amber-700",
    };
  }

  return {
    label: "Access active",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  };
}

function buildReportHref(report: any) {
  return `/report/${report.id}`;
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams?: { filter?: string };
}) {
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

  const activeFilter =
    searchParams?.filter === "paid" || searchParams?.filter === "bundle"
      ? searchParams.filter
      : "all";

  const filteredReports = safeReports.filter((report) => {
    const access = getAccessMeta(report);

    if (activeFilter === "paid") return access.sortWeight >= 2;
    if (activeFilter === "bundle") return access.sortWeight >= 3;
    return true;
  });

  return (
    <div className="mx-auto w-full max-w-6xl px-3 py-3 sm:px-4 sm:py-4 lg:px-5">
      <div className="relative overflow-hidden rounded-[1.4rem] border border-black bg-slate-950 shadow-[0_16px_48px_rgba(15,23,42,0.12)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(185,28,28,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_28%)]" />

        <div className="relative px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/85">
                My reports dashboard
              </div>

              <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                Pick up where you left off
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-5 text-slate-300">
                Reopen your saved AutoAudit checks and jump back into the reports you’ve already unlocked.
              </p>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
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

            <div className="grid grid-cols-3 gap-2 lg:min-w-[360px]">
              <Stat title="Saved" value={stats.total} subtitle="All reports" />
              <Stat title="Paid" value={stats.paid} subtitle="Core +" />
              <Stat title="Bundle" value={stats.hpi} subtitle="HPI added" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <FilterPill href="/reports" active={activeFilter === "all"}>
          All reports ({stats.total})
        </FilterPill>
        <FilterPill href="/reports?filter=paid" active={activeFilter === "paid"}>
          Paid ({stats.paid})
        </FilterPill>
        <FilterPill
          href="/reports?filter=bundle"
          active={activeFilter === "bundle"}
        >
          Bundle ({stats.hpi})
        </FilterPill>
      </div>

      <div className="mt-3">
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            We couldn’t load your saved reports right now. Please try again.
          </div>
        ) : filteredReports.length ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {filteredReports.map((report: any) => {
              const access = getAccessMeta(report);
              const expiryMeta = getExpiryMeta(report);
              const title = getReportTitle(report);
              const vehicleMeta = getVehicleMeta(report);

              return (
                <div
                  key={report.id}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md"
                >
                  <div className={`absolute inset-y-0 left-0 w-1 ${access.accentClass}`} />

                  <div className="pl-1">
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <div
                          className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${access.className}`}
                        >
                          {access.text}
                        </div>

                        <div
                          className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${expiryMeta.className}`}
                        >
                          {expiryMeta.label}
                        </div>
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-lg font-extrabold tracking-tight text-slate-950">
                          {title}
                        </h3>

                        <div className="mt-1 text-xs text-slate-500">
                          {vehicleMeta || "Vehicle details unavailable"}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        <MetaBox
                          label="Saved"
                          value={formatDate(report.saved_at ?? report.created_at)}
                        />
                        <MetaBox
                          label="Created"
                          value={formatDate(report.created_at)}
                        />
                        <MetaBox
                          label="Access"
                          value={access.shortText}
                        />
                      </div>

                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-xs leading-5 text-slate-600">
                          Open this report to continue where you left off.
                        </div>

                        <Link
                          href={buildReportHref(report)}
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
        ) : safeReports.length ? (
          <div className="rounded-[1.25rem] border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-extrabold tracking-tight text-slate-950">
              No reports match this filter
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-5 text-slate-700">
              Try a different filter, or start a new check to create another report.
            </p>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Link href="/reports" className="btn-outline w-full text-center sm:w-auto">
                Show all reports
              </Link>
              <Link href="/check" className="btn-primary w-full text-center sm:w-auto">
                Start a new check
              </Link>
            </div>
          </div>
        ) : (
          <div className="rounded-[1.25rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-xl font-extrabold tracking-tight text-slate-950">
              Your saved reports will appear here
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-5 text-slate-700">
              Once you unlock a paid AutoAudit report and link it to your account, you’ll be able to return to it here.
            </p>

            <div className="mt-4">
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

function Stat({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: number;
  subtitle: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/10 px-3 py-3 backdrop-blur">
      <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/70">
        {title}
      </div>
      <div className="mt-1 text-2xl font-extrabold tracking-tight text-white">
        {value}
      </div>
      <div className="mt-0.5 text-xs text-slate-300">{subtitle}</div>
    </div>
  );
}

function FilterPill({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
        active
          ? "border-black bg-slate-950 text-white"
          : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
      }`}
    >
      {children}
    </Link>
  );
}

function MetaBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-0.5 text-sm font-semibold text-slate-950">{value}</div>
    </div>
  );
}