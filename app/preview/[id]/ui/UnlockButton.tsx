"use client";

import { useState } from "react";

export default function UnlockButton({ reportId }: { reportId: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Checkout failed");
      window.location.href = data.url;
    } catch (e: any) {
      setError(e?.message ?? "Checkout failed");
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-2">
      <button
        onClick={startCheckout}
        disabled={busy}
        className="rounded-md bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
      >
        {busy ? "Redirecting…" : "Unlock full report — £3.99"}
      </button>
      {error ? <div className="text-sm text-red-700">{error}</div> : null}
      <div className="text-xs text-slate-600">
        Secure payment via Stripe. One-time payment, no subscription.
      </div>
    </div>
  );
}
