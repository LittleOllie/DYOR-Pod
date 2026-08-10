import type { UpcomingScheduleEvent } from "@/lib/schedule/scheduleTypes";

export const REMINDER_MINUTES_BEFORE = 15;

export type ReminderPayload = {
  title: string;
  body: string;
  tag: string;
  url: string;
  showId: string;
  showName: string;
  start: string;
};

export function buildReminderPayload(event: UpcomingScheduleEvent): ReminderPayload {
  const tag = `${event.showId}:${event.start}`;
  return {
    title: `${event.name} starts in ${REMINDER_MINUTES_BEFORE} minutes`,
    body: `${event.name} is going live soon on X. Tap to join.`,
    tag,
    url: event.xUrl ?? "/#schedule",
    showId: event.showId,
    showName: event.name,
    start: event.start,
  };
}

export function getReminderWindowStart(startIso: string): Date {
  const start = new Date(startIso);
  return new Date(start.getTime() - REMINDER_MINUTES_BEFORE * 60 * 1000);
}

/** True when `now` is inside the reminder delivery window (15 min before start until start). */
export function isWithinReminderWindow(
  startIso: string,
  now = new Date(),
): boolean {
  const start = new Date(startIso);
  const reminderAt = getReminderWindowStart(startIso);
  return now >= reminderAt && now < start;
}

export function reminderDedupTtlSeconds(startIso: string): number {
  const start = new Date(startIso).getTime();
  const ttlMs = start - Date.now() + 60 * 60 * 1000;
  return Math.max(3600, Math.ceil(ttlMs / 1000));
}
