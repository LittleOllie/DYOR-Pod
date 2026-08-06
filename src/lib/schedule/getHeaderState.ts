import { shows as staticShows } from "@/content/shows";
import { site } from "@/content/site";
import { getEventStatus } from "@/lib/schedule/getEventStatus";
import { getOccurrenceEnd } from "@/lib/schedule/getNextOccurrence";
import { getNextOccurrenceWithOverrides } from "@/lib/schedule/scheduleOverrides";
import {
  fetchEffectiveShows,
  fetchScheduleConfigForAdmin,
  readScheduleConfig,
} from "@/lib/schedule/scheduleStorage";
import type { DateScheduleOverride } from "@/lib/schedule/scheduleTypes";
import type { Show } from "@/types/content";

function getNextScheduledSpaceWithOverrides(
  shows: Show[],
  overrides: DateScheduleOverride[],
  now = new Date(),
): { show: Show; start: Date; end: Date } | null {
  const spaces = shows.filter(
    (show) => show.isActive && show.platform === "x" && show.scheduleConfirmed && show.startTime,
  );

  let best: { show: Show; start: Date; end: Date; score: number } | null = null;

  for (const show of spaces) {
    const start = getNextOccurrenceWithOverrides(show, overrides, now);
    if (!start) continue;

    const end = getOccurrenceEnd(start, show.durationMinutes);
    const isLive = now >= start && now < end;
    const score = isLive ? 0 : start.getTime();

    if (!best || score < best.score) {
      best = { show, start, end, score };
    }
  }

  return best ? { show: best.show, start: best.start, end: best.end } : null;
}

function getFeaturedEventWithOverrides(
  shows: Show[],
  overrides: DateScheduleOverride[],
  now = new Date(),
): { show: Show; start?: Date; end?: Date } | null {
  const liveOverride = shows.find((show) => show.isActive && show.liveOverride);
  if (liveOverride) {
    const start = getNextOccurrenceWithOverrides(liveOverride, overrides, now) ?? undefined;
    const end = start ? getOccurrenceEnd(start, liveOverride.durationMinutes) : undefined;
    return { show: liveOverride, start, end };
  }

  const nextSpace = getNextScheduledSpaceWithOverrides(shows, overrides, now);
  if (nextSpace) return nextSpace;

  const pending = shows.find((show) => show.isActive && show.platform === "x" && !show.scheduleConfirmed);
  if (pending) return { show: pending };

  return null;
}

export function getHeaderStateForShows(
  shows: Show[],
  overrides: DateScheduleOverride[] = [],
  now = new Date(),
): {
  isLive: boolean;
  ctaHref: string;
  featuredShow: Show;
  startDate?: string;
} {
  const featured = getFeaturedEventWithOverrides(shows, overrides, now);
  const nextSpace = getNextScheduledSpaceWithOverrides(shows, overrides, now);

  const isLive =
    shows.some((show) => getEventStatus(show, now) === "live") ||
    Boolean(featured?.show.liveOverride);

  const featuredShow = featured?.show ?? shows[0];
  const startDate = featured?.start?.toISOString() ?? nextSpace?.start.toISOString();

  let ctaHref = "/#schedule";
  if (isLive) {
    const liveShow = shows.find((show) => getEventStatus(show, now) === "live");
    ctaHref = liveShow?.xUrl ?? site.social.x ?? "/#schedule";
  } else if (nextSpace) {
    ctaHref = nextSpace.show.xUrl ?? site.social.x ?? "/#schedule";
  }

  return { isLive, ctaHref, featuredShow, startDate };
}

export function getHeaderState(now = new Date()) {
  return getHeaderStateForShows(staticShows, [], now);
}

export async function getHeaderStateAsync(now = new Date()) {
  const config = await readScheduleConfig();
  const shows = await fetchEffectiveShows();
  return getHeaderStateForShows(shows, config?.dateOverrides ?? [], now);
}

export async function getSchedulePageData() {
  const config = await fetchScheduleConfigForAdmin();
  const shows = await fetchEffectiveShows();
  return { shows, config };
}
