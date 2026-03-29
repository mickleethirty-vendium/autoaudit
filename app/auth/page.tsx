"use client";

import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

function getSafeNext(nextValue: string | null) {
  if (!nextValue) return "/";
  if (!nextValue.startsWith("/")) return "/";
  if (nextValue.startsWith("//")) return "/";
  return nextValue;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getAccessTokenWithRetry() {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      throw new Error(error.message ?? "Could not verify your session.");
    }

    if (session?.access_token) {
      return session.access_token;
    }

    await sleep(250);
  }

  throw new Error(
    "You must be logged in before this report can be linked to your account."
  );
}

function AuthPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const searchMode = searchParams.get("mode") === "login" ? "login" : "signup";
  const [mode, setMode] = useState<"login" | "signup">(searchMode);

  useEffect(() => {
    setMode(searchMode);
  }, [searchMode]);

  const nextUrl = useMemo(
    () => getSafeNext(searchParams.get("next")),
    [searchParams]
  );

  const claimReportId = searchParams.get("claim_report");

  const emailRedirectTo = useMemo(() => {
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://autoaudit.uk";

    const callbackUrl = new URL("/auth/callback", baseUrl);
    callbackUrl.searchParams.set("next", nextUrl);

    if (claimReportId) {
      callbackUrl.searchParams.set("claim_report", claimReportId);
    }

    return callbackUrl.toString();
  }, [nextUrl, claimReportId]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function setModeAndClear(nextMode: "login" | "signup") {
    setMode(nextMode);
    setError(null);
    setNotice(null);
  }

  function getFriendlyAuthError(err: any) {
    const message =
      typeof err?.message === "string" && err.message.trim()
        ? err.message.trim()
        : "Something went wrong.";

    const lower = message.toLowerCase();

    if (
      lower.includes("email not confirmed") ||
      lower.includes("email_not_confirmed")
    ) {
      return "Please confirm your email address first using the link in your inbox, then log in.";
    }

    if (
      lower.includes("invalid login credentials") ||
      lower.includes("invalid_grant")
    ) {
      return "Incorrect email or password.";
    }

    if (lower.includes("user already registered")) {
      return "An account already exists for this email. Try logging in instead.";
    }

    return message;
  }

  async function handleClaimReport() {
    if (!claimReportId) return true;

    const accessToken = await getAccessTokenWithRetry();

    const res = await fetch("/api/reports/claim", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ report_id: claimReportId }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      throw new Error(
        data?.error ?? "Could not link this report to your account."
      );
    }

    return true;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);

    try {
      if (!email.trim()) {
        throw new Error("Please enter your email address.");
      }

      if (!password.trim()) {
        throw new Error("Please enter your password.");
      }

      if (mode === "signup") {
        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters.");
        }

        if (password !== confirmPassword) {
          throw new Error("Passwords do not match.");
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo,
          },
        });

        if (signUpError) throw signUpError;

        if (!data.session) {
          setNotice(
            claimReportId
              ? "Account created. Please check your email, confirm your account, and then log in to link and save your paid report."
              : "Account created. Please check your email and confirm your account before logging in."
          );
          return;
        }

        await handleClaimReport();
        router.push(nextUrl);
        router.refresh();
        return;
      }

      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (loginError) throw loginError;

      await handleClaimReport();
      router.push(nextUrl);
      router.refresh();
    } catch (err: any) {
      setError(getFriendlyAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <div className="rounded-2xl border border-[var(--aa-silver)] bg-white p-6 shadow-sm">
        <div className="inline-flex items-center rounded-full border border-[var(--aa-silver)] bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
          AutoAudit account
        </div>

        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-black">
          {mode === "signup" ? "Create your account" : "Log in"}
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-700">
          {mode === "signup"
            ? "Create an account to save access to your paid AutoAudit report for up to 30 days."
            : "Log in to save and return to your paid AutoAudit report."}
        </p>

        {claimReportId ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50/60 p-4 text-sm text-slate-700">
            This account will be linked to your paid report after you{" "}
            {mode === "signup" ? "sign up" : "log in"}.
          </div>
        ) : null}

        <div className="mt-5 flex gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1">
          <button
            type="button"
            onClick={() => setModeAndClear("signup")}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition ${
              mode === "signup"
                ? "bg-[#b91c1c] text-white"
                : "bg-transparent text-slate-700 hover:bg-white"
            }`}
          >
            Create account
          </button>

          <button
            type="button"
            onClick={() => setModeAndClear("login")}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition ${
              mode === "login"
                ? "bg-black text-white"
                : "bg-transparent text-slate-700 hover:bg-white"
            }`}
          >
            Log in
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-900">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-900">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={
                mode === "signup" ? "At least 6 characters" : "Your password"
              }
              autoComplete={
                mode === "signup" ? "new-password" : "current-password"
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"
              required
            />
          </div>

          {mode === "signup" ? (
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-900">
                Confirm password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                autoComplete="new-password"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"
                required
              />
            </div>
          ) : null}

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          ) : null}

          {notice ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              {notice}
            </div>
          ) : null}

          {mode === "signup" ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-600">
              After sign-up, we’ll email you a confirmation link. Once you
              confirm your email, you’ll be returned to AutoAudit and can log in
              to continue.
            </div>
          ) : null}

          <button
            type="submit"
            disabled={busy}
            className="inline-flex w-full items-center justify-center rounded-xl border border-[#b91c1c] bg-[#b91c1c] px-5 py-3 font-semibold text-white transition hover:bg-[#991b1b] disabled:opacity-60"
          >
            {busy
              ? mode === "signup"
                ? "Creating account..."
                : "Logging in..."
              : mode === "signup"
                ? "Create account"
                : "Log in"}
          </button>
        </form>

        <div className="mt-5 text-sm text-slate-600">
          {mode === "signup" ? (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setModeAndClear("login")}
                className="font-semibold text-[#b91c1c] hover:underline"
              >
                Log in
              </button>
            </>
          ) : (
            <>
              Need an account?{" "}
              <button
                type="button"
                onClick={() => setModeAndClear("signup")}
                className="font-semibold text-[#b91c1c] hover:underline"
              >
                Create one
              </button>
            </>
          )}
        </div>

        <div className="mt-4 text-sm text-slate-500">
          <Link href={nextUrl} className="hover:underline">
            Back
          </Link>
        </div>
      </div>
    </div>
  );
}

function AuthPageFallback() {
  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <div className="rounded-2xl border border-[var(--aa-silver)] bg-white p-6 shadow-sm">
        <div className="text-sm text-slate-600">Loading account page...</div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<AuthPageFallback />}>
      <AuthPageInner />
    </Suspense>
  );
}