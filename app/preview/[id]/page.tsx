/* page.tsx for Snapshot page (in app/preview/[id]/page.tsx) */

/* Mark this file as a Client Component */
'use client';  // This line is needed for using useState, useEffect, and next/navigation

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';  // Use `useParams` from next/navigation

const SnapshotPage = () => {
  const [reportData, setReportData] = useState<any>(null);
  const { id } = useParams(); // Get the dynamic 'id' from the URL params

  useEffect(() => {
    if (id) {
      // Fetch the report data using the reportId (id in the URL)
      fetch(`/api/reports/${id}`)
        .then((res) => res.json())
        .then((data) => setReportData(data))
        .catch((error) => console.error('Error fetching report:', error));
    }
  }, [id]);

  if (!reportData) return <div>Loading...</div>;

  return (
    <div className="snapshot-page">
      <h1 className="text-4xl font-bold text-center mb-8">AutoAudit Snapshot</h1>
      <div className="flex justify-center">
        <p className="text-xl mb-8">Estimated Immediate Maintenance Exposure</p>
      </div>
      <div className="summary">
        <p className="text-xl text-center mb-8">
          £{reportData.exposure_low} - £{reportData.exposure_high}
        </p>
        <p className="text-lg text-center mb-8">Risk Level: {reportData.risk_level}</p>
        <ul className="cost-drivers">
          {reportData.primary_drivers.map((driver: any) => (
            <li key={driver.label} className="cost-driver">
              <strong>{driver.label}</strong>: {driver.reason_short}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex justify-center mt-8">
        <a href={`/full-report/${id}`} className="button-link">
          Unlock Full Report - £3.99
        </a>
      </div>
    </div>
  );
};

export default SnapshotPage;