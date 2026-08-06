import { missionConfig } from "@/features/mission-ascent/config/gameConfig";
import { clamp } from "@/features/mission-ascent/utils/math";

export type NormalisedX = number;

export type PlayfieldBounds = {
  viewportWidth: number;
  viewportHeight: number;
  activeWidth: number;
  offsetX: number;
  minSpawnX: number;
  maxSpawnX: number;
  minPlayerX: number;
  maxPlayerX: number;
  widthScale: number;
  rocketRenderScale: number;
  laneCount: number;
};

const LANE_WEIGHTS_7 = [0.7, 1, 1.2, 1.35, 1.2, 1, 0.7];

export function getLaneCountForWidth(activeWidth: number): number {
  if (activeWidth < 480) return 4;
  if (activeWidth < 640) return 5;
  if (activeWidth < 900) return 6;
  if (activeWidth < 1100) return 7;
  if (activeWidth < 1300) return 8;
  return 9;
}

export function getLaneWeights(laneCount: number): number[] {
  if (laneCount === 7) return [...LANE_WEIGHTS_7];
  const mid = (laneCount - 1) / 2;
  return Array.from({ length: laneCount }, (_, i) => {
    const dist = Math.abs(i - mid) / Math.max(1, mid);
    return 1.35 - dist * 0.65;
  });
}

export function createPlayfield(
  viewportWidth: number,
  viewportHeight: number,
  playerRadius: number,
  entityRadius = 18,
): PlayfieldBounds {
  const { maxActiveWidth, viewportMargin } = missionConfig.playfield;
  const activeWidth = Math.min(viewportWidth, maxActiveWidth);
  const offsetX = (viewportWidth - activeWidth) / 2;
  const horizontalPadding = playerRadius + entityRadius + viewportMargin;
  const minSpawnX = horizontalPadding;
  const maxSpawnX = activeWidth - horizontalPadding;
  const minPlayerX = missionConfig.controls.playerBoundaryPadding + playerRadius;
  const maxPlayerX = activeWidth - missionConfig.controls.playerBoundaryPadding - playerRadius;
  const ref = missionConfig.controls.referencePlayfieldWidth;
  const widthScale = clamp(
    activeWidth / ref,
    0.85,
    missionConfig.controls.maximumWidthSpeedScale,
  );
  const rocketRenderScale = clamp(
    activeWidth / ref,
    1,
    missionConfig.playfield.maxRocketRenderScale,
  );
  const laneCount = getLaneCountForWidth(activeWidth);

  return {
    viewportWidth,
    viewportHeight: viewportHeight,
    activeWidth,
    offsetX,
    minSpawnX,
    maxSpawnX,
    minPlayerX,
    maxPlayerX,
    widthScale,
    rocketRenderScale,
    laneCount,
  };
}

/** Convert lane index (0..laneCount-1) to world X inside active playfield */
export function laneToX(
  lane: number,
  laneCount: number,
  minSpawnX: number,
  maxSpawnX: number,
): number {
  if (laneCount <= 1) return (minSpawnX + maxSpawnX) / 2;
  const t = lane / (laneCount - 1);
  return minSpawnX + t * (maxSpawnX - minSpawnX);
}

/** Convert normalised 0–1 position to spawn X */
export function normalisedToSpawnX(
  nx: NormalisedX,
  minSpawnX: number,
  maxSpawnX: number,
): number {
  return minSpawnX + clamp(nx, 0, 1) * (maxSpawnX - minSpawnX);
}

export function spawnXToNormalised(
  x: number,
  minSpawnX: number,
  maxSpawnX: number,
): NormalisedX {
  const span = maxSpawnX - minSpawnX;
  if (span <= 0) return 0.5;
  return clamp((x - minSpawnX) / span, 0, 1);
}

export type LanePickerState = {
  recentSpawnLanes: number[];
};

export function createLanePickerState(): LanePickerState {
  return { recentSpawnLanes: [] };
}

export function pickWeightedLane(
  state: LanePickerState,
  laneCount: number,
  rng: () => number = Math.random,
): number {
  const base = getLaneWeights(laneCount);
  const adjusted = base.map((w, i) => {
    const recentHits = state.recentSpawnLanes.filter((l) => l === i).length;
    return w * Math.pow(0.55, recentHits);
  });
  const total = adjusted.reduce((a, b) => a + b, 0);
  let roll = rng() * total;
  for (let i = 0; i < laneCount; i += 1) {
    roll -= adjusted[i];
    if (roll <= 0) {
      state.recentSpawnLanes.push(i);
      if (state.recentSpawnLanes.length > 6) state.recentSpawnLanes.shift();
      return i;
    }
  }
  return laneCount - 1;
}

/** Pick N distinct lanes, biased toward spread */
export function pickDistinctLanes(
  state: LanePickerState,
  laneCount: number,
  count: number,
  rng: () => number = Math.random,
): number[] {
  const lanes: number[] = [];
  const used = new Set<number>();
  let attempts = 0;
  while (lanes.length < count && attempts < count * 8) {
    attempts += 1;
    const lane = pickWeightedLane(state, laneCount, rng);
    if (!used.has(lane) || laneCount <= count) {
      if (!used.has(lane)) {
        lanes.push(lane);
        used.add(lane);
      }
    }
  }
  while (lanes.length < count) {
    const lane = Math.floor(rng() * laneCount);
    if (!used.has(lane)) {
      lanes.push(lane);
      used.add(lane);
    }
  }
  return lanes;
}
