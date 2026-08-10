import { isKvConfigured } from "@/lib/admin/config";
import { kv } from "@/lib/library/redis";
import { hashPushEndpoint } from "@/lib/push/subscriptions";

const REMINDER_DEDUP_PREFIX = "push:reminder:sent";

export function buildReminderDedupKey(
  showId: string,
  startIso: string,
  endpoint: string,
): string {
  return `${REMINDER_DEDUP_PREFIX}:${showId}:${startIso}:${hashPushEndpoint(endpoint)}`;
}

/** Returns true if this reminder was not yet sent (and marks it atomically). */
export async function claimReminderDelivery(
  showId: string,
  startIso: string,
  endpoint: string,
  ttlSeconds: number,
): Promise<boolean> {
  if (!isKvConfigured()) {
    return false;
  }

  const key = buildReminderDedupKey(showId, startIso, endpoint);

  try {
    const existing = await kv.get<string>(key);
    if (existing) {
      return false;
    }

    await kv.set(key, "1", { ex: ttlSeconds });
    return true;
  } catch {
    return false;
  }
}

export async function wasReminderSent(
  showId: string,
  startIso: string,
  endpoint: string,
): Promise<boolean> {
  if (!isKvConfigured()) {
    return false;
  }

  const key = buildReminderDedupKey(showId, startIso, endpoint);
  try {
    const value = await kv.get(key);
    return value !== null;
  } catch {
    return false;
  }
}
