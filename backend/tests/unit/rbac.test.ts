import { describe, expect, it } from "vitest";

describe("permissions", () => {
  it("checks required permissions", () => {
    const current = ["goals:read", "reviews:write"];
    const required = ["goals:read"];
    expect(required.every((item) => current.includes(item))).toBe(true);
  });
});
