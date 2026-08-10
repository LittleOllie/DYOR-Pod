import { describe, expect, it } from "vitest";
import { shows } from "@/content/shows";
import {
  getNextStatusTransitionMs,
  getResolvedEventStatus,
  getResolvedNextOccurrence,
} from "@/lib/schedule/resolveShowSchedule";
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
  durationMinutes: 60,
  platform: "x",
  image: "/test.webp",
  accent: "teal",
  category: "Test",
  isActive: true,
  displayOrder: 1,
  scheduleConfirmed: true,
};

describe("WWFC static schedule", () => {
  it("resolves Tuesday 6 PM ET as confirmed", () => {
    const wwfc = shows.find((show) => show.id === "will-work-for-crypto");
    expect(wwfc).toBeDefined();
    expect(wwfc!.dayOfWeek).toBe(2);
    expect(wwfc!.startTime).toBe("18:00");
    expect(wwfc!.scheduleConfirmed).toBe(true);
    expect(wwfc!.timezone).toBe("America/New_York");
  });

  it("includes WWFC in next occurrence calculations", () => {
    const wwfc = shows.find((show) => show.id === "will-work-for-crypto")!;
    const now = new Date("2025-01-06T12:00:00.000Z"); // Monday
    const next = getResolvedNextOccurrence(wwfc, { now });
    expect(next).not.toBeNull();
  });
});

describe("resolveShowSchedule overrides", () => {
  it("respects one-off date override for next occurrence", () => {
    const now = new Date("2025-01-05T15:00:00.000Z");
    const overrides = [
      {
        showId: "test-sunday",
        date: "2025-01-05",
        startTime: "20:00",
      },
    ];

    const next = getResolvedNextOccurrence(sundayShow, { dateOverrides: overrides, now });
    expect(next).not.toBeNull();
    expect(getResolvedEventStatus(sundayShow, { dateOverrides: overrides, now })).toBe(
      "upcoming",
    );
  });

  it("returns transition ms until live start when upcoming", () => {
    const now = new Date("2025-01-05T15:00:00.000Z");
    const ms = getNextStatusTransitionMs(sundayShow, { now });
    expect(ms).not.toBeNull();
    expect(ms!).toBeGreaterThan(0);
  });

  it("marks live during active window with overrides", () => {
    const now = new Date("2025-01-05T21:30:00.000Z");
    expect(getResolvedEventStatus(sundayShow, { now })).toBe("live");
  });
});
