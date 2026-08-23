import { describe, expect, it } from "vitest";

import { avatarInitials } from "./avatar";

describe("avatarInitials", () => {
  it("uses the first letter of each name", () => {
    expect(avatarInitials("Ada Lovelace", "ada@example.com")).toBe("AL");
  });

  it("uses the first and last name when there are more than two", () => {
    expect(avatarInitials("Mary Ann Evans")).toBe("ME");
  });

  it("uses a single letter when there is one name", () => {
    expect(avatarInitials("Ada")).toBe("A");
  });

  it("falls back to the email", () => {
    expect(avatarInitials("  ", "sam@example.com")).toBe("S");
  });

  it("falls back to P when both are empty", () => {
    expect(avatarInitials(null, null)).toBe("P");
  });
});
