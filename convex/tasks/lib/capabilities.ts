import type { Doc, Id } from "../../_generated/dataModel";

export type TaskTransition = "todo" | "in_progress" | "completed";

export function canEditTask(task: Doc<"tasks">, actorId: Id<"users">) {
  return task.status !== "completed" && task.createdBy === actorId;
}

export function canDeleteTask(task: Doc<"tasks">, actorId: Id<"users">) {
  return task.status === "todo" && task.createdBy === actorId;
}

export function canPickupTask(task: Doc<"tasks">) {
  return task.status === "todo" && task.assignedTo === null;
}

export function canReleaseTask(task: Doc<"tasks">, actorId: Id<"users">) {
  return (
    task.status === "todo" &&
    task.assignedTo !== null &&
    task.assignedTo === actorId
  );
}

export function isValidTaskTransition(
  current: TaskTransition,
  next: TaskTransition,
) {
  return (
    (current === "todo" && next === "in_progress") ||
    (current === "in_progress" &&
      (next === "todo" || next === "completed")) ||
    (current === "completed" && next === "in_progress")
  );
}

export function canTransitionTaskTo(
  task: Doc<"tasks">,
  actorId: Id<"users">,
  nextStatus: TaskTransition,
) {
  if (!isValidTaskTransition(task.status, nextStatus)) {
    return false;
  }
  const canAct =
    task.assignedTo === null
      ? task.createdBy === actorId
      : task.assignedTo === actorId;
  return canAct;
}

export function allowedTaskTransitions(
  task: Doc<"tasks">,
  actorId: Id<"users">,
): TaskTransition[] {
  const transitions: TaskTransition[] = ["todo", "in_progress", "completed"];
  return transitions.filter((nextStatus) =>
    canTransitionTaskTo(task, actorId, nextStatus),
  );
}
