import { describe, expect, it } from "vitest";

import { internal } from "../_generated/api";
import { overviewPosterCards } from "../editorial/cards";
import { makeConvexTest } from "../test.setup";

describe("migrations/editorial insertDestinationCards", () => {
  it("inserts each destination card once", async () => {
    const t = makeConvexTest();

    await expect(
      t.mutation(internal.migrations.editorial.insertDestinationCards, {}),
    ).resolves.toEqual({
      inserted: overviewPosterCards.length,
      skipped: 0,
    });

    await expect(
      t.mutation(internal.migrations.editorial.insertDestinationCards, {}),
    ).resolves.toEqual({
      inserted: 0,
      skipped: overviewPosterCards.length,
    });

    const count = await t.run(async (ctx) => {
      const cards = await ctx.db.query("overviewPosterCards").take(100);
      return cards.length;
    });
    expect(count).toBe(overviewPosterCards.length);
  });
});
