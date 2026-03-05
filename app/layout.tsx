import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "AutoAudit",
  description: "Don’t overpay for your next used car",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        {/* SaaS Header */}
        <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur">
          <div className="mx-auto w-full max-w-6xl px-4">
            <div className="flex items-center justify-between py-2">
              {/* Left: Brand */}
              <div className="flex items-center gap-3">
                <Link href="/" className="flex items-center">
                  <img
                    src="/logo-tight.png"
                    alt="AutoAudit"
                    className="block select-none"
                    style={{ height: 64, width: "auto" }}
                  />
                </Link>

                {/* Small value badge */}
                <span className="hidden sm:inline-flex items-center rounded-full border bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                  Instant used car risk check
                </span>
              </div>

              {/* Right: Nav */}
              <nav className="hidden sm:flex items-center gap-2">
                <Link
                  href="/#how"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  How it works
                </Link>

                <Link
                  href="/#pricing"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Pricing
                </Link>

                <Link
                  href="/check"
                  className="ml-2 inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  Start a check
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="mx-auto w-full max-w-6xl px-4 pt-4 pb-16">
          {children}
        </main>
      </body>
    </html>
  );
}