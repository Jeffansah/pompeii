import { Migrations } from "@convex-dev/migrations";

import { components } from "../_generated/api";
import { dueSortAt, dueSortDescAt, priorityRank } from "../tasks/lib/ordering";
import schema from "../schema";

const migrations = new Migrations(components.migrations, { schema });

export const backfillTaskSortAt = migrations.define({
  table: "tasks",
  parallelize: true,
  migrateOne: async (ctx, task) => {
    const next = {
      createdAt: task._creationTime,
      priorityRank: priorityRank(task.priority),
      dueSortAsc: dueSortAt(task.dueDate, task.priority),
      dueSortDesc: dueSortDescAt(task.dueDate),
    };
    if (
      task.createdAt !== next.createdAt ||
      task.priorityRank !== next.priorityRank ||
      task.dueSortAsc !== next.dueSortAsc ||
      task.dueSortDesc !== next.dueSortDesc
    ) {
      await ctx.db.patch(task._id, next);
    }
  },
});
