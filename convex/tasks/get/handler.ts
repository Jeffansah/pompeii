import { v } from "convex/values";

import { workspaceAuthorizedQuery } from "../../lib/customFunctions/workspaceAuthorizedQuery";
import type { Id } from "../../_generated/dataModel";
import { getTaskForWorkspace } from "../lib/getTask";
import { taskValidator, toTaskView } from "../lib/validators";

export const get = workspaceAuthorizedQuery({
  args: { taskId: v.id("tasks") },
  returns: v.union(v.null(), taskValidator),
  handler: async (ctx, rawArgs) => {
    const args = rawArgs as { taskId: Id<"tasks"> };
    const task = await getTaskForWorkspace(ctx, args.taskId, ctx.workspace._id);
    return toTaskView(ctx, task);
  },
});
