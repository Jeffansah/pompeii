import {
  paginationOptsValidator,
  paginationResultValidator,
} from "convex/server";
import { v } from "convex/values";

import type { Id } from "../../_generated/dataModel";
import { workspaceAuthorizedQuery } from "../../lib/customFunctions/workspaceAuthorizedQuery";
import {
  taskFilterFields,
  taskSortValidator,
  taskStatusValidator,
  taskValidator,
  toTaskView,
  validateTaskSearch,
} from "../lib/validators";

const listArgs = {
  status: taskStatusValidator,
  ...taskFilterFields,
  sort: v.optional(taskSortValidator),
  paginationOpts: paginationOptsValidator,
};

export const list = workspaceAuthorizedQuery({
  args: listArgs,
  returns: paginationResultValidator(taskValidator),
  handler: async (ctx, rawArgs) => {
    const args = rawArgs as {
      status: "todo" | "in_progress" | "completed";
      title?: string;
      priority?: "low" | "normal" | "high" | "urgent";
      category?: string;
      assignedTo?: Id<"users"> | "unassigned";
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

    const title = validateTaskSearch(args.title);
    const assignedTo =
      args.assignedTo === "unassigned" ? null : args.assignedTo;
    const dueFrom = args.dueFrom;
    const dueTo = args.dueTo;
    if (title !== undefined) {
      let searchQuery = ctx.db
        .query("tasks")
        .withSearchIndex("search_title_v2", (q) => {
          let search = q
            .search("title", title)
            .eq("weddingId", ctx.workspace._id)
            .eq("status", args.status)
            .eq("deletedAt", null);
          if (args.priority !== undefined) {
            search = search.eq("priority", args.priority);
          }
          if (args.category !== undefined) {
            search = search.eq("category", args.category);
          }
          if (assignedTo !== undefined) {
            search = search.eq("assignedTo", assignedTo);
          }
          return search;
        });
      if (dueFrom !== undefined) {
        searchQuery = searchQuery.filter((q) =>
          q.gte(q.field("dueDate"), dueFrom),
        );
      }
      if (dueTo !== undefined) {
        searchQuery = searchQuery.filter((q) =>
          q.lte(q.field("dueDate"), dueTo),
        );
      }

      const page = await searchQuery.paginate(args.paginationOpts);
      return {
        ...page,
        page: await Promise.all(
          page.page.map((task) => toTaskView(ctx, task, ctx.user._id)),
        ),
      };
    }

    const hasDueDateRange =
      args.dueFrom !== undefined || args.dueTo !== undefined;
    const sort = args.sort ?? "default";
    const usesDueDateRangeIndex =
      hasDueDateRange && (sort === "dueDateAsc" || sort === "dueDateDesc");
    const usesAssigneeCreationIndex =
      assignedTo !== undefined &&
      (sort === "default" || sort === "createdAsc" || sort === "createdDesc");
    const taskQuery = usesDueDateRangeIndex
      ? ctx.db
          .query("tasks")
          .withIndex("by_wedding_status_deleted_due_priority", (q) =>
            q
              .eq("weddingId", ctx.workspace._id)
              .eq("status", args.status)
              .eq("deletedAt", null)
              .gte("dueDate", args.dueFrom ?? "")
              .lte("dueDate", args.dueTo ?? "9999-12-31"),
          )
      : usesAssigneeCreationIndex
        ? ctx.db
            .query("tasks")
            .withIndex(
              "by_weddingId_and_status_and_deletedAt_and_assignedTo",
              (q) =>
                q
                  .eq("weddingId", ctx.workspace._id)
                  .eq("status", args.status)
                  .eq("deletedAt", null)
                  .eq("assignedTo", assignedTo),
            )
        : sort === "default" || sort === "createdAsc" || sort === "createdDesc"
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
                    .withIndex("by_wedding_status_deletedAt", (q) =>
                      q
                        .eq("weddingId", ctx.workspace._id)
                        .eq("status", args.status)
                        .eq("deletedAt", null),
                    );

    let filteredQuery = taskQuery.order(
      sort === "createdDesc" ||
        (sort === "dueDateDesc" && usesDueDateRangeIndex)
        ? "desc"
        : "asc",
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
    if (assignedTo !== undefined && !usesAssigneeCreationIndex) {
      filteredQuery = filteredQuery.filter((q) =>
        q.eq(q.field("assignedTo"), assignedTo),
      );
    }
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
      page: await Promise.all(
        page.page.map((task) => toTaskView(ctx, task, ctx.user._id)),
      ),
    };
  },
});
