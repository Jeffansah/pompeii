import {
  paginationOptsValidator,
  paginationResultValidator,
} from "convex/server";
import { v } from "convex/values";

import type { Id } from "../../_generated/dataModel";
import { workspaceAuthorizedQuery } from "../../lib/customFunctions/workspaceAuthorizedQuery";
import {
  taskPriorityValidator,
  taskSortValidator,
  taskStatusValidator,
  taskValidator,
  toTaskView,
} from "../lib/validators";

const listArgs = {
  status: taskStatusValidator,
  priority: v.optional(taskPriorityValidator),
  category: v.optional(v.string()),
  assignedTo: v.optional(v.union(v.id("users"), v.null())),
  dueFrom: v.optional(v.string()),
  dueTo: v.optional(v.string()),
  sort: v.optional(taskSortValidator),
  paginationOpts: paginationOptsValidator,
};

export const list = workspaceAuthorizedQuery({
  args: listArgs,
  returns: paginationResultValidator(taskValidator),
  handler: async (ctx, rawArgs) => {
    const args = rawArgs as {
      status: "todo" | "in_progress" | "completed";
      priority?: "low" | "normal" | "high" | "urgent";
      category?: string;
      assignedTo?: Id<"users"> | null;
      dueFrom?: string;
      dueTo?: string;
      sort?:
        | "default"
        | "dueDateAsc"
        | "dueDateDesc"
        | "priority"
        | "createdDesc"
        | "createdAsc";
      paginationOpts: {
        numItems: number;
        cursor: string | null;
        endCursor?: string | null;
        maximumRowsRead?: number;
        maximumBytesRead?: number;
        id?: number;
      };
    };

    const hasDueDateRange =
      args.dueFrom !== undefined || args.dueTo !== undefined;
    const sort = args.sort ?? "default";
    const usesDueDateRangeIndex =
      hasDueDateRange && (sort === "dueDateAsc" || sort === "dueDateDesc");
    const taskQuery = usesDueDateRangeIndex
      ? ctx.db
          .query("tasks")
          .withIndex("by_weddingId_status_deletedAt_dueDate_sortAt", (q) =>
            q
              .eq("weddingId", ctx.workspace._id)
              .eq("status", args.status)
              .eq("deletedAt", null)
              .gte("dueDate", args.dueFrom ?? "")
              .lte("dueDate", args.dueTo ?? "9999-12-31"),
          )
      : sort === "default"
        ? ctx.db
            .query("tasks")
            .withIndex("by_wedding_status_deletedAt", (q) =>
              q
                .eq("weddingId", ctx.workspace._id)
                .eq("status", args.status)
                .eq("deletedAt", null),
            )
        : sort === "dueDateAsc"
          ? ctx.db
              .query("tasks")
              .withIndex("by_wedding_status_deletedAt_dueAsc", (q) =>
                q
                  .eq("weddingId", ctx.workspace._id)
                  .eq("status", args.status)
                  .eq("deletedAt", null),
              )
          : sort === "dueDateDesc"
            ? ctx.db
                .query("tasks")
                .withIndex("by_wedding_status_deletedAt_dueDesc", (q) =>
                  q
                    .eq("weddingId", ctx.workspace._id)
                    .eq("status", args.status)
                    .eq("deletedAt", null),
                )
            : sort === "priority"
              ? ctx.db
                  .query("tasks")
                  .withIndex("by_wedding_status_deletedAt_priority", (q) =>
                    q
                      .eq("weddingId", ctx.workspace._id)
                      .eq("status", args.status)
                      .eq("deletedAt", null),
                  )
              : ctx.db
                  .query("tasks")
                  .withIndex("by_wedding_status_deletedAt_created", (q) =>
                    q
                      .eq("weddingId", ctx.workspace._id)
                      .eq("status", args.status)
                      .eq("deletedAt", null),
                  );

    let filteredQuery = taskQuery.order(
      sort === "dueDateDesc" || sort === "createdDesc" ? "desc" : "asc",
    );
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
    const dueFrom = args.dueFrom;
    const dueTo = args.dueTo;
    if (!usesDueDateRangeIndex && dueFrom !== undefined) {
      filteredQuery = filteredQuery.filter((q) =>
        q.gte(q.field("dueDate"), dueFrom),
      );
    }
    if (!usesDueDateRangeIndex && dueTo !== undefined) {
      filteredQuery = filteredQuery.filter((q) =>
        q.lte(q.field("dueDate"), dueTo),
      );
    }

    const page = await filteredQuery.paginate(args.paginationOpts);
    return {
      ...page,
      page: await Promise.all(page.page.map((task) => toTaskView(ctx, task))),
    };
  },
});
