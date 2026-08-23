import { v } from "convex/values";

import type { Id } from "../../_generated/dataModel";
import { workspaceAuthorizedMutation } from "../../lib/customFunctions/workspaceAuthorizedMutation";
import { recordTaskActivity } from "../lib/activity";
import { getTaskForWorkspace } from "../lib/getTask";
import { taskValidator, toTaskView } from "../lib/validators";

export const start = workspaceAuthorizedMutation({
  args: { taskId: v.id("tasks") },
  returns: taskValidator,
  handler: async (ctx, rawArgs) => {
    const args = rawArgs as { taskId: Id<"tasks"> };
    const task = await getTaskForWorkspace(ctx, args.taskId, ctx.workspace._id);
    if (task.status !== "todo") {
      return toTaskView(ctx, task);
    }

    await ctx.db.patch(args.taskId, { status: "in_progress" });
    await recordTaskActivity(ctx, {
      weddingId: task.weddingId,
      taskId: task._id,
      actorId: ctx.user._id,
      kind: "status_changed",
      field: "status",
      previousValue: task.status,
      nextValue: "in_progress",
    });

    const started = await ctx.db.get(args.taskId);
    if (started === null) {
      return toTaskView(ctx, task);
    }
    return toTaskView(ctx, started);
  },
});
