export const TASK_STATUSES = ["todo", "in_progress", "completed"] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  completed: "Completed",
};

export const TASK_PRIORITIES = ["low", "normal", "high", "urgent"] as const;

export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Low",
  normal: "Normal",
  high: "High",
  urgent: "Urgent",
};

export const TASK_PRIORITY_DOT: Record<TaskPriority, string> = {
  low: "border border-muted-foreground bg-transparent",
  normal: "bg-info",
  high: "bg-warning",
  urgent: "bg-destructive",
};

// Starter labels only. Categories will become enums later, and each
// subcategory will map to one of them.
export const TASK_CATEGORIES = [
  "Planning",
  "Vendors",
  "Guests",
  "Venue",
  "Attire",
  "Food",
  "Music",
  "Travel",
] as const;
