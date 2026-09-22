import CheckoutLink from "@/components/conversion/CheckoutLink";

// CTA instances do not emit page views. The page owns one snapshot-view event.
export default function PreviewAnalytics({ coreCheckoutUrl, bundleCheckoutUrl, location, variant }: {
  coreCheckoutUrl: string;
  bundleCheckoutUrl?: string;
  location: "hero" | "unlock_panel";
  variant: "light" | "dark";
}) {
  const explanation = `text-xs leading-5 ${variant === "dark" ? "text-slate-200" : "text-slate-600"}`;
  return (
    <div className="mt-4 grid gap-3">
      <CheckoutLink href={coreCheckoutUrl} position={location} className="btn-primary flex w-full items-center justify-center text-center">
        Unlock Core Report · £4.99
      </CheckoutLink>
      <p className={explanation}>See the detailed findings, repair-risk guidance and questions to ask the seller.</p>
      {bundleCheckoutUrl ? (
        <>
          <CheckoutLink
            href={bundleCheckoutUrl}
            position={location}
            className={`flex w-full items-center justify-center rounded-lg border px-4 py-3 text-center text-sm font-semibold ${variant === "dark" ? "border-white/30 text-white" : "border-slate-300 bg-white text-slate-900"}`}
          >
            Full Bundle including HPI · £9.99
          </CheckoutLink>
          <p className={explanation}>Core plus available finance, write-off, stolen and other vehicle-history checks. One-off payment.</p>
        </>
      ) : (
        <p className="text-sm">This manual check has no registration. Core is available; HPI/history checks require a registration-based check.</p>
      )}
    </div>
  );
}
