import { Suspense } from "react";
import CheckForm from "./ui/CheckForm";

export default function CheckPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-10">
      <div className="mb-6">
        <div className="inline-flex items-center rounded-full border border-[var(--aa-silver)] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#b91c1c] shadow-sm">
          Step 2
        </div>

        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-black sm:text-4xl">
          Add a few more details
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-700 sm:text-base">
          We’ve got the registration. Now add mileage, gearbox type and asking
          price so we can build a more useful snapshot and compare the car
          against typical market value.
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--aa-silver)] bg-white p-5 shadow-sm sm:p-6">
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
  );
}