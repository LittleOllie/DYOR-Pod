"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { GameMode, MissionStorageSchema } from "@/features/mission-ascent/types/mission.types";
import {
  applyDebriefToStorage,
  defaultMissionStorage,
  getPersonalBest,
  readMissionStorage,
  updateMissionPreferences,
  writeMissionStorage,
} from "@/features/mission-ascent/utils/storage";

type Listener = () => void;
let cached: MissionStorageSchema | null = null;
const listeners = new Set<Listener>();

function getSnapshot(): MissionStorageSchema {
  if (typeof window === "undefined") {
    return defaultMissionStorage;
  }
  if (!cached) cached = readMissionStorage();
  return cached;
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify() {
  for (const l of listeners) l();
}

function persist(next: MissionStorageSchema) {
  cached = next;
  writeMissionStorage(next);
  notify();
}

/** Re-read persisted scores from disk — call when opening the game overlay. */
export function reloadMissionStorageFromDisk(): void {
  if (typeof window === "undefined") return;
  cached = readMissionStorage();
  notify();
}

export function useMissionStorage() {
  const storage = useSyncExternalStore(subscribe, getSnapshot, () => defaultMissionStorage);

  const setMode = useCallback((mode: GameMode) => {
    persist(updateMissionPreferences(getSnapshot(), { lastMode: mode }));
  }, []);

  const setAudioEnabled = useCallback((audioEnabled: boolean) => {
    persist(updateMissionPreferences(getSnapshot(), { audioEnabled }));
  }, []);

  const setReducedEffects = useCallback((reducedEffects: boolean) => {
    persist(updateMissionPreferences(getSnapshot(), { reducedEffects }));
  }, []);

  const markLaunchSequenceSeen = useCallback(() => {
    persist(updateMissionPreferences(getSnapshot(), { launchSequenceSeen: true }));
  }, []);

  const markOnboardingComplete = useCallback(() => {
    persist(updateMissionPreferences(getSnapshot(), { onboardingComplete: true }));
  }, []);

  const markEntityDiscovered = useCallback((type: string) => {
    const current = getSnapshot();
    if (current.preferences.discoveredEntities.includes(type)) return;
    persist(
      updateMissionPreferences(current, {
        discoveredEntities: [...current.preferences.discoveredEntities, type],
      }),
    );
  }, []);

  const resetDiscoveredEntities = useCallback(() => {
    persist(updateMissionPreferences(getSnapshot(), { discoveredEntities: [] }));
  }, []);

  const saveDebrief = useCallback(
    (
      mode: GameMode,
      debrief: {
        finalScore: number;
        altitudeKm: number;
        bestChain: number;
        logosCompleted?: number;
        logoComponentsCollected?: number;
        signalBoostPeakScore?: number;
        logoCompletionTimeMs?: number | null;
        sectorsCompleted?: number;
        highestSectorReached?: number;
        highestCycleReached?: number;
        fastestSectorCompletionMs?: number | null;
      },
    ) => {
      const result = applyDebriefToStorage(getSnapshot(), mode, debrief);
      persist(result.storage);
      return result.isPersonalBest;
    },
    [],
  );

  const getBest = useCallback(
    (mode: GameMode) => getPersonalBest(storage.records, mode),
    [storage.records],
  );

  return {
    storage,
    records: storage.records,
    preferences: storage.preferences,
    setMode,
    setAudioEnabled,
    setReducedEffects,
    markLaunchSequenceSeen,
    markOnboardingComplete,
    markEntityDiscovered,
    resetDiscoveredEntities,
    saveDebrief,
    getBest,
  };
}

/** Reset cached storage — for tests only */
export function resetMissionStorageCache(): void {
  cached = null;
}
