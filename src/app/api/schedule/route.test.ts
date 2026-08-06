import { describe, expect, it, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/schedule/route";

vi.mock("@/lib/schedule/scheduleStorage", () => ({
  fetchEffectiveShows: vi.fn(),
  readScheduleConfig: vi.fn(),
  defaultScheduleConfig: vi.fn(() => ({ recurring: {}, dateOverrides: [] })),
}));

vi.mock("@/content/shows", () => ({
  shows: [
    {
      id: "dyor-sunday",
      dayOfWeek: 0,
      startTime: "16:00",
      timezone: "America/New_York",
      durationMinutes: 60,
      scheduleConfirmed: true,
      isActive: true,
    },
  ],
}));

import {
  fetchEffectiveShows,
  readScheduleConfig,
} from "@/lib/schedule/scheduleStorage";

describe("/api/schedule", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns events when Redis data is available", async () => {
    vi.mocked(fetchEffectiveShows).mockResolvedValue([
      {
        id: "dyor-sunday",
        name: "DYOR Sunday",
        shortName: "DYOR Sunday",
        tagline: "News",
        description: "Weekly recap",
        identityCue: "briefing",
        dayOfWeek: 0,
        startTime: "16:00",
        timezone: "America/New_York",
        durationMinutes: 60,
        platform: "x",
        image: "/shows/dyor-sunday.webp",
        imageWidth: 1122,
        imageHeight: 1402,
        xUrl: "https://x.com/DYORPod",
        accent: "teal",
        category: "Live X Space",
        isActive: true,
        scheduleConfirmed: true,
        displayOrder: 1,
      },
    ]);
    vi.mocked(readScheduleConfig).mockResolvedValue({
      recurring: {},
      dateOverrides: [],
    });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(body.events)).toBe(true);
    expect(body.fallback).toBeUndefined();
  });

  it("falls back to static schedule when Redis fails", async () => {
    vi.mocked(fetchEffectiveShows).mockRejectedValue(new Error("Redis unavailable"));

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.fallback).toBe(true);
    expect(Array.isArray(body.events)).toBe(true);
  });
});
