import type { Show } from "@/types/content";
import type { EventStatus } from "./types";
import {
  getNextOccurrence,
  getOccurrenceEnd,
  getPreviousOccurrence,
} from "./getNextOccurrence";

const RECENTLY_ENDED_MS = 30 * 60 * 1000;

export function getEventStatus(show: Show, now = new Date()): EventStatus {
  if (!show.isActive) return "schedule-pending";

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

  const nextStart = getNextOccurrence(show, now);
  const prevStart = getPreviousOccurrence(show, now);

  if (nextStart) {
    const nextEnd = getOccurrenceEnd(nextStart, show.durationMinutes);
    if (now >= nextStart && now < nextEnd) {
      return "live";
    }
  }

  if (prevStart) {
    const prevEnd = getOccurrenceEnd(prevStart, show.durationMinutes);
    if (now >= prevStart && now < prevEnd) {
      return "live";
    }
    if (now >= prevEnd && now.getTime() - prevEnd.getTime() < RECENTLY_ENDED_MS) {
      return "recently-ended";
    }
  }

  // Wednesday podcast gets "new episode" on release day
  if (show.id === "dyor-podcast" && now.getDay() === show.dayOfWeek) {
    return "new-episode";
  }

  return "upcoming";
}

export function isShowLive(show: Show, now = new Date()): boolean {
  return getEventStatus(show, now) === "live";
}
