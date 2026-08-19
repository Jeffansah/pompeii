import { describe, expect, it } from "vitest";

import { AppErrorCode, getErrorMessage } from "@pompeii/errors";

import { loginSchema } from "./login-schema";

describe("loginSchema", () => {
  it("trims and lowercases a valid email", () => {
    expect(loginSchema.parse({ email: "  A@X.com " })).toEqual({
      email: "a@x.com",
    });
  });

  it("rejects an invalid email", () => {
    const parsed = loginSchema.safeParse({ email: "not-an-email" });
    expect(parsed.success).toBe(false);
    if (parsed.success) {
      return;
    }
    expect(parsed.error.issues[0]?.message).toBe(
      getErrorMessage(AppErrorCode.login.magicLink.EMAIL_INVALID),
    );
  });

  it("rejects an empty email", () => {
    const parsed = loginSchema.safeParse({ email: "   " });
    expect(parsed.success).toBe(false);
    if (parsed.success) {
      return;
    }
    expect(parsed.error.issues[0]?.message).toBe(
      getErrorMessage(AppErrorCode.login.magicLink.EMAIL_REQUIRED),
    );
  });
});
