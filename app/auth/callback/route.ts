import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { mustGetEnv } from "@/lib/env";

function getSafeNext(nextValue: string | null) {
  if (!nextValue) return "/";
  if (!nextValue.startsWith("/")) return "/";
  if (nextValue.startsWith("//")) return "/";
  return nextValue;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = getSafeNext(requestUrl.searchParams.get("next"));
  const claimReportId = requestUrl.searchParams.get("claim_report");

  const redirectUrl = new URL(next, requestUrl.origin);

  if (claimReportId) {
    redirectUrl.searchParams.set("claim_report", claimReportId);
  }

  if (!code) {
    redirectUrl.searchParams.set("auth_error", "missing_code");
    return NextResponse.redirect(redirectUrl);
  }

  const response = NextResponse.redirect(redirectUrl);

  const supabase = createServerClient(
    mustGetEnv("NEXT_PUBLIC_SUPABASE_URL"),
    mustGetEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookies: {
        get(name: string) {
          return cookies().get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          response.cookies.set({ name, value: "", ...options, maxAge: 0 });
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const errorRedirect = new URL(next, requestUrl.origin);
    if (claimReportId) {
      errorRedirect.searchParams.set("claim_report", claimReportId);
    }
    errorRedirect.searchParams.set("auth_error", "callback_failed");
    return NextResponse.redirect(errorRedirect);
  }

  return response;
}