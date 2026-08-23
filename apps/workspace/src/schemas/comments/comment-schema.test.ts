import { describe, expect, it } from "vitest";

import { commentBodySchema } from "./comment-schema";

describe("commentBodySchema", () => {
  it("trims outer whitespace and preserves internal newlines", () => {
    expect(
      commentBodySchema.parse({ body: "  First line\n\nSecond line  " }),
    ).toEqual({ body: "First line\n\nSecond line" });
  });

  it("rejects empty and oversized comments", () => {
    expect(() => commentBodySchema.parse({ body: "   " })).toThrow(
      "Write something before posting.",
    );
    expect(() =>
      commentBodySchema.parse({ body: "a".repeat(5001) }),
    ).toThrow("That comment is too long.");
  });
});
