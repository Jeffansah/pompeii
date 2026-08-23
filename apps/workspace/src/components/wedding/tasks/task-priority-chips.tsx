import type { ComponentProps } from "react";

import { Chip, ChipGroup } from "@/components/ui/chip";
import { cn } from "@/lib/shared/utils";
import {
  TASK_PRIORITIES,
  TASK_PRIORITY_DOT,
  TASK_PRIORITY_LABELS,
  type TaskPriority,
} from "@/lib/wedding/tasks";

export function TaskPriorityChips({
  value,
  onChange,
  ...props
}: {
  value: TaskPriority;
  onChange: (value: TaskPriority) => void;
} & Omit<ComponentProps<"div">, "onChange">) {
  return (
    <ChipGroup aria-label="Priority" {...props}>
      {TASK_PRIORITIES.map((priority) => (
        <Chip
          key={priority}
          onClick={() => onChange(priority)}
          pressed={value === priority}
        >
          <span
            aria-hidden="true"
            className={cn("size-1.5 rounded-full", TASK_PRIORITY_DOT[priority])}
          />
          {TASK_PRIORITY_LABELS[priority]}
        </Chip>
      ))}
    </ChipGroup>
  );
}
