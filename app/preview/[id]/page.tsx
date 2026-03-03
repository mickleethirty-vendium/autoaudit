/* SnapshotPage for app/preview/[id]/page.tsx */

/* No 'use client' here — this is a Server Component */
import { supabasePublic } from "@/lib/supabase";

const SnapshotPage = async ({ params }: { params: { id: string } }) => {
  // Fetch the report data directly in the component
  const { id } = params;
  const { data, error } = await supabasePublic
    .from("reports")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold">Report load error</h1>
        <p className="mt-2 text-sm text-slate-700">
          This page would normally show 404, but we’re showing the real error to fix it.
        </p>
      </div>
    );
  }

  const reg = (data.registration as string | null) ?? null;
  const make = (data.make as string | null) ?? null;
  const year = (data.car_year as number | null) ?? null;
  const mileage = (data.mileage as number | null) ?? null;
  const fuel = (data.fuel as string | null) ?? null;
  const transmission = (data.transmission as string | null) ?? null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-6 border-b pb-4">
        {reg ? (
          <h1 className="text-2xl font-bold">
            {reg}
            {make ? (
              <span className="text-slate-600 font-normal ml-2">· {make}</span>
            ) : null}
          </h1>
        ) : (
          <h1 className="text-2xl font-bold">Full Report</h1>
        )}

        <div className="text-sm text-slate-600 mt-2">
          {year ? `${year} · ` : ""}
          {fuel ? `${fuel} · ` : ""}
          {transmission ? `${transmission} · ` : ""}
          {typeof mileage === "number" ? `${mileage.toLocaleString()} miles` : ""}
        </div>
      </div>

      {/* Report details */}
      {/* ... rest of the report layout... */}
    </div>
  );
};

export default SnapshotPage;