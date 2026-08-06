import { missionConfig } from "@/features/mission-ascent/config/gameConfig";
import type { GameMode, MissionDebrief } from "@/features/mission-ascent/types/mission.types";

export type DebriefInput = {
  mode: GameMode;
  altitudeKm: number;
  researchCollected: number;
  fuelEfficiencyPercent: number;
  integrityRemaining: number;
  maxIntegrity: number;
  hazardsAvoided: number;
  bestChain: number;
  endCause: MissionDebrief["endCause"];
};

export type FlightAssessment = {
  summary: string;
  highlight: string;
  endCauseLabel: string;
};

export function selectFlightAssessment(input: DebriefInput): FlightAssessment {
  const { maxIntegrity } = input;
  const damageTaken = maxIntegrity - input.integrityRemaining;
  const highAlt = input.altitudeKm >= 80;
  const lowResearch = input.researchCollected < 8;
  const highResearch = input.researchCollected >= 20;
  const greatEfficiency = input.fuelEfficiencyPercent >= 45;
  const manyHits = damageTaken >= 2;

  let summary = "Strong mission balance across speed and recovery.";
  if (highAlt && lowResearch) {
    summary = "Fast ascent. Limited intelligence recovered.";
  } else if (highResearch && !highAlt) {
    summary = "Excellent research discipline. Conservative flight profile.";
  } else if (greatEfficiency && !manyHits) {
    summary = "Exceptional fuel and thermal management.";
  } else if (manyHits) {
    summary = "Telemetry suggests aggressive hazard exposure.";
  }

  let highlight = "Balanced flight";
  if (input.bestChain >= 10) highlight = "Best chain performance";
  else if (input.altitudeKm >= 100) highlight = "Highest altitude";
  else if (input.researchCollected >= 25) highlight = "Research recovery";
  else if (greatEfficiency) highlight = "Fuel efficiency";

  const endCauseLabel =
    input.endCause === "timed-complete" || input.endCause === "mission-run-complete"
      ? "Mission sectors cleared"
      : input.endCause === "signal-window-lost"
        ? "Signal window lost"
        : input.endCause === "fuel-depleted"
          ? "Fuel depleted"
          : input.endCause === "hull-lost"
            ? "Hull integrity lost"
            : "Mission abandoned";

  return { summary, highlight, endCauseLabel };
}

export function computeScoreDelta(current: number, previousBest: number): number | null {
  if (previousBest <= 0) return null;
  return current - previousBest;
}

export { missionConfig };
