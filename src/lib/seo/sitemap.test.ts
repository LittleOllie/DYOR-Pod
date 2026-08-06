import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";

describe("sitemap", () => {
  it("lists indexable public pages only", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://www.dyorpod.com";
    const entries = sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).toContain("https://www.dyorpod.com");
    expect(urls).toContain("https://www.dyorpod.com/contact");
    expect(urls).toContain("https://www.dyorpod.com/legal");
    expect(urls).toContain("https://www.dyorpod.com/mission");
    expect(urls).not.toContain("https://www.dyorpod.com/privacy");
    expect(urls).not.toContain("https://www.dyorpod.com/terms");
    expect(urls).not.toContain("https://www.dyorpod.com/disclaimer");
  });
});
