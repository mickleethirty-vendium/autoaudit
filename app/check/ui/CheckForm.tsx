/* CheckForm.tsx */
'use client';  // Mark this as a client component

import { useState } from 'react';

const CheckForm = () => {
  const [regNumber, setRegNumber] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [mileage, setMileage] = useState('');
  const [fuel, setFuel] = useState('');
  const [transmission, setTransmission] = useState('');
  const [isManualEntry, setIsManualEntry] = useState(false);

  const handleRegNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegNumber(e.target.value);
  };

  const handleManualEntryToggle = () => {
    setIsManualEntry(!isManualEntry);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle submission logic
  };

  return (
    <form onSubmit={handleSubmit} className="car-check-form">
      <h1 className="text-3xl font-bold text-center mb-8">Instant Car Maintenance Check</h1>
      <p className="text-center mb-8">Identify hidden costs before you buy</p>

      <div className="flex justify-center mb-6">
        <input
          type="text"
          value={regNumber}
          onChange={handleRegNumberChange}
          placeholder="Enter registration number"
          className="input-field w-full max-w-md"
        />
      </div>

      <div className="flex justify-center mb-6">
        <button type="button" onClick={handleManualEntryToggle} className="btn-toggle">
          {isManualEntry ? 'Use Registration' : 'Manual Entry'}
        </button>
      </div>

      {isManualEntry && (
        <div className="manual-entry">
          <input
            type="text"
            value={make}
            onChange={(e) => setMake(e.target.value)}
            placeholder="Car Make"
            className="input-field"
          />
          <input
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="Car Model"
            className="input-field"
          />
          <input
            type="text"
            value={mileage}
            onChange={(e) => setMileage(e.target.value)}
            placeholder="Mileage"
            className="input-field"
          />
          <select value={fuel} onChange={(e) => setFuel(e.target.value)} className="input-field">
            <option value="">Fuel Type</option>
            <option value="Petrol">Petrol</option>
            <option value="Diesel">Diesel</option>
            <option value="Electric">Electric</option>
          </select>
          <select value={transmission} onChange={(e) => setTransmission(e.target.value)} className="input-field">
            <option value="">Transmission</option>
            <option value="Manual">Manual</option>
            <option value="Automatic">Automatic</option>
          </select>
        </div>
      )}

      <div className="flex justify-center">
        <button type="submit" className="btn-submit">Check My Car</button>
      </div>
    </form>
  );
};

export default CheckForm;