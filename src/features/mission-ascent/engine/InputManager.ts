import { missionConfig } from "@/features/mission-ascent/config/gameConfig";
import type { ThrottleValue } from "@/features/mission-ascent/types/mission.types";
import { applyEdgeDamping, clamp } from "@/features/mission-ascent/utils/math";

export type InputState = {
  left: boolean;
  right: boolean;
  throttleUp: boolean;
  throttleDown: boolean;
  boost: boolean;
  pause: boolean;
  restart: boolean;
  pointerActive: boolean;
  throttlePointer: number | null;
};

export const defaultInputState: InputState = {
  left: false,
  right: false,
  throttleUp: false,
  throttleDown: false,
  boost: false,
  pause: false,
  restart: false,
  pointerActive: false,
  throttlePointer: null,
};

const KEY_MAP: Record<string, Partial<InputState>> = {
  ArrowLeft: { left: true },
  KeyA: { left: true },
  ArrowRight: { right: true },
  KeyD: { right: true },
  ArrowUp: { throttleUp: true },
  KeyW: { throttleUp: true },
  ArrowDown: { throttleDown: true },
  KeyS: { throttleDown: true },
  Space: { boost: true },
};

export class InputManager {
  private state: InputState = { ...defaultInputState };
  private keysDown = new Set<string>();
  private pauseRequested = false;
  private restartRequested = false;
  private lastSteerDir = 0;
  private pendingPointerDelta = 0;

  getState(): InputState {
    return this.state;
  }

  consumePauseRequest(): boolean {
    const v = this.pauseRequested;
    this.pauseRequested = false;
    return v;
  }

  consumeRestartRequest(): boolean {
    const v = this.restartRequested;
    this.restartRequested = false;
    return v;
  }

  handleKeyDown(code: string): void {
    if (code === "Escape") {
      this.pauseRequested = true;
      return;
    }
    if (code === "KeyR") {
      this.restartRequested = true;
      return;
    }
    this.keysDown.add(code);
    this.syncFromKeys();
  }

  handleKeyUp(code: string): void {
    this.keysDown.delete(code);
    this.syncFromKeys();
  }

  private syncFromKeys(): void {
    this.state = { ...defaultInputState };
    for (const code of this.keysDown) {
      const patch = KEY_MAP[code];
      if (patch) Object.assign(this.state, patch);
    }
  }

  beginPointer(): void {
    this.state.pointerActive = true;
    this.pendingPointerDelta = 0;
  }

  addPointerDelta(deltaX: number): void {
    if (this.state.pointerActive) this.pendingPointerDelta += deltaX;
  }

  endPointer(): void {
    this.state.pointerActive = false;
    this.pendingPointerDelta = 0;
  }

  consumePointerDelta(): number {
    const delta = this.pendingPointerDelta;
    this.pendingPointerDelta = 0;
    return delta;
  }

  setThrottlePointer(value: number | null): void {
    this.state.throttlePointer = value;
  }

  reset(): void {
    this.keysDown.clear();
    this.state = { ...defaultInputState };
    this.pauseRequested = false;
    this.restartRequested = false;
    this.lastSteerDir = 0;
    this.pendingPointerDelta = 0;
  }

  getLastSteerDir(): number {
    return this.lastSteerDir;
  }

  setLastSteerDir(dir: number): void {
    this.lastSteerDir = dir;
  }
}

export function applyThrottleInput(
  current: ThrottleValue,
  input: InputState,
  delta: number,
  overheated: boolean,
  allowIncrease: boolean,
): ThrottleValue {
  let next = current;
  if (input.throttlePointer !== null) {
    next = input.throttlePointer;
  } else {
    const rate = missionConfig.throttle.keyboardChangeRate * delta;
    if (input.throttleUp || input.boost) {
      if (allowIncrease) next += rate;
    }
    if (input.throttleDown) next -= rate;
  }
  if (overheated) next = Math.min(next, missionConfig.throttle.overheatMaxThrottle);
  if (!allowIncrease) next = Math.min(next, current);
  return clamp(next, 0, 1);
}

export function applySteeringInput(
  vx: number,
  input: InputState,
  playerX: number,
  minX: number,
  maxX: number,
  delta: number,
  instability: number,
  widthScale: number,
  lastSteerDir: number,
  effectiveThrottle: number,
  pointerDeltaX = 0,
): { vx: number; lastSteerDir: number } {
  const cfg = missionConfig.controls;
  const accel = cfg.horizontalAcceleration * widthScale;
  const maxVx = cfg.horizontalMaxSpeed * widthScale;
  const handlingPenalty = 1 - cfg.highThrottleHandlingPenalty * effectiveThrottle;

  const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  let nextVx = vx;

  if (dir !== 0) {
    if (dir !== lastSteerDir) {
      nextVx += dir * cfg.initialInputImpulse * widthScale;
    }
    nextVx += dir * accel * cfg.keyboardResponseBoost * delta * handlingPenalty;
  }

  if (input.pointerActive && pointerDeltaX !== 0) {
    nextVx += pointerDeltaX * cfg.pointerDragSensitivity * widthScale * handlingPenalty;
  }

  const drag = Math.exp(-cfg.horizontalDamping * delta);
  nextVx *= drag;
  nextVx = applyEdgeDamping(playerX, nextVx, minX, maxX, cfg.edgeDamping);
  nextVx += (Math.random() - 0.5) * instability * delta;

  return {
    vx: clamp(nextVx, -maxVx * handlingPenalty, maxVx * handlingPenalty),
    lastSteerDir: dir !== 0 ? dir : 0,
  };
}

export function computeEffectiveThrottle(
  requested: number,
  fuel: number,
  missionActive: boolean,
): number {
  if (!missionActive || fuel <= 0) return 0;
  return requested;
}
