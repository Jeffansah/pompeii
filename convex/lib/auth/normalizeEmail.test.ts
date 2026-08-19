import { describe, expect, it } from "vitest";

import { normalizeEmail } from "./normalizeEmail";

describe("normalizeEmail", () => {
  it("trims and lowercases", () => {
    expect(normalizeEmail("  A@X.com ")).toBe("a@x.com");
  });

  it("leaves an already-normalized address unchanged", () => {
    expect(normalizeEmail("a@x.com")).toBe("a@x.com");
  });
});
