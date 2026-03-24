import { FailurePattern } from "./types";

export const failureLibrary: Record<string, FailurePattern> = {
  WET_BELT_ECOBOOST: {
    code: "WET_BELT_ECOBOOST",
    label: "Wet timing belt degradation",
    category: "timing",
    severity: "high",
    cost_low: 900,
    cost_high: 1800,
    description:
      "Some Ford EcoBoost engines use a wet timing belt that runs in oil. Over time it can degrade and contaminate the oil system.",
    why_it_matters:
      "If ignored, belt failure can cause major engine damage.",
    questions_to_ask: [
      "Has the wet belt been replaced?",
      "Is there proof of oil changes at correct intervals?",
    ],
    red_flags: [
      "Oil contamination",
      "No service history",
      "Rattling timing noise on startup",
    ],
  },

  BMW_N47_TIMING_CHAIN: {
    code: "BMW_N47_TIMING_CHAIN",
    label: "Timing chain wear",
    category: "timing",
    severity: "high",
    cost_low: 1200,
    cost_high: 2500,
    description:
      "BMW N47 diesel engines are known for premature timing chain wear located at the rear of the engine.",
    why_it_matters:
      "Failure can cause severe engine damage and expensive repairs.",
    questions_to_ask: [
      "Has the timing chain been replaced?",
      "Any rattling noise from the rear of the engine?",
    ],
    red_flags: [
      "Cold start rattling",
      "Chain replacement already advised",
      "Incomplete service history",
    ],
  },

  VW_DSG_MECHATRONICS: {
    code: "VW_DSG_MECHATRONICS",
    label: "DSG mechatronic unit failure",
    category: "transmission",
    severity: "medium",
    cost_low: 900,
    cost_high: 1800,
    description:
      "Certain VW Group DSG gearboxes experience mechatronic unit faults causing shifting problems.",
    why_it_matters:
      "Gearbox faults can affect drivability and require specialist repair.",
    questions_to_ask: [
      "Has the DSG gearbox been serviced regularly?",
      "Any hesitation or jerky gear changes?",
    ],
    red_flags: [
      "Gear selection hesitation",
      "Warning lights for transmission",
      "Harsh gear changes",
    ],
  },

  TURBO_FAILURE: {
    code: "TURBO_FAILURE",
    label: "Turbocharger wear or failure",
    category: "turbo",
    severity: "medium",
    cost_low: 600,
    cost_high: 1500,
    description:
      "Turbochargers can wear over time, particularly on high-mileage diesel vehicles.",
    why_it_matters:
      "Turbo failure can reduce performance and increase repair costs.",
    questions_to_ask: [
      "Has the turbo ever been replaced?",
      "Any smoke under acceleration?",
    ],
    red_flags: [
      "Whistling turbo noise",
      "Loss of power",
      "Blue or black exhaust smoke",
    ],
  },

  EGR_VALVE_CLOGGING: {
    code: "EGR_VALVE_CLOGGING",
    label: "EGR valve clogging",
    category: "emissions",
    severity: "medium",
    cost_low: 250,
    cost_high: 700,
    description:
      "Exhaust gas recirculation valves can clog with soot, especially on diesel vehicles used mainly for short journeys.",
    why_it_matters:
      "Can trigger engine management lights and reduce efficiency.",
    questions_to_ask: [
      "Has the EGR valve been cleaned or replaced?",
      "Is the vehicle mainly used for short trips?",
    ],
    red_flags: [
      "Engine management light",
      "Rough idling",
      "Reduced engine performance",
    ],
  },

  DPF_BLOCKAGE: {
    code: "DPF_BLOCKAGE",
    label: "Diesel particulate filter blockage",
    category: "emissions",
    severity: "medium",
    cost_low: 400,
    cost_high: 1200,
    description:
      "DPF systems can become blocked if the vehicle is mainly used for short journeys.",
    why_it_matters:
      "Blocked DPF filters can trigger limp mode and expensive repairs.",
    questions_to_ask: [
      "Has the DPF been replaced or cleaned?",
      "Is the vehicle used for long motorway drives?",
    ],
    red_flags: [
      "DPF warning light",
      "Limp mode",
      "Frequent regeneration cycles",
    ],
  },

  WATER_PUMP_LEAK: {
    code: "WATER_PUMP_LEAK",
    label: "Water pump failure",
    category: "cooling",
    severity: "medium",
    cost_low: 250,
    cost_high: 700,
    description:
      "Water pumps can fail or leak over time, particularly on higher mileage vehicles.",
    why_it_matters:
      "Cooling failure can lead to overheating and engine damage.",
    questions_to_ask: [
      "Has the water pump been replaced recently?",
      "Any history of overheating?",
    ],
    red_flags: [
      "Coolant leaks",
      "Overheating warnings",
      "Low coolant levels",
    ],
  },

  SUSPENSION_BUSH_WEAR: {
    code: "SUSPENSION_BUSH_WEAR",
    label: "Suspension bush wear",
    category: "suspension",
    severity: "low",
    cost_low: 200,
    cost_high: 600,
    description:
      "Suspension bushes wear over time, particularly on vehicles used on poor road surfaces.",
    why_it_matters:
      "Worn bushes affect ride quality and steering precision.",
    questions_to_ask: [
      "Any knocking noises from suspension?",
      "Have suspension components been replaced recently?",
    ],
    red_flags: [
      "Knocking noises over bumps",
      "Uneven tyre wear",
    ],
  },

  CLUTCH_DUAL_MASS_FLYWHEEL: {
    code: "CLUTCH_DUAL_MASS_FLYWHEEL",
    label: "Dual-mass flywheel wear",
    category: "drivetrain",
    severity: "medium",
    cost_low: 700,
    cost_high: 1600,
    description:
      "Dual-mass flywheels can wear over time, causing vibration or clutch issues.",
    why_it_matters:
      "Failure can lead to clutch replacement and drivetrain repairs.",
    questions_to_ask: [
      "Has the clutch or flywheel been replaced?",
      "Any vibration when starting or stopping?",
    ],
    red_flags: [
      "Clutch vibration",
      "Difficulty engaging gears",
    ],
  },
};