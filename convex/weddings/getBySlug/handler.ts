import { v } from "convex/values";

import { authenticatedQuery } from "../../lib/customFunctions/authenticatedQuery";
import { memberFor } from "../lib/members";
import { sessionPointsAtWedding } from "../lib/workspaceSession";

export const getBySlug = authenticatedQuery({
  args: { slug: v.string() },
  returns: v.union(
    v.null(),
    v.object({ status: v.literal("active"), name: v.string() }),
    v.object({ status: v.literal("inactive") }),
  ),
  handler: async (ctx, args) => {
    const wedding = await ctx.db
      .query("weddings")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (wedding === null) {
      return null;
    }

    const member = await memberFor(ctx, ctx.user._id, wedding._id);
    if (member === null) {
      return null;
    }

    const isActive = await sessionPointsAtWedding(
      ctx,
      ctx.sessionId,
      wedding._id,
    );
    if (!isActive) {
      return { status: "inactive" as const };
    }

    return { status: "active" as const, name: wedding.name };
  },
});
