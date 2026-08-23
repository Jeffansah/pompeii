import { v } from "convex/values";

import { AppErrorCode, throwAppError } from "@pompeii/errors/convex";
import type { Id } from "../../_generated/dataModel";
import { workspaceAuthorizedMutation } from "../../lib/customFunctions/workspaceAuthorizedMutation";
import { recordTaskActivity } from "../lib/activity";
import { getTaskForWorkspace } from "../lib/getTask";
import { taskValidator, toTaskView } from "../lib/validators";

export const complete = workspaceAuthorizedMutation({
  args: { taskId: v.id("tasks") },
  returns: taskValidator,
  handler: async (ctx, rawArgs) => {
    const args = rawArgs as { taskId: Id<"tasks"> };
    const task = await getTaskForWorkspace(ctx, args.taskId, ctx.workspace._id);
    if (task.status === "completed") {
      throwAppError(AppErrorCode.tasks.ALREADY_COMPLETED);
    }

    await ctx.db.patch(args.taskId, {
      status: "completed",
      completionSource: "manual",
      completedAt: Date.now(),
      completedBy: ctx.user._id,
    });
    await recordTaskActivity(ctx, {
      weddingId: task.weddingId,
      taskId: task._id,
      actorId: ctx.user._id,
      kind: "completed",
      field: "status",
      previousValue: task.status,
      nextValue: "completed",
    });

    const completed = await ctx.db.get(args.taskId);
    if (completed === null) {
      throwAppError(AppErrorCode.INTERNAL);
    }
    return toTaskView(ctx, completed);
  },
});
