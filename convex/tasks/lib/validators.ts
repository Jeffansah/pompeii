import type { GenericDatabaseReader } from "convex/server";
import { v } from "convex/values";
import { AppErrorCode, throwAppError } from "@pompeii/errors/convex";
import type { DataModel, Doc, Id } from "../../_generated/dataModel";
import { memberFor } from "../../weddings/lib/members";
import {
  allowedTaskTransitions,
  canDeleteTask,
  canEditTask,
  canPickupTask,
  canReleaseTask,
} from "./capabilities";

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

export const taskAssigneeFilterValidator = v.union(
  v.id("users"),
  v.literal("unassigned"),
);

export const taskFilterFields = {
  title: v.optional(v.string()),
  priority: v.optional(taskPriorityValidator),
  category: v.optional(v.string()),
  assignedTo: v.optional(taskAssigneeFilterValidator),
  dueFrom: v.optional(v.string()),
  dueTo: v.optional(v.string()),
};

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
  capabilities: v.object({
    canEdit: v.boolean(),
    canDelete: v.boolean(),
    canPickup: v.boolean(),
    canRelease: v.boolean(),
    allowedTransitions: v.array(taskStatusValidator),
  }),
});

export const taskCapabilitiesValidator = v.object({
  canEdit: v.boolean(),
  canDelete: v.boolean(),
  canPickup: v.boolean(),
  canRelease: v.boolean(),
  allowedTransitions: v.array(taskStatusValidator),
});

export const taskDetailValidator = v.object({
  ...taskValidator.fields,
  creatorName: v.union(v.string(), v.null()),
  capabilities: taskCapabilitiesValidator,
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
export const TASK_SEARCH_MAX_LENGTH = 512;
export const TASK_SEARCH_MAX_TERMS = 16;
export const TASK_SEARCH_MAX_TERM_BYTES = 32;

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
  actorId: Id<"users">,
) {
  const task = toTask(doc);
  const capabilities = {
    canEdit: canEditTask(doc, actorId),
    canDelete: canDeleteTask(doc, actorId),
    canPickup: canPickupTask(doc),
    canRelease: canReleaseTask(doc, actorId),
    allowedTransitions: allowedTaskTransitions(doc, actorId),
  };
  if (task.assignedTo === null) {
    return { ...task, assigneeName: null, capabilities };
  }
  const member = await memberFor(ctx, task.assignedTo, task.weddingId);
  return {
    ...task,
    assigneeName: member?.displayName ?? null,
    capabilities,
  };
}

export async function toTaskDetailView(
  ctx: { db: GenericDatabaseReader<DataModel> },
  doc: Doc<"tasks">,
  actorId: Id<"users">,
) {
  const task = await toTaskView(ctx, doc, actorId);
  const creator = await ctx.db
    .query("weddingMembers")
    .withIndex("by_userId_and_weddingId", (q) =>
      q.eq("userId", doc.createdBy).eq("weddingId", doc.weddingId),
    )
    .unique();
  return {
    ...task,
    creatorName: creator?.displayName ?? null,
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

export function validateTaskSearch(value: string | undefined) {
  const trimmed = value?.trim();
  if (trimmed === undefined || trimmed.length === 0) {
    return undefined;
  }

  const terms = trimmed.split(/\s+/);
  const encoder = new TextEncoder();
  if (
    trimmed.length > TASK_SEARCH_MAX_LENGTH ||
    terms.length > TASK_SEARCH_MAX_TERMS ||
    terms.some(
      (term) => encoder.encode(term).byteLength > TASK_SEARCH_MAX_TERM_BYTES,
    )
  ) {
    throwAppError(AppErrorCode.tasks.SEARCH_INVALID);
  }
  return trimmed;
}
