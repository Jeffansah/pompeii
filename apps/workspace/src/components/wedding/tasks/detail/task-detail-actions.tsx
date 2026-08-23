import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { TextSwap } from "@/components/ui/text-swap";
import { TaskActionsMenu } from "@/components/wedding/tasks/task-actions-menu";
import type { Task } from "@/types/wedding/task";

export function TaskDetailActions({
  task,
  busy,
  onBegin,
  onComplete,
  onDelete,
  onEdit,
  onMove,
  onPickup,
  onRelease,
}: {
  task: Task;
  busy: boolean;
  onBegin: (task: Task) => void;
  onComplete: (task: Task) => void;
  onDelete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onMove: (task: Task, status: Task["status"]) => void;
  onPickup: (task: Task) => void;
  onRelease: (task: Task) => void;
}) {
  const [primaryArmed, setPrimaryArmed] = useState(false);

  useEffect(() => {
    if (!busy) {
      setPrimaryArmed(false);
    }
  }, [busy]);
  const canBegin =
    task.status === "todo" &&
    task.capabilities.allowedTransitions.includes("in_progress");
  const canComplete =
    task.status === "in_progress" &&
    task.capabilities.allowedTransitions.includes("completed");
  const canReopen =
    task.status === "completed" &&
    task.capabilities.allowedTransitions.includes("in_progress");
  const pickupIsPrimary =
    !canBegin && !canComplete && !canReopen && task.capabilities.canPickup;
  const primary = canBegin
    ? { label: "Begin task", action: () => onBegin(task) }
    : canComplete
      ? { label: "Complete task", action: () => onComplete(task) }
      : canReopen
        ? {
            label: "Reopen task",
            action: () => onMove(task, "in_progress"),
          }
        : pickupIsPrimary
          ? { label: "Pick up task", action: () => onPickup(task) }
          : null;

  return (
    <div className="flex items-center gap-2">
      {primary ? (
        <Button
          disabled={busy}
          onClick={() => {
            setPrimaryArmed(true);
            primary.action();
          }}
          pending={primaryArmed && busy}
          size="sm"
        >
          <TextSwap>{primary.label}</TextSwap>
        </Button>
      ) : null}
      <TaskActionsMenu
        disabled={busy}
        hidePickup={pickupIsPrimary}
        variant="outline"
        hiddenTransitions={
          canBegin || canReopen
            ? ["in_progress"]
            : canComplete
              ? ["completed"]
              : []
        }
        onDelete={onDelete}
        onEdit={onEdit}
        onMove={onMove}
        onPickup={onPickup}
        onRelease={onRelease}
        task={task}
      />
    </div>
  );
}
