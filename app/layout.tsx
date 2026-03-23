import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "AutoAudit",
  description: "Don’t overpay for your next used car",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[var(--aa-bg)] text-slate-900 antialiased">
        <header className="sticky top-0 z-50 border-b border-[var(--aa-silver)] bg-white/80 backdrop-blur-xl backdrop-saturate-150 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
          <div className="mx-auto w-full max-w-6xl px-4">
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-4">
                <Link href="/" className="flex items-center group">
                  <img
                    src="/logo-shield-red.png"
                    alt="AutoAudit"
                    className="block select-none transition-transform duration-200 group-hover:scale-[1.03]"
                    style={{ height: 64, width: "auto" }}
                  />
                </Link>

                <div className="hidden h-10 w-px bg-[var(--aa-silver)] sm:block" />

                <div className="hidden sm:flex sm:flex-col sm:gap-2">
                  <span className="inline-flex items-center rounded-full border border-[var(--aa-silver)] bg-white px-3 py-1 text-xs font-semibold text-black shadow-sm">
                    Used car checks. Faster decisions.
                  </span>

                  <span className="inline-flex w-fit items-center rounded-full border border-[#b91c1c]/20 bg-[#b91c1c]/5 px-3 py-1 text-xs font-semibold text-[#b91c1c] shadow-sm">
                    127 cars checked today
                  </span>
                </div>
              </div>

              <nav className="hidden sm:flex items-center gap-2">
                <Link
                  href="/how-it-works"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition duration-200 hover:bg-slate-100 hover:text-black"
                >
                  How it works
                </Link>

                <Link
                  href="/#pricing"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition duration-200 hover:bg-slate-100 hover:text-black"
                >
                  Pricing
                </Link>

                <Link
                  href="/auth?mode=login"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition duration-200 hover:bg-slate-100 hover:text-black"
                >
                  Log In
                </Link>
              </nav>
            </div>

            <div className="pb-3 sm:hidden">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href="/auth?mode=login"
                  className="inline-flex items-center rounded-full border border-[var(--aa-silver)] bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm"
                >
                  Log In
                </Link>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 pt-6 pb-16">
          {children}
        </main>
      </body>
    </html>
  );
}