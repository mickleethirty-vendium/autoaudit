"use client";

import { FormEvent, useId, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnalyticsEvents, trackEvent, landingType } from "@/lib/analytics";
import { buildCheckUrl, formatRegistration, isLikelyUkRegistration, Intent, Position, pageTypeForPath } from "@/lib/vehicleCheck";
import ViewEvent from "@/components/conversion/ViewEvent";

export default function RegLookupCta({ title, subtitle, className = "", variant = "light", intent = "general", position = "early", make, model, compact = false }: {
  title?: string;
  subtitle?: string;
  className?: string;
  variant?: "dark" | "light";
  intent?: Intent;
  position?: Position;
  make?: string;
  model?: string;
  compact?: boolean;
}) {
  const [reg, setReg] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const id = useId();
  const vehicle = [make, model].filter(Boolean).join(" ");
  const copy = {
    general: ["Check the car you’re considering", "Enter the registration to see what AutoAudit finds.", "Check this car"],
    "common-problems": [`Thinking of buying ${vehicle ? `this ${vehicle}` : "one"}?`, "Generic fault lists tell you what might go wrong. Check the history and available warning signs for the actual car.", "Check this car"],
    "mot-advisory": ["Seen this advisory on a car you’re considering?", "Check its wider MOT history, repeat advisories and other available warning signs.", "Check its history"],
    "buying-guide": ["Found one you like? Check it before you buy it.", "Move from your shortlist to the history and available buyer-risk signals for the actual car.", "Check the car"],
    diagnostic: ["Put the symptom in context", "A registration check can show available MOT history and recorded advisories. It does not diagnose the cause of a current fault.", "Check its history"],
  }[intent];
  const data = { page_type: pageTypeForPath(pathname), cta_variant: intent, cta_position: position, ...(make ? { make } : {}), ...(model ? { model } : {}) };
  function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    trackEvent(AnalyticsEvents.CTA_CLICK, data);
    if (!isLikelyUkRegistration(reg)) {
      setError("Enter a UK registration, for example AB12 CDE.");
      return;
    }
    const params = new URLSearchParams(window.location.search);
    params.set("f_landing", landingType(data.page_type));
    params.set("f_source", data.page_type);
    params.set("f_variant", intent);
    params.set("f_position", position);
    setBusy(true);
    router.push(buildCheckUrl(reg, params));
  }
  const light = variant === "light";
  return (
    <ViewEvent
      event={AnalyticsEvents.CTA_VIEW}
      data={data}
      visible
      className={`w-full min-w-0 rounded-2xl border p-4 text-left sm:p-5 ${light ? "border-slate-200 bg-white text-slate-950" : "border-white/20 bg-slate-950 text-white"} ${className}`}
    >
      {!compact && (
        <>
          <h2 className={`text-xl font-bold tracking-tight ${light ? "text-slate-950" : "text-white"}`}>{title || copy[0]}</h2>
          <p className={`mt-2 text-sm leading-6 ${light ? "text-slate-600" : "text-slate-200"}`}>{subtitle || copy[1]}</p>
        </>
      )}
      <form action="/check" method="get" onSubmit={submit} className={compact ? "" : "mt-4"}>
        <input type="hidden" name="f_landing" value={data.page_type} />
        <input type="hidden" name="f_source" value={data.page_type} />
        <input type="hidden" name="f_variant" value={intent} />
        <input type="hidden" name="f_position" value={position} />
        <label htmlFor={id} className="mb-2 block text-sm font-semibold">UK registration</label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id={id}
            name="registration"
            value={reg}
            onChange={(event) => {
              setReg(formatRegistration(event.target.value));
              setError("");
            }}
            autoCapitalize="characters"
            autoCorrect="off"
            autoComplete="off"
            spellCheck={false}
            maxLength={10}
            placeholder="AB12 CDE"
            aria-invalid={!!error}
            aria-describedby={`${id}-hint${error ? ` ${id}-error` : ""}`}
            disabled={busy}
            className="h-14 min-h-[56px] w-full min-w-0 sm:flex-1 rounded-xl border-2 border-slate-300 bg-white px-4 text-lg font-bold uppercase tracking-wider text-slate-950 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-red-700"
          />
          <button
            disabled={busy}
            type="submit"
            className="min-h-14 shrink-0 rounded-xl bg-[var(--aa-red)] px-5 py-3 font-bold text-white hover:bg-[var(--aa-red-strong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60"
          >
            {busy ? "Starting check…" : `${copy[2]} →`}
          </button>
        </div>
        {error && (
          <p id={`${id}-error`} role="alert" className={`mt-2 text-sm ${light ? "text-red-700" : "text-red-200"}`}>{error}</p>
        )}
        <p id={`${id}-hint`} className={`mt-3 text-xs leading-5 ${light ? "text-slate-600" : "text-slate-200"}`}>
          Free snapshot first. No payment details needed. Add mileage and gearbox after lookup.
        </p>
      </form>
    </ViewEvent>
  );
}
