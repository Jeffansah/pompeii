import { describe, expect, it } from "vitest";

import { parseClientError } from "@pompeii/errors";
import { api } from "../_generated/api";
import { makeConvexTest, signIn } from "../test.setup";

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

describe("tasks", () => {
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
      .mutation(api.tasks.create.handler.create, {
        weddingId,
        title: "Confirm the menu",
      })
      .catch((caught: unknown) => caught);

    expect(parseClientError(error)?.code).toBe("UNAUTHENTICATED");
  });

  it("creates and returns upcoming tasks for a wedding member", async () => {
    const t = makeConvexTest();
    const asOwner = await signIn(t, "owner@example.com");
    await createWedding(asOwner);
    const weddingId = await weddingIdFor(t);

    await asOwner.mutation(api.tasks.create.handler.create, {
      weddingId,
      title: "Confirm the menu",
      dueDate: "2026-08-22",
      priority: "high",
      category: "Planning",
    });

    await expect(
      asOwner.query(api.tasks.getUpcoming.handler.getUpcoming, { weddingId }),
    ).resolves.toMatchObject([
      {
        title: "Confirm the menu",
        dueDate: "2026-08-22",
        priority: "high",
        status: "todo",
        completedAt: null,
        deletedAt: null,
      },
    ]);
  });

  it("removes a completed task from upcoming tasks", async () => {
    const t = makeConvexTest();
    const asOwner = await signIn(t, "owner@example.com");
    await createWedding(asOwner);
    const weddingId = await weddingIdFor(t);

    const task = await asOwner.mutation(api.tasks.create.handler.create, {
      weddingId,
      title: "Confirm the menu",
    });

    const completed = await asOwner.mutation(
      api.tasks.complete.handler.complete,
      {
        weddingId,
        taskId: task._id,
      },
    );

    expect(completed).toMatchObject({
      status: "completed",
      completionSource: "manual",
      completedBy: expect.any(String),
    });
    await expect(
      asOwner.query(api.tasks.getUpcoming.handler.getUpcoming, { weddingId }),
    ).resolves.toEqual([]);
  });

  it("assigns a wedding member and rejects a stranger", async () => {
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

    const assigned = await asOwner.mutation(api.tasks.create.handler.create, {
      weddingId,
      title: "Confirm the menu",
      assignedTo: ownerId,
    });
    expect(assigned).toMatchObject({
      assignedTo: ownerId,
      assigneeName: "Amara",
    });

    const strangerId = await t.run((ctx) =>
      ctx.db.insert("users", { userId: "stranger" }),
    );
    const error = await asOwner
      .mutation(api.tasks.create.handler.create, {
        weddingId,
        title: "Book the band",
        assignedTo: strangerId,
      })
      .catch((caught: unknown) => caught);
    expect(parseClientError(error)?.code).toBe("TASKS_ASSIGNEE_NOT_FOUND");
  });
});
