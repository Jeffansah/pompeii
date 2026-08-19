import { describe, expect, it } from "vitest";

import { formatResendLabel } from "./use-magic-link-cooldown";

describe("formatResendLabel", () => {
  it("formats zero as 0:00", () => {
    expect(formatResendLabel(0)).toBe("Resend in 0:00");
  });

  it("ceils milliseconds to seconds", () => {
    expect(formatResendLabel(47_000)).toBe("Resend in 0:47");
  });

  it("formats minutes and padded seconds", () => {
    expect(formatResendLabel(65_000)).toBe("Resend in 1:05");
  });

  it("does not go below zero", () => {
    expect(formatResendLabel(-1_000)).toBe("Resend in 0:00");
  });
});
