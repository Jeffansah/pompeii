import type { GenericDatabaseReader, GenericDatabaseWriter } from "convex/server";

import type { DataModel, Id } from "../../_generated/dataModel";

export async function workspaceSessionFor(
  ctx: { db: GenericDatabaseReader<DataModel> },
  sessionId: string,
) {
  return await ctx.db
    .query("workspaceSessions")
    .withIndex("by_sessionId", (q) => q.eq("sessionId", sessionId))
    .unique();
}

export async function sessionPointsAtWedding(
  ctx: { db: GenericDatabaseReader<DataModel> },
  sessionId: string,
  weddingId: Id<"weddings">,
) {
  const pointer = await workspaceSessionFor(ctx, sessionId);
  return pointer !== null && pointer.weddingId === weddingId;
}

export async function setWorkspaceSession(
  ctx: { db: GenericDatabaseWriter<DataModel> },
  sessionId: string,
  weddingId: Id<"weddings"> | null,
) {
  const existing = await workspaceSessionFor(ctx, sessionId);
  if (existing !== null) {
    await ctx.db.patch(existing._id, { weddingId });
    return;
  }
  await ctx.db.insert("workspaceSessions", { sessionId, weddingId });
}

export async function deleteWorkspaceSession(
  ctx: { db: GenericDatabaseWriter<DataModel> },
  sessionId: string,
) {
  const existing = await workspaceSessionFor(ctx, sessionId);
  if (existing === null) {
    return;
  }
  await ctx.db.delete(existing._id);
}
