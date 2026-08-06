import { missionConfig } from "@/features/mission-ascent/config/gameConfig";
import { circleCollision } from "@/features/mission-ascent/utils/math";
import type { WorldEntity } from "@/features/mission-ascent/types/mission.types";

export type CollisionBody = {
  x: number;
  y: number;
  radius: number;
};

export function checkEntityCollision(
  player: CollisionBody,
  entity: WorldEntity,
): boolean {
  if (!entity.active) return false;
  const hazardScale =
    entity.kind === "hazard"
      ? missionConfig.collisions.hazardHitboxScale
      : entity.kind === "logo-component"
        ? 0.78
        : 1;
  return circleCollision(
    player.x,
    player.y,
    player.radius,
    entity.x,
    entity.y,
    entity.radius * hazardScale,
  );
}

export function findCollidingEntities(
  player: CollisionBody,
  entities: WorldEntity[],
): WorldEntity[] {
  return entities.filter((e) => checkEntityCollision(player, e));
}
