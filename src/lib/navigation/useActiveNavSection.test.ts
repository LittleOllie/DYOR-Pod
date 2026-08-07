import { describe, expect, it } from "vitest";
import { HOME_SECTIONS } from "./useActiveNavSection";

describe("HOME_SECTIONS", () => {
  it("lists homepage anchors in the same order as main navigation", () => {
    expect(HOME_SECTIONS).toEqual([
      "schedule",
      "podcast",
      "library",
      "hosts",
      "game",
      "about",
      "newsletter",
    ]);
  });
});
