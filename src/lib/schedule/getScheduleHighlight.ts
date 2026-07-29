import { shows } from "@/content/shows";
import { getEventStatus } from "@/lib/schedule/getEventStatus";
import { getNextScheduledSpace } from "@/lib/schedule/getNextOccurrence";
import type { Show } from "@/types/content";

export function getHighlightedShowId(now = new Date()): string | null {
  const live = shows.find((s) => s.isActive && getEventStatus(s, now) === "live");
  if (live) return live.id;

  const nextSpace = getNextScheduledSpace(shows, now);
  if (nextSpace) return nextSpace.show.id;

  return null;
}

export function isShowHighlighted(show: Show, now = new Date()): boolean {
  return show.id === getHighlightedShowId(now);
}
