import { AppErrorCode, throwAppError } from "@pompeii/errors/convex";
import type { MutationCtx, QueryCtx } from "../../_generated/server";
import type { Id } from "../../_generated/dataModel";

export async function findTaskForWorkspace(
  ctx: MutationCtx | QueryCtx,
  taskId: Id<"tasks">,
  weddingId: Id<"weddings">,
) {
  const task = await ctx.db.get(taskId);
  if (
    task === null ||
    task.weddingId !== weddingId ||
    task.deletedAt !== null
  ) {
    return null;
  }
  return task;
}

export async function getTaskForWorkspace(
  ctx: MutationCtx | QueryCtx,
  taskId: Id<"tasks">,
  weddingId: Id<"weddings">,
  notFoundCode: AppErrorCode = AppErrorCode.tasks.NOT_FOUND,
) {
  const task = await findTaskForWorkspace(ctx, taskId, weddingId);
  if (task === null) {
    throwAppError(notFoundCode);
  }
  return task;
}
