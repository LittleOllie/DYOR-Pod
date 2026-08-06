import { spaceRecordings as staticSpaceRecordings, type SpaceRecording } from "@/content/spacesLibrary";
import { isKvConfigured } from "@/lib/admin/config";
import { kv } from "@/lib/library/redis";

const LIBRARY_KEY = "library:recordings";

export async function readRecordingsFromKv(): Promise<SpaceRecording[] | null> {
  if (!isKvConfigured()) {
    return null;
  }

  try {
    const data = await kv.get<SpaceRecording[]>(LIBRARY_KEY);
    return data ?? [];
  } catch {
    return null;
  }
}

export async function writeRecordingsToKv(recordings: SpaceRecording[]): Promise<void> {
  await kv.set(LIBRARY_KEY, recordings);
}

/** Seed Redis from static content the first time the store is empty. */
export async function ensureKvLibrarySeeded(): Promise<SpaceRecording[]> {
  const existing = await readRecordingsFromKv();
  if (existing === null) {
    return staticSpaceRecordings;
  }

  if (existing.length === 0) {
    await writeRecordingsToKv(staticSpaceRecordings);
    return staticSpaceRecordings;
  }

  return existing;
}
