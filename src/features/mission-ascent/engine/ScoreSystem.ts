import { missionConfig } from "@/features/mission-ascent/config/gameConfig";
import type { MissionRank, ScoreBreakdown } from "@/features/mission-ascent/types/mission.types";

export type ScoreInput = {
  altitudeKm: number;
  researchCollected: number;
  bestChain: number;
  chainBonusAccumulated: number;
  logoComponentsCollected: number;
  logoCompletionBonus: number;
  signalBoostBonus: number;
  averageThrottle: number;
  fuelRemaining: number;
  initialFuel: number;
  hazardsAvoided: number;
  integrityRemaining: number;
  maxIntegrity: number;
  mode: "timed" | "endless";
  timedCompleted: boolean;
};

export function calculateScoreBreakdown(input: ScoreInput): ScoreBreakdown {
  const { score: cfg } = missionConfig;
  const altitudeScore = Math.floor(input.altitudeKm * cfg.altitudePerKm);
  const researchScore = input.researchCollected * cfg.researchBase;
  const researchChainBonus = input.chainBonusAccumulated;
  const logoComponentScore = input.logoComponentsCollected * cfg.logoComponentBase;
  const logoCompletionBonus = input.logoCompletionBonus;
  const signalBoostBonus = input.signalBoostBonus;
  const throttleMultiplierBonus = Math.floor(researchScore * (input.averageThrottle * 0.35));
  const fuelUsed = input.initialFuel - input.fuelRemaining;
  const fuelEfficiency = input.initialFuel > 0 ? 1 - fuelUsed / input.initialFuel : 0;
  const fuelEfficiencyBonus = Math.floor(Math.max(0, fuelEfficiency) * cfg.fuelEfficiencyWeight);
  const hazardAvoidanceBonus = input.hazardsAvoided * cfg.hazardAvoidancePerSecond;
  const integrityBonus = input.integrityRemaining * cfg.integrityBonusPerPoint;
  const missionCompletionBonus =
    input.mode === "timed" && input.timedCompleted ? cfg.timedCompletionBonus : 0;

  const finalScore =
    altitudeScore +
    researchScore +
    researchChainBonus +
    logoComponentScore +
    logoCompletionBonus +
    signalBoostBonus +
    throttleMultiplierBonus +
    fuelEfficiencyBonus +
    hazardAvoidanceBonus +
    integrityBonus +
    missionCompletionBonus;

  return {
    altitudeScore,
    researchCollected: researchScore,
    researchChainBonus,
    logoComponentScore,
    logoCompletionBonus,
    signalBoostBonus,
    throttleMultiplierBonus,
    fuelEfficiencyBonus,
    hazardAvoidanceBonus,
    integrityBonus,
    missionCompletionBonus,
    finalScore,
  };
}

export function calculateFuelEfficiencyPercent(
  fuelRemaining: number,
  initialFuel: number,
): number {
  if (initialFuel <= 0) return 0;
  return Math.round((fuelRemaining / initialFuel) * 100);
}

export function getRankForScore(score: number): MissionRank {
  let rank: MissionRank = missionConfig.ranks[0].rank;
  for (const entry of missionConfig.ranks) {
    if (score >= entry.minScore) rank = entry.rank;
  }
  return rank;
}

export function calculateChainBonus(chain: number): number {
  if (chain <= 1) return 0;
  return (chain - 1) * missionConfig.score.chainBonusPerLink;
}

export function calculateChainMultiplier(chain: number): number {
  if (chain < 5) return 1;
  if (chain < 10) return 1.25;
  if (chain < 20) return 1.5;
  return 2;
}

export function calculateLogoComponentScore(count: number): number {
  return count * missionConfig.score.logoComponentBase;
}

export function calculateLogoCompletionBonus(completed: boolean): number {
  return completed ? missionConfig.score.logoCompletionBonus : 0;
}
