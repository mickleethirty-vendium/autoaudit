// app/components/ExposureBar.tsx

type Props = {
  low: number;
  high: number;
  riskLevel?: string | null; // "low" | "medium" | "high"
};

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function money(n: number) {
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `£${Math.round(n)}`;
  }
}

export default function ExposureBar({ low, high, riskLevel }: Props) {
  const mid = (low + high) / 2;

  // Scale the bar to something sensible so it works across most cars.
  // You can tune these later.
  const min = 0;
  const max = 2500;

  const pct = clamp(((mid - min) / (max - min)) * 100, 2, 98);

  const badge =
    riskLevel === "high"
      ? { text: "High risk", cls: "bg-rose-50 text-rose-700 border-rose-200" }
      : riskLevel === "medium"
      ? { text: "Medium risk", cls: "bg-amber-50 text-amber-800 border-amber-200" }
      : { text: "Lower risk", cls: "bg-emerald-50 text-emerald-800 border-emerald-200" };

  return (
    <div className="mt-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm text-slate-600">Exposure range</div>
        <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${badge.cls}`}>
          {badge.text}
        </span>
      </div>

      <div className="mt-2 text-2xl font-extrabold tracking-tight">
        {money(low)} – {money(high)}
      </div>

      {/* Bar */}
      <div className="mt-3">
        <div className="relative h-3 w-full rounded-full bg-slate-200 overflow-hidden">
          {/* Fill uses your teal accent vibe */}
          <div className="h-full w-full bg-gradient-to-r from-slate-200 via-sky-200 to-emerald-200" />
          {/* Marker */}
          <div
            className="absolute top-1/2 h-6 w-1 -translate-y-1/2 rounded bg-slate-900 shadow"
            style={{ left: `${pct}%` }}
            aria-hidden="true"
          />
        </div>

        {/* Labels */}
        <div className="mt-2 flex justify-between text-xs text-slate-600">
          <span>Low</span>
          <span>High</span>
        </div>

        <div className="mt-1 text-xs text-slate-500">
          Marker shows your car’s estimated position on a typical £0–£2,500 near-term maintenance range.
        </div>
      </div>
    </div>
  );
}