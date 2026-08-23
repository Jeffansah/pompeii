import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { Task01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Id } from "@pompeii/api";
import { api } from "@pompeii/api";

import { WorkspacePage } from "@/components/layout/workspace-page";
import { TaskBeginDialog } from "@/components/wedding/tasks/task-begin-dialog";
import { TaskCompleteDialog } from "@/components/wedding/tasks/task-complete-dialog";
import { TaskCreateDialog } from "@/components/wedding/tasks/task-create-dialog";
import { TaskDeleteDialog } from "@/components/wedding/tasks/task-delete-dialog";
import { TaskEditDialog } from "@/components/wedding/tasks/task-edit-dialog";
import { TaskFilters } from "@/components/wedding/tasks/task-filters";
import { TaskStatusTab } from "@/components/wedding/tasks/task-status-tab";
import { TaskSort } from "@/components/wedding/tasks/task-sort";
import { TaskTable } from "@/components/wedding/tasks/task-table";
import { TaskTableSkeleton } from "@/components/wedding/tasks/task-table-skeleton";
import type { Task } from "@/types/wedding/task";
import { SkeletonReveal } from "@/components/ui/skeleton-reveal";
import { TableEmptyState } from "@/components/ui/table-empty-state";
import { TablePagination } from "@/components/ui/table-pagination";
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import { useCursorPagination } from "@/hooks/shared/use-cursor-pagination";
import { useTaskCompletion } from "@/hooks/wedding/tasks/use-task-completion";
import { useTaskStart } from "@/hooks/wedding/tasks/use-task-start";
import { useTaskCommands } from "@/hooks/wedding/tasks/use-task-commands";
import { DEFAULT_TABLE_PAGE_SIZE } from "@/lib/shared/pagination";
import { TASK_STATUS_LABELS } from "@/lib/wedding/tasks";
import { taskSearchSchema } from "@/schemas/wedding/tasks/search-schema";
import { useWorkspace } from "@/stores/workspace-store";
import { useConvex } from "convex/react";
import { clientErrorMessage } from "@pompeii/errors/client";

export const Route = createFileRoute("/$slug/tasks")({
  validateSearch: taskSearchSchema,
  component: TasksPage,
});

function TasksPage() {
  const { slug } = Route.useParams();
  const workspace = useWorkspace(slug);
  const weddingId =
    workspace?.status === "active" ? workspace.weddingId : undefined;

  if (weddingId === undefined) {
    return <WorkspacePage />;
  }

  return <TasksPageContent weddingId={weddingId} />;
}

function TasksPageContent({ weddingId }: { weddingId: Id<"weddings"> }) {
  const { slug } = Route.useParams();
  const search = Route.useSearch();
  const { status, sort, priority, category, title, assignee, dueFrom, dueTo } =
    search;
  const navigate = useNavigate({ from: Route.fullPath });
  const convex = useConvex();
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [deleteTask, setDeleteTask] = useState<Task | null>(null);
  const deleteMutation = useMutation({
    mutationFn: (taskId: Id<"tasks">) =>
      convex.mutation(api.tasks.delete.handler.deleteTask, {
        weddingId,
        taskId,
      }),
  });
  const commands = useTaskCommands({ weddingId });
  const runAction = async (action: () => Promise<unknown>, success: string) => {
    try {
      await action();
      toast.success(success);
    } catch (error) {
      toast.error("Task action failed", {
        description: clientErrorMessage(error),
      });
    }
  };
  const queryContextKey = JSON.stringify([
    weddingId,
    status,
    sort,
    priority,
    category,
    title,
    assignee,
    dueFrom,
    dueTo,
  ]);
  const [cursor, setCursor] = useState<string | null>(null);
  const assignedTo = assignee as Id<"users"> | "unassigned" | undefined;
  const listArgs = {
    weddingId,
    status,
    ...(sort !== undefined ? { sort } : {}),
    ...(priority !== undefined ? { priority } : {}),
    ...(category !== undefined ? { category } : {}),
    ...(title !== undefined ? { title } : {}),
    ...(assignedTo !== undefined ? { assignedTo } : {}),
    ...(dueFrom !== undefined ? { dueFrom } : {}),
    ...(dueTo !== undefined ? { dueTo } : {}),
    paginationOpts: { numItems: DEFAULT_TABLE_PAGE_SIZE, cursor },
  } as const;
  const tasksQuery = useQuery({
    ...convexQuery(api.tasks.list.handler.list, listArgs),
  });
  const taskPage = tasksQuery.data as
    | {
        page: Task[];
        continueCursor: string;
        isDone: boolean;
      }
    | undefined;
  useEffect(() => {
    setCursor(null);
  }, [queryContextKey]);
  const pagination = useCursorPagination({
    contextKey: queryContextKey,
    cursor,
    data: taskPage,
    isFetching: tasksQuery.isFetching,
    isPending: tasksQuery.isPending,
  });
  const displayedTasks = pagination.page;
  const countsQuery = useQuery({
    ...convexQuery(api.tasks.counts.handler.counts, {
      weddingId,
      ...(priority !== undefined ? { priority } : {}),
      ...(category !== undefined ? { category } : {}),
      ...(title !== undefined ? { title } : {}),
      ...(assignedTo !== undefined ? { assignedTo } : {}),
      ...(dueFrom !== undefined ? { dueFrom } : {}),
      ...(dueTo !== undefined ? { dueTo } : {}),
    }),
    placeholderData: keepPreviousData,
  });
  const completion = useTaskCompletion({
    weddingId,
    tasks: displayedTasks,
  });
  const start = useTaskStart({ weddingId });
  const hasFilters =
    priority !== undefined ||
    category !== undefined ||
    title !== undefined ||
    assignee !== undefined ||
    dueFrom !== undefined ||
    dueTo !== undefined;
  const emptyCopy = hasFilters
    ? {
        title: `No "${TASK_STATUS_LABELS[status]}" tasks match these filters`,
        subtitle: "Try changing or clearing your filters.",
      }
    : {
        title:
          status === "todo"
            ? "No tasks to do"
            : status === "in_progress"
              ? "Nothing in progress"
              : "No completed tasks",
        subtitle:
          status === "completed"
            ? "Completed tasks will appear here."
            : "Add the first thing you want to get done.",
      };

  return (
    <WorkspacePage>
      <div className="flex flex-col gap-6">
        <div>
          <p className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground">
            Plan together
          </p>
          <h1 className="mt-1 font-serif text-4xl">Tasks</h1>
          <div className="flex items-end justify-between gap-4">
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Keep the next things clear, shared, and easy to move forward.
            </p>
            <TaskCreateDialog
              defaultOpen={
                new URLSearchParams(window.location.search).get("new") === "1"
              }
              variant="default"
              weddingId={weddingId}
            />
          </div>
        </div>
        <Tabs
          value={status}
          onValueChange={(value) => {
            if (
              value === "todo" ||
              value === "in_progress" ||
              value === "completed"
            ) {
              void navigate({
                search: (previous) => ({ ...previous, status: value }),
                replace: true,
              });
            }
          }}
        >
          <div className="flex items-center justify-between gap-4">
            <TabsList aria-label="Task status">
              <TaskStatusTab
                count={
                  countsQuery.data?.todo?.capped
                    ? "99+"
                    : countsQuery.data?.todo?.value
                }
                label="To do"
                value="todo"
              />
              <TaskStatusTab
                count={
                  countsQuery.data?.in_progress?.capped
                    ? "99+"
                    : countsQuery.data?.in_progress?.value
                }
                label="In progress"
                value="in_progress"
              />
              <TaskStatusTab
                count={
                  countsQuery.data?.completed?.capped
                    ? "99+"
                    : countsQuery.data?.completed?.value
                }
                label="Completed"
                value="completed"
              />
            </TabsList>
            <div className="flex items-center gap-2">
              <TaskFilters
                weddingId={weddingId}
                onClearAll={() => {
                  void navigate({
                    search: (previous) => {
                      const next = { ...previous };
                      delete next.priority;
                      delete next.category;
                      delete next.title;
                      delete next.assignee;
                      delete next.dueFrom;
                      delete next.dueTo;
                      return next;
                    },
                    replace: true,
                  });
                }}
                onChange={(id, value) => {
                  void navigate({
                    search: (previous) => {
                      const next = { ...previous };
                      if (id === "priority" && typeof value === "string") {
                        next.priority = value as typeof priority;
                      } else if (
                        id === "category" &&
                        typeof value === "string"
                      ) {
                        next.category = value;
                      } else if (id === "title" && typeof value === "string") {
                        next.title = value;
                      } else if (
                        id === "assignee" &&
                        typeof value === "string"
                      ) {
                        next.assignee = value;
                      } else if (
                        id === "dueDate" &&
                        typeof value !== "string"
                      ) {
                        next.dueFrom = value?.from;
                        next.dueTo = value?.to;
                      }
                      if (value === undefined || value === "") {
                        if (id === "priority") delete next.priority;
                        if (id === "category") delete next.category;
                        if (id === "title") delete next.title;
                        if (id === "assignee") delete next.assignee;
                        if (id === "dueDate") {
                          delete next.dueFrom;
                          delete next.dueTo;
                        }
                      }
                      return next;
                    },
                    replace: true,
                  });
                }}
                values={{
                  ...(priority !== undefined ? { priority } : {}),
                  ...(category !== undefined ? { category } : {}),
                  ...(title !== undefined ? { title } : {}),
                  ...(assignee !== undefined ? { assignee } : {}),
                  ...(dueFrom !== undefined || dueTo !== undefined
                    ? { dueDate: { from: dueFrom, to: dueTo } }
                    : {}),
                }}
              />
              <TaskSort
                onChange={(nextSort) => {
                  void navigate({
                    search: (previous) => ({ ...previous, sort: nextSort }),
                    replace: true,
                  });
                }}
                searchActive={title !== undefined}
                value={sort}
              />
            </div>
          </div>
          <TabsContent value={status}>
            <SkeletonReveal
              ready={!pagination.isLoading}
              skeleton={
                <div className="overflow-hidden rounded-none border bg-card">
                  <TaskTableSkeleton />
                </div>
              }
            >
              {pagination.isLoading ? null : displayedTasks.length > 0 ? (
                <div className="overflow-hidden rounded-none border bg-card">
                  <TaskTable
                    completedTaskId={completion.completedTaskId}
                    completingTaskId={completion.completingTaskId}
                    onComplete={
                      status === "completed"
                        ? undefined
                        : completion.requestComplete
                    }
                    onStart={start.requestStart}
                    onPickup={(task) => {
                      void commands.pickup(task).catch(() => undefined);
                    }}
                    onRelease={(task) => {
                      void commands.release(task).catch(() => undefined);
                    }}
                    onMove={(task, nextStatus) => {
                      void commands
                        .move(task, nextStatus)
                        .catch(() => undefined);
                    }}
                    onEdit={setEditTask}
                    onDelete={setDeleteTask}
                    renderTaskTitle={(task) => (
                      <Link
                        className="max-w-md truncate font-medium hover:underline"
                        params={{
                          slug,
                          taskId: task._id,
                        }}
                        search={search}
                        to="/$slug/tasks/$taskId"
                      >
                        {task.title}
                      </Link>
                    )}
                    pendingTaskId={completion.pendingTaskId}
                    pendingTaskIds={commands.pendingTaskIds}
                    startingTaskId={start.taskToStart?._id}
                    tasks={completion.displayedTasks}
                  />
                  <TablePagination
                    canGoFirst={pagination.canGoPrevious}
                    canGoNext={pagination.canGoNext}
                    canGoPrevious={pagination.canGoPrevious}
                    isLoading={pagination.isNavigating || tasksQuery.isPending}
                    onFirst={() => setCursor(null)}
                    onNext={() => {
                      if (pagination.nextCursor !== null) {
                        setCursor(pagination.nextCursor);
                      }
                    }}
                    onPrevious={() => {
                      if (pagination.previousCursor !== null) {
                        setCursor(pagination.previousCursor);
                      }
                    }}
                  />
                </div>
              ) : (
                <TableEmptyState
                  action={
                    status === "completed" ? undefined : (
                      <TaskCreateDialog
                        variant="default"
                        weddingId={weddingId}
                      />
                    )
                  }
                  icon={
                    <HugeiconsIcon
                      className="size-7"
                      icon={Task01Icon}
                      strokeWidth={1.5}
                    />
                  }
                  subtitle={emptyCopy.subtitle}
                  title={emptyCopy.title}
                />
              )}
            </SkeletonReveal>
          </TabsContent>
        </Tabs>
      </div>
      <TaskCompleteDialog
        error={completion.completionError}
        onConfirm={() => void completion.confirmComplete()}
        onOpenChange={(open) => {
          if (!open) {
            completion.dismissComplete();
          }
        }}
        pending={completion.pendingTaskId !== undefined}
        task={completion.taskToComplete}
      />
      <TaskBeginDialog
        error={start.error}
        onConfirm={() => void start.confirmStart()}
        onOpenChange={(open) => {
          if (!open) {
            start.dismissStart();
          }
        }}
        pending={start.pending}
        task={start.taskToStart}
      />
      <TaskEditDialog
        onOpenChange={(open) => {
          if (!open) setEditTask(null);
        }}
        task={editTask}
        weddingId={weddingId}
      />
      <TaskDeleteDialog
        onConfirm={() => {
          if (!deleteTask) return;
          const task = deleteTask;
          void runAction(async () => {
            await deleteMutation.mutateAsync(task._id);
            setDeleteTask(null);
          }, "Task deleted");
        }}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) setDeleteTask(null);
        }}
        pending={deleteMutation.isPending}
        task={deleteTask}
      />
    </WorkspacePage>
  );
}
