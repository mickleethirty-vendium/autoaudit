"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

type LookupVehicle = {
  registration: string;
  make?: string | null;
  model?: string | null;
  year?: string | number | null;
  colour?: string | null;
  fuelType?: string | null;
  bodyType?: string | null;
  engineSize?: string | number | null;
  motStatus?: string | null;
  taxStatus?: string | null;
};

function normaliseRegistration(value: string) {
  return value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().trim();
}

function normaliseFuel(
  value?: string | null
): "petrol" | "diesel" | "hybrid" | "ev" | null {
  if (!value) return null;

  const v = value.trim().toLowerCase();

  if (v.includes("petrol")) return "petrol";
  if (v.includes("diesel")) return "diesel";
  if (v.includes("hybrid")) return "hybrid";
  if (v.includes("electric") || v === "ev") return "ev";

  return null;
}

function normaliseTransmission(
  value: string
): "manual" | "automatic" | "cvt" | "dct" | null {
  const v = value.trim().toLowerCase();

  if (v === "manual") return "manual";
  if (v === "automatic") return "automatic";
  if (v === "cvt") return "cvt";
  if (v === "semi-automatic") return "dct";
  if (v === "dct") return "dct";

  return null;
}

function parseOptionalPrice(value: string): number | null {
  const cleaned = value.replace(/[^\d.]/g, "").trim();
  if (!cleaned) return null;

  const parsed = Number(cleaned);
  if (!Number.isFinite(parsed) || parsed < 0) return null;

  return parsed;
}

function normaliseEngineSize(value?: string | number | null): string | null {
  if (value === null || value === undefined || value === "") return null;

  if (typeof value === "number" && Number.isFinite(value)) {
    if (value >= 100) {
      return (value / 1000).toFixed(1);
    }
    return value.toFixed(1);
  }

  if (typeof value !== "string") return null;

  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return null;

  const numeric = Number(trimmed.replace(/[^\d.]/g, ""));
  if (!Number.isFinite(numeric)) return trimmed;

  if (numeric >= 100) {
    return (numeric / 1000).toFixed(1);
  }

  return numeric.toFixed(1);
}

export default function CheckForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialReg = useMemo(() => {
    return normaliseRegistration(searchParams.get("registration") || "");
  }, [searchParams]);

  const initialAskingPrice = useMemo(() => {
    const raw = searchParams.get("asking_price") || "";
    return raw.replace(/[^\d,.]/g, "");
  }, [searchParams]);

  const [registration, setRegistration] = useState(initialReg);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [vehicle, setVehicle] = useState<LookupVehicle | null>(null);

  const [mileage, setMileage] = useState("");
  const [askingPrice, setAskingPrice] = useState(initialAskingPrice);
  const [gearbox, setGearbox] = useState("");
  const [continueError, setContinueError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasAutoLookupRef = useRef(false);

  useEffect(() => {
    if (!initialReg) return;
    setRegistration(initialReg);
  }, [initialReg]);

  useEffect(() => {
    setAskingPrice(initialAskingPrice);
  }, [initialAskingPrice]);

  async function lookupVehicle(reg: string) {
    const cleaned = normaliseRegistration(reg);

    if (!cleaned) {
      setLookupError("Enter a valid registration.");
      return;
    }

    setLookupLoading(true);
    setLookupError(null);
    setContinueError(null);
    setVehicle(null);

    try {
      const response = await fetch("/api/lookup-reg", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          registration: cleaned,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error || "We couldn’t find vehicle details for that registration."
        );
      }

      setVehicle({
        registration:
          typeof data?.registration === "string" ? data.registration : cleaned,
        make: data?.make ?? null,
        model: data?.model ?? null,
        year: data?.year ?? data?.yearOfManufacture ?? null,
        colour: data?.colour ?? null,
        fuelType: data?.fuelType ?? null,
        bodyType: data?.bodyType ?? null,
        engineSize: data?.engineSize ?? data?.engineCapacity ?? null,
        motStatus: data?.motStatus ?? null,
        taxStatus: data?.taxStatus ?? null,
      });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong while looking up that registration.";

      setLookupError(message);
    } finally {
      setLookupLoading(false);
    }
  }

  async function handleLookupSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await lookupVehicle(registration);
  }

  async function handleContinue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!vehicle) {
      setContinueError("Vehicle details are missing.");
      return;
    }

    const year = Number(vehicle.year);
    if (!Number.isFinite(year)) {
      setContinueError(
        "We couldn’t determine the vehicle year from the registration lookup."
      );
      return;
    }

    if (!mileage.trim()) {
      setContinueError("Please enter the vehicle mileage.");
      return;
    }

    const parsedMileage = Number(mileage.replace(/,/g, ""));
    if (!Number.isFinite(parsedMileage) || parsedMileage < 0) {
      setContinueError("Please enter a valid mileage.");
      return;
    }

    const parsedAskingPrice = parseOptionalPrice(askingPrice);
    if (
      askingPrice.trim() &&
      (parsedAskingPrice === null || parsedAskingPrice > 1000000)
    ) {
      setContinueError("Please enter a valid asking price.");
      return;
    }

    const fuel = normaliseFuel(vehicle.fuelType);
    if (!fuel) {
      setContinueError("We couldn’t match the fuel type for this vehicle.");
      return;
    }

    const transmission = normaliseTransmission(gearbox);
    if (!transmission) {
      setContinueError("Please select a supported gearbox type.");
      return;
    }

    const engineSize = normaliseEngineSize(vehicle.engineSize);

    setIsSubmitting(true);
    setContinueError(null);

    try {
      const response = await fetch("/api/create-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          registration: vehicle.registration,
          make: vehicle.make ?? undefined,
          model: vehicle.model ?? undefined,
          year,
          mileage: parsedMileage,
          asking_price: parsedAskingPrice,
          fuel,
          transmission,
          engine_size: engineSize ?? undefined,
          timing_type: "unknown",
          vehicleIdentity: {
            make: vehicle.make ?? undefined,
            model: vehicle.model ?? undefined,
            engine_size: engineSize ?? undefined,
            fuel,
            transmission,
            year,
          },
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "We couldn’t build the preview right now.");
      }

      if (!data?.report_id) {
        throw new Error("Preview ID was not returned.");
      }

      router.push(`/preview/${data.report_id}`);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong while creating your preview.";

      setContinueError(message);
      setIsSubmitting(false);
    }
  }

  function resetVehicleStep() {
    setVehicle(null);
    setLookupError(null);
    setContinueError(null);
    setMileage("");
    setGearbox("");
  }

  useEffect(() => {
    if (!initialReg) return;
    if (hasAutoLookupRef.current) return;

    hasAutoLookupRef.current = true;
    void lookupVehicle(initialReg);
  }, [initialReg]);

  return (
    <div className="w-full">
      {!vehicle ? (
        <form onSubmit={handleLookupSubmit} className="space-y-4 text-left">
          <div>
            <label
              htmlFor="registration"
              className="mb-2 block text-sm font-semibold text-slate-800"
            >
              Vehicle registration
            </label>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                id="registration"
                name="registration"
                type="text"
                inputMode="text"
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
                maxLength={8}
                value={registration}
                onChange={(e) => {
                  setRegistration(normaliseRegistration(e.target.value));
                  if (lookupError) setLookupError(null);
                }}
                disabled={lookupLoading}
                placeholder="AB12CDE"
                className="h-14 w-full rounded-xl border border-slate-200 bg-white px-4 text-lg font-semibold tracking-[0.18em] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[var(--aa-red)]"
              />

              <button
                type="submit"
                disabled={lookupLoading}
                className="inline-flex h-14 items-center justify-center rounded-xl border border-[var(--aa-red)] bg-[var(--aa-red)] px-6 text-sm font-semibold text-white transition hover:border-[var(--aa-red-strong)] hover:bg-[var(--aa-red-strong)] disabled:cursor-not-allowed disabled:opacity-70 sm:min-w-[180px]"
              >
                {lookupLoading ? "Looking up…" : "Find vehicle"}
              </button>
            </div>

            <div className="mt-3">
              <Link
                href="/manual-check"
                className="text-sm font-medium text-[var(--aa-red)] transition hover:text-[var(--aa-red-strong)] hover:underline"
              >
                Or check manually
              </Link>
            </div>
          </div>

          {lookupError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {lookupError}
            </div>
          ) : null}

          {lookupLoading ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">
                Looking up vehicle details…
              </p>
              <p className="mt-1 text-sm text-slate-600">
                We’re checking the registration and preparing the next step.
              </p>
            </div>
          ) : null}
        </form>
      ) : (
        <div className="space-y-5 text-left">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--aa-red)]">
              Vehicle identified
            </p>

            <div className="mt-2 text-xl font-bold text-slate-900">
              {vehicle.registration}
              {vehicle.make ? (
                <span className="ml-2 font-medium text-slate-600">
                  · {vehicle.make}
                  {vehicle.model ? ` ${vehicle.model}` : ""}
                </span>
              ) : null}
            </div>

            <div className="mt-2 grid gap-x-4 gap-y-2 text-sm text-slate-600 sm:grid-cols-2">
              <div>{vehicle.year || "—"}</div>
              <div>{vehicle.fuelType || "—"}</div>
              <div>{vehicle.bodyType || "—"}</div>
              <div>{vehicle.colour || "—"}</div>
              <div>MoT: {vehicle.motStatus || "—"}</div>
              <div>Tax: {vehicle.taxStatus || "—"}</div>
            </div>
          </div>

          <form onSubmit={handleContinue} className="space-y-5">
            <div className="rounded-xl border border-[var(--aa-red)]/15 bg-[var(--aa-red)]/5 p-4">
              <div className="text-sm font-semibold text-slate-900">
                Price check
              </div>
              <div className="mt-1 text-sm text-slate-700">
                We’ll use the asking price to compare this car with typical market
                value.
              </div>
              <div className="mt-3">
                <label
                  htmlFor="askingPrice"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Asking price
                </label>
                <input
                  id="askingPrice"
                  name="askingPrice"
                  type="text"
                  inputMode="decimal"
                  value={askingPrice}
                  onChange={(e) => {
                    setAskingPrice(e.target.value.replace(/[^\d,.]/g, ""));
                    if (continueError) setContinueError(null);
                  }}
                  placeholder="Optional, e.g. 7,495"
                  disabled={isSubmitting}
                  className="h-14 w-full rounded-xl border border-slate-200 bg-white px-4 text-base font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[var(--aa-red)]"
                />
                <p className="mt-2 text-xs text-slate-600">
                  Optional, but recommended.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="mileage"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Current mileage
                </label>
                <input
                  id="mileage"
                  name="mileage"
                  type="text"
                  inputMode="numeric"
                  value={mileage}
                  onChange={(e) => {
                    setMileage(e.target.value.replace(/[^\d,]/g, ""));
                    if (continueError) setContinueError(null);
                  }}
                  placeholder="e.g. 62,000"
                  disabled={isSubmitting}
                  className="h-14 w-full rounded-xl border border-slate-200 bg-white px-4 text-base font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[var(--aa-red)]"
                />
              </div>

              <div>
                <label
                  htmlFor="gearbox"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Gearbox type
                </label>
                <select
                  id="gearbox"
                  name="gearbox"
                  value={gearbox}
                  onChange={(e) => {
                    setGearbox(e.target.value);
                    if (continueError) setContinueError(null);
                  }}
                  disabled={isSubmitting}
                  className="h-14 w-full rounded-xl border border-slate-200 bg-white px-4 text-base font-medium text-slate-900 outline-none transition focus:border-[var(--aa-red)]"
                >
                  <option value="">Select gearbox</option>
                  <option value="manual">Manual</option>
                  <option value="automatic">Automatic</option>
                  <option value="cvt">CVT</option>
                  <option value="semi-automatic">Semi-automatic</option>
                </select>
              </div>
            </div>

            {continueError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {continueError}
              </div>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-14 items-center justify-center rounded-xl border border-[var(--aa-red)] bg-[var(--aa-red)] px-6 text-sm font-semibold text-white transition hover:border-[var(--aa-red-strong)] hover:bg-[var(--aa-red-strong)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Building preview…" : "Continue to free preview"}
              </button>

              <button
                type="button"
                onClick={resetVehicleStep}
                disabled={isSubmitting}
                className="inline-flex h-14 items-center justify-center rounded-xl border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Change registration
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}