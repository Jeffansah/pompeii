import { v } from "convex/values";

import { AppErrorCode, throwAppError } from "@pompeii/errors/convex";
import type { Id } from "../../_generated/dataModel";
import { workspaceAuthorizedMutation } from "../../lib/customFunctions/workspaceAuthorizedMutation";
import { recordTaskActivity } from "../lib/activity";
import { canPickupTask } from "../lib/capabilities";
import { getTaskForWorkspace } from "../lib/getTask";
import { patchTask } from "../lib/taskDb";
import { taskValidator, toTaskView } from "../lib/validators";

export const pickup = workspaceAuthorizedMutation({
  args: { taskId: v.id("tasks") },
  returns: taskValidator,
  handler: async (ctx, rawArgs) => {
    const { taskId } = rawArgs as { taskId: Id<"tasks"> };
    const task = await getTaskForWorkspace(ctx, taskId, ctx.workspace._id);
    if (task.status !== "todo") {
      throwAppError(AppErrorCode.tasks.INVALID_STATUS_TRANSITION);
    }
    if (!canPickupTask(task)) {
      throwAppError(AppErrorCode.tasks.ALREADY_ASSIGNED);
    }
    const pickedUp = await patchTask(ctx, task, {
      assignedTo: ctx.user._id,
    });
    await recordTaskActivity(ctx, {
      weddingId: task.weddingId,
      taskId,
      actorId: ctx.user._id,
      kind: "assigned",
      field: "assignedTo",
      previousValue: "",
      nextValue: ctx.user._id,
    });
    return toTaskView(ctx, pickedUp, ctx.user._id);
  },
});
