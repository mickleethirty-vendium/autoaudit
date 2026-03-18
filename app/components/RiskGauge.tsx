type RiskLevel = "low" | "medium" | "high";

function normaliseRiskLevel(value?: string | null): RiskLevel {
  const v = String(value ?? "").toLowerCase();
  if (v === "high") return "high";
  if (v === "medium") return "medium";
  return "low";
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function baseScoreFromRiskLevel(level: RiskLevel) {
  if (level === "high") return 76;
  if (level === "medium") return 54;
  return 30;
}

function exposureAdjustment(exposureHigh?: number | null) {
  if (typeof exposureHigh !== "number" || !Number.isFinite(exposureHigh)) {
    return 0;
  }

  if (exposureHigh >= 2000) return 14;
  if (exposureHigh >= 1500) return 10;
  if (exposureHigh >= 1000) return 6;
  if (exposureHigh >= 700) return 3;
  if (exposureHigh >= 400) return 0;
  if (exposureHigh >= 200) return -2;
  return -4;
}

function scoreFromInputs(riskLevel?: string | null, exposureHigh?: number | null) {
  const level = normaliseRiskLevel(riskLevel);
  const base = baseScoreFromRiskLevel(level);
  const adjusted = base + exposureAdjustment(exposureHigh);

  return clamp(adjusted, 18, 92);
}

function tone(level: RiskLevel) {
  if (level === "high") {
    return {
      ring: "stroke-[var(--aa-red)]",
      text: "text-[var(--aa-red)]",
      sub: "Higher risk",
      track: "stroke-red-100",
      dot: "bg-[var(--aa-red)]",
    };
  }

  if (level === "medium") {
    return {
      ring: "stroke-amber-500",
      text: "text-amber-600",
      sub: "Moderate risk",
      track: "stroke-amber-100",
      dot: "bg-amber-500",
    };
  }

  return {
    ring: "stroke-emerald-500",
    text: "text-emerald-600",
    sub: "Lower risk",
    track: "stroke-emerald-100",
    dot: "bg-emerald-500",
  };
}

export default function RiskGauge({
  riskLevel,
  exposureHigh,
}: {
  riskLevel?: string | null;
  exposureHigh?: number | null;
}) {
  const level = normaliseRiskLevel(riskLevel);
  const score = scoreFromInputs(riskLevel, exposureHigh);
  const palette = tone(level);

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const dash = (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative h-36 w-36 sm:h-44 sm:w-44">
        <svg
          viewBox="0 0 140 140"
          className="h-full w-full -rotate-90"
          aria-hidden="true"
        >
          <circle
            cx="70"
            cy="70"
            r={radius}
            strokeWidth="12"
            fill="none"
            className={palette.track}
          />
          <circle
            cx="70"
            cy="70"
            r={radius}
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference - dash}`}
            className={palette.ring}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div
            className={`text-3xl font-extrabold tracking-tight sm:text-4xl ${palette.text}`}
          >
            {score}%
          </div>
          <div className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Risk
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${palette.dot}`} />
        <div className={`text-sm font-semibold ${palette.text}`}>
          {palette.sub}
        </div>
      </div>
    </div>
  );
}