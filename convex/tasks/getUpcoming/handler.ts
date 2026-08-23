import { v } from "convex/values";

import { workspaceAuthorizedQuery } from "../../lib/customFunctions/workspaceAuthorizedQuery";
import { taskValidator, toTaskView } from "../lib/validators";

export const getUpcoming = workspaceAuthorizedQuery({
  args: {},
  returns: v.array(taskValidator),
  handler: async (ctx) => {
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_wedding_deleted_completed_dueAsc", (q) =>
        q
          .eq("weddingId", ctx.workspace._id)
          .eq("deletedAt", null)
          .eq("completedAt", null),
      )
      .order("asc")
      .take(5);
    return await Promise.all(tasks.map((task) => toTaskView(ctx, task)));
  },
});
