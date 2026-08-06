import { describe, expect, it } from "vitest";
import { shows } from "@/content/shows";
import { getEventStatus } from "@/lib/schedule/getEventStatus";
import {
  getNextOccurrence,
  getNextScheduledSpace,
} from "@/lib/schedule/getNextOccurrence";
import {
  formatEventTime,
  getCountdownParts,
} from "@/lib/schedule/formatEventTime";
import type { Show } from "@/types/content";

const sundayShow: Show = {
  id: "test-sunday",
  name: "DYOR Sunday",
  shortName: "Sunday",
  tagline: "Test",
  description: "Test",
  identityCue: "briefing",
  dayOfWeek: 0,
  startTime: "16:00",
  timezone: "America/New_York",
  durationMinutes: 90,
  platform: "x",
  image: "/test.webp",
  accent: "teal",
  category: "Test",
  isActive: true,
  displayOrder: 1,
  scheduleConfirmed: true,
};

const pendingShow: Show = {
  ...sundayShow,
  id: "test-pending",
  name: "Will Work for Crypto",
  dayOfWeek: 2,
  startTime: undefined,
  scheduleConfirmed: false,
};

describe("getNextOccurrence", () => {
  it("returns event later today", () => {
    // Sunday Jan 5 2025 10:00 ET
    const now = new Date("2025-01-05T15:00:00.000Z");
    const next = getNextOccurrence(sundayShow, now);
    expect(next).not.toBeNull();
    expect(next!.getTime()).toBeGreaterThan(now.getTime());
  });

  it("returns event next week when today's has passed", () => {
    // Sunday Jan 5 2025 22:00 UTC = 5pm ET (after 4pm show)
    const now = new Date("2025-01-05T22:00:00.000Z");
    const next = getNextOccurrence(sundayShow, now);
    expect(next).not.toBeNull();
    const diffDays = (next!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    expect(diffDays).toBeGreaterThan(6);
    expect(diffDays).toBeLessThan(8);
  });

  it("returns null for unconfirmed schedule", () => {
    const next = getNextOccurrence(pendingShow, new Date());
    expect(next).toBeNull();
  });

  it("handles DST spring forward", () => {
    // Day before DST spring forward 2025 in US
    const now = new Date("2025-03-08T15:00:00.000Z");
    const next = getNextOccurrence(sundayShow, now);
    expect(next).not.toBeNull();
    const formatted = formatEventTime(next!, "America/New_York", "America/New_York");
    expect(formatted.sourceTime).toContain("ET");
  });
});

describe("getEventStatus", () => {
  it("marks event as live during window", () => {
    // Sunday 4:30pm ET = 21:30 UTC (EST)
    const now = new Date("2025-01-05T21:30:00.000Z");
    expect(getEventStatus(sundayShow, now)).toBe("live");
  });

  it("marks event as upcoming before start", () => {
    const now = new Date("2025-01-05T15:00:00.000Z");
    expect(getEventStatus(sundayShow, now)).toBe("upcoming");
  });

  it("marks event as recently ended shortly after", () => {
    // 5:45pm ET = 22:45 UTC
    const now = new Date("2025-01-05T22:45:00.000Z");
    expect(getEventStatus(sundayShow, now)).toBe("recently-ended");
  });

  it("returns schedule-pending for unknown time", () => {
    expect(getEventStatus(pendingShow, new Date())).toBe("schedule-pending");
  });

  it("respects explicit live override", () => {
    const overridden = { ...sundayShow, liveOverride: true };
    expect(getEventStatus(overridden, new Date("2020-01-01"))).toBe("live");
  });

  it("returns listen-now for podcast", () => {
    const podcast = shows.find((s) => s.id === "dyor-podcast")!;
    expect(getEventStatus(podcast)).toBe("listen-now");
  });

  it("returns schedule-pending for disabled event", () => {
    const disabled = { ...sundayShow, isActive: false };
    expect(getEventStatus(disabled)).toBe("schedule-pending");
  });
});

describe("getCountdownParts", () => {
  it("never goes negative", () => {
    const past = new Date("2020-01-01");
    const now = new Date("2025-01-01");
    const parts = getCountdownParts(past, now);
    expect(parts.totalMs).toBe(0);
    expect(parts.days).toBe(0);
    expect(parts.hours).toBe(0);
    expect(parts.minutes).toBe(0);
    expect(parts.seconds).toBe(0);
  });
});

describe("getNextScheduledSpace", () => {
  it("finds next space among shows", () => {
    const result = getNextScheduledSpace(shows, new Date("2025-01-06T12:00:00.000Z"));
    expect(result).not.toBeNull();
    expect(result!.show.platform).toBe("x");
  });

  it("ignores unconfirmed times", () => {
    const onlyPending = [pendingShow];
    expect(getNextScheduledSpace(onlyPending)).toBeNull();
  });
});

describe("formatEventTime", () => {
  it("formats visitor timezone", () => {
    const date = new Date("2025-01-05T21:00:00.000Z");
    const formatted = formatEventTime(date, "America/New_York", "Australia/Perth");
    expect(formatted.localDay).toBeTruthy();
    expect(formatted.localTime).toBeTruthy();
  });
});
