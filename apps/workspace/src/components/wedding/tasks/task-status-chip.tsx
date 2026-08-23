import { cn } from "@/lib/shared/utils";
import {
  TASK_STATUS_LABELS,
  type TaskStatus,
} from "@/lib/wedding/tasks";

const STATUS_CHIP_CLASS: Record<TaskStatus, string> = {
  todo: "bg-info/10 text-info",
  in_progress: "bg-warning/10 text-warning",
  completed: "bg-success/10 text-success",
};

export function TaskStatusChip({
  status,
  className,
}: {
  status: TaskStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-none px-2.5 text-xs whitespace-nowrap",
        STATUS_CHIP_CLASS[status],
        className,
      )}
    >
      {TASK_STATUS_LABELS[status]}
    </span>
  );
}
