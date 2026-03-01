"use client";

import { useState } from "react";

type Fuel = "petrol" | "diesel" | "hybrid" | "ev";
type Transmission = "" | "manual" | "automatic" | "cvt" | "dct";
type TimingType = "belt" | "chain" | "unknown";

// Keep this list reasonably broad for UK market.
const MAKE_OPTIONS = [
  "Abarth", "Alfa Romeo", "Aston Martin", "Audi", "Bentley", "BMW", "Bugatti",
  "Citroen", "Cupra", "Dacia", "DS", "Ferrari", "Fiat", "Ford", "Honda", "Hyundai", "Jaguar", "Jeep",
  "Kia", "Lamborghini", "Land Rover", "Lexus", "Lotus", "Maserati", "Mazda", "McLaren", "Mercedes-Benz",
  "MG", "MINI", "Mitsubishi", "Nissan", "Peugeot", "Polestar", "Porsche", "Renault", "Rolls-Royce",
  "SEAT", "Skoda", "Smart", "Subaru", "Suzuki", "Tesla", "Toyota", "Vauxhall", "Volkswagen", "Volvo", "Other",
];

function mapDvlaFuelToFuel(dvlaFuel: string | null): Fuel {
  const f = (dvlaFuel ?? "").toLowerCase();
  if (f.includes("diesel")) return "diesel";
  if (f.includes("electric")) return "ev";
  if (f.includes("hybrid")) return "hybrid";
  return "petrol";
}

function cleanRegistration(reg: string): string {
  return reg.replace(/\s/g, "").toUpperCase();
}

function normalizeMake(input: string): string {
  const v = input.trim();
  if (!v) return "";
  const lower = v.toLowerCase();
  if (lower === "vw") return "Volkswagen";
  if (lower === "merc" || lower === "mercedes") return "Mercedes-Benz";
  if (lower === "landrover") return "Land Rover";
  if (lower === "range rover") return "Land Rover";
  if (lower === "mini") return "MINI";
  if (lower === "rolls royce") return "Rolls-Royce";
  return v;
}

export default function CheckForm() {
  const [mode, setMode] = useState<"reg" | "manual">("reg");

  // State variables
  const [registration, setRegistration] = useState<string>("");
  const [lookupBusy, setLookupBusy] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [lookupResult, setLookupResult] = useState<any | null>(null);

  // Inputs
  const [make, setMake] = useState<string>("");
  const [year, setYear] = useState<number>(2016);
  const [mileage, setMileage] = useState<number | "">("");
  const [fuel, setFuel] = useState<Fuel>("petrol");
  const [transmission, setTransmission] = useState<Transmission>("");
  const [timingType, setTimingType] = useState<TimingType>("unknown");
  const [askingPrice, setAskingPrice] = useState<number | "">("");

  // Loading state
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
      if (data?.yearOfManufacture) setYear(Number(data.yearOfManufacture));
      if (data?.fuelType) setFuel(mapDvlaFuelToFuel(data.fuelType));
      if (data?.make) setMake(normalizeMake(String(data.make)));

      setMileage("");
      setTransmission("");
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
      const makeNormalized = normalizeMake(make);

      if (mode === "manual" && makeNormalized.trim() === "") {
        throw new Error("Please select the vehicle make (e.g. Ford, BMW, Toyota).");
      }

      if (mileage === "" || !Number.isFinite(Number(mileage))) {
        throw new Error("Please enter the current mileage.");
      }

      if (transmission === "") {
        throw new Error("Please select the transmission type.");
      }

      const regToStore = mode === "reg" && registration.trim() ? cleanRegistration(registration.trim()) : null;
      const makeToStore = makeNormalized.trim() ? makeNormalized.trim() : null;

      const res = await fetch("/api/create-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registration: regToStore,
          make: makeToStore,
          year,
          mileage: Number(mileage),
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

  const makeRequiredOk = mode === "manual" ? make.trim() !== "" : true;
  const canSubmit = !busy && mileage !== "" && transmission !== "" && makeRequiredOk;

  return (
    <form onSubmit={onSubmit} className="grid gap-6 max-w-lg mx-auto p-6 border bg-white rounded-lg shadow-md">
      {/* Mode switch */}
      <div className="flex gap-4 mb-6">
        <button
          type="button"
          onClick={() => setMode("reg")}
          className={`px-4 py-2 rounded-md text-sm font-semibold border ${
            mode === "reg" ? "bg-blue-600 text-white border-blue-600" : "bg-white"
          }`}
        >
          Use registration (recommended)
        </button>
        <button
          type="button"
          onClick={() => setMode("manual")}
          className={`px-4 py-2 rounded-md text-sm font-semibold border ${
            mode === "manual" ? "bg-blue-600 text-white border-blue-600" : "bg-white"
          }`}
        >
          Manual entry
        </button>
      </div>

      {/* Registration lookup */}
      {mode === "reg" && (
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2">Registration (number plate)</label>
          <div className="flex gap-3">
            <input
              className="flex-1 border px-4 py-2 rounded-md"
              value={registration}
              onChange={(e) => setRegistration(e.target.value)}
              placeholder="e.g. AB12CDE"
            />
            <button
              type="button"
              onClick={lookupReg}
              disabled={lookupBusy || registration.trim().length < 5}
              className="bg-green-600 text-white font-semibold px-6 py-2 rounded-md disabled:opacity-50"
            >
              {lookupBusy ? "Looking up..." : "Lookup"}
            </button>
          </div>

          {lookupError && <div className="mt-2 text-red-600">{lookupError}</div>}
        </div>
      )}

      {/* Make input (auto-complete) */}
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2">
          Make {mode === "manual" ? <span className="text-red-600">*</span> : null}
        </label>
        <input
          list="make-list"
          className={`w-full border px-4 py-2 rounded-md ${mode === "manual" && make.trim() === "" ? "border-red-400" : ""}`}
          value={make}
          onChange={(e) => setMake(e.target.value)}
          onBlur={() => setMake(normalizeMake(make))}
          placeholder="Start typing… (e.g. Ford)"
          required={mode === "manual"}
        />
        <datalist id="make-list">
          {MAKE_OPTIONS.map((m) => (
            <option key={m} value={m} />
          ))}
        </datalist>
      </div>

      {/* Year */}
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2">Year</label>
        <input
          className="w-full border px-4 py-2 rounded-md"
          type="number"
          value={year}
          min={1990}
          max={new Date().getFullYear()}
          onChange={(e) => setYear(parseInt(e.target.value || "0", 10))}
          required
        />
      </div>

      {/* Mileage */}
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2">Mileage</label>
        <input
          className="w-full border px-4 py-2 rounded-md"
          type="number"
          value={mileage}
          min={0}
          onChange={(e) =>
            setMileage(e.target.value === "" ? "" : parseInt(e.target.value, 10))
          }
          placeholder="Enter current mileage here"
          required
        />
      </div>

      {/* Fuel + Transmission */}
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <div>
          <label className="block text-sm font-semibold mb-2">Fuel</label>
          <select
            className="w-full border px-4 py-2 rounded-md"
            value={fuel}
            onChange={(e) => setFuel(e.target.value as Fuel)}
          >
            <option value="petrol">Petrol</option>
            <option value="diesel">Diesel</option>
            <option value="hybrid">Hybrid</option>
            <option value="ev">EV</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Transmission</label>
          <select
            className={`w-full border px-4 py-2 rounded-md ${transmission === "" ? "border-red-400" : ""}`}
            value={transmission}
            onChange={(e) => setTransmission(e.target.value as Transmission)}
            required
          >
            <option value="">Please select transmission</option>
            <option value="manual">Manual</option>
            <option value="automatic">Automatic</option>
            <option value="cvt">CVT</option>
            <option value="dct">DCT</option>
          </select>
        </div>
      </div>

      {/* Timing type */}
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2">Timing type (if known)</label>
        <select
          className="w-full border px-4 py-2 rounded-md"
          value={timingType}
          onChange={(e) => setTimingType(e.target.value as TimingType)}
        >
          <option value="unknown">Unknown</option>
          <option value="belt">Belt</option>
          <option value="chain">Chain</option>
        </select>
      </div>

      {/* Asking price */}
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2">Asking price (optional)</label>
        <input
          className="w-full border px-4 py-2 rounded-md"
          type="number"
          value={askingPrice}
          min={0}
          onChange={(e) =>
            setAskingPrice(e.target.value === "" ? "" : parseInt(e.target.value, 10))
          }
          placeholder="e.g. 8995"
        />
      </div>

      {error && <div className="text-red-600 text-sm mb-4">{error}</div>}

      <button
        disabled={!canSubmit}
        className="w-full bg-green-600 text-white font-semibold py-3 rounded-md hover:bg-green-700 disabled:opacity-50"
      >
        {busy ? "Creating…" : "Generate snapshot"}
      </button>
    </form>
  );
}