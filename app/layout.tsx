import "./globals.css";
import Link from "next/link";

<!-- Update README.md to trigger deployment -->

export const metadata = {
  title: "AutoAudit",
  description: "Don’t overpay for your next used car",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        {/* Top bar */}
        <header className="mx-auto w-full max-w-6xl px-6 py-6">
          <Link href="/" className="block w-full">
            <img
              src="/logo.png"
              alt="AutoAudit"
              className="h-auto w-1/3 max-w-[360px]"
            />
          </Link>
        </header>

        {/* Page content */}
        <main className="mx-auto w-full max-w-6xl px-6 pb-16">
          {children}
        </main>
      </body>
    </html>
  );
}