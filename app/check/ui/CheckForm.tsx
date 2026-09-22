"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import useRequestTask from "@/components/conversion/useRequestTask";
import { isRequestCancelled } from "@/lib/request";
import { useRouter, useSearchParams } from "next/navigation";
import { getModelsForMake, vehicleMakes } from "@/lib/vehicleOptions";
import { AnalyticsEvents, trackEvent } from "@/lib/analytics";

import { normaliseRegistration, isLikelyUkRegistration, funnelParams } from "@/lib/vehicleCheck";

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

function cleanText(value?: string | null) {
  if (!value) return "";
  return value
    .trim()
    .toLowerCase()
    .replace(/[\/_,]+/g, " ")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function titleCase(value?: string | null) {
  if (!value) return "—";
  return value
    .split(" ")
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(" ");
}

function normaliseFuel(
  value?: string | null,
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
  value: string,
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

function normaliseMakeForOptions(value?: string | null): string | null {
  const cleaned = cleanText(value);
  if (!cleaned) return null;

  const aliasMap: Record<string, string> = {
    vw: "volkswagen",
    "mercedes benz": "mercedes",
    mercedesbenz: "mercedes",
    merc: "mercedes",
  };

  const candidate = aliasMap[cleaned] ?? cleaned;
  return vehicleMakes.includes(candidate as (typeof vehicleMakes)[number])
    ? candidate
    : null;
}

function normaliseModelForOptions(
  make?: string | null,
  model?: string | null,
): string | null {
  const normalisedMake = normaliseMakeForOptions(make);
  const cleanedModel = cleanText(model);

  if (!normalisedMake || !cleanedModel) return null;

  const availableModels = getModelsForMake(normalisedMake);
  if (!availableModels.length) return null;

  const direct = availableModels.find(
    (option) => cleanText(option) === cleanedModel,
  );
  if (direct) return direct;

  const loose = availableModels.find((option) => {
    const normalisedOption = cleanText(option);
    return (
      normalisedOption === cleanedModel ||
      normalisedOption.includes(cleanedModel) ||
      cleanedModel.includes(normalisedOption)
    );
  });

  if (loose) return loose;

  const aliasMap: Record<string, string> = {
    crv: "cr-v",
    "cr v": "cr-v",
    evoque: "evoque",
    freelander2: "freelander",
    "freelander 2": "freelander",
  };

  const aliased = aliasMap[cleanedModel];
  if (aliased && availableModels.includes(aliased)) {
    return aliased;
  }

  return null;
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

function DetailBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-0.5 text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}

export default function CheckForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialReg = useMemo(() => {
    return normaliseRegistration(searchParams.get("registration") || searchParams.get("vrm") || "");
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
  const [selectedModel, setSelectedModel] = useState("");
  const [continueError, setContinueError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasAutoLookupRef = useRef("");
  const lookupTask = useRequestTask();
  const createTask = useRequestTask();
  const hasTrackedViewRef = useRef(false);

  const canonicalVehicleMake = useMemo(
    () => normaliseMakeForOptions(vehicle?.make),
    [vehicle?.make],
  );

  const availableModelsForVehicle = useMemo(
    () => getModelsForMake(canonicalVehicleMake),
    [canonicalVehicleMake],
  );

  const canonicalVehicleModel = useMemo(
    () => normaliseModelForOptions(canonicalVehicleMake, vehicle?.model),
    [canonicalVehicleMake, vehicle?.model],
  );

  const resolvedModel = selectedModel || canonicalVehicleModel || "";

  useEffect(() => {
    if (hasTrackedViewRef.current) return;
    hasTrackedViewRef.current = true;

    trackEvent("lookup_details_viewed", {
      page: "check",
      has_prefilled_reg: !!initialReg,
      has_prefilled_asking_price: !!initialAskingPrice,
    });
  }, [initialReg, initialAskingPrice, searchParams]);

  useEffect(() => {
    if (!initialReg) return;
    setRegistration(initialReg);
  }, [initialReg]);

  useEffect(() => {
    setAskingPrice(initialAskingPrice);
  }, [initialAskingPrice]);

  useEffect(() => {
    if (!vehicle) {
      setSelectedModel("");
      return;
    }

    if (canonicalVehicleModel) {
      setSelectedModel(canonicalVehicleModel);
      return;
    }

    setSelectedModel("");
  }, [vehicle, canonicalVehicleModel]);

  const lookupVehicle = useCallback(async (reg: string, automatic = false) => {
    if (lookupTask.pending) return;
    const cleaned = normaliseRegistration(reg);

    if (!isLikelyUkRegistration(cleaned)) {
      setLookupError("Enter a valid registration.");

      trackEvent("lookup_failed", {
        page: "check",
        reason: "empty_registration",
      });

      return;
    }

    if (!automatic) {
      trackEvent(AnalyticsEvents.CTA_CLICK, { page_type: "check", cta_variant: "general", cta_position: "lookup" });
    }
    trackEvent(AnalyticsEvents.VRM_SUBMITTED, { page_type: "check", source: automatic ? "auto_prefilled_reg" : "manual_submit" });
    trackEvent("lookup_started", {
      page: "check",
      source: automatic ? "auto_prefilled_reg" : "manual_submit",
    });

    setLookupLoading(true);
    setLookupError(null);
    setContinueError(null);
    setVehicle(null);
    setSelectedModel("");

    try {
      const { response, data } = await lookupTask.run("/api/lookup-reg", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          registration: cleaned,
        }),
      });


      if (!response.ok) {
        throw new Error(
          data?.error ||
            "We couldn’t find vehicle details for that registration.",
        );
      }

      const rawMake = typeof data?.make === "string" ? data.make : null;
      const rawModel = typeof data?.model === "string" ? data.model : null;

      const mappedMake = normaliseMakeForOptions(rawMake) ?? rawMake;
      const mappedModel =
        normaliseModelForOptions(mappedMake, rawModel) ?? rawModel;

      setVehicle({
        registration:
          typeof data?.registration === "string" ? data.registration : cleaned,
        make: mappedMake ?? null,
        model: mappedModel ?? null,
        year: data?.year ?? data?.yearOfManufacture ?? null,
        colour: data?.colour ?? null,
        fuelType: data?.fuelType ?? null,
        bodyType: data?.bodyType ?? null,
        engineSize: data?.engineSize ?? data?.engineCapacity ?? null,
        motStatus: data?.motStatus ?? null,
        taxStatus: data?.taxStatus ?? null,
      });

      trackEvent("vehicle_found", {
        page: "check",
        has_make: !!mappedMake,
        has_model: !!mappedModel,
        has_year: !!(data?.year ?? data?.yearOfManufacture),
        has_mot_status: !!data?.motStatus,
      });
    } catch (err) {
      if (isRequestCancelled(err)) return;
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong while looking up that registration.";

      setLookupError(message);

      trackEvent("lookup_failed", {
        page: "check",
        reason: "lookup_error",
      });
    } finally {
      if (!lookupTask.pending) setLookupLoading(false);
    }
  }, [lookupTask]);

  async function handleLookupSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await lookupVehicle(registration);
  }

  async function handleContinue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (createTask.pending) return;

    if (!vehicle) {
      setContinueError("Vehicle details are missing.");

      trackEvent("lookup_details_failed", {
        page: "check",
        reason: "missing_vehicle",
      });

      return;
    }

    const year = Number(vehicle.year);
    if (!Number.isFinite(year)) {
      setContinueError(
        "We couldn’t determine the vehicle year from the registration lookup.",
      );

      trackEvent("lookup_details_failed", {
        page: "check",
        reason: "missing_year",
      });

      return;
    }

    if (!mileage.trim()) {
      setContinueError("Please enter the vehicle mileage.");

      trackEvent("lookup_details_failed", {
        page: "check",
        reason: "missing_mileage",
      });

      return;
    }

    const parsedMileage = Number(mileage.replace(/,/g, ""));
    if (!Number.isFinite(parsedMileage) || parsedMileage < 0) {
      setContinueError("Please enter a valid mileage.");

      trackEvent("lookup_details_failed", {
        page: "check",
        reason: "invalid_mileage",
      });

      return;
    }

    const parsedAskingPrice = parseOptionalPrice(askingPrice);
    if (
      askingPrice.trim() &&
      (parsedAskingPrice === null || parsedAskingPrice > 1000000)
    ) {
      setContinueError("Please enter a valid asking price.");

      trackEvent("lookup_details_failed", {
        page: "check",
        reason: "invalid_asking_price",
      });

      return;
    }

    const fuel = normaliseFuel(vehicle.fuelType);
    if (!fuel) {
      setContinueError("We couldn’t match the fuel type for this vehicle.");

      trackEvent("lookup_details_failed", {
        page: "check",
        reason: "fuel_not_matched",
      });

      return;
    }

    const transmission = normaliseTransmission(gearbox);
    if (!transmission) {
      setContinueError("Please select a supported gearbox type.");

      trackEvent("lookup_details_failed", {
        page: "check",
        reason: "missing_transmission",
      });

      return;
    }

    const engineSize = normaliseEngineSize(vehicle.engineSize);
    const canonicalMake = canonicalVehicleMake ?? vehicle.make ?? undefined;
    const modelForPayload = resolvedModel || undefined;

    if (canonicalVehicleMake && availableModelsForVehicle.length && !modelForPayload) {
      setContinueError("Please confirm the vehicle model before continuing.");

      trackEvent("lookup_details_failed", {
        page: "check",
        reason: "missing_model_confirmation",
      });

      return;
    }

    trackEvent("lookup_details_submitted", {
      page: "check",
      has_asking_price: parsedAskingPrice !== null,
      has_model: !!modelForPayload,
      has_engine_size: !!engineSize,
      transmission,
      fuel,
    });

    setIsSubmitting(true);
    setContinueError(null);

    try {
      const { response, data } = await createTask.run("/api/create-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          registration: vehicle.registration,
          make: canonicalMake,
          model: modelForPayload,
          year,
          mileage: parsedMileage,
          asking_price: parsedAskingPrice,
          fuel,
          transmission,
          engine_size: engineSize ?? undefined,
          timing_type: "unknown",
        }),
      });


      if (!response.ok) {
        throw new Error(data?.error || "We couldn’t build the preview right now.");
      }

      if (!data?.report_id) {
        throw new Error("Preview ID was not returned.");
      }

      trackEvent("free_preview_created", {
        page: "check",
        has_asking_price: parsedAskingPrice !== null,
        has_model: !!modelForPayload,
      });

      const context = funnelParams(new URLSearchParams(searchParams.toString()));
      if (!context.has("f_source")) context.set("f_source", "check");
      if (!context.has("f_landing")) context.set("f_landing", "check");
      router.push(`/preview/${data.report_id}${context.size ? `?${context}` : ""}`);
    } catch (err) {
      if (isRequestCancelled(err)) return;
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong while creating your preview.";

      setContinueError(message);
      setIsSubmitting(false);

      trackEvent("lookup_details_failed", {
        page: "check",
        reason: "create_report_error",
      });
    }
  }

  function resetVehicleStep() {
    lookupTask.cancel();
    createTask.cancel();
    setIsSubmitting(false);
    setVehicle(null);
    setLookupError(null);
    setContinueError(null);
    setMileage("");
    setGearbox("");
    setSelectedModel("");

    trackEvent("lookup_vehicle_reset", {
      page: "check",
    });
  }

  useEffect(() => {
    if (!initialReg) return;
    if (hasAutoLookupRef.current === initialReg) return;

    // Defer until after React's development effect replay so a cancelled
    // probe mount cannot leave the real mount stuck or count two submissions.
    const timer = setTimeout(() => {
      lookupTask.cancel();
      hasAutoLookupRef.current = initialReg;
      void lookupVehicle(initialReg, true);
    }, 0);
    return () => clearTimeout(timer);
  }, [initialReg, lookupTask, lookupVehicle]);

  return (
    <div className="w-full">
      {!vehicle ? (
        <form onSubmit={handleLookupSubmit} className="space-y-3 text-left">
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="mb-3">
              <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                Step 1
              </div>
              <div className="mt-0.5 text-sm font-semibold text-slate-950">
                Confirm the vehicle
              </div>
            </div>

            <label
              htmlFor="registration"
              className="mb-1.5 block text-sm font-semibold text-slate-800"
            >
              Vehicle registration
            </label>

            <div className="flex flex-col gap-2.5 sm:flex-row">
              <input
                id="registration"
                name="registration"
                type="text"
                inputMode="text"
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
                maxLength={10}
                aria-invalid={!!lookupError}
                aria-label="UK registration"
                value={registration}
                onChange={(e) => {
                  setRegistration(e.target.value.toUpperCase());
                  if (lookupError) setLookupError(null);
                }}
                disabled={lookupLoading}
                placeholder="AB12CDE"
                className="h-14 w-full rounded-xl border border-slate-200 bg-white px-4 text-base font-semibold tracking-[0.14em] text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 transition placeholder:text-slate-400 focus:border-[var(--aa-red)]"
              />

              <button
                type="submit"
                disabled={lookupLoading}
                className="inline-flex h-14 items-center justify-center rounded-xl border border-[var(--aa-red)] bg-[var(--aa-red)] px-5 text-sm font-semibold text-white transition hover:border-[var(--aa-red-strong)] hover:bg-[var(--aa-red-strong)] disabled:cursor-not-allowed disabled:opacity-70 sm:min-w-[160px]"
              >
                {lookupLoading ? "Looking up…" : "Find vehicle"}
              </button>
            </div>

            <FieldHint tone="required">
              Enter the registration to pull the vehicle details automatically.
            </FieldHint>

            <div className="mt-2.5">
              <Link
                href={`/manual-check?${funnelParams(new URLSearchParams(searchParams.toString()))}`}
                onClick={() =>
                  trackEvent(AnalyticsEvents.MANUAL_CHECK_CLICKED, {
                    page: "check",
                    source: "lookup_step",
                  })
                }
                className="text-sm font-medium text-[var(--aa-red)] transition hover:text-[var(--aa-red-strong)] hover:underline"
              >
                Or check manually
              </Link>
            </div>
          </div>

          {lookupError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
              {lookupError}
            </div>
          ) : null}

          {lookupLoading ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-sm font-semibold text-slate-900">
                Looking up vehicle details…
              </p>
              <p className="mt-0.5 text-sm text-slate-600">
                We’re checking the registration and preparing the next step.
              </p>
            </div>
          ) : null}
        </form>
      ) : (
        <div className="space-y-3 text-left">
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--aa-red)]">
                  Step 1 complete
                </div>

                <div className="mt-1 text-lg font-bold text-slate-900">
                  {vehicle.registration}
                  {vehicle.make ? (
                    <span className="ml-0 mt-1 block text-sm font-medium text-slate-600 sm:ml-2 sm:mt-0 sm:inline">
                      · {titleCase(vehicle.make)}
                      {resolvedModel ? ` ${titleCase(resolvedModel)}` : ""}
                    </span>
                  ) : null}
                </div>

                <div className="mt-1 text-sm text-slate-600">
                  Vehicle found. Now add the details needed for your snapshot.
                </div>
              </div>

              <button
                type="button"
                onClick={resetVehicleStep}
                disabled={isSubmitting}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Change registration
              </button>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <DetailBox label="Year" value={String(vehicle.year || "—")} />
              <DetailBox label="Fuel" value={vehicle.fuelType || "—"} />
              <DetailBox label="Body" value={vehicle.bodyType || "—"} />
              <DetailBox label="Colour" value={vehicle.colour || "—"} />
              <DetailBox
                label="Engine"
                value={normaliseEngineSize(vehicle.engineSize) ?? "—"}
              />
              <DetailBox label="MoT" value={vehicle.motStatus || "—"} />
              <DetailBox label="Tax" value={vehicle.taxStatus || "—"} />
            </div>
          </div>

          {canonicalVehicleMake && availableModelsForVehicle.length ? (
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <label
                htmlFor="vehicleModel"
                className="mb-1.5 block text-sm font-semibold text-slate-800"
              >
                Confirm model
              </label>
              <select
                id="vehicleModel"
                value={selectedModel}
                onChange={(e) => {
                  setSelectedModel(e.target.value);
                  if (continueError) setContinueError(null);
                }}
                disabled={isSubmitting}
                className="h-14 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 transition focus:border-[var(--aa-red)]"
              >
                <option value="">Select model</option>
                {availableModelsForVehicle.map((option) => (
                  <option key={option} value={option}>
                    {titleCase(option)}
                  </option>
                ))}
              </select>
              <FieldHint>
                This helps us match model-specific common failures more accurately.
              </FieldHint>
            </div>
          ) : null}

          <form onSubmit={handleContinue} className="space-y-3">
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="mb-3">
                <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                  Step 2
                </div>
                <div className="mt-0.5 text-sm font-semibold text-slate-950">
                  Complete your snapshot details
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="mileage"
                    className="mb-1.5 block text-sm font-semibold text-slate-800"
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
                    className="h-14 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 transition placeholder:text-slate-400 focus:border-[var(--aa-red)]"
                  />
                  <FieldHint tone="required">
                    Required — used in risk and valuation estimates.
                  </FieldHint>
                </div>

                <div>
                  <label
                    htmlFor="gearbox"
                    className="mb-1.5 block text-sm font-semibold text-slate-800"
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
                    className="h-14 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 transition focus:border-[var(--aa-red)]"
                  >
                    <option value="">Select gearbox</option>
                    <option value="manual">Manual</option>
                    <option value="automatic">Automatic</option>
                    <option value="cvt">CVT</option>
                    <option value="semi-automatic">Semi-automatic</option>
                  </select>
                  <FieldHint tone="required">
                    Required — helps match likely component risks.
                  </FieldHint>
                </div>
              </div>

              <div className="mt-3 rounded-xl border border-[var(--aa-red)]/15 bg-[var(--aa-red)]/5 p-3">
                <label htmlFor="askingPrice" className="block text-sm font-semibold text-slate-900">
                  Asking price
                </label>
                <div className="mt-0.5 text-sm text-slate-700">
                  Optional — used for market comparison in the paid Core Report where available.
                </div>
                <div className="mt-2.5">
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
                    className="h-14 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 transition placeholder:text-slate-400 focus:border-[var(--aa-red)]"
                  />
                </div>
              </div>
            </div>

            {continueError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                {continueError}
              </div>
            ) : null}

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                What you’ll get next
              </div>
              <div className="mt-1 grid gap-1 text-sm leading-5 text-slate-700">
                <div>• Free risk snapshot</div>
                <div>• Repair exposure estimate</div>
                <div>• Optional asking price saved for paid market comparison</div>
                <div>• Option to unlock the full report afterwards</div>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 sm:flex-row">
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
