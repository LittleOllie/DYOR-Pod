import { getTimedPhase, missionConfig } from "@/features/mission-ascent/config/gameConfig";
import {
  collectibleDefinitions,
  hazardDefinitions,
  logoComponentDefinitions,
} from "@/features/mission-ascent/config/entityDefinitions";
import {
  buildArcadeWaveCycle,
  canSpawnKind,
  type ArcadeWaveType,
} from "@/features/mission-ascent/engine/ArcadeWaveSystem";
import { getHazardChance } from "@/features/mission-ascent/engine/DifficultySystem";
import {
  createLanePickerState,
  laneToX,
  pickDistinctLanes,
  pickWeightedLane,
  type LanePickerState,
  type PlayfieldBounds,
  spawnXToNormalised,
} from "@/features/mission-ascent/engine/Playfield";
import type {
  CollectibleType,
  HazardType,
  LogoComponentType,
  WorldEntity,
} from "@/features/mission-ascent/types/mission.types";

let nextEntityId = 1;

export function resetEntityIds(): void {
  nextEntityId = 1;
}

export type PatternType =
  | "single"
  | "research-trail"
  | "chain-lane"
  | "fuel-decision"
  | "split-reward"
  | "hazard-corridor"
  | "curved-trail"
  | "cluster"
  | "staggered-lanes"
  | "safe-corridor"
  | "signal-corridor";

export type SpawnBeat =
  | "research-formation"
  | "gap"
  | "hazard-pattern"
  | "resource-decision"
  | "chain-opportunity"
  | "breathing";

export type SpawnDiagnostic = {
  x: number;
  normalisedX: number;
  lane: number;
  entityType: string;
  patternType: PatternType;
  viewportWidth: number;
};

const DEV_SPAWN_DIAG =
  typeof process !== "undefined" &&
  process.env.NODE_ENV === "development" &&
  process.env.NEXT_PUBLIC_MISSION_SPAWN_DIAG === "1";

const spawnDiagnostics: SpawnDiagnostic[] = [];

export function getSpawnDiagnostics(): readonly SpawnDiagnostic[] {
  return spawnDiagnostics;
}

export function clearSpawnDiagnostics(): void {
  spawnDiagnostics.length = 0;
}

function recordDiagnostic(
  x: number,
  lane: number,
  entityType: string,
  patternType: PatternType,
  playfield: PlayfieldBounds,
): void {
  if (!DEV_SPAWN_DIAG) return;
  spawnDiagnostics.push({
    x,
    normalisedX: spawnXToNormalised(x, playfield.minSpawnX, playfield.maxSpawnX),
    lane,
    entityType,
    patternType,
    viewportWidth: playfield.viewportWidth,
  });
  if (spawnDiagnostics.length > 2000) spawnDiagnostics.shift();
}

function activateEntity(
  slot: WorldEntity,
  kind: "collectible" | "hazard" | "logo-component",
  type: CollectibleType | HazardType | LogoComponentType,
  x: number,
  y: number,
  vy: number,
): void {
  const def =
    kind === "logo-component"
      ? logoComponentDefinitions[type as LogoComponentType]
      : kind === "collectible"
        ? collectibleDefinitions[type as CollectibleType]
        : hazardDefinitions[type as HazardType];
  if (!def) return;
  slot.kind = kind;
  slot.type = type;
  slot.x = x;
  slot.y = y;
  slot.vx =
    kind === "hazard" && "drift" in def && def.drift ? (Math.random() - 0.5) * 70 : 0;
  slot.vy = vy;
  slot.radius = def.radius;
  slot.rotation = kind === "logo-component" ? 0 : Math.random() * Math.PI * 2;
  slot.rotationSpeed =
    kind === "logo-component" ? 0.8 : (Math.random() - 0.5) * 2.5;
  slot.active = true;
  slot.telegraphed = kind === "hazard" && ("area" in def ? def.area : false);
  slot.value =
    kind === "collectible" || kind === "logo-component"
      ? (def as { scoreValue: number }).scoreValue
      : undefined;
  slot.spawnedAt = performance.now();
  slot.id = nextEntityId++;
}

function getInactiveSlot(entities: WorldEntity[]): WorldEntity | null {
  return entities.find((e) => !e.active) ?? null;
}

function clampSpawnX(x: number, playfield: PlayfieldBounds, entityRadius: number): number {
  return Math.max(
    playfield.minSpawnX + entityRadius * 0.2,
    Math.min(playfield.maxSpawnX - entityRadius * 0.2, x),
  );
}

function spawnAtLane(
  entities: WorldEntity[],
  playfield: PlayfieldBounds,
  lane: number,
  y: number,
  kind: "collectible" | "hazard" | "logo-component",
  type: CollectibleType | HazardType | LogoComponentType,
  scrollSpeed: number,
  patternType: PatternType,
): boolean {
  if (kind === "hazard" && !canSpawnKind(entities, "hazard")) return false;
  if (kind === "collectible" && !canSpawnKind(entities, "collectible")) return false;
  if (kind === "logo-component" && !canSpawnKind(entities, "logo")) return false;
  const slot = getInactiveSlot(entities);
  if (!slot) return false;
  const def =
    kind === "logo-component"
      ? logoComponentDefinitions[type as LogoComponentType]
      : kind === "collectible"
        ? collectibleDefinitions[type as CollectibleType]
        : hazardDefinitions[type as HazardType];
  if (!def) return false;
  const x = clampSpawnX(
    laneToX(lane, playfield.laneCount, playfield.minSpawnX, playfield.maxSpawnX),
    playfield,
    def.radius,
  );
  activateEntity(slot, kind, type, x, y, scrollSpeed * (kind === "hazard" ? 0.1 : 0.06));
  recordDiagnostic(x, lane, type, patternType, playfield);
  return true;
}

function pickCollectible(
  difficulty: number,
  fuelWeight: number,
  forceFuel = false,
): CollectibleType {
  if (forceFuel) return "fuel";
  const roll = Math.random();
  const fuelChance = Math.min(0.4, 0.14 * fuelWeight);
  if (roll < fuelChance) return "fuel";
  if (difficulty > 5 && Math.random() < 0.1) return "shield";
  if (Math.random() < 0.07) return "cooling";
  return "research";
}

function pickHazard(difficulty: number, asteroidField: boolean): HazardType {
  const pool: HazardType[] = ["asteroid", "debris", "drone", "radiation"];
  if (asteroidField) {
    return Math.random() < 0.65 ? "asteroid" : "debris";
  }
  if (difficulty > 5 && Math.random() < 0.12) return "drone";
  if (difficulty > 4 && Math.random() < 0.1) return "radiation";
  if (Math.random() < 0.25) return "debris";
  if (difficulty > 6 && Math.random() < 0.06) return "fud-cloud";
  const pick = pool[Math.floor(Math.random() * pool.length)] ?? "asteroid";
  const def = hazardDefinitions[pick];
  if (def.disabled) return "asteroid";
  return pick;
}

export type SpawnSchedulerState = {
  waveIndex: number;
  waves: ArcadeWaveType[];
  lanePicker: LanePickerState;
  lastFuelSpawnAt: number;
  logoTelegraphedIndex: number;
  logoSpawnedIndex: number;
};

export function createSpawnScheduler(): SpawnSchedulerState {
  return {
    waveIndex: 0,
    waves: buildArcadeWaveCycle(),
    lanePicker: createLanePickerState(),
    lastFuelSpawnAt: -999,
    logoTelegraphedIndex: -1,
    logoSpawnedIndex: -1,
  };
}

export type SpawnContext = {
  entities: WorldEntity[];
  playfield: PlayfieldBounds;
  height: number;
  scrollSpeed: number;
  difficulty: number;
  hazardWeight: number;
  researchWeight: number;
  playElapsed: number;
  sectorElapsed: number;
  inBreathingWindow: boolean;
  hazardPool: readonly string[];
  fuel: number;
  signalBurst: boolean;
  asteroidField: boolean;
  debrisCorridor: boolean;
  boostWindow: boolean;
  signalBoostActive: boolean;
  nextLogoComponent: LogoComponentType | null;
  assemblyComplete: boolean;
  logoComponentIndex: number;
  scheduler: SpawnSchedulerState;
};

function pickHazardFromPool(
  pool: readonly string[],
  difficulty: number,
  asteroidField: boolean,
): HazardType {
  if (asteroidField && pool.includes("asteroid")) {
    return Math.random() < 0.65 ? "asteroid" : (pool.includes("debris") ? "debris" : "asteroid");
  }
  const enabled = pool.filter((h) => {
    const def = hazardDefinitions[h as HazardType];
    return def && !def.disabled;
  }) as HazardType[];
  if (enabled.length === 0) return "asteroid";
  if (difficulty > 5 && enabled.includes("drone") && Math.random() < 0.15) return "drone";
  if (difficulty > 4 && enabled.includes("radiation") && Math.random() < 0.12) return "radiation";
  if (enabled.includes("fud-cloud") && difficulty > 6 && Math.random() < 0.08) return "fud-cloud";
  return enabled[Math.floor(Math.random() * enabled.length)] ?? "asteroid";
}

function computeFuelWeight(fuel: number, lastFuelSpawnAt: number, playElapsed: number): number {
  const { fuelAssist } = missionConfig;
  const sinceFuel = playElapsed - lastFuelSpawnAt;
  if (sinceFuel < fuelAssist.minimumSecondsBetweenFuelSpawns) return 1;
  if (fuel > 70) return 0.6;
  if (fuel <= fuelAssist.criticalThreshold) return fuelAssist.spawnWeightAtCritical;
  if (fuel <= fuelAssist.warningThreshold) return fuelAssist.spawnWeightAtWarning;
  return 1;
}

function lookAheadY(): number {
  return -(
    missionConfig.spawning.spawnLookAheadMin +
    Math.random() *
      (missionConfig.spawning.spawnLookAheadMax - missionConfig.spawning.spawnLookAheadMin)
  );
}

function spawnResearchTrail(
  ctx: SpawnContext,
  startLane: number,
  count: number,
  patternType: PatternType,
): void {
  const y0 = lookAheadY();
  for (let i = 0; i < count; i += 1) {
    const lane = clampLane(startLane + (i % 3) - 1, ctx.playfield.laneCount);
    spawnAtLane(
      ctx.entities,
      ctx.playfield,
      lane,
      y0 - i * 36,
      "collectible",
      ctx.signalBurst ? pickCollectible(ctx.difficulty, 1) : "research",
      ctx.scrollSpeed,
      patternType,
    );
  }
}

function spawnChainLane(ctx: SpawnContext, lane: number): void {
  const y0 = lookAheadY();
  for (let i = 0; i < 4; i += 1) {
    spawnAtLane(
      ctx.entities,
      ctx.playfield,
      lane,
      y0 - i * 34,
      "collectible",
      "research",
      ctx.scrollSpeed,
      "chain-lane",
    );
  }
}

function spawnFuelDecision(ctx: SpawnContext, fuelWeight: number): void {
  const lanes = pickDistinctLanes(ctx.scheduler.lanePicker, ctx.playfield.laneCount, 3);
  const y = lookAheadY();
  const forceFuel = fuelWeight > 1.4 && ctx.fuel < missionConfig.fuelAssist.warningThreshold;
  spawnAtLane(ctx.entities, ctx.playfield, lanes[0], y, "hazard", pickHazard(ctx.difficulty, ctx.asteroidField), ctx.scrollSpeed, "fuel-decision");
  spawnAtLane(
    ctx.entities,
    ctx.playfield,
    lanes[1],
    y - 10,
    "collectible",
    forceFuel ? "fuel" : pickCollectible(ctx.difficulty, fuelWeight, forceFuel),
    ctx.scrollSpeed,
    "fuel-decision",
  );
  spawnAtLane(ctx.entities, ctx.playfield, lanes[2], y, "hazard", pickHazard(ctx.difficulty, ctx.asteroidField), ctx.scrollSpeed, "fuel-decision");
  if (forceFuel) ctx.scheduler.lastFuelSpawnAt = ctx.playElapsed;
}

function spawnHazardCorridor(ctx: SpawnContext): void {
  const gapLane = pickWeightedLane(ctx.scheduler.lanePicker, ctx.playfield.laneCount);
  const y0 = lookAheadY();
  for (let i = 0; i < ctx.playfield.laneCount; i += 1) {
    if (i === gapLane || i === gapLane - 1 || i === gapLane + 1) continue;
    if (Math.random() > 0.55) continue;
    spawnAtLane(
      ctx.entities,
      ctx.playfield,
      i,
      y0 - Math.random() * 40,
      "hazard",
      pickHazard(ctx.difficulty, ctx.asteroidField),
      ctx.scrollSpeed,
      "hazard-corridor",
    );
  }
  for (let j = 0; j < 2; j += 1) {
    spawnAtLane(
      ctx.entities,
      ctx.playfield,
      gapLane,
      y0 - 50 - j * 38,
      "collectible",
      pickCollectible(ctx.difficulty, 1),
      ctx.scrollSpeed,
      "hazard-corridor",
    );
  }
}

function spawnSplitReward(ctx: SpawnContext, fuelWeight: number): void {
  const leftLanes = pickDistinctLanes(ctx.scheduler.lanePicker, ctx.playfield.laneCount, 4);
  const y = lookAheadY();
  for (let i = 0; i < 3; i += 1) {
    spawnAtLane(ctx.entities, ctx.playfield, leftLanes[i], y - i * 8, "collectible", "research", ctx.scrollSpeed, "split-reward");
  }
  spawnAtLane(
    ctx.entities,
    ctx.playfield,
    leftLanes[3],
    y,
    "collectible",
    pickCollectible(ctx.difficulty, fuelWeight),
    ctx.scrollSpeed,
    "split-reward",
  );
}

function spawnStaggeredLanes(ctx: SpawnContext, fuelWeight: number): void {
  const lanes = pickDistinctLanes(ctx.scheduler.lanePicker, ctx.playfield.laneCount, 4);
  const y0 = lookAheadY();
  lanes.forEach((lane, i) => {
    const isHazard = !ctx.boostWindow && Math.random() < getHazardChance(ctx.difficulty, ctx.hazardWeight, getTimedPhase(ctx.playElapsed)) * 0.5;
    if (isHazard) {
      spawnAtLane(ctx.entities, ctx.playfield, lane, y0 - i * 42, "hazard", pickHazard(ctx.difficulty, ctx.asteroidField), ctx.scrollSpeed, "staggered-lanes");
    } else {
      spawnAtLane(
        ctx.entities,
        ctx.playfield,
        lane,
        y0 - i * 42,
        "collectible",
        pickCollectible(ctx.difficulty, fuelWeight),
        ctx.scrollSpeed,
        "staggered-lanes",
      );
    }
  });
}

function spawnCluster(ctx: SpawnContext, fuelWeight: number): void {
  const center = pickWeightedLane(ctx.scheduler.lanePicker, ctx.playfield.laneCount);
  const y = lookAheadY();
  for (let i = 0; i < 3; i += 1) {
    const lane = clampLane(center + i - 1, ctx.playfield.laneCount);
    spawnAtLane(
      ctx.entities,
      ctx.playfield,
      lane,
      y - i * 22,
      "collectible",
      pickCollectible(ctx.difficulty, fuelWeight),
      ctx.scrollSpeed,
      "cluster",
    );
  }
}

function spawnCurvedTrail(ctx: SpawnContext): void {
  const startLane = pickWeightedLane(ctx.scheduler.lanePicker, ctx.playfield.laneCount);
  const y0 = lookAheadY();
  for (let i = 0; i < 4; i += 1) {
    const wave = Math.round(Math.sin(i * 0.9) * 1.5);
    const lane = clampLane(startLane + wave, ctx.playfield.laneCount);
    spawnAtLane(
      ctx.entities,
      ctx.playfield,
      lane,
      y0 - i * 32,
      "collectible",
      "research",
      ctx.scrollSpeed,
      "curved-trail",
    );
  }
}

function spawnSafeCorridor(ctx: SpawnContext): void {
  const gapLane = pickWeightedLane(ctx.scheduler.lanePicker, ctx.playfield.laneCount);
  const y0 = lookAheadY();
  for (const side of [-2, -1, 1, 2]) {
    const lane = clampLane(gapLane + side, ctx.playfield.laneCount);
    if (lane === gapLane) continue;
    spawnAtLane(
      ctx.entities,
      ctx.playfield,
      lane,
      y0,
      "collectible",
      "research",
      ctx.scrollSpeed,
      "safe-corridor",
    );
  }
}

function clampLane(lane: number, laneCount: number): number {
  return Math.max(0, Math.min(laneCount - 1, lane));
}

function spawnLogoApproach(ctx: SpawnContext, component: LogoComponentType): void {
  const centerLane = Math.floor(ctx.playfield.laneCount / 2);
  const yLogo = lookAheadY() - 20;
  const sideOffset = Math.max(2, Math.floor(ctx.playfield.laneCount / 4));

  if (canSpawnKind(ctx.entities, "hazard")) {
    spawnAtLane(
      ctx.entities,
      ctx.playfield,
      clampLane(centerLane - sideOffset, ctx.playfield.laneCount),
      yLogo + 70,
      "hazard",
      pickHazard(ctx.difficulty, ctx.asteroidField),
      ctx.scrollSpeed,
      "signal-corridor",
    );
  }
  if (canSpawnKind(ctx.entities, "hazard")) {
    spawnAtLane(
      ctx.entities,
      ctx.playfield,
      clampLane(centerLane + sideOffset, ctx.playfield.laneCount),
      yLogo + 90,
      "hazard",
      pickHazard(ctx.difficulty, ctx.asteroidField),
      ctx.scrollSpeed,
      "signal-corridor",
    );
  }

  spawnAtLane(
    ctx.entities,
    ctx.playfield,
    centerLane,
    yLogo,
    "logo-component",
    component,
    ctx.scrollSpeed,
    "signal-corridor",
  );
}

function executeArcadeWave(wave: ArcadeWaveType, ctx: SpawnContext, fuelWeight: number): void {
  const phase = getTimedPhase(ctx.playElapsed);
  const lane = pickWeightedLane(ctx.scheduler.lanePicker, ctx.playfield.laneCount);

  if (ctx.debrisCorridor) {
    const gapLane = pickWeightedLane(ctx.scheduler.lanePicker, ctx.playfield.laneCount);
    const y0 = lookAheadY();
    for (const offset of [-2, 2]) {
      if (!canSpawnKind(ctx.entities, "hazard")) break;
      spawnAtLane(
        ctx.entities,
        ctx.playfield,
        clampLane(gapLane + offset, ctx.playfield.laneCount),
        y0,
        "hazard",
        "debris",
        ctx.scrollSpeed,
        "hazard-corridor",
      );
    }
    if (canSpawnKind(ctx.entities, "collectible")) {
      spawnAtLane(
        ctx.entities,
        ctx.playfield,
        gapLane,
        y0 - 40,
        "collectible",
        "research",
        ctx.scrollSpeed,
        "safe-corridor",
      );
    }
    return;
  }

  switch (wave) {
    case "breathing":
      if (canSpawnKind(ctx.entities, "collectible")) {
        spawnAtLane(
          ctx.entities,
          ctx.playfield,
          lane,
          lookAheadY(),
          "collectible",
          pickCollectible(ctx.difficulty, fuelWeight),
          ctx.scrollSpeed,
          "single",
        );
      }
      if (canSpawnKind(ctx.entities, "collectible")) {
        spawnAtLane(
          ctx.entities,
          ctx.playfield,
          pickWeightedLane(ctx.scheduler.lanePicker, ctx.playfield.laneCount),
          lookAheadY() - 40,
          "collectible",
          "research",
          ctx.scrollSpeed,
          "single",
        );
      }
      if (canSpawnKind(ctx.entities, "hazard") && Math.random() < 0.35) {
        spawnAtLane(
          ctx.entities,
          ctx.playfield,
          pickWeightedLane(ctx.scheduler.lanePicker, ctx.playfield.laneCount),
          lookAheadY() - 80,
          "hazard",
          pickHazardFromPool(ctx.hazardPool, ctx.difficulty, ctx.asteroidField),
          ctx.scrollSpeed,
          "single",
        );
      }
      break;
    case "slalom": {
      const lanes = pickDistinctLanes(ctx.scheduler.lanePicker, ctx.playfield.laneCount, 3);
      const y0 = lookAheadY();
      for (let i = 0; i < 3; i += 1) {
        const isHazard = i % 2 === 0;
        if (isHazard && canSpawnKind(ctx.entities, "hazard")) {
          spawnAtLane(
            ctx.entities,
            ctx.playfield,
            lanes[i] ?? lane,
            y0 - i * 44,
            "hazard",
            pickHazard(ctx.difficulty, ctx.asteroidField),
            ctx.scrollSpeed,
            "staggered-lanes",
          );
        } else if (!isHazard && canSpawnKind(ctx.entities, "collectible")) {
          spawnAtLane(
            ctx.entities,
            ctx.playfield,
            lanes[i] ?? lane,
            y0 - i * 44,
            "collectible",
            "research",
            ctx.scrollSpeed,
            "research-trail",
          );
        }
      }
      break;
    }
    case "research-trail":
      spawnResearchTrail(ctx, lane, 3, "research-trail");
      break;
    case "fuel-gate":
      spawnFuelDecision(ctx, fuelWeight);
      break;
    case "split-decision":
      if (Math.random() < 0.5) spawnSplitReward(ctx, fuelWeight);
      else spawnFuelDecision(ctx, fuelWeight);
      break;
    case "signal-corridor":
      spawnSafeCorridor(ctx);
      break;
    case "debris-sweep": {
      const y0 = lookAheadY();
      const sweepLane = pickWeightedLane(ctx.scheduler.lanePicker, ctx.playfield.laneCount);
      if (canSpawnKind(ctx.entities, "hazard")) {
        const slot = getInactiveSlot(ctx.entities);
        if (slot) {
          activateEntity(slot, "hazard", "debris", laneToX(sweepLane, ctx.playfield.laneCount, ctx.playfield.minSpawnX, ctx.playfield.maxSpawnX), y0, ctx.scrollSpeed * 0.08);
          slot.vx = (Math.random() < 0.5 ? -1 : 1) * (120 + ctx.difficulty * 8);
          recordDiagnostic(slot.x, sweepLane, "debris", "staggered-lanes", ctx.playfield);
        }
      }
      if (canSpawnKind(ctx.entities, "collectible")) {
        spawnAtLane(
          ctx.entities,
          ctx.playfield,
          clampLane(sweepLane + 1, ctx.playfield.laneCount),
          y0 - 30,
          "collectible",
          "research",
          ctx.scrollSpeed,
          "single",
        );
      }
      break;
    }
    case "logo-approach":
      if (ctx.nextLogoComponent) spawnLogoApproach(ctx, ctx.nextLogoComponent);
      break;
    default:
      if (phase === "warmup" && canSpawnKind(ctx.entities, "collectible")) {
        spawnAtLane(
          ctx.entities,
          ctx.playfield,
          lane,
          lookAheadY(),
          "collectible",
          pickCollectible(ctx.difficulty, fuelWeight),
          ctx.scrollSpeed,
          "single",
        );
      }
  }

  if (ctx.signalBoostActive && canSpawnKind(ctx.entities, "collectible") && Math.random() < 0.55) {
    spawnAtLane(
      ctx.entities,
      ctx.playfield,
      pickWeightedLane(ctx.scheduler.lanePicker, ctx.playfield.laneCount),
      lookAheadY() - 50,
      "collectible",
      Math.random() < 0.5 ? "research" : pickCollectible(ctx.difficulty, 1),
      ctx.scrollSpeed,
      "cluster",
    );
  }
}

export function spawnPattern(ctx: SpawnContext): void {
  const counts = ctx.entities.filter((e) => e.active).length;
  if (counts >= missionConfig.spawning.maxEntities - 2) return;

  const fuelWeight = computeFuelWeight(ctx.fuel, ctx.scheduler.lastFuelSpawnAt, ctx.playElapsed);

  if (
    ctx.nextLogoComponent &&
    !ctx.assemblyComplete &&
    ctx.sectorElapsed >=
      missionConfig.missionAssembly.componentSpawnWindows[ctx.logoComponentIndex]! -
        missionConfig.missionAssembly.telegraphLeadSeconds &&
    ctx.scheduler.logoTelegraphedIndex < ctx.logoComponentIndex
  ) {
    ctx.scheduler.logoTelegraphedIndex = ctx.logoComponentIndex;
  }

  if (
    ctx.nextLogoComponent &&
    !ctx.assemblyComplete &&
    ctx.sectorElapsed >=
      missionConfig.missionAssembly.componentSpawnWindows[ctx.logoComponentIndex]! &&
    ctx.scheduler.logoSpawnedIndex < ctx.logoComponentIndex &&
    canSpawnKind(ctx.entities, "logo")
  ) {
    spawnLogoApproach(ctx, ctx.nextLogoComponent);
    ctx.scheduler.logoSpawnedIndex = ctx.logoComponentIndex;
    return;
  }

  const wave = ctx.inBreathingWindow
    ? "breathing"
    : ctx.scheduler.waves[ctx.scheduler.waveIndex % ctx.scheduler.waves.length];
  ctx.scheduler.waveIndex += 1;
  executeArcadeWave(wave ?? "breathing", ctx, fuelWeight);

  if (ctx.inBreathingWindow && canSpawnKind(ctx.entities, "collectible")) {
    spawnAtLane(
      ctx.entities,
      ctx.playfield,
      pickWeightedLane(ctx.scheduler.lanePicker, ctx.playfield.laneCount),
      lookAheadY() - 60,
      "collectible",
      "research",
      ctx.scrollSpeed,
      "single",
    );
  }
}

/** Generate spawn positions for distribution testing (deterministic with seeded rng) */
export function generateTestSpawnPositions(
  count: number,
  playfield: PlayfieldBounds,
  rng: () => number = Math.random,
): { x: number; lane: number; normalisedX: number }[] {
  const picker = createLanePickerState();
  const results: { x: number; lane: number; normalisedX: number }[] = [];
  for (let i = 0; i < count; i += 1) {
    const lane = pickWeightedLane(picker, playfield.laneCount, rng);
    const x = laneToX(lane, playfield.laneCount, playfield.minSpawnX, playfield.maxSpawnX);
    results.push({
      x,
      lane,
      normalisedX: spawnXToNormalised(x, playfield.minSpawnX, playfield.maxSpawnX),
    });
  }
  return results;
}

export function deactivateOffscreenEntities(entities: WorldEntity[], height: number): number {
  const offscreenTop = -(missionConfig.spawning.spawnLookAheadMax + 100);
  let cleared = 0;
  for (const entity of entities) {
    if (!entity.active) continue;
    if (entity.y > height + 100 || entity.y < offscreenTop) {
      entity.active = false;
      if (entity.kind === "hazard") cleared += 1;
    }
  }
  return cleared;
}

/** Clear all active entities when entering a new sector */
export function clearAllActiveEntities(entities: WorldEntity[]): void {
  for (const entity of entities) {
    entity.active = false;
  }
}

export function clearHazardsNear(
  entities: WorldEntity[],
  x: number,
  y: number,
  radius: number,
): void {
  for (const entity of entities) {
    if (!entity.active || entity.kind !== "hazard") continue;
    const dx = entity.x - x;
    const dy = entity.y - y;
    if (dx * dx + dy * dy < radius * radius) entity.active = false;
  }
}

export function initEntityPool(size: number): WorldEntity[] {
  resetEntityIds();
  return Array.from({ length: size }, (_, id) => ({
    id,
    kind: "collectible" as const,
    type: "research" as CollectibleType,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    radius: 14,
    rotation: 0,
    rotationSpeed: 0,
    active: false,
    spawnedAt: 0,
  }));
}

export type { LanePickerState };
