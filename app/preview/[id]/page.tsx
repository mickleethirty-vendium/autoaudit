/* Updated page.tsx for Snapshot page (in app/preview/[id]/page.tsx) */

import { supabasePublic } from "@/lib/supabase";
import { GetServerSideProps } from "next";

// Define money formatting
function money(n: number) {
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `£${Math.round(n)}`;
  }
}

const SnapshotPage = ({ reportData }: { reportData: any }) => {
  if (!reportData) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-center mb-8">AutoAudit Snapshot</h1>

      <div className="flex justify-center">
        <p className="text-xl text-gray-700 mb-8">Estimated Immediate Maintenance Exposure</p>
      </div>

      <div className="summary bg-white rounded-xl shadow-lg p-8 mb-8">
        <p className="text-3xl font-extrabold text-center text-gray-800">
          {money(reportData.exposure_low)} – {money(reportData.exposure_high)}
        </p>
        <p className="text-lg text-center text-gray-600 mb-4">Risk Level: {reportData.risk_level}</p>

        <ul className="cost-drivers mt-4">
          {reportData.primary_drivers.map((driver: any) => (
            <li key={driver.label} className="cost-driver text-lg text-gray-700 mb-3">
              <strong>{driver.label}</strong>: {driver.reason_short}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex justify-center mt-8">
        <a
          href={`/full-report/${reportData.id}`}
          className="inline-block bg-green-600 text-white py-3 px-6 rounded-full text-lg font-semibold hover:bg-green-700 transition-all"
        >
          Unlock Full Report - £3.99
        </a>
      </div>
    </div>
  );
};

// Server-side props fetching
export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const { id } = params as { id: string };

  const { data, error } = await supabasePublic
    .from("reports")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return { notFound: true }; // 404 if no report found
  }

  return { props: { reportData: data } };
};

export default SnapshotPage;