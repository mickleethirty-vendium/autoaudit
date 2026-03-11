import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "AutoAudit",
  description: "Don’t overpay for your next used car",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[var(--aa-bg)] text-slate-900">
        {/* SaaS Header */}
        <header className="sticky top-0 z-50 border-b border-[var(--aa-silver)] bg-white/95 backdrop-blur">
          <div className="mx-auto w-full max-w-6xl px-4">
            <div className="flex items-center justify-between py-3">
              {/* Left: Brand */}
              <div className="flex items-center gap-4">
                <Link href="/" className="flex items-center">
                  <img
                    src="/logo-tight.png"
                    alt="AutoAudit"
                    className="block select-none"
                    style={{ height: 64, width: "auto" }}
                  />
                </Link>

                <div className="hidden h-10 w-px bg-[var(--aa-silver)] sm:block" />

                <span className="hidden sm:inline-flex items-center rounded-full border border-[var(--aa-silver)] bg-white px-3 py-1 text-xs font-semibold text-black">
                  Instant used car risk check
                </span>
              </div>

              {/* Right: Nav */}
              <nav className="hidden sm:flex items-center gap-2">
                <Link
                  href="/#how"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-black"
                >
                  How it works
                </Link>

                <Link
                  href="/#pricing"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-black"
                >
                  Pricing
                </Link>

                <Link
                  href="/check"
                  className="ml-2 inline-flex items-center justify-center rounded-xl border border-[#b91c1c] bg-[#b91c1c] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#991b1b]"
                >
                  Start a check
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="mx-auto w-full max-w-6xl px-4 pt-5 pb-16">
          {children}
        </main>
      </body>
    </html>
  );
}