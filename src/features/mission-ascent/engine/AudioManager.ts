/** Web Audio event bus — placeholder tones, replace with assets later. */

export type AudioEvent =
  | "ignition"
  | "engine-idle"
  | "engine-cruise"
  | "engine-high"
  | "engine-boost"
  | "pickup-research"
  | "pickup-fuel"
  | "pickup-cooling"
  | "pickup-shield"
  | "collision"
  | "shield-hit"
  | "warning"
  | "event-alert"
  | "zone-transition"
  | "final-countdown"
  | "mission-complete"
  | "new-record"
  | "chain-milestone";

type AudioManagerOptions = {
  enabled: boolean;
};

export class AudioManager {
  private ctx: AudioContext | null = null;
  private enabled: boolean;
  private engineOsc: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private started = false;

  constructor(options: AudioManagerOptions) {
    this.enabled = options.enabled;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) this.stopEngine();
  }

  private ensureContext(): AudioContext | null {
    if (!this.enabled) return null;
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    return this.ctx;
  }

  unlock(): void {
    const ctx = this.ensureContext();
    if (!ctx || this.started) return;
    if (ctx.state === "suspended") void ctx.resume();
    this.started = true;
  }

  play(event: AudioEvent): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.enabled) return;

    const freqMap: Partial<Record<AudioEvent, number>> = {
      "pickup-research": 880,
      "pickup-fuel": 660,
      "pickup-cooling": 740,
      "pickup-shield": 990,
      collision: 180,
      "shield-hit": 420,
      warning: 520,
      "event-alert": 640,
      "zone-transition": 560,
      "chain-milestone": 920,
      "mission-complete": 480,
      "new-record": 760,
      ignition: 320,
    };

    const freq = freqMap[event];
    if (!freq) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = event === "collision" ? "sawtooth" : "sine";
    osc.frequency.value = freq;
    gain.gain.value = 0.06;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.stop(ctx.currentTime + 0.14);
  }

  updateEngine(throttle: number, paused: boolean): void {
    if (!this.enabled || paused) {
      this.stopEngine();
      return;
    }
    const ctx = this.ensureContext();
    if (!ctx) return;

    if (!this.engineOsc) {
      this.engineOsc = ctx.createOscillator();
      this.engineGain = ctx.createGain();
      this.engineOsc.type = "sawtooth";
      this.engineOsc.connect(this.engineGain);
      this.engineGain.connect(ctx.destination);
      this.engineGain.gain.value = 0.015;
      this.engineOsc.start();
    }

    const base = 80 + throttle * 120;
    this.engineOsc.frequency.setTargetAtTime(base, ctx.currentTime, 0.08);
    this.engineGain!.gain.setTargetAtTime(0.008 + throttle * 0.02, ctx.currentTime, 0.08);
  }

  stopEngine(): void {
    if (this.engineOsc) {
      try {
        this.engineOsc.stop();
      } catch {
        /* already stopped */
      }
      this.engineOsc.disconnect();
      this.engineOsc = null;
      this.engineGain = null;
    }
  }

  dispose(): void {
    this.stopEngine();
    if (this.ctx) {
      void this.ctx.close();
      this.ctx = null;
    }
    this.started = false;
  }
}
