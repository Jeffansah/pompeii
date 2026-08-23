import { v } from "convex/values";

import { workspaceAuthorizedQuery } from "../../lib/customFunctions/workspaceAuthorizedQuery";
import { findTaskForWorkspace } from "../lib/getTask";
import { taskDetailValidator, toTaskDetailView } from "../lib/validators";

export const get = workspaceAuthorizedQuery({
  args: { taskId: v.string() },
  returns: v.union(v.null(), taskDetailValidator),
  handler: async (ctx, rawArgs) => {
    const args = rawArgs as { taskId: string };
    const taskId = ctx.db.normalizeId("tasks", args.taskId);
    if (taskId === null) {
      return null;
    }
    const task = await findTaskForWorkspace(ctx, taskId, ctx.workspace._id);
    if (task === null) {
      return null;
    }
    return toTaskDetailView(ctx, task, ctx.user._id);
  },
});
