// Present the existing provider summary without reinterpreting its findings.
export function getHpiChecks(summary: any) {
  if (!summary || typeof summary !== "object") return [];

  const candidates = [
    {
      label: "Finance",
      keys: ["finance", "has_finance", "outstanding_finance"],
    },
    {
      label: "Write-off",
      keys: ["writeOff", "write_off", "insurance_write_off"],
    },
    { label: "Stolen", keys: ["stolen", "is_stolen"] },
    { label: "Mileage", keys: ["mileageFlag", "mileageAnomaly", "mileage_anomaly"] },
    { label: "Keepers", keys: ["keeperHistory", "keeper_history", "keepers"] },
    { label: "Plate changes", keys: ["plateChanges", "plate_changes"] },
  ];

  return candidates
    .map((item) => {
      const foundKey = item.keys.find((key) => key in summary);
      if (!foundKey) return null;
      return {
        label: item.label,
        value: summary[foundKey],
      };
    })
    .filter(Boolean) as { label: string; value: any }[];
}

