import { addDays } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { format } from "date-fns";
import type { Show } from "@/types/content";
import type { DateScheduleOverride } from "@/lib/schedule/scheduleTypes";
import {
  getOccurrenceEnd,
  getNextOccurrence,
} from "@/lib/schedule/getNextOccurrence";
import {
  getNextOccurrenceWithOverrides,
  getOccurrenceOnDate,
} from "@/lib/schedule/scheduleOverrides";
import type { EventStatus } from "@/lib/schedule/types";

const RECENTLY_ENDED_MS = 30 * 60 * 1000;

export type ScheduleResolutionContext = {
  dateOverrides?: DateScheduleOverride[];
  now?: Date;
};

function zonedDateKey(date: Date, timezone: string): string {
  return format(toZonedTime(date, timezone), "yyyy-MM-dd");
}

function getOverrides(ctx?: ScheduleResolutionContext): DateScheduleOverride[] {
  return ctx?.dateOverrides ?? [];
}

function getNow(ctx?: ScheduleResolutionContext): Date {
  return ctx?.now ?? new Date();
}

/** Canonical next occurrence — recurring schedule + Redis patch + date overrides. */
export function getResolvedNextOccurrence(
  show: Show,
  ctx?: ScheduleResolutionContext,
): Date | null {
  const overrides = getOverrides(ctx);
  if (overrides.length === 0) {
    return getNextOccurrence(show, getNow(ctx));
  }
  return getNextOccurrenceWithOverrides(show, overrides, getNow(ctx));
}

/** Previous weekly occurrence with date overrides applied. */
export function getResolvedPreviousOccurrence(
  show: Show,
  ctx?: ScheduleResolutionContext,
): Date | null {
  const next = getResolvedNextOccurrence(show, ctx);
  if (!next) {
    return null;
  }

  const overrides = getOverrides(ctx);
  const prevCandidate = addDays(next, -7);
  const dateKey = zonedDateKey(prevCandidate, show.timezone);
  const occurrence = getOccurrenceOnDate(show, dateKey, overrides);

  if (occurrence && !occurrence.cancelled) {
    return occurrence.start;
  }

  return prevCandidate;
}

/** Active live window for a show, checking both current and previous week. */
export function getResolvedActiveOccurrence(
  show: Show,
  ctx?: ScheduleResolutionContext,
): { start: Date; end: Date } | null {
  const now = getNow(ctx);

  if (!show.isActive || !show.scheduleConfirmed || !show.startTime) {
    return null;
  }

  const nextStart = getResolvedNextOccurrence(show, ctx);
  if (!nextStart) {
    return null;
  }

  const nextEnd = getOccurrenceEnd(nextStart, show.durationMinutes);
  const prevStart = getResolvedPreviousOccurrence(show, ctx);
  const prevEnd = prevStart
    ? getOccurrenceEnd(prevStart, show.durationMinutes)
    : null;

  if (prevStart && prevEnd && now >= prevStart && now < prevEnd) {
    return { start: prevStart, end: prevEnd };
  }

  if (now >= nextStart && now < nextEnd) {
    return { start: nextStart, end: nextEnd };
  }

  return null;
}

/** Canonical event status — single source for hero, schedule rows, and reminders. */
export function getResolvedEventStatus(
  show: Show,
  ctx?: ScheduleResolutionContext,
): EventStatus {
  const now = getNow(ctx);

  if (!show.isActive) {
    return "schedule-pending";
  }

  if (show.liveOverride && show.platform === "x") {
    return "live";
  }

  if (!show.scheduleConfirmed) {
    return "schedule-pending";
  }

  if (show.platform === "spotify" || show.platform === "apple") {
    return "listen-now";
  }

  if (!show.startTime) {
    return "schedule-pending";
  }

  const active = getResolvedActiveOccurrence(show, ctx);
  if (active) {
    return "live";
  }

  const prevStart = getResolvedPreviousOccurrence(show, ctx);
  if (prevStart) {
    const prevEnd = getOccurrenceEnd(prevStart, show.durationMinutes);
    if (now >= prevEnd && now.getTime() - prevEnd.getTime() < RECENTLY_ENDED_MS) {
      return "recently-ended";
    }
  }

  if (show.id === "dyor-podcast" && now.getDay() === show.dayOfWeek) {
    return "new-episode";
  }

  return "upcoming";
}

/** Milliseconds until the next status transition for rollover scheduling. */
export function getNextStatusTransitionMs(
  show: Show,
  ctx?: ScheduleResolutionContext,
): number | null {
  const now = getNow(ctx);
  const status = getResolvedEventStatus(show, ctx);

  if (status === "schedule-pending" || status === "listen-now" || status === "new-episode") {
    return null;
  }

  if (show.liveOverride) {
    return null;
  }

  const active = getResolvedActiveOccurrence(show, ctx);
  if (active) {
    return Math.max(0, active.end.getTime() - now.getTime());
  }

  if (status === "recently-ended") {
    const prevStart = getResolvedPreviousOccurrence(show, ctx);
    if (!prevStart) {
      return null;
    }
    const prevEnd = getOccurrenceEnd(prevStart, show.durationMinutes);
    const recentlyEndsAt = prevEnd.getTime() + RECENTLY_ENDED_MS;
    return Math.max(0, recentlyEndsAt - now.getTime());
  }

  if (status === "upcoming") {
    const nextStart = getResolvedNextOccurrence(show, ctx);
    if (!nextStart) {
      return null;
    }
    return Math.max(0, nextStart.getTime() - now.getTime());
  }

  return null;
}
