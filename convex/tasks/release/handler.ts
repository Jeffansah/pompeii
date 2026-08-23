import { v } from "convex/values";

import { AppErrorCode, throwAppError } from "@pompeii/errors/convex";
import type { Id } from "../../_generated/dataModel";
import { workspaceAuthorizedMutation } from "../../lib/customFunctions/workspaceAuthorizedMutation";
import { recordTaskActivity } from "../lib/activity";
import { getTaskForWorkspace } from "../lib/getTask";
import { taskValidator, toTaskView } from "../lib/validators";

export const release = workspaceAuthorizedMutation({
  args: { taskId: v.id("tasks") },
  returns: taskValidator,
  handler: async (ctx, rawArgs) => {
    const { taskId } = rawArgs as { taskId: Id<"tasks"> };
    const task = await getTaskForWorkspace(ctx, taskId, ctx.workspace._id);

    if (task.assignedTo !== ctx.user._id) {
      throwAppError(AppErrorCode.tasks.NOT_ASSIGNED_TO_USER);
    }
    if (task.status !== "todo") {
      throwAppError(AppErrorCode.tasks.RELEASE_TODO_REQUIRED);
    }

    await ctx.db.patch(taskId, { assignedTo: null });
    await recordTaskActivity(ctx, {
      weddingId: task.weddingId,
      taskId: task._id,
      actorId: ctx.user._id,
      kind: "assigned",
      field: "assignedTo",
      previousValue: ctx.user._id,
      nextValue: "",
    });

    const released = await ctx.db.get(taskId);
    if (released === null) {
      throwAppError(AppErrorCode.INTERNAL);
    }
    return toTaskView(ctx, released);
  },
});
