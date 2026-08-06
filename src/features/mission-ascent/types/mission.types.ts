export type GameMode = "timed" | "endless";

export type ThrottleValue = number;

export type GamePhase =
  | "idle"
  | "launch-transition"
  | "launch-sequence"
  | "playing"
  | "paused"
  | "engine-failure"
  | "debrief";

export type AltitudeZoneId =
  | "launch-corridor"
  | "upper-atmosphere"
  | "low-orbit"
  | "lunar-transfer"
  | "deep-space"
  | "unknown-sector";

export type CollectibleType =
  | "research"
  | "data-cube"
  | "signal-beacon"
  | "fuel"
  | "shield"
  | "cooling";

export type HazardType =
  | "asteroid"
  | "debris"
  | "radiation"
  | "drone"
  | "magnetic"
  | "fud-cloud"
  | "rug-signal";

export type MissionEventType =
  | "signal-burst"
  | "asteroid-field"
  | "solar-activity"
  | "boost-window"
  | "debris-corridor";

export type ThrottleZone = "idle" | "cruise" | "high" | "boost";

export type PerformanceQuality = "high" | "standard" | "reduced";

export type LogoComponentType = "d" | "y" | "o" | "r";

export type EntityKind = "collectible" | "hazard" | "logo-component";

export type Vec2 = { x: number; y: number };

export type WorldEntity = {
  id: number;
  kind: EntityKind;
  type: CollectibleType | HazardType | LogoComponentType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  rotation: number;
  rotationSpeed: number;
  active: boolean;
  telegraphed?: boolean;
  value?: number;
  spawnedAt?: number;
};

export type ChainResetReason = "timeout" | "collision" | "missed" | null;

export type Particle = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  active: boolean;
};

export type ScoreBreakdown = {
  altitudeScore: number;
  researchCollected: number;
  researchChainBonus: number;
  logoComponentScore: number;
  logoCompletionBonus: number;
  signalBoostBonus: number;
  throttleMultiplierBonus: number;
  fuelEfficiencyBonus: number;
  hazardAvoidanceBonus: number;
  integrityBonus: number;
  missionCompletionBonus: number;
  finalScore: number;
};

export type MissionRank =
  | "RESEARCH CADET"
  | "FLIGHT ANALYST"
  | "MISSION SPECIALIST"
  | "ORBIT COMMANDER"
  | "MISSION COMMANDER";

export type MissionDebrief = {
  mode: GameMode;
  altitudeKm: number;
  researchCollected: number;
  bestChain: number;
  fuelEfficiencyPercent: number;
  hazardsAvoided: number;
  integrityRemaining: number;
  maxIntegrity: number;
  breakdown: ScoreBreakdown;
  rank: MissionRank;
  isPersonalBest: boolean;
  durationSeconds: number;
  highestZoneLabel: string;
  logosCompleted: number;
  logoComponentsCollected: number;
  signalBoostPeakScore: number;
  logoCompletionTimeMs: number | null;
  sectorsCompleted: number;
  highestSectorReached: number;
  highestCycleReached: number;
  fastestSectorCompletionMs: number | null;
  endCause:
    | "timed-complete"
    | "fuel-depleted"
    | "hull-lost"
    | "abandoned"
    | "signal-window-lost"
    | "mission-run-complete";
  assessment: string;
  assessmentHighlight: string;
  scoreDelta: number | null;
  previousBest: number;
};

export type PickupFeedbackType =
  | "research"
  | "fuel"
  | "cooling"
  | "shield"
  | "data-cube"
  | "signal-beacon"
  | LogoComponentType;

export type MissionEvent = {
  type: MissionEventType;
  label: string;
  startedAt: number;
  durationMs: number;
  telegraphUntil: number;
};

export type HudSnapshot = {
  altitudeKm: number;
  zoneId: AltitudeZoneId;
  zoneLabel: string;
  score: number;
  fuel: number;
  heat: number;
  integrity: number;
  maxIntegrity: number;
  shield: boolean;
  chain: number;
  chainMultiplier: number;
  chainTimerMs: number;
  chainMaxMs: number;
  throttle: ThrottleValue;
  requestedThrottle: ThrottleValue;
  throttleZone: ThrottleZone;
  throttleDisabled: boolean;
  noFuel: boolean;
  fuelDisplay: string;
  timerSeconds: number | null;
  overheated: boolean;
  cooling: boolean;
  eventTitle: string | null;
  eventHint: string | null;
  zoneToast: string | null;
  chainLostMessage: string | null;
  pickupFlash: PickupFeedbackType | null;
  timedPhase: string;
  finaleActive: boolean;
  phase: GamePhase;
  /** Mission Assembly — DYOR signal rebuild */
  assemblyCollected: LogoComponentType[];
  assemblyMissed: LogoComponentType[];
  nextComponent: LogoComponentType | null;
  componentsCollected: number;
  componentsMissed: number;
  totalComponents: number;
  assemblyComplete: boolean;
  componentToast: string | null;
  signalBoostActive: boolean;
  signalBoostRemainingMs: number;
  signalBoostMultiplier: number;
  scoreMultiplier: number;
  /** Multi-sector progression */
  sectorNumber: number;
  sectorName: string;
  sectorSubtitle: string;
  sectorCycle: number;
  isExtendedMission: boolean;
  sectorsCompleted: number;
  sectorTimeRemainingMs: number;
  sectorState: string;
  sectorTransitionMessage: string | null;
  sectorTransitionSubtext: string | null;
  sectorCompleteSummary: {
    sectorNumber: number;
    sectorName: string;
    completionTimeMs: number;
    fuelRemainingPercent: number;
    hullRemaining: number;
    maxHull: number;
    sectorBonus: number;
  } | null;
  timerUrgent: boolean;
  timerCritical: boolean;
  difficultyLabel: string;
  maxSectorsThisRun: number | null;
  logosCompleted: number;
  highestSectorThisRun: number;
};

export type EntityIdentType = CollectibleType | HazardType | LogoComponentType;

export type EntityIdentification = {
  entityId: number;
  type: EntityIdentType;
  title: string;
  hint: string;
  x: number;
  y: number;
  until: number;
};

export type MissionPreferences = {
  audioEnabled: boolean;
  reducedEffects: boolean;
  launchSequenceSeen: boolean;
  lastMode: GameMode;
  performanceQuality: PerformanceQuality;
  onboardingComplete: boolean;
  assemblyTutorialComplete: boolean;
  discoveredEntities: string[];
};

export type MissionRecords = {
  timedBest: number;
  endlessBest: number;
  highestAltitudeKm: number;
  bestResearchChain: number;
  totalMissionsCompleted: number;
  fastestLogoCompletionMs: number;
  mostLogosCompleted: number;
  totalLogoComponentsCollected: number;
  highestSignalBoostScore: number;
  highestSectorReached: number;
  highestCycleReached: number;
  mostSectorsCompletedInRun: number;
  fastestSectorCompletionMs: number;
  totalSectorsCompleted: number;
  totalSignalsRestored: number;
  bestFiveSectorRunScore: number;
};

export type MissionStorageSchema = {
  version: 1 | 2 | 3;
  records: MissionRecords;
  preferences: MissionPreferences;
};

export const MISSION_STORAGE_KEY = "dyor:mission-ascent:v1";
export const MISSION_STORAGE_VERSION = 3;
