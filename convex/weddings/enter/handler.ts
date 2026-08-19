import { AppErrorCode, throwAppError } from "@pompeii/errors/convex";
import { v } from "convex/values";

import { authenticatedMutation } from "../../lib/customFunctions/authenticatedMutation";
import { memberFor } from "../lib/members";
import { setWorkspaceSession } from "../lib/workspaceSession";

export const enter = authenticatedMutation({
  args: { slug: v.string() },
  returns: v.object({ slug: v.string() }),
  handler: async (ctx, args) => {
    const wedding = await ctx.db
      .query("weddings")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (wedding === null) {
      throwAppError(AppErrorCode.weddings.enter.NOT_FOUND);
    }

    const member = await memberFor(ctx, ctx.user._id, wedding._id);
    if (member === null) {
      throwAppError(AppErrorCode.weddings.enter.NOT_FOUND);
    }

    await setWorkspaceSession(ctx, ctx.sessionId, wedding._id);
    return { slug: wedding.slug };
  },
});
