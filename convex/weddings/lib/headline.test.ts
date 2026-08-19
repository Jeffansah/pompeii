import { describe, expect, it } from "vitest";

import { headlineFor } from "./headline";

describe("headlineFor", () => {
  it("returns welcome copy with the wedding name", () => {
    expect(headlineFor({ name: "Amara & Tomi" })).toEqual({
      kind: "welcome",
      foretitle: "Welcome to",
      title: "Amara & Tomi",
    });
  });
});
