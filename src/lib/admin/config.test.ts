import { afterEach, describe, expect, it, vi } from "vitest";
import { isKvConfigured } from "@/lib/admin/config";

describe("isKvConfigured", () => {
  const env = process.env;

  afterEach(() => {
    process.env = { ...env };
    vi.unstubAllEnvs();
  });

  it("returns true when Vercel KV REST variables are set", () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
    vi.stubEnv("KV_REST_API_URL", "https://example.upstash.io");
    vi.stubEnv("KV_REST_API_TOKEN", "test-token");

    expect(isKvConfigured()).toBe(true);
  });

  it("returns true when Upstash-named variables are set", () => {
    vi.stubEnv("KV_REST_API_URL", "");
    vi.stubEnv("KV_REST_API_TOKEN", "");
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://example.upstash.io");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "test-token");

    expect(isKvConfigured()).toBe(true);
  });

  it("returns false when neither credential pair is set", () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
    vi.stubEnv("KV_REST_API_URL", "");
    vi.stubEnv("KV_REST_API_TOKEN", "");

    expect(isKvConfigured()).toBe(false);
  });

  it("does not treat read-only KV token as sufficient on its own", () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
    vi.stubEnv("KV_REST_API_URL", "https://example.upstash.io");
    vi.stubEnv("KV_REST_API_TOKEN", "");
    vi.stubEnv("KV_REST_API_READ_ONLY_TOKEN", "read-only-token");

    expect(isKvConfigured()).toBe(false);
  });
});
