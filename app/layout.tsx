import "./globals.css";
import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { mustGetEnv } from "@/lib/env";
import LogoutButton from "@/app/components/LogoutButton";

export const metadata = {
  title: "AutoAudit",
  description: "Don’t overpay for your next used car",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
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
  } = await supabase.auth.getUser();

  const userEmail =
    typeof user?.email === "string" && user.email.trim() ? user.email : null;

  const isLoggedIn = !!user?.id;

  return (
    <html lang="en">
      <body className="min-h-screen bg-[var(--aa-bg)] text-slate-900 antialiased">
        <header className="sticky top-0 z-50 border-b border-[var(--aa-silver)] bg-white/88 backdrop-blur-xl backdrop-saturate-150 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
          <div className="mx-auto w-full max-w-6xl px-3 sm:px-4">
            <div className="flex items-center justify-between gap-4 py-2.5 sm:py-3">
              <div className="flex min-w-0 shrink items-center gap-3">
                <Link href="/" className="group flex shrink-0 items-center">
                  <img
                    src="/logo-shield-red.png"
                    alt="AutoAudit"
                    className="block max-w-none select-none transition-transform duration-200 group-hover:scale-[1.02]"
                    style={{ height: 50, width: "auto" }}
                  />
                </Link>

                <div className="hidden h-8 w-px shrink-0 bg-[var(--aa-silver)] xl:block" />

                <div className="hidden min-w-0 xl:flex xl:flex-col">
                  <span className="text-sm font-semibold text-slate-950">
                    AutoAudit
                  </span>
                  <span className="text-xs text-slate-600">
                    Used car checks. Faster decisions.
                  </span>
                </div>
              </div>

              <nav className="hidden min-w-0 shrink-0 items-center gap-1 lg:flex xl:gap-1.5">
                <Link
                  href="/check"
                  className="whitespace-nowrap rounded-lg px-2.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-black xl:px-3"
                >
                  Check a car
                </Link>

                <Link
                  href="/how-it-works"
                  className="whitespace-nowrap rounded-lg px-2.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-black xl:px-3"
                >
                  How it works
                </Link>

                <Link
                  href="/#pricing"
                  className="whitespace-nowrap rounded-lg px-2.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-black xl:px-3"
                >
                  Pricing
                </Link>

                {isLoggedIn ? (
                  <>
                    <Link
                      href="/reports"
                      className="whitespace-nowrap rounded-lg px-2.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-black xl:px-3"
                    >
                      My reports
                    </Link>

                    <div className="inline-flex shrink-0 items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-800 shadow-sm xl:px-2.5">
                      Signed in
                    </div>

                    {userEmail ? (
                      <div className="hidden max-w-[180px] truncate rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-sm text-slate-600 2xl:block">
                        {userEmail}
                      </div>
                    ) : null}

                    <div className="shrink-0">
                      <LogoutButton />
                    </div>
                  </>
                ) : (
                  <Link
                    href="/auth?mode=login"
                    className="whitespace-nowrap rounded-lg px-2.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-black xl:px-3"
                  >
                    Log in
                  </Link>
                )}
              </nav>
            </div>

            <div className="pb-2.5 lg:hidden">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href="/check"
                  className="inline-flex items-center rounded-full border border-[var(--aa-silver)] bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm"
                >
                  Check a car
                </Link>

                <Link
                  href="/how-it-works"
                  className="inline-flex items-center rounded-full border border-[var(--aa-silver)] bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm"
                >
                  How it works
                </Link>

                <Link
                  href="/#pricing"
                  className="inline-flex items-center rounded-full border border-[var(--aa-silver)] bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm"
                >
                  Pricing
                </Link>

                {isLoggedIn ? (
                  <>
                    <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 shadow-sm">
                      Signed in
                    </span>

                    <Link
                      href="/reports"
                      className="inline-flex items-center rounded-full border border-[var(--aa-silver)] bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm"
                    >
                      My reports
                    </Link>

                    {userEmail ? (
                      <span className="max-w-[220px] truncate rounded-full border border-[var(--aa-silver)] bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                        {userEmail}
                      </span>
                    ) : null}

                    <LogoutButton />
                  </>
                ) : (
                  <Link
                    href="/auth?mode=login"
                    className="inline-flex items-center rounded-full border border-[var(--aa-silver)] bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm"
                  >
                    Log in
                  </Link>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-3 pb-12 pt-4 sm:px-4 sm:pb-14 sm:pt-5">
          {children}
        </main>
      </body>
    </html>
  );
}