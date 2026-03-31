import "./globals.css";
import Image from "next/image";
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

  return (
    <html lang="en-GB">
      <body className="min-h-screen bg-white text-slate-900">
        <div className="flex min-h-screen flex-col">
          <header className="relative z-50 border-b border-slate-200 bg-white">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
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

              <nav className="hidden items-center gap-4 sm:flex">
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
                      href="/dashboard"
                      className="text-sm text-slate-600 hover:text-slate-900"
                    >
                      Dashboard
                    </Link>
                    <LogoutButton />
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="text-sm text-slate-600 hover:text-slate-900"
                  >
                    Sign in
                  </Link>
                )}
              </nav>

              <details className="relative sm:hidden">
                <summary className="cursor-pointer list-none text-sm font-medium text-slate-700">
                  Menu
                </summary>

                <div className="absolute right-0 z-[60] mt-2 w-44 rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
                  <div className="flex flex-col gap-3 text-sm text-slate-700">
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

                    {user ? (
                      <>
                        <Link href="/dashboard" className="hover:text-slate-900">
                          Dashboard
                        </Link>
                        <LogoutButton />
                      </>
                    ) : (
                      <Link href="/login" className="hover:text-slate-900">
                        Sign in
                      </Link>
                    )}
                  </div>
                </div>
              </details>
            </div>
          </header>

          <main className="flex-1">{children}</main>

          <footer className="border-t border-slate-200 bg-white">
            <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-sm text-slate-600 sm:px-6 lg:px-8 sm:flex-row sm:items-center sm:justify-between">
              <p>© {new Date().getFullYear()} AutoAudit. All rights reserved.</p>

              <div className="flex flex-wrap items-center gap-4">
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