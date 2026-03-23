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
          year,
          mileage: parsedMileage,
          asking_price: parsedAskingPrice,
          fuel,
          transmission,
          timing_type: "unknown",
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
    <section className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950 text-white shadow-2xl">
        <div className="border-b border-white/10 bg-white/[0.03] px-6 py-5 sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">
            Registration check
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Check a vehicle before you buy
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">
            We’ll identify the vehicle from its registration, then ask for a
            few extra details to improve the estimate.
          </p>
        </div>

        <div className="px-6 py-6 sm:px-8 sm:py-8">
          {!vehicle ? (
            <form onSubmit={handleLookupSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="registration"
                  className="mb-2 block text-sm font-medium text-slate-200"
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
                    className="h-14 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-lg font-semibold tracking-[0.18em] text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400 focus:bg-white/[0.07]"
                  />

                  <button
                    type="submit"
                    disabled={lookupLoading}
                    className="inline-flex h-14 items-center justify-center rounded-2xl bg-sky-500 px-6 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-70 sm:min-w-[180px]"
                  >
                    {lookupLoading ? "Looking up…" : "Find vehicle"}
                  </button>
                </div>

                <div className="mt-3">
                  <Link
                    href="/manual-check"
                    className="text-sm font-medium text-sky-300 transition hover:text-sky-200 hover:underline"
                  >
                    Or check manually
                  </Link>
                </div>
              </div>

              {lookupError ? (
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {lookupError}
                </div>
              ) : null}

              {lookupLoading ? (
                <div className="rounded-2xl border border-sky-400/20 bg-sky-400/10 p-5">
                  <p className="text-sm font-semibold text-sky-100">
                    Looking up vehicle details…
                  </p>
                  <p className="mt-1 text-sm text-sky-50/80">
                    We’re checking the registration and preparing the next step.
                  </p>
                </div>
              ) : null}
            </form>
          ) : (
            <div className="space-y-6">
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">
                  Vehicle identified
                </p>

                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-slate-400">Registration</p>
                    <p className="text-lg font-semibold text-white">
                      {vehicle.registration}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-400">Vehicle</p>
                    <p className="text-lg font-semibold text-white">
                      {[vehicle.make, vehicle.model].filter(Boolean).join(" ") ||
                        (vehicle.make ?? "Vehicle found")}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-400">Year</p>
                    <p className="text-base font-medium text-white">
                      {vehicle.year || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-400">Fuel type</p>
                    <p className="text-base font-medium text-white">
                      {vehicle.fuelType || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-400">Body type</p>
                    <p className="text-base font-medium text-white">
                      {vehicle.bodyType || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-400">Colour</p>
                    <p className="text-base font-medium text-white">
                      {vehicle.colour || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-400">MoT status</p>
                    <p className="text-base font-medium text-white">
                      {vehicle.motStatus || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-400">Tax status</p>
                    <p className="text-base font-medium text-white">
                      {vehicle.taxStatus || "—"}
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleContinue} className="space-y-5">
                <div className="rounded-2xl border border-sky-400/20 bg-sky-400/10 p-4">
                  <div className="text-sm font-semibold text-sky-100">
                    Price check
                  </div>
                  <div className="mt-1 text-sm text-sky-50/80">
                    We’ll use the asking price to compare this car with typical
                    market value.
                  </div>
                  <div className="mt-3">
                    <label
                      htmlFor="askingPrice"
                      className="mb-2 block text-sm font-medium text-slate-100"
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
                      className="h-14 w-full rounded-2xl border border-sky-300/40 bg-white/10 px-4 text-base font-medium text-white outline-none transition placeholder:text-slate-300 focus:border-sky-200"
                    />
                    <p className="mt-2 text-xs text-slate-200">
                      Optional, but recommended.
                    </p>
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="mileage"
                      className="mb-2 block text-sm font-medium text-slate-200"
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
                      className="h-14 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-base font-medium text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="gearbox"
                      className="mb-2 block text-sm font-medium text-slate-200"
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
                      className="h-14 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-base font-medium text-white outline-none transition focus:border-sky-400"
                    >
                      <option value="" className="bg-slate-950 text-slate-300">
                        Select gearbox
                      </option>
                      <option value="manual" className="bg-slate-950 text-white">
                        Manual
                      </option>
                      <option value="automatic" className="bg-slate-950 text-white">
                        Automatic
                      </option>
                      <option value="cvt" className="bg-slate-950 text-white">
                        CVT
                      </option>
                      <option
                        value="semi-automatic"
                        className="bg-slate-950 text-white"
                      >
                        Semi-automatic
                      </option>
                    </select>
                  </div>
                </div>

                {continueError ? (
                  <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {continueError}
                  </div>
                ) : null}

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex h-14 items-center justify-center rounded-2xl bg-sky-500 px-6 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSubmitting ? "Building preview…" : "Continue to free preview"}
                  </button>

                  <button
                    type="button"
                    onClick={resetVehicleStep}
                    disabled={isSubmitting}
                    className="inline-flex h-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-6 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    Change registration
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}