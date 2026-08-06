import { randomUUID } from "node:crypto";
import { z } from "zod";
import {
  getLibraryCategoriesFromRecordings,
  libraryShowIds,
  spaceRecordings as staticSpaceRecordings,
  type LibraryShowId,
  type SpaceRecording,
} from "@/content/spacesLibrary";
import { isKvConfigured } from "@/lib/admin/config";
import {
  ensureKvLibrarySeeded,
  readRecordingsFromKv,
  writeRecordingsToKv,
} from "@/lib/library/kvRecordings";
import { lookupXRecordingMetadata } from "@/lib/library/xMetadata";

const libraryShowIdSchema = z.enum(libraryShowIds);

export const xSpaceUrlSchema = z
  .string()
  .trim()
  .url("Enter a valid URL.")
  .refine((value) => {
    try {
      const url = new URL(value);
      const host = url.hostname.replace(/^www\./, "");
      const isXHost = host === "x.com" || host === "twitter.com";
      const isSpaceLink =
        url.pathname.includes("/status/") || url.pathname.includes("/spaces/");
      return isXHost && isSpaceLink;
    } catch {
      return false;
    }
  }, "URL must be an X post or Space link from x.com.");

export const addRecordingSchema = z.object({
  showId: libraryShowIdSchema,
  xUrl: xSpaceUrlSchema,
  title: z.string().trim().min(3).max(200).optional(),
  airedAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD.")
    .optional(),
  duration: z
    .string()
    .trim()
    .regex(/^\d{1,2}:\d{2}(:\d{2})?$/, "Use H:MM:SS or MM:SS.")
    .optional(),
});

function normalizeXUrl(url: string): string {
  const parsed = new URL(url.trim());
  parsed.search = "";
  parsed.hash = "";
  return parsed.toString().replace(/\/$/, "");
}

function sortRecordings(recordings: SpaceRecording[]): SpaceRecording[] {
  return [...recordings].sort((a, b) => b.airedAt.localeCompare(a.airedAt));
}

export async function fetchSpaceRecordings(): Promise<SpaceRecording[]> {
  if (!isKvConfigured()) {
    return staticSpaceRecordings;
  }

  try {
    const recordings = await ensureKvLibrarySeeded();
    return sortRecordings(recordings);
  } catch {
    return staticSpaceRecordings;
  }
}

export async function getLibraryCategoriesForPage() {
  const recordings = await fetchSpaceRecordings();
  return getLibraryCategoriesFromRecordings(recordings);
}

async function loadWritableRecordings(): Promise<SpaceRecording[]> {
  if (!isKvConfigured()) {
    throw new Error("Library storage is not configured.");
  }

  return sortRecordings(await ensureKvLibrarySeeded());
}

export async function fetchAdminRecordings(): Promise<SpaceRecording[]> {
  return loadWritableRecordings();
}

function getNextEpisodeNumber(
  recordings: SpaceRecording[],
  showId: LibraryShowId,
): number {
  const maxEpisode = recordings
    .filter((recording) => recording.showId === showId)
    .reduce((max, recording) => Math.max(max, recording.episode), 0);

  return maxEpisode + 1;
}

function defaultTitleForShow(showId: LibraryShowId, episode: number): string {
  if (showId === "dyor-sunday") {
    return episode === 1
      ? "DYOR Sunday • Weekly Crypto, Blockchain & NFT News"
      : "DYOR Sunday • Crypto & NFT News!";
  }

  if (showId === "will-work-for-crypto") {
    return episode === 1
      ? "Will Work for Crypto — Live Market & Chart Analysis"
      : `Will Work for Crypto #${episode} — Live Market & Chart Analysis`;
  }

  return "No FUD Friday — Live Crypto & NFT News";
}

export async function addSpaceRecording(input: z.infer<typeof addRecordingSchema>) {
  const parsed = addRecordingSchema.parse(input);
  const recordings = await loadWritableRecordings();
  const episode = getNextEpisodeNumber(recordings, parsed.showId);
  const xUrl = normalizeXUrl(parsed.xUrl);

  if (recordings.some((recording) => normalizeXUrl(recording.xUrl) === xUrl)) {
    throw new Error("That X link is already in the library.");
  }

  let airedAt = parsed.airedAt;
  let duration = parsed.duration;
  let title = parsed.title;

  if (!airedAt || !duration) {
    try {
      const metadata = await lookupXRecordingMetadata(xUrl);
      airedAt = airedAt ?? metadata.airedAt;
      duration = duration ?? metadata.duration;
      title = title ?? metadata.title;
    } catch {
      // Manual fields still work if lookup fails.
    }
  }

  const resolvedAiredAt = airedAt ?? new Date().toISOString().slice(0, 10);
  const resolvedTitle = title ?? defaultTitleForShow(parsed.showId, episode);
  const recording: SpaceRecording = {
    id: randomUUID(),
    showId: parsed.showId,
    episode,
    title: resolvedTitle,
    airedAt: resolvedAiredAt,
    duration,
    xUrl,
  };

  await writeRecordingsToKv(sortRecordings([recording, ...recordings]));
  return recording;
}

export async function deleteSpaceRecording(id: string) {
  const recordings = await loadWritableRecordings();
  const nextRecordings = recordings.filter((recording) => recording.id !== id);

  if (nextRecordings.length === recordings.length) {
    throw new Error("Recording not found.");
  }

  await writeRecordingsToKv(nextRecordings);
}
