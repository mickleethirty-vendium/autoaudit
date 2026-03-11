import CheckForm from "./ui/CheckForm";

export default function CheckPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-extrabold tracking-tight text-black">
        Start a check
      </h1>

      <p className="mt-2 text-slate-700">
        Enter basic details. You&apos;ll get a free snapshot. Pay to unlock the full report.
      </p>

      <div className="mt-6 rounded-2xl border border-[var(--aa-silver)] bg-white p-6 shadow-sm">
        <CheckForm />
      </div>
    </div>
  );
}