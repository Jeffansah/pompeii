import { describe, expect, it } from "vitest";

import { parseClientError } from "@pompeii/errors";
import { api, components } from "../../_generated/api";
import { makeConvexTest, signIn } from "../../test.setup";
import { addMember } from "../../weddings/lib/members";
import {
  SEED_WEDDING_MEMBERS,
  seedWeddingMembersById,
} from "../../weddings/lib/seedMembers";

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

const firstPage = { numItems: 15, cursor: null };

describe("members/search", () => {
  it("refuses an unauthenticated caller", async () => {
    const t = makeConvexTest();
    const weddingId = await t.run((ctx) =>
      ctx.db.insert("weddings", {
        name: "Amara & Tomi",
        slug: "amara-tomi",
        couple: [
          { id: null, name: "Amara" },
          { id: null, name: "Tomi" },
        ],
      }),
    );

    const error = await t
      .query(api.members.search.handler.search, {
        weddingId,
        search: "",
        paginationOpts: firstPage,
      })
      .catch((caught: unknown) => caught);

    expect(parseClientError(error)?.code).toBe("UNAUTHENTICATED");
  });

  it("returns the first page of wedding members", async () => {
    const t = makeConvexTest();
    const asOwner = await signIn(t, "owner@example.com");
    await createWedding(asOwner);
    const weddingId = await weddingIdFor(t);
    await t.run((ctx) => seedWeddingMembersById(ctx, weddingId));

    const result = await asOwner.query(api.members.search.handler.search, {
      weddingId,
      search: "",
      paginationOpts: firstPage,
    });

    expect(result.page).toHaveLength(1 + SEED_WEDDING_MEMBERS.length);
    expect(result.isDone).toBe(true);
    expect(result.page[0]).toMatchObject({
      displayName: "Amara",
      role: "couple",
      isSelf: true,
    });
    expect(result.page.filter((member) => member.isSelf)).toHaveLength(1);
  });

  it("puts the current member first", async () => {
    const t = makeConvexTest();
    const asOwner = await signIn(t, "owner@example.com");
    await createWedding(asOwner);
    const weddingId = await weddingIdFor(t);
    await t.run((ctx) => seedWeddingMembersById(ctx, weddingId));

    const asOther = await signIn(t, "pat@example.com");
    await t.run(async (ctx) => {
      const authUser = (await ctx.runQuery(
        components.betterAuth.adapter.findOne,
        {
          model: "user",
          where: [{ field: "email", value: "pat@example.com" }],
        },
      )) as { _id: string } | null;
      const appUser = await ctx.db
        .query("users")
        .withIndex("by_userId", (q) => q.eq("userId", authUser!._id))
        .unique();
      await addMember(ctx, {
        userId: appUser!._id,
        weddingId,
        displayName: "Pat Lee",
        role: "planner",
      });
    });

    const result = await asOther.query(api.members.search.handler.search, {
      weddingId,
      search: "",
      paginationOpts: firstPage,
    });

    expect(result.page[0]).toMatchObject({
      displayName: "Pat Lee",
      role: "planner",
      isSelf: true,
    });
    expect(result.page.filter((member) => member.isSelf)).toHaveLength(1);
  });

  it("filters members by display name", async () => {
    const t = makeConvexTest();
    const asOwner = await signIn(t, "owner@example.com");
    await createWedding(asOwner);
    const weddingId = await weddingIdFor(t);
    await t.run((ctx) => seedWeddingMembersById(ctx, weddingId));

    const result = await asOwner.query(api.members.search.handler.search, {
      weddingId,
      search: "Maya",
      paginationOpts: firstPage,
    });

    expect(result.page).toEqual([
      expect.objectContaining({
        displayName: "Maya Chen",
        role: "bridesmaid",
        isSelf: false,
      }),
    ]);
  });

  it("stays on the current wedding", async () => {
    const t = makeConvexTest();
    const asOwner = await signIn(t, "owner@example.com");
    await createWedding(asOwner);
    const weddingId = await weddingIdFor(t);
    await t.run((ctx) => seedWeddingMembersById(ctx, weddingId));

    const asOther = await signIn(t, "other@example.com");
    await asOther.mutation(api.weddings.saveDraft.handler.saveDraft, {
      step: 1,
      name: "Other Wedding",
    });
    await asOther.mutation(api.weddings.saveDraft.handler.saveDraft, {
      step: 2,
      coupleA: "Sam",
      coupleB: "Lee",
    });
    await asOther.mutation(api.weddings.create.handler.create, {});

    const error = await asOther
      .query(api.members.search.handler.search, {
        weddingId,
        search: "",
        paginationOpts: firstPage,
      })
      .catch((caught: unknown) => caught);

    expect(parseClientError(error)?.code).toBe("WEDDINGS_ENTER_NOT_FOUND");
  });
});

describe("members seed", () => {
  it("inserts dummy members once", async () => {
    const t = makeConvexTest();
    const asOwner = await signIn(t, "owner@example.com");
    await createWedding(asOwner);
    const weddingId = await weddingIdFor(t);

    await t.run((ctx) => seedWeddingMembersById(ctx, weddingId));
    await t.run((ctx) => seedWeddingMembersById(ctx, weddingId));

    const members = await t.run(async (ctx) =>
      ctx.db
        .query("weddingMembers")
        .withIndex("by_weddingId", (q) => q.eq("weddingId", weddingId))
        .take(32),
    );

    expect(members).toHaveLength(1 + SEED_WEDDING_MEMBERS.length);
    expect(members.filter((member) => member.role === "planner")).toHaveLength(
      2,
    );
  });
});
