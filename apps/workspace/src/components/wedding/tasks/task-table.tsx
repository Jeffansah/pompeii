import type { ReactNode } from "react";
import { Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { MemberAvatar } from "@/components/shared/member-avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TaskCategoryChip } from "@/components/wedding/tasks/task-category-chip";
import { TaskPriorityChip } from "@/components/wedding/tasks/task-priority-chip";
import { TaskStatusChip } from "@/components/wedding/tasks/task-status-chip";
import { TaskActionsMenu } from "@/components/wedding/tasks/task-actions-menu";
import { cn } from "@/lib/shared/utils";
import { taskCategoryLabel, taskDueLabel } from "@/lib/wedding/task-display";
import type { Task } from "@/types/wedding/task";

function TaskAssigneeAvatar({ name }: { name: string }) {
  return (
    <MemberAvatar
      className="size-6"
      label={`Assigned to ${name}`}
      name={name}
    />
  );
}

export function TaskTable({
  tasks,
  compact = false,
  pendingTaskId,
  pendingTaskIds,
  startingTaskId,
  completingTaskId,
  completedTaskId,
  onComplete,
  onStart,
  renderTaskTitle,
  onPickup,
  onRelease,
  onMove,
  onEdit,
  onDelete,
}: {
  tasks: Task[];
  compact?: boolean;
  pendingTaskId?: Task["_id"];
  pendingTaskIds?: ReadonlySet<Task["_id"]>;
  startingTaskId?: Task["_id"];
  completingTaskId?: Task["_id"];
  onStart?: (task: Task) => void;
  completedTaskId?: Task["_id"];
  onComplete?: (task: Task) => void;
  renderTaskTitle?: (task: Task) => ReactNode;
  onPickup?: (task: Task) => void;
  onRelease?: (task: Task) => void;
  onMove?: (task: Task, status: Task["status"]) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
}) {
  return (
    <Table>
      {!compact ? (
        <TableHeader>
          <TableRow>
            <TableHead className="w-12" />
            <TableHead>Task</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Due</TableHead>
            <TableHead>Assigned to</TableHead>
            {!compact ? <TableHead className="w-12" /> : null}
          </TableRow>
        </TableHeader>
      ) : null}
      <TableBody>
        {tasks.map((task) => {
          const overdue =
            task.dueDate !== undefined &&
            task.status !== "completed" &&
            taskDueLabel(task) === "Overdue";
          const compactPad = compact ? "px-4 py-4" : undefined;
          const completionState =
            completedTaskId === task._id
              ? "completed"
              : completingTaskId === task._id
                ? "completing"
                : undefined;
          const pending =
            pendingTaskId === task._id ||
            pendingTaskIds?.has(task._id) === true;
          return (
            <TableRow
              key={task._id}
              className={cn(
                compact && "group",
                completionState && "task-completion-row",
                overdue && "bg-destructive/5",
              )}
              data-completion-state={completionState}
            >
              <TableCell className={cn("w-12", compactPad)}>
                <div
                  className={cn(
                    "flex items-center justify-center",
                    compact ? "size-7" : "h-7 w-8",
                  )}
                >
                  {task.status === "completed" ||
                  task.capabilities.allowedTransitions.length === 0 ? null : (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            aria-label={
                              task.status === "todo"
                                ? `Begin ${task.title}`
                                : `Complete ${task.title}`
                            }
                            className={cn(
                              "t-tt-trigger inline-flex size-full cursor-pointer items-center justify-center rounded-full bg-transparent outline-none",
                              "disabled:pointer-events-none disabled:opacity-50",
                            )}
                            disabled={pending || startingTaskId === task._id}
                            onClick={(event) => {
                              event.stopPropagation();
                              if (task.status === "todo") {
                                onStart?.(task);
                              } else {
                                onComplete?.(task);
                              }
                            }}
                            type="button"
                          >
                            <span
                              aria-hidden="true"
                              className="task-completion-icon"
                            >
                              <span className="task-completion-circle size-4 rounded-full border border-muted-foreground" />
                              <HugeiconsIcon
                                className="task-completion-check size-4"
                                icon={Tick02Icon}
                                strokeWidth={1.5}
                              />
                            </span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          {task.status === "todo"
                            ? "Begin task"
                            : "Complete task"}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                <span aria-hidden="true" className="task-completion-line" />
              </TableCell>
              <TableCell
                className={cn(
                  compact
                    ? "w-full max-w-0 min-w-0 overflow-hidden"
                    : "max-w-md",
                  compactPad,
                )}
              >
                {renderTaskTitle ? (
                  renderTaskTitle(task)
                ) : compact ? (
                  <p className="min-w-0 truncate font-medium">{task.title}</p>
                ) : (
                  <p className="max-w-md truncate font-medium">{task.title}</p>
                )}
              </TableCell>
              {!compact ? (
                <TableCell className="whitespace-nowrap">
                  <TaskStatusChip status={task.status} />
                </TableCell>
              ) : null}
              {!compact ? (
                <TableCell className="whitespace-nowrap">
                  <TaskCategoryChip category={taskCategoryLabel(task)} />
                </TableCell>
              ) : null}
              {!compact ? (
                <TableCell className="whitespace-nowrap">
                  <TaskPriorityChip priority={task.priority} />
                </TableCell>
              ) : null}
              <TableCell
                className={cn(
                  "whitespace-nowrap text-sm",
                  compact && "w-auto text-right",
                  compactPad,
                )}
              >
                {compact ? (
                  <div className="flex items-center justify-end gap-2">
                    <TaskStatusChip status={task.status} />
                    <TaskCategoryChip category={taskCategoryLabel(task)} />
                    <TaskPriorityChip priority={task.priority} />
                    {task.assigneeName ? (
                      <TaskAssigneeAvatar name={task.assigneeName} />
                    ) : null}
                    <span
                      className={cn(overdue && "font-medium text-destructive")}
                    >
                      {taskDueLabel(task)}
                    </span>
                  </div>
                ) : (
                  <span
                    className={cn(overdue && "font-medium text-destructive")}
                  >
                    {taskDueLabel(task)}
                  </span>
                )}
              </TableCell>
              {!compact ? (
                <TableCell className="whitespace-nowrap text-sm">
                  {task.assigneeName ? (
                    <div className="flex items-center gap-2">
                      <TaskAssigneeAvatar name={task.assigneeName} />
                      <span>{task.assigneeName}</span>
                    </div>
                  ) : (
                    "Anyone"
                  )}
                </TableCell>
              ) : null}
              {!compact ? (
                <TableCell
                  className="w-12 p-2 text-right"
                  onClick={(event) => event.stopPropagation()}
                >
                  <TaskActionsMenu
                    disabled={pending || startingTaskId === task._id}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    onMove={onMove}
                    onPickup={onPickup}
                    onRelease={onRelease}
                    task={task}
                  />
                </TableCell>
              ) : null}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
