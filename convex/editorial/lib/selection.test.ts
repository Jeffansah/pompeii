import { describe, expect, it } from "vitest";

import { editorialCardIndex, productDay } from "./selection";

describe("productDay", () => {
  it("uses a stable UTC calendar day", () => {
    expect(productDay(new Date("2026-08-20T23:30:00.000Z"))).toBe("2026-08-20");
  });
});

describe("editorialCardIndex", () => {
  it("returns the same card for the same wedding, workspace session, and day", () => {
    expect(
      editorialCardIndex("wedding-1", "workspace-session-1", "2026-08-20", 4),
    ).toBe(
      editorialCardIndex("wedding-1", "workspace-session-1", "2026-08-20", 4),
    );
  });

  it("can return a different card for a different workspace session", () => {
    expect(
      editorialCardIndex("wedding-1", "workspace-session-1", "2026-08-20", 20),
    ).not.toBe(
      editorialCardIndex("wedding-1", "workspace-session-2", "2026-08-20", 20),
    );
  });

  it("returns null when there are no cards", () => {
    expect(
      editorialCardIndex("wedding-1", "workspace-session-1", "2026-08-20", 0),
    ).toBeNull();
  });

  it("always returns an index in the card range", () => {
    const index = editorialCardIndex(
      "wedding-1",
      "workspace-session-1",
      "2026-08-20",
      4,
    );
    expect(index).toBeGreaterThanOrEqual(0);
    expect(index).toBeLessThan(4);
  });
});
