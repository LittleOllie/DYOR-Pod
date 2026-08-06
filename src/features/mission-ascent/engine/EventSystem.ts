import { missionConfig } from "@/features/mission-ascent/config/gameConfig";
import type { MissionEvent, MissionEventType } from "@/features/mission-ascent/types/mission.types";

export type EventDefinition = {
  type: MissionEventType;
  title: string;
  hint: string;
  durationMs: number;
};

export const EVENT_DEFINITIONS: Record<MissionEventType, EventDefinition> = {
  "signal-burst": {
    type: "signal-burst",
    title: "Signal burst",
    hint: "Research density increased",
    durationMs: missionConfig.events.signalBurstMs,
  },
  "asteroid-field": {
    type: "asteroid-field",
    title: "Asteroid field",
    hint: "Dense debris incoming",
    durationMs: missionConfig.events.asteroidFieldMs,
  },
  "solar-activity": {
    type: "solar-activity",
    title: "Solar activity",
    hint: "Engine heat rising faster",
    durationMs: missionConfig.events.solarActivityMs,
  },
  "boost-window": {
    type: "boost-window",
    title: "Boost window",
    hint: "Clear ascent corridor detected",
    durationMs: missionConfig.events.boostWindowMs,
  },
  "debris-corridor": {
    type: "debris-corridor",
    title: "Debris corridor",
    hint: "Narrow path — reduce throttle",
    durationMs: missionConfig.events.boostWindowMs,
  },
};

const EVENT_ROTATION: MissionEventType[] = [
  "signal-burst",
  "asteroid-field",
  "boost-window",
  "solar-activity",
  "debris-corridor",
];

export type EventSchedulerState = {
  lastEventEnd: number;
  nextEventIndex: number;
  pendingTelegraph: EventDefinition | null;
  telegraphUntil: number;
};

export function createEventScheduler(): EventSchedulerState {
  return { lastEventEnd: 0, nextEventIndex: 0, pendingTelegraph: null, telegraphUntil: 0 };
}

export function tickEventScheduler(
  state: EventSchedulerState,
  now: number,
  playElapsed: number,
  activeEvent: MissionEvent | null,
): {
  activeEvent: MissionEvent | null;
  telegraphLabel: string | null;
  telegraphHint: string | null;
  signalBurst: boolean;
  solarActivity: boolean;
  boostWindow: boolean;
  debrisCorridor: boolean;
  asteroidField: boolean;
} {
  let event = activeEvent;
  let telegraphLabel: string | null = null;
  let telegraphHint: string | null = null;

  if (event && now >= event.startedAt + event.durationMs) {
    event = null;
    state.lastEventEnd = now;
  }

  if (
    !event &&
    !state.pendingTelegraph &&
    playElapsed > 20 &&
    now - state.lastEventEnd > missionConfig.events.minGapMs
  ) {
    const def = EVENT_DEFINITIONS[EVENT_ROTATION[state.nextEventIndex % EVENT_ROTATION.length]];
    state.nextEventIndex += 1;
    state.pendingTelegraph = def;
    state.telegraphUntil = now + missionConfig.events.telegraphMs;
  }

  if (state.pendingTelegraph && now >= state.telegraphUntil) {
    const def = state.pendingTelegraph;
    state.pendingTelegraph = null;
    event = {
      type: def.type,
      label: def.title,
      startedAt: now,
      durationMs: def.durationMs,
      telegraphUntil: state.telegraphUntil,
    };
  } else if (state.pendingTelegraph) {
    telegraphLabel = state.pendingTelegraph.title;
    telegraphHint = state.pendingTelegraph.hint;
  }

  const type = event?.type;
  return {
    activeEvent: event,
    telegraphLabel,
    telegraphHint,
    signalBurst: type === "signal-burst",
    solarActivity: type === "solar-activity",
    boostWindow: type === "boost-window",
    debrisCorridor: type === "debris-corridor",
    asteroidField: type === "asteroid-field",
  };
}
