import { shows } from "@/content/shows";

const knownShowIds = new Set(shows.map((show) => show.id));

export function isKnownShowId(showId: string): boolean {
  return knownShowIds.has(showId);
}

export function knownShowIdSchema(message = "Unknown show.") {
  return (value: string) => isKnownShowId(value) || message;
}
