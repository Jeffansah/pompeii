import { format, isBefore, parseISO, startOfDay } from "date-fns";

import type { Task } from "@/types/wedding/task";

export function taskCategoryLabel(task: Task) {
  return (
    [task.category, task.subcategory].filter(Boolean).join(", ") || "Planning"
  );
}

export function taskDueLabel(task: Task) {
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
  return format(dueDate, "MMM d, yyyy");
}
