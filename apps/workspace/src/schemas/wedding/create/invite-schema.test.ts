import { describe, expect, it } from "vitest";

import { AppErrorCode, getErrorMessage } from "@pompeii/errors";

import { inviteSchema } from "./invite-schema";

describe("inviteSchema", () => {
  it("allows skipping the invite", () => {
    expect(inviteSchema.parse({ inviteEmail: "   " })).toEqual({
      inviteEmail: "",
    });
  });

  it("trims and lowercases a valid email", () => {
    expect(inviteSchema.parse({ inviteEmail: "  A@X.com " })).toEqual({
      inviteEmail: "a@x.com",
    });
  });

  it("rejects an invalid email", () => {
    const parsed = inviteSchema.safeParse({ inviteEmail: "not-an-email" });
    expect(parsed.success).toBe(false);
    if (parsed.success) {
      return;
    }
    expect(parsed.error.issues[0]?.message).toBe(
      getErrorMessage(AppErrorCode.weddings.createWedding.INVITE_EMAIL_INVALID),
    );
  });
});
