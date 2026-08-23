import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { TaskDetailActions } from "./task-detail-actions";
import type { Task } from "@/types/wedding/task";

function task(status: Task["status"], capabilities: Task["capabilities"]) {
  return { status, capabilities } as Task;
}

function renderActions(value: Task) {
  return renderToStaticMarkup(
    <TaskDetailActions
      onBegin={() => undefined}
      onComplete={() => undefined}
      onDelete={() => undefined}
      onEdit={() => undefined}
      onMove={() => undefined}
      onPickup={() => undefined}
      onRelease={() => undefined}
      busy={false}
      task={value}
    />,
  );
}

describe("TaskDetailActions", () => {
  it("makes pickup primary when the member cannot begin the task", () => {
    const markup = renderActions(
      task("todo", {
        canEdit: false,
        canDelete: false,
        canPickup: true,
        canRelease: false,
        allowedTransitions: [],
      }),
    );

    expect(markup).toContain("Pick up task");
  });

  it("prioritizes status transitions when they are available", () => {
    const todo = renderActions(
      task("todo", {
        canEdit: true,
        canDelete: true,
        canPickup: true,
        canRelease: false,
        allowedTransitions: ["in_progress"],
      }),
    );
    const completed = renderActions(
      task("completed", {
        canEdit: false,
        canDelete: false,
        canPickup: false,
        canRelease: false,
        allowedTransitions: ["in_progress"],
      }),
    );

    expect(todo).toContain("Begin task");
    expect(completed).toContain("Reopen task");
  });

  it("locks the primary action without marking it busy", () => {
    const markup = renderToStaticMarkup(
      <TaskDetailActions
        busy
        onBegin={() => undefined}
        onComplete={() => undefined}
        onDelete={() => undefined}
        onEdit={() => undefined}
        onMove={() => undefined}
        onPickup={() => undefined}
        onRelease={() => undefined}
        task={task("todo", {
          canEdit: true,
          canDelete: true,
          canPickup: true,
          canRelease: false,
          allowedTransitions: ["in_progress"],
        })}
      />,
    );

    expect(markup).toContain("disabled");
    expect(markup).not.toContain("aria-busy");
  });
});
