import { describe, expect, it } from "vitest";

import { makeConvexTest } from "../../test.setup";
import { uniqueSlug } from "./uniqueSlug";

describe("uniqueSlug", () => {
  it("returns the slugified name when it is free", async () => {
    const t = makeConvexTest();
    await t.run(async (ctx) => {
      await expect(uniqueSlug(ctx, "Amara & Tomi")).resolves.toBe("amara-tomi");
    });
  });

  it("appends -2 when the base slug is taken", async () => {
    const t = makeConvexTest();
    await t.run(async (ctx) => {
      await ctx.db.insert("weddings", {
        name: "Amara & Tomi",
        slug: "amara-tomi",
        couple: [
          { id: null, name: "Amara" },
          { id: null, name: "Tomi" },
        ],
      });
      await expect(uniqueSlug(ctx, "Amara & Tomi")).resolves.toBe(
        "amara-tomi-2",
      );
    });
  });
});
