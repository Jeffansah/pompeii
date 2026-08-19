import { describe, expect, it } from "vitest";

import { AppErrorCode, getErrorMessage } from "@pompeii/errors";

import { dateSchema, todayDateValue } from "./date-schema";

function shiftDateValue(days: number) {
  const now = new Date();
  now.setDate(now.getDate() + days);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

describe("dateSchema", () => {
  it("allows an empty date", () => {
    expect(dateSchema.parse({ date: "   " })).toEqual({ date: "" });
  });

  it("accepts today", () => {
    const today = todayDateValue();
    expect(dateSchema.parse({ date: today })).toEqual({ date: today });
  });

  it("accepts a future calendar date", () => {
    const future = shiftDateValue(30);
    expect(dateSchema.parse({ date: future })).toEqual({ date: future });
  });

  it("rejects a malformed date", () => {
    const parsed = dateSchema.safeParse({ date: "16/08/2026" });
    expect(parsed.success).toBe(false);
    if (parsed.success) {
      return;
    }
    expect(parsed.error.issues[0]?.message).toBe(
      getErrorMessage(AppErrorCode.weddings.createWedding.DATE_INVALID),
    );
  });

  it("rejects a date in the past", () => {
    const parsed = dateSchema.safeParse({ date: shiftDateValue(-1) });
    expect(parsed.success).toBe(false);
    if (parsed.success) {
      return;
    }
    expect(parsed.error.issues[0]?.message).toBe(
      getErrorMessage(AppErrorCode.weddings.createWedding.DATE_IN_PAST),
    );
  });
});
