import { missionConfig } from "@/features/mission-ascent/config/gameConfig";

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function lerpColor(a: string, b: string, t: number): string {
  const parse = (hex: string) => {
    const h = hex.replace("#", "");
    return [
      parseInt(h.slice(0, 2), 16),
      parseInt(h.slice(2, 4), 16),
      parseInt(h.slice(4, 6), 16),
    ] as const;
  };
  const [ar, ag, ab] = parse(a);
  const [br, bg, bb] = parse(b);
  const r = Math.round(lerp(ar, br, t));
  const g = Math.round(lerp(ag, bg, t));
  const bl = Math.round(lerp(ab, bb, t));
  return `rgb(${r}, ${g}, ${bl})`;
}

export function distanceSq(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return dx * dx + dy * dy;
}

export function circleCollision(
  x1: number,
  y1: number,
  r1: number,
  x2: number,
  y2: number,
  r2: number,
): boolean {
  const minDist = r1 + r2;
  return distanceSq(x1, y1, x2, y2) <= minDist * minDist;
}

export function formatAltitude(km: number): string {
  return `${Math.floor(km).toLocaleString()} KM`;
}

export function formatScore(score: number): string {
  return Math.floor(score).toLocaleString();
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

export function formatTimer(seconds: number): string {
  const s = Math.max(0, Math.ceil(seconds));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}:${rem.toString().padStart(2, "0")}`;
}

export function getThrottleZone(throttle: number): "idle" | "cruise" | "high" | "boost" {
  if (throttle < 0.25) return "idle";
  if (throttle < 0.6) return "cruise";
  if (throttle < 0.85) return "high";
  return "boost";
}

export function throttleToAltitudeMultiplier(throttle: number): number {
  const t = missionConfig.throttle;
  const zone = getThrottleZone(throttle);
  if (zone === "idle") return t.lowAltitudeMultiplier;
  if (zone === "cruise") return t.cruiseAltitudeMultiplier;
  if (zone === "high") return t.highAltitudeMultiplier;
  return t.boostAltitudeMultiplier;
}

export function throttleToScrollMultiplier(throttle: number): number {
  return 0.32 + throttle * throttleToAltitudeMultiplier(throttle) * 0.55;
}

export function throttleToScoreMultiplier(throttle: number): number {
  const t = missionConfig.throttle;
  const zone = getThrottleZone(throttle);
  if (zone === "idle") return t.lowScoreMultiplier;
  if (zone === "cruise") return t.cruiseScoreMultiplier;
  if (zone === "high") return t.highScoreMultiplier;
  return t.boostScoreMultiplier;
}

export function throttleToFuelRate(throttle: number): number {
  const f = missionConfig.fuel;
  if (throttle < 0.25) return f.lowRate * (throttle / 0.25 + 0.15);
  if (throttle < 0.6) return lerp(f.lowRate, f.cruiseRate, (throttle - 0.25) / 0.35);
  if (throttle < 0.85) return lerp(f.cruiseRate, f.highRate, (throttle - 0.6) / 0.25);
  return lerp(f.highRate, f.boostRate, (throttle - 0.85) / 0.15);
}

export function throttleToHeatGain(throttle: number): number {
  const { gainRate, boostHeatMultiplier } = missionConfig.heat;
  if (throttle < 0.4) return gainRate * throttle * 0.3;
  const base = gainRate * (0.15 + Math.pow(throttle, 1.55));
  return throttle >= 0.85 ? base * boostHeatMultiplier : base;
}

/** Normalise touch X to game coordinates */
export function normaliseTouchSteer(
  clientX: number,
  rectLeft: number,
  rectWidth: number,
): number {
  return clamp(clientX - rectLeft, 0, rectWidth);
}

export function applyEdgeDamping(
  x: number,
  vx: number,
  minX: number,
  maxX: number,
  damping: number,
): number {
  const margin = (maxX - minX) * 0.08;
  if (x < minX + margin) return vx * (1 - damping);
  if (x > maxX - margin) return vx * (1 - damping);
  return vx;
}

/** Unity-style smooth damp for touch steering */
export function smoothDamp(
  current: number,
  target: number,
  velRef: { value: number },
  smoothTime: number,
  maxSpeed: number,
  delta: number,
): number {
  const st = Math.max(0.0001, smoothTime);
  const omega = 2 / st;
  const x = omega * delta;
  const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
  let change = current - target;
  const maxChange = maxSpeed * st;
  change = clamp(change, -maxChange, maxChange);
  const temp = (velRef.value + omega * change) * delta;
  velRef.value = (velRef.value - omega * temp) * exp;
  return target + (change + temp) * exp;
}

export function formatFuelDisplay(fuel: number): {
  text: string;
  isEmpty: boolean;
  isCritical: boolean;
} {
  if (fuel <= 0) return { text: "EMPTY", isEmpty: true, isCritical: true };
  if (fuel < 1) return { text: "<1%", isEmpty: false, isCritical: true };
  return { text: `${Math.ceil(fuel)}%`, isEmpty: false, isCritical: fuel <= 15 };
}

export function getWidthSpeedScale(playfieldWidth: number): number {
  const ref = missionConfig.controls.referencePlayfieldWidth;
  return clamp(
    playfieldWidth / ref,
    0.85,
    missionConfig.controls.maximumWidthSpeedScale,
  );
}
