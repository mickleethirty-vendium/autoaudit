"use client";

import { usePathname } from "next/navigation";

export default function FloatingContactButton() {
  const pathname = usePathname();

  if (pathname === "/sample-report" || pathname.startsWith("/report/")) return null;

  return (
    <a
      href="mailto:support@autoaudit.uk"
      className="hidden sm:inline-flex fixed bottom-4 right-4 z-30 items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-lg transition hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900"
    >
      Contact us
    </a>
  );
}