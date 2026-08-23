import { describe, expect, it } from "vitest";

import { parseClientError } from "@pompeii/errors";
import { api } from "../_generated/api";
import { makeConvexTest, signIn } from "../test.setup";

async function weddingFor(t: ReturnType<typeof makeConvexTest>) {
  const owner = await signIn(t, "owner@example.com");
  await owner.mutation(api.weddings.saveDraft.handler.saveDraft, {
    step: 1,
    name: "Amara & Tomi",
  });
  await owner.mutation(api.weddings.saveDraft.handler.saveDraft, {
    step: 2,
    coupleA: "Amara",
    coupleB: "Tomi",
  });
  await owner.mutation(api.weddings.create.handler.create, {});
  const weddingId = await t.run(
    async (ctx) => (await ctx.db.query("weddings").unique())!._id,
  );
  return { owner, weddingId };
}

describe("task actions", () => {
  it("lets a member pick up an unassigned task", async () => {
    const t = makeConvexTest();
    const { owner, weddingId } = await weddingFor(t);
    const task = await owner.mutation(api.tasks.create.handler.create, {
      weddingId,
      title: "Confirm the menu",
    });
    const pickedUp = await owner.mutation(api.tasks.pickup.handler.pickup, {
      weddingId,
      taskId: task._id,
    });
    expect(pickedUp.assignedTo).not.toBeNull();
  });

  it("soft deletes a to do task and blocks completed deletion", async () => {
    const t = makeConvexTest();
    const { owner, weddingId } = await weddingFor(t);
    const task = await owner.mutation(api.tasks.create.handler.create, {
      weddingId,
      title: "Confirm the menu",
    });
    await owner.mutation(api.tasks.delete.handler.deleteTask, {
      weddingId,
      taskId: task._id,
    });
    await expect(
      t.run(async (ctx) => {
        const deleted = await ctx.db.get(task._id);
        return deleted?.deletedAt;
      }),
    ).resolves.toEqual(expect.any(Number));

    const completedTask = await owner.mutation(
      api.tasks.create.handler.create,
      {
        weddingId,
        title: "Finalize the seating",
      },
    );
    await owner.mutation(api.tasks.complete.handler.complete, {
      weddingId,
      taskId: completedTask._id,
    });
    const error = await owner
      .mutation(api.tasks.delete.handler.deleteTask, {
        weddingId,
        taskId: completedTask._id,
      })
      .catch((caught: unknown) => caught);
    expect(parseClientError(error)?.code).toBe("TASKS_COMPLETED_IMMUTABLE");
  });

  it("rejects forward movement without an assignment", async () => {
    const t = makeConvexTest();
    const { owner, weddingId } = await weddingFor(t);
    const task = await owner.mutation(api.tasks.create.handler.create, {
      weddingId,
      title: "Confirm the menu",
    });
    const error = await owner
      .mutation(api.tasks.move.handler.move, {
        weddingId,
        taskId: task._id,
        status: "in_progress",
      })
      .catch((caught: unknown) => caught);
    expect(parseClientError(error)?.code).toBe("TASKS_ASSIGNMENT_REQUIRED");
  });

  it("allows status movement only to the assigned member", async () => {
    const t = makeConvexTest();
    const { owner, weddingId } = await weddingFor(t);
    const other = await signIn(t, "planner@example.com");
    const [ownerUser, otherUser] = await t.run(async (ctx) =>
      ctx.db.query("users").take(2),
    );
    await t.run(async (ctx) =>
      ctx.db.insert("weddingMembers", {
        userId: otherUser!._id,
        weddingId,
        displayName: "Planner",
        role: "planner",
      }),
    );
    const task = await owner.mutation(api.tasks.create.handler.create, {
      weddingId,
      title: "Confirm the menu",
      assignedTo: ownerUser!._id,
    });
    const error = await other
      .mutation(api.tasks.move.handler.move, {
        weddingId,
        taskId: task._id,
        status: "in_progress",
      })
      .catch((caught: unknown) => caught);
    expect(parseClientError(error)?.code).toBe("TASKS_NOT_AUTHORIZED");
  });
});
