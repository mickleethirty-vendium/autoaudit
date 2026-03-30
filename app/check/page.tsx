import { Suspense } from "react";
import CheckForm from "./ui/CheckForm";

export default function CheckPage() {
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
                Vehicle details
              </div>

              <h1 className="mt-3 max-w-5xl text-3xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)] sm:text-4xl lg:text-5xl">
                Add a few more details
              </h1>

              <p className="mt-3 max-w-3xl text-base leading-6 text-white/92 drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)] sm:text-lg">
                We’ve got the registration. Now add mileage, gearbox type and
                asking price so we can build a more useful snapshot.
              </p>

              <div className="mt-5 grid w-full max-w-3xl grid-cols-1 gap-2 sm:grid-cols-3">
                <QuickInfo
                  title="Mileage"
                  text="Helps price wear and expected maintenance"
                />
                <QuickInfo
                  title="Gearbox"
                  text="Improves model and component matching"
                />
                <QuickInfo
                  title="Asking price"
                  text="Lets us compare it with market value"
                />
              </div>

              <div className="mt-5 w-full max-w-3xl rounded-2xl border border-white/20 bg-white/94 p-3 shadow-[0_18px_50px_rgba(0,0,0,0.18)] backdrop-blur">
                <div className="mb-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-left">
                  <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                    Before you continue
                  </div>
                  <div className="mt-1 text-sm leading-5 text-slate-700">
                    The more accurate these details are, the more useful your
                    risk snapshot and price guidance will be.
                  </div>
                </div>

                <Suspense
                  fallback={
                    <div className="rounded-xl border border-[var(--aa-silver)] bg-slate-50 p-3 text-sm text-slate-600">
                      Loading vehicle check…
                    </div>
                  }
                >
                  <CheckForm />
                </Suspense>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function QuickInfo({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 text-left text-white backdrop-blur">
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-0.5 text-xs leading-5 text-white/80">{text}</div>
    </div>
  );
}