import { v } from "convex/values";

import { AppErrorCode, throwAppError } from "@pompeii/errors/convex";
import { workspaceAuthorizedMutation } from "../../lib/customFunctions/workspaceAuthorizedMutation";
import type { Id } from "../../_generated/dataModel";
import { recordTaskActivity } from "../lib/activity";
import { getTaskForWorkspace } from "../lib/getTask";

export const deleteTask = workspaceAuthorizedMutation({
  args: { taskId: v.id("tasks") },
  returns: v.null(),
  handler: async (ctx, rawArgs) => {
    const args = rawArgs as { taskId: Id<"tasks"> };
    const task = await getTaskForWorkspace(ctx, args.taskId, ctx.workspace._id);
    if (task.createdBy !== ctx.user._id) {
      throwAppError(AppErrorCode.tasks.NOT_AUTHORIZED);
    }
    if (task.status === "completed") {
      throwAppError(AppErrorCode.tasks.COMPLETED_IMMUTABLE);
    }
    if (task.status === "in_progress") {
      throwAppError(AppErrorCode.tasks.DELETE_IN_PROGRESS);
    }
    await ctx.db.patch(args.taskId, { deletedAt: Date.now() });
    await recordTaskActivity(ctx, {
      weddingId: task.weddingId,
      taskId: task._id,
      actorId: ctx.user._id,
      kind: "deleted",
    });
    return null;
  },
});
