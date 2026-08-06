import type { MissionVisualQuality } from "@/features/mission-ascent/config/visualConfig";
import type {
  CollectibleType,
  HazardType,
  LogoComponentType,
} from "@/features/mission-ascent/types/mission.types";

export type EntityDrawEntity = {
  id: number;
  x: number;
  y: number;
  radius: number;
  rotation: number;
  type: CollectibleType | HazardType | LogoComponentType | string;
  telegraphed?: boolean;
};

export type EntityDrawContext = {
  ctx: CanvasRenderingContext2D;
  time: number;
  quality: MissionVisualQuality;
  reducedEffects?: boolean;
};

export type TransientEffectKind = "pickup" | "impact" | "near-miss" | "target-lock";

export type TransientEffect = {
  id: number;
  kind: TransientEffectKind;
  x: number;
  y: number;
  radius: number;
  color: string;
  startTime: number;
  durationMs: number;
  active: boolean;
};
