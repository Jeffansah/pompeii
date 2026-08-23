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

async function addMember(
  t: ReturnType<typeof makeConvexTest>,
  weddingId: Awaited<ReturnType<typeof weddingFor>>["weddingId"],
  email: string,
) {
  const member = await signIn(t, email);
  const user = await t.run(async (ctx) =>
    ctx.db.query("users").order("desc").first(),
  );
  if (user === null) throw new Error("Expected a user");
  await t.run((ctx) =>
    ctx.db.insert("weddingMembers", {
      weddingId,
      userId: user._id,
      displayName: email,
      role: "planner",
    }),
  );
  return { member, userId: user._id };
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
    await expect(
      owner.query(api.tasks.get.handler.get, {
        weddingId,
        taskId: task._id,
      }),
    ).resolves.toBeNull();
    await expect(
      owner.query(api.tasks.get.handler.get, {
        weddingId,
        taskId: "not-a-task-id",
      }),
    ).resolves.toBeNull();

    const completedTask = await owner.mutation(
      api.tasks.create.handler.create,
      {
        weddingId,
        title: "Finalize the seating",
      },
    );
    await owner.mutation(api.tasks.start.handler.start, {
      weddingId,
      taskId: completedTask._id,
    });
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
    await expect(
      owner.mutation(api.tasks.update.handler.update, {
        weddingId,
        taskId: completedTask._id,
        title: "Changed after completion",
      }),
    ).rejects.toSatisfy(
      (caught: unknown) =>
        parseClientError(caught)?.code === "TASKS_COMPLETED_IMMUTABLE",
    );
  });

  it("lets the creator start an unassigned task", async () => {
    const t = makeConvexTest();
    const { owner, weddingId } = await weddingFor(t);
    const task = await owner.mutation(api.tasks.create.handler.create, {
      weddingId,
      title: "Confirm the menu",
    });
    const started = await owner.mutation(api.tasks.move.handler.move, {
      weddingId,
      taskId: task._id,
      status: "in_progress",
    });
    expect(started).toMatchObject({
      assignedTo: expect.any(String),
      status: "in_progress",
    });
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

  it("keeps advertised transitions in parity with mutation authorization", async () => {
    const t = makeConvexTest();
    const { owner, weddingId } = await weddingFor(t);
    const ownerId = await t.run(async (ctx) => {
      const member = await ctx.db
        .query("weddingMembers")
        .withIndex("by_weddingId", (q) => q.eq("weddingId", weddingId))
        .unique();
      return member!.userId;
    });
    const task = await owner.mutation(api.tasks.create.handler.create, {
      weddingId,
      title: "Move through every state",
      assignedTo: ownerId,
    });
    const todoView = await owner.query(api.tasks.get.handler.get, {
      weddingId,
      taskId: task._id,
    });
    expect(todoView?.capabilities.allowedTransitions).toEqual(["in_progress"]);

    const inProgress = await owner.mutation(api.tasks.move.handler.move, {
      weddingId,
      taskId: task._id,
      status: "in_progress",
    });
    expect(inProgress.capabilities.allowedTransitions).toEqual([
      "todo",
      "completed",
    ]);
    const completed = await owner.mutation(api.tasks.move.handler.move, {
      weddingId,
      taskId: task._id,
      status: "completed",
    });
    expect(completed.capabilities.allowedTransitions).toEqual(["in_progress"]);
    await expect(
      owner.mutation(api.tasks.move.handler.move, {
        weddingId,
        taskId: task._id,
        status: "in_progress",
      }),
    ).resolves.toMatchObject({ status: "in_progress" });
  });

  it("does not advertise or permit unassigned transitions to another member", async () => {
    const t = makeConvexTest();
    const { owner, weddingId } = await weddingFor(t);
    const { member } = await addMember(t, weddingId, "unrelated@example.com");
    const task = await owner.mutation(api.tasks.create.handler.create, {
      weddingId,
      title: "Owner-only transition",
    });
    const view = await member.query(api.tasks.get.handler.get, {
      weddingId,
      taskId: task._id,
    });
    expect(view?.capabilities.allowedTransitions).toEqual([]);
    await expect(
      member.mutation(api.tasks.move.handler.move, {
        weddingId,
        taskId: task._id,
        status: "in_progress",
      }),
    ).rejects.toSatisfy(
      (error: unknown) =>
        parseClientError(error)?.code === "TASKS_NOT_AUTHORIZED",
    );
  });

  it("does not advertise or permit deletion while in progress", async () => {
    const t = makeConvexTest();
    const { owner, weddingId } = await weddingFor(t);
    const task = await owner.mutation(api.tasks.create.handler.create, {
      weddingId,
      title: "In-progress deletion",
    });
    await owner.mutation(api.tasks.move.handler.move, {
      weddingId,
      taskId: task._id,
      status: "in_progress",
    });
    const view = await owner.query(api.tasks.get.handler.get, {
      weddingId,
      taskId: task._id,
    });
    expect(view?.capabilities.canDelete).toBe(false);
    await expect(
      owner.mutation(api.tasks.delete.handler.deleteTask, {
        weddingId,
        taskId: task._id,
      }),
    ).rejects.toSatisfy(
      (error: unknown) =>
        parseClientError(error)?.code === "TASKS_DELETE_IN_PROGRESS",
    );
  });

  it("keeps pickup and release capabilities in parity with mutations", async () => {
    const t = makeConvexTest();
    const { owner, weddingId } = await weddingFor(t);
    const task = await owner.mutation(api.tasks.create.handler.create, {
      weddingId,
      title: "Pickup and release",
    });
    expect(task.capabilities.canPickup).toBe(true);
    const pickedUp = await owner.mutation(api.tasks.pickup.handler.pickup, {
      weddingId,
      taskId: task._id,
    });
    expect(pickedUp.capabilities.canRelease).toBe(true);
    await expect(
      owner.mutation(api.tasks.release.handler.release, {
        weddingId,
        taskId: task._id,
      }),
    ).resolves.toMatchObject({
      assignedTo: null,
      capabilities: { canPickup: true, canRelease: false },
    });
  });

  it("rejects task detail reads from a workspace outsider", async () => {
    const t = makeConvexTest();
    const { owner, weddingId } = await weddingFor(t);
    const task = await owner.mutation(api.tasks.create.handler.create, {
      weddingId,
      title: "Private task",
    });
    const outsider = await signIn(t, "outsider@example.com");
    await expect(
      outsider.query(api.tasks.get.handler.get, {
        weddingId,
        taskId: task._id,
      }),
    ).rejects.toSatisfy(
      (error: unknown) =>
        parseClientError(error)?.code === "WEDDINGS_ENTER_NOT_FOUND",
    );
  });
});
