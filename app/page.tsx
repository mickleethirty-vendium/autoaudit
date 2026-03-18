import Link from "next/link";
import ShieldIcon from "@/app/components/ShieldIcon";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--aa-bg)]">
      <header className="border-b border-white/10 bg-[var(--aa-black)] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link
            href="/"
            className="text-3xl font-extrabold tracking-tight"
          >
            <span className="text-white">Auto</span>
            <span className="text-[var(--aa-red)]">Audit</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href="/how-it-works"
              className="text-sm font-semibold text-white/90 transition hover:text-white"
            >
              How it works
            </Link>

            <a
              href="#pricing"
              className="text-sm font-semibold text-white/90 transition hover:text-white"
            >
              Pricing
            </a>

            <Link
              href="/auth?mode=login"
              className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Log In
            </Link>

            <Link href="/check" className="btn-primary border-[var(--aa-red)] bg-[var(--aa-red)] hover:border-[var(--aa-red-strong)] hover:bg-[var(--aa-red-strong)]">
              Start a Check
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden bg-[var(--aa-black)]">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/hero-car-road.png')" }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,0.45)_0%,rgba(10,10,10,0.18)_35%,rgba(10,10,10,0.30)_100%)]" />

          <div className="relative mx-auto flex min-h-[620px] max-w-7xl flex-col items-center justify-center px-4 py-16 text-center sm:min-h-[680px]">
            <h1 className="max-w-5xl text-4xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)] sm:text-5xl lg:text-6xl">
              Know the Risks Before You Buy a Used Car
            </h1>

            <p className="mt-5 max-w-3xl text-lg leading-8 text-white/92 drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)] sm:text-2xl">
              Get instant repair cost estimates and hidden risk checks
            </p>

            <div className="mt-10 w-full max-w-3xl rounded-2xl border border-white/20 bg-white/92 p-3 shadow-[0_20px_60px_rgba(0,0,0,0.20)] backdrop-blur">
              <form
                action="/check"
                method="get"
                className="flex flex-col gap-3 sm:flex-row"
              >
                <input
                  type="text"
                  name="registration"
                  placeholder="Enter Registration"
                  className="h-16 flex-1 rounded-xl border border-slate-200 bg-white px-5 text-xl font-medium text-slate-900 placeholder:text-slate-400 focus:border-[var(--aa-red)]"
                />

                <button
                  type="submit"
                  className="inline-flex h-16 items-center justify-center rounded-xl border border-[var(--aa-red)] bg-[var(--aa-red)] px-8 text-xl font-bold text-white transition hover:border-[var(--aa-red-strong)] hover:bg-[var(--aa-red-strong)]"
                >
                  Check My Car
                </button>
              </form>
            </div>
          </div>
        </section>

        <section className="border-t border-[var(--aa-silver)] bg-white">
          <div className="mx-auto max-w-7xl px-4 py-8">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="flex items-start justify-center gap-4 text-center md:text-left">
                <ShieldIcon className="mt-1 h-12 w-12 shrink-0" />
                <div>
                  <div className="text-3xl font-extrabold tracking-tight text-[var(--aa-black)]">
                    Fast Results
                  </div>
                  <div className="mt-2 text-2xl font-medium text-slate-700">
                    Repair Estimates
                  </div>
                </div>
              </div>

              <div className="flex items-start justify-center gap-4 border-y border-[var(--aa-silver)] py-8 text-center md:border-x md:border-y-0 md:py-0 md:text-left">
                <ShieldIcon className="mt-1 h-12 w-12 shrink-0" />
                <div>
                  <div className="text-3xl font-extrabold tracking-tight text-[var(--aa-black)]">
                    UK-Specific
                  </div>
                  <div className="mt-2 text-2xl font-medium text-slate-700">
                    MoT Insights
                  </div>
                </div>
              </div>

              <div className="flex items-start justify-center gap-4 text-center md:text-left">
                <ShieldIcon className="mt-1 h-12 w-12 shrink-0" />
                <div>
                  <div className="text-3xl font-extrabold tracking-tight text-[var(--aa-black)]">
                    Trusted Reports
                  </div>
                  <div className="mt-2 text-2xl font-medium text-slate-700">
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
                  Detailed findings, repair exposure, seller questions and MoT analysis.
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
                  Core report plus HPI-style finance, write-off, stolen, mileage and keeper checks.
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}