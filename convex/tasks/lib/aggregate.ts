import { TableAggregate } from "@convex-dev/aggregate";

import { components } from "../../_generated/api";
import type { DataModel, Id } from "../../_generated/dataModel";

export type AggregatedTaskStatus = "todo" | "in_progress" | "completed";

export const taskCounts = new TableAggregate<{
  Namespace: Id<"weddings">;
  Key: AggregatedTaskStatus;
  DataModel: DataModel;
  TableName: "tasks";
}>(components.taskCounts, {
  namespace: (task) => task.weddingId,
  sortKey: (task) => task.status,
});
