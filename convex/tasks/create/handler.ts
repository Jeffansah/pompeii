import { AppErrorCode, throwAppError } from "@pompeii/errors/convex";
import type { Id } from "../../_generated/dataModel";
import { workspaceAuthorizedMutation } from "../../lib/customFunctions/workspaceAuthorizedMutation";
import { memberFor } from "../../weddings/lib/members";
import { recordTaskActivity } from "../lib/activity";
import { dueSortAt, dueSortDescAt, priorityRank } from "../lib/ordering";
import {
  taskFields,
  taskValidator,
  toTaskView,
  validateDueDate,
  validateTaskText,
} from "../lib/validators";

export const create = workspaceAuthorizedMutation({
  args: taskFields,
  returns: taskValidator,
  handler: async (ctx, rawArgs) => {
    const args = rawArgs as {
      title: string;
      notes?: string;
      dueDate?: string;
      priority?: "low" | "normal" | "high" | "urgent";
      category?: string;
      subcategory?: string;
      assignedTo?: Id<"users"> | null;
    };
    const title = validateTaskText(args.title, "title");
    const notes =
      args.notes === undefined
        ? undefined
        : validateTaskText(args.notes, "notes");
    const dueDate = validateDueDate(args.dueDate);
    const category =
      args.category === undefined
        ? undefined
        : validateTaskText(args.category, "category");
    const subcategory =
      args.subcategory === undefined
        ? undefined
        : validateTaskText(args.subcategory, "subcategory");
    const assignedTo = args.assignedTo ?? null;

    if (
      assignedTo !== null &&
      (await memberFor(ctx, assignedTo, ctx.workspace._id)) === null
    ) {
      throwAppError(AppErrorCode.tasks.ASSIGNEE_NOT_FOUND);
    }

    const createdAt = Date.now();
    const taskId = await ctx.db.insert("tasks", {
      weddingId: ctx.workspace._id,
      title,
      ...(notes !== undefined ? { notes } : {}),
      ...(dueDate !== undefined ? { dueDate } : {}),
      priority: args.priority ?? "normal",
      ...(category !== undefined ? { category } : {}),
      ...(subcategory !== undefined ? { subcategory } : {}),
      createdBy: ctx.user._id,
      assignedTo,
      status: "todo",
      completionSource: "manual",
      completedAt: null,
      completedBy: null,
      deletedAt: null,
      sortAt: dueSortAt(dueDate, args.priority ?? "normal"),
      createdAt,
      priorityRank: priorityRank(args.priority ?? "normal"),
      dueSortAsc: dueSortAt(dueDate, args.priority ?? "normal"),
      dueSortDesc: dueSortDescAt(dueDate),
    });

    await recordTaskActivity(ctx, {
      weddingId: ctx.workspace._id,
      taskId,
      actorId: ctx.user._id,
      kind: "created",
    });

    const task = await ctx.db.get(taskId);
    if (task === null) {
      throwAppError(AppErrorCode.INTERNAL);
    }
    return toTaskView(ctx, task);
  },
});
