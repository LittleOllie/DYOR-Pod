import { describe, expect, it } from "vitest";
import { checkRateLimit } from "@/lib/security/rateLimit";

describe("rate limiting", () => {
  it("allows requests within the limit using in-memory fallback", async () => {
    const scope = `test-${Date.now()}`;
    const first = await checkRateLimit(scope, "127.0.0.1", 3, 60);
    const second = await checkRateLimit(scope, "127.0.0.1", 3, 60);

    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(true);
  });

  it("blocks requests above the limit", async () => {
    const scope = `block-${Date.now()}`;
    await checkRateLimit(scope, "127.0.0.1", 2, 60);
    await checkRateLimit(scope, "127.0.0.1", 2, 60);
    const blocked = await checkRateLimit(scope, "127.0.0.1", 2, 60);

    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });
});
