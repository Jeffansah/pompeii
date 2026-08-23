import { describe, expect, it } from "vitest";

import { AppErrorCode, getErrorMessage } from "@pompeii/errors";

import {
  TASK_CATEGORY_MAX_LENGTH,
  TASK_NOTES_MAX_LENGTH,
  TASK_TITLE_MAX_LENGTH,
  taskCreateSchema,
} from "./create-schema";

const validRest = {
  dueDate: "",
  priority: "normal" as const,
  category: "",
  notes: "",
  assignedTo: "",
};

describe("taskCreateSchema", () => {
  it("trims a valid task", () => {
    expect(
      taskCreateSchema.parse({
        title: "  Confirm the menu  ",
        dueDate: "",
        priority: "normal",
        category: "  Planning  ",
        notes: "  Call the chef  ",
        assignedTo: "",
      }),
    ).toEqual({
      title: "Confirm the menu",
      dueDate: "",
      priority: "normal",
      category: "Planning",
      notes: "Call the chef",
      assignedTo: "",
    });
  });

  it("rejects an empty title", () => {
    const parsed = taskCreateSchema.safeParse({
      title: "   ",
      ...validRest,
    });
    expect(parsed.success).toBe(false);
    if (parsed.success) {
      return;
    }
    expect(parsed.error.issues[0]?.message).toBe(
      getErrorMessage(AppErrorCode.tasks.TITLE_REQUIRED),
    );
  });

  it("rejects a title that is too long", () => {
    const parsed = taskCreateSchema.safeParse({
      title: "A".repeat(TASK_TITLE_MAX_LENGTH + 1),
      ...validRest,
    });
    expect(parsed.success).toBe(false);
    if (parsed.success) {
      return;
    }
    expect(parsed.error.issues[0]?.message).toBe(
      getErrorMessage(AppErrorCode.tasks.TITLE_TOO_LONG),
    );
  });

  it("rejects notes that are too long", () => {
    const parsed = taskCreateSchema.safeParse({
      title: "Confirm the menu",
      ...validRest,
      notes: "A".repeat(TASK_NOTES_MAX_LENGTH + 1),
    });
    expect(parsed.success).toBe(false);
    if (parsed.success) {
      return;
    }
    expect(parsed.error.issues[0]?.message).toBe(
      getErrorMessage(AppErrorCode.tasks.NOTES_TOO_LONG),
    );
  });

  it("rejects a category that is too long", () => {
    const parsed = taskCreateSchema.safeParse({
      title: "Confirm the menu",
      ...validRest,
      category: "A".repeat(TASK_CATEGORY_MAX_LENGTH + 1),
    });
    expect(parsed.success).toBe(false);
    if (parsed.success) {
      return;
    }
    expect(parsed.error.issues[0]?.message).toBe(
      getErrorMessage(AppErrorCode.tasks.CATEGORY_TOO_LONG),
    );
  });

  it("rejects an invalid due date", () => {
    const parsed = taskCreateSchema.safeParse({
      title: "Confirm the menu",
      ...validRest,
      dueDate: "31-08-2026",
    });
    expect(parsed.success).toBe(false);
    if (parsed.success) {
      return;
    }
    expect(parsed.error.issues[0]?.message).toBe(
      getErrorMessage(AppErrorCode.tasks.DUE_DATE_INVALID),
    );
  });
});
