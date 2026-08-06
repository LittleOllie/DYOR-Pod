import { Redis } from "@upstash/redis";
import { isKvConfigured } from "@/lib/admin/config";

let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redisClient) {
    const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

    if (!url || !token) {
      throw new Error("Redis is not configured.");
    }

    redisClient = new Redis({ url, token });
  }

  return redisClient;
}

type SetOptions = {
  ex?: number;
};

export const kv = {
  async get<T>(key: string): Promise<T | null> {
    if (!isKvConfigured()) {
      throw new Error("Redis is not configured.");
    }
    return getRedisClient().get<T>(key);
  },

  async set(key: string, value: unknown, options?: SetOptions): Promise<void> {
    if (!isKvConfigured()) {
      throw new Error("Redis is not configured.");
    }

    if (options?.ex) {
      await getRedisClient().set(key, value, { ex: options.ex });
      return;
    }

    await getRedisClient().set(key, value);
  },

  async del(key: string): Promise<void> {
    if (!isKvConfigured()) {
      throw new Error("Redis is not configured.");
    }
    await getRedisClient().del(key);
  },
};
