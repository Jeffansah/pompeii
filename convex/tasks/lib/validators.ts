import type { GenericDatabaseReader } from "convex/server";
import { v } from "convex/values";
import { AppErrorCode, throwAppError } from "@pompeii/errors/convex";
import type { DataModel, Doc } from "../../_generated/dataModel";
import { memberFor } from "../../weddings/lib/members";

export const taskPriorityValidator = v.union(
  v.literal("low"),
  v.literal("normal"),
  v.literal("high"),
  v.literal("urgent"),
);

export const taskStatusValidator = v.union(
  v.literal("todo"),
  v.literal("in_progress"),
  v.literal("completed"),
);

export const taskSortValidator = v.union(
  v.literal("default"),
  v.literal("dueDateAsc"),
  v.literal("dueDateDesc"),
  v.literal("priority"),
  v.literal("createdDesc"),
  v.literal("createdAsc"),
);

export const taskValidator = v.object({
  _id: v.id("tasks"),
  _creationTime: v.number(),
  weddingId: v.id("weddings"),
  title: v.string(),
  notes: v.optional(v.string()),
  dueDate: v.optional(v.string()),
  priority: taskPriorityValidator,
  category: v.optional(v.string()),
  subcategory: v.optional(v.string()),
  createdBy: v.id("users"),
  assignedTo: v.union(v.id("users"), v.null()),
  assigneeName: v.union(v.string(), v.null()),
  status: taskStatusValidator,
  completionSource: v.union(v.literal("manual"), v.literal("system")),
  completedAt: v.union(v.number(), v.null()),
  completedBy: v.union(v.id("users"), v.null()),
  deletedAt: v.union(v.number(), v.null()),
});

export const taskFields = {
  title: v.string(),
  notes: v.optional(v.string()),
  dueDate: v.optional(v.string()),
  priority: v.optional(taskPriorityValidator),
  category: v.optional(v.string()),
  subcategory: v.optional(v.string()),
  assignedTo: v.optional(v.union(v.id("users"), v.null())),
};

export const taskUpdateFields = {
  title: v.optional(v.string()),
  notes: v.optional(v.union(v.string(), v.null())),
  dueDate: v.optional(v.union(v.string(), v.null())),
  priority: v.optional(taskPriorityValidator),
  category: v.optional(v.union(v.string(), v.null())),
  subcategory: v.optional(v.union(v.string(), v.null())),
  assignedTo: v.optional(v.union(v.id("users"), v.null())),
};

export const TASK_TITLE_MAX_LENGTH = 200;
export const TASK_NOTES_MAX_LENGTH = 5000;
export const TASK_CATEGORY_MAX_LENGTH = 80;
export const TASK_SUBCATEGORY_MAX_LENGTH = 80;

export function toTask(doc: Doc<"tasks">) {
  return {
    _id: doc._id,
    _creationTime: doc._creationTime,
    weddingId: doc.weddingId,
    title: doc.title,
    ...(doc.notes !== undefined ? { notes: doc.notes } : {}),
    ...(doc.dueDate !== undefined ? { dueDate: doc.dueDate } : {}),
    priority: doc.priority,
    ...(doc.category !== undefined ? { category: doc.category } : {}),
    ...(doc.subcategory !== undefined ? { subcategory: doc.subcategory } : {}),
    createdBy: doc.createdBy,
    assignedTo: doc.assignedTo,
    status: doc.status,
    completionSource: doc.completionSource,
    completedAt: doc.completedAt,
    completedBy: doc.completedBy,
    deletedAt: doc.deletedAt,
  };
}

export async function toTaskView(
  ctx: { db: GenericDatabaseReader<DataModel> },
  doc: Doc<"tasks">,
) {
  const task = toTask(doc);
  if (task.assignedTo === null) {
    return { ...task, assigneeName: null };
  }
  const member = await memberFor(ctx, task.assignedTo, task.weddingId);
  return {
    ...task,
    assigneeName: member?.displayName ?? null,
  };
}

export function validateTaskText(
  value: string,
  field: "title" | "notes" | "category" | "subcategory",
) {
  const trimmed = value.trim();
  const maxLength =
    field === "title"
      ? TASK_TITLE_MAX_LENGTH
      : field === "notes"
        ? TASK_NOTES_MAX_LENGTH
        : field === "category"
          ? TASK_CATEGORY_MAX_LENGTH
          : TASK_SUBCATEGORY_MAX_LENGTH;

  if (trimmed.length === 0 && field !== "notes") {
    throwAppError(
      field === "title"
        ? AppErrorCode.tasks.TITLE_REQUIRED
        : AppErrorCode.INTERNAL,
    );
  }
  if (trimmed.length > maxLength) {
    throwAppError(
      field === "title"
        ? AppErrorCode.tasks.TITLE_TOO_LONG
        : field === "notes"
          ? AppErrorCode.tasks.NOTES_TOO_LONG
          : field === "category"
            ? AppErrorCode.tasks.CATEGORY_TOO_LONG
            : AppErrorCode.tasks.SUBCATEGORY_TOO_LONG,
    );
  }
  return trimmed;
}

export function validateDueDate(value: string | undefined) {
  if (value === undefined || value.trim().length === 0) {
    return undefined;
  }
  const date = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throwAppError(AppErrorCode.tasks.DUE_DATE_INVALID);
  }
  const parsed = Date.parse(`${date}T00:00:00.000Z`);
  if (!Number.isFinite(parsed)) {
    throwAppError(AppErrorCode.tasks.DUE_DATE_INVALID);
  }
  return date;
}
