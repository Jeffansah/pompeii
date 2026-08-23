import { v } from "convex/values";

import { AppErrorCode, throwAppError } from "@pompeii/errors/convex";
import type { Id } from "../../_generated/dataModel";
import { workspaceAuthorizedMutation } from "../../lib/customFunctions/workspaceAuthorizedMutation";
import { rateLimiter } from "../../lib/auth/rateLimit";
import { decrementCounts } from "../lib/commentDb";
import { assertCommentableSubject } from "../lib/subjects";
import { toLiveCommentView } from "../lib/displayNames";
import { commentViewValidator } from "../lib/validators";

export const remove = workspaceAuthorizedMutation({
  args: { commentId: v.id("comments") },
  returns: v.union(commentViewValidator, v.null()),
  handler: async (ctx, rawArgs) => {
    const { commentId } = rawArgs as { commentId: Id<"comments"> };
    const comment = await ctx.db.get(commentId);
    if (comment === null || comment.weddingId !== ctx.workspace._id) {
      throwAppError(AppErrorCode.comments.NOT_FOUND);
    }
    if (comment.authorId !== ctx.user._id) {
      throwAppError(AppErrorCode.comments.NOT_AUTHORIZED);
    }
    const thread = await ctx.db.get(comment.threadId);
    if (thread === null) {
      throwAppError(AppErrorCode.comments.NOT_FOUND);
    }
    await assertCommentableSubject(ctx, ctx.workspace._id, thread.subject);
    if (comment.deletedAt === null) {
      const limited = await rateLimiter.limit(ctx, "commentRemove", {
        key: `${ctx.workspace._id}:${ctx.user._id}`,
      });
      if (!limited.ok) {
        throwAppError(AppErrorCode.comments.RATE_LIMITED);
      }
      await ctx.db.patch(commentId, {
        body: "",
        deletedAt: Date.now(),
        isVisible: comment.kind === "root" && comment.replyCount > 0,
      });
      await decrementCounts(ctx, comment);
    }
    const removed = await ctx.db.get(commentId);
    if (removed === null || !removed.isVisible) {
      return null;
    }
    return toLiveCommentView(ctx, removed, ctx.user._id);
  },
});
