import { AppErrorCode, getErrorMessage } from "@pompeii/errors";
import { z } from "zod";

export const TASK_TITLE_MAX_LENGTH = 200;
export const TASK_NOTES_MAX_LENGTH = 5000;
export const TASK_CATEGORY_MAX_LENGTH = 80;

const DUE_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function padDatePart(value: number) {
  return String(value).padStart(2, "0");
}

function todayDateValue() {
  const now = new Date();
  return `${now.getFullYear()}-${padDatePart(now.getMonth() + 1)}-${padDatePart(now.getDate())}`;
}

export const taskCreateSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, getErrorMessage(AppErrorCode.tasks.TITLE_REQUIRED))
    .max(
      TASK_TITLE_MAX_LENGTH,
      getErrorMessage(AppErrorCode.tasks.TITLE_TOO_LONG),
    ),
  dueDate: z
    .string()
    .trim()
    .refine(
      (value) => value.length === 0 || DUE_DATE_PATTERN.test(value),
      getErrorMessage(AppErrorCode.tasks.DUE_DATE_INVALID),
    )
    .refine(
      (value) =>
        value.length === 0 ||
        !DUE_DATE_PATTERN.test(value) ||
        value >= todayDateValue(),
      getErrorMessage(AppErrorCode.tasks.DUE_DATE_INVALID),
    ),
  priority: z.enum(["low", "normal", "high", "urgent"]),
  category: z
    .string()
    .trim()
    .max(
      TASK_CATEGORY_MAX_LENGTH,
      getErrorMessage(AppErrorCode.tasks.CATEGORY_TOO_LONG),
    ),
  notes: z
    .string()
    .trim()
    .max(
      TASK_NOTES_MAX_LENGTH,
      getErrorMessage(AppErrorCode.tasks.NOTES_TOO_LONG),
    ),
  assignedTo: z.string(),
});

export type TaskCreateSchema = z.infer<typeof taskCreateSchema>;
