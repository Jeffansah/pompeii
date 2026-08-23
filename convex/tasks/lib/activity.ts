import type { MutationCtx } from "../../_generated/server";
import type { Id } from "../../_generated/dataModel";

export async function recordTaskActivity(
  ctx: MutationCtx,
  args: {
    weddingId: Id<"weddings">;
    taskId: Id<"tasks">;
    actorId: Id<"users">;
    kind:
      | "created"
      | "updated"
      | "assigned"
      | "status_changed"
      | "completed"
      | "deleted";
    field?: string;
    previousValue?: string;
    nextValue?: string;
  },
) {
  await ctx.db.insert("taskActivity", {
    weddingId: args.weddingId,
    taskId: args.taskId,
    actorId: args.actorId,
    kind: args.kind,
    ...(args.field !== undefined ? { field: args.field } : {}),
    ...(args.previousValue !== undefined
      ? { previousValue: args.previousValue }
      : {}),
    ...(args.nextValue !== undefined ? { nextValue: args.nextValue } : {}),
  });
}
