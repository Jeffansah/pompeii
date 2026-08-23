import { v } from "convex/values";

import { AppErrorCode, throwAppError } from "@pompeii/errors/convex";
import { authenticatedQuery } from "../../lib/customFunctions/authenticatedQuery";
import { memberFor } from "../../weddings/lib/members";
import { memberSearchHitValidator, toMemberHit } from "../search/handler";

export const get = authenticatedQuery({
  args: {
    weddingId: v.id("weddings"),
    userId: v.id("users"),
  },
  returns: v.union(v.null(), memberSearchHitValidator),
  handler: async (ctx, args) => {
    const workspace = await ctx.db.get(args.weddingId);
    if (workspace === null) {
      throwAppError(AppErrorCode.weddings.enter.NOT_FOUND);
    }
    const caller = await memberFor(ctx, ctx.user._id, workspace._id);
    if (caller === null) {
      throwAppError(AppErrorCode.weddings.enter.NOT_FOUND);
    }

    const member = await memberFor(ctx, args.userId, workspace._id);
    if (member === null) {
      return null;
    }
    return toMemberHit(member, ctx.user._id);
  },
});
