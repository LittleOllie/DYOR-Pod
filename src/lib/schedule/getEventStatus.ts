import type { Show } from "@/types/content";
import type { DateScheduleOverride } from "@/lib/schedule/scheduleTypes";
import {
  getResolvedEventStatus,
  type ScheduleResolutionContext,
} from "@/lib/schedule/resolveShowSchedule";
import type { EventStatus } from "./types";

export function getEventStatus(
  show: Show,
  now = new Date(),
  dateOverrides: DateScheduleOverride[] = [],
): EventStatus {
  const ctx: ScheduleResolutionContext = { dateOverrides, now };
  return getResolvedEventStatus(show, ctx);
}

export function isShowLive(
  show: Show,
  now = new Date(),
  dateOverrides: DateScheduleOverride[] = [],
): boolean {
  return getEventStatus(show, now, dateOverrides) === "live";
}
