"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ManualCheckPage() {
  const router = useRouter();

  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [bodyType, setBodyType] = useState("");
  const [mileage, setMileage] = useState("");
  const [gearbox, setGearbox] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!make.trim() || !model.trim() || !year.trim()) {
      setError("Please enter the make, model, and year.");
      return;
    }

    if (!mileage.trim()) {
      setError("Please enter the vehicle mileage.");
      return;
    }

    if (!gearbox) {
      setError("Please select the gearbox type.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode: "manual",
          vehicle: {
            make: make.trim(),
            model: model.trim(),
            year: year.trim(),
            fuelType: fuelType || undefined,
            bodyType: bodyType || undefined,
          },
          mileage: Number(mileage.replace(/,/g, "")),
          gearbox,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error || "We couldn’t build the preview right now."
        );
      }

      if (!data?.id) {
        throw new Error("Preview ID was not returned.");
      }

      router.push(`/preview/${data.id}`);
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
    <section className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950 text-white shadow-2xl">
        <div className="border-b border-white/10 bg-white/[0.03] px-6 py-5 sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">
            Manual check
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Enter the vehicle details manually
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">
            Use this if you do not want to search by registration or if the
            lookup is unavailable.
          </p>
        </div>

        <div className="px-6 py-6 sm:px-8 sm:py-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  Make
                </label>
                <input
                  type="text"
                  value={make}
                  onChange={(e) => {
                    setMake(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="e.g. Ford"
                  className="h-14 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-base font-medium text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  Model
                </label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => {
                    setModel(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="e.g. Focus"
                  className="h-14 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-base font-medium text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
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
                  className="h-14 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-base font-medium text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  Fuel type
                </label>
                <select
                  value={fuelType}
                  onChange={(e) => {
                    setFuelType(e.target.value);
                    if (error) setError(null);
                  }}
                  className="h-14 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-base font-medium text-white outline-none transition focus:border-sky-400"
                >
                  <option value="" className="bg-slate-950 text-slate-300">
                    Select fuel type
                  </option>
                  <option value="petrol" className="bg-slate-950 text-white">
                    Petrol
                  </option>
                  <option value="diesel" className="bg-slate-950 text-white">
                    Diesel
                  </option>
                  <option value="hybrid" className="bg-slate-950 text-white">
                    Hybrid
                  </option>
                  <option value="plug-in hybrid" className="bg-slate-950 text-white">
                    Plug-in hybrid
                  </option>
                  <option value="electric" className="bg-slate-950 text-white">
                    Electric
                  </option>
                  <option value="other" className="bg-slate-950 text-white">
                    Other
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
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
                  className="h-14 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-base font-medium text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  Mileage
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
                  className="h-14 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-base font-medium text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  Gearbox type
                </label>
                <select
                  value={gearbox}
                  onChange={(e) => {
                    setGearbox(e.target.value);
                    if (error) setError(null);
                  }}
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
                  <option value="semi-automatic" className="bg-slate-950 text-white">
                    Semi-automatic
                  </option>
                  <option value="unknown" className="bg-slate-950 text-white">
                    I’m not sure
                  </option>
                </select>
              </div>
            </div>

            {error ? (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
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

              <Link
                href="/"
                className="inline-flex h-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-6 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Back to registration check
              </Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}