import { addDays, format, parseISO } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import type { Show } from "@/types/content";
import type { DateScheduleOverride } from "@/lib/schedule/scheduleTypes";
import {
  buildOccurrenceDate,
  getOccurrenceEnd,
  getNextOccurrence as getBaseNextOccurrence,
} from "@/lib/schedule/getNextOccurrence";

function overrideKey(showId: string, date: string): string {
  return `${showId}:${date}`;
}

export function indexDateOverrides(
  overrides: DateScheduleOverride[],
): Map<string, DateScheduleOverride> {
  return new Map(overrides.map((entry) => [overrideKey(entry.showId, entry.date), entry]));
}

function zonedDateKey(date: Date, timezone: string): string {
  return format(toZonedTime(date, timezone), "yyyy-MM-dd");
}

export function applyDateOverrideToStart(
  show: Show,
  start: Date,
  override?: DateScheduleOverride,
): Date | null {
  if (!override) {
    return start;
  }

  if (override.cancelled) {
    return null;
  }

  if (!override.startTime) {
    return start;
  }

  const dateKey = zonedDateKey(start, show.timezone);
  return buildOccurrenceDate(show, parseISO(`${dateKey}T12:00:00`), 0, override.startTime);
}

export function getNextOccurrenceWithOverrides(
  show: Show,
  overrides: DateScheduleOverride[],
  now = new Date(),
): Date | null {
  const overrideMap = indexDateOverrides(overrides);
  let cursor = now;

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const candidate = getBaseNextOccurrence(show, cursor);
    if (!candidate) {
      return null;
    }

    const dateKey = zonedDateKey(candidate, show.timezone);
    const override = overrideMap.get(overrideKey(show.id, dateKey));
    const resolved = applyDateOverrideToStart(show, candidate, override);

    if (resolved && resolved > now) {
      return resolved;
    }

    cursor = addDays(candidate, 1);
  }

  return getBaseNextOccurrence(show, now);
}

export function getOccurrenceOnDate(
  show: Show,
  dateKey: string,
  overrides: DateScheduleOverride[],
): { start: Date; end: Date; cancelled: boolean } | null {
  if (!show.startTime || !show.scheduleConfirmed) {
    return null;
  }

  const override = indexDateOverrides(overrides).get(overrideKey(show.id, dateKey));
  if (override?.cancelled) {
    return {
      start: parseISO(`${dateKey}T12:00:00`),
      end: parseISO(`${dateKey}T12:00:00`),
      cancelled: true,
    };
  }

  const localAnchor = parseISO(`${dateKey}T12:00:00`);
  const zoned = toZonedTime(localAnchor, show.timezone);
  if (zoned.getDay() !== show.dayOfWeek) {
    return null;
  }

  const baseStart = buildOccurrenceDate(show, localAnchor, 0);
  if (!baseStart) {
    return null;
  }

  const start = applyDateOverrideToStart(show, baseStart, override) ?? baseStart;
  return {
    start,
    end: getOccurrenceEnd(start, show.durationMinutes),
    cancelled: false,
  };
}
