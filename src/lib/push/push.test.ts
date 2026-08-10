import { describe, expect, it } from "vitest";
import {
  buildReminderDedupKey,
  claimReminderDelivery,
} from "@/lib/push/dedup";
import {
  isWithinReminderWindow,
  REMINDER_MINUTES_BEFORE,
} from "@/lib/push/reminderTiming";
import { buildReminderPayload } from "@/lib/push/reminderTiming";
import { pushSubscriptionSchema } from "@/lib/push/types";

describe("reminderTiming", () => {
  it("opens reminder window 15 minutes before start", () => {
    const start = "2025-06-10T22:00:00.000Z";
    const reminderAt = new Date(new Date(start).getTime() - REMINDER_MINUTES_BEFORE * 60 * 1000);
    expect(isWithinReminderWindow(start, reminderAt)).toBe(true);
    expect(isWithinReminderWindow(start, new Date(start))).toBe(false);
  });

  it("builds trusted reminder payload", () => {
    const payload = buildReminderPayload({
      showId: "dyor-sunday",
      name: "DYOR Sunday",
      platform: "x",
      start: "2025-06-10T22:00:00.000Z",
      end: "2025-06-10T23:00:00.000Z",
      xUrl: "https://x.com/DYORPod",
    });

    expect(payload.title).toContain("DYOR Sunday");
    expect(payload.url).toBe("https://x.com/DYORPod");
    expect(payload.tag).toBe("dyor-sunday:2025-06-10T22:00:00.000Z");
  });
});

describe("pushSubscriptionSchema", () => {
  it("rejects invalid subscription payloads", () => {
    const result = pushSubscriptionSchema.safeParse({ endpoint: "not-a-url" });
    expect(result.success).toBe(false);
  });

  it("accepts valid subscription payloads", () => {
    const result = pushSubscriptionSchema.safeParse({
      endpoint: "https://push.example.com/subscription",
      keys: { p256dh: "abc", auth: "def" },
    });
    expect(result.success).toBe(true);
  });
});

describe("reminder dedup keys", () => {
  it("builds stable dedup keys", () => {
    const key = buildReminderDedupKey(
      "dyor-sunday",
      "2025-06-10T22:00:00.000Z",
      "https://push.example.com/subscription",
    );
    expect(key).toContain("dyor-sunday");
    expect(key).toContain("2025-06-10T22:00:00.000Z");
  });
});

describe("claimReminderDelivery without redis", () => {
  it("returns false when storage is unavailable", async () => {
    const claimed = await claimReminderDelivery(
      "dyor-sunday",
      "2025-06-10T22:00:00.000Z",
      "https://push.example.com/subscription",
      3600,
    );
    expect(claimed).toBe(false);
  });
});
