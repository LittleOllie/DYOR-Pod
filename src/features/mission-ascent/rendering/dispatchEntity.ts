import {
  collectibleDefinitions,
  hazardDefinitions,
  logoComponentDefinitions,
} from "@/features/mission-ascent/config/entityDefinitions";
import { drawCollectibleEntity } from "@/features/mission-ascent/rendering/entityDrawers/drawCollectibles";
import { drawHazardEntity } from "@/features/mission-ascent/rendering/entityDrawers/drawHazards";
import { drawLogoComponentEntity } from "@/features/mission-ascent/rendering/entityDrawers/drawLogoComponent";
import { drawEntityShadow } from "@/features/mission-ascent/rendering/shared/primitives";
import type { EntityDrawContext, EntityDrawEntity } from "@/features/mission-ascent/rendering/types";
import type {
  CollectibleType,
  HazardType,
  LogoComponentType,
  WorldEntity,
} from "@/features/mission-ascent/types/mission.types";

export type EntityKind = "collectible" | "hazard" | "logo-component";

export function toDrawEntity(entity: WorldEntity | EntityDrawEntity): EntityDrawEntity {
  return {
    id: entity.id,
    x: entity.x,
    y: entity.y,
    radius: entity.radius,
    rotation: entity.rotation,
    type: entity.type,
    telegraphed: "telegraphed" in entity ? entity.telegraphed : undefined,
  };
}

export function drawWorldEntity(
  drawCtx: EntityDrawContext,
  entity: WorldEntity | EntityDrawEntity,
  kind: EntityKind,
): void {
  const e = toDrawEntity(entity);
  drawEntityShadow(drawCtx.ctx, e.x, e.y, e.radius);

  switch (kind) {
    case "logo-component": {
      const def = logoComponentDefinitions[e.type as LogoComponentType];
      if (!def) return;
      drawLogoComponentEntity(drawCtx, e, def);
      break;
    }
    case "collectible": {
      const def = collectibleDefinitions[e.type as CollectibleType];
      if (!def) return;
      drawCollectibleEntity(drawCtx, e, def);
      break;
    }
    case "hazard": {
      const def = hazardDefinitions[e.type as HazardType];
      if (!def) return;
      drawHazardEntity(drawCtx, e, def);
      break;
    }
  }
}

export function drawEntityPreview(
  drawCtx: EntityDrawContext,
  kind: EntityKind,
  type: string,
  radius: number,
): void {
  const entity: EntityDrawEntity = {
    id: type.split("").reduce((a, c) => a + c.charCodeAt(0), 0),
    x: 0,
    y: 0,
    radius,
    rotation: 0,
    type,
  };

  switch (kind) {
    case "logo-component": {
      const def = logoComponentDefinitions[type as LogoComponentType];
      if (!def) return;
      drawLogoComponentEntity(drawCtx, entity, def);
      break;
    }
    case "collectible": {
      const def = collectibleDefinitions[type as CollectibleType];
      if (!def) return;
      drawCollectibleEntity(drawCtx, entity, def);
      break;
    }
    case "hazard": {
      const def = hazardDefinitions[type as HazardType];
      if (!def) return;
      drawHazardEntity(drawCtx, entity, def);
      break;
    }
  }
}

export const ENTITY_DRAWER_TYPES = {
  collectibles: Object.keys(collectibleDefinitions),
  hazards: Object.keys(hazardDefinitions),
  logoComponents: Object.keys(logoComponentDefinitions),
} as const;

export function getEntityDrawerKind(
  kind: EntityKind,
  type: string,
): boolean {
  if (kind === "collectible") return type in collectibleDefinitions;
  if (kind === "hazard") return type in hazardDefinitions;
  return type in logoComponentDefinitions;
}
