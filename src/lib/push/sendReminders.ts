import { configureWebPush, webpush } from "@/lib/push/vapid";
import { claimReminderDelivery } from "@/lib/push/dedup";
import {
  buildReminderPayload,
  isWithinReminderWindow,
  reminderDedupTtlSeconds,
} from "@/lib/push/reminderTiming";
import {
  deactivatePushSubscription,
  listActivePushSubscriptions,
  type PushSubscriptionRecord,
} from "@/lib/push/subscriptions";
import type { UpcomingScheduleEvent } from "@/lib/schedule/scheduleTypes";

export type ReminderSendResult = {
  event: UpcomingScheduleEvent;
  sent: number;
  skipped: number;
  failed: number;
  removed: number;
};

function toWebPushSubscription(record: PushSubscriptionRecord) {
  return {
    endpoint: record.endpoint,
    keys: {
      p256dh: record.keys.p256dh,
      auth: record.keys.auth,
    },
  };
}

function isPermanentPushFailure(statusCode?: number): boolean {
  return statusCode === 404 || statusCode === 410;
}

export async function sendEventReminders(
  event: UpcomingScheduleEvent,
  subscriptions: PushSubscriptionRecord[],
  now = new Date(),
): Promise<ReminderSendResult> {
  const config = configureWebPush();
  const result: ReminderSendResult = {
    event,
    sent: 0,
    skipped: 0,
    failed: 0,
    removed: 0,
  };

  if (!config) {
    return result;
  }

  if (!isWithinReminderWindow(event.start, now)) {
    return result;
  }

  const payload = buildReminderPayload(event);
  const payloadJson = JSON.stringify(payload);
  const ttl = reminderDedupTtlSeconds(event.start);

  for (const subscription of subscriptions) {
    const claimed = await claimReminderDelivery(
      event.showId,
      event.start,
      subscription.endpoint,
      ttl,
    );

    if (!claimed) {
      result.skipped += 1;
      continue;
    }

    try {
      await webpush.sendNotification(toWebPushSubscription(subscription), payloadJson);
      result.sent += 1;
    } catch (error) {
      result.failed += 1;
      const statusCode =
        error && typeof error === "object" && "statusCode" in error
          ? Number((error as { statusCode?: number }).statusCode)
          : undefined;

      if (isPermanentPushFailure(statusCode)) {
        await deactivatePushSubscription(subscription.endpoint);
        result.removed += 1;
      }
    }
  }

  return result;
}

export async function runReminderScheduler(now = new Date()): Promise<{
  eligibleEvents: number;
  results: ReminderSendResult[];
  subscriptionCount: number;
}> {
  const { buildUpcomingEvents } = await import("@/lib/schedule/getUpcomingEvents");
  const { fetchEffectiveShows, readScheduleConfig } = await import(
    "@/lib/schedule/scheduleStorage"
  );

  const [shows, config, subscriptions] = await Promise.all([
    fetchEffectiveShows(),
    readScheduleConfig(),
    listActivePushSubscriptions(),
  ]);

  const events = buildUpcomingEvents(shows, config?.dateOverrides ?? [], now, 21);
  const eligible = events.filter((event) => isWithinReminderWindow(event.start, now));

  const results: ReminderSendResult[] = [];
  for (const event of eligible) {
    results.push(await sendEventReminders(event, subscriptions, now));
  }

  return {
    eligibleEvents: eligible.length,
    results,
    subscriptionCount: subscriptions.length,
  };
}
