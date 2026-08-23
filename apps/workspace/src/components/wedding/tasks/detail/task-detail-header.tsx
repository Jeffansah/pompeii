import type { ReactNode } from "react";

import { taskCategoryLabel } from "@/lib/wedding/task-display";
import type { Task } from "@/types/wedding/task";

export function TaskDetailHeader({
  task,
  actions,
}: {
  task: Task;
  actions: ReactNode;
}) {
  return (
    <div className="border-b pb-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
        <div className="min-w-0">
          <p className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground">
            Task
          </p>
          <h1 className="mt-2 wrap-break-word font-serif text-4xl">
            {task.title}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {taskCategoryLabel(task)}
          </p>
        </div>
        {actions}
      </div>
    </div>
  );
}
