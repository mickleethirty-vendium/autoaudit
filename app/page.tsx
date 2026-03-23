"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ShieldIcon from "@/app/components/ShieldIcon";

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

  const [registration, setRegistration] = useState("");
  const [loading, setLoading] = useState(false);

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
        <section className="mx-auto mt-4 max-w-7xl px-4">
          <div className="relative overflow-hidden rounded-3xl bg-[var(--aa-black)]">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url('/hero-car-road.png')" }}
            />

            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,0.42)_0%,rgba(10,10,10,0.16)_35%,rgba(10,10,10,0.28)_100%)]" />

            <div className="relative mx-auto flex min-h-[380px] max-w-7xl flex-col items-center justify-center px-4 py-10 text-center sm:min-h-[420px] sm:py-12 lg:min-h-[460px]">
              <h1 className="max-w-5xl text-4xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)] sm:text-5xl lg:text-6xl">
                Know the Risks Before You Buy a Used Car
              </h1>

              <p className="mt-4 max-w-3xl text-lg leading-8 text-white/92 drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)] sm:text-2xl">
                Get instant repair cost estimates and hidden risk checks
              </p>

              <div className="mt-8 w-full max-w-3xl rounded-2xl border border-white/20 bg-white/92 p-3 shadow-[0_20px_60px_rgba(0,0,0,0.20)] backdrop-blur">
                <form
                  onSubmit={handleSubmit}
                  className="flex flex-col gap-3 sm:flex-row"
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
                    className="h-14 flex-1 rounded-xl border border-slate-200 bg-white px-5 text-lg font-medium uppercase tracking-[0.12em] text-slate-900 placeholder:text-slate-400 focus:border-[var(--aa-red)] sm:h-16 sm:text-xl"
                  />

                  <button
                    type="submit"
                    disabled={!registration.trim() || loading}
                    className="inline-flex h-14 items-center justify-center rounded-xl border border-[var(--aa-red)] bg-[var(--aa-red)] px-8 text-lg font-bold text-white transition hover:border-[var(--aa-red-strong)] hover:bg-[var(--aa-red-strong)] disabled:opacity-50 sm:h-16 sm:text-xl"
                  >
                    {loading ? "Continuing…" : "Check My Car"}
                  </button>
                </form>

                <div className="mt-3 text-center sm:text-left">
                  <Link
                    href="/manual-check"
                    className="text-sm font-medium text-[var(--aa-red)] transition hover:text-[var(--aa-red-strong)] hover:underline"
                  >
                    Or check manually
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 border-t border-[var(--aa-silver)] bg-white">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
            <div className="grid gap-6 md:grid-cols-3 md:gap-8">
              <div className="flex items-start justify-center gap-4 text-center md:text-left">
                <ShieldIcon className="mt-1 h-12 w-12 shrink-0" />
                <div>
                  <div className="text-2xl font-extrabold tracking-tight text-[var(--aa-black)] sm:text-3xl">
                    Fast Results
                  </div>
                  <div className="mt-1 text-xl font-medium text-slate-700 sm:mt-2 sm:text-2xl">
                    Repair Estimates
                  </div>
                </div>
              </div>

              <div className="flex items-start justify-center gap-4 border-y border-[var(--aa-silver)] py-6 text-center md:border-x md:border-y-0 md:py-0 md:text-left">
                <ShieldIcon className="mt-1 h-12 w-12 shrink-0" />
                <div>
                  <div className="text-2xl font-extrabold tracking-tight text-[var(--aa-black)] sm:text-3xl">
                    UK-Specific
                  </div>
                  <div className="mt-1 text-xl font-medium text-slate-700 sm:mt-2 sm:text-2xl">
                    MoT Insights
                  </div>
                </div>
              </div>

              <div className="flex items-start justify-center gap-4 text-center md:text-left">
                <ShieldIcon className="mt-1 h-12 w-12 shrink-0" />
                <div>
                  <div className="text-2xl font-extrabold tracking-tight text-[var(--aa-black)] sm:text-3xl">
                    Trusted Reports
                  </div>
                  <div className="mt-1 text-xl font-medium text-slate-700 sm:mt-2 sm:text-2xl">
                    History Checks
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="bg-[var(--aa-bg)]">
          <div className="mx-auto max-w-7xl px-4 py-12">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-[var(--aa-silver)] bg-white p-6 shadow-sm">
                <div className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Core Report
                </div>
                <div className="mt-2 text-4xl font-extrabold tracking-tight text-black">
                  £4.99
                </div>
                <div className="mt-2 text-sm text-slate-700">
                  Detailed findings, repair exposure, seller questions and MoT
                  analysis.
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--aa-red)]/20 bg-[var(--aa-red)]/5 p-6 shadow-sm">
                <div className="text-sm font-semibold uppercase tracking-wide text-[var(--aa-red)]">
                  Full Bundle
                </div>
                <div className="mt-2 text-4xl font-extrabold tracking-tight text-black">
                  £9.99
                </div>
                <div className="mt-2 text-sm text-slate-700">
                  Core report plus HPI-style finance, write-off, stolen, mileage
                  and keeper checks.
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}