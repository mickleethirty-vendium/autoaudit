import { NextResponse } from "next/server";
import { generateReport } from "@/lib/engine";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

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

    const { preview, full } = generateReport({
      year,
      mileage,
      fuel,
      transmission,
      timing_type,
      asking_price,
    });

    const { data, error } = await supabaseAdmin
      .from("reports")
      .insert({
        car_year: year,
        mileage,
        fuel,
        transmission,
        timing_type,
        asking_price,
        preview_payload: preview,
        full_payload: full,
        is_paid: false,
      })
      .select("id")
      .single();

    if (error || !data) {
      return NextResponse.json({ error: error?.message ?? "DB insert failed" }, { status: 500 });
    }

    return NextResponse.json({ report_id: data.id });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
  }
}
