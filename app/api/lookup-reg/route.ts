import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { registration } = await req.json();

    if (!registration) {
      return NextResponse.json({ error: "Missing registration" }, { status: 400 });
    }

    const apiKey = process.env.DVLA_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "DVLA_API_KEY not set" }, { status: 500 });
    }

    const cleanReg = String(registration).replace(/\s/g, "").toUpperCase();

    const response = await fetch(
      "https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles",
      {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ registrationNumber: cleanReg }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.message || "DVLA lookup failed" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      registration: cleanReg,
      make: data.make ?? null,
      yearOfManufacture: data.yearOfManufacture ?? null,
      fuelType: data.fuelType ?? null,
      engineCapacity: data.engineCapacity ?? null,
      colour: data.colour ?? null,
      motStatus: data.motStatus ?? null,
      taxStatus: data.taxStatus ?? null,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Server error" },
      { status: 500 }
    );
  }
}