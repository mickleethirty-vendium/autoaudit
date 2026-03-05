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
        <header className="border-b bg-white">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center">
              <img
                src="/logo.png"
                alt="AutoAudit"
                className="h-14 w-auto block select-none"
              />
            </Link>

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