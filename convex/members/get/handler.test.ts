import { describe, expect, it } from "vitest";

import { parseClientError } from "@pompeii/errors";
import { api } from "../../_generated/api";
import { makeConvexTest, signIn } from "../../test.setup";

async function createWedding(asUser: Awaited<ReturnType<typeof signIn>>) {
  await asUser.mutation(api.weddings.saveDraft.handler.saveDraft, {
    step: 1,
    name: "Amara & Tomi",
  });
  await asUser.mutation(api.weddings.saveDraft.handler.saveDraft, {
    step: 2,
    coupleA: "Amara",
    coupleB: "Tomi",
  });
  return await asUser.mutation(api.weddings.create.handler.create, {});
}

async function weddingIdFor(t: ReturnType<typeof makeConvexTest>) {
  return await t.run(
    async (ctx) => (await ctx.db.query("weddings").unique())!._id,
  );
}

describe("members/get", () => {
  it("returns the current member as self", async () => {
    const t = makeConvexTest();
    const asOwner = await signIn(t, "owner@example.com");
    await createWedding(asOwner);
    const weddingId = await weddingIdFor(t);
    const ownerId = await t.run(async (ctx) => {
      const member = await ctx.db
        .query("weddingMembers")
        .withIndex("by_weddingId", (q) => q.eq("weddingId", weddingId))
        .unique();
      return member!.userId;
    });

    await expect(
      asOwner.query(api.members.get.handler.get, {
        weddingId,
        userId: ownerId,
      }),
    ).resolves.toMatchObject({
      userId: ownerId,
      displayName: "Amara",
      isSelf: true,
    });
  });

  it("returns null for a user who is not in the wedding", async () => {
    const t = makeConvexTest();
    const asOwner = await signIn(t, "owner@example.com");
    await createWedding(asOwner);
    const weddingId = await weddingIdFor(t);
    const strangerId = await t.run((ctx) =>
      ctx.db.insert("users", { userId: "stranger" }),
    );

    await expect(
      asOwner.query(api.members.get.handler.get, {
        weddingId,
        userId: strangerId,
      }),
    ).resolves.toBeNull();
  });

  it("refuses a caller who is not in the wedding", async () => {
    const t = makeConvexTest();
    const asOwner = await signIn(t, "owner@example.com");
    await createWedding(asOwner);
    const weddingId = await weddingIdFor(t);
    const ownerId = await t.run(async (ctx) => {
      const member = await ctx.db
        .query("weddingMembers")
        .withIndex("by_weddingId", (q) => q.eq("weddingId", weddingId))
        .unique();
      return member!.userId;
    });

    const asOther = await signIn(t, "other@example.com");
    const error = await asOther
      .query(api.members.get.handler.get, {
        weddingId,
        userId: ownerId,
      })
      .catch((caught: unknown) => caught);

    expect(parseClientError(error)?.code).toBe("WEDDINGS_ENTER_NOT_FOUND");
  });
});
