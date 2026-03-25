import { NextResponse } from "next/server";

export const runtime = "nodejs";

function cleanRegistration(reg: string): string {
  return reg.replace(/\s/g, "").toUpperCase();
}

function isLikelyUkRegistration(value: string) {
  return /^[A-Z0-9]{2,8}$/.test(value);
}

function normalizeOptionalString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function normalizeEngineSize(value: unknown): string | number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    if (value >= 100) {
      return Number((value / 1000).toFixed(1));
    }
    return Number(value.toFixed(1));
  }

  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  const numeric = Number(trimmed.replace(/[^\d.]/g, ""));
  if (!Number.isFinite(numeric)) return trimmed;

  if (numeric >= 100) {
    return Number((numeric / 1000).toFixed(1));
  }

  return Number(numeric.toFixed(1));
}

function normalizeBodyType(value: unknown): string | null {
  const raw = normalizeOptionalString(value);
  if (!raw) return null;

  const key = raw.toLowerCase();

  const map: Record<string, string> = {
    "2 axle rigid body": "Car",
    "3 axle rigid body": "Car",
    "4x2": "Car",
    "saloon": "Saloon",
    "estate": "Estate",
    "hatchback": "Hatchback",
    "convertible": "Convertible",
    "coupe": "Coupe",
    "mpv": "MPV",
    "suv": "SUV",
    "station wagon": "Estate",
  };

  return map[key] ?? raw;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    const isManual = body?.manual === true;

    if (isManual) {
      const vehicle = body?.vehicle;

      if (!vehicle?.make || !vehicle?.model || !vehicle?.year) {
        return NextResponse.json(
          { error: "Missing vehicle details" },
          { status: 400 }
        );
      }

      return NextResponse.json({
        manual: true,
        registration: null,
        make: normalizeOptionalString(vehicle.make),
        model: normalizeOptionalString(vehicle.model),
        year:
          typeof vehicle.year === "string" || typeof vehicle.year === "number"
            ? vehicle.year
            : null,
        colour: normalizeOptionalString(vehicle.colour),
        fuelType: normalizeOptionalString(vehicle.fuelType),
        bodyType: normalizeBodyType(vehicle.bodyType),
        engineSize: normalizeEngineSize(vehicle.engineSize),
      });
    }

    const registrationRaw = body?.registration;

    if (!registrationRaw) {
      return NextResponse.json(
        { error: "Missing registration" },
        { status: 400 }
      );
    }

    const cleanReg = cleanRegistration(String(registrationRaw));

    if (!isLikelyUkRegistration(cleanReg)) {
      return NextResponse.json(
        { error: "Please enter a valid registration" },
        { status: 400 }
      );
    }

    const apiKey = process.env.DVLA_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "DVLA lookup is not configured" },
        { status: 500 }
      );
    }

    const response = await fetch(
      "https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles",
      {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ registrationNumber: cleanReg }),
        cache: "no-store",
      }
    );

    let data: any = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: "Vehicle not found for that registration" },
          { status: 404 }
        );
      }

      if (response.status === 400) {
        return NextResponse.json(
          { error: data?.message || "DVLA could not match that registration" },
          { status: 400 }
        );
      }

      if (response.status === 401 || response.status === 403) {
        return NextResponse.json(
          { error: "DVLA lookup is currently unavailable" },
          { status: 502 }
        );
      }

      return NextResponse.json(
        { error: data?.message || "DVLA lookup failed" },
        { status: 502 }
      );
    }

    const fallbackMake = normalizeOptionalString(body?.make);
    const fallbackModel = normalizeOptionalString(body?.model);
    const fallbackBodyType = normalizeOptionalString(body?.bodyType);
    const fallbackEngineSize = normalizeEngineSize(body?.engineSize);

    return NextResponse.json({
      manual: false,
      registration: cleanReg,
      make: normalizeOptionalString(data?.make) ?? fallbackMake,
      model: normalizeOptionalString(data?.model) ?? fallbackModel ?? null,
      year:
        typeof data?.yearOfManufacture === "number"
          ? data.yearOfManufacture
          : null,
      fuelType: normalizeOptionalString(data?.fuelType),
      engineSize:
        normalizeEngineSize(data?.engineCapacity) ?? fallbackEngineSize ?? null,
      colour: normalizeOptionalString(data?.colour),
      bodyType:
        normalizeBodyType(data?.wheelplan) ??
        normalizeBodyType(data?.bodyType) ??
        fallbackBodyType,
      motStatus: normalizeOptionalString(data?.motStatus),
      taxStatus: normalizeOptionalString(data?.taxStatus),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Server error" },
      { status: 500 }
    );
  }
}