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
        <header className="bg-white border-b">
          <div className="mx-auto w-full max-w-6xl px-4">
            <div className="flex items-center justify-between py-2">
              {/* Left: Logo */}
              <Link href="/" className="flex items-center">
                <img
                  src="/logo-v2.png"
                  alt="AutoAudit"
                  className="block select-none"
                  style={{ height: 64 }}
                />
              </Link>

              {/* Right: Tagline */}
              <div className="hidden sm:block text-sm font-medium text-slate-700">
                Used Car Risk Check
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="mx-auto w-full max-w-6xl px-4 pt-2 pb-16">
          {children}
        </main>
      </body>
    </html>
  );
}