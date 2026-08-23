import type { Id } from "@pompeii/api";
import { api } from "@pompeii/api";
import { useMutation } from "@tanstack/react-query";
import { useConvex } from "convex/react";
import { useState } from "react";

import type { Task } from "@/components/wedding/tasks/task-table";

export function useTaskStart({ weddingId }: { weddingId: Id<"weddings"> }) {
  const convex = useConvex();
  const [taskToStart, setTaskToStart] = useState<Task | null>(null);
  const [startError, setStartError] = useState<string | null>(null);
  const startTask = useMutation({
    mutationFn: (taskId: Id<"tasks">) =>
      convex.mutation(api.tasks.start.handler.start, {
        weddingId,
        taskId,
      }),
  });

  return {
    taskToStart,
    pending: startTask.isPending,
    error: startError,
    requestStart: (task: Task) => {
      setStartError(null);
      setTaskToStart(task);
    },
    confirmStart: async () => {
      if (taskToStart === null) {
        return;
      }
      try {
        await startTask.mutateAsync(taskToStart._id);
        setTaskToStart(null);
      } catch {
        setStartError("This task could not be started. Try again.");
      }
    },
    dismissStart: () => {
      if (!startTask.isPending) {
        setStartError(null);
        setTaskToStart(null);
      }
    },
  };
}
