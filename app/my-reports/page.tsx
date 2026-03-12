export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { mustGetEnv } from "@/lib/env";

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

export default async function MyReportsPage() {
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
    redirect("/auth?mode=login&next=/my-reports");
  }

  const { data: reports, error } = await supabase
    .from("reports")
    .select(
      "id, registration, make, car_year, mileage, fuel, transmission, created_at, expires_at, is_paid, owner_user_id"
    )
    .eq("owner_user_id", user.id)
    .eq("is_paid", true)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
          <div className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-red-700">
            My Reports
          </div>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950">
            We couldn&apos;t load your saved reports
          </h1>

          <p className="mt-3 text-sm text-slate-700">
            {error.message}
          </p>

          <div className="mt-5">
            <Link href="/" className="btn-outline">
              Back home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const activeReports =
    reports?.filter((report) => !isExpired(report.expires_at as string | null)) ?? [];

  const expiredReports =
    reports?.filter((report) => isExpired(report.expires_at as string | null)) ?? [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8 rounded-2xl border border-black bg-white px-5 py-5 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
        <div className="mb-2 inline-flex items-center rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-700">
          My Reports
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">
          Saved AutoAudit reports
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-700">
          These are the paid reports linked to your account. Saved reports remain
          available for up to 30 days from the payment date.
        </p>
      </div>

      <div className="mb-10">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-950">Active reports</h2>
            <p className="mt-1 text-sm text-slate-600">
              Reports you can still open now.
            </p>
          </div>

          <Link href="/check" className="btn-primary">
            Start a new check
          </Link>
        </div>

        {activeReports.length ? (
          <div className="grid gap-4">
            {activeReports.map((report: any) => {
              const reg = (report.registration as string | null) ?? null;
              const make = (report.make as string | null) ?? null;
              const year = (report.car_year as number | null) ?? null;
              const mileage = (report.mileage as number | null) ?? null;
              const fuel = (report.fuel as string | null) ?? null;
              const transmission = (report.transmission as string | null) ?? null;
              const createdAtLabel = formatDate(report.created_at as string | null);
              const expiresAtLabel = formatDate(report.expires_at as string | null);

              return (
                <div
                  key={report.id}
                  className="rounded-2xl border border-[var(--aa-silver)] bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">
                        Active
                      </div>

                      <h3 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-950">
                        {reg || "Saved report"}
                        {make ? (
                          <span className="ml-2 font-medium text-slate-500">
                            · {make}
                          </span>
                        ) : null}
                      </h3>

                      <div className="mt-2 text-sm text-slate-600">
                        {year ? `${year} · ` : ""}
                        {fuel ? `${fuel} · ` : ""}
                        {transmission ? `${transmission} · ` : ""}
                        {typeof mileage === "number"
                          ? `${mileage.toLocaleString()} miles`
                          : ""}
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        {createdAtLabel ? (
                          <span className="inline-flex items-center rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-slate-700">
                            Created: {createdAtLabel}
                          </span>
                        ) : null}

                        {expiresAtLabel ? (
                          <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-3 py-1 text-red-700">
                            Expires: {expiresAtLabel}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Link href={`/report/${report.id}`} className="btn-primary">
                        Open report
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-700 shadow-sm">
            You don&apos;t have any active saved reports yet.
          </div>
        )}
      </div>

      {expiredReports.length ? (
        <div>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-950">Expired reports</h2>
            <p className="mt-1 text-sm text-slate-600">
              These are no longer accessible and will need a fresh check if you want a new report.
            </p>
          </div>

          <div className="grid gap-4">
            {expiredReports.map((report: any) => {
              const reg = (report.registration as string | null) ?? null;
              const make = (report.make as string | null) ?? null;
              const year = (report.car_year as number | null) ?? null;
              const mileage = (report.mileage as number | null) ?? null;
              const expiresAtLabel = formatDate(report.expires_at as string | null);

              return (
                <div
                  key={report.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 opacity-80 shadow-sm"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="inline-flex items-center rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-600">
                        Expired
                      </div>

                      <h3 className="mt-3 text-xl font-bold tracking-tight text-slate-900">
                        {reg || "Saved report"}
                        {make ? (
                          <span className="ml-2 font-medium text-slate-500">
                            · {make}
                          </span>
                        ) : null}
                      </h3>

                      <div className="mt-2 text-sm text-slate-600">
                        {year ? `${year} · ` : ""}
                        {typeof mileage === "number"
                          ? `${mileage.toLocaleString()} miles`
                          : ""}
                      </div>

                      {expiresAtLabel ? (
                        <div className="mt-3 text-sm text-slate-600">
                          Expired on{" "}
                          <span className="font-semibold text-slate-800">
                            {expiresAtLabel}
                          </span>
                        </div>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Link href="/check" className="btn-outline">
                        Run new check
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}