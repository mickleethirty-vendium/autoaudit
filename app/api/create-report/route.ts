import { NextResponse } from "next/server";
import { generateReport } from "@/lib/engine";
import { supabaseAdmin } from "@/lib/supabase";
import { fetchDvsaMotHistory } from "@/lib/dvsaMot";
import { extractMotSignals } from "@/lib/motSignals";

export const runtime = "nodejs";

type Fuel = "petrol" | "diesel" | "hybrid" | "ev";
type Transmission = "manual" | "automatic" | "cvt" | "dct";
type TimingType = "belt" | "chain" | "unknown";

const VALID_FUELS: Fuel[] = ["petrol", "diesel", "hybrid", "ev"];
const VALID_TRANSMISSIONS: Transmission[] = [
  "manual",
  "automatic",
  "cvt",
  "dct",
];
const VALID_TIMING_TYPES: TimingType[] = ["belt", "chain", "unknown"];

function cleanRegistration(reg: string): string {
  return reg.replace(/\s/g, "").toUpperCase();
}

function normalizeOptionalString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function parseFuel(value: unknown): Fuel | null {
  return VALID_FUELS.includes(value as Fuel) ? (value as Fuel) : null;
}

function parseTransmission(value: unknown): Transmission | null {
  return VALID_TRANSMISSIONS.includes(value as Transmission)
    ? (value as Transmission)
    : null;
}

function parseTimingType(value: unknown): TimingType {
  return VALID_TIMING_TYPES.includes(value as TimingType)
    ? (value as TimingType)
    : "unknown";
}

function parseOptionalNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
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

    const fuel = parseFuel(body.fuel);
    if (!fuel) {
      return NextResponse.json({ error: "Invalid fuel type" }, { status: 400 });
    }

    const transmission = parseTransmission(body.transmission);
    if (!transmission) {
      return NextResponse.json(
        { error: "Invalid transmission type" },
        { status: 400 }
      );
    }

    const timing_type = parseTimingType(body.timing_type);
    const asking_price = parseOptionalNumber(body.asking_price);

    if (
      asking_price !== null &&
      (!Number.isFinite(asking_price) || asking_price < 0 || asking_price > 1000000)
    ) {
      return NextResponse.json(
        { error: "Invalid asking price" },
        { status: 400 }
      );
    }

    const registration = body.registration
      ? cleanRegistration(String(body.registration))
      : null;

    const make = normalizeOptionalString(body.make);

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