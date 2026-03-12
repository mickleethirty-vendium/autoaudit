import CheckForm from "./ui/CheckForm";

export default function CheckPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">

      <div className="inline-flex items-center rounded-full border border-[var(--aa-silver)] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#b91c1c] shadow-sm">
        AutoAudit
      </div>

      <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-black sm:text-5xl">
        Start a vehicle check
      </h1>

      <p className="mt-3 max-w-xl text-base leading-7 text-slate-700">
        Enter a few vehicle details to generate an instant maintenance exposure estimate.
        You’ll see a free snapshot immediately and can unlock the full report if needed.
      </p>

      <div className="mt-8 rounded-2xl border border-[var(--aa-silver)] bg-white p-6 shadow-sm">
        <CheckForm />
      </div>

    </div>
  );
}