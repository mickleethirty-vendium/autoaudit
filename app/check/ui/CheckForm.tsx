"use client";

import { useState } from "react";

type Fuel = "petrol" | "diesel" | "hybrid" | "ev";
type Transmission = "manual" | "automatic" | "cvt" | "dct";
type TimingType = "belt" | "chain" | "unknown";

export default function CheckForm() {
  const [year, setYear] = useState<number>(2016);
  const [mileage, setMileage] = useState<number>(78000);
  const [fuel, setFuel] = useState<Fuel>("petrol");
  const [transmission, setTransmission] = useState<Transmission>("automatic");
  const [timingType, setTimingType] = useState<TimingType>("unknown");
  const [askingPrice, setAskingPrice] = useState<number | "">("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const res = await fetch("/api/create-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year,
          mileage,
          fuel,
          transmission,
          timing_type: timingType,
          asking_price: askingPrice === "" ? null : askingPrice,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Failed to create report");

      window.location.href = `/preview/${data.report_id}`;
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <label className="text-sm font-semibold">Year</label>
        <input
          className="rounded-md border px-3 py-2"
          type="number"
          value={year}
          min={1990}
          max={new Date().getFullYear()}
          onChange={(e) => setYear(parseInt(e.target.value || "0", 10))}
          required
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-semibold">Mileage</label>
        <input
          className="rounded-md border px-3 py-2"
          type="number"
          value={mileage}
          min={0}
          onChange={(e) => setMileage(parseInt(e.target.value || "0", 10))}
          required
        />
      </div>

      <div className="grid gap-2 md:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-sm font-semibold">Fuel</label>
          <select
            className="rounded-md border px-3 py-2"
            value={fuel}
            onChange={(e) => setFuel(e.target.value as Fuel)}
          >
            <option value="petrol">Petrol</option>
            <option value="diesel">Diesel</option>
            <option value="hybrid">Hybrid</option>
            <option value="ev">EV</option>
          </select>
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-semibold">Transmission</label>
          <select
            className="rounded-md border px-3 py-2"
            value={transmission}
            onChange={(e) => setTransmission(e.target.value as Transmission)}
          >
            <option value="manual">Manual</option>
            <option value="automatic">Automatic</option>
            <option value="cvt">CVT</option>
            <option value="dct">DCT</option>
          </select>
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-sm font-semibold">Timing type (if known)</label>
          <select
            className="rounded-md border px-3 py-2"
            value={timingType}
            onChange={(e) => setTimingType(e.target.value as TimingType)}
          >
            <option value="unknown">Unknown</option>
            <option value="belt">Belt</option>
            <option value="chain">Chain</option>
          </select>
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-semibold">Asking price (optional)</label>
          <input
            className="rounded-md border px-3 py-2"
            type="number"
            value={askingPrice}
            min={0}
            onChange={(e) => setAskingPrice(e.target.value === "" ? "" : parseInt(e.target.value, 10))}
            placeholder="e.g. 8995"
          />
        </div>
      </div>

      {error ? (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <button
        disabled={busy}
        className="rounded-md bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
      >
        {busy ? "Creating…" : "Generate snapshot"}
      </button>

      <p className="text-xs text-slate-600">
        By using AutoAudit you agree this is guidance only and not a mechanical inspection.
      </p>
    </form>
  );
}
