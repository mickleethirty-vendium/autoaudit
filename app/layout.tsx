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

        {/* Header */}
        <header className="border-b bg-white shadow-sm,">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="AutoAudit"
                className="h-10 w-auto block select-none"
              />
            </Link>

            {/* Right-side header text */}
            <div className="text-sm font-medium text-slate-600 hidden sm:block">
              Used Car Risk Check
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