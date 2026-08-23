import {
  Delete02Icon,
  Edit02Icon,
  UserAdd01Icon,
  UserRemove01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { ArrowLeftIcon, ArrowRightIcon } from "@/components/icons/arrow";
import { TableActions } from "@/components/ui/table-actions";
import { TaskStatusChip } from "@/components/wedding/tasks/task-status-chip";
import type { Task } from "@/types/wedding/task";

export function TaskActionsMenu({
  task,
  onPickup,
  onRelease,
  onMove,
  onEdit,
  onDelete,
  hiddenTransitions = [],
  hidePickup = false,
  disabled = false,
  variant = "ghost",
}: {
  task: Task;
  onPickup?: (task: Task) => void;
  onRelease?: (task: Task) => void;
  onMove?: (task: Task, status: Task["status"]) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  hiddenTransitions?: Task["status"][];
  hidePickup?: boolean;
  disabled?: boolean;
  variant?: "ghost" | "outline";
}) {
  const transitions = task.capabilities.allowedTransitions.filter(
    (status) => !hiddenTransitions.includes(status),
  );
  return (
    <TableActions
      disabled={disabled}
      variant={variant}
      actions={[
        {
          label: "Pick up task",
          icon: <HugeiconsIcon icon={UserAdd01Icon} />,
          onSelect: () => onPickup?.(task),
          visible:
            !hidePickup &&
            task.capabilities.canPickup &&
            onPickup !== undefined,
        },
        {
          label: "Release task",
          icon: <HugeiconsIcon icon={UserRemove01Icon} />,
          onSelect: () => onRelease?.(task),
          visible: task.capabilities.canRelease && onRelease !== undefined,
        },
        ...transitions.map((status) => ({
          label: (
            <>
              Move to{" "}
              <TaskStatusChip
                className="h-6 px-2 text-[11px]"
                status={status}
              />
            </>
          ),
          icon: (
            <HugeiconsIcon
              icon={
                status === "todo" || status === "in_progress"
                  ? ArrowLeftIcon
                  : ArrowRightIcon
              }
            />
          ),
          onSelect: () => onMove?.(task, status),
          visible: onMove !== undefined,
        })),
        {
          label: "Edit task",
          icon: <HugeiconsIcon icon={Edit02Icon} />,
          onSelect: () => onEdit?.(task),
          visible: task.capabilities.canEdit && onEdit !== undefined,
        },
        {
          label: "Delete task",
          icon: <HugeiconsIcon icon={Delete02Icon} />,
          onSelect: () => onDelete?.(task),
          visible: task.capabilities.canDelete && onDelete !== undefined,
          destructive: true,
          separator: true,
        },
      ]}
    />
  );
}
