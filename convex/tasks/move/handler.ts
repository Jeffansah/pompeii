import { v } from "convex/values";

import { AppErrorCode, throwAppError } from "@pompeii/errors/convex";
import type { Id } from "../../_generated/dataModel";
import { workspaceAuthorizedMutation } from "../../lib/customFunctions/workspaceAuthorizedMutation";
import { recordTaskActivity } from "../lib/activity";
import { getTaskForWorkspace } from "../lib/getTask";
import {
  taskStatusValidator,
  taskValidator,
  toTaskView,
} from "../lib/validators";

export const move = workspaceAuthorizedMutation({
  args: {
    taskId: v.id("tasks"),
    status: taskStatusValidator,
  },
  returns: taskValidator,
  handler: async (ctx, rawArgs) => {
    const { taskId, status } = rawArgs as {
      taskId: Id<"tasks">;
      status: "todo" | "in_progress" | "completed";
    };
    const task = await getTaskForWorkspace(ctx, taskId, ctx.workspace._id);
    const backward =
      (task.status === "completed" && status === "in_progress") ||
      (task.status === "in_progress" && status === "todo");
    const forward =
      (task.status === "todo" && status === "in_progress") ||
      (task.status === "in_progress" && status === "completed");
    if (
      (backward || forward) &&
      task.assignedTo !== null &&
      task.assignedTo !== ctx.user._id
    ) {
      throwAppError(AppErrorCode.tasks.NOT_AUTHORIZED);
    }
    if (
      backward &&
      task.assignedTo === null &&
      task.createdBy !== ctx.user._id
    ) {
      throwAppError(AppErrorCode.tasks.NOT_AUTHORIZED);
    }
    if (
      (task.status === "todo" && status === "in_progress") ||
      (task.status === "in_progress" && status === "completed")
    ) {
      if (task.assignedTo === null) {
        throwAppError(AppErrorCode.tasks.ASSIGNMENT_REQUIRED);
      }
    }
    const valid =
      (task.status === "todo" && status === "in_progress") ||
      (task.status === "in_progress" &&
        (status === "todo" || status === "completed")) ||
      (task.status === "completed" && status === "in_progress");
    if (!valid) throwAppError(AppErrorCode.tasks.INVALID_STATUS_TRANSITION);

    await ctx.db.patch(taskId, {
      status,
      ...(status === "completed"
        ? {
            completionSource: "manual" as const,
            completedAt: Date.now(),
            completedBy: ctx.user._id,
          }
        : { completedAt: null, completedBy: null }),
    });
    await recordTaskActivity(ctx, {
      weddingId: task.weddingId,
      taskId,
      actorId: ctx.user._id,
      kind: status === "completed" ? "completed" : "status_changed",
      field: "status",
      previousValue: task.status,
      nextValue: status,
    });
    const moved = await ctx.db.get(taskId);
    if (moved === null) throwAppError(AppErrorCode.INTERNAL);
    return toTaskView(ctx, moved);
  },
});
