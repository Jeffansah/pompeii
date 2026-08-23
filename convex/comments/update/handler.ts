import { v } from "convex/values";

import { AppErrorCode, throwAppError } from "@pompeii/errors/convex";
import type { Id } from "../../_generated/dataModel";
import { workspaceAuthorizedMutation } from "../../lib/customFunctions/workspaceAuthorizedMutation";
import { rateLimiter } from "../../lib/auth/rateLimit";
import { assertCommentableSubject } from "../lib/subjects";
import { toLiveCommentView } from "../lib/displayNames";
import { commentViewValidator, validateCommentBody } from "../lib/validators";

export const update = workspaceAuthorizedMutation({
  args: { commentId: v.id("comments"), body: v.string() },
  returns: commentViewValidator,
  handler: async (ctx, rawArgs) => {
    const { commentId, body: rawBody } = rawArgs as {
      commentId: Id<"comments">;
      body: string;
    };
    const comment = await ctx.db.get(commentId);
    if (comment === null || comment.weddingId !== ctx.workspace._id) {
      throwAppError(AppErrorCode.comments.NOT_FOUND);
    }
    if (comment.authorId !== ctx.user._id) {
      throwAppError(AppErrorCode.comments.NOT_AUTHORIZED);
    }
    if (comment.deletedAt !== null) {
      throwAppError(AppErrorCode.comments.NOT_FOUND);
    }
    const thread = await ctx.db.get(comment.threadId);
    if (thread === null) {
      throwAppError(AppErrorCode.comments.NOT_FOUND);
    }
    await assertCommentableSubject(ctx, ctx.workspace._id, thread.subject);
    const limited = await rateLimiter.limit(ctx, "commentEdit", {
      key: `${ctx.workspace._id}:${ctx.user._id}`,
    });
    if (!limited.ok) {
      throwAppError(AppErrorCode.comments.RATE_LIMITED);
    }
    const body = validateCommentBody(rawBody);
    await ctx.db.patch(commentId, { body, editedAt: Date.now() });
    const updated = await ctx.db.get(commentId);
    if (updated === null) {
      throwAppError(AppErrorCode.comments.NOT_FOUND);
    }
    const root =
      updated.kind === "reply" ? await ctx.db.get(updated.rootId) : updated;
    return toLiveCommentView(
      ctx,
      updated,
      ctx.user._id,
      root?.kind === "root" && root.deletedAt === null,
    );
  },
});
