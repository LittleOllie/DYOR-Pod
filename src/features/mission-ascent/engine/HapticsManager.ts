export type HapticEvent = "boost-zone" | "collision" | "shield" | "fuel-critical" | "new-record";

type HapticsOptions = {
  enabled: boolean;
  reducedEffects: boolean;
};

export class HapticsManager {
  private enabled: boolean;
  private reducedEffects: boolean;
  private unlocked = false;

  constructor(options: HapticsOptions) {
    this.enabled = options.enabled;
    this.reducedEffects = options.reducedEffects;
  }

  setOptions(enabled: boolean, reducedEffects: boolean): void {
    this.enabled = enabled;
    this.reducedEffects = reducedEffects;
  }

  unlock(): void {
    this.unlocked = true;
  }

  pulse(event: HapticEvent): void {
    if (!this.enabled || this.reducedEffects || !this.unlocked) return;
    if (typeof navigator === "undefined" || !navigator.vibrate) return;

    const patterns: Record<HapticEvent, number | number[]> = {
      "boost-zone": 12,
      collision: [20, 40, 30],
      shield: 18,
      "fuel-critical": [10, 30, 10],
      "new-record": [15, 20, 25],
    };
    navigator.vibrate(patterns[event]);
  }
}
