import { AppErrorCode, throwAppError } from "@pompeii/errors/convex";

import type { Doc } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { taskCounts } from "./aggregate";

type TaskFields = Omit<Doc<"tasks">, "_creationTime" | "_id">;
type TaskPatch = Partial<TaskFields>;

async function syncTaskCount(
  ctx: MutationCtx,
  previous: Doc<"tasks">,
  next: Doc<"tasks">,
) {
  const wasActive = previous.deletedAt === null;
  const isActive = next.deletedAt === null;

  if (wasActive && isActive) {
    await taskCounts.replaceOrInsert(ctx, previous, next);
  } else if (wasActive) {
    await taskCounts.deleteIfExists(ctx, previous);
  } else if (isActive) {
    await taskCounts.insertIfDoesNotExist(ctx, next);
  }
}

export async function insertTask(ctx: MutationCtx, fields: TaskFields) {
  const taskId = await ctx.db.insert("tasks", fields);
  const task = await ctx.db.get("tasks", taskId);
  if (task === null) {
    throwAppError(AppErrorCode.INTERNAL);
  }
  if (task.deletedAt === null) {
    await taskCounts.insertIfDoesNotExist(ctx, task);
  }
  return task;
}

export async function patchTask(
  ctx: MutationCtx,
  task: Doc<"tasks">,
  patch: TaskPatch,
) {
  await ctx.db.patch("tasks", task._id, patch);
  const updated = await ctx.db.get("tasks", task._id);
  if (updated === null) {
    throwAppError(AppErrorCode.INTERNAL);
  }
  await syncTaskCount(ctx, task, updated);
  return updated;
}

export async function replaceTask(
  ctx: MutationCtx,
  task: Doc<"tasks">,
  fields: TaskFields,
) {
  await ctx.db.replace("tasks", task._id, fields);
  const updated = await ctx.db.get("tasks", task._id);
  if (updated === null) {
    throwAppError(AppErrorCode.INTERNAL);
  }
  await syncTaskCount(ctx, task, updated);
  return updated;
}
