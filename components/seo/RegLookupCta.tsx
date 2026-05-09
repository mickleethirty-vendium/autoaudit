"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  title?: string;
  subtitle?: string;
  className?: string;
  variant?: "dark" | "light";
};

export default function RegLookupCta({
  title = "Check the exact car by registration",
  subtitle = "See MOT history, recurring advisories and hidden repair-cost risks for the actual car you’re considering.",
  className = "",
  variant = "dark",
}: Props) {
  const [reg, setReg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const isLight = variant === "light";

  function normaliseReg(input: string) {
    return input.replace(/\s+/g, "").toUpperCase();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const cleaned = normaliseReg(reg);

    if (!cleaned || cleaned.length < 2) return;

    setIsSubmitting(true);
    router.push(`/check-car-by-registration?vrm=${cleaned}`);
  }

  return (
    <div
      className={`w-full rounded-2xl border p-6 shadow-lg ${
        isLight
          ? "border-slate-200 bg-white text-slate-900"
          : "border-white/10 bg-gradient-to-br from-white/5 to-white/0 text-white"
      } ${className}`}
    >
      <div className="max-w-2xl">
        <h2
          className={`text-xl font-semibold md:text-2xl ${
            isLight ? "text-slate-900" : "text-white"
          }`}
        >
          {title}
        </h2>

        <p
          className={`mt-2 text-sm md:text-base ${
            isLight ? "text-slate-600" : "text-white/70"
          }`}
        >
          {subtitle}
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-5 flex flex-col gap-3 sm:flex-row"
        >
          <input
            type="text"
            placeholder="Enter registration"
            value={reg}
            onChange={(e) => setReg(e.target.value)}
            className={`w-full rounded-lg border px-4 py-3 uppercase tracking-[0.18em] focus:outline-none ${
              isLight
                ? "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-slate-600"
                : "border-white/15 bg-black/40 text-white placeholder:text-white/40 focus:border-white/30"
            }`}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className={`rounded-lg px-6 py-3 font-semibold transition disabled:opacity-60 ${
              isLight
                ? "bg-slate-900 text-white hover:bg-slate-800"
                : "bg-white text-black hover:bg-white/90"
            }`}
          >
            {isSubmitting ? "Checking..." : "Check this car"}
          </button>
        </form>

        <div
          className={`mt-4 space-y-2 text-xs ${
            isLight ? "text-slate-500" : "text-white/60"
          }`}
        >
          <div className="flex flex-wrap items-center gap-4">
            <span>✓ DVSA MOT history</span>
            <span>✓ Known model issues</span>
            <span>✓ Repair cost signals</span>
          </div>

          <div>
            Example: <span className="font-medium">AB12 CDE</span>
          </div>
        </div>
      </div>
    </div>
  );
}