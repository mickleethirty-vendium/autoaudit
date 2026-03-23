import { Suspense } from "react";
import CheckForm from "./ui/CheckForm";

export default function CheckPage() {
  return (
    <div className="min-h-screen bg-[var(--aa-bg)]">
      <main>
        <section className="relative overflow-hidden bg-[var(--aa-black)]">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/hero-car-road.png')" }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,0.42)_0%,rgba(10,10,10,0.16)_35%,rgba(10,10,10,0.28)_100%)]" />

          <div className="relative mx-auto flex min-h-[380px] max-w-7xl flex-col items-center justify-center px-4 py-10 text-center sm:min-h-[420px] sm:py-12 lg:min-h-[460px]">
            <h1 className="max-w-5xl text-4xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)] sm:text-5xl lg:text-6xl">
              Add a Few More Details
            </h1>

            <p className="mt-4 max-w-3xl text-lg leading-8 text-white/92 drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)] sm:text-2xl">
              We’ve got the registration. Now add mileage, gearbox type and
              asking price so we can build a more useful snapshot.
            </p>

            <div className="mt-8 w-full max-w-3xl rounded-2xl border border-white/20 bg-white/92 p-3 shadow-[0_20px_60px_rgba(0,0,0,0.20)] backdrop-blur">
              <Suspense
                fallback={
                  <div className="rounded-xl border border-[var(--aa-silver)] bg-slate-50 p-4 text-sm text-slate-600">
                    Loading vehicle check…
                  </div>
                }
              >
                <CheckForm />
              </Suspense>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}