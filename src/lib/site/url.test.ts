import { describe, expect, it } from "vitest";
import { getSiteUrl, isLocalDevHost } from "@/lib/site/url";

describe("site url helpers", () => {
  it("defaults to localhost:3002 when no env is set", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.VERCEL_URL;
    expect(getSiteUrl()).toBe("http://localhost:3002");
  });

  it("detects local dev hostnames", () => {
    expect(isLocalDevHost("localhost")).toBe(true);
    expect(isLocalDevHost("127.0.0.1")).toBe(true);
    expect(isLocalDevHost("[::1]")).toBe(true);
    expect(isLocalDevHost("www.dyorpod.com")).toBe(false);
  });
});
