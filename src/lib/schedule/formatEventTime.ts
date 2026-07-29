import { format } from "date-fns";
import { formatInTimeZone, toZonedTime } from "date-fns-tz";
import type { Show } from "@/types/content";
import type { CountdownParts, FormattedEventTime } from "./types";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function getTimezoneAbbreviation(timezone: string): string {
  if (timezone === "America/New_York") return "ET";
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      timeZoneName: "short",
    }).formatToParts(new Date());
    return parts.find((p) => p.type === "timeZoneName")?.value ?? timezone;
  } catch {
    return timezone;
  }
}

export function getVisitorTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "UTC";
  }
}

export function formatEventTime(
  date: Date,
  sourceTimezone: string,
  visitorTimezone?: string,
): FormattedEventTime {
  const tzLabel = getTimezoneAbbreviation(sourceTimezone);
  const localTz = visitorTimezone ?? getVisitorTimezone();

  return {
    sourceDay: formatInTimeZone(date, sourceTimezone, "EEEE"),
    sourceDate: formatInTimeZone(date, sourceTimezone, "MMMM d"),
    sourceTime: `${formatInTimeZone(date, sourceTimezone, "h:mm a")} ${tzLabel}`,
    localDay: formatInTimeZone(date, localTz, "EEEE"),
    localDate: formatInTimeZone(date, localTz, "MMMM d"),
    localTime: formatInTimeZone(date, localTz, "h:mm a"),
    timezoneLabel: tzLabel,
  };
}

export function formatDayOfWeek(dayOfWeek: number): string {
  return DAY_NAMES[dayOfWeek] ?? "Unknown";
}

export function formatShowSchedule(show: Show): string {
  const day = formatDayOfWeek(show.dayOfWeek);
  if (!show.scheduleConfirmed || !show.startTime) {
    return `${day}s on ${show.platform === "x" ? "X" : show.platform === "spotify" ? "Spotify" : "Apple Podcasts"}`;
  }
  const tzLabel = getTimezoneAbbreviation(show.timezone);
  const [hours, minutes] = show.startTime.split(":").map(Number);
  const ref = toZonedTime(new Date(), show.timezone);
  ref.setHours(hours, minutes, 0, 0);
  return `${day}, ${format(ref, "h:mm a")} ${tzLabel}`;
}

export function getCountdownParts(target: Date, now = new Date()): CountdownParts {
  const totalMs = Math.max(0, target.getTime() - now.getTime());
  const totalSeconds = Math.floor(totalMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds, totalMs };
}

export function formatCountdownDisplay(parts: CountdownParts): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(parts.days)} DAYS · ${pad(parts.hours)} HOURS · ${pad(parts.minutes)} MINUTES`;
}

export function formatCountdownAccessible(parts: CountdownParts): string {
  const segments: string[] = [];
  if (parts.days > 0) segments.push(`${parts.days} day${parts.days !== 1 ? "s" : ""}`);
  if (parts.hours > 0) segments.push(`${parts.hours} hour${parts.hours !== 1 ? "s" : ""}`);
  if (parts.minutes > 0)
    segments.push(`${parts.minutes} minute${parts.minutes !== 1 ? "s" : ""}`);
  if (segments.length === 0) return "Less than a minute remaining";
  return `${segments.join(", ")} remaining`;
}
