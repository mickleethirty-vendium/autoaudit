import { NextResponse } from "next/server";
import { generateReport } from "@/lib/engine";
import { supabaseAdmin } from "@/lib/supabase";
import { fetchDvsaMotHistory } from "@/lib/dvsaMot";
import { extractMotSignals } from "@/lib/motSignals";
import { matchKnownModelIssues } from "@/lib/commonFailures";
import {
  buildUkvdValuationSummary,
  fetchUkvdValuationByVrm,
} from "@/lib/ukvdValuation";

export const runtime = "nodejs";

type Fuel = "petrol" | "diesel" | "hybrid" | "ev";
type Transmission = "manual" | "automatic" | "cvt" | "dct";
type TimingType = "belt" | "chain" | "unknown";

type MatchConfidence = "high" | "medium" | "low";
type MatchBasis =
  | "exact_derivative"
  | "engine_family"
  | "model_generation"
  | "make_model_only";

type VehicleIdentityInput = {
  make?: string | null;
  model?: string | null;
  derivative?: string | null;
  generation?: string | null;
  engine?: string | null;
  engine_family?: string | null;
  engine_code?: string | null;
  engine_size?: string | null;
  power?: string | null;
  fuel?: string | null;
  transmission?: string | null;
  year?: number | null;
};

type KnownModelIssueInput = {
  issue_code: string;
  label: string;
  category: string;
  severity?: "low" | "medium" | "high";
  cost_low: number;
  cost_high: number;
  why_flagged: string;
  why_it_matters?: string;
  questions_to_ask?: string[];
  red_flags?: string[];
  match_confidence: MatchConfidence;
  match_basis: MatchBasis;
  probability_score?: number;
};

const VALID_FUELS: Fuel[] = ["petrol", "diesel", "hybrid", "ev"];
const VALID_TRANSMISSIONS: Transmission[] = [
  "manual",
  "automatic",
  "cvt",
  "dct",
];
const VALID_TIMING_TYPES: TimingType[] = ["belt", "chain", "unknown"];

const VALID_MATCH_CONFIDENCES: MatchConfidence[] = ["high", "medium", "low"];
const VALID_MATCH_BASES: MatchBasis[] = [
  "exact_derivative",
  "engine_family",
  "model_generation",
  "make_model_only",
];

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

function parseOptionalYear(value: unknown): number | null {
  const n = parseOptionalNumber(value);
  if (n === null) return null;
  const rounded = Math.round(n);
  if (rounded < 1900 || rounded > new Date().getFullYear() + 1) return null;
  return rounded;
}

function parseMatchConfidence(value: unknown): MatchConfidence | null {
  return VALID_MATCH_CONFIDENCES.includes(value as MatchConfidence)
    ? (value as MatchConfidence)
    : null;
}

function parseMatchBasis(value: unknown): MatchBasis | null {
  return VALID_MATCH_BASES.includes(value as MatchBasis)
    ? (value as MatchBasis)
    : null;
}

function parseVehicleIdentity(value: unknown): VehicleIdentityInput | null {
  if (!value || typeof value !== "object") return null;

  const raw = value as Record<string, unknown>;

  const vehicleIdentity: VehicleIdentityInput = {
    make: normalizeOptionalString(raw.make),
    model: normalizeOptionalString(raw.model),
    derivative: normalizeOptionalString(raw.derivative),
    generation: normalizeOptionalString(raw.generation),
    engine: normalizeOptionalString(raw.engine),
    engine_family: normalizeOptionalString(raw.engine_family),
    engine_code: normalizeOptionalString(raw.engine_code),
    engine_size: normalizeOptionalString(raw.engine_size),
    power: normalizeOptionalString(raw.power),
    fuel: normalizeOptionalString(raw.fuel),
    transmission: normalizeOptionalString(raw.transmission),
    year: parseOptionalYear(raw.year),
  };

  const hasAnyValue = Object.values(vehicleIdentity).some(
    (v) => v !== null && v !== undefined
  );

  return hasAnyValue ? vehicleIdentity : null;
}

function parseKnownModelIssues(value: unknown): KnownModelIssueInput[] {
  if (!Array.isArray(value)) return [];

  const parsed = value.map((rawItem): KnownModelIssueInput | null => {
    if (!rawItem || typeof rawItem !== "object") return null;

    const item = rawItem as Record<string, unknown>;

    const issue_code = normalizeOptionalString(item.issue_code);
    const label = normalizeOptionalString(item.label);
    const category = normalizeOptionalString(item.category);
    const cost_low = parseOptionalNumber(item.cost_low);
    const cost_high = parseOptionalNumber(item.cost_high);
    const why_flagged = normalizeOptionalString(item.why_flagged);
    const match_confidence = parseMatchConfidence(item.match_confidence);
    const match_basis = parseMatchBasis(item.match_basis);

    if (
      !issue_code ||
      !label ||
      !category ||
      cost_low === null ||
      cost_high === null ||
      !why_flagged ||
      !match_confidence ||
      !match_basis
    ) {
      return null;
    }

    const severity =
      item.severity === "low" ||
      item.severity === "medium" ||
      item.severity === "high"
        ? item.severity
        : undefined;

    const probability_score = parseOptionalNumber(item.probability_score);

    return {
      issue_code,
      label,
      category,
      severity,
      cost_low,
      cost_high,
      why_flagged,
      why_it_matters: normalizeOptionalString(item.why_it_matters) ?? undefined,
      questions_to_ask: Array.isArray(item.questions_to_ask)
        ? item.questions_to_ask.filter(
            (q): q is string => typeof q === "string" && q.trim().length > 0
          )
        : undefined,
      red_flags: Array.isArray(item.red_flags)
        ? item.red_flags.filter(
            (q): q is string => typeof q === "string" && q.trim().length > 0
          )
        : undefined,
      match_confidence,
      match_basis,
      probability_score:
        probability_score !== null
          ? Math.max(0, Math.min(1, probability_score))
          : undefined,
    };
  });

  return parsed.filter(
    (item): item is KnownModelIssueInput => item !== null
  );
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
      (!Number.isFinite(asking_price) ||
        asking_price < 0 ||
        asking_price > 1000000)
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

    const requestVehicleIdentity = parseVehicleIdentity(body.vehicleIdentity);
    const requestKnownModelIssues = parseKnownModelIssues(body.knownModelIssues);

    const mot_payload = registration
      ? await fetchDvsaMotHistory(registration)
      : null;

    const motSignals = mot_payload ? extractMotSignals(mot_payload) : null;

    let marketValue: ReturnType<typeof buildUkvdValuationSummary> | null = null;

    if (registration) {
      try {
        const valuationPayload = await fetchUkvdValuationByVrm(
          registration,
          mileage
        );
        marketValue = buildUkvdValuationSummary(valuationPayload);
      } catch (error) {
        console.error("UKVD valuation lookup failed", {
          registration,
          mileage,
          error: error instanceof Error ? error.message : error,
        });
      }
    }

    const matchedCommonFailures =
      requestVehicleIdentity || requestKnownModelIssues.length
        ? null
        : await matchKnownModelIssues({
            registration,
            make,
            model: normalizeOptionalString(body.model),
            derivative: normalizeOptionalString(body.derivative),
            generation: normalizeOptionalString(body.generation),
            engine: normalizeOptionalString(body.engine),
            engine_family: normalizeOptionalString(body.engine_family),
            engine_code: normalizeOptionalString(body.engine_code),
            engine_size: normalizeOptionalString(body.engine_size),
            power: normalizeOptionalString(body.power),
            fuel,
            transmission,
            year,
            mileage,
          });

    const vehicleIdentity =
      requestVehicleIdentity ?? matchedCommonFailures?.vehicleIdentity ?? null;

    const knownModelIssues =
      requestKnownModelIssues.length > 0
        ? requestKnownModelIssues
        : matchedCommonFailures?.knownModelIssues ?? [];

    const { preview, full } = generateReport({
      year,
      mileage,
      fuel,
      transmission,
      timing_type,
      asking_price,
      make,
      registration,
      motSignals,
      marketValue,
      vehicleIdentity,
      knownModelIssues,
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