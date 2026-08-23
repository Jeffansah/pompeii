import { describe, expect, it } from "vitest";

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

describe("members/current", () => {
  it("returns the signed-in workspace member", async () => {
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
      asOwner.query(api.members.current.handler.current, { weddingId }),
    ).resolves.toMatchObject({
      userId: ownerId,
      displayName: "Amara",
      isSelf: true,
    });
  });

  it("returns null when the caller is not in the wedding", async () => {
    const t = makeConvexTest();
    const asOwner = await signIn(t, "owner@example.com");
    await createWedding(asOwner);
    const weddingId = await weddingIdFor(t);
    const asOther = await signIn(t, "other@example.com");

    await expect(
      asOther.query(api.members.current.handler.current, { weddingId }),
    ).resolves.toBeNull();
  });
});
