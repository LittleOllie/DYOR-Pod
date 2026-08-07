import {
  MISSION_STORAGE_KEY,
  MISSION_STORAGE_VERSION,
  type MissionPreferences,
  type MissionRecords,
  type MissionStorageSchema,
} from "@/features/mission-ascent/types/mission.types";
import { isLocalDevHost } from "@/lib/site/url";

const LOCAL_MISSION_STORAGE_SUFFIX = ":local";

/** In-memory fallback when localStorage is unavailable (private mode, quota, etc.). */
let memoryFallback: MissionStorageSchema | null = null;

export const defaultMissionRecords: MissionRecords = {
  timedBest: 0,
  endlessBest: 0,
  highestAltitudeKm: 0,
  bestResearchChain: 0,
  totalMissionsCompleted: 0,
  fastestLogoCompletionMs: 0,
  mostLogosCompleted: 0,
  totalLogoComponentsCollected: 0,
  highestSignalBoostScore: 0,
  highestSectorReached: 0,
  highestCycleReached: 0,
  mostSectorsCompletedInRun: 0,
  fastestSectorCompletionMs: 0,
  totalSectorsCompleted: 0,
  totalSignalsRestored: 0,
  bestFiveSectorRunScore: 0,
};

export const defaultMissionPreferences: MissionPreferences = {
  audioEnabled: false,
  reducedEffects: false,
  launchSequenceSeen: false,
  lastMode: "timed",
  performanceQuality: "standard",
  onboardingComplete: false,
  assemblyTutorialComplete: false,
  discoveredEntities: [],
};

export const defaultMissionStorage: MissionStorageSchema = {
  version: MISSION_STORAGE_VERSION,
  records: defaultMissionRecords,
  preferences: defaultMissionPreferences,
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function num(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function parseRecords(records: Record<string, unknown>): MissionRecords {
  return {
    timedBest: num(records.timedBest),
    endlessBest: num(records.endlessBest),
    highestAltitudeKm: num(records.highestAltitudeKm),
    bestResearchChain: num(records.bestResearchChain),
    totalMissionsCompleted: num(records.totalMissionsCompleted),
    fastestLogoCompletionMs: num(records.fastestLogoCompletionMs),
    mostLogosCompleted: num(records.mostLogosCompleted),
    totalLogoComponentsCollected: num(records.totalLogoComponentsCollected),
    highestSignalBoostScore: num(records.highestSignalBoostScore),
    highestSectorReached: num(records.highestSectorReached),
    highestCycleReached: num(records.highestCycleReached),
    mostSectorsCompletedInRun: num(records.mostSectorsCompletedInRun),
    fastestSectorCompletionMs: num(records.fastestSectorCompletionMs),
    totalSectorsCompleted: num(records.totalSectorsCompleted),
    totalSignalsRestored: num(records.totalSignalsRestored),
    bestFiveSectorRunScore: num(records.bestFiveSectorRunScore),
  };
}

function parsePreferences(preferences: Record<string, unknown>): MissionPreferences {
  return {
    audioEnabled: preferences.audioEnabled === true,
    reducedEffects: preferences.reducedEffects === true,
    launchSequenceSeen: preferences.launchSequenceSeen === true,
    lastMode: preferences.lastMode === "endless" ? "endless" : "timed",
    performanceQuality:
      preferences.performanceQuality === "high" || preferences.performanceQuality === "reduced"
        ? preferences.performanceQuality
        : "standard",
    onboardingComplete: preferences.onboardingComplete === true,
    assemblyTutorialComplete: preferences.assemblyTutorialComplete === true,
    discoveredEntities: Array.isArray(preferences.discoveredEntities)
      ? preferences.discoveredEntities.filter((e): e is string => typeof e === "string")
      : [],
  };
}

export function parseMissionStorage(raw: string | null): MissionStorageSchema {
  if (!raw) {
    return {
      ...defaultMissionStorage,
      records: { ...defaultMissionRecords },
      preferences: { ...defaultMissionPreferences },
    };
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isObject(parsed) || (parsed.version !== 1 && parsed.version !== 2 && parsed.version !== 3)) {
      return {
        ...defaultMissionStorage,
        records: { ...defaultMissionRecords },
        preferences: { ...defaultMissionPreferences },
      };
    }
    const records = isObject(parsed.records) ? parseRecords(parsed.records) : defaultMissionRecords;
    const preferences = isObject(parsed.preferences)
      ? parsePreferences(parsed.preferences)
      : defaultMissionPreferences;
    return {
      version: MISSION_STORAGE_VERSION,
      records,
      preferences,
    };
  } catch {
    return {
      ...defaultMissionStorage,
      records: { ...defaultMissionRecords },
      preferences: { ...defaultMissionPreferences },
    };
  }
}

export function serializeMissionStorage(data: MissionStorageSchema): string {
  return JSON.stringify({ ...data, version: MISSION_STORAGE_VERSION });
}

/** Resolves the localStorage key — localhost uses a dedicated namespace. */
export function resolveMissionStorageKey(hostname?: string): string {
  if (isLocalDevHost(hostname)) {
    return `${MISSION_STORAGE_KEY}${LOCAL_MISSION_STORAGE_SUFFIX}`;
  }
  return MISSION_STORAGE_KEY;
}

function readRawMissionStorage(key: string): string | null {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage.getItem(key);
  } catch {
    return memoryFallback ? serializeMissionStorage(memoryFallback) : null;
  }
}

function writeRawMissionStorage(key: string, serialized: string, data: MissionStorageSchema): void {
  memoryFallback = data;

  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(key, serialized);
  } catch {
    // Keep in-memory copy for this session when persistence is blocked.
  }
}

export function readMissionStorage(): MissionStorageSchema {
  if (typeof window === "undefined") {
    return {
      ...defaultMissionStorage,
      records: { ...defaultMissionRecords },
      preferences: { ...defaultMissionPreferences },
    };
  }

  const key = resolveMissionStorageKey();
  return parseMissionStorage(readRawMissionStorage(key));
}

export function writeMissionStorage(data: MissionStorageSchema): void {
  if (typeof window === "undefined") return;

  const key = resolveMissionStorageKey();
  writeRawMissionStorage(key, serializeMissionStorage(data), data);
}

export function updateMissionRecords(
  current: MissionStorageSchema,
  patch: Partial<MissionRecords>,
): MissionStorageSchema {
  return { ...current, records: { ...current.records, ...patch } };
}

export function updateMissionPreferences(
  current: MissionStorageSchema,
  patch: Partial<MissionPreferences>,
): MissionStorageSchema {
  return { ...current, preferences: { ...current.preferences, ...patch } };
}

export function getPersonalBest(records: MissionRecords, mode: "timed" | "endless"): number {
  return mode === "timed" ? records.timedBest : records.endlessBest;
}

export function applyDebriefToStorage(
  storage: MissionStorageSchema,
  mode: "timed" | "endless",
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
): { storage: MissionStorageSchema; isPersonalBest: boolean } {
  const bestKey = mode === "timed" ? "timedBest" : "endlessBest";
  const previousBest = storage.records[bestKey];
  const isPersonalBest = debrief.finalScore > previousBest;

  const fastestLogo =
    debrief.logoCompletionTimeMs && debrief.logoCompletionTimeMs > 0
      ? storage.records.fastestLogoCompletionMs === 0
        ? debrief.logoCompletionTimeMs
        : Math.min(storage.records.fastestLogoCompletionMs, debrief.logoCompletionTimeMs)
      : storage.records.fastestLogoCompletionMs;

  const fastestSector =
    debrief.fastestSectorCompletionMs && debrief.fastestSectorCompletionMs > 0
      ? storage.records.fastestSectorCompletionMs === 0
        ? debrief.fastestSectorCompletionMs
        : Math.min(storage.records.fastestSectorCompletionMs, debrief.fastestSectorCompletionMs)
      : storage.records.fastestSectorCompletionMs;

  const patch: Partial<MissionRecords> = {
    [bestKey]: Math.max(previousBest, debrief.finalScore),
    highestAltitudeKm: Math.max(storage.records.highestAltitudeKm, debrief.altitudeKm),
    bestResearchChain: Math.max(storage.records.bestResearchChain, debrief.bestChain),
    totalMissionsCompleted: storage.records.totalMissionsCompleted + 1,
    mostLogosCompleted: Math.max(storage.records.mostLogosCompleted, debrief.logosCompleted ?? 0),
    totalLogoComponentsCollected:
      storage.records.totalLogoComponentsCollected + (debrief.logoComponentsCollected ?? 0),
    highestSignalBoostScore: Math.max(
      storage.records.highestSignalBoostScore,
      debrief.signalBoostPeakScore ?? 0,
    ),
    fastestLogoCompletionMs: fastestLogo,
    highestSectorReached: Math.max(
      storage.records.highestSectorReached,
      debrief.highestSectorReached ?? 0,
    ),
    highestCycleReached: Math.max(
      storage.records.highestCycleReached,
      debrief.highestCycleReached ?? 0,
    ),
    mostSectorsCompletedInRun: Math.max(
      storage.records.mostSectorsCompletedInRun,
      debrief.sectorsCompleted ?? 0,
    ),
    fastestSectorCompletionMs: fastestSector,
    totalSectorsCompleted:
      storage.records.totalSectorsCompleted + (debrief.sectorsCompleted ?? 0),
    totalSignalsRestored:
      storage.records.totalSignalsRestored + (debrief.sectorsCompleted ?? 0),
  };

  if (mode === "timed" && debrief.sectorsCompleted === 5) {
    patch.bestFiveSectorRunScore = Math.max(
      storage.records.bestFiveSectorRunScore,
      debrief.finalScore,
    );
  }

  const next = updateMissionRecords(storage, patch);
  return { storage: next, isPersonalBest };
}
