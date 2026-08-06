import { addDays, format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import type { Show } from "@/types/content";
import type { DateScheduleOverride, UpcomingScheduleEvent } from "@/lib/schedule/scheduleTypes";
import { getOccurrenceEnd } from "@/lib/schedule/getNextOccurrence";
import {
  getNextOccurrenceWithOverrides,
  getOccurrenceOnDate,
} from "@/lib/schedule/scheduleOverrides";

export function buildUpcomingEvents(
  shows: Show[],
  overrides: DateScheduleOverride[],
  now = new Date(),
  daysAhead = 14,
): UpcomingScheduleEvent[] {
  const events: UpcomingScheduleEvent[] = [];

  for (const show of shows) {
    if (!show.isActive || show.platform !== "x" || !show.scheduleConfirmed || !show.startTime) {
      continue;
    }

    for (let offset = 0; offset <= daysAhead; offset += 1) {
      const day = addDays(now, offset);
      const dateKey = format(toZonedTime(day, show.timezone), "yyyy-MM-dd");
      const occurrence = getOccurrenceOnDate(show, dateKey, overrides);
      if (!occurrence || occurrence.cancelled) {
        continue;
      }

      if (occurrence.end <= now) {
        continue;
      }

      events.push({
        showId: show.id,
        name: show.name,
        platform: show.platform,
        start: occurrence.start.toISOString(),
        end: occurrence.end.toISOString(),
        xUrl: show.xUrl,
      });
    }
  }

  return events.sort((a, b) => a.start.localeCompare(b.start));
}

export function getFeaturedStartDate(
  show: Show,
  overrides: DateScheduleOverride[],
  now = new Date(),
): Date | undefined {
  return getNextOccurrenceWithOverrides(show, overrides, now) ?? undefined;
}
