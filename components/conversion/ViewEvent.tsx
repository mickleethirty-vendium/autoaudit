"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackEvent, claimImpression } from "@/lib/analytics";
import { AnalyticsEvent, EventData } from "@/lib/analyticsPolicy";

export default function ViewEvent({ event, data, children, className, visible = false }: {
  event: AnalyticsEvent;
  data: EventData;
  children?: React.ReactNode;
  className?: string;
  visible?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const sent = useRef("");
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const serialized = JSON.stringify(data);

  useEffect(() => {
    const key = `${pathname}:${searchParams}:${event}:${serialized}`;
    const send = () => {
      if (sent.current === key) return;
      sent.current = key;
      if (event !== "cta_view" || claimImpression(`${event}:${serialized}`)) {
        trackEvent(event, JSON.parse(serialized));
      }
    };
    if (!visible) {
      send();
      return;
    }
    if (!ref.current || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.35) {
        send();
        observer.disconnect();
      }
    }, { threshold: 0.35 });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [event, pathname, searchParams, serialized, visible]);

  return <div ref={ref} className={className}>{children}</div>;
}
