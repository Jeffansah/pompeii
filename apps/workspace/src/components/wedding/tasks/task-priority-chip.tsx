import { cn } from "@/lib/shared/utils";
import {
  TASK_PRIORITY_DOT,
  TASK_PRIORITY_LABELS,
  type TaskPriority,
} from "@/lib/wedding/tasks";

export function TaskPriorityChip({
  priority,
  className,
}: {
  priority: TaskPriority;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-none border border-input bg-transparent px-2.5 text-xs whitespace-nowrap",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn("size-1.5 rounded-full", TASK_PRIORITY_DOT[priority])}
      />
      {TASK_PRIORITY_LABELS[priority]}
    </span>
  );
}
