"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import ShieldIcon from "@/app/components/ShieldIcon";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function cleanRegistration(reg: string) {
  return reg.replace(/\s/g, "").toUpperCase();
}

function formatRegistrationInput(value: string) {
  const cleaned = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

  if (cleaned.length <= 4) return cleaned;
  return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)}`;
}

export default function HomePage() {
  const router = useRouter();

  const supabase = useMemo(
    () => createBrowserClient(supabaseUrl, supabaseAnonKey),
    []
  );

  const [registration, setRegistration] = useState("");
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) return;
      setUserEmail(
        typeof user?.email === "string" && user.email.trim()
          ? user.email.trim()
          : null
      );
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextEmail =
        typeof session?.user?.email === "string" && session.user.email.trim()
          ? session.user.email.trim()
          : null;

      setUserEmail(nextEmail);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const cleaned = cleanRegistration(registration.trim());
    if (!cleaned) return;

    setLoading(true);
    router.push(`/check?registration=${encodeURIComponent(cleaned)}`);
  }

  return (
    <div className="min-h-screen bg-[var(--aa-bg)]">
      <main>
        <section className="mx-auto mt-3 max-w-7xl px-3 sm:px-4">
          <div className="relative overflow-hidden rounded-[1.6rem] bg-[var(--aa-black)] shadow-[0_16px_48px_rgba(15,23,42,0.12)]">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url('/hero-car-road.png')" }}
            />

            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,0.48)_0%,rgba(10,10,10,0.18)_34%,rgba(10,10,10,0.34)_100%)]" />

            <div className="relative mx-auto flex min-h-[320px] max-w-7xl flex-col items-center justify-center px-4 py-8 text-center sm:min-h-[360px] sm:py-10 lg:min-h-[400px]">
              <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/85">
                UK used car risk check
              </div>

              <h1 className="mt-3 max-w-5xl text-3xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)] sm:text-4xl lg:text-5xl">
                Know the risks before you buy a used car
              </h1>

              <p className="mt-3 max-w-3xl text-base leading-6 text-white/92 drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)] sm:text-lg">
                Get instant repair-cost signals, MoT-based warnings and optional
                vehicle history checks from a registration.
              </p>

              <div className="mt-5 grid w-full max-w-3xl grid-cols-1 gap-2 sm:grid-cols-3">
                <QuickStep
                  number="1"
                  title="Enter reg"
                  text="Start with the registration plate"
                />
                <QuickStep
                  number="2"
                  title="See snapshot"
                  text="Get fast risk and price context"
                />
                <QuickStep
                  number="3"
                  title="Unlock full report"
                  text="View findings, MoT analysis and checks"
                />
              </div>

              <div className="mt-5 w-full max-w-3xl rounded-2xl border border-white/20 bg-white/94 p-3 shadow-[0_18px_50px_rgba(0,0,0,0.18)] backdrop-blur">
                <form
                  onSubmit={handleSubmit}
                  className="flex flex-col gap-2.5 sm:flex-row"
                >
                  <input
                    type="text"
                    name="registration"
                    value={registration}
                    onChange={(e) =>
                      setRegistration(formatRegistrationInput(e.target.value))
                    }
                    placeholder="ENTER REGISTRATION"
                    autoCapitalize="characters"
                    autoCorrect="off"
                    spellCheck={false}
                    disabled={loading}
                    className="h-13 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-base font-semibold uppercase tracking-[0.12em] text-slate-900 placeholder:text-slate-400 focus:border-[var(--aa-red)] sm:h-14 sm:text-lg"
                  />

                  <button
                    type="submit"
                    disabled={!registration.trim() || loading}
                    className="inline-flex h-13 items-center justify-center rounded-xl border border-[var(--aa-red)] bg-[var(--aa-red)] px-6 text-base font-bold text-white transition hover:border-[var(--aa-red-strong)] hover:bg-[var(--aa-red-strong)] disabled:opacity-50 sm:h-14 sm:text-lg"
                  >
                    {loading ? "Continuing…" : "Check my car"}
                  </button>
                </form>

                <div className="mt-2.5 flex flex-col gap-1.5 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
                  <div className="text-xs text-slate-500">
                    Instant snapshot first. Full report available after.
                  </div>

                  <Link
                    href="/manual-check"
                    className="text-sm font-medium text-[var(--aa-red)] transition hover:text-[var(--aa-red-strong)] hover:underline"
                  >
                    Or check manually
                  </Link>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-white/85">
                <span className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1">
                  Core report £4.99
                </span>
                <span className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1">
                  Full bundle £9.99
                </span>
                <span className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1">
                  UK MoT + history signals
                </span>
              </div>
            </div>
          </div>
        </section>

        {userEmail ? (
          <section className="mx-auto mt-4 max-w-7xl px-3 sm:px-4">
            <div className="rounded-[1.4rem] border border-black bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-3xl">
                  <div className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700">
                    Welcome back
                  </div>

                  <h2 className="mt-3 text-xl font-extrabold tracking-tight text-slate-950 sm:text-2xl">
                    Continue where you left off
                  </h2>

                  <p className="mt-1.5 text-sm leading-5 text-slate-700">
                    You’re signed in as{" "}
                    <span className="font-semibold text-slate-950">
                      {userEmail}
                    </span>
                    . View your saved reports or start a fresh check on another
                    vehicle.
                  </p>
                </div>

                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
                  <Link
                    href="/reports"
                    className="btn-primary w-full text-center sm:w-auto"
                  >
                    View saved reports
                  </Link>

                  <Link
                    href="/check"
                    className="btn-outline w-full text-center sm:w-auto"
                  >
                    Start a new check
                  </Link>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        <section className="mx-auto mt-4 max-w-7xl px-3 sm:px-4">
          <div className="grid gap-3 md:grid-cols-3">
            <FeatureCard
              title="Fast snapshot"
              subtitle="See likely repair exposure quickly"
            />
            <FeatureCard
              title="MoT insight"
              subtitle="Spot repeat advisories and history patterns"
            />
            <FeatureCard
              title="History checks"
              subtitle="Add finance, write-off and keeper signals"
            />
          </div>
        </section>

        <section className="mx-auto mt-4 max-w-7xl px-3 sm:px-4">
          <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[1.35rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="inline-flex items-center rounded-full border border-slate-300 bg-slate-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-700">
                What you get
              </div>

              <h2 className="mt-3 text-xl font-extrabold tracking-tight text-slate-950">
                A clearer buying decision, faster
              </h2>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <ChecklistItem text="Near-term repair exposure estimate" />
                <ChecklistItem text="Detailed flagged findings" />
                <ChecklistItem text="Seller questions and red flags" />
                <ChecklistItem text="MoT advisory and failure patterns" />
                <ChecklistItem text="Price vs market context" />
                <ChecklistItem text="Optional HPI-style history checks" />
              </div>

              <div className="mt-4">
                <Link href="/check" className="btn-primary">
                  Start your check
                </Link>
              </div>
            </div>

            <section
              id="pricing"
              className="rounded-[1.35rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
            >
              <div className="inline-flex items-center rounded-full border border-slate-300 bg-slate-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-700">
                Pricing
              </div>

              <div className="mt-3 grid gap-3">
                <div className="rounded-xl border border-[var(--aa-silver)] bg-slate-50 p-3">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Core report
                  </div>
                  <div className="mt-1 text-3xl font-extrabold tracking-tight text-black">
                    £4.99
                  </div>
                  <div className="mt-1 text-sm leading-5 text-slate-700">
                    Detailed findings, repair exposure, seller questions and MoT
                    analysis.
                  </div>
                </div>

                <div className="rounded-xl border border-[var(--aa-red)]/20 bg-[var(--aa-red)]/5 p-3">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--aa-red)]">
                    Full bundle
                  </div>
                  <div className="mt-1 text-3xl font-extrabold tracking-tight text-black">
                    £9.99
                  </div>
                  <div className="mt-1 text-sm leading-5 text-slate-700">
                    Core report plus HPI-style finance, write-off, stolen,
                    mileage and keeper checks.
                  </div>
                </div>
              </div>
            </section>
          </div>
        </section>

        <section className="mx-auto mt-4 max-w-7xl px-3 pb-6 sm:px-4 sm:pb-8">
          <div className="rounded-[1.35rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="text-sm font-semibold text-slate-950">
              Before you buy any used car
            </div>
            <p className="mt-1.5 text-sm leading-5 text-slate-700">
              Start with the reg. Get a fast snapshot. Then decide whether the
              vehicle looks clean enough to proceed, negotiate harder, or walk
              away.
            </p>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Link
                href="/check"
                className="btn-primary w-full text-center sm:w-auto"
              >
                Check a registration
              </Link>
              <Link
                href="/manual-check"
                className="btn-outline w-full text-center sm:w-auto"
              >
                Check manually
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function QuickStep({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 text-left text-white backdrop-blur">
      <div className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-white/20 px-1.5 text-[10px] font-bold">
        {number}
      </div>
      <div className="mt-1 text-sm font-semibold">{title}</div>
      <div className="mt-0.5 text-xs leading-5 text-white/80">{text}</div>
    </div>
  );
}

function FeatureCard({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="rounded-[1.2rem] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <ShieldIcon className="mt-0.5 h-9 w-9 shrink-0" />
        <div>
          <div className="text-base font-extrabold tracking-tight text-[var(--aa-black)]">
            {title}
          </div>
          <div className="mt-0.5 text-sm leading-5 text-slate-700">
            {subtitle}
          </div>
        </div>
      </div>
    </div>
  );
}

function ChecklistItem({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800">
      {text}
    </div>
  );
}