import { v } from "convex/values";

import { AppErrorCode, throwAppError } from "@pompeii/errors/convex";
import type { Id } from "../../_generated/dataModel";
import { workspaceAuthorizedMutation } from "../../lib/customFunctions/workspaceAuthorizedMutation";
import { memberFor } from "../../weddings/lib/members";
import { recordTaskActivity } from "../lib/activity";
import { getTaskForWorkspace } from "../lib/getTask";
import { dueSortAt, dueSortDescAt, priorityRank } from "../lib/ordering";
import {
  taskUpdateFields,
  taskValidator,
  toTaskView,
  validateDueDate,
  validateTaskText,
} from "../lib/validators";

export const update = workspaceAuthorizedMutation({
  args: {
    taskId: v.id("tasks"),
    ...taskUpdateFields,
  },
  returns: taskValidator,
  handler: async (ctx, rawArgs) => {
    const args = rawArgs as {
      taskId: Id<"tasks">;
      title?: string;
      notes?: string | null;
      dueDate?: string | null;
      priority?: "low" | "normal" | "high" | "urgent";
      category?: string | null;
      subcategory?: string | null;
      assignedTo?: Id<"users"> | null;
    };
    const task = await getTaskForWorkspace(ctx, args.taskId, ctx.workspace._id);
    if (task.createdBy !== ctx.user._id) {
      throwAppError(AppErrorCode.tasks.NOT_AUTHORIZED);
    }
    if (task.status === "completed") {
      throwAppError(AppErrorCode.tasks.COMPLETED_IMMUTABLE);
    }
    const title =
      args.title === undefined
        ? task.title
        : validateTaskText(args.title, "title");
    const notes =
      args.notes === undefined
        ? task.notes
        : args.notes === null
          ? undefined
          : validateTaskText(args.notes, "notes");
    const dueDate =
      args.dueDate === undefined
        ? task.dueDate
        : validateDueDate(args.dueDate ?? undefined);
    const category =
      args.category === undefined
        ? task.category
        : args.category === null
          ? undefined
          : validateTaskText(args.category, "category");
    const subcategory =
      args.subcategory === undefined
        ? task.subcategory
        : args.subcategory === null
          ? undefined
          : validateTaskText(args.subcategory, "subcategory");
    const assignedTo =
      args.assignedTo === undefined ? task.assignedTo : args.assignedTo;

    if (
      assignedTo !== null &&
      (await memberFor(ctx, assignedTo, ctx.workspace._id)) === null
    ) {
      throwAppError(AppErrorCode.tasks.ASSIGNEE_NOT_FOUND);
    }

    await ctx.db.replace(args.taskId, {
      weddingId: task.weddingId,
      title,
      ...(notes !== undefined ? { notes } : {}),
      ...(dueDate !== undefined ? { dueDate } : {}),
      priority: args.priority ?? task.priority,
      ...(category !== undefined ? { category } : {}),
      ...(subcategory !== undefined ? { subcategory } : {}),
      createdBy: task.createdBy,
      assignedTo,
      status: task.status,
      completionSource: task.completionSource,
      completedAt: task.completedAt,
      completedBy: task.completedBy,
      deletedAt: task.deletedAt,
      sortAt: dueSortAt(dueDate, args.priority ?? task.priority),
      createdAt: task.createdAt ?? task._creationTime,
      priorityRank: priorityRank(args.priority ?? task.priority),
      dueSortAsc: dueSortAt(dueDate, args.priority ?? task.priority),
      dueSortDesc: dueSortDescAt(dueDate),
    });

    await recordTaskActivity(ctx, {
      weddingId: task.weddingId,
      taskId: task._id,
      actorId: ctx.user._id,
      kind: "updated",
    });

    const updated = await ctx.db.get(args.taskId);
    if (updated === null) {
      throwAppError(AppErrorCode.INTERNAL);
    }
    return toTaskView(ctx, updated);
  },
});
