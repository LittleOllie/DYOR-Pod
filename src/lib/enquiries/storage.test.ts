import { describe, expect, it } from "vitest";
import { MAX_ENQUIRIES, prependEnquiry } from "./storage";

describe("prependEnquiry", () => {
  it("prepends a new entry and keeps newest first", () => {
    const result = prependEnquiry([{ id: "old" }], { id: "new" }, MAX_ENQUIRIES);
    expect(result).toEqual([{ id: "new" }, { id: "old" }]);
  });

  it("handles empty lists", () => {
    expect(prependEnquiry(null, { id: "first" }, MAX_ENQUIRIES)).toEqual([{ id: "first" }]);
  });

  it("trims to the configured max", () => {
    const existing = Array.from({ length: 3 }, (_, index) => ({ id: `item-${index}` }));
    const result = prependEnquiry(existing, { id: "fresh" }, 3);
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ id: "fresh" });
    expect(result[2]).toEqual({ id: "item-1" });
  });
});
