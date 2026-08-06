/** Central gameplay balance — tune values here only. */

export const missionConfig = {
  timedMissionSeconds: 120,
  initialFuel: 100,
  initialIntegrity: 3,
  maxShieldStored: 1,

  /** Player movement — fast arcade response */
  controls: {
    referencePlayfieldWidth: 900,
    horizontalAcceleration: 4400,
    horizontalMaxSpeed: 1080,
    horizontalDamping: 6,
    keyboardResponseBoost: 1.25,
    /** Screen-pixel drag delta → lateral velocity (per frame) */
    pointerDragSensitivity: 8.5,
    initialInputImpulse: 340,
    highThrottleHandlingPenalty: 0.06,
    maximumWidthSpeedScale: 1.65,
    playerBoundaryPadding: 24,
    playerYRatio: 0.72,
    edgeDamping: 0.28,
    lowThrottleInstability: 0,
    boostInstability: 10,
    bankAngleMax: 0.36,
  },

  playfield: {
    maxActiveWidth: 1200,
    viewportMargin: 12,
    maxRocketRenderScale: 1.55,
  },

  /** Throttle zones — LOW / CRUISE / BOOST arcade pacing */
  throttle: {
    baseScrollSpeed: 185,
    maxScrollSpeed: 620,
    /** Low throttle saves fuel but limits altitude gain */
    lowAltitudeMultiplier: 0.55,
    cruiseAltitudeMultiplier: 1,
    highAltitudeMultiplier: 1.35,
    boostAltitudeMultiplier: 1.75,
    /** Score multiplier by zone */
    lowScoreMultiplier: 0.85,
    cruiseScoreMultiplier: 1,
    highScoreMultiplier: 1.35,
    boostScoreMultiplier: 1.65,
    keyboardChangeRate: 0.95,
    overheatMaxThrottle: 0.52,
  },

  fuel: {
    lowRate: 0.06,
    cruiseRate: 0.16,
    highRate: 0.38,
    boostRate: 0.62,
    drainScale: 9,
    warningThresholds: [30, 15, 5] as const,
    failureSequenceSeconds: 1.6,
  },

  fuelAssist: {
    warningThreshold: 30,
    criticalThreshold: 15,
    spawnWeightAtWarning: 1.6,
    spawnWeightAtCritical: 2.5,
    minimumSecondsBetweenFuelSpawns: 4,
  },

  heat: {
    gainRate: 0.5,
    coolingRate: 0.6,
    overheatThreshold: 100,
    overheatCooldownMs: 2800,
    /** Extra heat gain above 85% throttle */
    boostHeatMultiplier: 1.8,
    /** Faster cooling below 40% throttle */
    idleCoolingBonus: 1.4,
    warningThreshold: 70,
    criticalThreshold: 90,
  },

  collisions: {
    /** Hitbox smaller than visual rocket */
    playerHitboxScale: 0.62,
    invulnerabilityMs: 1400,
    postHitClearRadius: 120,
    hazardHitboxScale: 0.88,
  },

  chains: {
    timeoutMs: 4800,
    milestones: [5, 10, 20] as const,
  },

  difficulty: {
    starting: 1,
    maximum: 10,
    /** Timed-mode phase breakpoints (seconds after pilot control) */
    phases: {
      warmupEnd: 15,
      cruiseEnd: 45,
      pressureEnd: 90,
      intenseEnd: 110,
    },
  },

  spawning: {
    maxEntities: 32,
    maxParticles: 160,
    spawnLookAheadMin: 80,
    spawnLookAheadMax: 320,
    intervalMinMs: 380,
    intervalMaxMs: 1200,
    warmupHazardChance: 0.12,
    beatGapMs: 140,
  },

  /** DYOR Mission Assembly — collect D Y O R per sector */
  missionAssembly: {
    componentOrder: ["d", "y", "o", "r"] as const,
    componentSpawnWindows: [6, 18, 32, 48] as const,
    telegraphLeadSeconds: 2.8,
    componentScore: 2000,
    completionBonus: 10000,
    /** Sector completion bonus scales from this (all missed) to 1.0 (all collected). */
    missedSectorBonusFloor: 0.45,
    signalBoostDurationMs: 12000,
    signalBoostMultiplier: 3,
    signalBoostScrollBoost: 1.35,
    signalBoostFuelDrainScale: 0.45,
    completionSlowMoMs: 900,
    completionSlowMoScale: 0.55,
  },

  /** Arcade wave pacing — deliberate formations with steady pickup flow */
  waves: {
    minimumGapMs: 320,
    maxVisibleHazards: 4,
    maxVisibleCollectibles: 5,
    maxVisibleLogoComponents: 1,
    maxVisibleTotal: 10,
    waveTypes: [
      "breathing",
      "slalom",
      "research-trail",
      "fuel-gate",
      "split-decision",
      "signal-corridor",
      "debris-sweep",
    ] as const,
  },

  /** Visual scale multipliers applied at render + spawn */
  entityScale: {
    rocket: 1.25,
    standardPickup: 1.4,
    logoComponent: 2.4,
    asteroid: 1.4,
    debris: 1.35,
  },

  events: {
    telegraphMs: 3500,
    minGapMs: 18000,
    signalBurstMs: 9000,
    asteroidFieldMs: 10000,
    solarActivityMs: 8000,
    boostWindowMs: 7000,
  },

  feedback: {
    hudUpdateIntervalMs: 80,
    pickupFlashMs: 400,
    zoneToastMs: 2800,
    chainLostToastMs: 1800,
    entityIdentMs: 2000,
  },

  mobile: {
    touchAction: "none" as const,
    throttleWidth: 44,
  },

  launch: {
    sequenceSkipAfterSeen: true,
    autopilotMs: 2000,
    postControlGraceMs: 14000,
  },

  score: {
    altitudePerKm: 2,
    researchBase: 100,
    dataCubeMultiplier: 2.5,
    chainBonusPerLink: 8,
    hazardAvoidancePerSecond: 3,
    integrityBonusPerPoint: 150,
    timedCompletionBonus: 500,
    fuelEfficiencyWeight: 200,
    finaleScoreMultiplier: 1.25,
    logoComponentBase: 2000,
    logoCompletionBonus: 10000,
  },

  ranks: [
    { minScore: 0, rank: "RESEARCH CADET" as const },
    { minScore: 8000, rank: "FLIGHT ANALYST" as const },
    { minScore: 18000, rank: "MISSION SPECIALIST" as const },
    { minScore: 32000, rank: "ORBIT COMMANDER" as const },
    { minScore: 45000, rank: "MISSION COMMANDER" as const },
  ],

  onboarding: {
    hints: ["assembly", "steer", "throttle", "component", "survive"] as const,
  },
};

export type MissionConfig = typeof missionConfig;

export type TimedPhase = "warmup" | "cruise" | "pressure" | "intense" | "finale";

export function getTimedPhase(playElapsed: number): TimedPhase {
  const { phases } = missionConfig.difficulty;
  if (playElapsed < phases.warmupEnd) return "warmup";
  if (playElapsed < phases.cruiseEnd) return "cruise";
  if (playElapsed < phases.pressureEnd) return "pressure";
  if (playElapsed < phases.intenseEnd) return "intense";
  return "finale";
}
