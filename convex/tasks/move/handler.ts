import { v } from "convex/values";

import type { Id } from "../../_generated/dataModel";
import { workspaceAuthorizedMutation } from "../../lib/customFunctions/workspaceAuthorizedMutation";
import { getTaskForWorkspace } from "../lib/getTask";
import { transitionTask } from "../lib/transition";
import {
  taskStatusValidator,
  taskValidator,
  toTaskView,
} from "../lib/validators";

export const move = workspaceAuthorizedMutation({
  args: {
    taskId: v.id("tasks"),
    status: taskStatusValidator,
  },
  returns: taskValidator,
  handler: async (ctx, rawArgs) => {
    const { taskId, status } = rawArgs as {
      taskId: Id<"tasks">;
      status: "todo" | "in_progress" | "completed";
    };
    const task = await getTaskForWorkspace(ctx, taskId, ctx.workspace._id);
    const moved = await transitionTask(ctx, task, ctx.user._id, status);
    return toTaskView(ctx, moved, ctx.user._id);
  },
});
