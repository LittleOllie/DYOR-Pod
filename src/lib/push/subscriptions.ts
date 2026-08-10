import { createHash } from "node:crypto";
import { isKvConfigured } from "@/lib/admin/config";
import { kv } from "@/lib/library/redis";

export type PushSubscriptionRecord = {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  createdAt: string;
  updatedAt: string;
  userAgent?: string;
  active: boolean;
};

const SUBSCRIPTION_INDEX_KEY = "push:subscriptions:index";

function endpointId(endpoint: string): string {
  return createHash("sha256").update(endpoint).digest("hex").slice(0, 32);
}

function subscriptionKey(id: string): string {
  return `push:subscription:${id}`;
}

export function hashPushEndpoint(endpoint: string): string {
  return endpointId(endpoint);
}

async function readSubscriptionIndex(): Promise<string[]> {
  const index = await kv.get<string[]>(SUBSCRIPTION_INDEX_KEY);
  return index ?? [];
}

async function writeSubscriptionIndex(ids: string[]): Promise<void> {
  await kv.set(SUBSCRIPTION_INDEX_KEY, ids);
}

export async function upsertPushSubscription(
  subscription: PushSubscriptionRecord,
): Promise<{ ok: boolean; reason?: string }> {
  if (!isKvConfigured()) {
    return { ok: false, reason: "storage-unavailable" };
  }

  const id = endpointId(subscription.endpoint);
  const now = new Date().toISOString();

  try {
    const existing = await kv.get<PushSubscriptionRecord>(subscriptionKey(id));
    const record: PushSubscriptionRecord = {
      ...subscription,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      active: true,
    };

    await kv.set(subscriptionKey(id), record);

    const index = await readSubscriptionIndex();
    if (!index.includes(id)) {
      await writeSubscriptionIndex([...index, id]);
    }

    return { ok: true };
  } catch {
    return { ok: false, reason: "write-failed" };
  }
}

export async function removePushSubscription(endpoint: string): Promise<boolean> {
  if (!isKvConfigured()) {
    return false;
  }

  const id = endpointId(endpoint);
  try {
    await kv.del(subscriptionKey(id));
    const index = await readSubscriptionIndex();
    await writeSubscriptionIndex(index.filter((entry) => entry !== id));
    return true;
  } catch {
    return false;
  }
}

export async function deactivatePushSubscription(endpoint: string): Promise<boolean> {
  if (!isKvConfigured()) {
    return false;
  }

  const id = endpointId(endpoint);
  try {
    const existing = await kv.get<PushSubscriptionRecord>(subscriptionKey(id));
    if (!existing) {
      return false;
    }

    await kv.set(subscriptionKey(id), {
      ...existing,
      active: false,
      updatedAt: new Date().toISOString(),
    });

    const index = await readSubscriptionIndex();
    await writeSubscriptionIndex(index.filter((entry) => entry !== id));
    return true;
  } catch {
    return false;
  }
}

export async function listActivePushSubscriptions(): Promise<PushSubscriptionRecord[]> {
  if (!isKvConfigured()) {
    return [];
  }

  try {
    const ids = await readSubscriptionIndex();
    if (!ids.length) {
      return [];
    }

    const records = await Promise.all(
      ids.map((id) => kv.get<PushSubscriptionRecord>(subscriptionKey(id))),
    );

    return records.filter(
      (record): record is PushSubscriptionRecord =>
        Boolean(record?.active && record.endpoint && record.keys?.p256dh && record.keys?.auth),
    );
  } catch {
    return [];
  }
}
