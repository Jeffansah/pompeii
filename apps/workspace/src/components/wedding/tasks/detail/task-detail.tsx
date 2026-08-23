import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useConvex } from "convex/react";
import { toast } from "sonner";
import { api } from "@pompeii/api";
import type { Id } from "@pompeii/api";
import { clientErrorMessage } from "@pompeii/errors/client";

import { TaskBeginDialog } from "@/components/wedding/tasks/task-begin-dialog";
import { TaskCompleteDialog } from "@/components/wedding/tasks/task-complete-dialog";
import { TaskDeleteDialog } from "@/components/wedding/tasks/task-delete-dialog";
import { TaskEditDialog } from "@/components/wedding/tasks/task-edit-dialog";
import { TaskCommentsSection } from "@/components/wedding/tasks/detail/task-comments-section";
import { TaskDetailActions } from "@/components/wedding/tasks/detail/task-detail-actions";
import { TaskDetailHeader } from "@/components/wedding/tasks/detail/task-detail-header";
import { TaskDetailMetadata } from "@/components/wedding/tasks/detail/task-detail-metadata";
import { TaskDetailNotes } from "@/components/wedding/tasks/detail/task-detail-notes";
import { useTaskCommands } from "@/hooks/wedding/tasks/use-task-commands";
import { useTaskCompletion } from "@/hooks/wedding/tasks/use-task-completion";
import { useTaskStart } from "@/hooks/wedding/tasks/use-task-start";
import type { Task, TaskDetail as TaskDetailData } from "@/types/wedding/task";

export function TaskDetail({
  task,
  weddingId,
  onDeleted,
}: {
  task: TaskDetailData;
  weddingId: Id<"weddings">;
  onDeleted: () => void;
}) {
  const convex = useConvex();
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [deleteTask, setDeleteTask] = useState<Task | null>(null);
  const commands = useTaskCommands({ weddingId });
  const start = useTaskStart({ weddingId });
  const completion = useTaskCompletion({ weddingId, tasks: [task] });
  const deleteMutation = useMutation({
    mutationFn: (taskId: Id<"tasks">) =>
      convex.mutation(api.tasks.delete.handler.deleteTask, {
        weddingId,
        taskId,
      }),
  });
  const busy =
    commands.pendingTaskIds.has(task._id) ||
    start.pending ||
    completion.pendingTaskId === task._id ||
    deleteMutation.isPending;

  const move = (nextTask: Task, status: Task["status"]) => {
    if (nextTask.status === "todo" && status === "in_progress") {
      start.requestStart(nextTask);
      return;
    }
    if (nextTask.status === "in_progress" && status === "completed") {
      completion.requestComplete(nextTask);
      return;
    }
    void commands.move(nextTask, status).catch(() => undefined);
  };

  return (
    <>
      <TaskDetailHeader
        actions={
          <TaskDetailActions
            onBegin={start.requestStart}
            onComplete={completion.requestComplete}
            onDelete={setDeleteTask}
            onEdit={setEditTask}
            onMove={move}
            onPickup={(nextTask) => {
              void commands.pickup(nextTask).catch(() => undefined);
            }}
            onRelease={(nextTask) => {
              void commands.release(nextTask).catch(() => undefined);
            }}
            busy={busy}
            task={task}
          />
        }
        task={task}
      />
      <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_280px]">
        <main className="min-w-0">
          <TaskDetailNotes task={task} />
          <TaskCommentsSection taskId={task._id} weddingId={weddingId} />
        </main>
        <aside className="border-t pt-6 md:border-t-0 md:border-l md:pt-0 md:pl-6">
          <TaskDetailMetadata task={task} />
        </aside>
      </div>
      <TaskEditDialog
        onOpenChange={(open) => {
          if (!open) setEditTask(null);
        }}
        task={editTask}
        weddingId={weddingId}
      />
      <TaskDeleteDialog
        onConfirm={() => {
          if (deleteTask === null) return;
          void deleteMutation
            .mutateAsync(deleteTask._id)
            .then(() => {
              setDeleteTask(null);
              toast.success("Task deleted");
              onDeleted();
            })
            .catch((error: unknown) => {
              toast.error("Task action failed", {
                description: clientErrorMessage(error),
              });
            });
        }}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) setDeleteTask(null);
        }}
        pending={deleteMutation.isPending}
        task={deleteTask}
      />
      <TaskBeginDialog
        error={start.error}
        onConfirm={() => void start.confirmStart()}
        onOpenChange={(open) => {
          if (!open) start.dismissStart();
        }}
        pending={start.pending}
        task={start.taskToStart}
      />
      <TaskCompleteDialog
        error={completion.completionError}
        onConfirm={() => void completion.confirmComplete()}
        onOpenChange={(open) => {
          if (!open) completion.dismissComplete();
        }}
        pending={completion.pendingTaskId !== undefined}
        task={completion.taskToComplete}
      />
    </>
  );
}
