import { getTimedPhase, missionConfig } from "@/features/mission-ascent/config/gameConfig";
import { clamp } from "@/features/mission-ascent/utils/math";

export function calculateDifficulty(input: {
  elapsedSeconds: number;
  altitudeKm: number;
  mode: "timed" | "endless";
  throttle: number;
}): number {
  const { starting, maximum } = missionConfig.difficulty;
  const phase = getTimedPhase(input.elapsedSeconds);
  const phaseBoost =
    phase === "warmup"
      ? 0
      : phase === "cruise"
        ? 1
        : phase === "pressure"
          ? 2.5
          : phase === "intense"
            ? 3.5
            : 4.5;

  const timeFactor =
    input.mode === "timed"
      ? input.elapsedSeconds / missionConfig.timedMissionSeconds
      : input.elapsedSeconds / 180;
  const altitudeFactor = input.altitudeKm / 350;
  const throttleFactor = input.throttle * 0.12;
  const raw = starting + timeFactor * 3.5 + altitudeFactor * 1.8 + throttleFactor + phaseBoost * 0.35;
  return clamp(raw, starting, maximum);
}

export function getSpawnIntervalMs(difficulty: number, phase = getTimedPhase(0)): number {
  const { intervalMinMs, intervalMaxMs } = missionConfig.spawning;
  const phaseScale =
    phase === "warmup" ? 1.15 : phase === "finale" ? 0.82 : phase === "intense" ? 0.88 : 0.95;
  return clamp((intervalMaxMs - difficulty * 115) * phaseScale, intervalMinMs, intervalMaxMs);
}

export function getHazardChance(
  difficulty: number,
  hazardWeight: number,
  phase = getTimedPhase(0),
): number {
  if (phase === "warmup") return missionConfig.spawning.warmupHazardChance * hazardWeight;
  const base = 0.2 + difficulty * 0.045 * hazardWeight;
  if (phase === "intense" || phase === "finale") return clamp(base * 1.15, 0.15, 0.78);
  return clamp(base, 0.12, 0.72);
}

export function getPatternComplexity(difficulty: number): number {
  return clamp(Math.floor(difficulty / 2), 1, 5);
}

export { getTimedPhase };
