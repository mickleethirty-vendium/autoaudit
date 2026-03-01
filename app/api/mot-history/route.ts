import { NextResponse } from "next/server";

export const runtime = "nodejs";

// DVSA endpoint (Trade API)
const DVSA_BASE =
  "https://beta.check-mot.service.gov.uk/trade/vehicles/mot-tests";

function cleanReg(reg: string) {
  return reg.replace(/\s/g, "").toUpperCase();
}

export async function GET(req: Request) {
  try {
    const key = process.env.DVSA_MOT_API_KEY;

    if (!key) {
      return NextResponse.json(
        { error: "DVSA_MOT_API_KEY not set yet (MOT integration pending)" },
        { status: 501 }
      );
    }

    const url = new URL(req.url);
    const registration = url.searchParams.get("registration");
    if (!registration) {
      return NextResponse.json(
        { error: "Missing registration" },
        { status: 400 }
      );
    }

    const reg = cleanReg(registration);

    const upstream = await fetch(`${DVSA_BASE}?registration=${encodeURIComponent(reg)}`, {
      method: "GET",
      headers: {
        "x-api-key": key,
        // DVSA commonly expects versioned accept header
        Accept: "application/json+v6",
      },
      cache: "no-store",
    });

    const text = await upstream.text();

    // If DVSA sends non-JSON (or error HTML), return it safely
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { raw: text };
    }

    if (!upstream.ok) {
      return NextResponse.json(
        {
          error: "DVSA MOT API error",
          status: upstream.status,
          data,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ registration: reg, data });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Server error" },
      { status: 500 }
    );
  }
}