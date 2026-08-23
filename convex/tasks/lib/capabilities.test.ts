import { describe, expect, it } from "vitest";

import type { Doc, Id } from "../../_generated/dataModel";
import {
  allowedTaskTransitions,
  canDeleteTask,
  canReleaseTask,
} from "./capabilities";

const owner = "owner" as Id<"users">;
const stranger = "stranger" as Id<"users">;

function task(
  status: Doc<"tasks">["status"],
  assignedTo: Id<"users"> | null = null,
) {
  return {
    status,
    assignedTo,
    createdBy: owner,
  } as Doc<"tasks">;
}

describe("task capabilities", () => {
  it("only lets the creator transition an unassigned task", () => {
    expect(allowedTaskTransitions(task("todo"), owner)).toEqual([
      "in_progress",
    ]);
    expect(allowedTaskTransitions(task("todo"), stranger)).toEqual([]);
  });

  it("only advertises deletion for creator-owned todo tasks", () => {
    expect(canDeleteTask(task("todo"), owner)).toBe(true);
    expect(canDeleteTask(task("in_progress"), owner)).toBe(false);
    expect(canDeleteTask(task("todo"), stranger)).toBe(false);
  });

  it("only lets the assigned member release a todo task", () => {
    expect(canReleaseTask(task("todo", owner), owner)).toBe(true);
    expect(canReleaseTask(task("todo", owner), stranger)).toBe(false);
    expect(canReleaseTask(task("in_progress", owner), owner)).toBe(false);
  });
});
