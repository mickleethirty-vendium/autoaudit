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
        {/* Header (tight) */}
        <header className="mx-auto w-full max-w-6xl px-4 pt-1 pb-0">
          <Link href="/" className="block">
            <img
              src="/logo.png"
              alt="AutoAudit"
              className="h-auto w-[240px] block"
            />
          </Link>
        </header>

        {/* Main content (tight top padding) */}
        <main className="mx-auto w-full max-w-6xl px-4 pt-2 pb-10">
          {children}
        </main>
      </body>
    </html>
  );
}