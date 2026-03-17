"use client";

import { useRef, useState } from "react";

type Fuel = "petrol" | "diesel" | "hybrid" | "ev";
type Transmission = "" | "manual" | "automatic" | "cvt" | "dct";
type TimingType = "belt" | "chain" | "unknown";

// Keep this list reasonably broad for UK market.
const MAKE_OPTIONS = [
  "Abarth",
  "Alfa Romeo",
  "Aston Martin",
  "Audi",
  "Bentley",
  "BMW",
  "Bugatti",
  "Citroen",
  "Cupra",
  "Dacia",
  "DS",
  "Ferrari",
  "Fiat",
  "Ford",
  "Honda",
  "Hyundai",
  "Jaguar",
  "Jeep",
  "Kia",
  "Lamborghini",
  "Land Rover",
  "Lexus",
  "Lotus",
  "Maserati",
  "Mazda",
  "McLaren",
  "Mercedes-Benz",
  "MG",
  "MINI",
  "Mitsubishi",
  "Nissan",
  "Peugeot",
  "Polestar",
  "Porsche",
  "Renault",
  "Rolls-Royce",
  "SEAT",
  "Skoda",
  "Smart",
  "Subaru",
  "Suzuki",
  "Tesla",
  "Toyota",
  "Vauxhall",
  "Volkswagen",
  "Volvo",
  "Other",
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

function inputClass(hasError = false) {
  return [
    "w-full rounded-xl border px-4 py-3 text-slate-900 outline-none transition",
    hasError
      ? "border-[var(--aa-red)] focus:border-[var(--aa-red)]"
      : "border-[var(--aa-silver)] focus:border-slate-400",
  ].join(" ");
}

export default function CheckForm() {
  const [mode, setMode] = useState<"reg" | "manual">("reg");

  const mileageRef = useRef<HTMLInputElement | null>(null);

  const [registration, setRegistration] = useState<string>("");
  const [lookupBusy, setLookupBusy] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [lookupResult, setLookupResult] = useState<any | null>(null);

  const [make, setMake] = useState<string>("");
  const [year, setYear] = useState<number>(2016);
  const [mileage, setMileage] = useState<number | "">("");
  const [fuel, setFuel] = useState<Fuel>("petrol");
  const [transmission, setTransmission] = useState<Transmission>("");
  const [timingType, setTimingType] = useState<TimingType>("unknown");
  const [askingPrice, setAskingPrice] = useState<number | "">("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  async function lookupReg() {
    const trimmed = registration.trim();
    if (trimmed.length < 5) return;

    setLookupBusy(true);
    setLookupError(null);
    setLookupResult(null);

    try {
      const res = await fetch("/api/lookup-reg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registration: trimmed }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Lookup failed");

      setLookupResult(data);

      if (data?.yearOfManufacture) setYear(Number(data.yearOfManufacture));
      if (data?.fuelType) setFuel(mapDvlaFuelToFuel(data.fuelType));
      if (data?.make) setMake(normalizeMake(String(data.make)));

      setMileage("");
      setTransmission("");

      setTimeout(() => {
        mileageRef.current?.focus();
      }, 0);
    } catch (e: any) {
      setLookupError(e?.message ?? "Lookup failed");
    } finally {
      setLookupBusy(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAttemptedSubmit(true);
    setBusy(true);
    setError(null);

    try {
      const makeNormalized = normalizeMake(make);

      if (mode === "manual" && makeNormalized.trim() === "") {
        throw new Error(
          "Please select the vehicle make (e.g. Ford, BMW, Toyota)."
        );
      }

      if (mileage === "" || !Number.isFinite(Number(mileage))) {
        throw new Error("Please enter the current mileage.");
      }

      if (transmission === "") {
        throw new Error("Please select the transmission type.");
      }

      const regToStore =
        mode === "reg" && registration.trim()
          ? cleanRegistration(registration.trim())
          : null;

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

  function handleRegistrationKeyDown(
    e: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!lookupBusy && registration.trim().length >= 5) {
        void lookupReg();
      }
    }
  }

  const makeRequiredOk = mode === "manual" ? make.trim() !== "" : true;
  const mileageRequiredOk = mileage !== "";
  const transmissionRequiredOk = transmission !== "";
  const canSubmit =
    !busy && mileageRequiredOk && transmissionRequiredOk && makeRequiredOk;

  const showMakeError = attemptedSubmit && mode === "manual" && make.trim() === "";
  const showMileageError = attemptedSubmit && mileage === "";
  const showTransmissionError = attemptedSubmit && transmission === "";

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto grid max-w-lg gap-6 rounded-2xl border border-[var(--aa-silver)] bg-white p-6 shadow-sm"
    >
      <div>
        <div className="mb-2 text-sm font-semibold text-slate-900">
          Choose how you want to start
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setMode("reg")}
            className={[
              "rounded-xl border px-4 py-2 text-sm font-semibold transition",
              mode === "reg"
                ? "border-black bg-black text-white"
                : "border-[var(--aa-silver)] bg-white text-slate-700 hover:bg-slate-50",
            ].join(" ")}
          >
            Use registration
          </button>

          <button
            type="button"
            onClick={() => setMode("manual")}
            className={[
              "rounded-xl border px-4 py-2 text-sm font-semibold transition",
              mode === "manual"
                ? "border-black bg-black text-white"
                : "border-[var(--aa-silver)] bg-white text-slate-700 hover:bg-slate-50",
            ].join(" ")}
          >
            Manual entry
          </button>
        </div>

        <div className="mt-2 text-xs text-slate-600">
          Registration lookup is the fastest route if you have the number plate.
        </div>
      </div>

      {mode === "reg" && (
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-900">
            Registration (number plate)
          </label>

          <div className="flex gap-3">
            <input
              className={inputClass(false)}
              value={registration}
              onChange={(e) => setRegistration(e.target.value)}
              onKeyDown={handleRegistrationKeyDown}
              placeholder="e.g. AB12CDE"
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
            />

            <button
              type="button"
              onClick={lookupReg}
              disabled={lookupBusy || registration.trim().length < 5}
              className="rounded-xl bg-[var(--aa-red)] px-6 py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {lookupBusy ? "Looking up..." : "Lookup"}
            </button>
          </div>

          {lookupError ? (
            <div className="mt-2 text-sm text-[var(--aa-red)]">
              {lookupError}
            </div>
          ) : null}

          {lookupResult ? (
            <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
              Vehicle details found. Check the fields below, then enter mileage
              and transmission to continue.
            </div>
          ) : (
            <div className="mt-2 text-xs text-slate-500">
              Press Enter or click Lookup to pull in available vehicle details.
            </div>
          )}
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-900">
          Make {mode === "manual" ? <span className="text-[var(--aa-red)]">*</span> : null}
        </label>

        <input
          list="make-list"
          className={inputClass(showMakeError)}
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

        {showMakeError ? (
          <div className="mt-2 text-xs text-[var(--aa-red)]">
            Please enter the vehicle make.
          </div>
        ) : null}
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-900">
          Year
        </label>
        <input
          className={inputClass(false)}
          type="number"
          value={year}
          min={1990}
          max={new Date().getFullYear()}
          onChange={(e) => {
            const next = parseInt(e.target.value || "0", 10);
            setYear(Number.isFinite(next) ? next : new Date().getFullYear());
          }}
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-900">
          Mileage <span className="text-[var(--aa-red)]">*</span>
        </label>
        <input
          ref={mileageRef}
          className={inputClass(showMileageError)}
          type="number"
          value={mileage}
          min={0}
          onChange={(e) =>
            setMileage(e.target.value === "" ? "" : parseInt(e.target.value, 10))
          }
          placeholder="Enter current mileage"
          required
        />

        {showMileageError ? (
          <div className="mt-2 text-xs text-[var(--aa-red)]">
            Please enter the current mileage.
          </div>
        ) : null}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-900">
            Fuel
          </label>
          <select
            className={inputClass(false)}
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
          <label className="mb-2 block text-sm font-semibold text-slate-900">
            Transmission <span className="text-[var(--aa-red)]">*</span>
          </label>
          <select
            className={inputClass(showTransmissionError)}
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

          {showTransmissionError ? (
            <div className="mt-2 text-xs text-[var(--aa-red)]">
              Please select the transmission type.
            </div>
          ) : null}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-900">
          Timing type (if known)
        </label>
        <select
          className={inputClass(false)}
          value={timingType}
          onChange={(e) => setTimingType(e.target.value as TimingType)}
        >
          <option value="unknown">Unknown</option>
          <option value="belt">Belt</option>
          <option value="chain">Chain</option>
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-900">
          Asking price (optional)
        </label>
        <input
          className={inputClass(false)}
          type="number"
          value={askingPrice}
          min={0}
          onChange={(e) =>
            setAskingPrice(e.target.value === "" ? "" : parseInt(e.target.value, 10))
          }
          placeholder="e.g. 8995"
        />
      </div>

      {error ? (
        <div className="rounded-xl border border-[var(--aa-red)]/20 bg-[var(--aa-red)]/5 px-4 py-3 text-sm text-[var(--aa-red)]">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full rounded-xl bg-[var(--aa-red)] py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {busy ? "Generating snapshot..." : "Generate free snapshot"}
      </button>

      <div className="rounded-xl border border-[var(--aa-silver)] bg-slate-50/70 p-4 text-sm text-slate-700">
        <div className="font-semibold text-black">What you’ll see next</div>
        <div className="mt-2 grid gap-1">
          <div>• Estimated near-term repair exposure</div>
          <div>• Risk indicators and confidence score</div>
          <div>• MoT-backed warning signals</div>
          <div>• Option to unlock the full report if needed</div>
        </div>
      </div>
    </form>
  );
}