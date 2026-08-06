import { describe, expect, it } from "vitest";
import { getTimedPhase, missionConfig } from "@/features/mission-ascent/config/gameConfig";
import { collectibleDefinitions, hazardDefinitions, missionAssetManifest } from "@/features/mission-ascent/config/entityDefinitions";
import { missionVisuals } from "@/features/mission-ascent/config/visualConfig";
import {
  ENTITY_DRAWER_TYPES,
  getEntityDrawerKind,
} from "@/features/mission-ascent/rendering/dispatchEntity";
import { seededUnit } from "@/features/mission-ascent/rendering/shared/seededVisualRandom";
import {
  getNextLogoComponent,
  isAssemblyComplete,
  LOGO_COMPONENT_ORDER,
} from "@/features/mission-ascent/config/missionAssembly";
import {
  canSpawnKind,
  countActiveEntities,
  getLogoSpawnWindow,
  shouldSpawnLogo,
} from "@/features/mission-ascent/engine/ArcadeWaveSystem";
import {
  computeScoreDelta,
  selectFlightAssessment,
} from "@/features/mission-ascent/engine/DebriefAssessment";
import {
  createEventScheduler,
  tickEventScheduler,
} from "@/features/mission-ascent/engine/EventSystem";
import { HapticsManager } from "@/features/mission-ascent/engine/HapticsManager";
import {
  applySteeringInput,
  applyThrottleInput,
  computeEffectiveThrottle,
  defaultInputState,
} from "@/features/mission-ascent/engine/InputManager";
import {
  createPlayfield,
  getLaneCountForWidth,
} from "@/features/mission-ascent/engine/Playfield";
import { generateTestSpawnPositions } from "@/features/mission-ascent/engine/SpawnManager";
import {
  calculateChainBonus,
  calculateChainMultiplier,
  calculateFuelEfficiencyPercent,
  calculateScoreBreakdown,
  getRankForScore,
} from "@/features/mission-ascent/engine/ScoreSystem";
import {
  applyEdgeDamping,
  circleCollision,
  formatFuelDisplay,
  getThrottleZone,
  getWidthSpeedScale,
  normaliseTouchSteer,
  smoothDamp,
  throttleToFuelRate,
  throttleToHeatGain,
  throttleToScrollMultiplier,
} from "@/features/mission-ascent/utils/math";
import type { WorldEntity } from "@/features/mission-ascent/types/mission.types";
import {
  CORE_SECTOR_COUNT,
  getCycleForSector,
  getExtendedCycleScoreMultiplier,
  getSectorForNumber,
  coreSectors,
} from "@/features/mission-ascent/progression/sectorDefinitions";
import { clearAllActiveEntities, deactivateOffscreenEntities } from "@/features/mission-ascent/engine/SpawnManager";
import { SectorManager } from "@/features/mission-ascent/progression/SectorManager";
import {
  applyDebriefToStorage,
  defaultMissionStorage,
  parseMissionStorage,
} from "@/features/mission-ascent/utils/storage";

describe("throttle mapping", () => {
  it("maps low throttle to lower scroll multiplier", () => {
    expect(throttleToScrollMultiplier(0.1)).toBeLessThan(throttleToScrollMultiplier(0.9));
  });

  it("increases fuel rate with throttle", () => {
    expect(throttleToFuelRate(0.95)).toBeGreaterThan(throttleToFuelRate(0.2));
  });

  it("increases heat gain at high throttle", () => {
    expect(throttleToHeatGain(0.95)).toBeGreaterThan(throttleToHeatGain(0.2));
  });

  it("assigns throttle zones", () => {
    expect(getThrottleZone(0.1)).toBe("idle");
    expect(getThrottleZone(0.4)).toBe("cruise");
    expect(getThrottleZone(0.7)).toBe("high");
    expect(getThrottleZone(0.9)).toBe("boost");
  });

  it("limits throttle when overheated", () => {
    const overheated = applyThrottleInput(
      0.95,
      { ...defaultInputState, throttleUp: true },
      0.5,
      true,
      true,
    );
    expect(overheated).toBeLessThanOrEqual(missionConfig.throttle.overheatMaxThrottle);
  });

  it("blocks throttle increase without fuel", () => {
    const next = applyThrottleInput(0.4, { ...defaultInputState, throttleUp: true }, 0.5, false, false);
    expect(next).toBeLessThanOrEqual(0.4);
  });

  it("zeroes effective throttle without fuel", () => {
    expect(computeEffectiveThrottle(0.8, 0, true)).toBe(0);
    expect(computeEffectiveThrottle(0.8, 10, true)).toBe(0.8);
  });
});

describe("fuel display", () => {
  it("shows EMPTY at zero", () => {
    expect(formatFuelDisplay(0).text).toBe("EMPTY");
    expect(formatFuelDisplay(0).isEmpty).toBe(true);
  });

  it("shows less than one percent before zero", () => {
    expect(formatFuelDisplay(0.5).text).toBe("<1%");
  });

  it("ceilings fuel above one", () => {
    expect(formatFuelDisplay(42.2).text).toBe("43%");
  });
});

describe("steering input", () => {
  it("accelerates immediately on keyboard input", () => {
    const result = applySteeringInput(
      0,
      { ...defaultInputState, right: true },
      450,
      0,
      900,
      0.016,
      0,
      1,
      0,
      0.5,
    );
    expect(result.vx).toBeGreaterThan(0);
  });

  it("scales max speed with playfield width", () => {
    const narrow = applySteeringInput(0, { ...defaultInputState, right: true }, 200, 0, 400, 0.5, 0, 0.85, 0, 0.5);
    const wide = applySteeringInput(0, { ...defaultInputState, right: true }, 200, 0, 400, 0.5, 0, 1.5, 0, 0.5);
    expect(Math.abs(wide.vx)).toBeGreaterThan(Math.abs(narrow.vx));
  });

  it("applies pointer drag as lateral velocity", () => {
    const dragged = applySteeringInput(
      0,
      { ...defaultInputState, pointerActive: true },
      450,
      0,
      900,
      0.016,
      0,
      1,
      0,
      0.5,
      24,
    );
    expect(dragged.vx).toBeGreaterThan(0);
  });

  it("does not move on pointer press without drag", () => {
    const idle = applySteeringInput(
      0,
      { ...defaultInputState, pointerActive: true },
      450,
      0,
      900,
      0.016,
      0,
      1,
      0,
      0.5,
      0,
    );
    expect(idle.vx).toBe(0);
  });

  it("damps velocity near edges", () => {
    const damped = applyEdgeDamping(10, 200, 0, 800, missionConfig.controls.edgeDamping);
    expect(Math.abs(damped)).toBeLessThan(200);
  });

  it("smooth damp reaches touch target", () => {
    const vel = { value: 0 };
    let x = 0;
    for (let i = 0; i < 40; i += 1) {
      x = smoothDamp(x, 400, vel, 0.07, 900, 0.016);
    }
    expect(x).toBeGreaterThan(350);
  });

  it("width speed scale clamps for desktop", () => {
    expect(getWidthSpeedScale(900)).toBeCloseTo(1, 1);
    expect(getWidthSpeedScale(1600)).toBeLessThanOrEqual(missionConfig.controls.maximumWidthSpeedScale);
  });
});

describe("spawn distribution", () => {
  it("does not treat research as a hazard type", () => {
    expect(hazardDefinitions).not.toHaveProperty("research");
  });

  it("keeps spawns inside safe bounds", () => {
    const playfield = createPlayfield(1400, 800, 22);
    const positions = generateTestSpawnPositions(1000, playfield, () => 0.42);
    for (const p of positions) {
      expect(p.x).toBeGreaterThanOrEqual(playfield.minSpawnX);
      expect(p.x).toBeLessThanOrEqual(playfield.maxSpawnX);
    }
  });

  it("uses centre and side lanes across many samples", () => {
    const playfield = createPlayfield(1180, 800, 22);
    const positions = generateTestSpawnPositions(1200, playfield);
    const laneCounts = new Map<number, number>();
    for (const p of positions) {
      laneCounts.set(p.lane, (laneCounts.get(p.lane) ?? 0) + 1);
    }
    const lanes = [...laneCounts.keys()];
    const mid = Math.floor(playfield.laneCount / 2);
    expect(lanes.some((l) => l === mid || l === mid - 1 || l === mid + 1)).toBe(true);
    expect(lanes.some((l) => l <= 1)).toBe(true);
    expect(lanes.some((l) => l >= playfield.laneCount - 2)).toBe(true);
    const maxShare = Math.max(...laneCounts.values()) / positions.length;
    expect(maxShare).toBeLessThan(0.35);
  });

  it("scales lane count for viewport width", () => {
    expect(getLaneCountForWidth(400)).toBeGreaterThanOrEqual(4);
    expect(getLaneCountForWidth(1400)).toBeGreaterThanOrEqual(8);
  });
});

describe("timed pacing phases", () => {
  it("progresses through dramatic arc", () => {
    expect(getTimedPhase(5)).toBe("warmup");
    expect(getTimedPhase(30)).toBe("cruise");
    expect(getTimedPhase(60)).toBe("pressure");
    expect(getTimedPhase(100)).toBe("intense");
    expect(getTimedPhase(115)).toBe("finale");
  });
});

describe("mission events", () => {
  it("telegraphs before activating", () => {
    const state = createEventScheduler();
    const start = 30_000;
    const first = tickEventScheduler(state, start, 25, null);
    expect(first.telegraphLabel).toBeTruthy();
    expect(first.activeEvent).toBeNull();

    const active = tickEventScheduler(state, start + missionConfig.events.telegraphMs + 1, 25, null);
    expect(active.activeEvent).toBeTruthy();
    expect(active.activeEvent?.label).toBe(first.telegraphLabel);
  });
});

describe("debrief assessment", () => {
  it("selects high-altitude low-research profile", () => {
    const assessment = selectFlightAssessment({
      mode: "timed",
      altitudeKm: 120,
      researchCollected: 3,
      fuelEfficiencyPercent: 20,
      integrityRemaining: 2,
      maxIntegrity: 3,
      hazardsAvoided: 5,
      bestChain: 2,
      endCause: "fuel-depleted",
    });
    expect(assessment.summary).toContain("Fast ascent");
    expect(assessment.endCauseLabel).toContain("Fuel");
  });

  it("computes score delta against previous best", () => {
    expect(computeScoreDelta(5000, 0)).toBeNull();
    expect(computeScoreDelta(5200, 5000)).toBe(200);
  });
});

describe("score calculation", () => {
  it("calculates composite score", () => {
    const breakdown = calculateScoreBreakdown({
      altitudeKm: 100,
      researchCollected: 10,
      bestChain: 5,
      chainBonusAccumulated: 32,
      logoComponentsCollected: 3,
      logoCompletionBonus: 0,
      signalBoostBonus: 500,
      averageThrottle: 0.5,
      fuelRemaining: 40,
      initialFuel: 100,
      hazardsAvoided: 20,
      integrityRemaining: 2,
      maxIntegrity: 3,
      mode: "timed",
      timedCompleted: true,
    });
    expect(breakdown.finalScore).toBeGreaterThan(0);
    expect(breakdown.logoComponentScore).toBe(3 * missionConfig.score.logoComponentBase);
    expect(breakdown.missionCompletionBonus).toBe(missionConfig.score.timedCompletionBonus);
  });

  it("assigns rank tiers", () => {
    expect(getRankForScore(500)).toBe("RESEARCH CADET");
    expect(getRankForScore(50000)).toBe("MISSION COMMANDER");
  });

  it("calculates chain bonus and multiplier", () => {
    expect(calculateChainBonus(1)).toBe(0);
    expect(calculateChainBonus(5)).toBeGreaterThan(0);
    expect(calculateChainMultiplier(10)).toBe(1.5);
  });

  it("calculates fuel efficiency", () => {
    expect(calculateFuelEfficiencyPercent(50, 100)).toBe(50);
  });
});

describe("mission assembly", () => {
  it("guides component collection in order", () => {
    expect(getNextLogoComponent([])).toBe("d");
    expect(getNextLogoComponent(["d"])).toBe("y");
    expect(getNextLogoComponent(["d", "y", "o", "r"])).toBeNull();
    expect(getNextLogoComponent([...LOGO_COMPONENT_ORDER])).toBeNull();
  });

  it("detects assembly completion", () => {
    expect(isAssemblyComplete(["d", "y", "o"])).toBe(false);
    expect(isAssemblyComplete(["d", "y", "o", "r"])).toBe(true);
  });

  it("schedules logo spawn windows", () => {
    expect(getLogoSpawnWindow(0)).toBe(missionConfig.missionAssembly.componentSpawnWindows[0]);
    expect(getLogoSpawnWindow(3)).toBe(missionConfig.missionAssembly.componentSpawnWindows[3]);
  });

  it("enforces visible entity limits", () => {
    const entities: WorldEntity[] = Array.from({ length: 8 }, (_, id) => ({
      id,
      kind: "hazard",
      type: "asteroid",
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      radius: 18,
      rotation: 0,
      rotationSpeed: 0,
      active: true,
    }));
    expect(countActiveEntities(entities).hazards).toBe(8);
    expect(canSpawnKind(entities, "hazard")).toBe(false);
  });

  it("spawns logo only when window reached", () => {
    const entities: WorldEntity[] = [];
    expect(
      shouldSpawnLogo(getLogoSpawnWindow(0) - 1, 0, -1, false, entities),
    ).toBe(false);
    expect(
      shouldSpawnLogo(getLogoSpawnWindow(0) + 1, 0, -1, false, entities),
    ).toBe(true);
  });
});

describe("entity visuals", () => {
  it("exposes visual configuration scales", () => {
    expect(missionVisuals.scales.dataShard).toBeGreaterThan(1);
    expect(missionVisuals.scales.logoComponent).toBeGreaterThan(2);
    expect(missionVisuals.reducedEffectsParticleCounts.pickupBurst).toBeLessThan(
      missionVisuals.particleCounts.pickupBurst,
    );
  });

  it("maps every collectible and hazard to a drawer", () => {
    for (const type of ENTITY_DRAWER_TYPES.collectibles) {
      expect(getEntityDrawerKind("collectible", type)).toBe(true);
    }
    for (const type of ENTITY_DRAWER_TYPES.hazards) {
      expect(getEntityDrawerKind("hazard", type)).toBe(true);
    }
    for (const type of ENTITY_DRAWER_TYPES.logoComponents) {
      expect(getEntityDrawerKind("logo-component", type)).toBe(true);
    }
  });

  it("varies asteroid silhouettes deterministically from seed", () => {
    expect(seededUnit(1, 0)).not.toBe(seededUnit(2, 0));
    expect(seededUnit(5, 0)).toBe(seededUnit(5, 0));
  });

  it("labels research pickup as Data Shard", () => {
    expect(collectibleDefinitions.research.label).toBe("Data Shard");
  });

  it("manifest documents entity drawer rendering", () => {
    expect(missionAssetManifest.rendering.sharedPreview).toBe(true);
    expect(missionAssetManifest.collectibles.research.drawer).toBe("research");
  });
});

describe("storage migration", () => {
  it("migrates v1 storage to v2 records", () => {
    const raw = JSON.stringify({
      version: 1,
      records: { timedBest: 1200, endlessBest: 800 },
      preferences: { onboardingComplete: true },
    });
    const parsed = parseMissionStorage(raw);
    expect(parsed.records.timedBest).toBe(1200);
    expect(parsed.records.fastestLogoCompletionMs).toBe(0);
    expect(parsed.records.totalLogoComponentsCollected).toBe(0);
    expect(parsed.preferences.onboardingComplete).toBe(true);
  });

  it("updates logo records on debrief", () => {
    const { storage } = applyDebriefToStorage(defaultMissionStorage, "timed", {
      finalScore: 9000,
      altitudeKm: 50,
      bestChain: 4,
      logosCompleted: 1,
      logoComponentsCollected: 4,
      signalBoostPeakScore: 1200,
      logoCompletionTimeMs: 62000,
    });
    expect(storage.records.totalLogoComponentsCollected).toBe(4);
    expect(storage.records.mostLogosCompleted).toBe(1);
    expect(storage.records.fastestLogoCompletionMs).toBe(62000);
  });
});

describe("collision", () => {
  it("detects overlapping circles", () => {
    expect(circleCollision(0, 0, 10, 15, 0, 10)).toBe(true);
    expect(circleCollision(0, 0, 5, 100, 0, 5)).toBe(false);
  });
});

describe("haptics", () => {
  it("suppresses vibration when reduced effects enabled", () => {
    const haptics = new HapticsManager({ enabled: true, reducedEffects: true });
    haptics.unlock();
    expect(haptics.pulse("collision")).toBeUndefined();
  });
});

describe("storage", () => {
  it("parses valid storage", () => {
    const data = parseMissionStorage(
      JSON.stringify({
        version: 1,
        records: {
          timedBest: 1000,
          endlessBest: 2000,
          highestAltitudeKm: 50,
          bestResearchChain: 10,
          totalMissionsCompleted: 3,
        },
        preferences: {
          audioEnabled: true,
          reducedEffects: false,
          launchSequenceSeen: true,
          lastMode: "endless",
          performanceQuality: "high",
          onboardingComplete: true,
          discoveredEntities: ["research", "fuel"],
        },
      }),
    );
    expect(data.records.timedBest).toBe(1000);
    expect(data.preferences.discoveredEntities).toEqual(["research", "fuel"]);
  });

  it("migrates legacy storage without discovered entities", () => {
    const data = parseMissionStorage(
      JSON.stringify({
        version: 1,
        records: defaultMissionStorage.records,
        preferences: {
          audioEnabled: false,
          reducedEffects: false,
          launchSequenceSeen: false,
          lastMode: "timed",
          performanceQuality: "standard",
        },
      }),
    );
    expect(data.preferences.discoveredEntities).toEqual([]);
  });

  it("falls back on corrupted storage", () => {
    const data = parseMissionStorage("{not-json");
    expect(data.version).toBe(3);
    expect(data.records.timedBest).toBe(0);
  });

  it("updates personal best on debrief", () => {
    const { storage, isPersonalBest } = applyDebriefToStorage(defaultMissionStorage, "timed", {
      finalScore: 5000,
      altitudeKm: 100,
      bestChain: 8,
    });
    expect(isPersonalBest).toBe(true);
    expect(storage.records.timedBest).toBe(5000);
  });

  it("migrates v2 storage to v3 sector records", () => {
    const raw = JSON.stringify({
      version: 2,
      records: { timedBest: 5000, endlessBest: 9000 },
      preferences: { lastMode: "endless" },
    });
    const parsed = parseMissionStorage(raw);
    expect(parsed.version).toBe(3);
    expect(parsed.records.highestSectorReached).toBe(0);
    expect(parsed.records.totalSectorsCompleted).toBe(0);
    expect(parsed.records.totalSignalsRestored).toBe(0);
  });

  it("persists sector stats on debrief", () => {
    const { storage } = applyDebriefToStorage(defaultMissionStorage, "endless", {
      finalScore: 12000,
      altitudeKm: 80,
      bestChain: 6,
      sectorsCompleted: 4,
      highestSectorReached: 5,
      highestCycleReached: 0,
      fastestSectorCompletionMs: 48000,
    });
    expect(storage.records.totalSectorsCompleted).toBe(4);
    expect(storage.records.totalSignalsRestored).toBe(4);
    expect(storage.records.highestSectorReached).toBe(5);
    expect(storage.records.fastestSectorCompletionMs).toBe(48000);
  });
});

describe("sector progression", () => {
  it("starts at sector 1", () => {
    const manager = new SectorManager("endless");
    expect(manager.state.currentSectorNumber).toBe(1);
    expect(manager.getCurrentSector().name).toBe("Launch Corridor");
  });

  it("pauses timer during transition", () => {
    const manager = new SectorManager("endless");
    manager.beginSector(1000);
    manager.onLogoComplete(2000, 70, 3, 3);
    expect(manager.isTimerPaused()).toBe(true);
    manager.tickPlaying(5, true);
    expect(manager.state.sectorTimeRemaining).toBe(120);
  });

  it("advances sector after logo completion transition", () => {
    const manager = new SectorManager("endless");
    manager.beginSector(0);
    manager.onLogoComplete(100, 80, 2, 3);
    manager.tickTransition(100 + 600);
    manager.tickTransition(100 + 600 + 2200);
    manager.tickTransition(100 + 600 + 2200 + 1600);
    expect(manager.state.currentSectorNumber).toBe(2);
    expect(manager.state.transitionState).toBe("playing");
    expect(manager.state.sectorTimeRemaining).toBe(120);
  });

  it("fails when timer expires with incomplete logo", () => {
    const manager = new SectorManager("endless");
    manager.beginSector(0);
    manager.state.sectorTimeRemaining = 0;
    expect(manager.tickPlaying(0, false)).toBe("signal-window-lost");
    expect(manager.tickPlaying(0, true)).toBeNull();
  });

  it("cycles themes after sector 8", () => {
    expect(getCycleForSector(8)).toBe(0);
    expect(getCycleForSector(9)).toBe(1);
    expect(getSectorForNumber(9).id).toBe(getSectorForNumber(1).id);
    expect(getSectorForNumber(9).number).toBe(9);
  });

  it("gives each sector a distinct background identity", () => {
    const tops = coreSectors.map((s) => s.backgroundConfig.baseColors[0]);
    expect(new Set(tops).size).toBe(CORE_SECTOR_COUNT);
    expect(coreSectors[0]!.backgroundConfig.grid?.spacing).toBe(24);
    expect(coreSectors[6]!.backgroundConfig.grid?.style).toBe("hex");
    expect(coreSectors[7]!.backgroundConfig.grid?.style).toBe("radial");
  });

  it("clears off-screen entities above the viewport", () => {
    const entities = [
      { active: true, y: -200, kind: "hazard" },
      { active: true, y: -450, kind: "collectible" },
      { active: true, y: 450, kind: "collectible" },
    ] as import("@/features/mission-ascent/types/mission.types").WorldEntity[];
    deactivateOffscreenEntities(entities, 300);
    expect(entities[0]!.active).toBe(true);
    expect(entities[1]!.active).toBe(false);
    expect(entities[2]!.active).toBe(false);
  });

  it("clears all entities for a new sector", () => {
    const entities = [
      { active: true, y: 50, kind: "hazard" },
      { active: false, y: 10, kind: "collectible" },
    ] as import("@/features/mission-ascent/types/mission.types").WorldEntity[];
    clearAllActiveEntities(entities);
    expect(entities[0]!.active).toBe(false);
    expect(entities[1]!.active).toBe(false);
  });

  it("applies capped extended cycle difficulty", () => {
    expect(getExtendedCycleScoreMultiplier(8)).toBe(1);
    expect(getExtendedCycleScoreMultiplier(17)).toBeLessThanOrEqual(1 + 2 * 0.2);
  });

  it("applies sector recovery without exceeding caps", () => {
    const manager = new SectorManager("endless");
    const recovered = manager.applyRecovery({ fuel: 90, hull: 3, heat: 80, maxHull: 3 });
    expect(recovered.fuel).toBe(100);
    expect(recovered.hull).toBe(3);
    expect(recovered.heat).toBeCloseTo(24, 0);
  });
});

describe("mission assembly order", () => {
  it("requires D Y O R in order", () => {
    expect(LOGO_COMPONENT_ORDER).toEqual(["d", "y", "o", "r"]);
    expect(getNextLogoComponent([])).toBe("d");
    expect(getNextLogoComponent(["d", "y", "o", "r"])).toBeNull();
    expect(isAssemblyComplete(["d", "y", "o", "r"])).toBe(true);
  });
});
