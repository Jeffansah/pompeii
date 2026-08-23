import { AppErrorCode, throwAppError } from "@pompeii/errors/convex";

import type { Doc, Id } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { recordTaskActivity } from "./activity";
import { canTransitionTaskTo, isValidTaskTransition } from "./capabilities";
import { patchTask } from "./taskDb";

export type TaskStatus = "todo" | "in_progress" | "completed";

export async function transitionTask(
  ctx: MutationCtx,
  task: Doc<"tasks">,
  actorId: Id<"users">,
  nextStatus: TaskStatus,
) {
  if (!isValidTaskTransition(task.status, nextStatus)) {
    throwAppError(AppErrorCode.tasks.INVALID_STATUS_TRANSITION);
  }
  if (!canTransitionTaskTo(task, actorId, nextStatus)) {
    throwAppError(AppErrorCode.tasks.NOT_AUTHORIZED);
  }

  const assigningCreator =
    task.status === "todo" &&
    nextStatus === "in_progress" &&
    task.assignedTo === null;

  const updated = await patchTask(ctx, task, {
    status: nextStatus,
    ...(assigningCreator ? { assignedTo: actorId } : {}),
    ...(nextStatus === "completed"
      ? {
          completionSource: "manual" as const,
          completedAt: Date.now(),
          completedBy: actorId,
        }
      : { completedAt: null, completedBy: null }),
  });

  if (assigningCreator) {
    await recordTaskActivity(ctx, {
      weddingId: task.weddingId,
      taskId: task._id,
      actorId,
      kind: "assigned",
      field: "assignedTo",
      previousValue: "",
      nextValue: actorId,
    });
  }
  await recordTaskActivity(ctx, {
    weddingId: task.weddingId,
    taskId: task._id,
    actorId,
    kind: nextStatus === "completed" ? "completed" : "status_changed",
    field: "status",
    previousValue: task.status,
    nextValue: nextStatus,
  });

  return updated;
}
