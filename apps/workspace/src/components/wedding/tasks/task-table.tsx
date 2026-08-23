import type { Doc } from "@pompeii/api";
import { format, isBefore, parseISO, startOfDay } from "date-fns";
import {
  ArrowLeft02Icon,
  ArrowRight02Icon,
  Delete02Icon,
  Edit02Icon,
  Tick02Icon,
  UserAdd01Icon,
  UserRemove01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { TableActions } from "@/components/ui/table-actions";
import { avatarInitials } from "@/lib/auth/avatar";
import { cn } from "@/lib/shared/utils";

export type Task = Omit<Doc<"tasks">, "sortAt"> & {
  assigneeName?: string | null;
};

function dueLabel(task: Task) {
  if (task.dueDate === undefined) {
    return "No due date";
  }
  const dueDate = parseISO(task.dueDate);
  if (
    task.status !== "completed" &&
    isBefore(dueDate, startOfDay(new Date()))
  ) {
    return "Overdue";
  }
  return format(dueDate, "MMM d");
}

function categoryLabel(task: Task) {
  return (
    [task.category, task.subcategory].filter(Boolean).join(", ") || "Planning"
  );
}

function TaskAssigneeAvatar({ name }: { name: string }) {
  return (
    <Avatar aria-label={`Assigned to ${name}`} className="size-6">
      <AvatarFallback className="bg-primary font-serif text-[10px] text-white">
        {avatarInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}

export function TaskTable({
  tasks,
  compact = false,
  pendingTaskId,
  startingTaskId,
  completingTaskId,
  completedTaskId,
  onComplete,
  onStart,
  onSelect,
  currentUserId,
  onPickup,
  onRelease,
  onMove,
  onEdit,
  onDelete,
}: {
  tasks: Task[];
  compact?: boolean;
  pendingTaskId?: Task["_id"];
  startingTaskId?: Task["_id"];
  completingTaskId?: Task["_id"];
  onStart?: (task: Task) => void;
  completedTaskId?: Task["_id"];
  onComplete?: (task: Task) => void;
  onSelect?: (task: Task) => void;
  currentUserId?: string;
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
            dueLabel(task) === "Overdue";
          const compactPad = compact ? "px-4 py-4" : undefined;
          const completionState =
            completedTaskId === task._id
              ? "completed"
              : completingTaskId === task._id
                ? "completing"
                : undefined;

          return (
            <TableRow
              key={task._id}
              className={cn(
                compact && "group",
                completionState && "task-completion-row",
                overdue && "bg-destructive/5",
              )}
              data-completion-state={completionState}
              onClick={() => onSelect?.(task)}
            >
              <TableCell className={cn("w-12", compactPad)}>
                <div
                  className={cn(
                    "flex items-center justify-center",
                    compact ? "size-7" : "h-7 w-8",
                  )}
                >
                  {task.status === "completed" ? null : (
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
                            disabled={
                              pendingTaskId === task._id ||
                              startingTaskId === task._id
                            }
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
                {compact ? (
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
                  <TaskCategoryChip category={categoryLabel(task)} />
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
                    <TaskCategoryChip category={categoryLabel(task)} />
                    <TaskPriorityChip priority={task.priority} />
                    {task.assigneeName ? (
                      <TaskAssigneeAvatar name={task.assigneeName} />
                    ) : null}
                    <span
                      className={cn(overdue && "font-medium text-destructive")}
                    >
                      {dueLabel(task)}
                    </span>
                  </div>
                ) : (
                  <span
                    className={cn(overdue && "font-medium text-destructive")}
                  >
                    {dueLabel(task)}
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
                  <TableActions
                    actions={[
                      {
                        label: "Pick up task",
                        icon: <HugeiconsIcon icon={UserAdd01Icon} />,
                        onSelect: () => onPickup?.(task),
                        visible:
                          task.status === "todo" &&
                          task.assignedTo === null &&
                          onPickup !== undefined,
                      },
                      {
                        label: "Release task",
                        icon: <HugeiconsIcon icon={UserRemove01Icon} />,
                        onSelect: () => onRelease?.(task),
                        visible:
                          task.status !== "completed" &&
                          task.assignedTo !== null &&
                          String(task.assignedTo) === currentUserId &&
                          onRelease !== undefined,
                      },
                      {
                        label: (
                          <>
                            Move to{" "}
                            <TaskStatusChip
                              className="h-6 px-2 text-[11px]"
                              status="in_progress"
                            />
                          </>
                        ),
                        icon: <HugeiconsIcon icon={ArrowRight02Icon} />,
                        onSelect: () => onMove?.(task, "in_progress"),
                        visible:
                          task.status === "todo" &&
                          task.assignedTo !== null &&
                          String(task.assignedTo) === currentUserId &&
                          onMove !== undefined,
                      },
                      {
                        label: (
                          <>
                            Move to{" "}
                            <TaskStatusChip
                              className="h-6 px-2 text-[11px]"
                              status="completed"
                            />
                          </>
                        ),
                        icon: <HugeiconsIcon icon={ArrowRight02Icon} />,
                        onSelect: () => onMove?.(task, "completed"),
                        visible:
                          task.status === "in_progress" &&
                          task.assignedTo !== null &&
                          String(task.assignedTo) === currentUserId &&
                          onMove !== undefined,
                      },
                      {
                        label: (
                          <>
                            Move back to{" "}
                            <TaskStatusChip
                              className="h-6 px-2 text-[11px]"
                              status="in_progress"
                            />
                          </>
                        ),
                        icon: <HugeiconsIcon icon={ArrowLeft02Icon} />,
                        onSelect: () => onMove?.(task, "in_progress"),
                        visible:
                          task.status === "completed" &&
                          ((task.assignedTo !== null &&
                            String(task.assignedTo) === currentUserId) ||
                            (task.assignedTo === null &&
                              String(task.createdBy) === currentUserId)) &&
                          onMove !== undefined,
                      },
                      {
                        label: (
                          <>
                            Move back to{" "}
                            <TaskStatusChip
                              className="h-6 px-2 text-[11px]"
                              status="todo"
                            />
                          </>
                        ),
                        icon: <HugeiconsIcon icon={ArrowLeft02Icon} />,
                        onSelect: () => onMove?.(task, "todo"),
                        visible:
                          task.status === "in_progress" &&
                          ((task.assignedTo !== null &&
                            String(task.assignedTo) === currentUserId) ||
                            (task.assignedTo === null &&
                              String(task.createdBy) === currentUserId)) &&
                          onMove !== undefined,
                      },
                      {
                        label: "Edit task",
                        icon: <HugeiconsIcon icon={Edit02Icon} />,
                        onSelect: () => onEdit?.(task),
                        visible:
                          task.status !== "completed" &&
                          String(task.createdBy) === currentUserId &&
                          onEdit !== undefined,
                      },
                      {
                        label: "Delete task",
                        icon: <HugeiconsIcon icon={Delete02Icon} />,
                        onSelect: () => onDelete?.(task),
                        visible:
                          task.status !== "completed" &&
                          String(task.createdBy) === currentUserId &&
                          onDelete !== undefined,
                        destructive: true,
                        separator: true,
                      },
                    ]}
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
