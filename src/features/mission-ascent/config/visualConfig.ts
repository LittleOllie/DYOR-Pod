/** Centralised entity visual tuning — colours, scales, animation, effects. */

export const missionVisuals = {
  colours: {
    teal: "#31d1c6",
    tealBright: "#4ecde8",
    tealDeep: "#13a9a6",
    cyan: "#7dd3fc",
    navy: "#061821",
    navyDeep: "#040f14",
    metal: "#1a3038",
    metalLight: "#2a4550",
    amber: "#e5cf59",
    amberDeep: "#c4b04a",
    white: "#e8f4f4",
    shield: "#3ecf8e",
    frost: "#6ee7d8",
    rock: "#4a4038",
    rockDark: "#2a2420",
    rockLight: "#6b5d52",
    debris: "#5a6470",
    warning: "#e85d4c",
    warningAmber: "#d97706",
    rugGlitch: "#9333ea",
    fud: "#64748b",
  },

  scales: {
    rocket: 1.25,
    dataShard: 1.4,
    dataCluster: 1.45,
    fuelCell: 1.45,
    shieldCore: 1.45,
    coolingCore: 1.45,
    signalBeacon: 1.5,
    logoComponent: 2.4,
    asteroidSmall: 1.25,
    asteroidMedium: 1.4,
    asteroidLarge: 1.55,
    debris: 1.35,
    drone: 1.4,
    radiation: 1.35,
    fudCloud: 1.35,
    rugSignal: 1.35,
  },

  glow: {
    pickup: 14,
    pickupHigh: 22,
    hazard: 8,
    logo: 28,
    logoReduced: 12,
    shadowBlurMax: 18,
  },

  lineWidths: {
    thin: 0.75,
    medium: 1.25,
    thick: 2,
    frame: 2.5,
  },

  rotationSpeeds: {
    shard: 0.9,
    fuelClamp: 0.6,
    shieldRing: 0.8,
    coolingRotor: 1.4,
    beaconRadar: 0.5,
    asteroid: 0.35,
    debris: 0.45,
    drone: 0.7,
  },

  pulseSpeeds: {
    slow: 0.002,
    medium: 0.003,
    fast: 0.005,
    logo: 0.004,
  },

  particleCounts: {
    logoTrail: 4,
    pickupBurst: 8,
    impactFragments: 10,
    asteroidDebris: 3,
  },

  reducedEffectsParticleCounts: {
    logoTrail: 0,
    pickupBurst: 3,
    impactFragments: 4,
    asteroidDebris: 1,
  },

  effects: {
    pickupRingMs: 420,
    impactFlashMs: 380,
    nearMissMs: 520,
    targetingPulseMs: 900,
  },
} as const;

export type MissionVisualQuality = "high" | "standard" | "reduced";
