import { NextResponse } from "next/server";

export const runtime = "nodejs";

function cleanRegistration(reg: string): string {
  return reg.replace(/\s/g, "").toUpperCase();
}

function isLikelyUkRegistration(value: string) {
  return /^[A-Z0-9]{2,8}$/.test(value);
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
        make: typeof vehicle.make === "string" ? vehicle.make.trim() : null,
        model: typeof vehicle.model === "string" ? vehicle.model.trim() : null,
        year:
          typeof vehicle.year === "string" || typeof vehicle.year === "number"
            ? vehicle.year
            : null,
        colour:
          typeof vehicle.colour === "string" ? vehicle.colour.trim() : null,
        fuelType:
          typeof vehicle.fuelType === "string"
            ? vehicle.fuelType.trim()
            : null,
        bodyType:
          typeof vehicle.bodyType === "string"
            ? vehicle.bodyType.trim()
            : null,
        engineSize:
          typeof vehicle.engineSize === "string" ||
          typeof vehicle.engineSize === "number"
            ? vehicle.engineSize
            : null,
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

    return NextResponse.json({
      manual: false,
      registration: cleanReg,
      make: typeof data?.make === "string" ? data.make : null,
      model: null,
      year:
        typeof data?.yearOfManufacture === "number"
          ? data.yearOfManufacture
          : null,
      fuelType: typeof data?.fuelType === "string" ? data.fuelType : null,
      engineSize:
        typeof data?.engineCapacity === "number" ? data.engineCapacity : null,
      colour: typeof data?.colour === "string" ? data.colour : null,
      bodyType: typeof data?.wheelplan === "string" ? data.wheelplan : null,
      motStatus: typeof data?.motStatus === "string" ? data.motStatus : null,
      taxStatus: typeof data?.taxStatus === "string" ? data.taxStatus : null,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Server error" },
      { status: 500 }
    );
  }
}