export type EventStatus =
  | "upcoming"
  | "live"
  | "recently-ended"
  | "schedule-pending"
  | "new-episode"
  | "listen-now";

export type ScheduledEvent = {
  showId: string;
  showName: string;
  tagline: string;
  status: EventStatus;
  startDate: Date;
  endDate?: Date;
  timezone: string;
  platform: string;
  xUrl?: string;
  spotifyUrl?: string;
  appleUrl?: string;
  scheduleConfirmed: boolean;
};

export type CountdownParts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
};

export type FormattedEventTime = {
  sourceDay: string;
  sourceDate: string;
  sourceTime: string;
  localDay?: string;
  localDate?: string;
  localTime?: string;
  timezoneLabel: string;
};
