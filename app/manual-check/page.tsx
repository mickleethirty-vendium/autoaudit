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

function FieldHint({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "required";
}) {
  return (
    <p
      className={`mt-1.5 text-[11px] leading-5 ${
        tone === "required" ? "text-slate-700" : "text-slate-600"
      }`}
    >
      {children}
    </p>
  );
}

function FeatureCard({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="rounded-[1.2rem] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <ShieldIcon className="mt-0.5 h-9 w-9 shrink-0" />
        <div>
          <div className="text-base font-extrabold tracking-tight text-[var(--aa-black)]">
            {title}
          </div>
          <div className="mt-0.5 text-sm leading-5 text-slate-700">
            {subtitle}
          </div>
        </div>
      </div>
    </div>
  );
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
        <section className="mx-auto mt-3 max-w-7xl px-3 sm:px-4">
          <div className="relative overflow-hidden rounded-[1.6rem] bg-[var(--aa-black)] shadow-[0_16px_48px_rgba(15,23,42,0.12)]">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url('/hero-car-road.png')" }}
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,0.48)_0%,rgba(10,10,10,0.18)_34%,rgba(10,10,10,0.34)_100%)]" />

            <div className="relative mx-auto flex min-h-[320px] max-w-7xl flex-col items-center justify-center px-4 py-8 text-center sm:min-h-[360px] sm:py-10 lg:min-h-[400px]">
              <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/85">
                Manual vehicle check
              </div>

              <h1 className="mt-3 max-w-5xl text-3xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)] sm:text-4xl lg:text-5xl">
                Check a used car manually
              </h1>

              <p className="mt-3 max-w-3xl text-base leading-6 text-white/92 drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)] sm:text-lg">
                Enter the key details yourself and generate a free snapshot.
              </p>

              <div className="mt-5 grid w-full max-w-4xl grid-cols-1 gap-2 sm:grid-cols-3">
                <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 text-left text-white backdrop-blur">
                  <div className="text-sm font-semibold">Make and model</div>
                  <div className="mt-0.5 text-xs leading-5 text-white/80">
                    Used to match the right vehicle profile
                  </div>
                </div>
                <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 text-left text-white backdrop-blur">
                  <div className="text-sm font-semibold">Specs and mileage</div>
                  <div className="mt-0.5 text-xs leading-5 text-white/80">
                    Helps estimate risk and wear more accurately
                  </div>
                </div>
                <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 text-left text-white backdrop-blur">
                  <div className="text-sm font-semibold">Free snapshot</div>
                  <div className="mt-0.5 text-xs leading-5 text-white/80">
                    Get a quick risk view before unlocking more
                  </div>
                </div>
              </div>

              <div className="mt-5 w-full max-w-4xl rounded-2xl border border-white/20 bg-white/94 p-3 shadow-[0_18px_50px_rgba(0,0,0,0.18)] backdrop-blur">
                <div className="mb-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-left">
                  <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                    Before you continue
                  </div>
                  <div className="mt-1 text-sm leading-5 text-slate-700">
                    Fill in the required details as accurately as you can. This
                    improves the quality of the risk snapshot.
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3 text-left">
                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <div className="mb-3">
                      <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                        Vehicle details
                      </div>
                      <div className="mt-0.5 text-sm font-semibold text-slate-950">
                        Confirm the vehicle profile
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-slate-800">
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
                          className="h-13 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 focus:border-[var(--aa-red)]"
                        >
                          <option value="">Select make</option>
                          {vehicleMakes.map((option) => (
                            <option key={option} value={option}>
                              {titleCase(option)}
                            </option>
                          ))}
                        </select>
                        {!makeIsValid ? (
                          <p className="mt-1.5 text-[11px] text-red-600">
                            Please choose a valid make from the list.
                          </p>
                        ) : (
                          <FieldHint tone="required">Required</FieldHint>
                        )}
                      </div>

                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-slate-800">
                          Model
                        </label>
                        <select
                          value={model}
                          onChange={(e) => {
                            setModel(e.target.value);
                            if (error) setError(null);
                          }}
                          disabled={isSubmitting || !normalisedMake}
                          className="h-13 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 focus:border-[var(--aa-red)] disabled:bg-slate-100 disabled:text-slate-500"
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
                          <p className="mt-1.5 text-[11px] text-red-600">
                            Please choose a valid model for the selected make.
                          </p>
                        ) : (
                          <FieldHint tone="required">Required</FieldHint>
                        )}
                      </div>

                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-slate-800">
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
                          className="h-13 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-[var(--aa-red)]"
                        />
                        <FieldHint tone="required">Required</FieldHint>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-slate-800">
                          Fuel type
                        </label>
                        <select
                          value={fuelType}
                          onChange={(e) => {
                            setFuelType(e.target.value as FuelOption);
                            if (error) setError(null);
                          }}
                          disabled={isSubmitting}
                          className="h-13 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 focus:border-[var(--aa-red)]"
                        >
                          <option value="">Select fuel type</option>
                          <option value="petrol">Petrol</option>
                          <option value="diesel">Diesel</option>
                          <option value="hybrid">Hybrid</option>
                          <option value="ev">Electric</option>
                        </select>
                        <FieldHint tone="required">Required</FieldHint>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-slate-800">
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
                          className="h-13 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-[var(--aa-red)]"
                        />
                        <FieldHint tone="required">
                          Required — litres or cc both work.
                        </FieldHint>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-slate-800">
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
                          className="h-13 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-[var(--aa-red)]"
                        />
                        <FieldHint>Optional</FieldHint>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <div className="mb-3">
                      <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                        Snapshot inputs
                      </div>
                      <div className="mt-0.5 text-sm font-semibold text-slate-950">
                        Add the details used in your risk estimate
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-slate-800">
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
                          className="h-13 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-[var(--aa-red)]"
                        />
                        <FieldHint tone="required">Required</FieldHint>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-slate-800">
                          Gearbox type
                        </label>
                        <select
                          value={gearbox}
                          onChange={(e) => {
                            setGearbox(e.target.value as GearboxOption);
                            if (error) setError(null);
                          }}
                          disabled={isSubmitting}
                          className="h-13 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 focus:border-[var(--aa-red)]"
                        >
                          <option value="">Select gearbox</option>
                          <option value="manual">Manual</option>
                          <option value="automatic">Automatic</option>
                          <option value="cvt">CVT</option>
                          <option value="dct">Semi-automatic / DCT</option>
                        </select>
                        <FieldHint tone="required">Required</FieldHint>
                      </div>
                    </div>
                  </div>

                  {error ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                      {error}
                    </div>
                  ) : null}

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                      What you’ll get next
                    </div>
                    <div className="mt-1 grid gap-1 text-sm leading-5 text-slate-700">
                      <div>• Free risk snapshot</div>
                      <div>• Repair exposure estimate</div>
                      <div>• A clearer basis for your next decision</div>
                      <div>• Option to unlock the full report afterwards</div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5 sm:flex-row">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex h-13 items-center justify-center rounded-xl border border-[var(--aa-red)] bg-[var(--aa-red)] px-6 text-sm font-semibold text-white transition hover:border-[var(--aa-red-strong)] hover:bg-[var(--aa-red-strong)] disabled:opacity-50"
                    >
                      {isSubmitting ? "Building preview…" : "Continue to free preview"}
                    </button>

                    <Link
                      href="/"
                      className="inline-flex h-13 items-center justify-center rounded-xl border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                    >
                      Back to registration check
                    </Link>
                  </div>
                </form>

                <div className="mt-2.5 text-center sm:text-left">
                  <Link
                    href="/"
                    className="text-sm font-medium text-[var(--aa-red)] transition hover:text-[var(--aa-red-strong)] hover:underline"
                  >
                    Or check by registration
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-4 max-w-7xl px-3 sm:px-4">
          <div className="grid gap-3 md:grid-cols-3">
            <FeatureCard
              title="Fast snapshot"
              subtitle="See likely repair exposure quickly"
            />
            <FeatureCard
              title="MoT insight"
              subtitle="Spot repeat advisories and history patterns"
            />
            <FeatureCard
              title="History checks"
              subtitle="Add finance, write-off and keeper signals"
            />
          </div>
        </section>

        <section className="mx-auto mt-4 max-w-7xl px-3 pb-6 sm:px-4 sm:pb-8">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-[1.25rem] border border-[var(--aa-silver)] bg-white p-4 shadow-sm">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Core report
              </div>
              <div className="mt-1 text-3xl font-extrabold tracking-tight text-black">
                £4.99
              </div>
              <div className="mt-1 text-sm leading-5 text-slate-700">
                Detailed findings, repair exposure, seller questions and MoT
                analysis.
              </div>
            </div>

            <div className="rounded-[1.25rem] border border-[var(--aa-red)]/20 bg-[var(--aa-red)]/5 p-4 shadow-sm">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--aa-red)]">
                Full bundle
              </div>
              <div className="mt-1 text-3xl font-extrabold tracking-tight text-black">
                £9.99
              </div>
              <div className="mt-1 text-sm leading-5 text-slate-700">
                Core report plus HPI-style finance, write-off, stolen, mileage
                and keeper checks.
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}