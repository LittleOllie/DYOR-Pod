import { describe, expect, it } from "vitest";
import { isKnownShowId } from "@/lib/schedule/showIds";

describe("show ID validation", () => {
  it("accepts configured show IDs", () => {
    expect(isKnownShowId("dyor-sunday")).toBe(true);
    expect(isKnownShowId("will-work-for-crypto")).toBe(true);
    expect(isKnownShowId("no-fud-friday")).toBe(true);
    expect(isKnownShowId("dyor-podcast")).toBe(true);
  });

  it("rejects unknown show IDs", () => {
    expect(isKnownShowId("fake-show")).toBe(false);
    expect(isKnownShowId("")).toBe(false);
  });
});
