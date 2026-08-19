import { ConvexError } from "convex/values";
import { describe, expect, it } from "vitest";

import { clientErrorMessage, normalizeClientError } from "../src/client";

describe("normalizeClientError", () => {
  it("maps structured Convex errors", () => {
    const normalized = normalizeClientError(
      new ConvexError({
        code: "UNAUTHENTICATED",
        message: "You need to sign in.",
      }),
    );

    expect(normalized.code).toBe("UNAUTHENTICATED");
    expect(normalized.message).toBe("You need to sign in.");
  });

  it("preserves native Error messages", () => {
    const normalized = normalizeClientError(
      new Error("Network request failed"),
      "Something went wrong.",
    );

    expect(normalized.message).toBe("Network request failed");
  });

  it("falls back when no message is available", () => {
    expect(clientErrorMessage({}, "Could not load.")).toBe("Could not load.");
  });
});
