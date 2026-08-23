import type {
  GenericDatabaseReader,
  GenericDatabaseWriter,
} from "convex/server";

import type { DataModel, Doc, Id } from "../../_generated/dataModel";
import type { MemberRole } from "./roles";

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

export async function addMember(
  ctx: { db: GenericDatabaseWriter<DataModel> },
  args: {
    userId: Id<"users">;
    weddingId: Id<"weddings">;
    displayName: string;
    role: MemberRole;
  },
) {
  const existing = await memberFor(ctx, args.userId, args.weddingId);
  if (existing !== null) {
    if (
      existing.displayName !== args.displayName ||
      existing.role !== args.role
    ) {
      await ctx.db.patch(existing._id, {
        displayName: args.displayName,
        role: args.role,
      });
    }
    return existing._id;
  }

  return await ctx.db.insert("weddingMembers", {
    userId: args.userId,
    weddingId: args.weddingId,
    displayName: args.displayName,
    role: args.role,
  });
}

export async function addCoupleMember(
  ctx: { db: GenericDatabaseWriter<DataModel> },
  userId: Id<"users">,
  weddingId: Id<"weddings">,
  displayName: string,
) {
  await addMember(ctx, {
    userId,
    weddingId,
    displayName,
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

  const weddings = await Promise.all(
    rows.map(async (row) => {
      const wedding: Doc<"weddings"> | null = await ctx.db.get(row.weddingId);
      return wedding === null
        ? null
        : { name: wedding.name, slug: wedding.slug };
    }),
  );
  return weddings.filter(
    (wedding): wedding is { name: string; slug: string } => wedding !== null,
  );
}
