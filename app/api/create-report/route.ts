import { NextResponse } from "next/server";
import { generateReport } from "@/lib/engine";
import { supabaseAdmin } from "@/lib/supabase";
import { fetchDvsaMotHistory } from "@/lib/dvsaMot";
import { extractMotSignals } from "@/lib/motSignals";

export const runtime = "nodejs";

function cleanRegistration(reg: string): string {
  return reg.replace(/\s/g, "").toUpperCase();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const year = Number(body.year);
    const mileage = Number(body.mileage);

    if (
      !Number.isFinite(year) ||
      year < 1990 ||
      year > new Date().getFullYear()
    ) {
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

    const mot_payload = registration
      ? await fetchDvsaMotHistory(registration)
      : null;

    const motSignals = mot_payload ? extractMotSignals(mot_payload) : null;

    const { preview, full } = generateReport({
      year,
      mileage,
      fuel,
      transmission,
      timing_type,
      asking_price,
      make,
      motSignals,
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
        mot_payload,
        preview_payload: preview,
        full_payload: full,
        is_paid: false,

        // Ensure every new check starts with a fresh HPI state
        hpi_checked: false,
        hpi_checked_at: null,
        hpi_status: null,
        hpi_payload: null,
        hpi_summary: null,
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
    return NextResponse.json(
      { error: e?.message ?? "Server error" },
      { status: 500 }
    );
  }
}