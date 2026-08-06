import { missionConfig } from "@/features/mission-ascent/config/gameConfig";
import type { LogoComponentType, WorldEntity } from "@/features/mission-ascent/types/mission.types";

export type ArcadeWaveType =
  | (typeof missionConfig.waves.waveTypes)[number]
  | "logo-approach";

export type EntityCounts = {
  hazards: number;
  collectibles: number;
  logos: number;
  total: number;
};

export function countActiveEntities(entities: WorldEntity[]): EntityCounts {
  let hazards = 0;
  let collectibles = 0;
  let logos = 0;
  for (const entity of entities) {
    if (!entity.active) continue;
    if (entity.kind === "hazard") hazards += 1;
    else if (entity.kind === "logo-component") logos += 1;
    else collectibles += 1;
  }
  return { hazards, collectibles, logos, total: hazards + collectibles + logos };
}

export function canSpawnKind(
  entities: WorldEntity[],
  kind: "hazard" | "collectible" | "logo",
): boolean {
  const counts = countActiveEntities(entities);
  const { waves } = missionConfig;
  if (counts.total >= waves.maxVisibleTotal) return false;
  if (kind === "hazard" && counts.hazards >= waves.maxVisibleHazards) return false;
  if (kind === "collectible" && counts.collectibles >= waves.maxVisibleCollectibles) return false;
  if (kind === "logo" && counts.logos >= waves.maxVisibleLogoComponents) return false;
  return true;
}

export function hasActiveLogoComponent(
  entities: WorldEntity[],
  type?: LogoComponentType,
): boolean {
  return entities.some(
    (e) =>
      e.active &&
      e.kind === "logo-component" &&
      (type === undefined || e.type === type),
  );
}

export function getLogoSpawnWindow(componentIndex: number): number {
  const windows = missionConfig.missionAssembly.componentSpawnWindows;
  return windows[componentIndex] ?? 999;
}

export function shouldTelegraphLogo(
  playElapsed: number,
  componentIndex: number,
  telegraphedIndex: number,
): boolean {
  if (componentIndex <= telegraphedIndex) return false;
  const window = getLogoSpawnWindow(componentIndex);
  return playElapsed >= window - missionConfig.missionAssembly.telegraphLeadSeconds;
}

export function shouldSpawnLogo(
  playElapsed: number,
  componentIndex: number,
  spawnedIndex: number,
  assemblyComplete: boolean,
  entities: WorldEntity[],
): boolean {
  if (assemblyComplete || componentIndex <= spawnedIndex) return false;
  if (hasActiveLogoComponent(entities)) return false;
  if (!canSpawnKind(entities, "logo")) return false;
  return playElapsed >= getLogoSpawnWindow(componentIndex);
}

export function buildArcadeWaveCycle(): ArcadeWaveType[] {
  return [...missionConfig.waves.waveTypes];
}
