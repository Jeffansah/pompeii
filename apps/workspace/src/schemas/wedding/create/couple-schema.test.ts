import { describe, expect, it } from "vitest";

import {
  AppErrorCode,
  COUPLE_NAME_MAX_LENGTH,
  getErrorMessage,
} from "@pompeii/errors";

import { coupleSchema } from "./couple-schema";

describe("coupleSchema", () => {
  it("trims both names", () => {
    expect(
      coupleSchema.parse({ coupleA: "  Amara  ", coupleB: "  Tomi  " }),
    ).toEqual({
      coupleA: "Amara",
      coupleB: "Tomi",
    });
  });

  it("rejects an empty first name", () => {
    const parsed = coupleSchema.safeParse({ coupleA: "   ", coupleB: "Tomi" });
    expect(parsed.success).toBe(false);
    if (parsed.success) {
      return;
    }
    expect(parsed.error.issues[0]?.message).toBe(
      getErrorMessage(AppErrorCode.weddings.createWedding.COUPLE_A_REQUIRED),
    );
  });

  it("rejects an empty second name", () => {
    const parsed = coupleSchema.safeParse({ coupleA: "Amara", coupleB: "   " });
    expect(parsed.success).toBe(false);
    if (parsed.success) {
      return;
    }
    expect(parsed.error.issues[0]?.message).toBe(
      getErrorMessage(AppErrorCode.weddings.createWedding.COUPLE_B_REQUIRED),
    );
  });

  it("rejects a name that is too long", () => {
    const parsed = coupleSchema.safeParse({
      coupleA: "A".repeat(COUPLE_NAME_MAX_LENGTH + 1),
      coupleB: "Tomi",
    });
    expect(parsed.success).toBe(false);
    if (parsed.success) {
      return;
    }
    expect(parsed.error.issues[0]?.message).toBe(
      getErrorMessage(AppErrorCode.weddings.createWedding.COUPLE_NAME_TOO_LONG),
    );
  });
});
