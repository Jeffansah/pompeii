import { describe, expect, it } from "vitest";

import { api } from "../../_generated/api";
import { makeConvexTest } from "../../test.setup";

describe("health/get", () => {
  it("returns ok", async () => {
    const t = makeConvexTest();
    await expect(t.query(api.health.get.handler.get, {})).resolves.toEqual({
      ok: true,
    });
  });
});
