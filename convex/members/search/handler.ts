import { v } from "convex/values";
import {
  paginationOptsValidator,
  paginationResultValidator,
} from "convex/server";

import { AppErrorCode, throwAppError } from "@pompeii/errors/convex";
import type { Doc, Id } from "../../_generated/dataModel";
import { authenticatedQuery } from "../../lib/customFunctions/authenticatedQuery";
import { memberFor } from "../../weddings/lib/members";
import { memberRoleValidator } from "../../weddings/lib/roles";

export const memberSearchHitValidator = v.object({
  userId: v.id("users"),
  displayName: v.string(),
  role: memberRoleValidator,
  isSelf: v.boolean(),
});

export function toMemberHit(
  member: Doc<"weddingMembers">,
  callerId: Id<"users">,
) {
  return {
    userId: member.userId,
    displayName: member.displayName ?? "",
    role: member.role,
    isSelf: member.userId === callerId,
  };
}

export const search = authenticatedQuery({
  args: {
    weddingId: v.id("weddings"),
    search: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  returns: paginationResultValidator(memberSearchHitValidator),
  handler: async (ctx, args) => {
    const workspace = await ctx.db.get(args.weddingId);
    if (workspace === null) {
      throwAppError(AppErrorCode.weddings.enter.NOT_FOUND);
    }
    const caller = await memberFor(ctx, ctx.user._id, workspace._id);
    if (caller === null) {
      throwAppError(AppErrorCode.weddings.enter.NOT_FOUND);
    }

    const query = args.search.trim();
    const result =
      query.length === 0
        ? await ctx.db
            .query("weddingMembers")
            .withIndex("by_weddingId", (q) => q.eq("weddingId", workspace._id))
            .paginate(args.paginationOpts)
        : await ctx.db
            .query("weddingMembers")
            .withSearchIndex("search_displayName", (q) =>
              q.search("displayName", query).eq("weddingId", workspace._id),
            )
            .paginate(args.paginationOpts);

    const callerId = ctx.user._id;
    const hadCaller = result.page.some((member) => member.userId === callerId);
    const hits = result.page
      .filter((member) => member.userId !== callerId)
      .map((member) => toMemberHit(member, callerId));
    const pinCaller =
      args.paginationOpts.cursor === null && (query.length === 0 || hadCaller);

    return {
      ...result,
      page: pinCaller ? [toMemberHit(caller, callerId), ...hits] : hits,
    };
  },
});
