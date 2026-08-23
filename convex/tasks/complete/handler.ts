import { v } from "convex/values";

import { AppErrorCode, throwAppError } from "@pompeii/errors/convex";
import type { Id } from "../../_generated/dataModel";
import { workspaceAuthorizedMutation } from "../../lib/customFunctions/workspaceAuthorizedMutation";
import { getTaskForWorkspace } from "../lib/getTask";
import { transitionTask } from "../lib/transition";
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

    const completed = await transitionTask(
      ctx,
      task,
      ctx.user._id,
      "completed",
    );
    return toTaskView(ctx, completed, ctx.user._id);
  },
});
