"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import ViewEvent from "@/components/conversion/ViewEvent";
import { trackEvent } from "@/lib/analytics";
import PreviewAnalytics from "./PreviewAnalytics";
import styles from "./snapshot.module.css";

const wideQuery = "(min-width: 1024px)";
function subscribeWidth(notify: () => void) {
  const media = window.matchMedia(wideQuery);
  media.addEventListener("change", notify);
  return () => media.removeEventListener("change", notify);
}
const wideSnapshot = () => window.matchMedia(wideQuery).matches;
const serverSnapshot = () => false;

export default function SnapshotPurchasePanel({ coreCheckoutUrl, bundleCheckoutUrl }: {
  coreCheckoutUrl: string;
  bundleCheckoutUrl?: string;
}) {
  const panel = useRef<HTMLElement>(null);
  const wide = useSyncExternalStore(subscribeWidth, wideSnapshot, serverSnapshot);
  const [passed, setPassed] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);
  const [editing, setEditing] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (wide || !panel.current || !("IntersectionObserver" in window)) return;
    // Show only after the entire primary panel has passed above the viewport.
    // Returning visibility hides the bar; no scroll listener or layout mutation.
    const observer = new IntersectionObserver(([entry]) => {
      setPassed(entry.boundingClientRect.bottom < 0 && entry.intersectionRatio < 0.2);
    }, { threshold: [0, 0.2] });
    observer.observe(panel.current);
    const footer = document.querySelector("footer");
    const footerObserver = new IntersectionObserver(([entry]) => setFooterVisible(entry.isIntersecting));
    if (footer) footerObserver.observe(footer);
    const focusChanged = () => setEditing(Boolean(document.activeElement?.matches("input, select, textarea, [contenteditable=true]")));
    document.addEventListener("focusin", focusChanged);
    document.addEventListener("focusout", focusChanged);
    return () => {
      observer.disconnect();
      footerObserver.disconnect();
      document.removeEventListener("focusin", focusChanged);
      document.removeEventListener("focusout", focusChanged);
    };
  }, [wide]);

  const stickyData = {
    page_type: "preview", source: "preview", cta_variant: "purchase_options",
    cta_position: "snapshot_mobile_sticky",
  };

  return (
    <aside className={styles.purchase} aria-label="Paid report options">
      <section ref={panel} id="snapshot-purchase" tabIndex={-1} aria-labelledby="snapshot-purchase-heading"
        className={`${styles.panel} rounded-2xl border border-slate-300 bg-white p-3 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 sm:p-4`}>
        <h2 id="snapshot-purchase-heading" className="text-lg font-bold text-slate-950">Unlock the full analysis</h2>
        <PreviewAnalytics coreCheckoutUrl={coreCheckoutUrl} bundleCheckoutUrl={bundleCheckoutUrl}
          location={wide ? "snapshot_sidebar" : "snapshot_primary"} variant="light" />
      </section>
      {!wide && passed && !footerVisible && !editing && !dismissed && (
        <ViewEvent visible event="cta_view" data={stickyData} className={styles.mobileBar}>
          <div className="mx-auto flex max-w-xl items-center gap-2">
            <a href="#snapshot-purchase" className="btn-primary flex min-h-[48px] flex-1 items-center justify-center px-3 text-center text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              onClick={(event) => {
                event.preventDefault();
                trackEvent("cta_click", stickyData);
                panel.current?.focus({ preventScroll: true });
                panel.current?.scrollIntoView({ block: "start" });
              }}>
              Unlock full analysis — from £4.99
            </a>
            <button type="button" aria-label="Dismiss purchase options bar" onClick={() => setDismissed(true)}
              className="min-h-[48px] min-w-[44px] rounded-lg text-xl text-slate-700 focus-visible:outline focus-visible:outline-2">×</button>
          </div>
        </ViewEvent>
      )}
    </aside>
  );
}
