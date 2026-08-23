import { v } from "convex/values";

import type { Doc, Id } from "../../_generated/dataModel";
import type { QueryCtx } from "../../_generated/server";
import { workspaceAuthorizedQuery } from "../../lib/customFunctions/workspaceAuthorizedQuery";
import { priorityRank } from "../lib/ordering";
import { taskCounts } from "../lib/aggregate";
import { taskFilterFields, validateTaskSearch } from "../lib/validators";

const countArgs = taskFilterFields;
const DISPLAY_COUNT_CAP = 99;
const COUNT_READ_LIMIT = DISPLAY_COUNT_CAP + 1;
const statuses = ["todo", "in_progress", "completed"] as const;

type CountArgs = {
  title?: string;
  priority?: "low" | "normal" | "high" | "urgent";
  category?: string;
  assignedTo?: Id<"users"> | "unassigned";
  dueFrom?: string;
  dueTo?: string;
};

type NormalizedCountArgs = Omit<CountArgs, "assignedTo" | "title"> & {
  assignedTo?: Id<"users"> | null;
  title?: string;
};

type CountContext = QueryCtx & {
  workspace: Doc<"weddings">;
};

const countResultValidator = v.object({
  value: v.number(),
  capped: v.boolean(),
});

function toCountResult(count: number) {
  return {
    value: Math.min(count, DISPLAY_COUNT_CAP),
    capped: count > DISPLAY_COUNT_CAP,
  };
}

async function countStatus(
  ctx: CountContext,
  status: "todo" | "in_progress" | "completed",
  args: NormalizedCountArgs,
) {
  if (args.title !== undefined) {
    let searchQuery = ctx.db
      .query("tasks")
      .withSearchIndex("search_title_v2", (q) => {
        let search = q
          .search("title", args.title!)
          .eq("weddingId", ctx.workspace._id)
          .eq("status", status)
          .eq("deletedAt", null);
        if (args.priority !== undefined) {
          search = search.eq("priority", args.priority);
        }
        if (args.category !== undefined) {
          search = search.eq("category", args.category);
        }
        if (args.assignedTo !== undefined) {
          search = search.eq("assignedTo", args.assignedTo);
        }
        return search;
      });
    if (args.dueFrom !== undefined) {
      const dueFrom = args.dueFrom;
      searchQuery = searchQuery.filter((q) =>
        q.gte(q.field("dueDate"), dueFrom),
      );
    }
    if (args.dueTo !== undefined) {
      const dueTo = args.dueTo;
      searchQuery = searchQuery.filter((q) => q.lte(q.field("dueDate"), dueTo));
    }
    return toCountResult((await searchQuery.take(COUNT_READ_LIMIT)).length);
  }

  const hasDueDateRange =
    args.dueFrom !== undefined || args.dueTo !== undefined;
  const usesAssigneeIndex = args.assignedTo !== undefined;
  const usesDueDateIndex = !usesAssigneeIndex && hasDueDateRange;
  const usesPriorityIndex =
    !usesAssigneeIndex && !usesDueDateIndex && args.priority !== undefined;
  const taskQuery = usesAssigneeIndex
    ? ctx.db
        .query("tasks")
        .withIndex(
          "by_weddingId_and_status_and_deletedAt_and_assignedTo",
          (q) =>
            q
              .eq("weddingId", ctx.workspace._id)
              .eq("status", status)
              .eq("deletedAt", null)
              .eq("assignedTo", args.assignedTo!),
        )
    : usesDueDateIndex
      ? ctx.db
          .query("tasks")
          .withIndex("by_wedding_status_deleted_due_priority", (q) =>
            q
              .eq("weddingId", ctx.workspace._id)
              .eq("status", status)
              .eq("deletedAt", null)
              .gte("dueDate", args.dueFrom ?? "")
              .lte("dueDate", args.dueTo ?? "9999-12-31"),
          )
      : usesPriorityIndex
        ? ctx.db
            .query("tasks")
            .withIndex("by_wedding_status_deletedAt_priority", (q) =>
              q
                .eq("weddingId", ctx.workspace._id)
                .eq("status", status)
                .eq("deletedAt", null)
                .eq("priorityRank", priorityRank(args.priority!)),
            )
        : ctx.db
            .query("tasks")
            .withIndex("by_wedding_status_deletedAt", (q) =>
              q
                .eq("weddingId", ctx.workspace._id)
                .eq("status", status)
                .eq("deletedAt", null),
            );

  let filteredQuery = taskQuery;
  if (args.priority !== undefined && !usesPriorityIndex) {
    filteredQuery = filteredQuery.filter((q) =>
      q.eq(q.field("priority"), args.priority),
    );
  }
  if (args.category !== undefined) {
    filteredQuery = filteredQuery.filter((q) =>
      q.eq(q.field("category"), args.category),
    );
  }
  if (args.assignedTo !== undefined && !usesAssigneeIndex) {
    filteredQuery = filteredQuery.filter((q) =>
      q.eq(q.field("assignedTo"), args.assignedTo),
    );
  }
  if (args.dueFrom !== undefined && !usesDueDateIndex) {
    const dueFrom = args.dueFrom;
    filteredQuery = filteredQuery.filter((q) =>
      q.gte(q.field("dueDate"), dueFrom),
    );
  }
  if (args.dueTo !== undefined && !usesDueDateIndex) {
    const dueTo = args.dueTo;
    filteredQuery = filteredQuery.filter((q) =>
      q.lte(q.field("dueDate"), dueTo),
    );
  }

  return toCountResult((await filteredQuery.take(COUNT_READ_LIMIT)).length);
}

export const counts = workspaceAuthorizedQuery({
  args: countArgs,
  returns: v.object({
    todo: countResultValidator,
    in_progress: countResultValidator,
    completed: countResultValidator,
  }),
  handler: async (ctx, rawArgs) => {
    const args = rawArgs as CountArgs;
    const normalizedArgs: NormalizedCountArgs = {
      ...args,
      title: validateTaskSearch(args.title),
      assignedTo: args.assignedTo === "unassigned" ? null : args.assignedTo,
    };
    const hasFilters =
      normalizedArgs.title !== undefined ||
      normalizedArgs.priority !== undefined ||
      normalizedArgs.category !== undefined ||
      normalizedArgs.assignedTo !== undefined ||
      normalizedArgs.dueFrom !== undefined ||
      normalizedArgs.dueTo !== undefined;

    const [todo, inProgress, completed] = (hasFilters
      ? await Promise.all(
          statuses.map((status) => countStatus(ctx, status, normalizedArgs)),
        )
      : (
          await taskCounts.countBatch(
            ctx,
            statuses.map((status) => ({
              namespace: ctx.workspace._id,
              bounds: { eq: status },
            })),
          )
        ).map(toCountResult)) as [
      ReturnType<typeof toCountResult>,
      ReturnType<typeof toCountResult>,
      ReturnType<typeof toCountResult>,
    ];

    return {
      todo,
      in_progress: inProgress,
      completed,
    };
  },
});
