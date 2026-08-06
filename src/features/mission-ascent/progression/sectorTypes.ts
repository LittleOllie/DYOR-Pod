/** Multi-sector progression types */

export type SectorState =
  | "playing"
  | "logo-complete"
  | "sector-transition"
  | "next-sector-intro"
  | "mission-failed"
  | "paused";

export type LetterEnergyPattern =
  | "circuit"
  | "hologram"
  | "orbital-hologram"
  | "plasma"
  | "glitch"
  | "anomaly"
  | "core";

export type LetterStyle = {
  shellColor: string;
  coreColor: string;
  glowColor: string;
  secondaryGlowColor?: string;
  outlineColor: string;
  particleColor: string;
  pulseSpeed: number;
  rotationSpeed: number;
  distortionAmount?: number;
  energyPattern: LetterEnergyPattern;
};

export type BackgroundConfig = {
  baseColors: [string, string, string];
  grid?: {
    enabled: boolean;
    color: string;
    opacity: number;
    spacing: number;
    style: "square" | "hex" | "radial";
  };
  stars: {
    density: number;
    color: string;
    streakMultiplier: number;
  };
  particles: {
    count: number;
    color: string;
    speedMultiplier: number;
  };
  nebula?: {
    enabled: boolean;
    colors: string[];
    opacity: number;
  };
  vignette: number;
  ambientGlow: string;
  hudAccent: string;
  /** Optional horizon glow at bottom of playfield (e.g. Low Orbit) */
  horizonGlow?: { color: string; opacity: number };
  /** Subtle horizontal scan interference (Signal Distortion) */
  scanlines?: boolean;
  /** Forward speed-line streak intensity 0–1 */
  speedLineIntensity?: number;
};

export type SectorMechanic =
  | "basic-asteroids"
  | "drifting-debris"
  | "rotating-debris"
  | "energy-barriers"
  | "rogue-drones"
  | "fud-clouds"
  | "mixed-patterns"
  | "combined-advanced";

export type SectorTheme = {
  id: string;
  letterStyle: LetterStyle;
  background: BackgroundConfig;
};

export type MissionSector = {
  id: string;
  number: number;
  name: string;
  subtitle: string;
  theme: SectorTheme;
  durationSeconds: number;
  difficultyModifier: number;
  speedModifier: number;
  spawnModifier: number;
  hazardModifier: number;
  letterStyle: LetterStyle;
  backgroundConfig: BackgroundConfig;
  newMechanic?: SectorMechanic;
  mechanicLabel?: string;
  wavePool: readonly string[];
  hazardPool: readonly string[];
};

export type SectorProgressSnapshot = {
  currentSectorNumber: number;
  currentSectorId: string;
  currentSectorName: string;
  currentSectorSubtitle: string;
  currentCycle: number;
  isExtendedMission: boolean;
  sectorTimeRemainingMs: number;
  sectorState: SectorState;
  sectorsCompletedThisRun: number;
  sectorTransitionMessage: string | null;
  sectorTransitionSubtext: string | null;
  sectorCompleteSummary: SectorCompleteSummary | null;
  timerUrgent: boolean;
  timerCritical: boolean;
  difficultyLabel: string;
  letterStyle: LetterStyle;
  backgroundConfig: BackgroundConfig;
  backgroundBlend: number;
  previousBackgroundConfig: BackgroundConfig | null;
  sectorScoreMultiplier: number;
  maxSectorsThisRun: number | null;
};

export type SectorCompleteSummary = {
  sectorNumber: number;
  sectorName: string;
  completionTimeMs: number;
  fuelRemainingPercent: number;
  hullRemaining: number;
  maxHull: number;
  sectorBonus: number;
};

export type SectorProgressState = {
  currentSectorNumber: number;
  currentCycle: number;
  sectorStartedAt: number;
  sectorElapsed: number;
  sectorTimeRemaining: number;
  sectorsCompletedThisRun: number;
  fastestSectorCompletionMs: number | null;
  transitionState: SectorState;
  transitionStartedAt: number;
  lastCompleteSummary: SectorCompleteSummary | null;
  backgroundBlend: number;
  previousSectorNumber: number;
};
