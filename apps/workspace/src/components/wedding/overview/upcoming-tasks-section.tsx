import { Task01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { convexQuery } from "@convex-dev/react-query";
import type { Id } from "@pompeii/api";
import { api } from "@pompeii/api";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { TaskCompleteDialog } from "@/components/wedding/tasks/task-complete-dialog";
import { TaskBeginDialog } from "@/components/wedding/tasks/task-begin-dialog";
import { TaskCreateDialog } from "@/components/wedding/tasks/task-create-dialog";
import { TaskTable } from "@/components/wedding/tasks/task-table";
import { TaskTableSkeleton } from "@/components/wedding/tasks/task-table-skeleton";
import { TableEmptyState } from "@/components/ui/table-empty-state";
import { useTaskCompletion } from "@/hooks/wedding/tasks/use-task-completion";
import { useTaskStart } from "@/hooks/wedding/tasks/use-task-start";

export function UpcomingTasksSection({
  slug,
  weddingId,
}: {
  slug: string;
  weddingId: Id<"weddings">;
}) {
  const tasksQuery = useQuery({
    ...convexQuery(api.tasks.getUpcoming.handler.getUpcoming, { weddingId }),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
  const completion = useTaskCompletion({
    weddingId,
    tasks: tasksQuery.data ?? [],
  });
  const start = useTaskStart({ weddingId });
  const { displayedTasks } = completion;

  return (
    <section
      className="flex min-w-0 flex-col gap-8"
      aria-labelledby="upcoming-tasks-title"
    >
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground">
            Keep moving
          </p>
          <h2 id="upcoming-tasks-title" className="mt-1 font-serif text-3xl">
            Upcoming tasks
          </h2>
        </div>
        {displayedTasks.length > 0 ? (
          <div className="flex items-center gap-2">
            <Button asChild size="sm" variant="link">
              <a href={`/${slug}/tasks`}>See all</a>
            </Button>
            <TaskCreateDialog variant="secondary" weddingId={weddingId} />
          </div>
        ) : null}
      </div>

      {tasksQuery.isPending ? (
        <div className="overflow-hidden rounded-none border bg-card">
          <TaskTableSkeleton compact rows={3} />
        </div>
      ) : displayedTasks.length === 0 ? (
        <TableEmptyState
          action={
            <TaskCreateDialog variant="secondary" weddingId={weddingId} />
          }
          icon={
            <HugeiconsIcon
              className="size-7"
              icon={Task01Icon}
              strokeWidth={1.5}
            />
          }
          subtitle="Add the first thing you want to get done."
          title="No tasks yet"
        />
      ) : (
        <div className="overflow-hidden rounded-none border bg-card">
          <TaskTable
            compact
            completedTaskId={completion.completedTaskId}
            completingTaskId={completion.completingTaskId}
            onComplete={completion.requestComplete}
            onStart={start.requestStart}
            pendingTaskId={completion.pendingTaskId}
            startingTaskId={start.taskToStart?._id}
            tasks={displayedTasks}
          />
        </div>
      )}
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
    </section>
  );
}
