import type { Show } from "@/types/content";

export type RecurringSchedulePatch = {
  dayOfWeek?: number;
  startTime?: string;
  scheduleConfirmed?: boolean;
  durationMinutes?: number;
};

export type DateScheduleOverride = {
  showId: string;
  /** YYYY-MM-DD in the show's local calendar */
  date: string;
  startTime?: string | null;
  cancelled?: boolean;
};

export type ScheduleConfig = {
  recurring: Record<string, RecurringSchedulePatch>;
  dateOverrides: DateScheduleOverride[];
};

export type UpcomingScheduleEvent = {
  showId: string;
  name: string;
  platform: Show["platform"];
  start: string;
  end: string;
  xUrl?: string;
};
