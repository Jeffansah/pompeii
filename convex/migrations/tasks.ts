import { Migrations } from "@convex-dev/migrations";

import { components } from "../_generated/api";
import { taskCounts } from "../tasks/lib/aggregate";
import { dueSortAt, dueSortDescAt, priorityRank } from "../tasks/lib/ordering";
import { patchTask } from "../tasks/lib/taskDb";
import schema from "../schema";

const migrations = new Migrations(components.migrations, { schema });

export const backfillTaskSortAt = migrations.define({
  table: "tasks",
  parallelize: true,
  migrateOne: async (ctx, task) => {
    const next = {
      priorityRank: priorityRank(task.priority),
      dueSortAsc: dueSortAt(task.dueDate, task.priority),
      dueSortDesc: dueSortDescAt(task.dueDate),
    };
    if (
      task.priorityRank !== next.priorityRank ||
      task.dueSortAsc !== next.dueSortAsc ||
      task.dueSortDesc !== next.dueSortDesc
    ) {
      await patchTask(ctx, task, next);
    }
  },
});

export const assignCreatorsToUnassignedInProgressTasks = migrations.define({
  table: "tasks",
  parallelize: true,
  migrateOne: async (ctx, task) => {
    if (task.status === "in_progress" && task.assignedTo === null) {
      await patchTask(ctx, task, { assignedTo: task.createdBy });
    }
  },
});

export const backfillTaskCounts = migrations.define({
  table: "tasks",
  parallelize: true,
  migrateOne: async (ctx, task) => {
    if (task.deletedAt === null) {
      await taskCounts.insertIfDoesNotExist(ctx, task);
    }
  },
});

export const removeLegacyTaskOrderingFields = migrations.define({
  table: "tasks",
  parallelize: true,
  migrateOne: async (ctx, task) => {
    if (task.sortAt !== undefined || task.createdAt !== undefined) {
      await patchTask(ctx, task, {
        sortAt: undefined,
        createdAt: undefined,
      });
    }
  },
});
