import type { GameMode } from "@/features/mission-ascent/types/mission.types";
import {
  CORE_SECTOR_COUNT,
  getCycleForSector,
  getExtendedCycleScoreMultiplier,
  getSectorForNumber,
  SECTOR_DURATION_SECONDS,
  sectorCompletionScore,
  sectorRecovery,
} from "@/features/mission-ascent/progression/sectorDefinitions";
import type {
  SectorCompleteSummary,
  SectorProgressSnapshot,
  SectorProgressState,
  SectorState,
} from "@/features/mission-ascent/progression/sectorTypes";
import { clamp } from "@/features/mission-ascent/utils/math";

export const MISSION_RUN_MAX_SECTORS = 5;

const LOGO_COMPLETE_MS = 600;
const SECTOR_TRANSITION_MS = 2200;
const SECTOR_INTRO_MS = 1600;
const BACKGROUND_BLEND_MS = 1800;

export function getSectorDifficultyModifiers(sectorNumber: number) {
  const sectorIndex = sectorNumber - 1;
  const sector = getSectorForNumber(sectorNumber);
  const cycle = getCycleForSector(sectorNumber);
  const cycleDifficultyBonus = Math.min(cycle * 0.08, 0.5);
  const cycleSpeedBonus = Math.min(cycle * 0.04, 0.25);

  return {
    baseSpeedMultiplier: sector.speedModifier,
    hazardDensityMultiplier: sector.hazardModifier * (1 + sectorIndex * 0.04 + cycleDifficultyBonus * 0.5),
    hazardMovementMultiplier: 1 + sectorIndex * 0.03 + cycleSpeedBonus * 0.5,
    componentPathComplexity: sectorIndex,
    warningWindowMultiplier: Math.max(0.7, 1 - sectorIndex * 0.03),
    spawnIntervalScale: 1 / sector.spawnModifier,
    scoreMultiplier: getExtendedCycleScoreMultiplier(sectorNumber),
  };
}

export function calculateSectorCompletionBonus(
  summary: Omit<SectorCompleteSummary, "sectorBonus">,
): number {
  const timeBonus = Math.floor(
    (summary.completionTimeMs > 0
      ? Math.max(0, SECTOR_DURATION_SECONDS * 1000 - summary.completionTimeMs) / 1000
      : 0) * sectorCompletionScore.timeRemainingMultiplier,
  );
  const fuelBonus = Math.floor(summary.fuelRemainingPercent * sectorCompletionScore.fuelEfficiencyMultiplier);
  const hullBonus = summary.hullRemaining * sectorCompletionScore.hullIntegrityBonusPerPoint;
  const flawless =
    summary.hullRemaining >= summary.maxHull && summary.fuelRemainingPercent >= 50
      ? sectorCompletionScore.flawlessSectorBonus
      : 0;
  return (
    sectorCompletionScore.baseCompletionBonus + timeBonus + fuelBonus + hullBonus + flawless
  );
}

export function getDifficultyLabel(sectorNumber: number): string {
  if (sectorNumber <= 2) return "STABLE";
  if (sectorNumber <= 4) return "ELEVATED";
  if (sectorNumber <= 6) return "HIGH";
  return "CRITICAL";
}

export function createInitialSectorState(): SectorProgressState {
  return {
    currentSectorNumber: 1,
    currentCycle: 0,
    sectorStartedAt: 0,
    sectorElapsed: 0,
    sectorTimeRemaining: SECTOR_DURATION_SECONDS,
    sectorsCompletedThisRun: 0,
    fastestSectorCompletionMs: null,
    transitionState: "playing",
    transitionStartedAt: 0,
    lastCompleteSummary: null,
    backgroundBlend: 1,
    previousSectorNumber: 1,
  };
}

export class SectorManager {
  state: SectorProgressState = createInitialSectorState();
  private maxSectors: number | null = null;

  constructor(private mode: GameMode) {
    this.maxSectors = mode === "timed" ? MISSION_RUN_MAX_SECTORS : null;
  }

  reset(): void {
    this.state = createInitialSectorState();
  }

  setMode(mode: GameMode): void {
    this.mode = mode;
    this.maxSectors = mode === "timed" ? MISSION_RUN_MAX_SECTORS : null;
  }

  getCurrentSector() {
    return getSectorForNumber(this.state.currentSectorNumber);
  }

  getPreviousSector() {
    return getSectorForNumber(this.state.previousSectorNumber);
  }

  isTimerPaused(): boolean {
    return (
      this.state.transitionState === "logo-complete" ||
      this.state.transitionState === "sector-transition" ||
      this.state.transitionState === "next-sector-intro"
    );
  }

  isSimulationPaused(): boolean {
    return this.state.transitionState !== "playing";
  }

  isInBreathingWindow(): boolean {
    return this.state.transitionState === "playing" && this.state.sectorElapsed < 5;
  }

  beginSector(now: number): void {
    this.state.sectorStartedAt = now;
    this.state.sectorElapsed = 0;
    this.state.sectorTimeRemaining = SECTOR_DURATION_SECONDS;
    this.state.transitionState = "playing";
    this.state.backgroundBlend = 1;
  }

  tickPlaying(delta: number, assemblyComplete: boolean): "signal-window-lost" | null {
    if (this.isTimerPaused()) return null;
    this.state.sectorElapsed += delta;
    this.state.sectorTimeRemaining = Math.max(0, this.state.sectorTimeRemaining - delta);
    if (this.state.sectorTimeRemaining <= 0 && !assemblyComplete) {
      return "signal-window-lost";
    }
    return null;
  }

  onLogoComplete(
    now: number,
    fuel: number,
    hull: number,
    maxHull: number,
  ): SectorCompleteSummary {
    const sector = this.getCurrentSector();
    const completionTimeMs = Math.round(this.state.sectorElapsed * 1000);
    const summary: SectorCompleteSummary = {
      sectorNumber: sector.number,
      sectorName: sector.name,
      completionTimeMs,
      fuelRemainingPercent: fuel,
      hullRemaining: hull,
      maxHull,
      sectorBonus: 0,
    };
    summary.sectorBonus = calculateSectorCompletionBonus(summary);

    this.state.lastCompleteSummary = summary;
    this.state.sectorsCompletedThisRun += 1;
    if (
      this.state.fastestSectorCompletionMs === null ||
      completionTimeMs < this.state.fastestSectorCompletionMs
    ) {
      this.state.fastestSectorCompletionMs = completionTimeMs;
    }

    this.state.transitionState = "logo-complete";
    this.state.transitionStartedAt = now;
    this.state.previousSectorNumber = this.state.currentSectorNumber;
    return summary;
  }

  tickTransition(now: number): {
    done: boolean;
    advanced: boolean;
    runComplete: boolean;
    recovery: { fuel: number; hull: number; heat: number } | null;
  } {
    const elapsed = now - this.state.transitionStartedAt;
    const sector = this.getCurrentSector();

    if (this.state.transitionState === "logo-complete") {
      if (elapsed >= LOGO_COMPLETE_MS) {
        this.state.transitionState = "sector-transition";
        this.state.transitionStartedAt = now;
        this.state.backgroundBlend = 0;
        return {
          done: false,
          advanced: false,
          runComplete: false,
          recovery: {
            fuel: sectorRecovery.fuelRestorePercent,
            hull: sectorRecovery.hullRestoreAmount,
            heat: sectorRecovery.heatResetPercent,
          },
        };
      }
      return { done: false, advanced: false, runComplete: false, recovery: null };
    }

    if (this.state.transitionState === "sector-transition") {
      const blendT = clamp(elapsed / BACKGROUND_BLEND_MS, 0, 1);
      this.state.backgroundBlend = blendT;

      if (elapsed >= SECTOR_TRANSITION_MS) {
        const completedSector = this.state.currentSectorNumber;
        const runComplete =
          this.maxSectors !== null && completedSector >= this.maxSectors;

        if (runComplete) {
          return { done: true, advanced: false, runComplete: true, recovery: null };
        }

        this.state.currentSectorNumber += 1;
        this.state.currentCycle = getCycleForSector(this.state.currentSectorNumber);
        this.state.transitionState = "next-sector-intro";
        this.state.transitionStartedAt = now;

        return { done: false, advanced: true, runComplete: false, recovery: null };
      }
      return { done: false, advanced: false, runComplete: false, recovery: null };
    }

    if (this.state.transitionState === "next-sector-intro") {
      const blendT = clamp(elapsed / BACKGROUND_BLEND_MS, 0, 1);
      this.state.backgroundBlend = Math.max(this.state.backgroundBlend, blendT);

      if (elapsed >= SECTOR_INTRO_MS) {
        this.state.transitionState = "playing";
        this.state.sectorElapsed = 0;
        this.state.sectorTimeRemaining = SECTOR_DURATION_SECONDS;
        this.state.sectorStartedAt = now;
        this.state.backgroundBlend = 1;
        this.state.lastCompleteSummary = null;
        return { done: true, advanced: true, runComplete: false, recovery: null };
      }
      return { done: false, advanced: false, runComplete: false, recovery: null };
    }

    return { done: false, advanced: false, runComplete: false, recovery: null };
  }

  applyRecovery(current: { fuel: number; hull: number; heat: number; maxHull: number }) {
    return {
      fuel: clamp(current.fuel + sectorRecovery.fuelRestorePercent, 0, 100),
      hull: clamp(current.hull + sectorRecovery.hullRestoreAmount, 0, current.maxHull),
      heat: clamp(current.heat * (1 - sectorRecovery.heatResetPercent / 100), 0, 100),
    };
  }

  toSnapshot(): SectorProgressSnapshot {
    const sector = this.getCurrentSector();
    const prev = this.getPreviousSector();
    const remainingMs = Math.round(this.state.sectorTimeRemaining * 1000);
    const urgent = this.state.sectorTimeRemaining <= 10 && this.state.sectorTimeRemaining > 5;
    const critical = this.state.sectorTimeRemaining <= 5 && this.state.transitionState === "playing";

    let transitionMessage: string | null = null;
    let transitionSubtext: string | null = null;

    if (this.state.transitionState === "logo-complete") {
      transitionMessage = "DYOR SIGNAL RESTORED";
      transitionSubtext = "SECTOR CLEARED";
    } else if (this.state.transitionState === "sector-transition" && this.state.lastCompleteSummary) {
      transitionMessage = "SECTOR CLEARED";
      transitionSubtext = this.state.lastCompleteSummary.sectorName.toUpperCase();
    } else if (this.state.transitionState === "next-sector-intro") {
      transitionMessage = `ENTERING SECTOR ${String(sector.number).padStart(2, "0")}`;
      transitionSubtext = sector.name.toUpperCase();
    } else if (critical) {
      transitionSubtext = "SIGNAL WINDOW CLOSING";
    }

    return {
      currentSectorNumber: sector.number,
      currentSectorId: sector.id,
      currentSectorName: sector.name,
      currentSectorSubtitle: sector.subtitle,
      currentCycle: this.state.currentCycle,
      isExtendedMission: sector.number > CORE_SECTOR_COUNT,
      sectorTimeRemainingMs: remainingMs,
      sectorState: this.state.transitionState,
      sectorsCompletedThisRun: this.state.sectorsCompletedThisRun,
      sectorTransitionMessage: transitionMessage,
      sectorTransitionSubtext: transitionSubtext,
      sectorCompleteSummary: this.state.lastCompleteSummary,
      timerUrgent: urgent,
      timerCritical: critical,
      difficultyLabel: getDifficultyLabel(sector.number),
      letterStyle: sector.letterStyle,
      backgroundConfig: sector.backgroundConfig,
      backgroundBlend: this.state.backgroundBlend,
      previousBackgroundConfig:
        this.state.transitionState !== "playing" ? prev.backgroundConfig : null,
      sectorScoreMultiplier: getExtendedCycleScoreMultiplier(sector.number),
      maxSectorsThisRun: this.maxSectors,
    };
  }
}
