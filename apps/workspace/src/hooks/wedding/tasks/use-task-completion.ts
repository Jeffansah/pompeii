import type { Id } from "@pompeii/api";
import { api } from "@pompeii/api";
import { useMutation } from "@tanstack/react-query";
import { useConvex } from "convex/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { clientErrorMessage } from "@pompeii/errors/client";

import type { Task } from "@/types/wedding/task";

export function useTaskCompletion({
  weddingId,
  tasks,
}: {
  weddingId: Id<"weddings">;
  tasks: Task[];
}) {
  const convex = useConvex();
  const [pendingTaskId, setPendingTaskId] = useState<Id<"tasks">>();
  const [taskToComplete, setTaskToComplete] = useState<Task | null>(null);
  const [completingTaskId, setCompletingTaskId] = useState<Id<"tasks">>();
  const [completedTaskId, setCompletedTaskId] = useState<Id<"tasks">>();
  const [retainedTask, setRetainedTask] = useState<Task | null>(null);
  const [completionError, setCompletionError] = useState<string | null>(null);
  const completionTimerRef = useRef<number>(undefined);
  const completeTask = useMutation({
    mutationFn: (taskId: Id<"tasks">) =>
      convex.mutation(api.tasks.complete.handler.complete, {
        weddingId,
        taskId,
      }),
  });

  const displayedTasks = retainedTask
    ? tasks.some((task) => task._id === retainedTask._id)
      ? tasks.map((task) =>
          task._id === retainedTask._id ? retainedTask : task,
        )
      : [...tasks, retainedTask]
    : tasks;

  useEffect(() => {
    return () => {
      if (completionTimerRef.current !== undefined) {
        window.clearTimeout(completionTimerRef.current);
      }
    };
  }, []);

  const requestComplete = (task: Task) => {
    setCompletionError(null);
    setTaskToComplete(task);
  };

  const confirmComplete = async () => {
    if (taskToComplete === null) {
      return;
    }
    const task = taskToComplete;
    setTaskToComplete(null);
    setPendingTaskId(task._id);
    setCompletingTaskId(task._id);

    try {
      const completed = await completeTask.mutateAsync(task._id);
      setRetainedTask(completed);
      setCompletingTaskId(undefined);
      setCompletedTaskId(task._id);
      toast.success("Task completed");
      completionTimerRef.current = window.setTimeout(() => {
        setRetainedTask(null);
        setCompletedTaskId(undefined);
      }, 650);
    } catch (error) {
      const message = clientErrorMessage(error);
      setCompletionError(message);
      toast.error("Task action failed", { description: message });
      setTaskToComplete(task);
      setCompletingTaskId(undefined);
    } finally {
      setPendingTaskId(undefined);
    }
  };

  return {
    displayedTasks,
    pendingTaskId,
    completingTaskId,
    completedTaskId,
    taskToComplete,
    completionError,
    requestComplete,
    confirmComplete,
    dismissComplete: () => {
      if (completingTaskId === undefined) {
        setTaskToComplete(null);
      }
    },
  };
}
