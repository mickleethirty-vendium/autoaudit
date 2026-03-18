"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ShieldIcon from "@/app/components/ShieldIcon";

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

function cleanRegistration(reg: string) {
  return reg.replace(/\s/g, "").toUpperCase();
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

export default function HomePage() {
  const router = useRouter();

  const [registration, setRegistration] = useState("");
  const [vehicle, setVehicle] = useState<LookupVehicle | null>(null);
  const [mileage, setMileage] = useState("");
  const [gearbox, setGearbox] = useState("");

  const [lookupLoading, setLookupLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLookupSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const cleaned = cleanRegistration(registration.trim());
    if (!cleaned) return;

    setLookupLoading(true);
    setError(null);
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

      setError(message);
    } finally {
      setLookupLoading(false);
    }
  }

  async function handleCreatePreview(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!vehicle) {
      setError("Vehicle details are missing.");
      return;
    }

    const year = Number(vehicle.year);
    if (!Number.isFinite(year)) {
      setError("We couldn’t determine the vehicle year from the registration lookup.");
      return;
    }

    if (!mileage.trim()) {
      setError("Please enter the vehicle mileage.");
      return;
    }

    const parsedMileage = Number(mileage.replace(/,/g, ""));
    if (!Number.isFinite(parsedMileage) || parsedMileage < 0) {
      setError("Please enter a valid mileage.");
      return;
    }

    const fuel = normaliseFuel(vehicle.fuelType);
    if (!fuel) {
      setError("We couldn’t match the fuel type for this vehicle.");
      return;
    }

    const transmission = normaliseTransmission(gearbox);
    if (!transmission) {
      setError("Please select a supported gearbox type.");
      return;
    }

    setCreateLoading(true);
    setError(null);

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

      setError(message);
      setCreateLoading(false);
    }
  }

  function resetLookup() {
    setVehicle(null);
    setMileage("");
    setGearbox("");
    setError(null);
  }

  return (
    <div className="min-h-screen bg-[var(--aa-bg)]">
      <main>
        <section className="relative overflow-hidden bg-[var(--aa-black)]">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/hero-car-road.png')" }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,0.42)_0%,rgba(10,10,10,0.16)_35%,rgba(10,10,10,0.28)_100%)]" />

          <div className="relative mx-auto flex min-h-[380px] max-w-7xl flex-col items-center justify-center px-4 py-10 text-center sm:min-h-[420px] sm:py-12 lg:min-h-[460px]">
            <h1 className="max-w-5xl text-4xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)] sm:text-5xl lg:text-6xl">
              Know the Risks Before You Buy a Used Car
            </h1>

            <p className="mt-4 max-w-3xl text-lg leading-8 text-white/92 drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)] sm:text-2xl">
              Get instant repair cost estimates and hidden risk checks
            </p>

            <div className="mt-8 w-full max-w-3xl rounded-2xl border border-white/20 bg-white/92 p-3 shadow-[0_20px_60px_rgba(0,0,0,0.20)] backdrop-blur">
              {!vehicle ? (
                <form
                  onSubmit={handleLookupSubmit}
                  className="flex flex-col gap-3 sm:flex-row"
                >
                  <input
                    type="text"
                    name="registration"
                    value={registration}
                    onChange={(e) => {
                      setRegistration(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="Enter Registration"
                    autoCapitalize="characters"
                    autoCorrect="off"
                    spellCheck={false}
                    disabled={lookupLoading}
                    className="h-14 flex-1 rounded-xl border border-slate-200 bg-white px-5 text-lg font-medium text-slate-900 placeholder:text-slate-400 focus:border-[var(--aa-red)] sm:h-16 sm:text-xl"
                  />

                  <button
                    type="submit"
                    disabled={!registration.trim() || lookupLoading}
                    className="inline-flex h-14 items-center justify-center rounded-xl border border-[var(--aa-red)] bg-[var(--aa-red)] px-8 text-lg font-bold text-white transition hover:border-[var(--aa-red-strong)] hover:bg-[var(--aa-red-strong)] disabled:opacity-50 sm:h-16 sm:text-xl"
                  >
                    {lookupLoading ? "Looking up…" : "Check My Car"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleCreatePreview} className="space-y-4 text-left">
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-[var(--aa-red)]">
                      Vehicle identified
                    </div>

                    <div className="mt-2 text-xl font-bold text-slate-900">
                      {vehicle.registration}
                      {vehicle.make ? (
                        <span className="ml-2 font-medium text-slate-600">
                          · {vehicle.make}
                          {vehicle.model ? ` ${vehicle.model}` : ""}
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
                      {vehicle.year ? <span>{vehicle.year}</span> : null}
                      {vehicle.fuelType ? <span>{vehicle.fuelType}</span> : null}
                      {vehicle.colour ? <span>{vehicle.colour}</span> : null}
                      {vehicle.motStatus ? <span>MoT: {vehicle.motStatus}</span> : null}
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-800">
                        Current mileage
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={mileage}
                        onChange={(e) => {
                          setMileage(e.target.value.replace(/[^\d,]/g, ""));
                          if (error) setError(null);
                        }}
                        placeholder="e.g. 62,000"
                        disabled={createLoading}
                        className="h-14 w-full rounded-xl border border-slate-200 bg-white px-4 text-base font-medium text-slate-900 placeholder:text-slate-400 focus:border-[var(--aa-red)]"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-800">
                        Gearbox type
                      </label>
                      <select
                        value={gearbox}
                        onChange={(e) => {
                          setGearbox(e.target.value);
                          if (error) setError(null);
                        }}
                        disabled={createLoading}
                        className="h-14 w-full rounded-xl border border-slate-200 bg-white px-4 text-base font-medium text-slate-900 focus:border-[var(--aa-red)]"
                      >
                        <option value="">Select gearbox</option>
                        <option value="manual">Manual</option>
                        <option value="automatic">Automatic</option>
                        <option value="cvt">CVT</option>
                        <option value="semi-automatic">Semi-automatic</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="submit"
                      disabled={createLoading}
                      className="inline-flex h-14 items-center justify-center rounded-xl border border-[var(--aa-red)] bg-[var(--aa-red)] px-8 text-lg font-bold text-white transition hover:border-[var(--aa-red-strong)] hover:bg-[var(--aa-red-strong)] disabled:opacity-50"
                    >
                      {createLoading ? "Building preview…" : "Continue to Free Preview"}
                    </button>

                    <button
                      type="button"
                      onClick={resetLookup}
                      disabled={createLoading}
                      className="inline-flex h-14 items-center justify-center rounded-xl border border-slate-300 bg-white px-6 text-base font-semibold text-slate-800 transition hover:bg-slate-50 disabled:opacity-50"
                    >
                      Change registration
                    </button>
                  </div>
                </form>
              )}

              <div className="mt-3 text-center sm:text-left">
                <Link
                  href="/manual-check"
                  className="text-sm font-medium text-[var(--aa-red)] transition hover:text-[var(--aa-red-strong)] hover:underline"
                >
                  Or check manually
                </Link>
              </div>

              {error ? (
                <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section className="-mt-1 border-t border-[var(--aa-silver)] bg-white">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
            <div className="grid gap-6 md:grid-cols-3 md:gap-8">
              <div className="flex items-start justify-center gap-4 text-center md:text-left">
                <ShieldIcon className="mt-1 h-12 w-12 shrink-0" />
                <div>
                  <div className="text-2xl font-extrabold tracking-tight text-[var(--aa-black)] sm:text-3xl">
                    Fast Results
                  </div>
                  <div className="mt-1 text-xl font-medium text-slate-700 sm:mt-2 sm:text-2xl">
                    Repair Estimates
                  </div>
                </div>
              </div>

              <div className="flex items-start justify-center gap-4 border-y border-[var(--aa-silver)] py-6 text-center md:border-x md:border-y-0 md:py-0 md:text-left">
                <ShieldIcon className="mt-1 h-12 w-12 shrink-0" />
                <div>
                  <div className="text-2xl font-extrabold tracking-tight text-[var(--aa-black)] sm:text-3xl">
                    UK-Specific
                  </div>
                  <div className="mt-1 text-xl font-medium text-slate-700 sm:mt-2 sm:text-2xl">
                    MoT Insights
                  </div>
                </div>
              </div>

              <div className="flex items-start justify-center gap-4 text-center md:text-left">
                <ShieldIcon className="mt-1 h-12 w-12 shrink-0" />
                <div>
                  <div className="text-2xl font-extrabold tracking-tight text-[var(--aa-black)] sm:text-3xl">
                    Trusted Reports
                  </div>
                  <div className="mt-1 text-xl font-medium text-slate-700 sm:mt-2 sm:text-2xl">
                    History Checks
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="bg-[var(--aa-bg)]">
          <div className="mx-auto max-w-7xl px-4 py-12">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-[var(--aa-silver)] bg-white p-6 shadow-sm">
                <div className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Core Report
                </div>
                <div className="mt-2 text-4xl font-extrabold tracking-tight text-black">
                  £4.99
                </div>
                <div className="mt-2 text-sm text-slate-700">
                  Detailed findings, repair exposure, seller questions and MoT
                  analysis.
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--aa-red)]/20 bg-[var(--aa-red)]/5 p-6 shadow-sm">
                <div className="text-sm font-semibold uppercase tracking-wide text-[var(--aa-red)]">
                  Full Bundle
                </div>
                <div className="mt-2 text-4xl font-extrabold tracking-tight text-black">
                  £9.99
                </div>
                <div className="mt-2 text-sm text-slate-700">
                  Core report plus HPI-style finance, write-off, stolen, mileage
                  and keeper checks.
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}