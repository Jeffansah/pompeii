import { describe, expect, it } from "vitest";

import {
  AVATAR_TONE_COUNT,
  avatarInitial,
  avatarToneIndex,
  avatarToneVar,
} from "./avatar";

describe("avatarToneIndex", () => {
  it("is stable for the same id", () => {
    expect(avatarToneIndex("user_abc")).toBe(avatarToneIndex("user_abc"));
  });

  it("stays within 1 and 20", () => {
    const ids = ["a", "b", "user_1", "user_2", "jd7k3m"];
    for (const id of ids) {
      const index = avatarToneIndex(id);
      expect(index).toBeGreaterThanOrEqual(1);
      expect(index).toBeLessThanOrEqual(AVATAR_TONE_COUNT);
    }
  });

  it("maps different ids to different tones", () => {
    expect(avatarToneIndex("alice")).not.toBe(avatarToneIndex("bob"));
  });
});

describe("avatarToneVar", () => {
  it("points at the hashed token", () => {
    expect(avatarToneVar("user_abc")).toBe(
      `var(--avatar-${avatarToneIndex("user_abc")})`,
    );
  });
});

describe("avatarInitial", () => {
  it("uses the first letter of the name", () => {
    expect(avatarInitial("Ada Lovelace", "ada@example.com")).toBe("A");
  });

  it("falls back to the email", () => {
    expect(avatarInitial("  ", "sam@example.com")).toBe("S");
  });

  it("falls back to P when both are empty", () => {
    expect(avatarInitial(null, null)).toBe("P");
  });
});
