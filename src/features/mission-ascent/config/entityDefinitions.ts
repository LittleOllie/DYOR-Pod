import type {
  CollectibleType,
  HazardType,
  LogoComponentType,
} from "@/features/mission-ascent/types/mission.types";
import { missionConfig } from "@/features/mission-ascent/config/gameConfig";
import { missionVisuals } from "@/features/mission-ascent/config/visualConfig";
import {
  GAME_ROCKET_SPRITE,
  LOGO_COMPONENT_ASSETS,
  LOGO_COMPONENT_LABELS,
} from "@/features/mission-ascent/config/missionAssembly";

const { scales } = missionVisuals;
const { score: scoreCfg } = missionConfig;

export type CollectibleDefinition = {
  type: CollectibleType;
  label: string;
  color: string;
  glow: string;
  radius: number;
  scoreValue: number;
  fuelRestore?: number;
  heatReduce?: number;
  grantsShield?: boolean;
  chainEligible: boolean;
};

export type HazardDefinition = {
  type: HazardType;
  label: string;
  color: string;
  radius: number;
  damage: number;
  drift?: boolean;
  area?: boolean;
  /** Disabled in arcade wave spawns */
  disabled?: boolean;
};

export type LogoComponentDefinition = {
  type: LogoComponentType;
  label: string;
  assetPath: string;
  color: string;
  glow: string;
  radius: number;
  scoreValue: number;
};

const basePickup = 14;
const pickupR = (scale: number) => Math.round(basePickup * scale);

export const collectibleDefinitions: Record<CollectibleType, CollectibleDefinition> = {
  research: {
    type: "research",
    label: "Data Shard",
    color: "#31d1c6",
    glow: "#13a9a6",
    radius: pickupR(scales.dataShard),
    scoreValue: scoreCfg.researchBase,
    chainEligible: true,
  },
  "data-cube": {
    type: "data-cube",
    label: "Data Cluster",
    color: "#4ecde8",
    glow: "#22c4bd",
    radius: pickupR(scales.dataCluster),
    scoreValue: Math.round(scoreCfg.researchBase * 2),
    chainEligible: true,
  },
  "signal-beacon": {
    type: "signal-beacon",
    label: "Signal Beacon",
    color: "#7dd3fc",
    glow: "#31d1c6",
    radius: pickupR(scales.signalBeacon),
    scoreValue: Math.round(scoreCfg.researchBase * 1.5),
    chainEligible: false,
  },
  fuel: {
    type: "fuel",
    label: "Fuel Cell",
    color: "#e5cf59",
    glow: "#c4b04a",
    radius: pickupR(scales.fuelCell),
    scoreValue: 0,
    fuelRestore: 20,
    chainEligible: false,
  },
  shield: {
    type: "shield",
    label: "Shield Core",
    color: "#3ecf8e",
    glow: "#13a9a6",
    radius: pickupR(scales.shieldCore),
    scoreValue: 0,
    grantsShield: true,
    chainEligible: false,
  },
  cooling: {
    type: "cooling",
    label: "Cooling Core",
    color: "#6ee7d8",
    glow: "#31d1c6",
    radius: pickupR(scales.coolingCore),
    scoreValue: 0,
    heatReduce: 35,
    chainEligible: false,
  },
};

export const hazardDefinitions: Record<HazardType, HazardDefinition> = {
  asteroid: {
    type: "asteroid",
    label: "Asteroid",
    color: "#8b7355",
    radius: Math.round(18 * scales.asteroidMedium),
    damage: 1,
  },
  debris: {
    type: "debris",
    label: "Satellite Debris",
    color: "#6b7280",
    radius: Math.round(16 * scales.debris),
    damage: 1,
    drift: true,
  },
  radiation: {
    type: "radiation",
    label: "Radiation Barrier",
    color: "#e85d4c",
    radius: Math.round(34 * scales.radiation),
    damage: 1,
    area: true,
  },
  drone: {
    type: "drone",
    label: "Rogue Drone",
    color: "#94a3b8",
    radius: Math.round(16 * scales.drone),
    damage: 1,
    drift: true,
  },
  magnetic: {
    type: "magnetic",
    label: "Magnetic Distortion",
    color: "#a78bfa",
    radius: 40,
    damage: 0,
    area: true,
    disabled: true,
  },
  "fud-cloud": {
    type: "fud-cloud",
    label: "FUD Cloud",
    color: "#64748b",
    radius: Math.round(30 * scales.fudCloud),
    damage: 1,
    area: true,
  },
  "rug-signal": {
    type: "rug-signal",
    label: "Rug Signal",
    color: "#e85d4c",
    radius: Math.round(14 * scales.rugSignal),
    damage: 1,
    disabled: true,
  },
};

const logoR = Math.round(14 * scales.logoComponent);

export const logoComponentDefinitions: Record<LogoComponentType, LogoComponentDefinition> = {
  d: {
    type: "d",
    label: LOGO_COMPONENT_LABELS.d,
    assetPath: LOGO_COMPONENT_ASSETS.d,
    color: "#31d1c6",
    glow: "#13a9a6",
    radius: logoR,
    scoreValue: scoreCfg.logoComponentBase,
  },
  y: {
    type: "y",
    label: LOGO_COMPONENT_LABELS.y,
    assetPath: LOGO_COMPONENT_ASSETS.y,
    color: "#31d1c6",
    glow: "#13a9a6",
    radius: logoR,
    scoreValue: scoreCfg.logoComponentBase,
  },
  o: {
    type: "o",
    label: LOGO_COMPONENT_LABELS.o,
    assetPath: LOGO_COMPONENT_ASSETS.o,
    color: "#31d1c6",
    glow: "#13a9a6",
    radius: logoR,
    scoreValue: scoreCfg.logoComponentBase,
  },
  r: {
    type: "r",
    label: LOGO_COMPONENT_LABELS.r,
    assetPath: LOGO_COMPONENT_ASSETS.r,
    color: "#31d1c6",
    glow: "#13a9a6",
    radius: logoR,
    scoreValue: scoreCfg.logoComponentBase,
  },
};

/** Asset manifest — procedural entity drawers + PNG sprites for logo/rocket. */
export const missionAssetManifest = {
  rocket: { path: GAME_ROCKET_SPRITE, width: 128, height: 128, anchor: { x: 0.5, y: 0.85 } },
  rocketSvg: { component: "RocketMark", viewBox: "0 0 120 144" },
  logoFinal: { path: "/brand/logo-final.png" },
  particles: { path: "procedural", size: 4 },
  rendering: { module: "entityDrawers", sharedPreview: true },
  logoComponents: Object.fromEntries(
    Object.entries(logoComponentDefinitions).map(([k, v]) => [
      k,
      { path: v.assetPath, radius: v.radius },
    ]),
  ),
  collectibles: Object.fromEntries(
    Object.entries(collectibleDefinitions).map(([k, v]) => [k, { drawer: k, radius: v.radius }]),
  ),
  hazards: Object.fromEntries(
    Object.entries(hazardDefinitions).map(([k, v]) => [k, { drawer: k, radius: v.radius }]),
  ),
  zones: "procedural-gradient",
} as const;

export function getEntityRadius(
  kind: "collectible" | "hazard" | "logo-component",
  type: CollectibleType | HazardType | LogoComponentType,
): number {
  if (kind === "logo-component") {
    return logoComponentDefinitions[type as LogoComponentType].radius;
  }
  if (kind === "collectible") {
    return collectibleDefinitions[type as CollectibleType].radius;
  }
  return hazardDefinitions[type as HazardType].radius;
}
