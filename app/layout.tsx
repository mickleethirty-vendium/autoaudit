import "./globals.css";
import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { mustGetEnv } from "@/lib/env";
import LogoutButton from "@/app/components/LogoutButton";
import DailyReportCountPill from "@/app/components/DailyReportCountPill";
import MobileMenu from "@/app/components/MobileMenu";

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

  return (
    <html lang="en-GB">
      <body className="min-h-screen bg-white text-slate-900">
        <div className="flex min-h-screen flex-col">
          <header className="relative z-50 border-b border-slate-200 bg-white">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
              <div className="flex min-w-0 items-center gap-3">
                <Link href="/" className="flex shrink-0 items-center">
                  <Image
                    src="/logo-shield-red.png"
                    alt="AutoAudit"
                    width={120}
                    height={150}
                    priority
                    className="h-[64px] w-auto"
                  />
                </Link>

                <div className="hidden sm:block">
                  <DailyReportCountPill />
                </div>
              </div>

              <nav className="hidden items-center gap-4 sm:flex">
                <Link
                  href="/cars"
                  className="text-sm text-slate-600 hover:text-slate-900"
                >
                  Cars
                </Link>

                <Link
                  href="/mot-advisories"
                  className="text-sm text-slate-600 hover:text-slate-900"
                >
                  MOT Advisories
                </Link>

                <Link
                  href="/terms"
                  className="text-sm text-slate-600 hover:text-slate-900"
                >
                  Terms
                </Link>

                <Link
                  href="/privacy"
                  className="text-sm text-slate-600 hover:text-slate-900"
                >
                  Privacy
                </Link>

                <a
                  href="mailto:support@autoaudit.uk"
                  className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900"
                >
                  Contact us
                </a>

                {user ? (
                  <>
                    <Link
                      href="/reports"
                      className="text-sm text-slate-600 hover:text-slate-900"
                    >
                      Dashboard
                    </Link>
                    <LogoutButton />
                  </>
                ) : (
                  <Link
                    href="/auth?mode=login"
                    className="text-sm text-slate-600 hover:text-slate-900"
                  >
                    Sign in
                  </Link>
                )}
              </nav>

              <MobileMenu isSignedIn={!!user} />
            </div>
          </header>

          <main className="flex-1">{children}</main>

          <footer className="border-t border-slate-200 bg-white">
            <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
              <p>© {new Date().getFullYear()} AutoAudit. All rights reserved.</p>

              <div className="flex flex-wrap items-center gap-4">
                <Link href="/check-car-by-registration" className="hover:text-slate-900">
                  Check by registration
                </Link>
                <Link href="/cars" className="hover:text-slate-900">
                  Cars
                </Link>
                <Link href="/mot-advisories" className="hover:text-slate-900">
                  MOT Advisories
                </Link>
                <Link href="/terms" className="hover:text-slate-900">
                  Terms
                </Link>
                <Link href="/privacy" className="hover:text-slate-900">
                  Privacy
                </Link>
                <a
                  href="mailto:support@autoaudit.uk"
                  className="hover:text-slate-900"
                >
                  Contact us
                </a>
              </div>
            </div>
          </footer>

          <a
            href="mailto:support@autoaudit.uk"
            className="fixed bottom-4 right-4 z-50 inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-lg transition hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900"
          >
            Contact us
          </a>
        </div>
      </body>
    </html>
  );
}