"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ShieldIcon from "@/app/components/ShieldIcon";
import { getModelsForMake, vehicleMakes } from "@/lib/vehicleOptions";

type FuelOption = "petrol" | "diesel" | "hybrid" | "ev" | "";
type GearboxOption = "manual" | "automatic" | "cvt" | "dct" | "";

function normaliseEngineSize(value: string) {
  return value.replace(/[^\d.]/g, "").trim();
}

function normaliseText(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function titleCase(value: string) {
  return value
    .split(" ")
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(" ");
}

export default function ManualCheckPage() {
  const router = useRouter();

  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [fuelType, setFuelType] = useState<FuelOption>("");
  const [bodyType, setBodyType] = useState("");
  const [engineSize, setEngineSize] = useState("");
  const [mileage, setMileage] = useState("");
  const [gearbox, setGearbox] = useState<GearboxOption>("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const normalisedMake = useMemo(() => normaliseText(make), [make]);
  const availableModels = useMemo(
    () => getModelsForMake(normalisedMake),
    [normalisedMake]
  );
  const normalisedModel = useMemo(() => normaliseText(model), [model]);

  const makeIsValid =
    !normalisedMake ||
    vehicleMakes.includes(normalisedMake as (typeof vehicleMakes)[number]);

  const modelIsValid =
    !normalisedModel || availableModels.includes(normalisedModel);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanedMake = normaliseText(make);
    const cleanedModel = normaliseText(model);
    const cleanedBodyType = bodyType.trim();
    const parsedEngineSize = normaliseEngineSize(engineSize);

    if (!cleanedMake) {
      setError("Please select the vehicle make.");
      return;
    }

    if (!vehicleMakes.includes(cleanedMake as (typeof vehicleMakes)[number])) {
      setError("Please select a valid make from the list.");
      return;
    }

    if (!cleanedModel) {
      setError("Please select the vehicle model.");
      return;
    }

    const modelsForMake = getModelsForMake(cleanedMake);
    if (!modelsForMake.includes(cleanedModel)) {
      setError("Please select a valid model for the chosen make.");
      return;
    }

    if (!year.trim()) {
      setError("Please enter the vehicle year.");
      return;
    }

    const parsedYear = Number(year);
    if (
      !Number.isFinite(parsedYear) ||
      parsedYear < 1990 ||
      parsedYear > new Date().getFullYear()
    ) {
      setError("Please enter a valid year.");
      return;
    }

    if (!fuelType) {
      setError("Please select the fuel type.");
      return;
    }

    if (!parsedEngineSize) {
      setError("Please enter a valid engine size.");
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

    if (!gearbox) {
      setError("Please select the gearbox type.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/create-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          make: cleanedMake,
          model: cleanedModel,
          year: parsedYear,
          fuel: fuelType,
          engine_size: parsedEngineSize,
          body_type: cleanedBodyType || undefined,
          mileage: parsedMileage,
          transmission: gearbox,
          timing_type: "unknown",
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error || "We couldn’t build the preview right now."
        );
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
      setIsSubmitting(false);
    }
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
              Check a Used Car Manually
            </h1>

            <p className="mt-4 max-w-3xl text-lg leading-8 text-white/92 drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)] sm:text-2xl">
              Enter the key details yourself and generate a free snapshot
            </p>

            <div className="mt-8 w-full max-w-4xl rounded-2xl border border-white/20 bg-white/92 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.20)] backdrop-blur">
              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-800">
                      Make
                    </label>
                    <select
                      value={make}
                      onChange={(e) => {
                        const nextMake = e.target.value;
                        setMake(nextMake);
                        setModel("");
                        if (error) setError(null);
                      }}
                      disabled={isSubmitting}
                      className="h-14 w-full rounded-xl border border-slate-200 bg-white px-4 text-base font-medium text-slate-900 focus:border-[var(--aa-red)]"
                    >
                      <option value="">Select make</option>
                      {vehicleMakes.map((option) => (
                        <option key={option} value={option}>
                          {titleCase(option)}
                        </option>
                      ))}
                    </select>
                    {!makeIsValid ? (
                      <p className="mt-2 text-xs text-red-600">
                        Please choose a valid make from the list.
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-800">
                      Model
                    </label>
                    <select
                      value={model}
                      onChange={(e) => {
                        setModel(e.target.value);
                        if (error) setError(null);
                      }}
                      disabled={isSubmitting || !normalisedMake}
                      className="h-14 w-full rounded-xl border border-slate-200 bg-white px-4 text-base font-medium text-slate-900 focus:border-[var(--aa-red)] disabled:bg-slate-100 disabled:text-slate-500"
                    >
                      <option value="">
                        {normalisedMake ? "Select model" : "Select make first"}
                      </option>
                      {availableModels.map((option) => (
                        <option key={option} value={option}>
                          {titleCase(option)}
                        </option>
                      ))}
                    </select>
                    {!modelIsValid ? (
                      <p className="mt-2 text-xs text-red-600">
                        Please choose a valid model for the selected make.
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-800">
                      Year
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={year}
                      onChange={(e) => {
                        setYear(e.target.value.replace(/[^\d]/g, ""));
                        if (error) setError(null);
                      }}
                      placeholder="e.g. 2018"
                      disabled={isSubmitting}
                      className="h-14 w-full rounded-xl border border-slate-200 bg-white px-4 text-base font-medium text-slate-900 placeholder:text-slate-400 focus:border-[var(--aa-red)]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-800">
                      Fuel type
                    </label>
                    <select
                      value={fuelType}
                      onChange={(e) => {
                        setFuelType(e.target.value as FuelOption);
                        if (error) setError(null);
                      }}
                      disabled={isSubmitting}
                      className="h-14 w-full rounded-xl border border-slate-200 bg-white px-4 text-base font-medium text-slate-900 focus:border-[var(--aa-red)]"
                    >
                      <option value="">Select fuel type</option>
                      <option value="petrol">Petrol</option>
                      <option value="diesel">Diesel</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="ev">Electric</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-800">
                      Engine size
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={engineSize}
                      onChange={(e) => {
                        setEngineSize(normaliseEngineSize(e.target.value));
                        if (error) setError(null);
                      }}
                      placeholder="e.g. 1.0 or 999"
                      disabled={isSubmitting}
                      className="h-14 w-full rounded-xl border border-slate-200 bg-white px-4 text-base font-medium text-slate-900 placeholder:text-slate-400 focus:border-[var(--aa-red)]"
                    />
                    <p className="mt-2 text-xs text-slate-600">
                      Enter litres or cc. Both formats work.
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-800">
                      Body type
                    </label>
                    <input
                      type="text"
                      value={bodyType}
                      onChange={(e) => {
                        setBodyType(e.target.value);
                        if (error) setError(null);
                      }}
                      placeholder="e.g. Hatchback"
                      disabled={isSubmitting}
                      className="h-14 w-full rounded-xl border border-slate-200 bg-white px-4 text-base font-medium text-slate-900 placeholder:text-slate-400 focus:border-[var(--aa-red)]"
                    />
                  </div>

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
                      disabled={isSubmitting}
                      className="h-14 w-full rounded-xl border border-slate-200 bg-white px-4 text-base font-medium text-slate-900 placeholder:text-slate-400 focus:border-[var(--aa-red)]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-slate-800">
                      Gearbox type
                    </label>
                    <select
                      value={gearbox}
                      onChange={(e) => {
                        setGearbox(e.target.value as GearboxOption);
                        if (error) setError(null);
                      }}
                      disabled={isSubmitting}
                      className="h-14 w-full rounded-xl border border-slate-200 bg-white px-4 text-base font-medium text-slate-900 focus:border-[var(--aa-red)]"
                    >
                      <option value="">Select gearbox</option>
                      <option value="manual">Manual</option>
                      <option value="automatic">Automatic</option>
                      <option value="cvt">CVT</option>
                      <option value="dct">Semi-automatic / DCT</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex h-14 items-center justify-center rounded-xl border border-[var(--aa-red)] bg-[var(--aa-red)] px-8 text-lg font-bold text-white transition hover:border-[var(--aa-red-strong)] hover:bg-[var(--aa-red-strong)] disabled:opacity-50"
                  >
                    {isSubmitting ? "Building preview…" : "Continue to Free Preview"}
                  </button>

                  <Link
                    href="/"
                    className="inline-flex h-14 items-center justify-center rounded-xl border border-slate-300 bg-white px-6 text-base font-semibold text-slate-800 transition hover:bg-slate-50"
                  >
                    Back to registration check
                  </Link>
                </div>
              </form>

              <div className="mt-3 text-center sm:text-left">
                <Link
                  href="/"
                  className="text-sm font-medium text-[var(--aa-red)] transition hover:text-[var(--aa-red-strong)] hover:underline"
                >
                  Or check by registration
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