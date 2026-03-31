"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import DailyReportCountPill from "@/app/components/DailyReportCountPill";

export default function MobileMenu({
  isSignedIn,
}: {
  isSignedIn: boolean;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  function closeMenu() {
    setOpen(false);
  }

  return (
    <div className="relative sm:hidden">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-controls="mobile-menu-panel"
        className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
      >
        Menu
      </button>

      {open ? (
        <div
          id="mobile-menu-panel"
          className="absolute right-0 z-[60] mt-2 w-52 rounded-xl border border-slate-200 bg-white p-3 shadow-lg"
        >
          <div className="mb-3">
            <DailyReportCountPill compact />
          </div>

          <div className="flex flex-col gap-3 text-sm text-slate-700">
            <Link
              href="/terms"
              onClick={closeMenu}
              className="hover:text-slate-900"
            >
              Terms
            </Link>

            <Link
              href="/privacy"
              onClick={closeMenu}
              className="hover:text-slate-900"
            >
              Privacy
            </Link>

            <a
              href="mailto:support@autoaudit.uk"
              onClick={closeMenu}
              className="hover:text-slate-900"
            >
              Contact us
            </a>

            {isSignedIn ? (
              <Link
                href="/reports"
                onClick={closeMenu}
                className="hover:text-slate-900"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={closeMenu}
                className="hover:text-slate-900"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}