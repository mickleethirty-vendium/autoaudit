import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function getTodayRangeInUtcForLondon() {
  const now = new Date();

  const londonNow = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);

  const startOfDayLondon = new Date(`${londonNow}T00:00:00+00:00`);
  const endOfDayLondon = new Date(`${londonNow}T23:59:59.999+00:00`);

  return {
    startIso: startOfDayLondon.toISOString(),
    endIso: endOfDayLondon.toISOString(),
  };
}

export async function GET() {
  try {
    const { startIso, endIso } = getTodayRangeInUtcForLondon();

    const { count, error } = await supabaseAdmin
      .from("reports")
      .select("*", {
        count: "exact",
        head: true,
      })
      .gte("created_at", startIso)
      .lte("created_at", endIso);

    if (error) {
      console.error("Daily report count query failed", error);

      return NextResponse.json(
        { count: 0, error: "Failed to load daily report count" },
        {
          status: 500,
          headers: {
            "Cache-Control":
              "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        }
      );
    }

    return NextResponse.json(
      { count: count ?? 0 },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("Daily report count route failed", error);

    return NextResponse.json(
      { count: 0, error: "Unexpected error" },
      {
        status: 500,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  }
}