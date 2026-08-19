import { v } from "convex/values";

import { internalQuery } from "../../_generated/server";

export const getByAuthUserId = internalQuery({
  args: { userId: v.string() },
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("users"),
      _creationTime: v.number(),
      userId: v.string(),
    }),
  ),
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
  },
});
