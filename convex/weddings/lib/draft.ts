import type { GenericDatabaseReader } from "convex/server";
import { v } from "convex/values";

import type { DataModel, Doc, Id } from "../../_generated/dataModel";

export async function draftsForUser(
  ctx: { db: GenericDatabaseReader<DataModel> },
  userId: Id<"users">,
) {
  return await ctx.db
    .query("draftWeddings")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .take(2);
}

export const draftValidator = v.object({
  step: v.number(),
  name: v.optional(v.string()),
  slug: v.optional(v.string()),
  coupleA: v.optional(v.string()),
  coupleB: v.optional(v.string()),
  date: v.optional(v.string()),
  city: v.optional(v.string()),
  country: v.optional(v.string()),
  lat: v.optional(v.number()),
  lng: v.optional(v.number()),
  placeId: v.optional(v.string()),
  inviteEmail: v.optional(v.string()),
});

export function toDraft(doc: Doc<"draftWeddings">) {
  return {
    step: doc.step,
    ...(doc.name !== undefined ? { name: doc.name } : {}),
    ...(doc.slug !== undefined ? { slug: doc.slug } : {}),
    ...(doc.coupleA !== undefined ? { coupleA: doc.coupleA } : {}),
    ...(doc.coupleB !== undefined ? { coupleB: doc.coupleB } : {}),
    ...(doc.date !== undefined ? { date: doc.date } : {}),
    ...(doc.city !== undefined ? { city: doc.city } : {}),
    ...(doc.country !== undefined ? { country: doc.country } : {}),
    ...(doc.lat !== undefined ? { lat: doc.lat } : {}),
    ...(doc.lng !== undefined ? { lng: doc.lng } : {}),
    ...(doc.placeId !== undefined ? { placeId: doc.placeId } : {}),
    ...(doc.inviteEmail !== undefined ? { inviteEmail: doc.inviteEmail } : {}),
  };
}
