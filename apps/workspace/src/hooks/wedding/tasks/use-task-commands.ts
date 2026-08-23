import { useState } from "react";
import { toast } from "sonner";
import { useConvex } from "convex/react";
import type { Id } from "@pompeii/api";
import { api } from "@pompeii/api";
import { clientErrorMessage } from "@pompeii/errors/client";

import type { Task } from "@/types/wedding/task";
import { TASK_STATUS_LABELS } from "@/lib/wedding/tasks";

export function useTaskCommands({ weddingId }: { weddingId: Id<"weddings"> }) {
  const convex = useConvex();
  const [pendingTaskIds, setPendingTaskIds] = useState<
    ReadonlySet<Id<"tasks">>
  >(new Set());

  const execute = async (
    taskId: Id<"tasks">,
    action: () => Promise<unknown>,
    success: string,
  ) => {
    setPendingTaskIds((current) => new Set(current).add(taskId));
    try {
      const result = await action();
      toast.success(success);
      return result;
    } catch (error) {
      toast.error("Task action failed", {
        description: clientErrorMessage(error),
      });
      throw error;
    } finally {
      setPendingTaskIds((current) => {
        const next = new Set(current);
        next.delete(taskId);
        return next;
      });
    }
  };

  return {
    pendingTaskIds,
    pickup: (task: Task) =>
      execute(
        task._id,
        () =>
          convex.mutation(api.tasks.pickup.handler.pickup, {
            weddingId,
            taskId: task._id,
          }),
        "Task picked up",
      ),
    release: (task: Task) =>
      execute(
        task._id,
        () =>
          convex.mutation(api.tasks.release.handler.release, {
            weddingId,
            taskId: task._id,
          }),
        "Task released",
      ),
    move: (task: Task, status: Task["status"]) =>
      execute(
        task._id,
        () =>
          convex.mutation(api.tasks.move.handler.move, {
            weddingId,
            taskId: task._id,
            status,
          }),
        `Task marked as ${TASK_STATUS_LABELS[status]}`,
      ),
  };
}
