import { describe, expect, it } from "vitest";

import { liveOrSnapshot } from "./displayNames";

describe("liveOrSnapshot", () => {
  it("prefers a live member name", () => {
    expect(liveOrSnapshot("Amy", "Amara")).toBe("Amy");
  });

  it("falls back to the snapshot when the member is gone", () => {
    expect(liveOrSnapshot(undefined, "Amara")).toBe("Amara");
    expect(liveOrSnapshot("", "Amara")).toBe("Amara");
  });
});
