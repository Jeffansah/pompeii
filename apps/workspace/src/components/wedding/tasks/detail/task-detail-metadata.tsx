import type { ReactNode } from "react";

import { MemberAvatar } from "@/components/shared/member-avatar";
import { TaskCategoryChip } from "@/components/wedding/tasks/task-category-chip";
import { TaskPriorityChip } from "@/components/wedding/tasks/task-priority-chip";
import { TaskStatusChip } from "@/components/wedding/tasks/task-status-chip";
import { taskCategoryLabel, taskDueLabel } from "@/lib/wedding/task-display";
import type { TaskDetail } from "@/types/wedding/task";

function MetadataRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}

export function TaskDetailMetadata({ task }: { task: TaskDetail }) {
  const assignee = task.assigneeName ?? "Anyone";
  return (
    <section aria-labelledby="task-details-heading">
      <h2 className="text-sm font-medium" id="task-details-heading">
        Task details
      </h2>
      <dl className="mt-4 grid gap-5">
        <MetadataRow label="Status">
          <TaskStatusChip status={task.status} />
        </MetadataRow>
        <MetadataRow label="Priority">
          <TaskPriorityChip priority={task.priority} />
        </MetadataRow>
        <MetadataRow label="Category">
          <TaskCategoryChip category={taskCategoryLabel(task)} />
        </MetadataRow>
        <MetadataRow label="Assignee">
          <span className="inline-flex items-center gap-2">
            {task.assigneeName ? (
              <MemberAvatar
                className="size-6"
                label={`Assigned to ${assignee}`}
                name={assignee}
              />
            ) : null}
            {assignee}
          </span>
        </MetadataRow>
        <MetadataRow label="Due date">{taskDueLabel(task)}</MetadataRow>
        <MetadataRow label="Created by">
          {task.creatorName ?? "Workspace member"}
        </MetadataRow>
      </dl>
    </section>
  );
}
