import type { BackgroundConfig, LetterStyle, MissionSector } from "@/features/mission-ascent/progression/sectorTypes";

/** Webpage / Mission Launcher square grid — 24px teal lines on dark navy */
const webpageGrid = {
  enabled: true,
  color: "rgba(49, 209, 198, 0.45)",
  opacity: 0.06,
  spacing: 24,
  style: "square" as const,
};

const missionGrid = {
  enabled: true,
  color: "rgba(49, 209, 198, 0.35)",
  opacity: 0.07,
  spacing: 48,
  style: "square" as const,
};

function letterStyle(partial: LetterStyle): LetterStyle {
  return partial;
}

function bg(partial: BackgroundConfig): BackgroundConfig {
  return partial;
}

export const CORE_SECTOR_COUNT = 8;

export const SECTOR_DURATION_SECONDS = 120;

export const sectorRecovery = {
  fuelRestorePercent: 18,
  hullRestoreAmount: 1,
  heatResetPercent: 70,
} as const;

export const sectorCompletionScore = {
  baseCompletionBonus: 10000,
  timeRemainingMultiplier: 80,
  fuelEfficiencyMultiplier: 25,
  hullIntegrityBonusPerPoint: 500,
  flawlessSectorBonus: 2500,
} as const;

const launchCorridorLetters = letterStyle({
  shellColor: "#1a3038",
  coreColor: "#31d1c6",
  glowColor: "#4ecde8",
  outlineColor: "#13a9a6",
  particleColor: "#31d1c6",
  pulseSpeed: 0.004,
  rotationSpeed: 0.08,
  energyPattern: "circuit",
});

/** Sector 1 — matches homepage Mission Simulator launcher */
const launchCorridorBg = bg({
  baseColors: ["#0e2f3a", "#061821", "#040f14"],
  grid: webpageGrid,
  stars: { density: 0.2, color: "rgba(255,255,255,0.35)", streakMultiplier: 0.9 },
  particles: { count: 10, color: "rgba(49, 209, 198, 0.12)", speedMultiplier: 0.9 },
  vignette: 0.12,
  ambientGlow: "rgba(49, 209, 198, 0.07)",
  hudAccent: "#31d1c6",
});

const upperAtmosphereLetters = letterStyle({
  shellColor: "#1a2838",
  coreColor: "#4ecde8",
  glowColor: "#7dd3fc",
  outlineColor: "#31d1c6",
  particleColor: "#4ecde8",
  pulseSpeed: 0.0045,
  rotationSpeed: 0.09,
  energyPattern: "hologram",
});

const upperAtmosphereBg = bg({
  baseColors: ["#0c2840", "#082838", "#061821"],
  grid: { ...missionGrid, color: "rgba(125, 211, 252, 0.35)", opacity: 0.05, spacing: 36 },
  stars: { density: 0.3, color: "rgba(180, 220, 255, 0.45)", streakMultiplier: 1.05 },
  particles: { count: 16, color: "rgba(125, 211, 252, 0.14)", speedMultiplier: 1.05 },
  nebula: {
    enabled: true,
    colors: ["rgba(78, 205, 232, 0.12)", "rgba(125, 211, 252, 0.06)"],
    opacity: 0.4,
  },
  vignette: 0.16,
  ambientGlow: "rgba(125, 211, 252, 0.06)",
  hudAccent: "#7dd3fc",
});

const lowOrbitLetters = letterStyle({
  shellColor: "#141e28",
  coreColor: "#b8e8ff",
  glowColor: "#7dd3fc",
  outlineColor: "#31d1c6",
  particleColor: "#b8e8ff",
  pulseSpeed: 0.005,
  rotationSpeed: 0.1,
  energyPattern: "orbital-hologram",
});

const lowOrbitBg = bg({
  baseColors: ["#061018", "#040c18", "#020810"],
  grid: { ...missionGrid, color: "rgba(184, 232, 255, 0.25)", opacity: 0.04, spacing: 40 },
  stars: { density: 0.55, color: "rgba(200, 240, 255, 0.55)", streakMultiplier: 1.12 },
  particles: { count: 14, color: "rgba(125, 211, 252, 0.1)", speedMultiplier: 1.08 },
  horizonGlow: { color: "rgba(49, 209, 198, 0.35)", opacity: 0.55 },
  vignette: 0.2,
  ambientGlow: "rgba(125, 211, 252, 0.05)",
  hudAccent: "#b8e8ff",
});

const lunarTransferLetters = letterStyle({
  shellColor: "#1a1830",
  coreColor: "#a78bfa",
  glowColor: "#c4b5fd",
  secondaryGlowColor: "#31d1c6",
  outlineColor: "#7c3aed",
  particleColor: "#a78bfa",
  pulseSpeed: 0.0048,
  rotationSpeed: 0.1,
  energyPattern: "plasma",
});

const lunarTransferBg = bg({
  baseColors: ["#120a28", "#0a0818", "#060410"],
  grid: { ...missionGrid, color: "rgba(167, 139, 250, 0.4)", opacity: 0.05, spacing: 44 },
  stars: { density: 0.5, color: "rgba(196, 181, 253, 0.4)", streakMultiplier: 1.1 },
  particles: { count: 18, color: "rgba(167, 139, 250, 0.12)", speedMultiplier: 1.1 },
  nebula: {
    enabled: true,
    colors: ["rgba(124, 58, 237, 0.18)", "rgba(49, 209, 198, 0.08)"],
    opacity: 0.45,
  },
  vignette: 0.22,
  ambientGlow: "rgba(167, 139, 250, 0.07)",
  hudAccent: "#c4b5fd",
});

const deepSpaceLetters = letterStyle({
  shellColor: "#0e2028",
  coreColor: "#31d1c6",
  glowColor: "#22d3ee",
  outlineColor: "#13a9a6",
  particleColor: "#31d1c6",
  pulseSpeed: 0.0052,
  rotationSpeed: 0.11,
  energyPattern: "circuit",
});

const deepSpaceBg = bg({
  baseColors: ["#030810", "#020608", "#010304"],
  grid: { enabled: false, color: "transparent", opacity: 0, spacing: 48, style: "square" },
  stars: { density: 0.8, color: "rgba(49, 209, 198, 0.45)", streakMultiplier: 1.22 },
  particles: { count: 22, color: "rgba(34, 211, 238, 0.12)", speedMultiplier: 1.15 },
  nebula: {
    enabled: true,
    colors: ["rgba(19, 169, 166, 0.2)", "rgba(34, 211, 238, 0.1)"],
    opacity: 0.5,
  },
  speedLineIntensity: 0.35,
  vignette: 0.28,
  ambientGlow: "rgba(34, 211, 238, 0.05)",
  hudAccent: "#22d3ee",
});

const signalDistortionLetters = letterStyle({
  shellColor: "#0e2828",
  coreColor: "#2dd4bf",
  glowColor: "#5eead4",
  outlineColor: "#14b8a6",
  particleColor: "#2dd4bf",
  pulseSpeed: 0.006,
  rotationSpeed: 0.12,
  distortionAmount: 0.15,
  energyPattern: "glitch",
});

const signalDistortionBg = bg({
  baseColors: ["#061818", "#041210", "#020c0a"],
  grid: { ...missionGrid, color: "rgba(45, 212, 191, 0.4)", opacity: 0.055, spacing: 32 },
  stars: { density: 0.45, color: "rgba(94, 234, 212, 0.35)", streakMultiplier: 1.15 },
  particles: { count: 16, color: "rgba(45, 212, 191, 0.12)", speedMultiplier: 1.18 },
  scanlines: true,
  vignette: 0.26,
  ambientGlow: "rgba(45, 212, 191, 0.06)",
  hudAccent: "#5eead4",
});

const anomalyFieldLetters = letterStyle({
  shellColor: "#141820",
  coreColor: "#31d1c6",
  glowColor: "#e5cf59",
  secondaryGlowColor: "#31d1c6",
  outlineColor: "#13a9a6",
  particleColor: "#31d1c6",
  pulseSpeed: 0.0055,
  rotationSpeed: 0.13,
  energyPattern: "anomaly",
});

const anomalyFieldBg = bg({
  baseColors: ["#040608", "#030406", "#010204"],
  grid: { enabled: true, color: "rgba(49, 209, 198, 0.35)", opacity: 0.045, spacing: 52, style: "hex" },
  stars: { density: 0.6, color: "rgba(229, 207, 89, 0.3)", streakMultiplier: 1.2 },
  particles: { count: 20, color: "rgba(49, 209, 198, 0.14)", speedMultiplier: 1.15 },
  nebula: {
    enabled: true,
    colors: ["rgba(229, 207, 89, 0.08)", "rgba(49, 209, 198, 0.1)"],
    opacity: 0.35,
  },
  vignette: 0.3,
  ambientGlow: "rgba(229, 207, 89, 0.05)",
  hudAccent: "#e5cf59",
});

const coreTransmissionLetters = letterStyle({
  shellColor: "#1a1810",
  coreColor: "#e5cf59",
  glowColor: "#ffffff",
  secondaryGlowColor: "#31d1c6",
  outlineColor: "#13a9a6",
  particleColor: "#e5cf59",
  pulseSpeed: 0.006,
  rotationSpeed: 0.14,
  energyPattern: "core",
});

const coreTransmissionBg = bg({
  baseColors: ["#080604", "#050304", "#020202"],
  grid: { enabled: true, color: "rgba(229, 207, 89, 0.45)", opacity: 0.065, spacing: 56, style: "radial" },
  stars: { density: 0.75, color: "rgba(255, 255, 255, 0.5)", streakMultiplier: 1.28 },
  particles: { count: 24, color: "rgba(229, 207, 89, 0.14)", speedMultiplier: 1.22 },
  nebula: {
    enabled: true,
    colors: ["rgba(49, 209, 198, 0.15)", "rgba(229, 207, 89, 0.1)"],
    opacity: 0.55,
  },
  speedLineIntensity: 0.55,
  vignette: 0.32,
  ambientGlow: "rgba(229, 207, 89, 0.08)",
  hudAccent: "#e5cf59",
});

function shiftBackgroundForCycle(config: BackgroundConfig, cycle: number): BackgroundConfig {
  if (cycle <= 0) return config;
  const shift = Math.min(cycle * 0.04, 0.2);
  return {
    ...config,
    vignette: Math.min(config.vignette + shift * 0.15, 0.45),
    nebula: config.nebula
      ? { ...config.nebula, opacity: Math.min(config.nebula.opacity + shift, 0.65) }
      : undefined,
    speedLineIntensity: Math.min((config.speedLineIntensity ?? 0) + shift * 0.5, 0.75),
  };
}

export const coreSectors: MissionSector[] = [
  {
    id: "launch-corridor",
    number: 1,
    name: "Launch Corridor",
    subtitle: "Flight systems online",
    theme: { id: "launch-corridor", letterStyle: launchCorridorLetters, background: launchCorridorBg },
    durationSeconds: SECTOR_DURATION_SECONDS,
    difficultyModifier: 1,
    speedModifier: 1,
    spawnModifier: 1,
    hazardModifier: 0.85,
    letterStyle: launchCorridorLetters,
    backgroundConfig: launchCorridorBg,
    newMechanic: "basic-asteroids",
    wavePool: ["breathing", "research-trail", "slalom"],
    hazardPool: ["asteroid"],
  },
  {
    id: "upper-atmosphere",
    number: 2,
    name: "Upper Atmosphere",
    subtitle: "Atmospheric ascent",
    theme: { id: "upper-atmosphere", letterStyle: upperAtmosphereLetters, background: upperAtmosphereBg },
    durationSeconds: SECTOR_DURATION_SECONDS,
    difficultyModifier: 1.05,
    speedModifier: 1.06,
    spawnModifier: 1.04,
    hazardModifier: 0.95,
    letterStyle: upperAtmosphereLetters,
    backgroundConfig: upperAtmosphereBg,
    newMechanic: "drifting-debris",
    mechanicLabel: "DRIFTING DEBRIS",
    wavePool: ["breathing", "research-trail", "debris-sweep", "slalom"],
    hazardPool: ["asteroid", "debris"],
  },
  {
    id: "low-orbit",
    number: 3,
    name: "Low Orbit",
    subtitle: "Orbital systems active",
    theme: { id: "low-orbit", letterStyle: lowOrbitLetters, background: lowOrbitBg },
    durationSeconds: SECTOR_DURATION_SECONDS,
    difficultyModifier: 1.1,
    speedModifier: 1.12,
    spawnModifier: 1.08,
    hazardModifier: 1,
    letterStyle: lowOrbitLetters,
    backgroundConfig: lowOrbitBg,
    newMechanic: "rotating-debris",
    mechanicLabel: "ROTATING DEBRIS",
    wavePool: ["research-trail", "debris-sweep", "split-decision", "signal-corridor"],
    hazardPool: ["asteroid", "debris"],
  },
  {
    id: "lunar-transfer",
    number: 4,
    name: "Lunar Transfer",
    subtitle: "Signal path extended",
    theme: { id: "lunar-transfer", letterStyle: lunarTransferLetters, background: lunarTransferBg },
    durationSeconds: SECTOR_DURATION_SECONDS,
    difficultyModifier: 1.15,
    speedModifier: 1.18,
    spawnModifier: 1.1,
    hazardModifier: 1.1,
    letterStyle: lunarTransferLetters,
    backgroundConfig: lunarTransferBg,
    newMechanic: "energy-barriers",
    mechanicLabel: "ENERGY BARRIERS",
    wavePool: ["research-trail", "signal-corridor", "split-decision", "fuel-gate"],
    hazardPool: ["asteroid", "debris", "radiation"],
  },
  {
    id: "deep-space",
    number: 5,
    name: "Deep Space",
    subtitle: "Beyond mapped orbit",
    theme: { id: "deep-space", letterStyle: deepSpaceLetters, background: deepSpaceBg },
    durationSeconds: SECTOR_DURATION_SECONDS,
    difficultyModifier: 1.2,
    speedModifier: 1.24,
    spawnModifier: 1.12,
    hazardModifier: 1.15,
    letterStyle: deepSpaceLetters,
    backgroundConfig: deepSpaceBg,
    newMechanic: "rogue-drones",
    mechanicLabel: "ROGUE DRONES",
    wavePool: ["research-trail", "debris-sweep", "split-decision", "signal-corridor"],
    hazardPool: ["asteroid", "debris", "radiation", "drone"],
  },
  {
    id: "signal-distortion",
    number: 6,
    name: "Signal Distortion",
    subtitle: "Telemetry unstable",
    theme: { id: "signal-distortion", letterStyle: signalDistortionLetters, background: signalDistortionBg },
    durationSeconds: SECTOR_DURATION_SECONDS,
    difficultyModifier: 1.25,
    speedModifier: 1.3,
    spawnModifier: 1.14,
    hazardModifier: 1.2,
    letterStyle: signalDistortionLetters,
    backgroundConfig: signalDistortionBg,
    newMechanic: "fud-clouds",
    mechanicLabel: "FUD CLOUDS",
    wavePool: ["breathing", "research-trail", "debris-sweep", "split-decision"],
    hazardPool: ["asteroid", "debris", "radiation", "drone", "fud-cloud"],
  },
  {
    id: "anomaly-field",
    number: 7,
    name: "Anomaly Field",
    subtitle: "Unknown structures detected",
    theme: { id: "anomaly-field", letterStyle: anomalyFieldLetters, background: anomalyFieldBg },
    durationSeconds: SECTOR_DURATION_SECONDS,
    difficultyModifier: 1.32,
    speedModifier: 1.36,
    spawnModifier: 1.16,
    hazardModifier: 1.25,
    letterStyle: anomalyFieldLetters,
    backgroundConfig: anomalyFieldBg,
    newMechanic: "mixed-patterns",
    wavePool: ["research-trail", "debris-sweep", "signal-corridor", "split-decision", "fuel-gate"],
    hazardPool: ["asteroid", "debris", "radiation", "drone", "fud-cloud"],
  },
  {
    id: "core-transmission",
    number: 8,
    name: "Core Transmission",
    subtitle: "Final signal convergence",
    theme: { id: "core-transmission", letterStyle: coreTransmissionLetters, background: coreTransmissionBg },
    durationSeconds: SECTOR_DURATION_SECONDS,
    difficultyModifier: 1.4,
    speedModifier: 1.42,
    spawnModifier: 1.18,
    hazardModifier: 1.3,
    letterStyle: coreTransmissionLetters,
    backgroundConfig: coreTransmissionBg,
    newMechanic: "combined-advanced",
    wavePool: ["debris-sweep", "signal-corridor", "split-decision", "fuel-gate", "slalom"],
    hazardPool: ["asteroid", "debris", "radiation", "drone", "fud-cloud"],
  },
];

export function getSectorForNumber(sectorNumber: number): MissionSector {
  const cycle = Math.floor((sectorNumber - 1) / CORE_SECTOR_COUNT);
  const themeIndex = (sectorNumber - 1) % CORE_SECTOR_COUNT;
  const base = coreSectors[themeIndex]!;
  if (cycle === 0) return base;

  const cycleDifficultyBonus = Math.min(cycle * 0.08, 0.5);
  const cycleSpeedBonus = Math.min(cycle * 0.04, 0.25);
  const cycleScoreMultiplier = 1 + cycle * 0.2;

  return {
    ...base,
    number: sectorNumber,
    difficultyModifier: base.difficultyModifier + cycleDifficultyBonus,
    speedModifier: base.speedModifier + cycleSpeedBonus,
    spawnModifier: base.spawnModifier + cycle * 0.03,
    hazardModifier: base.hazardModifier + cycle * 0.04,
    subtitle:
      cycle > 0
        ? `${base.subtitle} · Extended Cycle ${cycle + 1}`
        : base.subtitle,
    backgroundConfig: shiftBackgroundForCycle(base.backgroundConfig, cycle),
    letterStyle: base.letterStyle,
    theme: {
      ...base.theme,
      id: `${base.id}-cycle-${cycle}`,
      background: shiftBackgroundForCycle(base.backgroundConfig, cycle),
      letterStyle: base.letterStyle,
    },
  };
}

export function getCycleForSector(sectorNumber: number): number {
  return Math.floor((sectorNumber - 1) / CORE_SECTOR_COUNT);
}

export function getExtendedCycleScoreMultiplier(sectorNumber: number): number {
  const cycle = getCycleForSector(sectorNumber);
  return cycle > 0 ? 1 + cycle * 0.2 : 1;
}
