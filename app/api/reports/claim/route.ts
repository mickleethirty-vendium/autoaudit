import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

function mustGetEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

function getBearerToken(req: Request) {
  const authHeader =
    req.headers.get("authorization") || req.headers.get("Authorization");

  if (!authHeader) return null;

  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}

function hasPurchasedAccess(report: any) {
  return (
    report?.is_paid === true ||
    !!report?.paid_at ||
    !!report?.stripe_session_id ||
    report?.hpi_unlocked === true ||
    !!report?.hpi_paid_at ||
    !!report?.hpi_stripe_session_id
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const reportId = body?.report_id ? String(body.report_id) : null;

    if (!reportId) {
      return NextResponse.json({ error: "Missing report_id" }, { status: 400 });
    }

    const accessToken = getBearerToken(req);

    if (!accessToken) {
      return NextResponse.json(
        { error: "Missing access token" },
        { status: 401 }
      );
    }

    const supabaseAuth = createClient(
      mustGetEnv("NEXT_PUBLIC_SUPABASE_URL"),
      mustGetEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
      {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await supabaseAuth.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          error: "Not authenticated",
          auth_error: userError?.message ?? null,
        },
        { status: 401 }
      );
    }

    const { data: report, error: reportError } = await supabaseAdmin
      .from("reports")
      .select(
        `
          id,
          is_paid,
          paid_at,
          stripe_session_id,
          expires_at,
          owner_user_id,
          saved_at,
          hpi_unlocked,
          hpi_paid_at,
          hpi_stripe_session_id
        `
      )
      .eq("id", reportId)
      .maybeSingle();

    if (reportError) {
      return NextResponse.json(
        {
          error: `Could not load report: ${reportError.message}`,
          current_user_id: user.id,
        },
        { status: 500 }
      );
    }

    if (!report) {
      return NextResponse.json(
        {
          error: "Report not found",
          current_user_id: user.id,
        },
        { status: 404 }
      );
    }

    if (!hasPurchasedAccess(report)) {
      return NextResponse.json(
        {
          error: "Only paid reports can be claimed",
          current_user_id: user.id,
          owner_user_id: report.owner_user_id ?? null,
          saved_at: report.saved_at ?? null,
        },
        { status: 400 }
      );
    }

    if (report.expires_at) {
      const expiresAt = new Date(report.expires_at).getTime();
      if (Number.isFinite(expiresAt) && expiresAt < Date.now()) {
        return NextResponse.json(
          {
            error: "This report has expired and can no longer be claimed",
            current_user_id: user.id,
            owner_user_id: report.owner_user_id ?? null,
            saved_at: report.saved_at ?? null,
          },
          { status: 410 }
        );
      }
    }

    if (report.owner_user_id === user.id) {
      if (!report.saved_at) {
        const nowIso = new Date().toISOString();

        const { data: refreshed, error: refreshError } = await supabaseAdmin
          .from("reports")
          .update({
            saved_at: nowIso,
          })
          .eq("id", report.id)
          .eq("owner_user_id", user.id)
          .select("id,owner_user_id,expires_at,saved_at")
          .maybeSingle();

        if (refreshError) {
          return NextResponse.json(
            {
              error: refreshError.message ?? "Could not update saved_at",
              current_user_id: user.id,
            },
            { status: 500 }
          );
        }

        return NextResponse.json({
          ok: true,
          report_id: refreshed?.id ?? report.id,
          owner_user_id: refreshed?.owner_user_id ?? report.owner_user_id,
          current_user_id: user.id,
          expires_at: refreshed?.expires_at ?? report.expires_at ?? null,
          saved_at: refreshed?.saved_at ?? nowIso,
          already_linked: true,
        });
      }

      return NextResponse.json({
        ok: true,
        report_id: report.id,
        owner_user_id: report.owner_user_id,
        current_user_id: user.id,
        expires_at: report.expires_at,
        saved_at: report.saved_at ?? null,
        already_linked: true,
      });
    }

    if (report.owner_user_id && report.owner_user_id !== user.id) {
      return NextResponse.json(
        {
          error: "This report is already linked to another account",
          owner_user_id: report.owner_user_id,
          current_user_id: user.id,
          report_id: report.id,
          saved_at: report.saved_at ?? null,
        },
        { status: 409 }
      );
    }

    const nowIso = new Date().toISOString();

    const { data: updated, error: updateError } = await supabaseAdmin
      .from("reports")
      .update({
        owner_user_id: user.id,
        saved_at: nowIso,
      })
      .eq("id", reportId)
      .is("owner_user_id", null)
      .select("id,owner_user_id,expires_at,saved_at")
      .maybeSingle();

    if (updateError) {
      return NextResponse.json(
        {
          error: updateError.message ?? "Could not claim report",
          current_user_id: user.id,
        },
        { status: 500 }
      );
    }

    if (!updated) {
      const { data: latest, error: latestError } = await supabaseAdmin
        .from("reports")
        .select("id,owner_user_id,expires_at,saved_at")
        .eq("id", reportId)
        .maybeSingle();

      if (latestError) {
        return NextResponse.json(
          {
            error: latestError.message ?? "Could not verify report ownership",
            current_user_id: user.id,
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          error: "This report is already linked to another account",
          owner_user_id: latest?.owner_user_id ?? null,
          current_user_id: user.id,
          report_id: latest?.id ?? reportId,
          expires_at: latest?.expires_at ?? null,
          saved_at: latest?.saved_at ?? null,
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      ok: true,
      report_id: updated.id,
      owner_user_id: updated.owner_user_id,
      current_user_id: user.id,
      expires_at: updated.expires_at,
      saved_at: updated.saved_at ?? nowIso,
      already_linked: false,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Server error" },
      { status: 500 }
    );
  }
}