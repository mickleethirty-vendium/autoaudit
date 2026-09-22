"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { AnalyticsEvents, trackEvent, readFunnel } from "@/lib/analytics";
import { checkoutRequestUrl, checkoutSource, checkoutStartedEvent, checkoutTier } from "@/lib/checkout";
import { acquireCheckout, checkoutPending, subscribeCheckout } from "@/lib/requestTask";
import { isRequestCancelled } from "@/lib/request";
import { Position } from "@/lib/vehicleCheck";
import ViewEvent from "./ViewEvent";
import useRequestTask from "./useRequestTask";

export default function CheckoutLink({ href, children, className, title, position = "inline" }: {
  href: string;
  children: React.ReactNode;
  className?: string;
  title?: string;
  position?: Position;
}) {
  const [error, setError] = useState(false);
  const id = useId();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = `${pathname}?${searchParams}`;
  const task = useRequestTask();
  const release = useRef<(() => void) | null>(null);
  const busy = useSyncExternalStore(subscribeCheckout, () => checkoutPending(page), () => false);
  useEffect(() => () => {
    task.cancel();
    release.current?.();
  }, [page, task]);

  // Server-rendered hrefs already carry report context. URL context is also
  // available when this control is used by a client renderer or in a fresh tab.
  const target = checkoutRequestUrl(href, readFunnel(new URLSearchParams(searchParams.toString())));
  const params = new URL(target, "https://autoaudit.uk").searchParams;
  const tier = checkoutTier(params.get("tier"));
  const source = checkoutSource(params.get("source"));
  const journey = readFunnel(params);
  const data = {
    page_type: source,
    source,
    tier,
    cta_variant: "checkout",
    cta_position: position,
    ...(journey.funnel_source ? { funnel_source: journey.funnel_source } : {}),
    ...(journey.landing_type ? { landing_type: journey.landing_type } : {}),
    ...(journey.cta_variant ? { entry_variant: journey.cta_variant } : {}),
    ...(journey.cta_position ? { entry_position: journey.cta_position } : {}),
  };

  return (
    <ViewEvent visible event={AnalyticsEvents.CTA_VIEW} data={data}>
      <a
        href={target}
        title={title}
        aria-busy={busy}
        aria-disabled={busy}
        aria-describedby={error ? id : undefined}
        className={`${className || "btn-primary"} min-h-[48px] focus-visible:!outline focus-visible:!outline-2 focus-visible:!outline-offset-2 focus-visible:!outline-red-700 ${busy ? "opacity-60" : ""}`}
        onClick={async (event) => {
          if (busy) { event.preventDefault(); return; }
          if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
          event.preventDefault();
          const unlock = acquireCheckout(page);
          if (!unlock) return;
          release.current = unlock;
          setError(false);
          trackEvent(AnalyticsEvents.CTA_CLICK, data);
          try {
            const { response, data: result } = await task.run(target, {
              headers: { Accept: "application/json" },
              cache: "no-store",
            }, 35000);
            if (!response.ok || !result?.url || result.created !== true) throw new Error("checkout_failed");
            const destination = new URL(result.url);
            if (destination.protocol !== "https:" || destination.hostname !== "checkout.stripe.com") throw new Error("checkout_failed");
            trackEvent(checkoutStartedEvent(tier), data);
            window.location.assign(destination.toString());
          } catch (error) {
            if (isRequestCancelled(error)) return;
            trackEvent(AnalyticsEvents.CHECKOUT_FAILED, { ...data, reason: "session_creation_failed" });
            setError(true);
          } finally {
            unlock();
            release.current = null;
          }
        }}
      >
        {busy ? "Opening secure checkout…" : children}
      </a>
      {error && (
        <p id={id} role="alert" className="mt-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          Checkout could not be opened. Your current report remains available. Please try again.
        </p>
      )}
    </ViewEvent>
  );
}
