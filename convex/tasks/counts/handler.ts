import type { GenericDatabaseReader } from "convex/server";
import { v } from "convex/values";

import type { DataModel, Doc, Id } from "../../_generated/dataModel";
import { workspaceAuthorizedQuery } from "../../lib/customFunctions/workspaceAuthorizedQuery";
import { taskPriorityValidator } from "../lib/validators";

const countArgs = {
  priority: v.optional(taskPriorityValidator),
  category: v.optional(v.string()),
  assignedTo: v.optional(v.union(v.id("users"), v.null())),
  dueFrom: v.optional(v.string()),
  dueTo: v.optional(v.string()),
};

type CountArgs = {
  priority?: "low" | "normal" | "high" | "urgent";
  category?: string;
  assignedTo?: Id<"users"> | null;
  dueFrom?: string;
  dueTo?: string;
};

type CountContext = {
  db: GenericDatabaseReader<DataModel>;
  workspace: Doc<"weddings">;
};

async function countStatus(
  ctx: CountContext,
  status: "todo" | "in_progress" | "completed",
  args: CountArgs,
) {
  const hasDueDateRange =
    args.dueFrom !== undefined || args.dueTo !== undefined;
  const taskQuery = hasDueDateRange
    ? ctx.db
        .query("tasks")
        .withIndex("by_weddingId_status_deletedAt_dueDate_sortAt", (q) =>
          q
            .eq("weddingId", ctx.workspace._id)
            .eq("status", status)
            .eq("deletedAt", null)
            .gte("dueDate", args.dueFrom ?? "")
            .lte("dueDate", args.dueTo ?? "9999-12-31"),
        )
    : ctx.db
        .query("tasks")
        .withIndex("by_weddingId_and_status_and_deletedAt_and_sortAt", (q) =>
          q
            .eq("weddingId", ctx.workspace._id)
            .eq("status", status)
            .eq("deletedAt", null),
        );

  let filteredQuery = taskQuery;
  if (args.priority !== undefined) {
    filteredQuery = filteredQuery.filter((q) =>
      q.eq(q.field("priority"), args.priority),
    );
  }
  if (args.category !== undefined) {
    filteredQuery = filteredQuery.filter((q) =>
      q.eq(q.field("category"), args.category),
    );
  }
  if (args.assignedTo !== undefined) {
    filteredQuery = filteredQuery.filter((q) =>
      q.eq(q.field("assignedTo"), args.assignedTo),
    );
  }

  return (await filteredQuery.collect()).length;
}

export const counts = workspaceAuthorizedQuery({
  args: countArgs,
  returns: v.object({
    todo: v.number(),
    in_progress: v.number(),
    completed: v.number(),
  }),
  handler: async (ctx, rawArgs) => {
    const args = rawArgs as CountArgs;
    const [todo, inProgress, completed] = await Promise.all([
      countStatus(ctx, "todo", args),
      countStatus(ctx, "in_progress", args),
      countStatus(ctx, "completed", args),
    ]);

    return {
      todo,
      in_progress: inProgress,
      completed,
    };
  },
});
