"use client";

import { useState } from "react";

type Fuel = "petrol" | "diesel" | "hybrid" | "ev";
type Transmission = "manual" | "automatic" | "cvt" | "dct";
type TimingType = "belt" | "chain" | "unknown";

function mapDvlaFuelToFuel(dvlaFuel: string | null): Fuel {
  const f = (dvlaFuel ?? "").toLowerCase();

  // DVLA values vary; we keep mapping broad and safe.
  if (f.includes("diesel")) return "diesel";
  if (f.includes("electric")) return "ev";
  if (f.includes("hybrid")) return "hybrid";
  // default
  return "petrol";
}

export default function CheckForm() {
  // Reg lookup fields
  const [mode, setMode] = useState<"reg" | "manual">("reg");
  const [registration, setRegistration] = useState<string>("");
  const [lookupBusy, setLookupBusy] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [lookupResult, setLookupResult] = useState<any | null>(null);

  // Report inputs (same as before)
  const [year, setYear] = useState<number>(2016);
  const [mileage, setMileage] = useState<number>(78000);
  const [fuel, setFuel] = useState<Fuel>("petrol");
  const [transmission, setTransmission] = useState<Transmission>("automatic");
  const [timingType, setTimingType] = useState<TimingType>("unknown");
  const [askingPrice, setAskingPrice] = useState<number | "">("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function lookupReg() {
    setLookupBusy(true);
    setLookupError(null);
    setLookupResult(null);

    try {
      const res = await fetch("/api/lookup-reg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registration }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Lookup failed");

      setLookupResult(data);

      // Autofill year + fuel if present
      if (data?.yearOfManufacture) {
        setYear(Number(data.yearOfManufacture));
      }
      if (data?.fuelType) {
        setFuel(mapDvlaFuelToFuel(data.fuelType));
      }
    } catch (e: any) {
      setLookupError(e?.message ?? "Lookup failed");
    } finally {
      setLookupBusy(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const res = await fetch("/api/create-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // We still store year/fuel/etc for the engine
          year,
          mileage,
          fuel,
          transmission,
          timing_type: timingType,
          asking_price: askingPrice === "" ? null : askingPrice,

          // Optional: store reg + make in listing_url field later if you add columns
          // For now we won’t send it to DB to avoid schema changes.
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
      {/* Mode switch */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode("reg")}
          className={`rounded-md px-3 py-2 text-sm font-semibold border ${
            mode === "reg" ? "bg-slate-900 text-white border-slate-900" : "bg-white"
          }`}
        >
          Use registration (recommended)
        </button>
        <button
          type="button"
          onClick={() => setMode("manual")}
          className={`rounded-md px-3 py-2 text-sm font-semibold border ${
            mode === "manual" ? "bg-slate-900 text-white border-slate-900" : "bg-white"
          }`}
        >
          Manual entry
        </button>
      </div>

      {/* Registration lookup */}
      {mode === "reg" ? (
        <div className="rounded-lg border bg-slate-50 p-4 grid gap-3">
          <div className="grid gap-2">
            <label className="text-sm font-semibold">Registration (number plate)</label>
            <div className="flex gap-2">
              <input
                className="flex-1 rounded-md border px-3 py-2"
                value={registration}
                onChange={(e) => setRegistration(e.target.value)}
                placeholder="e.g. AB12CDE"
              />
              <button
                type="button"
                onClick={lookupReg}
                disabled={lookupBusy || registration.trim().length < 5}
                className="rounded-md bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {lookupBusy ? "Looking up…" : "Lookup"}
              </button>
            </div>
            <div className="text-xs text-slate-600">
              We use DVLA Vehicle Enquiry to auto-fill basics like year and fuel type.
            </div>
          </div>

          {lookupError ? (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
              {lookupError}
            </div>
          ) : null}

          {lookupResult ? (
            <div className="rounded-md bg-white p-3 text-sm text-slate-800 border">
              <div className="font-semibold">
                Found: {lookupResult.make ?? "Vehicle"} ({lookupResult.registration})
              </div>
              <div className="mt-1 text-slate-700">
                Year: <b>{lookupResult.yearOfManufacture ?? "Unknown"}</b> · Fuel:{" "}
                <b>{lookupResult.fuelType ?? "Unknown"}</b> · Colour:{" "}
                <b>{lookupResult.colour ?? "Unknown"}</b>
              </div>
              <div className="mt-1 text-xs text-slate-600">
                MOT: {lookupResult.motStatus ?? "Unknown"} · Tax: {lookupResult.taxStatus ?? "Unknown"}
              </div>
              <div className="mt-2 text-xs text-slate-600">
                We’ve auto-filled Year and Fuel below — please confirm everything.
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Core inputs */}
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
            onChange={(e) =>
              setAskingPrice(e.target.value === "" ? "" : parseInt(e.target.value, 10))
            }
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