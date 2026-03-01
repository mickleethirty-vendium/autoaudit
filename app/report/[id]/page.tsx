/* page.tsx for Vehicle Risk Report */
'use client';  // Mark this as a client component

import { useEffect, useState } from 'react';

const VehicleRiskReport = ({ reportId }: { reportId: string }) => {
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    // Fetch the full report data using the reportId
    fetch(`/api/reports/full/${reportId}`)
      .then((res) => res.json())
      .then((data) => setReportData(data))
      .catch((error) => console.error('Error fetching full report:', error));
  }, [reportId]);

  if (!reportData) return <div>Loading...</div>;

  return (
    <div className="vehicle-risk-report">
      <h1 className="text-4xl font-bold text-center mb-8">Vehicle Risk Report</h1>
      <div className="flex justify-center">
        <h2 className="text-3xl mb-8">{reportData.vehicle.make} {reportData.vehicle.model}</h2>
        <p className="text-lg mb-8">Mileage: {reportData.vehicle.mileage} miles</p>
      </div>
      <div className="report-summary">
        <p className="text-xl mb-4">Estimated Immediate Maintenance Exposure: £{reportData.exposure}</p>
        <p className="text-lg">Risk Level: {reportData.risk_level}</p>
      </div>

      <h3 className="text-2xl mt-8 mb-4">Top Cost Drivers</h3>
      <ul>
        {reportData.top_drivers.map((driver: any) => (
          <li key={driver.label} className="cost-driver">
            <strong>{driver.label}</strong>: {driver.cost_estimate}
          </li>
        ))}
      </ul>

      <h3 className="text-2xl mt-8 mb-4">Seller Questions</h3>
      <ul>
        {reportData.seller_questions.map((question: string) => (
          <li key={question}>{question}</li>
        ))}
      </ul>

      <h3 className="text-2xl mt-8 mb-4">Negotiation Script</h3>
      <p>{reportData.negotiation_script}</p>
    </div>
  );
};

export default VehicleRiskReport;