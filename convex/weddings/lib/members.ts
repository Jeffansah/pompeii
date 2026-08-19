import type { GenericDatabaseReader, GenericDatabaseWriter } from "convex/server";

import type { DataModel, Doc, Id } from "../../_generated/dataModel";

export async function memberFor(
  ctx: { db: GenericDatabaseReader<DataModel> },
  userId: Id<"users">,
  weddingId: Id<"weddings">,
) {
  return await ctx.db
    .query("weddingMembers")
    .withIndex("by_userId_and_weddingId", (q) =>
      q.eq("userId", userId).eq("weddingId", weddingId),
    )
    .unique();
}

export async function addCoupleMember(
  ctx: { db: GenericDatabaseWriter<DataModel> },
  userId: Id<"users">,
  weddingId: Id<"weddings">,
) {
  const existing = await memberFor(ctx, userId, weddingId);
  if (existing !== null) {
    return;
  }
  await ctx.db.insert("weddingMembers", {
    userId,
    weddingId,
    role: "couple",
  });
}

export async function weddingsForUser(
  ctx: { db: GenericDatabaseReader<DataModel> },
  userId: Id<"users">,
) {
  const rows = await ctx.db
    .query("weddingMembers")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .collect();

  const weddings: Array<{ name: string; slug: string }> = [];
  for (const row of rows) {
    const wedding: Doc<"weddings"> | null = await ctx.db.get(row.weddingId);
    if (wedding === null) {
      continue;
    }
    weddings.push({ name: wedding.name, slug: wedding.slug });
  }
  return weddings;
}
