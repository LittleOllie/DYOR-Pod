import { describe, expect, it } from "vitest";
import {
  extractTweetIdFromUrl,
  isoTimestampToDate,
  parseM3u8Duration,
  secondsToDuration,
  syndicationToken,
} from "@/lib/library/xMetadata";

describe("xMetadata helpers", () => {
  it("extracts tweet id from status urls", () => {
    expect(extractTweetIdFromUrl("https://x.com/DYORPod/status/2068828961132642395")).toBe(
      "2068828961132642395",
    );
    expect(extractTweetIdFromUrl("https://twitter.com/DYORPod/status/123")).toBe("123");
    expect(extractTweetIdFromUrl("https://example.com/status/123")).toBeNull();
  });

  it("builds a syndication token", () => {
    expect(syndicationToken("2068828961132642395")).toMatch(/^\d+$/);
  });

  it("converts iso timestamps to YYYY-MM-DD", () => {
    expect(isoTimestampToDate("2026-06-28T20:00:22.000Z")).toBe("2026-06-28");
  });

  it("formats seconds as H:MM:SS", () => {
    expect(secondsToDuration(7317)).toBe("2:01:57");
    expect(secondsToDuration(125)).toBe("2:05");
  });

  it("parses m3u8 segment durations", () => {
    const playlist = `#EXTM3U
#EXTINF:10.0,
segment0.ts
#EXTINF:5.5,
segment1.ts`;

    expect(parseM3u8Duration(playlist)).toBe(15.5);
  });
});
