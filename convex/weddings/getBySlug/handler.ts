import { v } from "convex/values";

import { authenticatedQuery } from "../../lib/customFunctions/authenticatedQuery";
import { memberFor } from "../lib/members";
import { workspaceSessionFor } from "../lib/workspaceSession";

export const getBySlug = authenticatedQuery({
  args: { slug: v.string() },
  returns: v.union(
    v.null(),
    v.object({
      status: v.literal("active"),
      weddingId: v.id("weddings"),
      workspaceSessionId: v.id("workspaceSessions"),
      name: v.string(),
      coupleA: v.string(),
      coupleB: v.string(),
      date: v.optional(v.string()),
    }),
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

    const workspaceSession = await workspaceSessionFor(ctx, ctx.sessionId);
    if (
      workspaceSession === null ||
      workspaceSession.weddingId !== wedding._id
    ) {
      return { status: "inactive" as const };
    }

    return {
      status: "active" as const,
      weddingId: wedding._id,
      workspaceSessionId: workspaceSession._id,
      name: wedding.name,
      coupleA: wedding.couple[0]?.name ?? "",
      coupleB: wedding.couple[1]?.name ?? "",
      ...(wedding.date !== undefined ? { date: wedding.date } : {}),
    };
  },
});
