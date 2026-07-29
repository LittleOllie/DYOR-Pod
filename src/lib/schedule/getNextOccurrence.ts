import { addDays, parseISO, setHours, setMinutes, setSeconds } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import type { Show } from "@/types/content";

/**
 * Parse "HH:mm" into hours and minutes.
 */
function parseTime(time: string): { hours: number; minutes: number } {
  const [h, m] = time.split(":").map(Number);
  return { hours: h, minutes: m };
}

/**
 * Build a UTC Date for a show occurrence on a given calendar date in the show timezone.
 */
export function buildOccurrenceDate(
  show: Show,
  referenceDate: Date,
  dayOffset = 0,
): Date | null {
  if (!show.startTime || !show.scheduleConfirmed) return null;

  const zonedRef = toZonedTime(referenceDate, show.timezone);
  const targetDay = addDays(zonedRef, dayOffset);
  const { hours, minutes } = parseTime(show.startTime);

  const zonedStart = setSeconds(
    setMinutes(setHours(targetDay, hours), minutes),
    0,
  );

  return fromZonedTime(zonedStart, show.timezone);
}

/**
 * Find the next occurrence of a recurring weekly show from a reference point.
 */
export function getNextOccurrence(show: Show, now = new Date()): Date | null {
  if (!show.isActive || !show.startTime || !show.scheduleConfirmed) {
    return null;
  }

  const zonedNow = toZonedTime(now, show.timezone);
  const currentDay = zonedNow.getDay();
  let daysUntil = (show.dayOfWeek - currentDay + 7) % 7;

  const candidate = buildOccurrenceDate(show, now, daysUntil);
  if (!candidate) return null;

  if (candidate <= now && daysUntil === 0) {
    daysUntil = 7;
    return buildOccurrenceDate(show, now, daysUntil);
  }

  if (candidate <= now) {
    daysUntil += 7;
    return buildOccurrenceDate(show, now, daysUntil);
  }

  return candidate;
}

/**
 * Find the most recent occurrence (may be in the past).
 */
export function getPreviousOccurrence(show: Show, now = new Date()): Date | null {
  const next = getNextOccurrence(show, now);
  if (!next) return null;
  return addDays(next, -7);
}

/**
 * Get end date for an occurrence based on duration.
 */
export function getOccurrenceEnd(start: Date, durationMinutes?: number): Date {
  if (!durationMinutes) {
    return new Date(start.getTime() + 90 * 60 * 1000);
  }
  return new Date(start.getTime() + durationMinutes * 60 * 1000);
}

/**
 * Among active X Space shows with confirmed times, find the next upcoming or live event.
 */
export function getNextScheduledSpace(
  shows: Show[],
  now = new Date(),
): { show: Show; start: Date; end: Date } | null {
  const spaces = shows.filter(
    (s) => s.isActive && s.platform === "x" && s.scheduleConfirmed && s.startTime,
  );

  let best: { show: Show; start: Date; end: Date; score: number } | null = null;

  for (const show of spaces) {
    const start = getNextOccurrence(show, now);
    if (!start) continue;

    const end = getOccurrenceEnd(start, show.durationMinutes);
    const prevStart = addDays(start, -7);
    const prevEnd = getOccurrenceEnd(prevStart, show.durationMinutes);

    let candidateStart = start;
    let candidateEnd = end;

    // If currently live from previous week's occurrence
    if (now >= prevStart && now < prevEnd) {
      candidateStart = prevStart;
      candidateEnd = prevEnd;
    } else if (now >= start && now < end) {
      candidateStart = start;
      candidateEnd = end;
    }

    const isLive = now >= candidateStart && now < candidateEnd;
    const score = isLive ? 0 : candidateStart.getTime();

    if (!best || score < best.score) {
      best = { show, start: candidateStart, end: candidateEnd, score };
    }
  }

  if (!best) return null;
  return { show: best.show, start: best.start, end: best.end };
}

/**
 * Get the best show for hero/next-event when no confirmed space is imminent.
 * Prefers live override, then live spaces, then next upcoming space.
 */
export function getFeaturedEvent(
  shows: Show[],
  now = new Date(),
): { show: Show; start?: Date; end?: Date } | null {
  const liveOverride = shows.find((s) => s.isActive && s.liveOverride);
  if (liveOverride) {
    const start = getNextOccurrence(liveOverride, now) ?? undefined;
    const end = start
      ? getOccurrenceEnd(start, liveOverride.durationMinutes)
      : undefined;
    return { show: liveOverride, start, end };
  }

  const nextSpace = getNextScheduledSpace(shows, now);
  if (nextSpace) return nextSpace;

  // Fall back to first pending-schedule X show for honest messaging
  const pending = shows.find(
    (s) => s.isActive && s.platform === "x" && !s.scheduleConfirmed,
  );
  if (pending) return { show: pending };

  return null;
}

export { parseISO };
