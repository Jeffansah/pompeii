import { v } from "convex/values";

import { workspaceAuthorizedQuery } from "../../lib/customFunctions/workspaceAuthorizedQuery";
import { taskValidator, toTaskView } from "../lib/validators";

export const getCompleted = workspaceAuthorizedQuery({
  args: {},
  returns: v.array(taskValidator),
  handler: async (ctx) => {
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_weddingId_and_deletedAt_and_completedAt_and_sortAt", (q) =>
        q
          .eq("weddingId", ctx.workspace._id)
          .eq("deletedAt", null)
          .gt("completedAt", 0),
      )
      .order("desc")
      .collect();
    return await Promise.all(tasks.map((task) => toTaskView(ctx, task)));
  },
});
