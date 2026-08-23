import { v } from "convex/values";

import type { Id } from "../../_generated/dataModel";
import { workspaceAuthorizedMutation } from "../../lib/customFunctions/workspaceAuthorizedMutation";
import { getTaskForWorkspace } from "../lib/getTask";
import { transitionTask } from "../lib/transition";
import { taskValidator, toTaskView } from "../lib/validators";

export const start = workspaceAuthorizedMutation({
  args: { taskId: v.id("tasks") },
  returns: taskValidator,
  handler: async (ctx, rawArgs) => {
    const args = rawArgs as { taskId: Id<"tasks"> };
    const task = await getTaskForWorkspace(ctx, args.taskId, ctx.workspace._id);
    const started = await transitionTask(
      ctx,
      task,
      ctx.user._id,
      "in_progress",
    );
    return toTaskView(ctx, started, ctx.user._id);
  },
});
