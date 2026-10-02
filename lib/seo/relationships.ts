import { allMotAdvisoryTypes } from "./data";

// General component examples, not claims about a model's failure frequency.
const generalGuideSlugs = [
  "brake-pads-worn", "front-tyres-low-tread",
  "suspension-arm-bush-worn", "headlamp-lens-cloudy",
];
export const generalAdvisoryGuides = generalGuideSlugs.map((slug) =>
  allMotAdvisoryTypes.find((row) => row.advisory_slug === slug)!,
);

// Explicit component relationships. Missing relationships stay empty rather
// than falling back to array order or inventing vehicle-specific associations.
export const advisoryComponentGroups = [
  ["brake-pads-worn", "brake-discs-worn-or-pitted", "rear-brake-corrosion", "brake-dust-shield-insecure"],
  ["brake-pipe-corroded", "brake-hose-deteriorated", "brake-fluid-leak-minor", "master-cylinder-seepage", "brake-pedal-travel-excessive"],
  ["parking-brake-efficiency-low", "parking-brake-binding", "handbrake-cable-corroded", "electronic-parking-brake-fault", "parking-brake-switch-fault"],
  ["track-rod-end-play", "inner-track-rod-play", "steering-rack-gaiter-damaged", "steering-rack-mounting-worn", "steering-wheel-off-centre"],
  ["power-steering-fluid-leak", "uneven-steering-assistance", "eps-warning-history"],
  ["windscreen-chip", "windscreen-crack-small", "windscreen-bond-seepage"],
  ["wiper-blades-deteriorated", "washer-jets-misaligned", "washer-fluid-warning", "heater-not-demisting"],
  ["headlamp-lens-cloudy", "headlamp-aim", "headlamp-bulb-dim"],
  ["side-light-inoperative", "brake-light-intermittent", "indicator-repeaters-faulty", "rear-fog-light-issue", "number-plate-light-out", "reverse-light-fault"],
  ["battery-insecure", "battery-condition-weak", "charging-system-warning"],
  ["wiring-chafed", "fusebox-water-ingress", "12v-socket-fault"],
  ["front-tyres-low-tread", "rear-tyres-low-tread", "tyre-sidewall-damaged", "tyre-uneven-wear", "tyre-pressure-mismatch", "wheel-alignment-off"],
  ["tpms-warning", "tpms-sensor-fault", "tyre-pressure-mismatch"],
  ["suspension-arm-bush-worn", "ball-joint-play", "drop-link-worn", "rear-axle-bush-worn", "suspension-arm-corrosion"],
  ["shock-absorber-misting", "shock-absorber-weak", "rear-shock-bush-worn", "top-mount-worn"],
  ["coil-spring-corroded", "coil-spring-broken-end", "leaf-spring-wear"],
  ["subframe-corrosion", "subframe-affecting-steering", "subframe-shield-corroded"],
  ["sill-corrosion", "floorpan-corrosion", "inner-wing-corrosion"],
  ["exhaust-corroded", "exhaust-leak-minor", "exhaust-noise"],
  ["engine-management-light", "mil-on", "catalyst-efficiency-low", "exhaust-emissions-borderline"],
  ["dpf-warning", "smoke-under-load", "exhaust-emissions-borderline"],
  ["adblue-warning", "adblue-no-start-risk"],
  ["coolant-leak", "coolant-temperature-fluctuation"],
  ["seat-belt-frayed", "seat-belt-warning-light", "seat-mount-loose"],
  ["door-lock-fault", "keyless-entry-fault", "immobiliser-warning"],
];

export function getRelatedAdvisories(slug: string) {
  const related = new Set(advisoryComponentGroups
    .filter((group) => group.includes(slug)).flat());
  related.delete(slug);
  return allMotAdvisoryTypes
    .filter((row) => related.has(row.advisory_slug))
    .sort((a, b) => a.advisory_label.localeCompare(b.advisory_label));
}
