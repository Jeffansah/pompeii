import { describe, expect, it } from "vitest";

import { AppErrorCode, getErrorMessage, WEDDING_NAME_MAX_LENGTH } from "@pompeii/errors";

import { nameSchema } from "./name-schema";

describe("nameSchema", () => {
  it("trims a valid name", () => {
    expect(nameSchema.parse({ name: "  Amara & Tomi  " })).toEqual({
      name: "Amara & Tomi",
    });
  });

  it("rejects an empty name", () => {
    const parsed = nameSchema.safeParse({ name: "   " });
    expect(parsed.success).toBe(false);
    if (parsed.success) {
      return;
    }
    expect(parsed.error.issues[0]?.message).toBe(
      getErrorMessage(AppErrorCode.weddings.createWedding.NAME_REQUIRED),
    );
  });

  it("rejects a name that is too long", () => {
    const parsed = nameSchema.safeParse({
      name: "A".repeat(WEDDING_NAME_MAX_LENGTH + 1),
    });
    expect(parsed.success).toBe(false);
    if (parsed.success) {
      return;
    }
    expect(parsed.error.issues[0]?.message).toBe(
      getErrorMessage(AppErrorCode.weddings.createWedding.NAME_TOO_LONG),
    );
  });
});
