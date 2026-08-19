import { v } from "convex/values";

import { internalMutation } from "../../_generated/server";

export const createFromAuth = internalMutation({
  args: { userId: v.string() },
  returns: v.null(),
  handler: async (ctx, { userId }) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (existing) {
      return null;
    }
    await ctx.db.insert("users", { userId });
    return null;
  },
});
