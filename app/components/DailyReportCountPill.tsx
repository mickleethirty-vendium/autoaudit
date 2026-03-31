"use client";

import { useEffect, useState } from "react";

type DailyReportCountPillProps = {
  compact?: boolean;
};

function formatCount(count: number | null) {
  if (count === null) return "—";
  return count.toLocaleString("en-GB");
}

export default function DailyReportCountPill({
  compact = false,
}: DailyReportCountPillProps) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    async function loadCount() {
      try {
        const response = await fetch("/api/stats/daily-report-count", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load daily report count");
        }

        const data = (await response.json()) as { count?: number };

        if (!active) return;

        setCount(
          typeof data.count === "number" && Number.isFinite(data.count)
            ? data.count
            : 0
        );
      } catch (error) {
        console.error("Daily report count pill fetch failed", error);

        if (!active) return;
        setCount(0);
      }
    }

    loadCount();

    return () => {
      active = false;
    };
  }, []);

  if (compact) {
    return (
      <div className="inline-flex w-full items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700">
        <span className="font-semibold text-slate-900">
          {formatCount(count)}
        </span>
        <span className="ml-1">reports today</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center rounded-full border border-[var(--aa-red)]/20 bg-[var(--aa-red)]/5 px-3 py-1.5 text-xs font-medium text-slate-700">
      <span className="font-semibold text-[var(--aa-red)]">
        {formatCount(count)}
      </span>
      <span className="ml-1.5 whitespace-nowrap">reports generated today</span>
    </div>
  );
}