import Link from "next/link";

export default function SuccessPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-extrabold">Payment confirmed ✅</h1>
      <p className="mt-2 text-slate-700">Your AutoAudit report is unlocked.</p>
      <p className="mt-2 text-slate-700">
        If it doesn&apos;t unlock instantly, refresh the page.
      </p>
      <Link href="/check" className="mt-6 inline-block text-emerald-700 hover:underline">
        Start another check →
      </Link>
    </div>
  );
}
