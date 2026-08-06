import { formatInTimeZone } from "date-fns-tz";
import {
  formatEventTime,
  getCountdownParts,
  getTimezoneAbbreviation,
} from "@/lib/schedule/formatEventTime";

/** Human-friendly mobile timing copy for next-event cards. */
export function formatMobileEventTiming(
  target: Date,
  sourceTimezone: string,
  now = new Date(),
): string {
  const totalMs = target.getTime() - now.getTime();

  if (totalMs <= 0) {
    return "Starting soon";
  }

  const oneHour = 60 * 60 * 1000;
  const oneDay = 24 * oneHour;

  if (totalMs >= oneDay) {
    const formatted = formatEventTime(target, sourceTimezone);
    const time = formatInTimeZone(target, sourceTimezone, "h:mm a");
    const tz = getTimezoneAbbreviation(sourceTimezone);
    return `${formatted.sourceDay} at ${time} ${tz}`;
  }

  const parts = getCountdownParts(target, now);

  if (totalMs < oneHour) {
    const minutes = Math.max(1, parts.minutes);
    return `Starts in ${minutes} minute${minutes === 1 ? "" : "s"}`;
  }

  if (parts.hours > 0 && parts.minutes > 0) {
    return `Starts in ${parts.hours}h ${parts.minutes}m`;
  }

  if (parts.hours > 0) {
    return `Starts in ${parts.hours}h`;
  }

  return `Starts in ${parts.minutes}m`;
}
