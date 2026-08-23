import { v } from "convex/values";

import { AppErrorCode, throwAppError } from "@pompeii/errors/convex";
import { workspaceAuthorizedMutation } from "../../lib/customFunctions/workspaceAuthorizedMutation";
import type { Id } from "../../_generated/dataModel";
import { recordTaskActivity } from "../lib/activity";
import { canDeleteTask, canEditTask } from "../lib/capabilities";
import { getTaskForWorkspace } from "../lib/getTask";
import { patchTask } from "../lib/taskDb";

export const deleteTask = workspaceAuthorizedMutation({
  args: { taskId: v.id("tasks") },
  returns: v.null(),
  handler: async (ctx, rawArgs) => {
    const args = rawArgs as { taskId: Id<"tasks"> };
    const task = await getTaskForWorkspace(ctx, args.taskId, ctx.workspace._id);
    if (task.status === "completed") {
      throwAppError(AppErrorCode.tasks.COMPLETED_IMMUTABLE);
    }
    if (!canEditTask(task, ctx.user._id)) {
      throwAppError(AppErrorCode.tasks.NOT_AUTHORIZED);
    }
    if (!canDeleteTask(task, ctx.user._id) && task.status === "in_progress") {
      throwAppError(AppErrorCode.tasks.DELETE_IN_PROGRESS);
    }
    await patchTask(ctx, task, { deletedAt: Date.now() });
    await recordTaskActivity(ctx, {
      weddingId: task.weddingId,
      taskId: task._id,
      actorId: ctx.user._id,
      kind: "deleted",
    });
    return null;
  },
});
