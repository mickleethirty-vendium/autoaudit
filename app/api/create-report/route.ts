import { NextResponse } from "next/server";
import { generateReport } from "@/lib/engine";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

function cleanRegistration(reg: string): string {
  return reg.replace(/\s/g, "").toUpperCase();
}

async function fetchMotPayload(registration: string): Promise<any | null> {
  const key = process.env.DVSA_MOT_API_KEY;
  if (!key) return null; // ✅ no key yet, skip safely

  const DVSA_BASE =
    "https://beta.check-mot.service.gov.uk/trade/vehicles/mot-tests";

  const reg = cleanRegistration(registration);

  const res = await fetch(`${DVSA_BASE}?registration=${encodeURIComponent(reg)}`, {
    method: "GET",
    headers: {
      "x-api-key": key,
      Accept: "application/json+v6",
    },
    cache: "no-store",
  });

  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    // store DVSA error details for debugging but don't break report creation
    return {
      _error: true,
      status: res.status,
      data,
    };
  }

  return data;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const year = Number(body.year);
    const mileage = Number(body.mileage);

    if (!Number.isFinite(year) || year < 1990 || year > new Date().getFullYear()) {
      return NextResponse.json({ error: "Invalid year" }, { status: 400 });
    }
    if (!Number.isFinite(mileage) || mileage < 0 || mileage > 500000) {
      return NextResponse.json({ error: "Invalid mileage" }, { status: 400 });
    }

    const fuel = body.fuel;
    const transmission = body.transmission;
    const timing_type = body.timing_type ?? "unknown";
    const asking_price = body.asking_price ?? null;

    const registration =
      body.registration ? cleanRegistration(String(body.registration)) : null;

    const make = body.make ? String(body.make) : null;

    // ✅ Fetch MOT (non-blocking if no key)
    const mot_payload = registration ? await fetchMotPayload(registration) : null;

    const { preview, full } = generateReport({
      year,
      mileage,
      fuel,
      transmission,
      timing_type,
      asking_price,
      make,
      // later we will feed MOT signals into the engine
    });

    const { data, error } = await supabaseAdmin
      .from("reports")
      .insert({
        registration,
        make,
        car_year: year,
        mileage,
        fuel,
        transmission,
        timing_type,
        asking_price,
        mot_payload, // ✅ stored now
        preview_payload: preview,
        full_payload: full,
        is_paid: false,
      })
      .select("id")
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message ?? "DB insert failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({ report_id: data.id });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
  }
}