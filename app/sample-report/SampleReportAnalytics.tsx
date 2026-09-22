"use client";
import { useEffect, useState } from "react";
import ViewEvent from "@/components/conversion/ViewEvent";
import { trackEvent } from "@/lib/analytics";
export default function SampleReportAnalytics() {
  const [dismissed, setDismissed] = useState(false);
  const [formVisible, setFormVisible] = useState(true);
  useEffect(() => {
    const forms = Array.from(document.querySelectorAll('[data-sample-check]'));
    if (!("IntersectionObserver" in window)) return;
    const visible = new Set<Element>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) { if (entry.isIntersecting) visible.add(entry.target); else visible.delete(entry.target); }
      setFormVisible(visible.size > 0);
    });
    forms.forEach((form) => observer.observe(form));
    return () => observer.disconnect();
  }, []);
  const data = { page_type: "sample_report", cta_variant: "general", cta_position: "sticky", sample: true };
  return <>
    <ViewEvent event="sample_report_viewed" data={{ page_type: "sample_report", sample: true }} />
    {!dismissed && !formVisible && <ViewEvent event="cta_view" data={data} visible className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-2 border-t border-slate-300 bg-white p-3 pb-[max(12px,env(safe-area-inset-bottom))] shadow-lg print:hidden sm:left-auto sm:right-5 sm:bottom-5 sm:rounded-2xl sm:border">
      <a href="#sample-check" className="btn-primary flex min-h-[48px] flex-1 items-center justify-center text-center" onClick={() => {
        trackEvent("cta_click", data);
        document.querySelector<HTMLInputElement>('#sample-check input[name="registration"]')?.focus();
      }}>Check a real car →</a>
      <button type="button" aria-label="Dismiss check a car bar" onClick={() => setDismissed(true)} className="min-h-[48px] min-w-[48px] rounded-lg text-xl text-slate-700 focus-visible:outline">×</button>
    </ViewEvent>}
  </>;
}
