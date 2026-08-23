import type { Id } from "@pompeii/api";
import { api } from "@pompeii/api";
import { useMutation } from "@tanstack/react-query";
import { useConvex } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { clientErrorMessage } from "@pompeii/errors/client";

import type { Task } from "@/types/wedding/task";

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
        toast.success("Task started");
      } catch (error) {
        const message = clientErrorMessage(error);
        setStartError(message);
        toast.error("Task action failed", { description: message });
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
