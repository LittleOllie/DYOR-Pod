import { getTimedPhase, missionConfig } from "@/features/mission-ascent/config/gameConfig";
import { missionVisuals } from "@/features/mission-ascent/config/visualConfig";
import { SectorManager, getSectorDifficultyModifiers } from "@/features/mission-ascent/progression/SectorManager";
import type { ArcadeWaveType } from "@/features/mission-ascent/engine/ArcadeWaveSystem";
import { setActiveLetterStyle } from "@/features/mission-ascent/rendering/activeSectorVisuals";
import type {
  TransientEffect,
  TransientEffectKind,
} from "@/features/mission-ascent/rendering/types";
import {
  getNextLogoComponent,
  isAssemblyCycleComplete,
  LOGO_COMPONENT_COUNT,
  LOGO_COMPONENT_LABELS,
} from "@/features/mission-ascent/config/missionAssembly";
import { getZoneForAltitude } from "@/features/mission-ascent/config/zones";
import {
  collectibleDefinitions,
  hazardDefinitions,
  logoComponentDefinitions,
} from "@/features/mission-ascent/config/entityDefinitions";
import { selectFlightAssessment, computeScoreDelta } from "@/features/mission-ascent/engine/DebriefAssessment";
import { findCollidingEntities } from "@/features/mission-ascent/engine/CollisionSystem";
import {
  calculateDifficulty,
  getSpawnIntervalMs,
  getTimedPhase as getPhase,
} from "@/features/mission-ascent/engine/DifficultySystem";
import {
  createEventScheduler,
  tickEventScheduler,
} from "@/features/mission-ascent/engine/EventSystem";
import {
  applySteeringInput,
  applyThrottleInput,
  computeEffectiveThrottle,
  InputManager,
} from "@/features/mission-ascent/engine/InputManager";
import { createPlayfield, createLanePickerState, type PlayfieldBounds } from "@/features/mission-ascent/engine/Playfield";
import {
  clearAllActiveEntities,
  clearHazardsNear,
  createSpawnScheduler,
  deactivateOffscreenEntities,
  initEntityPool,
  spawnPattern,
  type SpawnSchedulerState,
} from "@/features/mission-ascent/engine/SpawnManager";
import {
  calculateChainBonus,
  calculateChainMultiplier,
  calculateFuelEfficiencyPercent,
  calculateScoreBreakdown,
  getRankForScore,
} from "@/features/mission-ascent/engine/ScoreSystem";
import type {
  ChainResetReason,
  EntityIdentType,
  EntityIdentification,
  GameMode,
  GamePhase,
  HudSnapshot,
  LogoComponentType,
  MissionDebrief,
  MissionEvent,
  PickupFeedbackType,
  ScoreBreakdown,
  WorldEntity,
} from "@/features/mission-ascent/types/mission.types";
import {
  clamp,
  formatFuelDisplay,
  getThrottleZone,
  throttleToFuelRate,
  throttleToHeatGain,
  throttleToScoreMultiplier,
  throttleToScrollMultiplier,
} from "@/features/mission-ascent/utils/math";

export type MissionEngineCallbacks = {
  onHudUpdate: (hud: HudSnapshot) => void;
  onPhaseChange: (phase: GamePhase) => void;
  onLiveAnnouncement: (message: string) => void;
  onDebrief: (debrief: MissionDebrief) => void;
  onScreenShake?: (intensity: number) => void;
  onPickup?: (type: PickupFeedbackType) => void;
  onChainMilestone?: (chain: number) => void;
  onZoneEnter?: (label: string, km: number) => void;
  onEventAlert?: () => void;
  onEntityDiscovered?: (type: EntityIdentType) => void;
  onLogoComponent?: (type: LogoComponentType) => void;
  onSignalBoost?: () => void;
  onAssemblyComplete?: () => void;
};

export type MissionEngineOptions = {
  mode: GameMode;
  skipLaunchSequence: boolean;
  reducedEffects: boolean;
  width: number;
  height: number;
  previousBest?: number;
  discoveredEntities?: string[];
};

type Particle = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  active: boolean;
};

function initTransientEffects(count: number): TransientEffect[] {
  return Array.from({ length: count }, (_, id) => ({
    id,
    kind: "pickup" as TransientEffectKind,
    x: 0,
    y: 0,
    radius: 0,
    color: "#31d1c6",
    startTime: 0,
    durationMs: 0,
    active: false,
  }));
}

function initParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, id) => ({
    id,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    life: 0,
    maxLife: 0,
    color: "#31d1c6",
    size: 2,
    active: false,
  }));
}

export class MissionEngine {
  readonly input = new InputManager();
  private callbacks: MissionEngineCallbacks;
  private mode: GameMode;
  private phase: GamePhase = "launch-sequence";
  private reducedEffects: boolean;
  private width: number;
  private height: number;
  private previousBest: number;
  private endCause: MissionDebrief["endCause"] = "timed-complete";

  playerX = 0;
  playerY = 0;
  playerVx = 0;
  playerRadius = Math.round(22 * missionConfig.entityScale.rocket);
  throttle = 0.42;
  requestedThrottle = 0.42;
  effectiveThrottle = 0.42;
  fuel = missionConfig.initialFuel;
  heat = 0;
  integrity = missionConfig.initialIntegrity;
  shield = false;
  invulnerableUntil = 0;
  bankAngle = 0;

  altitudeKm = 0;
  scrollSpeed = 0;
  difficulty = 1;
  elapsed = 0;
  playElapsed = 0;
  timerRemaining = missionConfig.timedMissionSeconds;
  pilotControlGranted = false;
  launchAutopilotRemaining = missionConfig.launch.autopilotMs;

  researchCount = 0;
  chain = 0;
  chainMultiplier = 1;
  chainBonusAccumulated = 0;
  chainTimer = 0;
  bestChain = 0;
  hazardsAvoided = 0;
  throttleSum = 0;
  throttleSamples = 0;
  runningScore = 0;
  highestZoneLabel = "Launch Corridor";

  /** Mission Assembly */
  assemblyCollected: LogoComponentType[] = [];
  assemblyMissed: LogoComponentType[] = [];
  logoComponentsCollected = 0;
  logoCompletionBonus = 0;
  signalBoostScoreBonus = 0;
  signalBoostActive = false;
  signalBoostUntil = 0;
  signalBoostMultiplier = 1;
  logosCompletedThisRun = 0;
  logoCompletionStartedAt: number | null = null;
  assemblyCompleteFlashUntil = 0;
  componentToast: string | null = null;
  componentToastUntil = 0;
  assemblyComplete = false;
  completionSlowMoUntil = 0;
  logoCompletionTimeMs: number | null = null;
  pilotControlStartedAt = 0;
  private wallScrapeCooldownUntil = 0;

  overheated = false;
  overheatUntil = 0;

  entities: WorldEntity[] = initEntityPool(missionConfig.spawning.maxEntities);
  particles: Particle[] = initParticles(missionConfig.spawning.maxParticles);
  transientEffects: TransientEffect[] = initTransientEffects(28);
  private transientEffectSeq = 0;

  private eventScheduler = createEventScheduler();
  private activeEvent: MissionEvent | null = null;
  eventTitle: string | null = null;
  eventHint: string | null = null;
  signalBurst = false;
  solarActivity = false;
  boostWindow = false;
  debrisCorridor = false;
  asteroidField = false;

  private currentZoneId = "";
  zoneToast: string | null = null;
  zoneToastUntil = 0;
  chainLostMessage: string | null = null;
  chainLostUntil = 0;
  pickupFlash: PickupFeedbackType | null = null;
  pickupFlashUntil = 0;

  playfield!: PlayfieldBounds;
  private spawnScheduler: SpawnSchedulerState = createSpawnScheduler();
  private sectorManager: SectorManager;
  private fuelFailureActive = false;
  private discoveredSet: Set<string>;
  entityIdentifications: EntityIdentification[] = [];
  private spawnedTypesThisRun = new Set<string>();

  launchSequenceSkip: boolean;
  launchStep = 0;
  launchStepTimer = 0;

  private rafId: number | null = null;
  private lastTime = 0;
  private hudTimer = 0;
  private failureTimer = 0;
  private spawnAccumulator = 0;

  constructor(callbacks: MissionEngineCallbacks, options: MissionEngineOptions) {
    this.callbacks = callbacks;
    this.mode = options.mode;
    this.reducedEffects = options.reducedEffects;
    this.width = options.width;
    this.height = options.height;
    this.previousBest = options.previousBest ?? 0;
    this.discoveredSet = new Set(options.discoveredEntities ?? []);
    this.sectorManager = new SectorManager(options.mode);
    this.playfield = createPlayfield(options.width, options.height, this.playerRadius);
    this.rebuildSectorWaves();
    this.launchSequenceSkip = options.skipLaunchSequence;
    this.resetPlayerPosition();
    if (options.skipLaunchSequence) {
      this.phase = "playing";
      this.grantPilotControl();
    }
  }

  getPhase(): GamePhase {
    return this.phase;
  }

  getMode(): GameMode {
    return this.mode;
  }

  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.playfield = createPlayfield(width, height, this.playerRadius);
    this.resetPlayerPosition();
  }

  setReducedEffects(value: boolean): void {
    this.reducedEffects = value;
  }

  private resetPlayerPosition(): void {
    this.playerX = this.playfield.activeWidth / 2;
    this.playerY = this.height * missionConfig.controls.playerYRatio;
  }

  start(): void {
    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame(this.tick);
    this.emitHud();
    this.callbacks.onPhaseChange(this.phase);
  }

  stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  pause(): void {
    if (this.phase === "playing") {
      this.phase = "paused";
      this.callbacks.onPhaseChange(this.phase);
      this.emitHud();
    }
  }

  resume(): void {
    if (this.phase === "paused") {
      this.phase = "playing";
      this.lastTime = performance.now();
      this.callbacks.onPhaseChange(this.phase);
      this.rafId = requestAnimationFrame(this.tick);
      this.emitHud();
    }
  }

  restart(mode?: GameMode, previousBest?: number): void {
    this.stop();
    if (mode) this.mode = mode;
    if (previousBest !== undefined) {
      this.previousBest = previousBest;
    }
    this.phase = this.launchSequenceSkip ? "playing" : "launch-sequence";
    this.resetState();
    this.start();
    this.callbacks.onPhaseChange(this.phase);
  }

  setPreviousBest(score: number): void {
    this.previousBest = score;
  }

  abandon(): void {
    this.endCause = "abandoned";
    this.finishMission(false);
  }

  private resetState(): void {
    this.playerVx = 0;
    this.throttle = 0.42;
    this.requestedThrottle = 0.42;
    this.effectiveThrottle = 0.42;
    this.fuel = missionConfig.initialFuel;
    this.heat = 0;
    this.integrity = missionConfig.initialIntegrity;
    this.shield = false;
    this.invulnerableUntil = 0;
    this.bankAngle = 0;
    this.altitudeKm = 0;
    this.scrollSpeed = 0;
    this.difficulty = 1;
    this.elapsed = 0;
    this.playElapsed = 0;
    this.timerRemaining = missionConfig.timedMissionSeconds;
    this.pilotControlGranted = false;
    this.launchAutopilotRemaining = missionConfig.launch.autopilotMs;
    this.researchCount = 0;
    this.chain = 0;
    this.chainMultiplier = 1;
    this.chainBonusAccumulated = 0;
    this.chainTimer = 0;
    this.bestChain = 0;
    this.hazardsAvoided = 0;
    this.throttleSum = 0;
    this.throttleSamples = 0;
    this.runningScore = 0;
    this.highestZoneLabel = "Launch Corridor";
    this.assemblyCollected = [];
    this.assemblyMissed = [];
    this.logoComponentsCollected = 0;
    this.logoCompletionBonus = 0;
    this.signalBoostScoreBonus = 0;
    this.signalBoostActive = false;
    this.signalBoostUntil = 0;
    this.signalBoostMultiplier = 1;
    this.logosCompletedThisRun = 0;
    this.logoCompletionStartedAt = null;
    this.assemblyCompleteFlashUntil = 0;
    this.componentToast = null;
    this.componentToastUntil = 0;
    this.assemblyComplete = false;
    this.completionSlowMoUntil = 0;
    this.logoCompletionTimeMs = null;
    this.pilotControlStartedAt = 0;
    this.overheated = false;
    this.overheatUntil = 0;
    this.entities.forEach((e) => {
      e.active = false;
    });
    this.particles.forEach((p) => {
      p.active = false;
    });
    this.transientEffects.forEach((e) => {
      e.active = false;
    });
    this.sectorManager.reset();
    this.sectorManager.setMode(this.mode);
    this.rebuildSectorWaves();
    this.eventScheduler = createEventScheduler();
    this.activeEvent = null;
    this.eventTitle = null;
    this.eventHint = null;
    this.spawnAccumulator = 0;
    this.spawnScheduler = createSpawnScheduler();
    this.fuelFailureActive = false;
    this.entityIdentifications = [];
    this.spawnedTypesThisRun = new Set();
    this.launchStep = 0;
    this.launchStepTimer = 0;
    this.failureTimer = 0;
    this.endCause = "timed-complete";
    this.currentZoneId = getZoneForAltitude(0).id;
    this.zoneToast = null;
    this.zoneToastUntil = 0;
    this.resetPlayerPosition();
    if (this.launchSequenceSkip) this.grantPilotControl();
  }

  skipLaunchSequence(): void {
    this.launchSequenceSkip = true;
    this.grantPilotControl();
    this.phase = "playing";
    this.callbacks.onPhaseChange(this.phase);
  }

  private grantPilotControl(): void {
    this.pilotControlGranted = true;
    this.launchAutopilotRemaining = 0;
    this.pilotControlStartedAt = this.playElapsed;
    this.sectorManager.beginSector(performance.now());
    this.callbacks.onLiveAnnouncement("Pilot control granted");
  }

  private rebuildSectorWaves(): void {
    const sector = this.sectorManager.getCurrentSector();
    this.spawnScheduler.waves = [...sector.wavePool] as ArcadeWaveType[];
    this.spawnScheduler.waveIndex = 0;
  }

  private resetAssemblyForSector(now: number): void {
    this.assemblyCollected = [];
    this.assemblyMissed = [];
    this.assemblyComplete = false;
    this.assemblyCompleteFlashUntil = 0;
    this.completionSlowMoUntil = 0;
    this.spawnScheduler.logoTelegraphedIndex = -1;
    this.spawnScheduler.logoSpawnedIndex = -1;
    const sector = this.sectorManager.getCurrentSector();
    this.componentToast = `${sector.name} — recover all signal components`;
    this.componentToastUntil = now + missionConfig.feedback.zoneToastMs;
  }

  private beginNewSectorPlay(now: number): void {
    clearAllActiveEntities(this.entities);
    this.resetAssemblyForSector(now);
    this.rebuildSectorWaves();
    this.spawnScheduler.lanePicker = createLanePickerState();
    const phase = getPhase(this.sectorManager.state.sectorElapsed);
    this.spawnAccumulator = getSpawnIntervalMs(this.difficulty, phase) * 0.92;
  }

  private getNextComponent(): LogoComponentType | null {
    return getNextLogoComponent(this.assemblyCollected, this.assemblyMissed);
  }

  private getLogoComponentIndex(): number {
    return this.assemblyCollected.length + this.assemblyMissed.length;
  }

  private resetAssemblyForNextCycle(now: number): void {
    this.assemblyCollected = [];
    this.assemblyMissed = [];
    this.assemblyComplete = false;
    this.logoCompletionBonus = 0;
    this.spawnScheduler.logoTelegraphedIndex = -1;
    this.spawnScheduler.logoSpawnedIndex = -1;
    this.componentToast = `Signal cycle ${this.logosCompletedThisRun + 1} — recover all components`;
    this.componentToastUntil = now + 2800;
  }

  private tick = (time: number): void => {
    const rawDelta = (time - this.lastTime) / 1000;
    const delta = clamp(rawDelta, 0, 0.05);
    this.lastTime = time;

    if (this.phase === "paused" || this.phase === "debrief") return;

    if (this.phase === "launch-sequence") this.updateLaunchSequence(delta);
    else if (this.phase === "playing") this.updatePlaying(delta, time);
    else if (this.phase === "engine-failure") {
      this.updateEngineFailure(delta, time);
    }

    this.hudTimer += delta * 1000;
    if (this.hudTimer >= missionConfig.feedback.hudUpdateIntervalMs) {
      this.hudTimer = 0;
      this.emitHud();
    }

    this.rafId = requestAnimationFrame(this.tick);
  };

  private updateLaunchSequence(delta: number): void {
    this.launchStepTimer += delta;
    this.throttle = clamp(this.throttle + delta * 0.12, 0, 0.5);
    this.scrollSpeed = missionConfig.throttle.baseScrollSpeed * 0.35;
    this.altitudeKm += (this.scrollSpeed * delta) / 1000;
    this.spawnExhaust(delta);
    if (this.launchStepTimer > 0.85) {
      this.launchStep += 1;
      this.launchStepTimer = 0;
    }
    if (this.launchStep >= 8) {
      this.grantPilotControl();
      this.phase = "playing";
      this.callbacks.onPhaseChange(this.phase);
    }
  }

  private updatePlaying(delta: number, now: number): void {
    this.elapsed += delta;

    const sectorSnapshot = this.sectorManager.toSnapshot();
    setActiveLetterStyle(sectorSnapshot.letterStyle);

    if (this.sectorManager.state.transitionState !== "playing") {
      const transition = this.sectorManager.tickTransition(now);
      if (transition.recovery) {
        const recovered = this.sectorManager.applyRecovery({
          fuel: this.fuel,
          hull: this.integrity,
          heat: this.heat,
          maxHull: missionConfig.initialIntegrity,
        });
        this.fuel = recovered.fuel;
        this.integrity = recovered.hull;
        this.heat = recovered.heat;
      }
      if (transition.runComplete) {
        this.endCause = "mission-run-complete";
        this.callbacks.onLiveAnnouncement("All 5 sectors cleared — mission complete");
        this.finishMission(true);
        return;
      }
      if (transition.advanced && !transition.done) {
        clearAllActiveEntities(this.entities);
        this.rebuildSectorWaves();
      }
      if (transition.done && transition.advanced) {
        this.beginNewSectorPlay(now);
      }
    }

    const slowMoScale =
      now < this.completionSlowMoUntil
        ? missionConfig.missionAssembly.completionSlowMoScale
        : this.sectorManager.state.transitionState !== "playing"
          ? 0.35
          : 1;
    const gameDelta = delta * slowMoScale;

    if (this.pilotControlGranted && this.sectorManager.state.transitionState === "playing") {
      this.playElapsed += gameDelta;
      const timerFail = this.sectorManager.tickPlaying(delta, this.assemblyComplete);
      if (timerFail && !this.assemblyComplete) {
        this.autoMissRemainingComponents(now);
        this.completeAssembly(now);
      }
    } else if (this.pilotControlGranted) {
      this.playElapsed += gameDelta * 0.2;
    }

    if (!this.pilotControlGranted) {
      this.launchAutopilotRemaining -= delta * 1000;
      if (this.launchAutopilotRemaining <= 0) this.grantPilotControl();
    }

    const input = this.input.getState();
    const missionActive = !this.fuelFailureActive;
    const allowThrottleIncrease = missionActive && this.fuel > 0;

    if (this.pilotControlGranted) {
      this.requestedThrottle = applyThrottleInput(
        this.requestedThrottle,
        input,
        gameDelta,
        this.overheated,
        allowThrottleIncrease,
      );
    }
    this.effectiveThrottle = computeEffectiveThrottle(
      this.requestedThrottle,
      this.fuel,
      missionActive,
    );
    this.throttle = this.effectiveThrottle;

    this.throttleSum += this.effectiveThrottle;
    this.throttleSamples += 1;

    const phase = getPhase(this.playElapsed);
    const solarMult = this.solarActivity ? 1.45 : 1;

    if (this.overheated) {
      this.heat = clamp(this.heat - missionConfig.heat.coolingRate * 38 * gameDelta, 0, 100);
      if (now >= this.overheatUntil) this.overheated = false;
    } else if (this.effectiveThrottle > 0.08) {
      const coolBonus = this.effectiveThrottle < 0.4 ? missionConfig.heat.idleCoolingBonus : 1;
      this.heat = clamp(
        this.heat +
          throttleToHeatGain(this.effectiveThrottle) * gameDelta * 16 * solarMult -
          (this.effectiveThrottle < 0.35
            ? missionConfig.heat.coolingRate * 10 * coolBonus * gameDelta
            : 0),
        0,
        100,
      );
    } else {
      this.heat = clamp(this.heat - missionConfig.heat.coolingRate * 14 * gameDelta, 0, 100);
    }

    if (!this.overheated && this.heat >= missionConfig.heat.overheatThreshold) {
      this.overheated = true;
      this.overheatUntil = now + missionConfig.heat.overheatCooldownMs;
      this.callbacks.onLiveAnnouncement("Engine overheated — reduce throttle");
    }

    if (this.effectiveThrottle > 0) {
      const prevFuel = this.fuel;
      const fuelRate = throttleToFuelRate(this.effectiveThrottle);
      this.fuel = clamp(
        this.fuel - fuelRate * gameDelta * missionConfig.fuel.drainScale,
        0,
        100,
      );
      for (const threshold of missionConfig.fuel.warningThresholds) {
        if (prevFuel > threshold && this.fuel <= threshold) {
          this.callbacks.onLiveAnnouncement(`Fuel at ${threshold} percent`);
        }
      }
    }

    let scrollMult = throttleToScrollMultiplier(this.effectiveThrottle);
    const sectorMods = getSectorDifficultyModifiers(
      this.sectorManager.state.currentSectorNumber,
    );
    scrollMult *= sectorMods.baseSpeedMultiplier;
    if (this.boostWindow) {
      scrollMult *= 1.12;
    }
    if (phase === "finale") scrollMult *= 1.08;

    this.scrollSpeed = clamp(
      missionConfig.throttle.baseScrollSpeed * scrollMult + (this.difficulty - 1) * 8,
      this.effectiveThrottle > 0 ? missionConfig.throttle.baseScrollSpeed * 0.35 : 0,
      missionConfig.throttle.maxScrollSpeed,
    );

    const { minPlayerX, maxPlayerX, widthScale } = this.playfield;

    if (this.pilotControlGranted) {
      const instability =
        this.effectiveThrottle > 0.85
          ? missionConfig.controls.boostInstability
          : missionConfig.controls.lowThrottleInstability;
      const pointerDelta = this.input.consumePointerDelta();
      const steer = applySteeringInput(
        this.playerVx,
        input,
        this.playerX,
        minPlayerX,
        maxPlayerX,
        gameDelta,
        instability,
        widthScale,
        this.input.getLastSteerDir(),
        this.effectiveThrottle,
        pointerDelta,
      );
      this.playerVx = steer.vx;
      this.input.setLastSteerDir(steer.lastSteerDir);
      const prevX = this.playerX;
      this.playerX = clamp(this.playerX + this.playerVx * gameDelta, minPlayerX, maxPlayerX);
      this.checkWallScrape(prevX, minPlayerX, maxPlayerX, widthScale, now);
    }

    const maxVxRef = missionConfig.controls.horizontalMaxSpeed * widthScale;
    this.bankAngle =
      clamp(this.playerVx / maxVxRef, -1, 1) * missionConfig.controls.bankAngleMax;

    if (this.effectiveThrottle > 0) {
      this.altitudeKm += (this.scrollSpeed * gameDelta) / 1000;
    }

    const zone = getZoneForAltitude(this.altitudeKm);
    if (zone.id !== this.currentZoneId) {
      const previousZone = this.currentZoneId;
      this.currentZoneId = zone.id;
      this.highestZoneLabel = zone.label;
      // Skip toast for the starting zone — only announce genuine altitude progress
      if (previousZone && previousZone !== zone.id && zone.minKm > 0) {
        this.zoneToast = `Entering ${zone.label}`;
        this.zoneToastUntil = now + missionConfig.feedback.zoneToastMs;
        this.callbacks.onZoneEnter?.(zone.label, this.altitudeKm);
      }
    }
    if (this.zoneToast && now > this.zoneToastUntil) this.zoneToast = null;
    if (this.chainLostMessage && now > this.chainLostUntil) this.chainLostMessage = null;
    if (this.pickupFlash && now > this.pickupFlashUntil) this.pickupFlash = null;
    if (this.componentToast && now > this.componentToastUntil) this.componentToast = null;
    this.entityIdentifications = this.entityIdentifications.filter((i) => i.until > now);

    this.difficulty = calculateDifficulty({
      elapsedSeconds: this.playElapsed,
      altitudeKm: this.altitudeKm,
      mode: this.mode,
      throttle: this.effectiveThrottle,
    });

    const ev = tickEventScheduler(this.eventScheduler, now, this.playElapsed, this.activeEvent);
    this.activeEvent = ev.activeEvent;
    this.eventTitle = ev.activeEvent?.label ?? ev.telegraphLabel;
    this.eventHint = ev.telegraphHint ?? (ev.activeEvent ? EVENT_HINT(ev.activeEvent.type) : null);
    this.signalBurst = ev.signalBurst;
    this.solarActivity = ev.solarActivity;
    this.boostWindow = ev.boostWindow;
    this.debrisCorridor = ev.debrisCorridor;
    this.asteroidField = ev.asteroidField;
    if (ev.telegraphLabel && !ev.activeEvent) this.callbacks.onEventAlert?.();

    const inTransition = this.sectorManager.state.transitionState !== "playing";
    const sector = this.sectorManager.getCurrentSector();

    this.spawnAccumulator += gameDelta * 1000 * sectorMods.spawnIntervalScale;
    const interval = getSpawnIntervalMs(this.difficulty, phase);
    if (
      this.spawnAccumulator >= interval &&
      this.pilotControlGranted &&
      !inTransition
    ) {
      this.spawnAccumulator = 0;
      const nextLogo = this.getNextComponent();
      const logoIndex = this.getLogoComponentIndex();
      const prevTelegraphed = this.spawnScheduler.logoTelegraphedIndex;

      spawnPattern({
        entities: this.entities,
        playfield: this.playfield,
        height: this.height,
        scrollSpeed: this.scrollSpeed,
        difficulty: this.difficulty * sectorMods.hazardDensityMultiplier,
        hazardWeight: zone.hazardWeight * sectorMods.hazardDensityMultiplier,
        researchWeight: zone.researchWeight,
        playElapsed: this.sectorManager.state.sectorElapsed,
        sectorElapsed: this.sectorManager.state.sectorElapsed,
        inBreathingWindow: this.sectorManager.isInBreathingWindow(),
        hazardPool: sector.hazardPool,
        fuel: this.fuel,
        signalBurst: this.signalBurst,
        asteroidField: this.asteroidField,
        debrisCorridor: this.debrisCorridor,
        boostWindow: this.boostWindow,
        signalBoostActive: false,
        nextLogoComponent: nextLogo,
        assemblyComplete: this.assemblyComplete,
        logoComponentIndex: logoIndex,
        scheduler: this.spawnScheduler,
      });

      if (
        nextLogo &&
        !this.assemblyComplete &&
        this.spawnScheduler.logoTelegraphedIndex > prevTelegraphed
      ) {
        this.componentToast = `${LOGO_COMPONENT_LABELS[nextLogo]} INCOMING`;
        this.componentToastUntil = now + missionConfig.feedback.zoneToastMs;
        this.eventTitle = "SIGNAL COMPONENT DETECTED";
        this.eventHint = "Move to intercept";
        this.callbacks.onEventAlert?.();
      }

      this.trackNewEntityIdentifications(now);
    }

    for (const entity of this.entities) {
      if (!entity.active) continue;
      entity.y += this.scrollSpeed * gameDelta + entity.vy * gameDelta;
      entity.x += entity.vx * gameDelta;
      entity.rotation += entity.rotationSpeed * gameDelta;
    }

    if (!inTransition) {
      this.handleCollisions(now);
    }
    this.checkMissedLogoComponents(now);
    this.hazardsAvoided += deactivateOffscreenEntities(this.entities, this.height);
    this.updateTransientEffects(now);
    this.spawnExhaust(gameDelta);

    if (this.chain > 0) {
      this.chainTimer -= delta * 1000;
      if (this.chainTimer <= 0) this.resetChain("timeout");
    }

    if (this.fuel <= 0 && this.pilotControlGranted && !this.fuelFailureActive) {
      this.triggerFuelFailure(now);
      return;
    }

    if (this.integrity <= 0) {
      this.endCause = "hull-lost";
      this.finishMission(false);
    }

    if (this.effectiveThrottle > 0) {
      const scoreMult =
        this.getScoreMultiplier() *
        throttleToScoreMultiplier(this.effectiveThrottle) *
        (phase === "finale" ? missionConfig.score.finaleScoreMultiplier : 1);
      this.runningScore = Math.floor(
        this.computeLiveScore() * scoreMult * 0.15 + this.runningScore * 0.85,
      );
    }
  }

  private getScoreMultiplier(): number {
    return this.sectorManager.toSnapshot().sectorScoreMultiplier;
  }

  private triggerFuelFailure(now: number): void {
    this.fuel = 0;
    this.fuelFailureActive = true;
    this.effectiveThrottle = 0;
    this.requestedThrottle = Math.min(this.requestedThrottle, this.effectiveThrottle);
    this.phase = "engine-failure";
    this.endCause = "fuel-depleted";
    this.failureTimer = 0;
    this.callbacks.onPhaseChange(this.phase);
    this.callbacks.onLiveAnnouncement("Fuel depleted — engine shutdown");
  }

  private updateEngineFailure(delta: number, _now: number): void {
    this.effectiveThrottle = 0;
    this.throttle = 0;
    this.scrollSpeed = Math.max(0, this.scrollSpeed - delta * 200);
    this.playerY = Math.min(this.height * 0.82, this.playerY + delta * 18);
    this.altitudeKm += (this.scrollSpeed * delta) / 1000;
    this.spawnExhaust(delta);
    this.entityIdentifications = this.entityIdentifications.filter((i) => i.until > performance.now());
    this.failureTimer += delta;
    if (this.failureTimer >= missionConfig.fuel.failureSequenceSeconds) {
      this.finishMission(false);
    }
  }

  private trackNewEntityIdentifications(now: number): void {
    for (const entity of this.entities) {
      if (!entity.active || !entity.spawnedAt || entity.spawnedAt < now - 50) continue;
      const key = entity.type;
      if (this.discoveredSet.has(key) || this.spawnedTypesThisRun.has(key)) continue;
      this.spawnedTypesThisRun.add(key);
      this.discoveredSet.add(key);
      const def =
        entity.kind === "logo-component"
          ? logoComponentDefinitions[entity.type as LogoComponentType]
          : entity.kind === "collectible"
            ? collectibleDefinitions[entity.type as keyof typeof collectibleDefinitions]
            : hazardDefinitions[entity.type as keyof typeof hazardDefinitions];
      const hint = IDENT_HINTS[key] ?? def.label;
      this.entityIdentifications.push({
        entityId: entity.id,
        type: entity.type as EntityIdentType,
        title: def.label.toUpperCase(),
        hint,
        x: entity.x,
        y: entity.y,
        until: now + missionConfig.feedback.entityIdentMs,
      });
      this.callbacks.onEntityDiscovered?.(entity.type as EntityIdentType);
    }
  }

  markEntityDiscovered(type: string): void {
    if (type) this.discoveredSet.add(type);
  }

  resetEntityDiscovery(discovered: string[]): void {
    this.discoveredSet = new Set(discovered);
    this.spawnedTypesThisRun = new Set();
    this.entityIdentifications = [];
  }

  private handleCollisions(now: number): void {
    const hitR = this.playerRadius * missionConfig.collisions.playerHitboxScale;
    const colliding = findCollidingEntities(
      { x: this.playerX, y: this.playerY, radius: hitR },
      this.entities.filter((e) => e.active),
    );

    if (now < this.invulnerableUntil) return;

    for (const entity of colliding) {
      if (entity.kind === "logo-component") {
        this.collectLogoComponent(
          entity.type as LogoComponentType,
          now,
          entity.x,
          entity.y,
          entity.radius,
        );
        entity.active = false;
      } else if (entity.kind === "collectible") {
        this.collectItem(
          entity.type as keyof typeof collectibleDefinitions,
          entity.x,
          entity.y,
          entity.radius,
        );
        entity.active = false;
      } else {
        this.handleHazard(
          entity.type as keyof typeof hazardDefinitions,
          now,
          entity.x,
          entity.y,
          entity.radius,
        );
        entity.active = false;
      }
    }
  }

  private spawnTransientEffect(
    kind: TransientEffectKind,
    x: number,
    y: number,
    radius: number,
    color: string,
    durationMs?: number,
  ): void {
    const slot = this.transientEffects.find((e) => !e.active);
    if (!slot) return;
    slot.active = true;
    slot.kind = kind;
    slot.x = x;
    slot.y = y;
    slot.radius = radius;
    slot.color = color;
    slot.startTime = performance.now();
    slot.durationMs =
      durationMs ??
      (kind === "impact" || kind === "damage-spark"
        ? missionVisuals.effects.impactFlashMs
        : missionVisuals.effects.pickupRingMs);
    slot.id = this.transientEffectSeq++;
  }

  private spawnPlayerDamageSparks(now: number, x: number, y: number, side = 0): void {
    const offsetX = side * 14;
    this.spawnTransientEffect("damage-spark", x + offsetX, y, 28, "#ff3b30", 380);
    if (!this.reducedEffects) {
      this.spawnTransientEffect("impact", x + offsetX * 0.5, y + 4, 22, "#E85D4C", 320);
    }
  }

  private checkWallScrape(
    prevX: number,
    minX: number,
    maxX: number,
    widthScale: number,
    now: number,
  ): void {
    if (now < this.wallScrapeCooldownUntil) return;
    const threshold = 95 * widthScale;
    const hitLeft = this.playerX <= minX + 0.5 && this.playerVx < -threshold;
    const hitRight = this.playerX >= maxX - 0.5 && this.playerVx > threshold;
    if (!hitLeft && !hitRight) return;
    if (prevX === this.playerX && Math.abs(this.playerVx) < threshold) return;

    this.wallScrapeCooldownUntil = now + 220;
    this.spawnPlayerDamageSparks(now, this.playerX, this.playerY, hitLeft ? -1 : 1);
    if (!this.reducedEffects) this.callbacks.onScreenShake?.(0.22);
  }

  private updateTransientEffects(now: number): void {
    for (const effect of this.transientEffects) {
      if (!effect.active) continue;
      if (now - effect.startTime >= effect.durationMs) effect.active = false;
    }
  }

  private collectLogoComponent(
    type: LogoComponentType,
    now: number,
    x: number,
    y: number,
    radius: number,
  ): void {
    if (this.fuelFailureActive || this.phase === "engine-failure") return;
    if (this.assemblyCollected.includes(type)) return;
    const expected = this.getNextComponent();
    if (expected !== type) return;

    const def = logoComponentDefinitions[type];
    this.spawnTransientEffect("pickup", x, y, radius, def.color, 520);
    this.assemblyCollected.push(type);
    this.logoComponentsCollected += 1;
    const points = Math.floor(def.scoreValue * this.getScoreMultiplier());
    this.runningScore += points;
    if (this.signalBoostActive) this.signalBoostScoreBonus += points;

    this.pickupFlash = type;
    this.pickupFlashUntil = now + missionConfig.feedback.pickupFlashMs + 200;
    this.componentToast = `COMPONENT LOCKED — ${this.assemblyCollected.length} / ${LOGO_COMPONENT_COUNT}`;
    this.componentToastUntil = now + missionConfig.feedback.zoneToastMs;
    this.callbacks.onPickup?.(type);
    this.callbacks.onLogoComponent?.(type);
    this.callbacks.onLiveAnnouncement(`${LOGO_COMPONENT_LABELS[type]} RECOVERED`);

    if (isAssemblyCycleComplete(this.assemblyCollected, this.assemblyMissed)) {
      this.completeAssembly(now);
    }
  }

  private missLogoComponent(type: LogoComponentType, now: number): void {
    if (this.fuelFailureActive || this.phase === "engine-failure" || this.assemblyComplete) return;
    if (this.assemblyCollected.includes(type) || this.assemblyMissed.includes(type)) return;
    const expected = this.getNextComponent();
    if (expected !== type) return;

    this.assemblyMissed.push(type);
    this.componentToast = `${LOGO_COMPONENT_LABELS[type]} MISSED`;
    this.componentToastUntil = now + missionConfig.feedback.zoneToastMs;
    this.callbacks.onLiveAnnouncement(`${LOGO_COMPONENT_LABELS[type]} MISSED`);

    if (isAssemblyCycleComplete(this.assemblyCollected, this.assemblyMissed)) {
      this.completeAssembly(now);
    }
  }

  private checkMissedLogoComponents(now: number): void {
    if (this.assemblyComplete || !this.pilotControlGranted) return;
    const missThreshold = this.height + 72;
    for (const entity of this.entities) {
      if (!entity.active || entity.kind !== "logo-component") continue;
      if (entity.y <= missThreshold) continue;
      this.missLogoComponent(entity.type as LogoComponentType, now);
      entity.active = false;
    }
  }

  private autoMissRemainingComponents(_now: number): void {
    let next = this.getNextComponent();
    while (next) {
      this.assemblyMissed.push(next);
      next = this.getNextComponent();
    }
  }

  private completeAssembly(now: number): void {
    if (this.assemblyComplete) return;
    this.assemblyComplete = true;
    const missedCount = this.assemblyMissed.length;
    const collectedCount = this.assemblyCollected.length;
    const summary = this.sectorManager.onLogoComplete(
      now,
      this.fuel,
      this.integrity,
      missionConfig.initialIntegrity,
    );
    const collectionRatio = collectedCount / LOGO_COMPONENT_COUNT;
    const bonusScale =
      missionConfig.missionAssembly.missedSectorBonusFloor +
      (1 - missionConfig.missionAssembly.missedSectorBonusFloor) * collectionRatio;
    summary.sectorBonus = Math.floor(summary.sectorBonus * bonusScale);
    this.logosCompletedThisRun = this.sectorManager.state.sectorsCompletedThisRun;
    this.runningScore += summary.sectorBonus;
    this.logoCompletionBonus += summary.sectorBonus;
    this.logoCompletionTimeMs = summary.completionTimeMs;
    this.completionSlowMoUntil = now + 550;
    this.assemblyCompleteFlashUntil = now + 1200;
    this.callbacks.onAssemblyComplete?.();
    if (missedCount === 0) {
      this.callbacks.onLiveAnnouncement("DYOR Signal Restored");
    } else if (collectedCount === 0) {
      this.callbacks.onLiveAnnouncement("Partial signal restore — all components missed");
    } else {
      this.callbacks.onLiveAnnouncement(
        `Signal restored with ${missedCount} missed component${missedCount > 1 ? "s" : ""}`,
      );
    }
    if (!this.reducedEffects && missedCount === 0) this.callbacks.onScreenShake?.(0.25);
  }

  private collectItem(
    type: keyof typeof collectibleDefinitions,
    x: number,
    y: number,
    radius: number,
  ): void {
    if (this.fuelFailureActive || this.phase === "engine-failure") return;
    const def = collectibleDefinitions[type];
    this.spawnTransientEffect("pickup", x, y, radius, def.color);
    const pickupType = type as PickupFeedbackType;
    this.pickupFlash = pickupType;
    this.pickupFlashUntil = performance.now() + missionConfig.feedback.pickupFlashMs;
    this.callbacks.onPickup?.(pickupType);

    if (def.chainEligible) {
      this.chain += 1;
      this.chainTimer = missionConfig.chains.timeoutMs;
      this.chainMultiplier = calculateChainMultiplier(this.chain);
      this.bestChain = Math.max(this.bestChain, this.chain);
      this.chainBonusAccumulated += calculateChainBonus(this.chain);
      if (missionConfig.chains.milestones.some((m) => m === this.chain)) {
        this.callbacks.onChainMilestone?.(this.chain);
        this.callbacks.onLiveAnnouncement(`Research chain ×${this.chain}`);
      }
    }

    if (def.scoreValue > 0) {
      this.researchCount += 1;
      this.runningScore += Math.floor(def.scoreValue * this.getScoreMultiplier());
    }
    if (def.fuelRestore) this.fuel = clamp(this.fuel + def.fuelRestore, 0, 100);
    if (def.heatReduce) this.heat = clamp(this.heat - def.heatReduce, 0, 100);
    if (def.grantsShield && !this.shield) {
      this.shield = true;
      this.callbacks.onLiveAnnouncement("Shield online");
    }
  }

  private handleHazard(
    type: keyof typeof hazardDefinitions,
    now: number,
    x: number,
    y: number,
    radius: number,
  ): void {
    const def = hazardDefinitions[type];
    this.spawnTransientEffect("impact", x, y, radius, def.color);
    if (def.area && def.damage === 0) return;

    this.resetChain("collision", now);

    if (this.shield) {
      this.shield = false;
      this.invulnerableUntil = now + missionConfig.collisions.invulnerabilityMs;
      clearHazardsNear(
        this.entities,
        this.playerX,
        this.playerY,
        missionConfig.collisions.postHitClearRadius,
      );
      this.callbacks.onLiveAnnouncement("Shield absorbed impact");
      if (!this.reducedEffects) this.callbacks.onScreenShake?.(0.35);
      return;
    }

    this.integrity -= def.damage;
    this.spawnPlayerDamageSparks(now, this.playerX, this.playerY);
    this.invulnerableUntil = now + missionConfig.collisions.invulnerabilityMs;
    clearHazardsNear(
      this.entities,
      this.playerX,
      this.playerY,
      missionConfig.collisions.postHitClearRadius * 0.7,
    );
    if (!this.reducedEffects) this.callbacks.onScreenShake?.(0.55);
    this.callbacks.onLiveAnnouncement(
      type === "rug-signal" ? "False signal — hull impact" : "Hull impact",
    );
  }

  private resetChain(reason: ChainResetReason, now = performance.now()): void {
    if (this.chain <= 0) return;
    const prev = this.chain;
    this.chain = 0;
    this.chainMultiplier = 1;
    this.chainTimer = 0;
    if (reason === "timeout") {
      this.chainLostMessage = "Chain expired";
    } else if (reason === "collision") {
      this.chainLostMessage = `Chain lost at ×${prev} — impact`;
    }
    this.chainLostUntil = now + missionConfig.feedback.chainLostToastMs;
  }

  private spawnExhaust(delta: number): void {
    if (this.effectiveThrottle < 0.05) return;
    const count = Math.min(4, Math.floor(this.effectiveThrottle * 2.8));
    for (let i = 0; i < count; i += 1) {
      const p = this.particles.find((x) => !x.active);
      if (!p) break;
      p.active = true;
      p.x = this.playerX + (Math.random() - 0.5) * 6;
      p.y = this.playerY + 18;
      p.vx = (Math.random() - 0.5) * 25;
      p.vy = 70 + this.effectiveThrottle * 110;
      p.life = 0.25 + Math.random() * 0.2;
      p.maxLife = p.life;
      p.color =
        this.effectiveThrottle > 0.85
          ? "#e85d4c"
          : this.effectiveThrottle > 0.6
            ? "#e5cf59"
            : "#31d1c6";
      p.size = 2 + this.effectiveThrottle * 3;
    }
    for (const p of this.particles) {
      if (!p.active) continue;
      p.x += p.vx * delta;
      p.y += p.vy * delta;
      p.life -= delta;
      if (p.life <= 0) p.active = false;
    }
  }

  private computeLiveScore(): number {
    const avgThrottle = this.throttleSamples > 0 ? this.throttleSum / this.throttleSamples : 0;
    return calculateScoreBreakdown({
      altitudeKm: this.altitudeKm,
      researchCollected: this.researchCount,
      bestChain: this.bestChain,
      chainBonusAccumulated: this.chainBonusAccumulated,
      logoComponentsCollected: this.logoComponentsCollected,
      logoCompletionBonus: this.logoCompletionBonus,
      signalBoostBonus: this.signalBoostScoreBonus,
      averageThrottle: avgThrottle,
      fuelRemaining: this.fuel,
      initialFuel: missionConfig.initialFuel,
      hazardsAvoided: this.hazardsAvoided,
      integrityRemaining: this.integrity,
      maxIntegrity: missionConfig.initialIntegrity,
      mode: this.mode,
      timedCompleted: false,
    }).finalScore;
  }

  private finishMission(timedCompleted: boolean): void {
    this.phase = "debrief";
    this.stop();
    const avgThrottle = this.throttleSamples > 0 ? this.throttleSum / this.throttleSamples : 0;
    const breakdown = calculateScoreBreakdown({
      altitudeKm: this.altitudeKm,
      researchCollected: this.researchCount,
      bestChain: this.bestChain,
      chainBonusAccumulated: this.chainBonusAccumulated,
      logoComponentsCollected: this.logoComponentsCollected,
      logoCompletionBonus: this.logoCompletionBonus,
      signalBoostBonus: this.signalBoostScoreBonus,
      averageThrottle: avgThrottle,
      fuelRemaining: this.fuel,
      initialFuel: missionConfig.initialFuel,
      hazardsAvoided: this.hazardsAvoided,
      integrityRemaining: Math.max(0, this.integrity),
      maxIntegrity: missionConfig.initialIntegrity,
      mode: this.mode,
      timedCompleted,
    });
    const assessment = selectFlightAssessment({
      mode: this.mode,
      altitudeKm: this.altitudeKm,
      researchCollected: this.researchCount,
      fuelEfficiencyPercent: calculateFuelEfficiencyPercent(this.fuel, missionConfig.initialFuel),
      integrityRemaining: Math.max(0, this.integrity),
      maxIntegrity: missionConfig.initialIntegrity,
      hazardsAvoided: this.hazardsAvoided,
      bestChain: this.bestChain,
      endCause: this.endCause,
    });
    const debrief: MissionDebrief = {
      mode: this.mode,
      altitudeKm: this.altitudeKm,
      researchCollected: this.researchCount,
      bestChain: this.bestChain,
      fuelEfficiencyPercent: calculateFuelEfficiencyPercent(this.fuel, missionConfig.initialFuel),
      hazardsAvoided: this.hazardsAvoided,
      integrityRemaining: Math.max(0, this.integrity),
      maxIntegrity: missionConfig.initialIntegrity,
      breakdown,
      rank: getRankForScore(breakdown.finalScore),
      isPersonalBest: false,
      durationSeconds: this.playElapsed,
      highestZoneLabel: this.highestZoneLabel,
      logosCompleted: this.logosCompletedThisRun,
      logoComponentsCollected: this.logoComponentsCollected,
      signalBoostPeakScore: this.signalBoostScoreBonus,
      logoCompletionTimeMs: this.logoCompletionTimeMs,
      sectorsCompleted: this.sectorManager.state.sectorsCompletedThisRun,
      highestSectorReached: this.sectorManager.state.currentSectorNumber,
      highestCycleReached: this.sectorManager.state.currentCycle,
      fastestSectorCompletionMs: this.sectorManager.state.fastestSectorCompletionMs,
      endCause: this.endCause,
      assessment: assessment.summary,
      assessmentHighlight: assessment.highlight,
      scoreDelta: computeScoreDelta(breakdown.finalScore, this.previousBest),
      previousBest: this.previousBest,
    };
    this.callbacks.onPhaseChange(this.phase);
    this.callbacks.onDebrief(debrief);
    this.emitHud();
  }

  private emitHud(): void {
    const zone = getZoneForAltitude(this.altitudeKm);
    const phase = getTimedPhase(this.sectorManager.state.sectorElapsed);
    const fuelDisplay = formatFuelDisplay(this.fuel);
    const sector = this.sectorManager.toSnapshot();
    const hud: HudSnapshot = {
      altitudeKm: this.altitudeKm,
      zoneId: zone.id,
      zoneLabel: zone.label,
      score: this.runningScore,
      fuel: this.fuel,
      heat: this.heat,
      integrity: Math.max(0, this.integrity),
      maxIntegrity: missionConfig.initialIntegrity,
      shield: this.shield,
      chain: this.chain,
      chainMultiplier: this.chainMultiplier,
      chainTimerMs: this.chainTimer,
      chainMaxMs: missionConfig.chains.timeoutMs,
      throttle: this.effectiveThrottle,
      requestedThrottle: this.requestedThrottle,
      throttleZone: getThrottleZone(this.effectiveThrottle),
      throttleDisabled: this.fuel <= 0 || this.fuelFailureActive,
      noFuel: fuelDisplay.isEmpty,
      fuelDisplay: fuelDisplay.text,
      timerSeconds: Math.ceil(sector.sectorTimeRemainingMs / 1000),
      overheated: this.overheated,
      cooling: this.overheated,
      eventTitle: this.eventTitle,
      eventHint: this.eventHint,
      zoneToast: this.zoneToast,
      chainLostMessage: this.chainLostMessage,
      pickupFlash: this.pickupFlash,
      timedPhase: phase,
      finaleActive: phase === "finale",
      phase: this.phase,
      assemblyCollected: [...this.assemblyCollected],
      assemblyMissed: [...this.assemblyMissed],
      nextComponent: this.getNextComponent(),
      componentsCollected: this.assemblyCollected.length,
      componentsMissed: this.assemblyMissed.length,
      totalComponents: LOGO_COMPONENT_COUNT,
      assemblyComplete: this.assemblyComplete,
      componentToast: this.componentToast,
      signalBoostActive: false,
      signalBoostRemainingMs: 0,
      signalBoostMultiplier: 1,
      scoreMultiplier: this.getScoreMultiplier(),
      sectorNumber: sector.currentSectorNumber,
      sectorName: sector.currentSectorName,
      sectorSubtitle: sector.currentSectorSubtitle,
      sectorCycle: sector.currentCycle,
      isExtendedMission: sector.isExtendedMission,
      sectorsCompleted: sector.sectorsCompletedThisRun,
      sectorTimeRemainingMs: sector.sectorTimeRemainingMs,
      sectorState: sector.sectorState,
      sectorTransitionMessage: sector.sectorTransitionMessage,
      sectorTransitionSubtext: sector.sectorTransitionSubtext,
      sectorCompleteSummary: sector.sectorCompleteSummary,
      timerUrgent: sector.timerUrgent,
      timerCritical: sector.timerCritical,
      difficultyLabel: sector.difficultyLabel,
      maxSectorsThisRun: sector.maxSectorsThisRun,
      logosCompleted: this.logosCompletedThisRun,
      highestSectorThisRun: this.sectorManager.state.currentSectorNumber,
    };
    this.callbacks.onHudUpdate(hud);
  }

  getRenderState() {
    const sector = this.sectorManager.toSnapshot();
    return {
      width: this.width,
      height: this.height,
      playfield: this.playfield,
      playerX: this.playerX,
      playerY: this.playerY,
      bankAngle: this.bankAngle,
      throttle: this.effectiveThrottle,
      altitudeKm: this.altitudeKm,
      entities: this.entities,
      particles: this.particles,
      transientEffects: this.transientEffects,
      invulnerable: performance.now() < this.invulnerableUntil,
      shield: this.shield,
      phase: this.phase,
      entityIdentifications: this.entityIdentifications,
      signalBoostActive: false,
      assemblyCompleteFlash: performance.now() < this.assemblyCompleteFlashUntil,
      reducedEffects: this.reducedEffects,
      sectorBackground: {
        current: sector.backgroundConfig,
        previous: sector.previousBackgroundConfig,
        blend: sector.backgroundBlend,
      },
      sectorGrid: sector.backgroundConfig,
    };
  }
}

function EVENT_HINT(type: string): string {
  const map: Record<string, string> = {
    "signal-burst": "Research density increased",
    "asteroid-field": "Dense debris incoming",
    "solar-activity": "Heat rising faster",
    "boost-window": "Clear corridor — boost safe",
    "debris-corridor": "Narrow path — reduce throttle",
  };
  return map[type] ?? "";
}

const IDENT_HINTS: Record<string, string> = {
  research: "Collect for score",
  "data-cube": "High-value research",
  fuel: "Restores fuel",
  shield: "Absorbs one hit",
  cooling: "Reduces heat",
  "signal-beacon": "Research bonus",
  asteroid: "Avoid impact",
  debris: "Avoid impact",
  radiation: "Damages hull",
  drone: "Moving hazard",
  "fud-cloud": "Reduces visibility",
  "rug-signal": "False signal — avoid",
};

export type { ScoreBreakdown };
